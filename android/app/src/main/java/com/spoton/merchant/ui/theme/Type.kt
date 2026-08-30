package com.spoton.merchant.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.spoton.merchant.R

/** Poppins is bundled so the app matches the brand rather than falling back to Roboto. */
val Poppins = FontFamily(
    Font(R.font.poppins_regular, FontWeight.Normal),
    Font(R.font.poppins_medium, FontWeight.Medium),
    Font(R.font.poppins_semibold, FontWeight.SemiBold),
    Font(R.font.poppins_bold, FontWeight.Bold),
)

val SpotOnTypography = Typography(
    displaySmall = TextStyle(fontFamily = Poppins, fontSize = 32.sp, fontWeight = FontWeight.SemiBold, lineHeight = 38.sp, letterSpacing = (-0.5).sp),
    headlineLarge = TextStyle(fontFamily = Poppins, fontSize = 28.sp, fontWeight = FontWeight.SemiBold, lineHeight = 34.sp, letterSpacing = (-0.4).sp),
    headlineMedium = TextStyle(fontFamily = Poppins, fontSize = 24.sp, fontWeight = FontWeight.SemiBold, lineHeight = 30.sp, letterSpacing = (-0.3).sp),
    headlineSmall = TextStyle(fontFamily = Poppins, fontSize = 20.sp, fontWeight = FontWeight.SemiBold, lineHeight = 26.sp),
    titleLarge = TextStyle(fontFamily = Poppins, fontSize = 18.sp, fontWeight = FontWeight.SemiBold, lineHeight = 24.sp),
    titleMedium = TextStyle(fontFamily = Poppins, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, lineHeight = 20.sp),
    titleSmall = TextStyle(fontFamily = Poppins, fontSize = 13.sp, fontWeight = FontWeight.Medium, lineHeight = 18.sp),
    bodyLarge = TextStyle(fontFamily = Poppins, fontSize = 15.sp, fontWeight = FontWeight.Normal, lineHeight = 22.sp),
    bodyMedium = TextStyle(fontFamily = Poppins, fontSize = 13.5f.sp, fontWeight = FontWeight.Normal, lineHeight = 19.sp),
    bodySmall = TextStyle(fontFamily = Poppins, fontSize = 12.5f.sp, fontWeight = FontWeight.Normal, lineHeight = 17.sp),
    labelLarge = TextStyle(fontFamily = Poppins, fontSize = 14.sp, fontWeight = FontWeight.Medium, lineHeight = 18.sp),
    labelMedium = TextStyle(fontFamily = Poppins, fontSize = 12.sp, fontWeight = FontWeight.Medium, lineHeight = 16.sp),
    labelSmall = TextStyle(fontFamily = Poppins, fontSize = 11.sp, fontWeight = FontWeight.Medium, lineHeight = 14.sp, letterSpacing = 0.4.sp),
)
