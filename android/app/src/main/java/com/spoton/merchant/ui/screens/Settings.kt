package com.spoton.merchant.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowRight
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.spoton.merchant.data.*
import com.spoton.merchant.ui.components.*
import com.spoton.merchant.ui.theme.SpotOnTheme

val SETTINGS_SECTIONS = listOf(
    "Business profile" to "Name, contact and description",
    "Locations" to "Sites, addresses and status",
    "Hours" to "When you are open",
    "Taxes & service charges" to "Rates and automatic charges",
    "Receipts" to "What guests see on paper and in email",
    "Payments & payouts" to "Bank account and schedule",
    "Notifications" to "What reaches your phone",
    "Security" to "Password, 2FA and policy",
)

@Composable
fun SettingsScreen(onSection: (String) -> Unit, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        items(SETTINGS_SECTIONS) { (name, blurb) ->
            Column(Modifier.background(t.surface)) {
                ListRow(
                    title = name,
                    subtitle = blurb,
                    trailing = {
                        Icon(Icons.AutoMirrored.Outlined.KeyboardArrowRight, null, tint = t.ink300)
                    },
                    onClick = { onSection(name) },
                )
                HairlineDivider()
            }
        }
        item { Spacer(Modifier.height(16.dp)) }
    }
}

@Composable
fun SettingsSectionScreen(section: String, vm: AppViewModel, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    var notifs by remember {
        mutableStateOf(
            listOf(
                Triple("Daily recap", true, "Yesterday's sales, labor and covers, each morning."),
                Triple("Deposit alerts", true, "When a payout leaves for your bank account."),
                Triple("Labor alerts", true, "When labor crosses your target during service."),
                Triple("New reviews", true, "Any new review on a connected platform."),
                Triple("Device offline", true, "When a terminal or KDS stops reporting in."),
                Triple("Large refunds", false, "Refunds over \$100, as they happen."),
                Triple("Weekly digest", true, "A wider read on the week, Monday morning."),
            ),
        )
    }

    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        when (section) {
            "Business profile" -> item {
                Column(Modifier.padding(16.dp)) {
                    SectionCard {
                        CardHeader("Business profile", "Appears on receipts and your ordering site")
                        SettingField("Business name", "Harborview Kitchen")
                        SettingField("Legal entity", "Harborview Hospitality LLC")
                        SettingField("Business phone", "(415) 555-0142")
                        SettingField("Support email", "hello@harborview.co")
                        SettingField("Cuisine type", "Casual dining")
                        SettingField("Time zone", "Pacific Time (PT)")
                    }
                }
            }

            "Locations" -> {
                items(MockData.locations) { l ->
                    Column(Modifier.background(t.surface)) {
                        ListRow(
                            title = l.name,
                            subtitle = "${l.address}, ${l.city} · ${l.timezone}",
                            leading = { Icon(Icons.Outlined.LocationOn, null, tint = t.ink400) },
                            trailing = {
                                StatusPill(if (l.isOpen) "Open" else "Closed", if (l.isOpen) Tone.Good else Tone.Neutral)
                            },
                        )
                        HairlineDivider()
                    }
                }
            }

            "Hours" -> items(MockData.businessHours) { (day, open, close) ->
                Column(Modifier.background(t.surface)) {
                    ListRow(
                        title = day,
                        subtitle = "$open – $close",
                        trailing = { Switch(checked = true, onCheckedChange = {}) },
                    )
                    HairlineDivider()
                }
            }

            "Taxes & service charges" -> {
                item { SectionLabel("Tax rates") }
                items(
                    listOf(
                        Triple("Sales tax", "8.625%", "Food and non-alcoholic beverages"),
                        Triple("Alcohol tax", "9.750%", "Beer, wine and cocktails"),
                        Triple("Local district tax", "0.500%", "All taxable items"),
                    ),
                ) { (n, r, a) ->
                    Column(Modifier.background(t.surface)) {
                        ListRow(title = n, subtitle = a, trailingText = r)
                        HairlineDivider()
                    }
                }
                item { SectionLabel("Service charges") }
                items(
                    listOf(
                        Triple("Large party gratuity", "20%", "Parties of 6 or more"),
                        Triple("Private dining fee", "\$150.00", "Private room bookings"),
                        Triple("Delivery fee", "\$4.99", "Delivery orders"),
                    ),
                ) { (n, amt, w) ->
                    Column(Modifier.background(t.surface)) {
                        ListRow(title = n, subtitle = w, trailingText = amt)
                        HairlineDivider()
                    }
                }
            }

            "Receipts" -> item {
                Column(Modifier.padding(16.dp)) {
                    SectionCard {
                        CardHeader("Receipt preview", "What prints at the terminal")
                        Column(
                            Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(t.ink50)
                                .padding(16.dp),
                        ) {
                            Column(
                                Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(t.surface)
                                    .padding(14.dp),
                            ) {
                                Text(
                                    "Harborview Kitchen",
                                    Modifier.fillMaxWidth(),
                                    style = MaterialTheme.typography.titleSmall,
                                    color = t.ink900, textAlign = TextAlign.Center,
                                    fontFamily = FontFamily.Monospace,
                                )
                                Text(
                                    "418 Market St, San Francisco",
                                    Modifier.fillMaxWidth(),
                                    style = MaterialTheme.typography.bodySmall,
                                    color = t.ink400, textAlign = TextAlign.Center,
                                    fontFamily = FontFamily.Monospace,
                                )
                                Spacer(Modifier.height(8.dp)); HairlineDivider(); Spacer(Modifier.height(8.dp))
                                listOf(
                                    "2× Harbor Burger" to "42.00",
                                    "1× Truffle Fries" to "11.00",
                                    "2× Local IPA" to "18.00",
                                ).forEach { (l, v) ->
                                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text(l, style = MaterialTheme.typography.bodySmall, color = t.ink700, fontFamily = FontFamily.Monospace)
                                        Text(v, style = MaterialTheme.typography.bodySmall, color = t.ink700, fontFamily = FontFamily.Monospace)
                                    }
                                }
                                Spacer(Modifier.height(8.dp)); HairlineDivider(); Spacer(Modifier.height(8.dp))
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Total", style = MaterialTheme.typography.titleSmall, color = t.ink900, fontFamily = FontFamily.Monospace)
                                    Text("77.24", style = MaterialTheme.typography.titleSmall, color = t.ink900, fontFamily = FontFamily.Monospace)
                                }
                                Spacer(Modifier.height(8.dp))
                                Text(
                                    "Rewards balance: 1,240 pts",
                                    Modifier.fillMaxWidth(),
                                    style = MaterialTheme.typography.bodySmall,
                                    color = t.ink400, textAlign = TextAlign.Center,
                                    fontFamily = FontFamily.Monospace,
                                )
                            }
                        }
                    }
                    Spacer(Modifier.height(12.dp))
                    SectionCard(contentPadding = PaddingValues(vertical = 4.dp)) {
                        listOf(
                            "Print receipts automatically" to true,
                            "Offer email receipts" to true,
                            "Show itemised modifiers" to true,
                            "Show loyalty balance" to true,
                            "Tip line on printed receipts" to false,
                        ).forEach { (label, on) ->
                            ListRow(
                                title = label,
                                trailing = { Switch(checked = on, onCheckedChange = {}) },
                            )
                        }
                    }
                }
            }

            "Payments & payouts" -> item {
                Column(Modifier.padding(16.dp)) {
                    SectionCard {
                        CardHeader("Payouts", "Where your money lands and how often")
                        SettingField("Bank account", "Wells Fargo checking •••4417")
                        SettingField("Payout schedule", "Daily (next business day)")
                        SettingField("Batch close time", "11:59 PM")
                        SettingField("Statement delivery", "Email monthly")
                    }
                    Spacer(Modifier.height(12.dp))
                    SectionCard(contentPadding = PaddingValues(vertical = 4.dp)) {
                        Box(Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
                            CardHeader("Accepted payments", "What terminals will take")
                        }
                        listOf(
                            "Visa, Mastercard, Discover" to true,
                            "American Express" to true,
                            "Apple Pay and Google Pay" to true,
                            "Cash" to true,
                            "SpotOn gift cards" to true,
                            "Manual card entry" to false,
                        ).forEach { (label, on) ->
                            ListRow(title = label, trailing = { Switch(checked = on, onCheckedChange = {}) })
                        }
                    }
                }
            }

            "Notifications" -> {
                item {
                    Text(
                        "Sent to ${vm.user?.email ?: "your account"} and the SpotOn mobile app.",
                        Modifier.padding(16.dp),
                        style = MaterialTheme.typography.bodyMedium, color = t.ink500,
                    )
                }
                itemsIndexed(notifs) { i, (label, on, hint) ->
                    Column(Modifier.background(t.surface)) {
                        ListRow(
                            title = label,
                            subtitle = hint,
                            trailing = {
                                Switch(
                                    checked = on,
                                    onCheckedChange = { v ->
                                        notifs = notifs.toMutableList().also { it[i] = Triple(label, v, hint) }
                                    },
                                )
                            },
                        )
                        HairlineDivider()
                    }
                }
            }

            else -> {
                item {
                    Column(Modifier.padding(16.dp)) {
                        SectionCard {
                            CardHeader("Your account")
                            SettingField("Name", vm.user?.name ?: "—")
                            SettingField("Email", vm.user?.email ?: "—")
                        }
                    }
                }
                items(
                    listOf(
                        Triple("Password", "Last changed 4 months ago", "Change"),
                        Triple("Two-factor authentication", "Enabled via SMS to •••4417", "Manage"),
                        Triple("Active sessions", "3 devices signed in", "Review"),
                    ),
                ) { (label, hint, action) ->
                    Column(Modifier.background(t.surface)) {
                        ListRow(
                            title = label, subtitle = hint,
                            trailing = {
                                Text(
                                    action, style = MaterialTheme.typography.labelMedium,
                                    color = MaterialTheme.colorScheme.primary,
                                )
                            },
                        )
                        HairlineDivider()
                    }
                }
                item { SectionLabel("Business security policy") }
                items(
                    listOf(
                        "Require two-factor for all users" to true,
                        "Sign out after 8 hours idle" to true,
                        "Manager PIN for voids and refunds" to true,
                        "Alert on sign-in from a new device" to true,
                    ),
                ) { (label, on) ->
                    Column(Modifier.background(t.surface)) {
                        ListRow(title = label, trailing = { Switch(checked = on, onCheckedChange = {}) })
                        HairlineDivider()
                    }
                }
            }
        }
        item { Spacer(Modifier.height(16.dp)) }
    }
}

