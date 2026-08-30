package com.spoton.merchant.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CardGiftcard
import androidx.compose.material.icons.outlined.Devices
import androidx.compose.material.icons.outlined.Language
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.spoton.merchant.data.*
import com.spoton.merchant.ui.components.*
import com.spoton.merchant.ui.theme.SpotOnTheme

/* ----------------------------------------------------------- Online ordering */

@Composable
fun OnlineOrderingScreen(vm: AppViewModel, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    var settings by remember {
        mutableStateOf(MockData.onlineSettings.map { it.first to it.second })
    }
    val accepting = vm.acceptingOnlineOrders

    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        item {
            Column(Modifier.padding(16.dp)) {
                // The one consequential control on this screen, given top billing.
                Column(
                    Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(if (accepting) t.goodBg else t.criticalBg)
                        .padding(16.dp),
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Outlined.Language, null, tint = t.ink700)
                        Spacer(Modifier.width(10.dp))
                        Column(Modifier.weight(1f)) {
                            Text(
                                if (accepting) "Accepting online orders" else "Online ordering is paused",
                                style = MaterialTheme.typography.titleSmall, color = t.ink900,
                            )
                            Text(
                                MockData.onlineUrl,
                                style = MaterialTheme.typography.bodySmall, color = t.ink500,
                            )
                        }
                        Switch(accepting, { vm.toggleOnlineOrders(it) })
                    }
                    Spacer(Modifier.height(8.dp))
                    Text(
                        if (accepting) "Quoting ${MockData.onlinePrepTime} minutes for pickup."
                        else "Guests see a closed message at checkout.",
                        style = MaterialTheme.typography.bodySmall, color = t.ink500,
                    )
                }
                Spacer(Modifier.height(14.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Orders", Fmt.num(MockData.onlineOrdersWeek), Modifier.weight(1f), 9.8, "this week")
                    StatTile("Revenue", Fmt.usd(MockData.onlineRevenueWeek), Modifier.weight(1f), 14.2, "this week")
                }
                Spacer(Modifier.height(10.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Avg. ticket", Fmt.usdc(MockData.onlineAvgTicket), Modifier.weight(1f), hint = "vs \$38.40 dine-in")
                    StatTile("Conversion", Fmt.pct(MockData.onlineConversion), Modifier.weight(1f), hint = "visits that order")
                }
            }
        }
        item {
            Column(Modifier.padding(horizontal = 16.dp)) {
                SectionCard {
                    CardHeader("Online revenue", "Derived from the last 28 days")
                    val rows = MockData.days90.takeLast(28)
                    LineChart(
                        labels = rows.map { it.label },
                        area = true,
                        series = listOf(
                            ChartSeries("Revenue", t.series[0], rows.map { (it.net * 0.13f) }),
                        ),
                    )
                }
            }
        }
        item { SectionLabel("Fulfilment") }
        itemsIndexed(settings) { i, (key, value) ->
            Column(Modifier.background(t.surface)) {
                ListRow(
                    title = key,
                    subtitle = MockData.onlineSettings[i].third,
                    trailing = {
                        Switch(
                            checked = if (i == 0) accepting else value,
                            onCheckedChange = { v ->
                                if (i == 0) vm.toggleOnlineOrders(v)
                                else settings = settings.toMutableList().also { it[i] = key to v }
                            },
                        )
                    },
                )
                HairlineDivider()
            }
        }
        item { Spacer(Modifier.height(16.dp)) }
    }
}

/* --------------------------------------------------------------- Gift cards */

