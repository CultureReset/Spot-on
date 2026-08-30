package com.spoton.merchant.data

import java.text.NumberFormat
import java.util.Locale
import kotlin.math.abs
import kotlin.math.roundToInt

object Fmt {
    private val us = Locale.US

    fun usd(n: Number): String = NumberFormat.getCurrencyInstance(us).apply {
        maximumFractionDigits = 0
        minimumFractionDigits = 0
    }.format(n)

    fun usdc(n: Number): String = NumberFormat.getCurrencyInstance(us).apply {
        maximumFractionDigits = 2
        minimumFractionDigits = 2
    }.format(n)

    /** Compact form for axis ticks and hero figures: $262k */
    fun usdShort(n: Number): String {
        val v = n.toDouble()
        return when {
            abs(v) >= 1_000_000 -> "$" + String.format(us, "%.1fM", v / 1_000_000)
            abs(v) >= 1_000 -> "$" + String.format(us, "%.0fk", v / 1_000)
            else -> "$" + v.roundToInt()
        }
    }

    fun num(n: Number): String = NumberFormat.getIntegerInstance(us).format(n)

    fun pct(n: Double, digits: Int = 1): String = String.format(us, "%.${digits}f%%", n)

    fun signedPct(n: Double, digits: Int = 1): String =
        (if (n > 0) "+" else "") + String.format(us, "%.${digits}f%%", n)

    /** 4h 32m from a minute count. */
    fun dur(mins: Double): String {
        val h = (mins / 60).toInt()
        val m = (mins % 60).roundToInt()
        return if (h > 0) "${h}h ${m}m" else "${m}m"
    }

    fun initials(name: String): String =
        name.split(" ").filter { it.isNotBlank() }.take(2)
            .joinToString("") { it.first().uppercase() }
}
