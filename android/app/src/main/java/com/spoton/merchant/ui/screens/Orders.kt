package com.spoton.merchant.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Print
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.spoton.merchant.data.*
import com.spoton.merchant.ui.components.*
import com.spoton.merchant.ui.theme.SpotOnTheme

private val STATUS_TABS = listOf("All", "Open", "Paid", "Refunded", "Voided")

fun orderTone(status: String) = when (status) {
    "Paid" -> Tone.Good
    "Open" -> Tone.Info
    "Refunded" -> Tone.Warning
    else -> Tone.Critical
}

@Composable
fun OrdersScreen(onOrder: (String) -> Unit, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    var tab by remember { mutableStateOf("All") }
    var query by remember { mutableStateOf("") }

    val filtered = MockData.orders.filter {
        (tab == "All" || it.status == tab) &&
            (query.isBlank() || it.ticket.contains(query, true) ||
                it.server.contains(query, true) || it.table.contains(query, true))
    }
    val sales = filtered.sumOf { it.subtotal }
    val tips = filtered.sumOf { it.tip }

    Column(Modifier.fillMaxSize().background(t.canvas)) {
        Column(Modifier.background(t.surface)) {
            SearchField(query, { query = it }, "Search ticket, server or table")
            FilterChipRow(STATUS_TABS, tab) { tab = it }
            HairlineDivider()
        }
        LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
            item {
                Row(
                    Modifier.padding(16.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    StatTile("Orders", Fmt.num(filtered.size), Modifier.weight(1f), hint = "matching")
                    StatTile("Sales", Fmt.usd(sales), Modifier.weight(1f), hint = "before tax")
                    StatTile("Tips", Fmt.usd(tips), Modifier.weight(1f), hint = "collected")
                }
            }
            if (filtered.isEmpty()) {
                item { EmptyState("No orders match", "Try clearing the search or switching tabs.") }
            }
            items(filtered) { o ->
                Column(Modifier.background(t.surface)) {
                    ListRow(
                        title = "${o.ticket}  ·  ${o.channel}",
                        subtitle = "${o.server} · ${o.time} · ${o.items} items",
                        leading = {
                            Box(
                                Modifier.size(40.dp).clip(RoundedCornerShape(10.dp)).background(t.ink50),
                                contentAlignment = Alignment.Center,
                            ) {
                                Text(
                                    if (o.channel == "Dine-in") o.table else o.channel.take(2).uppercase(),
                                    style = MaterialTheme.typography.labelSmall, color = t.ink500,
                                )
                            }
                        },
                        trailingText = Fmt.usdc(o.total),
                        trailing = { StatusPill(o.status, orderTone(o.status)) },
                        onClick = { onOrder(o.id) },
                    )
                    HairlineDivider()
                }
            }
        }
    }
}

@Composable
fun OrderDetailScreen(order: Order, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    LazyColumn(
        Modifier.fillMaxSize().background(t.canvas),
        contentPadding = contentPadding,
    ) {
        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        StatusPill(order.status, orderTone(order.status))
                        Text(order.time, style = MaterialTheme.typography.bodySmall, color = t.ink400)
                    }
                    Spacer(Modifier.height(14.dp))
                    Text(Fmt.usdc(order.total), style = MaterialTheme.typography.displaySmall, color = t.ink900)
                    Text("Ticket ${order.ticket}", style = MaterialTheme.typography.bodyMedium, color = t.ink500)
                    Spacer(Modifier.height(14.dp))
                    HairlineDivider()
                    Spacer(Modifier.height(10.dp))
                    KeyValueRow("Channel", order.channel)
                    KeyValueRow("Table", order.table)
                    KeyValueRow("Server", order.server)
                    KeyValueRow("Payment", order.payment)
                }
            }
        }
        item {
            Column(Modifier.padding(horizontal = 16.dp)) {
                SectionCard(contentPadding = PaddingValues(vertical = 12.dp)) {
                    Box(Modifier.padding(horizontal = 16.dp)) {
                        CardHeader("Items", "${order.items} on this ticket")
                    }
                    MockData.menuItems.take(order.items).forEachIndexed { i, m ->
                        val qty = (i % 2) + 1
                        ListRow(
                            title = "${qty}× ${m.name}",
                            subtitle = m.modifiers.joinToString(" · ").ifBlank { null },
                            trailingText = Fmt.usdc(m.price * qty),
                        )
                    }
                }
            }
        }
        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    KeyValueRow("Subtotal", Fmt.usdc(order.subtotal))
                    KeyValueRow("Tax", Fmt.usdc(order.tax))
                    KeyValueRow("Tip", Fmt.usdc(order.tip))
                    HairlineDivider()
                    Spacer(Modifier.height(8.dp))
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text("Total", style = MaterialTheme.typography.titleMedium, color = t.ink900)
                        Text(Fmt.usdc(order.total), style = MaterialTheme.typography.titleMedium, color = t.ink900)
                    }
                }
                Spacer(Modifier.height(14.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedButton(
                        onClick = {}, modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(10.dp),
                    ) {
                        Icon(Icons.Outlined.Print, null, Modifier.size(17.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Reprint")
                    }
                    Button(
                        onClick = {}, modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = t.criticalBg, contentColor = t.critical,
                        ),
                    ) { Text("Refund") }
                }
                Spacer(Modifier.height(16.dp))
            }
        }
    }
}

@Composable
fun SearchField(value: String, onChange: (String) -> Unit, placeholder: String) {
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        placeholder = { Text(placeholder, style = MaterialTheme.typography.bodyMedium) },
        leadingIcon = {
            Icon(
                Icons.Outlined.Search, null,
                tint = SpotOnTheme.tokens.ink300,
            )
        },
        singleLine = true,
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
        shape = RoundedCornerShape(10.dp),
    )
}
