package com.spoton.merchant.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.spoton.merchant.data.*
import com.spoton.merchant.ui.components.*
import com.spoton.merchant.ui.theme.SpotOnTheme

/* ------------------------------------------------------------------ Customers */

private val TIERS = listOf("All", "VIP", "Regular", "Returning", "New")

@Composable
fun CustomersScreen(onCustomer: (String) -> Unit, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    var tier by remember { mutableStateOf("All") }
    var query by remember { mutableStateOf("") }

    val all = MockData.customers
    val filtered = all.filter {
        (tier == "All" || it.tier == tier) &&
            (query.isBlank() || it.name.contains(query, true) || it.email.contains(query, true))
    }
    val totalSpend = all.sumOf { it.spend }
    val optedIn = all.count { it.optIn }

    Column(Modifier.fillMaxSize().background(t.canvas)) {
        Column(Modifier.background(t.surface)) {
            SearchField(query, { query = it }, "Search name or email")
            FilterChipRow(TIERS, tier) { tier = it }
            HairlineDivider()
        }
        LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
            item {
                Column(Modifier.padding(16.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        StatTile("Guests", Fmt.num(all.size), Modifier.weight(1f), hint = "on file")
                        StatTile("Avg. value", Fmt.usd(totalSpend / all.size), Modifier.weight(1f), hint = "lifetime")
                    }
                    Spacer(Modifier.height(10.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        StatTile(
                            "Repeat rate",
                            Fmt.pct(all.count { it.visits > 1 }.toDouble() / all.size * 100),
                            Modifier.weight(1f), hint = "2+ visits",
                        )
                        StatTile(
                            "Opted in",
                            Fmt.pct(optedIn.toDouble() / all.size * 100),
                            Modifier.weight(1f), hint = "$optedIn reachable",
                        )
                    }
                    Spacer(Modifier.height(12.dp))
                    SectionCard {
                        CardHeader("Spend by tier", "Where your revenue comes from")
                        HBarList(
                            listOf("VIP", "Regular", "Returning", "New").map { tr ->
                                val spend = all.filter { it.tier == tr }.sumOf { it.spend }
                                Triple("$tr (${all.count { it.tier == tr }})", spend.toFloat(), Fmt.usd(spend))
                            },
                        )
                    }
                }
            }
            if (filtered.isEmpty()) {
                item { EmptyState("No guests match", "Try a different tier or search term.") }
            }
            items(filtered) { c ->
                Column(Modifier.background(t.surface)) {
                    ListRow(
                        title = c.name,
                        subtitle = "${c.visits} visits · last ${c.lastVisit} · ${Fmt.num(c.loyaltyPoints)} pts",
                        leading = { Avatar(c.name, 38, t.ink200) },
                        trailingText = Fmt.usd(c.spend),
                        trailing = {
                            StatusPill(c.tier, if (c.tier == "VIP") Tone.Brand else Tone.Neutral)
                        },
                        onClick = { onCustomer(c.id) },
                    )
                    HairlineDivider()
                }
            }
        }
    }
}

@Composable
fun CustomerDetailScreen(c: Customer, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Avatar(c.name, 54)
                        Spacer(Modifier.width(14.dp))
                        Column(Modifier.weight(1f)) {
                            Text(c.name, style = MaterialTheme.typography.titleLarge, color = t.ink900)
                            Text(c.email, style = MaterialTheme.typography.bodySmall, color = t.ink400)
                        }
                    }
                    Spacer(Modifier.height(10.dp))
                    Row {
                        StatusPill(c.tier, if (c.tier == "VIP") Tone.Brand else Tone.Info)
                        Spacer(Modifier.width(8.dp))
                        StatusPill(if (c.optIn) "Opted in" else "Not opted in", if (c.optIn) Tone.Good else Tone.Neutral)
                    }
                }
            }
        }
        item {
            Column(Modifier.padding(horizontal = 16.dp)) {
                SectionCard {
                    CardHeader("Guest history")
                    KeyValueRow("Visits", Fmt.num(c.visits))
                    KeyValueRow("Lifetime spend", Fmt.usd(c.spend))
                    KeyValueRow("Average check", Fmt.usdc(c.avgCheck))
                    KeyValueRow("Loyalty points", Fmt.num(c.loyaltyPoints))
                    KeyValueRow("Last visit", c.lastVisit)
                    KeyValueRow("Phone", c.phone)
                }
                Spacer(Modifier.height(14.dp))
                Button(
                    onClick = {}, modifier = Modifier.fillMaxWidth().height(48.dp),
                    shape = RoundedCornerShape(10.dp),
                ) { Text("Send a reward") }
                Spacer(Modifier.height(16.dp))
            }
        }
    }
}

/* -------------------------------------------------------------------- Loyalty */

private val LOYALTY_TABS = listOf("Overview", "Rewards", "Tiers", "Members")