@Composable
private fun SettingField(label: String, value: String) {
    val t = SpotOnTheme.tokens
    Column(Modifier.fillMaxWidth().padding(vertical = 6.dp)) {
        Text(label, style = MaterialTheme.typography.labelMedium, color = t.ink400)
        Spacer(Modifier.height(2.dp))
        Text(value, style = MaterialTheme.typography.bodyLarge, color = t.ink900)
    }
}

/* ------------------------------------------------- Notifications / search / profile */

@Composable
fun NotificationsScreen(contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        items(MockData.notifications) { n ->
            Column(Modifier.background(t.surface)) {
                ListRow(
                    title = n.title,
                    subtitle = n.body,
                    leading = {
                        Box(
                            Modifier.size(8.dp).clip(RoundedCornerShape(4.dp))
                                .background(if (n.unread) MaterialTheme.colorScheme.primary else t.ink100),
                        )
                    },
                    trailingSub = n.time,
                )
                HairlineDivider()
            }
        }
        item { Spacer(Modifier.height(16.dp)) }
    }
}

@Composable
fun ProfileScreen(vm: AppViewModel, onSignOut: () -> Unit, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Avatar(vm.user?.name ?: "?", 54)
                        Spacer(Modifier.width(14.dp))
                        Column {
                            Text(
                                vm.user?.name ?: "—",
                                style = MaterialTheme.typography.titleLarge, color = t.ink900,
                            )
                            Text(
                                vm.user?.email ?: "—",
                                style = MaterialTheme.typography.bodySmall, color = t.ink400,
                            )
                            Spacer(Modifier.height(4.dp))
                            Text(
                                "${vm.user?.role} · ${vm.user?.business}",
                                style = MaterialTheme.typography.bodySmall, color = t.ink500,
                            )
                        }
                    }
                }
                Spacer(Modifier.height(12.dp))
                SectionCard {
                    CardHeader("Current scope", "What every figure in the app is showing")
                    KeyValueRow("Location", vm.location.name)
                    KeyValueRow("Date range", vm.range.label)
                }
                Spacer(Modifier.height(14.dp))
                OutlinedButton(
                    onClick = onSignOut,
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape = RoundedCornerShape(10.dp),
                ) { Text("Sign out") }
                Spacer(Modifier.height(16.dp))
            }
        }
    }
}