@Composable
fun GiftCardsScreen(contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    val netChange = MockData.giftCardsIssuedMonth - MockData.giftCardsRedeemedMonth

    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        item {
            Column(Modifier.padding(16.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Outstanding", Fmt.usd(MockData.giftCardsOutstanding), Modifier.weight(1f), hint = "your liability")
                    StatTile("Active cards", Fmt.num(MockData.giftCardsActive), Modifier.weight(1f), hint = "with a balance")
                }
                Spacer(Modifier.height(10.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Issued", Fmt.usd(MockData.giftCardsIssuedMonth), Modifier.weight(1f), 11.3, "this month")
                    StatTile("Redeemed", Fmt.usd(MockData.giftCardsRedeemedMonth), Modifier.weight(1f), 8.1, "this month")
                }
                Spacer(Modifier.height(12.dp))
                SectionCard {
                    CardHeader("This month", "Issued against redeemed")
                    HBarList(
                        listOf(
                            Triple("Issued", MockData.giftCardsIssuedMonth.toFloat(), Fmt.usd(MockData.giftCardsIssuedMonth)),
                            Triple("Redeemed", MockData.giftCardsRedeemedMonth.toFloat(), Fmt.usd(MockData.giftCardsRedeemedMonth)),
                        ),
                    )
                    Spacer(Modifier.height(14.dp))
                    Column(
                        Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).background(t.ink50).padding(12.dp),
                    ) {
                        Text(
                            "Liability rose ${Fmt.usd(netChange)} this month",
                            style = MaterialTheme.typography.titleSmall, color = t.ink900,
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            "You sold more than guests redeemed. That is cash in hand today, but food you owe later.",
                            style = MaterialTheme.typography.bodySmall, color = t.ink500,
                        )
                    }
                }
            }
        }
        item { SectionLabel("Recent cards") }
        items(MockData.giftCards) { c ->
            Column(Modifier.background(t.surface)) {
                ListRow(
                    title = c.code,
                    subtitle = "Issued ${c.issued} · last used ${c.lastUsed}",
                    leading = {
                        Icon(Icons.Outlined.CardGiftcard, null, tint = t.ink400)
                    },
                    trailingText = Fmt.usdc(c.balance),
                    trailing = {
                        StatusPill(c.status, if (c.status == "Active") Tone.Good else Tone.Neutral)
                    },
                )
                HairlineDivider()
            }
        }
        item { Spacer(Modifier.height(16.dp)) }
    }
}

/* --------------------------------------------------------------- Statements */

@Composable
fun StatementsScreen(onDeposit: (String) -> Unit, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    val totalNet = MockData.deposits.sumOf { it.net }
    val totalFees = MockData.deposits.sumOf { it.fees }
    val totalGross = MockData.deposits.sumOf { it.gross }
    val inTransit = MockData.deposits.filter { it.status != "Paid" }.sumOf { it.net }
    val effective = if (totalGross == 0) 0.0 else totalFees.toDouble() / totalGross * 100

    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        item {
            Column(Modifier.padding(16.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Deposited", Fmt.usd(totalNet), Modifier.weight(1f), hint = "${MockData.deposits.count { it.status == "Paid" }} payouts")
                    StatTile("In transit", Fmt.usd(inTransit), Modifier.weight(1f), hint = "1–2 days")
                }
                Spacer(Modifier.height(10.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Fees", Fmt.usd(totalFees), Modifier.weight(1f), hint = "all brands")
                    StatTile("Effective rate", Fmt.pct(effective, 2), Modifier.weight(1f), hint = "of volume")
                }
                Spacer(Modifier.height(12.dp))
                SectionCard {
                    CardHeader("Daily payouts", "Net deposited to your bank")
                    val rows = MockData.days90.takeLast(30)
                    LineChart(
                        labels = rows.map { it.label },
                        area = true,
                        series = listOf(
                            ChartSeries("Net payout", t.series[0], rows.map { it.gross * 0.974f }),
                        ),
                    )
                }
                Spacer(Modifier.height(12.dp))
                SectionCard {
                    CardHeader("Volume by card brand", "What you are charged on")
                    HBarList(
                        MockData.paymentTypes.filter { it.name != "Cash" && it.name != "Gift card" }.map {
                            Triple(it.name, it.amount.toFloat(), Fmt.usd(it.amount))
                        },
                    )
                }
            }
        }
        item { SectionLabel("Deposits") }
        items(MockData.deposits) { d ->
            Column(Modifier.background(t.surface)) {
                ListRow(
                    title = d.date,
                    subtitle = "${d.batches} ${if (d.batches == 1) "batch" else "batches"} · ${d.account}",
                    trailingText = Fmt.usd(d.net),
                    trailing = {
                        StatusPill(
                            d.status,
                            when (d.status) { "Paid" -> Tone.Good; "In transit" -> Tone.Info; else -> Tone.Warning },
                        )
                    },
                    onClick = { onDeposit(d.id) },
                )
                HairlineDivider()
            }
        }
        item { Spacer(Modifier.height(16.dp)) }
    }
}

