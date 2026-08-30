package com.spoton.merchant.data

import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import kotlin.math.exp
import kotlin.math.floor
import kotlin.math.pow
import kotlin.math.roundToInt

/**
 * Deterministic mock data, generated from the same seeded PRNG and the same
 * fixed reference date as the web dashboard's `lib/data.ts`. Both platforms
 * therefore tell an identical story, and every render is reproducible.
 */
object MockData {

    // ------------------------------------------------------------- seeded rng
    private class Mulberry32(seed: Int) {
        private var s = seed
        fun next(): Double {
            s += 0x6D2B79F5
            var t = s
            t = (t xor (t ushr 15)) * (t or 1)
            t = t xor (t + (t xor (t ushr 7)) * (t or 61))
            return ((t xor (t ushr 14)).toLong() and 0xFFFFFFFFL).toDouble() / 4294967296.0
        }
    }

    private val rng = Mulberry32(20260830)
    private fun rand(min: Double, max: Double) = min + rng.next() * (max - min)
    private fun randInt(min: Int, max: Int) = floor(rand(min.toDouble(), (max + 1).toDouble())).toInt().coerceIn(min, max)
    private fun <T> pick(list: List<T>): T = list[randInt(0, list.size - 1)]

    /** Fixed "today" so every screen agrees on the date. */
    val today: Date = SimpleDateFormat("yyyy-MM-dd", Locale.US).parse("2026-08-30")!!

    private fun dayOffset(n: Int): Date = Calendar.getInstance().apply {
        time = today
        add(Calendar.DAY_OF_YEAR, n)
    }.time

    private fun fmt(date: Date, pattern: String) = SimpleDateFormat(pattern, Locale.US).format(date)

    val todayLong: String get() = fmt(today, "EEEE, MMMM d")

    // ------------------------------------------------------------- locations
    val locations = listOf(
        Location("loc-1", "Harborview Kitchen — Downtown", "418 Market St", "San Francisco, CA", "PT", true),
        Location("loc-2", "Harborview Kitchen — Marina", "2201 Chestnut St", "San Francisco, CA", "PT", true),
        Location("loc-3", "Harborview Taproom", "1140 Folsom St", "San Francisco, CA", "PT", false),
    )

    // ------------------------------------------------------------ sales core
    private val dowWeight = listOf(0.95, 0.62, 0.68, 0.78, 0.94, 1.32, 1.42)

    val days90: List<DayPoint> = buildList {
        for (i in 89 downTo 0) {
            val date = dayOffset(-i)
            val cal = Calendar.getInstance().apply { time = date }
            val dow = cal.get(Calendar.DAY_OF_WEEK) - 1
            val w = dowWeight[dow]
            val trend = 1 + (90 - i) / (90.0 * 9)
            val net = (8200 * w * trend * rand(0.93, 1.07)).roundToInt()
            val orders = ((net / rand(52.0, 66.0)) * rand(0.96, 1.04)).roundToInt()
            add(
                DayPoint(
                    label = fmt(date, "MMM d"),
                    weekday = fmt(date, "EEE"),
                    dayOfWeek = dow,
                    net = net,
                    gross = (net * rand(1.09, 1.13)).roundToInt(),
                    orders = orders,
                    guests = (orders * rand(1.7, 2.4)).roundToInt(),
                    labor = (net * rand(0.26, 0.325)).roundToInt(),
                    tips = (net * rand(0.15, 0.21)).roundToInt(),
                    discounts = (net * rand(0.01, 0.035)).roundToInt(),
                    refunds = (net * rand(0.002, 0.011)).roundToInt(),
                    comps = (net * rand(0.004, 0.014)).roundToInt(),
                )
            )
        }
    }

    // ------------------------------------------------------------ hourly
    val hourly: List<HourPoint> = (0 until 16).map { i ->
        val hour = i + 8
        val lunch = exp(-(hour - 12.5).pow(2) / 3.2)
        val dinner = exp(-(hour - 19.0).pow(2) / 5.0) * 1.55
        val net = ((lunch + dinner) * 1180 * rand(0.85, 1.15) + rand(20.0, 90.0)).roundToInt()
        HourPoint(
            hour = hour,
            label = when {
                hour == 12 -> "12p"
                hour < 12 -> "${hour}a"
                else -> "${hour - 12}p"
            },
            net = net,
            orders = (net / rand(50.0, 64.0)).roundToInt().coerceAtLeast(1),
        )
    }

