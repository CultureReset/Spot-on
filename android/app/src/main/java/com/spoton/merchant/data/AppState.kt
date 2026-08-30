package com.spoton.merchant.data

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import kotlin.math.roundToInt

enum class DateRange(val label: String, val days: Int) {
    TODAY("Today", 1),
    YESTERDAY("Yesterday", 1),
    LAST_7("Last 7 days", 7),
    LAST_30("Last 30 days", 30),
    LAST_90("Last 90 days", 90);

    companion object { val all = entries }
}

data class SessionUser(val name: String, val email: String, val role: String, val business: String)

/** A window of days plus the equivalent window immediately before it. */
data class RangeSlice(val rows: List<DayPoint>, val prev: List<DayPoint>) {
    fun sum(selector: (DayPoint) -> Int) = rows.sumOf(selector)
    fun prevSum(selector: (DayPoint) -> Int) = prev.sumOf(selector)

    /** Percent change against the preceding window, so every delta is a real comparison. */
    fun delta(selector: (DayPoint) -> Int): Double {
        val p = prevSum(selector)
        if (p == 0) return 0.0
        return (sum(selector) - p).toDouble() / p * 100
    }
}

class AppViewModel : ViewModel() {
    var user by mutableStateOf<SessionUser?>(null)
        private set
    var location by mutableStateOf(MockData.locations.first())
        private set
    var range by mutableStateOf(DateRange.LAST_7)
        private set
    /** Availability toggles live here so a change on one screen shows on another. */
    var itemAvailability by mutableStateOf(
        MockData.menuItems.associate { it.id to it.available }
    )
        private set
    var acceptingOnlineOrders by mutableStateOf(true)
        private set

    fun signIn(email: String) {
        val name = email.substringBefore("@")
            .split(".", "_", "-")
            .filter { it.isNotBlank() }
            .joinToString(" ") { it.replaceFirstChar(Char::uppercase) }
            .ifBlank { "Owner" }
        user = SessionUser(name, email, "Owner / Admin", "Harborview Kitchen")
    }

    fun signOut() { user = null }
    fun selectLocation(l: Location) { location = l }
    fun selectRange(r: DateRange) { range = r }
    fun updateAvailability(id: String, value: Boolean) {
        itemAvailability = itemAvailability + (id to value)
    }
    fun toggleOnlineOrders(v: Boolean) { acceptingOnlineOrders = v }

    val slice: RangeSlice
        get() {
            val all = MockData.days90
            val n = range.days
            val end = if (range == DateRange.YESTERDAY) all.size - 1 else all.size
            return RangeSlice(
                rows = all.subList(maxOf(0, end - n), end),
                prev = all.subList(maxOf(0, end - n * 2), maxOf(0, end - n)),
            )
        }
}

/** Labor target the whole app measures against. */
const val LABOR_TARGET = 28.0

fun laborPct(net: Int, labor: Int): Double = if (net == 0) 0.0 else labor.toDouble() / net * 100

fun avgTicket(net: Int, orders: Int): Double = if (orders == 0) 0.0 else net.toDouble() / orders

fun Double.round1(): Double = (this * 10).roundToInt() / 10.0