@Composable
fun DepositDetailScreen(d: Deposit, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        item {
            Column(Modifier.padding(16.dp)) {
                Column(
                    Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp))
                        .background(t.ink900).padding(18.dp),
                ) {
                    Text("NET DEPOSIT", style = MaterialTheme.typography.labelSmall, color = t.ink300)
                    Spacer(Modifier.height(6.dp))
                    Text(Fmt.usd(d.net), style = MaterialTheme.typography.displaySmall, color = Color.White)
                    Spacer(Modifier.height(6.dp))
                    Text("${d.date} · ${d.account}", style = MaterialTheme.typography.bodySmall, color = t.ink300)
                }
                Spacer(Modifier.height(14.dp))
                SectionCard {
                    KeyValueRow("Gross sales", Fmt.usd(d.gross))
                    KeyValueRow("Processing fees", "(${Fmt.usd(d.fees)})")
                    KeyValueRow("Refunds", if (d.refunds > 0) "(${Fmt.usd(d.refunds)})" else "—")
                    HairlineDivider()
                    Spacer(Modifier.height(8.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Net deposit", style = MaterialTheme.typography.titleMedium, color = t.ink900)
                        Text(Fmt.usd(d.net), style = MaterialTheme.typography.titleMedium, color = t.ink900)
                    }
                }
                Spacer(Modifier.height(14.dp))
                Column(
                    Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).background(t.ink50).padding(12.dp),
                ) {
                    Text(
                        if (d.status == "Paid") "This deposit has settled to your bank account."
                        else "Funds are on the way. Deposits normally land in one to two business days.",
                        style = MaterialTheme.typography.bodySmall, color = t.ink500,
                    )
                }
                Spacer(Modifier.height(16.dp))
            }
        }
    }
}

/* ------------------------------------------------------------------ Devices */

@Composable
fun DevicesScreen(contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    val issues = MockData.devices.filter { it.status != "Online" }

    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        item {
            Column(Modifier.padding(16.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Devices", Fmt.num(MockData.devices.size), Modifier.weight(1f), hint = "paired")
                    StatTile("Online", Fmt.num(MockData.devices.size - issues.size), Modifier.weight(1f), hint = "reporting")
                    StatTile("Attention", Fmt.num(issues.size), Modifier.weight(1f), hint = "need action")
                }
                if (issues.isNotEmpty()) {
                    Spacer(Modifier.height(12.dp))
                    Column(
                        Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp))
                            .background(t.warningBg).padding(14.dp),
                    ) {
                        Text(
                            "${issues.size} devices need attention",
                            style = MaterialTheme.typography.titleSmall, color = t.ink900,
                        )
                        Spacer(Modifier.height(6.dp))
                        issues.forEach { d ->
                            Text(
                                "• ${d.name} — " + if (d.status == "Offline")
                                    "last seen ${d.lastSeen.lowercase()}, check the charging dock."
                                else "load a fresh roll at the expo station.",
                                style = MaterialTheme.typography.bodySmall, color = t.ink700,
                            )
                        }
                    }
                }
            }
        }
        item { SectionLabel("All devices") }
        items(MockData.devices) { d ->
            Column(Modifier.background(t.surface)) {
                ListRow(
                    title = d.name,
                    subtitle = "${d.type} · ${d.serial} · v${d.version}",
                    leading = {
                        Box(
                            Modifier.size(38.dp).clip(RoundedCornerShape(10.dp))
                                .background(if (d.status == "Online") t.ink50 else t.warningBg),
                            contentAlignment = Alignment.Center,
                        ) {
                            Icon(
                                Icons.Outlined.Devices, null,
                                tint = if (d.status == "Online") t.ink500 else t.warning,
                                modifier = Modifier.size(18.dp),
                            )
                        }
                    },
                    trailingSub = d.lastSeen,
                    trailing = {
                        StatusPill(
                            d.status,
                            when (d.status) { "Online" -> Tone.Good; "Offline" -> Tone.Critical; else -> Tone.Warning },
                        )
                    },
                )
                HairlineDivider()
            }
        }
        item { SectionLabel("Printer routing") }
        items(
            listOf(
                "Hot line printer" to "Entrées, Starters (Grill, Sauté, Fry)",
                "Cold station printer" to "Salads, Cold apps, Raw bar",
                "Bar printer" to "Cocktails, Beer, Wine, Non-alcoholic",
                "Expo printer" to "All items — runner ticket",
            ),
        ) { (name, routes) ->
            Column(Modifier.background(t.surface)) {
                ListRow(title = name, subtitle = routes)
                HairlineDivider()
            }
        }
        item { Spacer(Modifier.height(16.dp)) }
    }
}

