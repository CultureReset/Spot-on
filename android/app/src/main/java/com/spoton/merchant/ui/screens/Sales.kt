package com.spoton.merchant.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.spoton.merchant.data.*
import com.spoton.merchant.ui.components.*
import com.spoton.merchant.ui.theme.SpotOnTheme

private val METRICS = listOf("Net sales", "Orders", "Guests", "Avg. ticket")
private val DAYS = listOf("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat")
private val PARTS = listOf("Breakfast", "Lunch", "Happy hr", "Dinner", "Late")

@Composable
fun SalesScreen(vm: AppViewModel, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    val slice = vm.slice
    var metric by remember { mutableStateOf(METRICS.first()) }

    val net = slice.sum { it.net }
    val gross = slice.sum { it.gross }
    val orders = slice.sum { it.orders }
    val guests = slice.sum { it.guests }
    val tips = slice.sum { it.tips }
    val tax = (net * 0.08625).toInt()

    fun value(d: DayPoint): Float = when (metric) {
        "Net sales" -> d.net.toFloat()
        "Orders" -> d.orders.toFloat()
        "Guests" -> d.guests.toFloat()
        else -> avgTicket(d.net, d.orders).toFloat()
    }
    val fmtValue: (Float) -> String = when (metric) {
        "Net sales" -> { v -> Fmt.usd(v.toInt()) }
        "Avg. ticket" -> { v -> Fmt.usdc(v) }
        else -> { v -> Fmt.num(v.toInt()) }
    }
    val fmtAxis: (Float) -> String = when (metric) {
        "Net sales" -> { v -> Fmt.usdShort(v.toInt()) }
        "Avg. ticket" -> { v -> Fmt.usd(v.toInt()) }
        else -> { v -> Fmt.num(v.toInt()) }
    }

    // weekday x day-part average over the whole history, so the pattern is stable
    val heat = remember {
        val share = listOf(0.07, 0.24, 0.13, 0.44, 0.12)
        val grid = MutableList(7) { MutableList(5) { 0f } }
        MockData.days90.forEach { d ->
            share.forEachIndexed { i, s -> grid[d.dayOfWeek][i] += (d.net * s).toFloat() }
        }
        grid.map { row -> row.map { it / 13f } }
    }

    val byCategory = remember {
        MockData.menuCategories.map { c ->
            c to MockData.menuItems.filter { it.category == c }.sumOf { it.net }
        }.sortedByDescending { it.second }
    }

    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        item {
            Column(Modifier.padding(16.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Net sales", Fmt.usd(net), Modifier.weight(1f), slice.delta { it.net })
                    StatTile("Gross sales", Fmt.usd(gross), Modifier.weight(1f), slice.delta { it.gross })
                }
                Spacer(Modifier.height(10.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Orders", Fmt.num(orders), Modifier.weight(1f), slice.delta { it.orders })
                    StatTile("Guests", Fmt.num(guests), Modifier.weight(1f), slice.delta { it.guests })
                }
                Spacer(Modifier.height(10.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Avg. ticket", Fmt.usdc(avgTicket(net, orders)), Modifier.weight(1f), hint = "per order")
                    StatTile(
                        "Per guest",
                        Fmt.usdc(if (guests == 0) 0.0 else net.toDouble() / guests),
                        Modifier.weight(1f), hint = "per cover",
                    )
                }
            }
        }

        item {
            Column(Modifier.padding(horizontal = 16.dp)) {
                SectionCard {
                    CardHeader("Trend", "Against the equivalent prior period")
                    FilterChipRowInline(METRICS, metric) { metric = it }
                    Spacer(Modifier.height(10.dp))
                    LineChart(
                        labels = slice.rows.map { it.label },
                        area = true,
                        valueFormat = fmtValue,
                        axisFormat = fmtAxis,
                        series = listOf(
                            ChartSeries("This period", t.series[0], slice.rows.map { value(it) }),
                            ChartSeries(
                                "Prior period", t.ink300,
                                slice.rows.indices.map { i -> slice.prev.getOrNull(i)?.let { value(it) } ?: 0f },
                            ),
                        ),
                    )
                }
            }
        }

        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    CardHeader("Sales by hour", "Where the day's revenue lands")
                    BarChart(
                        labels = MockData.hourly.map { it.label },
                        values = MockData.hourly.map { it.net.toFloat() },
                    )
                }
            }
        }

        item {
            Column(Modifier.padding(horizontal = 16.dp)) {
                SectionCard {
                    CardHeader("Day part by weekday", "Average net sales · trailing 90 days")
                    HeatGrid(DAYS, PARTS, heat)
                }
            }
        }

        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    CardHeader("By order channel", vm.range.label)
                    HBarList(
                        MockData.channels.map {
                            Triple(it.name, it.net.toFloat(), Fmt.usd(it.net))
                        },
                    )
                }
                Spacer(Modifier.height(12.dp))
                SectionCard {
                    CardHeader("By menu category", vm.range.label)
                    HBarList(
                        byCategory.take(7).map {
                            Triple(it.first, it.second.toFloat(), Fmt.usd(it.second))
                        },
                    )
                }
                Spacer(Modifier.height(12.dp))
                SectionCard {
                    CardHeader("By payment type", vm.range.label)
                    HBarList(
                        MockData.paymentTypes.map {
                            Triple(it.name, it.amount.toFloat(), Fmt.usd(it.amount))
                        },
                    )
                }
            }
        }

        item {
            Column(Modifier.padding(horizontal = 16.dp, vertical = 4.dp)) {
                SectionCard {
                    CardHeader("Sales summary", "How gross sales reconcile to what you were paid")
                    listOf(
                        Triple("Gross sales", gross, false),
                        Triple("Discounts", -slice.sum { it.discounts }, false),
                        Triple("Comps", -slice.sum { it.comps }, false),
                        Triple("Refunds", -slice.sum { it.refunds }, false),
                        Triple("Net sales", net, true),
                        Triple("Sales tax", tax, false),
                        Triple("Tips", tips, false),
                        Triple("Total collected", net + tax + tips, true),
                    ).forEach { (label, amount, strong) ->
                        Row(
                            Modifier.fillMaxWidth().padding(vertical = 6.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                        ) {
                            Text(
                                label,
                                style = if (strong) MaterialTheme.typography.titleSmall
                                        else MaterialTheme.typography.bodyMedium,
                                color = if (strong) t.ink900 else t.ink500,
                            )
                            Text(
                                if (amount < 0) "(${Fmt.usd(-amount)})" else Fmt.usd(amount),
                                style = if (strong) MaterialTheme.typography.titleSmall
                                        else MaterialTheme.typography.bodyMedium,
                                color = t.ink900,
                            )
                        }
                        if (strong) HairlineDivider()
                    }
                }
                Spacer(Modifier.height(16.dp))
            }
        }
    }
}

/** Chip row used inside a card, where the page-level filter row would be wrong. */
@Composable
fun FilterChipRowInline(options: List<String>, selected: String, onSelect: (String) -> Unit) {
    val t = SpotOnTheme.tokens
    Row(
        Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState()),
    ) {
        options.forEachIndexed { i, o ->
            if (i > 0) Spacer(Modifier.width(6.dp))
            FilterChip(
                selected = o == selected,
                onClick = { onSelect(o) },
                label = { Text(o, style = MaterialTheme.typography.labelMedium) },
                colors = FilterChipDefaults.filterChipColors(
                    containerColor = t.ink50,
                    labelColor = t.ink500,
                    selectedContainerColor = t.ink900,
                    selectedLabelColor = androidx.compose.ui.graphics.Color.White,
                ),
                border = null,
            )
        }
    }
}