    // ------------------------------------------------------------- channels
    private val last30 get() = days90.takeLast(30)

    val channels: List<Channel> = run {
        val share = listOf(0.52, 0.21, 0.14, 0.13)
        val names = listOf("Dine-in", "Takeout", "Delivery", "Online ordering")
        val totalNet = last30.sumOf { it.net }
        val totalOrders = last30.sumOf { it.orders }
        names.mapIndexed { i, n ->
            Channel(n, (totalNet * share[i]).roundToInt(), (totalOrders * share[i]).roundToInt(), i)
        }
    }

    val paymentTypes: List<PaymentType> = run {
        val names = listOf("Visa", "Mastercard", "Amex", "Discover", "Cash", "Gift card")
        val share = listOf(0.41, 0.24, 0.12, 0.04, 0.13, 0.06)
        val totalNet = last30.sumOf { it.net }
        val totalOrders = last30.sumOf { it.orders }
        names.mapIndexed { i, n ->
            PaymentType(n, (totalNet * share[i]).roundToInt(), (totalOrders * share[i]).roundToInt())
        }
    }

    // ----------------------------------------------------------------- menu
    private val modPool = listOf(
        "Temperature", "Add avocado", "Sub side salad", "No onion", "Extra sauce",
        "Gluten-free bun", "Add bacon", "Dressing on side", "Make it a double", "Spice level",
    )

    private val menuSeed = listOf(
        listOf("Harbor Burger", "Entrées", "21", "6.4", "Grill"),
        listOf("Crispy Brussels", "Starters", "13", "2.9", "Fry"),
        listOf("Dungeness Crab Roll", "Entrées", "29", "11.2", "Cold"),
        listOf("Truffle Fries", "Sides", "11", "2.2", "Fry"),
        listOf("Cast-Iron Cornbread", "Starters", "9", "1.5", "Bake"),
        listOf("Grilled Branzino", "Entrées", "34", "13.1", "Grill"),
        listOf("Little Gem Caesar", "Salads", "15", "3.4", "Cold"),
        listOf("Short Rib Pappardelle", "Entrées", "31", "10.8", "Sauté"),
        listOf("Fried Chicken Sandwich", "Entrées", "19", "5.2", "Fry"),
        listOf("Clam Chowder", "Starters", "12", "3.1", "Sauté"),
        listOf("Ahi Poke Bowl", "Entrées", "24", "8.7", "Cold"),
        listOf("Margherita Flatbread", "Starters", "16", "3.8", "Bake"),
        listOf("Seasonal Vegetable Plate", "Entrées", "22", "5.6", "Sauté"),
        listOf("Buttermilk Biscuits", "Sides", "8", "1.2", "Bake"),
        listOf("Chocolate Budino", "Desserts", "11", "2.4", "Pastry"),
        listOf("Meyer Lemon Tart", "Desserts", "12", "2.8", "Pastry"),
        listOf("Old Fashioned", "Cocktails", "16", "3.2", "Bar"),
        listOf("Harbor Spritz", "Cocktails", "15", "2.9", "Bar"),
        listOf("Espresso Martini", "Cocktails", "17", "3.6", "Bar"),
        listOf("House Red — Glass", "Wine", "14", "3.5", "Bar"),
        listOf("House White — Glass", "Wine", "14", "3.4", "Bar"),
        listOf("Local IPA — Draft", "Beer", "9", "1.9", "Bar"),
        listOf("Pilsner — Draft", "Beer", "8", "1.7", "Bar"),
        listOf("Cold Brew", "Non-Alcoholic", "6", "0.9", "Bar"),
        listOf("House Lemonade", "Non-Alcoholic", "5", "0.6", "Bar"),
    )