/* ---------------------------------------------------------- Dashboard users */

@Composable
fun UsersScreen(contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    var expandedRole by remember { mutableStateOf<String?>(null) }

    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        item {
            Column(Modifier.padding(16.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Users", Fmt.num(MockData.dashboardUsers.size), Modifier.weight(1f), hint = "with access")
                    StatTile(
                        "Pending",
                        Fmt.num(MockData.dashboardUsers.count { it.status == "Invited" }),
                        Modifier.weight(1f), hint = "invites",
                    )
                    StatTile("2FA", "Required", Modifier.weight(1f), hint = "enforced")
                }
            }
        }
        item { SectionLabel("Users") }
        items(MockData.dashboardUsers) { u ->
            Column(Modifier.background(t.surface)) {
                ListRow(
                    title = u.name,
                    subtitle = "${u.role} · ${u.locations} of 3 locations · ${u.lastActive}",
                    leading = { Avatar(u.name, 38, t.ink200) },
                    trailing = {
                        StatusPill(u.status, if (u.status == "Active") Tone.Good else Tone.Warning)
                    },
                )
                HairlineDivider()
            }
        }
        item { SectionLabel("What each role can do") }
        items(MockData.roleMatrix.keys.toList()) { role ->
            val open = expandedRole == role
            Column(Modifier.background(t.surface)) {
                ListRow(
                    title = role,
                    subtitle = "${MockData.roleMatrix[role]?.size ?: 0} permissions",
                    onClick = { expandedRole = if (open) null else role },
                    trailing = {
                        Text(
                            if (open) "Hide" else "Show",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.primary,
                        )
                    },
                )
                if (open) {
                    Column(Modifier.padding(start = 16.dp, end = 16.dp, bottom = 12.dp)) {
                        MockData.permissionGroups.forEach { (group, perms) ->
                            Text(
                                group.uppercase(),
                                style = MaterialTheme.typography.labelSmall, color = t.ink300,
                                modifier = Modifier.padding(top = 8.dp, bottom = 4.dp),
                            )
                            perms.forEach { p ->
                                val allowed = MockData.roleMatrix[role]?.contains(p) == true
                                Row(
                                    Modifier.fillMaxWidth().padding(vertical = 2.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    Text(
                                        if (allowed) "✓" else "—",
                                        Modifier.width(20.dp),
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = if (allowed) t.good else t.ink200,
                                    )
                                    Text(
                                        p,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = if (allowed) t.ink700 else t.ink300,
                                    )
                                }
                            }
                        }
                    }
                }
                HairlineDivider()
            }
        }
        item { Spacer(Modifier.height(16.dp)) }
    }
}
