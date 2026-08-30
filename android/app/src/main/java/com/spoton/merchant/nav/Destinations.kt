package com.spoton.merchant.nav

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ListAlt
import androidx.compose.material.icons.automirrored.outlined.VolumeUp
import androidx.compose.material.icons.outlined.*
import androidx.compose.ui.graphics.vector.ImageVector

/** Every destination in the app, with the metadata the shell needs to render it. */
enum class Dest(
    val route: String,
    val title: String,
    val icon: ImageVector,
    val blurb: String,
    val group: String,
) {
    Home("home", "Dashboard", Icons.Outlined.Home, "Today at a glance", "Overview"),
    Sales("sales", "Sales", Icons.Outlined.BarChart, "Revenue, day parts, channels", "Overview"),
    Reporting("reporting", "Reporting", Icons.Outlined.Description, "90+ built-in reports", "Overview"),

    Orders("orders", "Orders", Icons.Outlined.ReceiptLong, "Tickets, refunds, voids", "Operations"),
    Menus("menus", "Menus", Icons.Outlined.MenuBook, "Items, modifiers, pricing", "Operations"),
    Team("team", "Team & labor", Icons.Outlined.Groups, "Staff, shifts, tips", "Operations"),
    Reservations("reservations", "Reservations", Icons.Outlined.EventSeat, "Bookings and waitlist", "Operations"),

    Customers("customers", "Customers", Icons.Outlined.Person, "Guest profiles and spend", "Guests"),
    Loyalty("loyalty", "Loyalty", Icons.Outlined.Star, "Points, tiers, rewards", "Guests"),
    Campaigns("campaigns", "Campaigns", Icons.AutoMirrored.Outlined.VolumeUp, "Email and SMS marketing", "Guests"),
    Reviews("reviews", "Reviews", Icons.Outlined.StarBorder, "Ratings across platforms", "Guests"),

    Online("online", "Online ordering", Icons.Outlined.Language, "Your ordering site", "Channels"),
    GiftCards("giftcards", "Gift cards", Icons.Outlined.CardGiftcard, "Balances and liability", "Channels"),

    Statements("statements", "Statements", Icons.Outlined.AccountBalanceWallet, "Deposits, fees, batches", "Money"),

    Devices("devices", "Devices", Icons.Outlined.Devices, "Terminals, KDS, printers", "Setup"),
    Users("users", "Dashboard users", Icons.Outlined.ManageAccounts, "Access and permissions", "Setup"),
    Settings("settings", "Settings", Icons.Outlined.Settings, "Business configuration", "Setup");

    companion object {
        fun byRoute(route: String?) = entries.firstOrNull { it.route == route }
        val groups: List<Pair<String, List<Dest>>> =
            entries.groupBy { it.group }.toList().sortedBy { pair ->
                listOf("Overview", "Operations", "Guests", "Channels", "Money", "Setup").indexOf(pair.first)
            }
    }
}

/** Bottom bar destinations. Everything else lives behind More. */
val BottomTabs = listOf(Dest.Home, Dest.Sales, Dest.Orders, Dest.Menus)

object Routes {
    const val SPLASH = "splash"
    const val LOGIN = "login"
    const val MORE = "more"
    const val NOTIFICATIONS = "notifications"
    const val SEARCH = "search"
    const val ORDER_DETAIL = "order/{id}"
    const val EMPLOYEE_DETAIL = "employee/{id}"
    const val CUSTOMER_DETAIL = "customer/{id}"
    const val MENU_ITEM = "menuitem/{id}"
    const val CAMPAIGN_DETAIL = "campaign/{id}"
    const val DEPOSIT_DETAIL = "deposit/{id}"
    const val REPORT_DETAIL = "report/{name}"
    const val REVIEW_REPLY = "review/{id}/reply"
    const val CAMPAIGN_NEW = "campaign/new"
    const val RESERVATION_NEW = "reservation/new"
    const val SETTINGS_SECTION = "settings/{section}"
    const val PROFILE = "profile"

    fun orderDetail(id: String) = "order/$id"
    fun employeeDetail(id: String) = "employee/$id"
    fun customerDetail(id: String) = "customer/$id"
    fun menuItem(id: String) = "menuitem/$id"
    fun campaignDetail(id: String) = "campaign/$id"
    fun depositDetail(id: String) = "deposit/$id"
    fun reportDetail(name: String) = "report/${java.net.URLEncoder.encode(name, "UTF-8")}"
    fun reviewReply(id: String) = "review/$id/reply"
    fun settingsSection(section: String) = "settings/${java.net.URLEncoder.encode(section, "UTF-8")}"
}