    val menuItems: List<MenuItem> = menuSeed.mapIndexed { i, s ->
        val name = s[0]; val category = s[1]
        val price = s[2].toDouble(); val cost = s[3].toDouble(); val station = s[4]
        val sold = randInt(48, 610)
        MenuItem(
            id = "item-${i + 1}", name = name, category = category, price = price, cost = cost,
            sold = sold, net = (sold * price).roundToInt(),
            modifiers = (0 until randInt(0, 3)).map { pick(modPool) }.distinct(),
            available = rng.next() > 0.08, station = station,
            taxRate = if (category in listOf("Cocktails", "Wine", "Beer")) 9.75 else 8.625,
            description = "$name — house specialty, prepared to order at the ${station.lowercase()} station.",
        )
    }.sortedByDescending { it.net }

    val menuCategories: List<String> = menuItems.map { it.category }.distinct()

    // ------------------------------------------------------------ employees
    private val names = listOf(
        "Marisol Vega", "Devon Pierce", "Aisha Rahman", "Tomás Ortiz", "Grace Lindqvist",
        "Noah Bellamy", "Priya Nair", "Caleb Fontaine", "Ruth Adeyemi", "Jonah Weiss",
        "Lena Moreau", "Andre Baptiste", "Sofia Duarte", "Kenji Watanabe", "Halima Farah",
        "Owen Brennan", "Mira Castellanos", "Elias Thorne",
    )
    private val roles = listOf("Server", "Bartender", "Line Cook", "Host", "Busser", "Shift Lead", "Manager", "Expo")

    val employees: List<Employee> = names.mapIndexed { i, name ->
        val role = if (i == 0) "General Manager" else pick(roles)
        val hourly = when (role) {
            "General Manager" -> 38.0
            "Manager" -> 31.0
            else -> rand(17.5, 26.5)
        }
        val hoursWeek = rand(12.0, 41.0)
        val sales = if (role in listOf("Server", "Bartender", "Shift Lead")) rand(3200.0, 14800.0).roundToInt() else 0
        Employee(
            id = "emp-${i + 1}", name = name, role = role,
            jobCodes = (listOf(role) + if (rng.next() > 0.7) listOf(pick(roles)) else emptyList()).distinct(),
            email = name.lowercase().replace(Regex("[^a-z]+"), ".") + "@harborview.co",
            phone = "(415) 555-${randInt(1000, 9999)}",
            active = rng.next() > 0.12,
            hourly = (hourly * 100).roundToInt() / 100.0,
            hoursWeek = (hoursWeek * 10).roundToInt() / 10.0,
            overtime = if (hoursWeek > 38) ((hoursWeek - 38) * 10).roundToInt() / 10.0 else 0.0,
            sales = sales,
            tips = if (sales > 0) (sales * rand(0.16, 0.22)).roundToInt() else 0,
            checks = if (sales > 0) randInt(48, 210) else 0,
            pin = randInt(1000, 9999).toString(),
            hiredOn = fmt(dayOffset(-randInt(40, 1100)), "MMM d, yyyy"),
        )
    }

    // ------------------------------------------------------------- customers
    private val custNames = listOf(
        "Hannah Cole", "Peter Ilyich", "Yuki Tanaka", "Amara Okonkwo", "Ben Sorensen",
        "Clara Jimenez", "Dmitri Volkov", "Esther Whitfield", "Felix Nakamura", "Georgia Bell",
        "Hugo Marchetti", "Imani Clarke", "Jasper Reid", "Kira Lindholm", "Liam O'Donnell",
        "Maya Srinivasan", "Nate Kowalski", "Olive Fairbanks", "Paulo Rocha", "Quinn Alvarez",
        "Rosa Delgado", "Simon Achebe", "Tessa Bright", "Uma Kapoor",
    )

