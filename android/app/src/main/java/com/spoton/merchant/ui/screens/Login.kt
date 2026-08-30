package com.spoton.merchant.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ErrorOutline
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.spoton.merchant.data.Location
import com.spoton.merchant.data.MockData
import com.spoton.merchant.ui.components.*
import com.spoton.merchant.ui.theme.SpotOnTheme
import kotlinx.coroutines.delay

private enum class Step { Email, Password, Code, LocationPick }

/**
 * Four steps, each with its own failure mode, so a bad email fails before a
 * password is ever attempted. A progress bar keeps the user oriented.
 */
@Composable
fun LoginScreen(onSignedIn: (email: String, location: Location) -> Unit) {
    val t = SpotOnTheme.tokens
    var step by remember { mutableStateOf(Step.Email) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }
    var code by remember { mutableStateOf(List(6) { "" }) }
    var remember2 by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var busy by remember { mutableStateOf(false) }
    val focus = LocalFocusManager.current

    LaunchedEffect(busy) {
        if (busy) {
            delay(450)
            busy = false
            step = when (step) {
                Step.Email -> Step.Password
                Step.Password -> Step.Code
                Step.Code -> Step.LocationPick
                Step.LocationPick -> Step.LocationPick
            }
        }
    }

    val stepIndex = when (step) {
        Step.Email -> 0; Step.Password -> 1; Step.Code -> 2; Step.LocationPick -> 3
    }

    Column(
        Modifier
            .fillMaxSize()
            .background(t.surface)
            .verticalScroll(rememberScrollState())
            .windowInsetsPadding(WindowInsets.safeDrawing),
    ) {
        // brand header — the dark panel from the web app, compressed for a phone
        Box(
            Modifier
                .fillMaxWidth()
                .background(
                    Brush.linearGradient(
                        listOf(Color(0xFF090D12), Color(0xFF12275E), Color(0xFF0A1020)),
                    ),
                )
                .padding(horizontal = 24.dp, vertical = 28.dp),
        ) {
            Column {
                SpotOnWordmark(color = Color.White, markSize = 26)
                Spacer(Modifier.height(18.dp))
                Text(
                    "Every number that runs your restaurant, in one place.",
                    style = MaterialTheme.typography.headlineSmall,
                    color = Color.White,
                    lineHeight = 28.sp,
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    "Sales, labor, menu performance, guests and payouts — live from your point of sale.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFFD6DADF),
                )
            }
        }

        Column(Modifier.padding(24.dp)) {
            // progress
            Row(Modifier.fillMaxWidth()) {
                listOf("Email", "Password", "Verify", "Location").forEachIndexed { i, label ->
                    Column(Modifier.weight(1f).padding(end = 6.dp)) {
                        Box(
                            Modifier
                                .fillMaxWidth()
                                .height(3.dp)
                                .clip(CircleShape)
                                .background(if (i <= stepIndex) MaterialTheme.colorScheme.primary else t.ink100),
                        )
                        Spacer(Modifier.height(5.dp))
                        Text(
                            label,
                            style = MaterialTheme.typography.labelSmall,
                            color = if (i <= stepIndex) t.ink700 else t.ink300,
                        )
                    }
                }
            }

            Spacer(Modifier.height(26.dp))

            when (step) {
                Step.Email -> {
                    StepHeading("Sign in", "Use the email tied to your SpotOn merchant account.")
                    Spacer(Modifier.height(20.dp))
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it; error = null },
                        label = { Text("Email address") },
                        placeholder = { Text("you@yourrestaurant.com") },
                        singleLine = true,
                        isError = error != null,
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Email, imeAction = ImeAction.Next,
                        ),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                    )
                    ErrorNote(error)
                    Spacer(Modifier.height(14.dp))
                    PrimaryButton(if (busy) "Checking…" else "Continue", enabled = !busy) {
                        if (!Regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$").matches(email)) {
                            error = "Enter a valid email address."
                        } else { focus.clearFocus(); busy = true }
                    }
                    Spacer(Modifier.height(16.dp))
                    DividerWithLabel("or")
                    Spacer(Modifier.height(16.dp))
                    OutlinedButton(
                        onClick = { email = "owner@harborview.co" },
                        modifier = Modifier.fillMaxWidth().height(50.dp),
                        shape = RoundedCornerShape(10.dp),
                    ) { Text("Use the demo account") }
                }

                Step.Password -> {
                    StepHeading("Enter your password", null)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(email, style = MaterialTheme.typography.bodyMedium, color = t.ink800)
                        Spacer(Modifier.width(8.dp))
                        TextButton({ step = Step.Email; error = null }) { Text("Change") }
                    }
                    Spacer(Modifier.height(14.dp))
                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it; error = null },
                        label = { Text("Password") },
                        singleLine = true,
                        isError = error != null,
                        visualTransformation = if (showPassword) androidx.compose.ui.text.input.VisualTransformation.None
                            else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Password, imeAction = ImeAction.Done,
                        ),
                        trailingIcon = {
                            IconButton({ showPassword = !showPassword }) {
                                Icon(
                                    if (showPassword) Icons.Outlined.VisibilityOff else Icons.Outlined.Visibility,
                                    if (showPassword) "Hide password" else "Show password",
                                    tint = t.ink400,
                                )
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                    )
                    ErrorNote(error)
                    Spacer(Modifier.height(6.dp))
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Checkbox(remember2, { remember2 = it })
                            Text("Keep me signed in", style = MaterialTheme.typography.bodyMedium, color = t.ink700)
                        }
                        TextButton({}) { Text("Forgot?") }
                    }
                    Spacer(Modifier.height(8.dp))
                    PrimaryButton(if (busy) "Signing in…" else "Sign in", enabled = !busy) {
                        if (password.length < 6) error = "Password must be at least 6 characters."
                        else { focus.clearFocus(); busy = true }
                    }
                }

                Step.Code -> {
                    StepHeading("Verify it's you", "We texted a 6-digit code to the phone ending in ••4417.")
                    Spacer(Modifier.height(20.dp))
                    CodeInput(code) { code = it; error = null }
                    ErrorNote(error)
                    Spacer(Modifier.height(14.dp))
                    PrimaryButton(if (busy) "Verifying…" else "Verify", enabled = !busy) {
                        if (code.any { it.isBlank() }) error = "Enter all six digits."
                        else { focus.clearFocus(); busy = true }
                    }
                    Spacer(Modifier.height(10.dp))
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        TextButton({ code = listOf("1", "2", "3", "4", "5", "6") }) { Text("Fill demo code") }
                        TextButton({}) { Text("Resend code") }
                    }
                }

                Step.LocationPick -> {
                    StepHeading(
                        "Choose a location",
                        "You have access to ${MockData.locations.size} locations. You can switch any time from the top bar.",
                    )
                    Spacer(Modifier.height(18.dp))
                    MockData.locations.forEach { l ->
                        Surface(
                            onClick = { onSignedIn(email, l) },
                            modifier = Modifier.fillMaxWidth().padding(bottom = 10.dp),
                            shape = RoundedCornerShape(12.dp),
                            color = t.surface,
                            border = androidx.compose.foundation.BorderStroke(1.dp, t.ink200),
                        ) {
                            Row(
                                Modifier.padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Box(
                                    Modifier.size(40.dp).clip(RoundedCornerShape(10.dp)).background(t.ink900),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    Text(
                                        l.shortName.first().toString(),
                                        color = Color.White,
                                        style = MaterialTheme.typography.titleMedium,
                                    )
                                }
                                Spacer(Modifier.width(12.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(
                                        l.name,
                                        style = MaterialTheme.typography.bodyLarge,
                                        fontWeight = FontWeight.Medium,
                                        color = t.ink900,
                                    )
                                    Text(
                                        "${l.address}, ${l.city}",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = t.ink400,
                                    )
                                }
                                StatusPill(if (l.isOpen) "Open" else "Closed", if (l.isOpen) Tone.Good else Tone.Neutral)
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(28.dp))
            Text(
                "© 2026 SpotOn Transact, LLC. Interface recreation for demonstration.",
                style = MaterialTheme.typography.bodySmall,
                color = t.ink300,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(16.dp))
        }
    }
}

@Composable
private fun StepHeading(title: String, subtitle: String?) {
    val t = SpotOnTheme.tokens
    Text(title, style = MaterialTheme.typography.headlineMedium, color = t.ink900)
    if (subtitle != null) {
        Spacer(Modifier.height(6.dp))
        Text(subtitle, style = MaterialTheme.typography.bodyMedium, color = t.ink500)
    }
}

@Composable
private fun PrimaryButton(text: String, enabled: Boolean = true, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = Modifier.fillMaxWidth().height(50.dp),
        shape = RoundedCornerShape(10.dp),
    ) { Text(text, style = MaterialTheme.typography.labelLarge) }
}

