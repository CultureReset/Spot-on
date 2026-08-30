package com.spoton.merchant.ui.theme

import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

/*
 * SpotOn palette. Values are taken from the live spoton.com stylesheet, so the
 * Android app and the web dashboard render the same brand.
 */

val Brand50 = Color(0xFFEEF4FF)
val Brand100 = Color(0xFFE5EEFB)
val Brand200 = Color(0xFFBBC5EF)
val Brand400 = Color(0xFF1E68EF)
val Brand500 = Color(0xFF0759EF)
val Brand600 = Color(0xFF1540D6)
val Brand700 = Color(0xFF12349F)

val Ink900 = Color(0xFF090D12)
val Ink800 = Color(0xFF16202C)
val Ink700 = Color(0xFF242D38)
val Ink500 = Color(0xFF445469)
val Ink400 = Color(0xFF6B7A8F)
val Ink300 = Color(0xFF9AA6B6)
val Ink200 = Color(0xFFD6DADF)
val Ink100 = Color(0xFFE7EBED)
val Ink50 = Color(0xFFF4F6F8)

val Good = Color(0xFF0F8A4D)
val GoodBg = Color(0xFFE6F5EC)
val Warning = Color(0xFFB26B00)
val WarningBg = Color(0xFFFDF1DC)
val Critical = Color(0xFFC02B2B)
val CriticalBg = Color(0xFFFDEAEA)

/** Categorical series, validated for colour-vision deficiency. See README. */
val Series1 = Color(0xFF0759EF)
val Series2 = Color(0xFFEB6834)
val Series3 = Color(0xFF1BAF7A)
val Series4 = Color(0xFFEDA100)
val Series5 = Color(0xFFE87BA4)
val Series6 = Color(0xFF4A3AA7)

val SeriesPalette = listOf(Series1, Series2, Series3, Series4, Series5, Series6)

/**
 * Tokens Material 3's ColorScheme has no slot for — the neutral ink ramp, status
 * pairs and the chart series. Exposed alongside the scheme so screens read
 * `SpotOnTheme.tokens.ink500` rather than reaching for a raw hex.
 */
@Immutable
data class SpotOnTokens(
    val ink900: Color = Ink900,
    val ink800: Color = Ink800,
    val ink700: Color = Ink700,
    val ink500: Color = Ink500,
    val ink400: Color = Ink400,
    val ink300: Color = Ink300,
    val ink200: Color = Ink200,
    val ink100: Color = Ink100,
    val ink50: Color = Ink50,
    val good: Color = Good,
    val goodBg: Color = GoodBg,
    val warning: Color = Warning,
    val warningBg: Color = WarningBg,
    val critical: Color = Critical,
    val criticalBg: Color = CriticalBg,
    val canvas: Color = Ink50,
    val surface: Color = Color.White,
    val hairline: Color = Ink100,
    val series: List<Color> = SeriesPalette,
)

val LocalSpotOnTokens = staticCompositionLocalOf { SpotOnTokens() }