    val customers: List<Customer> = custNames.mapIndexed { i, name ->
        val visits = randInt(1, 44)
        val avgCheck = rand(28.0, 96.0).roundToInt()
        Customer(
            id = "cust-${i + 1}", name = name,
            email = name.lowercase().replace(Regex("[^a-z]+"), ".") + "@example.com",
            phone = "(415) 555-${randInt(1000, 9999)}",
            visits = visits, spend = visits * avgCheck, avgCheck = avgCheck,
            lastVisit = fmt(dayOffset(-randInt(0, 120)), "MMM d"),
            loyaltyPoints = visits * randInt(8, 30),
            tier = when {
                visits > 30 -> "VIP"
                visits > 12 -> "Regular"
                visits > 3 -> "Returning"
                else -> "New"
            },
            optIn = rng.next() > 0.25,
        )
    }.sortedByDescending { it.spend }

    // ------------------------------------------------------------- campaigns
    val campaigns: List<Campaign> = listOf(
        listOf("Labor Day Prix Fixe", "Email", "Scheduled", "All opted-in guests"),
        listOf("We miss you — 20% off", "Email", "Sent", "Lapsed 60+ days"),
        listOf("Taproom Trivia Tuesdays", "SMS", "Running", "Regulars & VIPs"),
        listOf("Birthday reward", "Email", "Running", "Birthday this month"),
        listOf("Brunch launch announcement", "Email", "Sent", "All opted-in guests"),
        listOf("Happy hour flash — today only", "SMS", "Sent", "Within 3 miles"),
        listOf("Fall menu preview", "Email", "Draft", "VIP tier"),
        listOf("Double points weekend", "SMS", "Sent", "Loyalty members"),
    ).mapIndexed { i, s ->
        val status = s[2]
        val sent = if (status == "Draft") 0 else randInt(420, 5200)
        val opened = (sent * rand(0.28, 0.62)).roundToInt()
        val clicked = (opened * rand(0.09, 0.31)).roundToInt()
        val redeemed = (clicked * rand(0.11, 0.38)).roundToInt()
        Campaign(
            id = "camp-${i + 1}", name = s[0], channel = s[1], status = status,
            sent = sent, opened = opened, clicked = clicked, redeemed = redeemed,
            revenue = (redeemed * rand(38.0, 88.0)).roundToInt(),
            date = fmt(dayOffset(if (status == "Scheduled") randInt(2, 14) else -randInt(1, 60)), "MMM d"),
            audience = s[3],
        )
    }

    // --------------------------------------------------------------- reviews
    private val reviewBodies = listOf(
        "The short rib pappardelle was outstanding and our server Marisol was so attentive. Will be back.",
        "Great food but we waited 25 minutes past our reservation time. Front of house felt overwhelmed.",
        "Best crab roll in the city, full stop. The patio is a hidden gem on a warm evening.",
        "Cocktails are creative and well balanced. The espresso martini is dangerous.",
        "Food was good, prices have crept up noticeably since last year.",
        "Ordered takeout through their site — ready right on time, packaged perfectly, still hot.",
        "Lovely brunch. The biscuits alone are worth the trip.",
        "Service was slow and our order came out wrong twice. Manager comped dessert which was appreciated.",
        "Consistently excellent. We've been coming for three years and it never misses.",
        "The vegetarian plate was thoughtful, not an afterthought. Rare and appreciated.",
        "Loud on a Saturday night — hard to hold a conversation, but the food made up for it.",
        "Quick lunch, friendly staff, in and out in 40 minutes. Exactly what I needed.",
    )

    val reviews: List<Review> = reviewBodies.mapIndexed { i, body ->
        Review(
            id = "rev-${i + 1}", author = pick(custNames),
            source = pick(listOf("Google", "Yelp", "Facebook", "SpotOn")),
            rating = if (body.contains("slow") || body.contains("waited") || body.contains("crept")) randInt(2, 3) else randInt(4, 5),
            body = body, date = fmt(dayOffset(-randInt(0, 45)), "MMM d"),
            replied = rng.next() > 0.55,
        )
    }

    val reviewAverage = (reviews.sumOf { it.rating }.toDouble() / reviews.size * 10).roundToInt() / 10.0
    val reviewTotal = 1487
    val reviewDistribution: List<Pair<Int, Int>> = listOf(5, 4, 3, 2, 1).map { stars ->
        stars to when {
            stars >= 4 -> randInt(380, 720)
            stars == 3 -> randInt(90, 160)
            else -> randInt(20, 70)
        }
    }

