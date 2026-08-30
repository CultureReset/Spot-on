package com.spoton.merchant.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

private val SpotOnLightScheme = lightColorScheme(
    primary = Brand500,
    onPrimary = Color.White,
    primaryContainer = Brand50,
    onPrimaryContainer = Brand700,
    secondary = Ink700,
    onSecondary = Color.White,
    secondaryContainer = Ink50,
    onSecondaryContainer = Ink800,
    tertiary = Series3,
    onTertiary = Color.White,
    background = Ink50,
    onBackground = Ink900,
    surface = Color.White,
    onSurface = Ink900,
    surfaceVariant = Ink50,
    onSurfaceVariant = Ink500,
    surfaceContainerLowest = Color.White,
    surfaceContainerLow = Color.White,
    surfaceContainer = Color.White,
    surfaceContainerHigh = Ink50,
    surfaceContainerHighest = Ink50,
    outline = Ink200,
    outlineVariant = Ink100,
    error = Critical,
    onError = Color.White,
    errorContainer = CriticalBg,
    onErrorContainer = Critical,
    scrim = Ink900,
)

val SpotOnShapes = Shapes(
    extraSmall = RoundedCornerShape(6.dp),
    small = RoundedCornerShape(10.dp),
    medium = RoundedCornerShape(12.dp),
    large = RoundedCornerShape(16.dp),
    extraLarge = RoundedCornerShape(24.dp),
)

/**
 * The dashboard is a committed light-mode design, matching the production
 * product, so the scheme does not flip with the system setting.
 */
@Composable
fun SpotOnTheme(
    @Suppress("UNUSED_PARAMETER") darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    CompositionLocalProvider(LocalSpotOnTokens provides SpotOnTokens()) {
        MaterialTheme(
            colorScheme = SpotOnLightScheme,
            typography = SpotOnTypography,
            shapes = SpotOnShapes,
            content = content,
        )
    }
}

object SpotOnTheme {
    val tokens: SpotOnTokens
        @Composable get() = LocalSpotOnTokens.current
    val typography: Typography
        @Composable get() = MaterialTheme.typography
}