@Composable
fun LoyaltyScreen(contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    var tab by remember { mutableStateOf("Overview") }
    val outstanding = MockData.loyaltyPointsIssued - MockData.loyaltyPointsRedeemed

    Column(Modifier.fillMaxSize().background(t.canvas)) {
        Column(Modifier.background(t.surface)) {
            FilterChipRow(LOYALTY_TABS, tab) { tab = it }
            HairlineDivider()
        }
        when (tab) {
            "Overview" -> LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
                item {
                    Column(Modifier.padding(16.dp)) {
                        Text(
                            MockData.loyaltyProgramName,
                            style = MaterialTheme.typography.titleLarge, color = t.ink900,
                        )
                        Text(MockData.loyaltyEarnRule, style = MaterialTheme.typography.bodyMedium, color = t.ink500)
                        Spacer(Modifier.height(14.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            StatTile("Members", Fmt.num(MockData.loyaltyMembers), Modifier.weight(1f), 7.2, "vs. prior month")
                            StatTile("New", Fmt.num(MockData.loyaltyNewThisMonth), Modifier.weight(1f), 12.4, "this month")
                        }
                        Spacer(Modifier.height(10.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            StatTile("Active rate", Fmt.pct(MockData.loyaltyActiveRate), Modifier.weight(1f), hint = "last 90 days")
                            StatTile("Visit lift", "${MockData.loyaltyVisitLift}×", Modifier.weight(1f), hint = "vs. non-members")
                        }
                        Spacer(Modifier.height(12.dp))
                        SectionCard {
                            CardHeader("Points activity", "Issued against redeemed, all time")
                            HBarList(
                                listOf(
                                    Triple("Issued", MockData.loyaltyPointsIssued.toFloat(), Fmt.num(MockData.loyaltyPointsIssued)),
                                    Triple("Redeemed", MockData.loyaltyPointsRedeemed.toFloat(), Fmt.num(MockData.loyaltyPointsRedeemed)),
                                    Triple("Outstanding", outstanding.toFloat(), Fmt.num(outstanding)),
                                ),
                            )
                            Spacer(Modifier.height(14.dp))
                            Column(
                                Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp))
                                    .background(t.ink50).padding(12.dp),
                            ) {
                                Text(
                                    "${Fmt.pct(MockData.loyaltyPointsRedeemed.toDouble() / MockData.loyaltyPointsIssued * 100)} redemption rate",
                                    style = MaterialTheme.typography.titleSmall, color = t.ink900,
                                )
                                Spacer(Modifier.height(4.dp))
                                Text(
                                    "Outstanding points are a real liability — ${Fmt.usd(outstanding * 0.05)} at your current redemption value.",
                                    style = MaterialTheme.typography.bodySmall, color = t.ink500,
                                )
                            }
                        }
                        Spacer(Modifier.height(16.dp))
                    }
                }
            }

            "Rewards" -> LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
                items(MockData.loyaltyRewards) { r ->
                    Column(Modifier.background(t.surface)) {
                        ListRow(
                            title = r.name,
                            subtitle = "${Fmt.num(r.cost)} points · redeemed ${Fmt.num(r.redeemed)} times",
                            trailing = { Switch(checked = r.active, onCheckedChange = {}) },
                        )
                        HairlineDivider()
                    }
                }
            }

            "Tiers" -> LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
                items(MockData.loyaltyTiers) { tier ->
                    Column(Modifier.padding(horizontal = 16.dp).padding(top = 12.dp)) {
                        SectionCard {
                            Row(
                                Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                            ) {
                                Text(tier.name, style = MaterialTheme.typography.titleMedium, color = t.ink900)
                                StatusPill(
                                    if (tier.threshold == 0) "From enrolment" else "${Fmt.num(tier.threshold)}+ pts",
                                    if (tier.name == "VIP") Tone.Brand else Tone.Neutral,
                                )
                            }
                            Spacer(Modifier.height(8.dp))
                            Text(tier.perk, style = MaterialTheme.typography.bodyMedium, color = t.ink700)
                            Spacer(Modifier.height(6.dp))
                            Text(
                                "${MockData.customers.count { it.loyaltyPoints >= tier.threshold }} guests qualify",
                                style = MaterialTheme.typography.bodySmall, color = t.ink400,
                            )
                        }
                    }
                }
                item { Spacer(Modifier.height(16.dp)) }
            }

            else -> {
                val members = MockData.customers.filter { it.loyaltyPoints > 0 }.sortedByDescending { it.loyaltyPoints }
                LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
                    items(members) { c ->
                        Column(Modifier.background(t.surface)) {
                            ListRow(
                                title = c.name,
                                subtitle = "${c.tier} · ${c.visits} visits · last ${c.lastVisit}",
                                leading = { Avatar(c.name, 38, t.ink200) },
                                trailingText = "${Fmt.num(c.loyaltyPoints)} pts",
                                trailingSub = Fmt.usd(c.spend),
                            )
                            HairlineDivider()
                        }
                    }
                }
            }
        }
    }
}