    // ---------------------------------------------------------------- orders
    val orders: List<Order> = (0 until 42).map { i ->
        val subtotal = (rand(22.0, 340.0) * 100).roundToInt() / 100.0
        val tax = (subtotal * 0.08625 * 100).roundToInt() / 100.0
        val tip = (subtotal * rand(0.0, 0.26) * 100).roundToInt() / 100.0
        val channel = pick(listOf("Dine-in", "Dine-in", "Dine-in", "Takeout", "Delivery", "Online"))
        val status = when {
            rng.next() > 0.93 -> if (rng.next() > 0.5) "Refunded" else "Voided"
            rng.next() > 0.82 -> "Open"
            else -> "Paid"
        }
        val h = randInt(11, 22)
        val m = randInt(0, 59)
        Order(
            id = "ord-${i + 1}", ticket = "#${1200 + i}", channel = channel,
            table = if (channel == "Dine-in") "T${randInt(1, 32)}" else "—",
            server = pick(employees.filter { it.sales > 0 }).name,
            items = randInt(1, 11), subtotal = subtotal, tax = tax, tip = tip,
            total = ((subtotal + tax + tip) * 100).roundToInt() / 100.0,
            status = status,
            time = String.format(Locale.US, "%d:%02d %s", if (h > 12) h - 12 else h, m, if (h >= 12) "PM" else "AM"),
            payment = pick(listOf("Visa •4821", "Mastercard •9013", "Amex •3007", "Cash", "Gift card •7742")),
        )
    }.sortedByDescending { it.ticket }

    // ------------------------------------------------------------ statements
    val deposits: List<Deposit> = (0 until 18).map { i ->
        val d = days90[days90.size - 1 - i]
        val gross = d.gross
        val fees = (gross * rand(0.021, 0.029)).roundToInt()
        Deposit(
            id = "dep-${i + 1}",
            date = fmt(dayOffset(-i), "MMM d, yyyy"),
            gross = gross, fees = fees, refunds = d.refunds, net = gross - fees - d.refunds,
            status = when (i) { 0 -> "Pending"; 1 -> "In transit"; else -> "Paid" },
            account = "Wells Fargo •••4417", batches = randInt(1, 4),
        )
    }

    // ------------------------------------------------------------ gift cards
    val giftCardsOutstanding = 42815
    val giftCardsIssuedMonth = 9340
    val giftCardsRedeemedMonth = 7120
    val giftCardsActive = 618
    val giftCardsBreakage = 3.2

    val giftCards: List<GiftCard> = (0 until 10).map { i ->
        GiftCard(
            id = "gc-${i + 1}", code = "GC-${randInt(100000, 999999)}",
            balance = rand(0.0, 250.0).roundToInt(),
            issued = fmt(dayOffset(-randInt(1, 300)), "MMM d, yyyy"),
            lastUsed = fmt(dayOffset(-randInt(0, 60)), "MMM d"),
            status = if (rng.next() > 0.2) "Active" else "Depleted",
        )
    }

    // ---------------------------------------------------------- reservations
    val reservations: List<Reservation> = (0 until 16).map { i ->
        val h = 17 + i / 2
        val m = if (i % 2 == 0) "00" else "30"
        Reservation(
            id = "res-${i + 1}", name = pick(custNames), party = randInt(1, 8),
            time = "${if (h > 12) h - 12 else h}:$m PM", table = "T${randInt(1, 32)}",
            status = pick(listOf("Confirmed", "Confirmed", "Seated", "Waitlist", "Completed", "No-show")),
            phone = "(415) 555-${randInt(1000, 9999)}",
            notes = pick(listOf("", "", "Anniversary", "Window seat requested", "Allergy: shellfish", "Regular — comp bread")),
        )
    }

    val waitlist: List<WaitlistEntry> = (0 until 5).map { i ->
        WaitlistEntry(
            id = "wait-${i + 1}", name = pick(custNames), party = randInt(2, 6),
            quoted = randInt(15, 60), waiting = randInt(3, 48),
            phone = "(415) 555-${randInt(1000, 9999)}",
        )
    }