@Composable
private fun ErrorNote(error: String?) {
    val t = SpotOnTheme.tokens
    AnimatedVisibility(error != null) {
        Row(
            Modifier
                .fillMaxWidth()
                .padding(top = 10.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(t.criticalBg)
                .padding(10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(Icons.Outlined.ErrorOutline, null, tint = t.critical, modifier = Modifier.size(17.dp))
            Spacer(Modifier.width(8.dp))
            Text(error ?: "", style = MaterialTheme.typography.bodyMedium, color = t.critical)
        }
    }
}

@Composable
private fun DividerWithLabel(label: String) {
    val t = SpotOnTheme.tokens
    Row(verticalAlignment = Alignment.CenterVertically) {
        HorizontalDivider(Modifier.weight(1f), color = t.hairline)
        Text(
            label.uppercase(),
            Modifier.padding(horizontal = 12.dp),
            style = MaterialTheme.typography.labelSmall,
            color = t.ink300,
        )
        HorizontalDivider(Modifier.weight(1f), color = t.hairline)
    }
}

/** Six boxes that advance as you type and step back on backspace. */
@Composable
private fun CodeInput(code: List<String>, onChange: (List<String>) -> Unit) {
    val focusRequesters = remember { List(6) { FocusRequester() } }
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        code.forEachIndexed { i, c ->
            OutlinedTextField(
                value = c,
                onValueChange = { raw ->
                    val digit = raw.filter { it.isDigit() }.takeLast(1)
                    onChange(code.toMutableList().also { it[i] = digit })
                    if (digit.isNotEmpty() && i < 5) focusRequesters[i + 1].requestFocus()
                    if (digit.isEmpty() && i > 0) focusRequesters[i - 1].requestFocus()
                },
                modifier = Modifier
                    .weight(1f)
                    .focusRequester(focusRequesters[i]),
                singleLine = true,
                textStyle = MaterialTheme.typography.titleLarge.copy(textAlign = TextAlign.Center),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                shape = RoundedCornerShape(10.dp),
            )
        }
    }
}
