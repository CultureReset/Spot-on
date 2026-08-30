package com.spoton.merchant.data

data class Location(
    val id: String, val name: String, val address: String,
    val city: String, val timezone: String, val isOpen: Boolean,
) { val shortName: String get() = name.substringAfter("—", name).trim() }

data class DayPoint(
    val label: String, val weekday: String, val dayOfWeek: Int,
    val net: Int, val gross: Int, val orders: Int, val guests: Int,
    val labor: Int, val tips: Int, val discounts: Int, val refunds: Int, val comps: Int,
)

data class MenuItem(
    val id: String, val name: String, val category: String,
    val price: Double, val cost: Double, val sold: Int, val net: Int,
    val modifiers: List<String>, val available: Boolean, val station: String,
    val taxRate: Double, val description: String,
) {
    val marginPct: Double get() = (price - cost) / price * 100
    /** Menu-engineering quadrant, from popularity against margin. */
    val quadrant: String
        get() {
            val popular = sold >= 260
            val profitable = marginPct >= 72
            return when {
                popular && profitable -> "Star"
                popular -> "Plowhorse"
                profitable -> "Puzzle"
                else -> "Dog"
            }
        }
}

data class Employee(
    val id: String, val name: String, val role: String, val jobCodes: List<String>,
    val email: String, val phone: String, val active: Boolean, val hourly: Double,
    val hoursWeek: Double, val overtime: Double, val sales: Int, val tips: Int,
    val checks: Int, val pin: String, val hiredOn: String,
)

data class Customer(
    val id: String, val name: String, val email: String, val phone: String,
    val visits: Int, val spend: Int, val avgCheck: Int, val lastVisit: String,
    val loyaltyPoints: Int, val tier: String, val optIn: Boolean,
)

data class Campaign(
    val id: String, val name: String, val channel: String, val status: String,
    val sent: Int, val opened: Int, val clicked: Int, val redeemed: Int,
    val revenue: Int, val date: String, val audience: String,
)

data class Review(
    val id: String, val author: String, val source: String, val rating: Int,
    val body: String, val date: String, val replied: Boolean,
)

data class Order(
    val id: String, val ticket: String, val channel: String, val table: String,
    val server: String, val items: Int, val subtotal: Double, val tax: Double,
    val tip: Double, val total: Double, val status: String, val time: String,
    val payment: String,
)

data class Deposit(
    val id: String, val date: String, val gross: Int, val fees: Int,
    val refunds: Int, val net: Int, val status: String, val account: String, val batches: Int,
)

data class GiftCard(
    val id: String, val code: String, val balance: Int,
    val issued: String, val lastUsed: String, val status: String,
)

data class Reservation(
    val id: String, val name: String, val party: Int, val time: String,
    val table: String, val status: String, val phone: String, val notes: String,
)

data class WaitlistEntry(
    val id: String, val name: String, val party: Int,
    val quoted: Int, val waiting: Int, val phone: String,
)

data class Device(
    val id: String, val name: String, val type: String, val serial: String,
    val status: String, val version: String, val lastSeen: String,
)

data class HourPoint(val hour: Int, val label: String, val net: Int, val orders: Int)

data class Channel(val name: String, val net: Int, val orders: Int, val colorIndex: Int)

data class PaymentType(val name: String, val amount: Int, val count: Int)

data class Notification(
    val id: String, val title: String, val body: String,
    val time: String, val unread: Boolean, val kind: String,
)

data class Insight(
    val id: String, val tone: String, val title: String,
    val body: String, val action: String, val route: String,
)

data class DashboardUser(
    val id: String, val name: String, val email: String, val role: String,
    val lastActive: String, val status: String, val locations: Int,
)

data class ReportGroup(val group: String, val items: List<String>)

data class LoyaltyTier(val name: String, val threshold: Int, val perk: String)
data class LoyaltyReward(val name: String, val cost: Int, val redeemed: Int, val active: Boolean)