    // --------------------------------------------------------------- devices
    val devices = listOf(
        Device("dev-1", "Terminal 1 — Bar", "SpotOn Terminal", "ST-88214", "Online", "12.4.1", "Just now"),
        Device("dev-2", "Terminal 2 — Server station", "SpotOn Terminal", "ST-88215", "Online", "12.4.1", "Just now"),
        Device("dev-3", "Handheld A", "SpotOn Handheld", "SH-40912", "Online", "12.4.1", "2 min ago"),
        Device("dev-4", "Handheld B", "SpotOn Handheld", "SH-40913", "Offline", "12.3.8", "4 hours ago"),
        Device("dev-5", "Kitchen Display — Hot line", "KDS", "KD-11204", "Online", "8.2.0", "Just now"),
        Device("dev-6", "Kitchen Display — Cold line", "KDS", "KD-11205", "Online", "8.2.0", "Just now"),
        Device("dev-7", "Receipt printer — Expo", "Printer", "PR-77341", "Needs paper", "—", "Just now"),
        Device("dev-8", "Cash drawer 1", "Peripheral", "CD-20118", "Online", "—", "Just now"),
    )

    // --------------------------------------------------------------- reports
    val reportCatalog = listOf(
        ReportGroup("Sales", listOf("Daily recap", "Sales summary", "Sales by day part", "Sales by revenue center", "Sales by order type", "Hourly sales", "Voids & comps", "Discounts", "Tax summary")),
        ReportGroup("Menu", listOf("Product mix (PMIX)", "Menu mix by category", "Menu engineering", "Modifier sales", "Item velocity", "Cost of goods")),
        ReportGroup("Labor", listOf("Labor summary", "Labor vs. sales", "Time punches", "Overtime", "Job code breakdown", "Sales per labor hour")),
        ReportGroup("Payments", listOf("Payment summary", "Batches", "Settlements", "Tips & gratuity", "Refunds & chargebacks", "Cash reconciliation")),
        ReportGroup("Employees", listOf("Employee performance", "Server sales", "Checkout report", "Tip pooling", "Payroll export")),
        ReportGroup("Guests", listOf("Customer list", "Loyalty activity", "Gift card liability", "Campaign performance", "Review summary")),
    )
    val reportCount = reportCatalog.sumOf { it.items.size }
    val pinnedReports = listOf("Daily recap", "Labor vs. sales", "Product mix (PMIX)", "Payment summary")

    // --------------------------------------------------------------- loyalty
    val loyaltyMembers = 3184
    val loyaltyNewThisMonth = 214
    val loyaltyActiveRate = 38.4
    val loyaltyPointsIssued = 184920
    val loyaltyPointsRedeemed = 96410
    val loyaltyRewardsRedeemed = 612
    val loyaltyVisitLift = 2.4
    val loyaltyProgramName = "Harborview Rewards"
    val loyaltyEarnRule = "1 point per \$1 spent"

    val loyaltyTiers = listOf(
        LoyaltyTier("Member", 0, "Birthday dessert"),
        LoyaltyTier("Regular", 500, "Free appetizer + priority waitlist"),
        LoyaltyTier("VIP", 2000, "Chef's table access + 10% off"),
    )

    val loyaltyRewards = listOf(
        LoyaltyReward("\$10 off your next visit", 200, 284, true),
        LoyaltyReward("Free dessert", 120, 196, true),
        LoyaltyReward("Free appetizer", 150, 108, true),
        LoyaltyReward("\$25 off parties of 4+", 500, 24, false),
    )

    // -------------------------------------------------------- online ordering
    val onlineUrl = "order.harborviewkitchen.com"
    val onlineOrdersWeek = 412
    val onlineRevenueWeek = 18940
    val onlineAvgTicket = 45.97
    val onlinePrepTime = 22
    val onlineConversion = 6.8

    val onlineSettings = listOf(
        Triple("Accepting orders", true, "Pause to temporarily stop new online orders"),
        Triple("Pickup", true, "Guests collect at the counter"),
        Triple("Delivery", true, "Dispatched through SpotOn Delivery"),
        Triple("Curbside", false, "Guests check in on arrival"),
        Triple("Scheduled orders", true, "Allow ordering up to 7 days ahead"),
        Triple("Tipping at checkout", true, "Show a tip prompt before payment"),
    )

