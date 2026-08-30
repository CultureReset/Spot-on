package com.spoton.merchant.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowForward
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material.icons.outlined.StarBorder
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.spoton.merchant.data.*
import com.spoton.merchant.nav.Dest
import com.spoton.merchant.ui.components.*
import com.spoton.merchant.ui.theme.SpotOnTheme

@Composable
fun HomeScreen(
    vm: AppViewModel,
    onOpen: (Dest) -> Unit,
    onOrder: (String) -> Unit,
    contentPadding: PaddingValues,
) {
    val t = SpotOnTheme.tokens
    val slice = vm.slice
    val net = slice.sum { it.net }
    val orders = slice.sum { it.orders }
    val guests = slice.sum { it.guests }
    val labor = slice.sum { it.labor }
    val tips = slice.sum { it.tips }
    val lp = laborPct(net, labor)
    val prevLp = laborPct(slice.prevSum { it.net }, slice.prevSum { it.labor })

    LazyColumn(
        Modifier.fillMaxSize().background(t.canvas),
        contentPadding = contentPadding,
    ) {
        item {
            Column(Modifier.padding(16.dp)) {
                val greeting = remember {
                    when (java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)) {
                        in 0..11 -> "Good morning"
                        in 12..17 -> "Good afternoon"
                        else -> "Good evening"
                    }
                }
                Text(
                    "$greeting, ${vm.user?.name?.substringBefore(' ') ?: "there"}",
                    style = MaterialTheme.typography.headlineMedium,
                    color = t.ink900,
                )
                Spacer(Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(7.dp).clip(CircleShape).background(t.good))
                    Spacer(Modifier.width(6.dp))
                    Text(
                        "${vm.location.shortName} is open · ${MockData.todayLong}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = t.ink500,
                    )
                }
            }
        }

        // ------------------------------------------------------------- KPIs
        item {
            Column(Modifier.padding(horizontal = 16.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Net sales", Fmt.usd(net), Modifier.weight(1f), slice.delta { it.net }, "vs. prior")
                    StatTile("Orders", Fmt.num(orders), Modifier.weight(1f), slice.delta { it.orders }, "vs. prior")
                }
                Spacer(Modifier.height(10.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Avg. ticket", Fmt.usdc(avgTicket(net, orders)), Modifier.weight(1f), hint = "per order")
                    StatTile(
                        "Labor %", Fmt.pct(lp), Modifier.weight(1f),
                        delta = lp - prevLp, hint = "target ${Fmt.pct(LABOR_TARGET)}", invertDelta = true,
                    )
                }
                Spacer(Modifier.height(10.dp))
                StatTile(
                    "Guests", Fmt.num(guests), Modifier.fillMaxWidth(),
                    slice.delta { it.guests },
                    "${Fmt.usdc(if (guests == 0) 0.0 else net.toDouble() / guests)} per guest",
                )
            }
        }

        // --------------------------------------------------------- insights
        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    CardHeader(
                        "Insights",
                        "Patterns worth acting on, from this location's data",
                        trailing = { StatusPill("Profit Assist", Tone.Info) },
                    )
                    MockData.insights.forEachIndexed { i, ins ->
                        if (i > 0) Spacer(Modifier.height(10.dp))
                        val bg = when (ins.tone) {
                            "warning" -> t.warningBg
                            "good" -> t.goodBg
                            else -> t.ink50
                        }
                        Column(
                            Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(bg)
                                .padding(12.dp),
                        ) {
                            Row(verticalAlignment = Alignment.Top) {
                                Icon(
                                    Icons.Outlined.AutoAwesome, null,
                                    tint = t.ink500, modifier = Modifier.size(16.dp).padding(top = 2.dp),
                                )
                                Spacer(Modifier.width(8.dp))
                                Text(
                                    ins.title,
                                    style = MaterialTheme.typography.bodyLarge,
                                    fontWeight = FontWeight.SemiBold,
                                    color = t.ink900,
                                )
                            }
                            Spacer(Modifier.height(6.dp))
                            Text(ins.body, style = MaterialTheme.typography.bodySmall, color = t.ink500)
                            Spacer(Modifier.height(8.dp))
                            TextButton(
                                onClick = {
                                    Dest.entries.firstOrNull { it.route == ins.route }?.let(onOpen)
                                },
                                contentPadding = PaddingValues(0.dp),
                            ) {
                                Text(ins.action, style = MaterialTheme.typography.labelMedium)
                                Spacer(Modifier.width(4.dp))
                                Icon(Icons.AutoMirrored.Outlined.ArrowForward, null, Modifier.size(14.dp))
                            }
                        }
                    }
                }
            }
        }

        // ------------------------------------------------------- net sales
        item {
            Column(Modifier.padding(horizontal = 16.dp)) {
                SectionCard {
                    CardHeader(
                        "Net sales",
                        "${vm.range.label} against the prior period",
                        trailing = { DeltaChip(slice.delta { it.net }) },
                    )
                    LineChart(
                        labels = slice.rows.map { it.label },
                        area = true,
                        series = listOf(
                            ChartSeries("This period", t.series[0], slice.rows.map { it.net.toFloat() }),
                            ChartSeries(
                                "Prior period", t.ink300,
                                slice.rows.indices.map { slice.prev.getOrNull(it)?.net?.toFloat() ?: 0f },
                            ),
                        ),
                    )
                }
            }
        }

        // ---------------------------------------------------- sales by hour
        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    CardHeader("Sales by hour", "Today, 8am – 11pm")
                    BarChart(
                        labels = MockData.hourly.map { it.label },
                        values = MockData.hourly.map { it.net.toFloat() },
                        highlightMax = true,
                    )
                    Spacer(Modifier.height(8.dp))
                    val dinner = MockData.hourly.filter { it.hour >= 17 }.sumOf { it.net }
                    val all = MockData.hourly.sumOf { it.net }
                    Text(
                        "Dinner service carries ${Fmt.pct(dinner.toDouble() / all * 100)} of the day.",
                        style = MaterialTheme.typography.bodySmall,
                        color = t.ink400,
                    )
                }
            }
        }

        // ---------------------------------------------------- order channels
        item {
            Column(Modifier.padding(horizontal = 16.dp)) {
                SectionCard {
                    CardHeader("Order channels", "Share of net sales · ${vm.range.label}")
                    Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                        DonutChart(
                            segments = MockData.channels.map {
                                Triple(it.name, it.net.toFloat(), t.series[it.colorIndex])
                            },
                            centerValue = Fmt.usdShort(MockData.channels.sumOf { it.net }),
                            centerLabel = "net sales",
                        )
                    }
                    Spacer(Modifier.height(12.dp))
                    MockData.channels.forEach { c ->
                        Row(
                            Modifier.fillMaxWidth().padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Box(
                                Modifier.size(9.dp).clip(RoundedCornerShape(2.dp))
                                    .background(t.series[c.colorIndex]),
                            )
                            Spacer(Modifier.width(8.dp))
                            Text(c.name, style = MaterialTheme.typography.bodyMedium, color = t.ink700, modifier = Modifier.weight(1f))
                            Text(Fmt.usd(c.net), style = MaterialTheme.typography.bodyMedium, color = t.ink900)
                            Spacer(Modifier.width(8.dp))
                            Text("${Fmt.num(c.orders)}", style = MaterialTheme.typography.bodySmall, color = t.ink300)
                        }
                    }
                }
            }
        }

        // -------------------------------------------------------- top items
        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    CardHeader(
                        "Top selling items", "By net sales · ${vm.range.label}",
                        trailing = { TextButton({ onOpen(Dest.Menus) }) { Text("Menus") } },
                    )
                    HBarList(
                        MockData.menuItems.take(6).map {
                            Triple(it.name, it.net.toFloat(), Fmt.usd(it.net))
                        },
                    )
                }
            }
        }

        // ----------------------------------------------------- recent orders
        item {
            Column(Modifier.padding(horizontal = 16.dp)) {
                SectionCard(contentPadding = PaddingValues(vertical = 12.dp)) {
                    Box(Modifier.padding(horizontal = 16.dp)) {
                        CardHeader(
                            "Recent orders", "Live from the point of sale",
                            trailing = { TextButton({ onOpen(Dest.Orders) }) { Text("All") } },
                        )
                    }
                    MockData.orders.take(5).forEach { o ->
                        ListRow(
                            title = "${o.ticket}  ·  ${o.channel}",
                            subtitle = "${o.server} · ${o.time}",
                            leading = {
                                Box(
                                    Modifier.size(38.dp).clip(RoundedCornerShape(10.dp)).background(t.ink50),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    Text(
                                        if (o.channel == "Dine-in") o.table else o.channel.take(2).uppercase(),
                                        style = MaterialTheme.typography.labelSmall, color = t.ink500,
                                    )
                                }
                            },
                            trailingText = Fmt.usdc(o.total),
                            trailing = {
                                StatusPill(
                                    o.status,
                                    when (o.status) {
                                        "Paid" -> Tone.Good; "Open" -> Tone.Info; else -> Tone.Critical
                                    },
                                )
                            },
                            onClick = { onOrder(o.id) },
                        )
                    }
                }
            }
        }

        // ------------------------------------------- guests / campaigns / reviews
        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard(onClick = { onOpen(Dest.Customers) }) {
                    CardHeader("Customers", "Guest activity this period")
                    Row(Modifier.fillMaxWidth()) {
                        listOf(
                            "New" to MockData.customers.count { it.tier == "New" },
                            "Returning" to MockData.customers.count { it.tier != "New" },
                            "Loyalty" to MockData.loyaltyMembers,
                        ).forEach { (label, value) ->
                            Column(Modifier.weight(1f)) {
                                Text(Fmt.num(value), style = MaterialTheme.typography.headlineSmall, color = t.ink900)
                                Text(label, style = MaterialTheme.typography.bodySmall, color = t.ink400)
                            }
                        }
                    }
                }
                Spacer(Modifier.height(12.dp))
                SectionCard(onClick = { onOpen(Dest.Reviews) }) {
                    CardHeader("Reviews", "Google, Yelp, Facebook and SpotOn")
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            "${MockData.reviewAverage}",
                            style = MaterialTheme.typography.displaySmall, color = t.ink900,
                        )
                        Spacer(Modifier.width(12.dp))
                        Column {
                            StarRow(MockData.reviewAverage.toInt())
                            Text(
                                "${Fmt.num(MockData.reviewTotal)} reviews · ${MockData.reviews.count { !it.replied }} awaiting a reply",
                                style = MaterialTheme.typography.bodySmall, color = t.ink400,
                            )
                        }
                    }
                }
                Spacer(Modifier.height(12.dp))
                Text(
                    "${Fmt.usd(tips)} in tips collected · ${Fmt.usd(net + tips)} total collected",
                    style = MaterialTheme.typography.bodySmall,
                    color = t.ink400,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
    }
}

@Composable
fun StarRow(rating: Int, size: Int = 15) {
    val t = SpotOnTheme.tokens
    Row {
        (1..5).forEach { s ->
            Icon(
                if (s <= rating) Icons.Filled.Star else Icons.Outlined.StarBorder,
                null,
                tint = if (s <= rating) t.series[3] else t.ink200,
                modifier = Modifier.size(size.dp),
            )
        }
    }
}