/** Search across the whole information architecture. */
@Composable
fun SearchScreen(
    onPick: (com.spoton.merchant.nav.Dest) -> Unit,
    contentPadding: PaddingValues,
) {
    val t = SpotOnTheme.tokens
    var query by remember { mutableStateOf("") }
    val all = com.spoton.merchant.nav.Dest.entries
    val sections = all.filter {
        query.isBlank() || it.title.contains(query, true) || it.blurb.contains(query, true)
    }
    val reports = MockData.reportCatalog.flatMap { it.items }
        .filter { query.isNotBlank() && it.contains(query, true) }

    Column(Modifier.fillMaxSize().background(t.canvas)) {
        Column(Modifier.background(t.surface)) {
            SearchField(query, { query = it }, "Search sections, reports and settings")
            HairlineDivider()
        }
        LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
            if (sections.isEmpty() && reports.isEmpty()) {
                item { EmptyState("No matches", "Nothing matches \"$query\".") }
            }
            if (sections.isNotEmpty()) {
                item { SectionLabel("Sections") }
                items(sections) { d ->
                    Column(Modifier.background(t.surface)) {
                        ListRow(
                            title = d.title,
                            subtitle = d.blurb,
                            leading = { Icon(d.icon, null, tint = t.ink400) },
                            onClick = { onPick(d) },
                        )
                        HairlineDivider()
                    }
                }
            }
            if (reports.isNotEmpty()) {
                item { SectionLabel("Reports") }
                items(reports) { r ->
                    Column(Modifier.background(t.surface)) {
                        ListRow(
                            title = r,
                            onClick = { onPick(com.spoton.merchant.nav.Dest.Reporting) },
                        )
                        HairlineDivider()
                    }
                }
            }
            item { Spacer(Modifier.height(16.dp)) }
        }
    }
}