    // --------------------------------------------------------- notifications
    val notifications = listOf(
        Notification("n1", "Deposit on the way", "\$9,412.88 is in transit to Wells Fargo •••4417.", "12m ago", true, "money"),
        Notification("n2", "Handheld B went offline", "Last seen 4 hours ago. Check the charging dock.", "4h ago", true, "alert"),
        Notification("n3", "Labor is tracking high", "Labor is 34.1% of sales today vs. your 28% target.", "5h ago", true, "alert"),
        Notification("n4", "New 2-star review on Yelp", "\"Service was slow and our order came out wrong twice…\"", "1d ago", false, "review"),
        Notification("n5", "Campaign sent", "\"Double points weekend\" reached 2,140 guests.", "2d ago", false, "info"),
    )

    // -------------------------------------------------------------- insights
    val insights = listOf(
        Insight("i1", "warning", "Labor ran 6.1 points over target on Saturday",
            "You scheduled 214 labor hours against \$12,880 in sales. Trimming two bussers from the 4–7pm block would have held you at target without touching service ratios.",
            "Open labor vs. sales", "employees"),
        Insight("i2", "good", "Short Rib Pappardelle is your strongest star",
            "It carries a 65% margin and sold 412 units this month — 38% above the category median. Featuring it in the next campaign is the highest-leverage move available.",
            "View menu engineering", "menus"),
        Insight("i3", "info", "Online ordering converts best at 5–7pm",
            "68% of online revenue lands in that window. Your current promo runs 2–4pm, when traffic is thinnest.",
            "Adjust online ordering", "online"),
    )

    // -------------------------------------------------------- dashboard users
    val dashboardUsers = listOf(
        DashboardUser("u1", employees[0].name, employees[0].email, "Owner / Admin", "Active now", "Active", 3),
        DashboardUser("u2", employees[6].name, employees[6].email, "Manager", "2 hours ago", "Active", 1),
        DashboardUser("u3", employees[11].name, employees[11].email, "Manager", "Yesterday", "Active", 2),
        DashboardUser("u4", "Priya Nair", "priya.nair@harborview.co", "Bookkeeper", "4 days ago", "Active", 3),
        DashboardUser("u5", "Owen Brennan", "owen.brennan@harborview.co", "Marketing", "Never", "Invited", 3),
    )

    val permissionGroups = listOf(
        "Reporting" to listOf("View sales and reports", "Export report data", "View labor cost"),
        "Operations" to listOf("Edit menus and pricing", "Manage employees", "Void and refund orders"),
        "Money" to listOf("View statements and deposits", "Change bank details"),
        "Marketing" to listOf("Create campaigns", "Manage loyalty program", "Reply to reviews"),
        "Admin" to listOf("Manage dashboard users", "Change business settings"),
    )

    val roleMatrix: Map<String, List<String>> = mapOf(
        "Owner / Admin" to permissionGroups.flatMap { it.second },
        "Manager" to listOf("View sales and reports", "Export report data", "View labor cost",
            "Edit menus and pricing", "Manage employees", "Void and refund orders", "Reply to reviews"),
        "Bookkeeper" to listOf("View sales and reports", "Export report data", "View statements and deposits"),
        "Marketing" to listOf("View sales and reports", "Create campaigns", "Manage loyalty program", "Reply to reviews"),
    )

    // ----------------------------------------------------------------- hours
    val businessHours = listOf(
        Triple("Monday", "11:00 AM", "10:00 PM"),
        Triple("Tuesday", "11:00 AM", "10:00 PM"),
        Triple("Wednesday", "11:00 AM", "10:00 PM"),
        Triple("Thursday", "11:00 AM", "11:00 PM"),
        Triple("Friday", "11:00 AM", "12:00 AM"),
        Triple("Saturday", "10:00 AM", "12:00 AM"),
        Triple("Sunday", "10:00 AM", "9:00 PM"),
    )
}
