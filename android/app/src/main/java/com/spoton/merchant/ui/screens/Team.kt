package com.spoton.merchant.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.spoton.merchant.data.*
import com.spoton.merchant.ui.components.*
import com.spoton.merchant.ui.theme.SpotOnTheme

private val TEAM_TABS = listOf("Overview", "Roster", "Servers", "Tips")

@Composable
fun TeamScreen(vm: AppViewModel, onEmployee: (String) -> Unit, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    var tab by remember { mutableStateOf("Overview") }
    var query by remember { mutableStateOf("") }

    val slice = vm.slice
    val net = slice.sum { it.net }
    val labor = slice.sum { it.labor }
    val tips = slice.sum { it.tips }
    val lp = laborPct(net, labor)
    val hours = MockData.employees.sumOf { it.hoursWeek }
    val overtime = MockData.employees.sumOf { it.overtime }

    Column(Modifier.fillMaxSize().background(t.canvas)) {
        Column(Modifier.background(t.surface)) {
            FilterChipRow(TEAM_TABS, tab) { tab = it }
            HairlineDivider()
        }

        when (tab) {
            "Overview" -> LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
                item {
                    Column(Modifier.padding(16.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            StatTile("Labor cost", Fmt.usd(labor), Modifier.weight(1f), slice.delta { it.labor }, invertDelta = true)
                            StatTile("Labor %", Fmt.pct(lp), Modifier.weight(1f), lp - LABOR_TARGET, "target ${Fmt.pct(LABOR_TARGET)}", invertDelta = true)
                        }
                        Spacer(Modifier.height(10.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            StatTile("Hours", Fmt.dur(hours * 60), Modifier.weight(1f), hint = "this week")
                            StatTile("Overtime", Fmt.dur(overtime * 60), Modifier.weight(1f), hint = "${MockData.employees.count { it.overtime > 0 }} staff")
                        }
                        Spacer(Modifier.height(10.dp))
                        StatTile(
                            "Sales per labor hour",
                            Fmt.usdc(if (hours == 0.0) 0.0 else net / hours),
                            Modifier.fillMaxWidth(), hint = "revenue efficiency",
                        )
                    }
                }
                item {
                    Column(Modifier.padding(horizontal = 16.dp)) {
                        SectionCard {
                            // Both series are dollars, so they share one axis honestly.
                            CardHeader("Labor cost against sales", "Both in dollars · ${vm.range.label}")
                            LineChart(
                                labels = slice.rows.map { it.label },
                                series = listOf(
                                    ChartSeries("Net sales", t.series[0], slice.rows.map { it.net.toFloat() }),
                                    ChartSeries("Labor cost", t.series[1], slice.rows.map { it.labor.toFloat() }),
                                ),
                            )
                        }
                    }
                }
                item {
                    Column(Modifier.padding(16.dp)) {
                        SectionCard {
                            // The rate gets its own chart rather than a second y-axis.
                            CardHeader("Labor as a share of sales", "Target ${Fmt.pct(LABOR_TARGET)}")
                            BarChart(
                                labels = slice.rows.map { it.label },
                                values = slice.rows.map { laborPct(it.net, it.labor).toFloat() },
                                valueFormat = { Fmt.pct(it.toDouble()) },
                                axisFormat = { "${it.toInt()}%" },
                            )
                            Spacer(Modifier.height(8.dp))
                            val over = slice.rows.count { laborPct(it.net, it.labor) > LABOR_TARGET }
                            Text(
                                "$over of ${slice.rows.size} days ran over target.",
                                style = MaterialTheme.typography.bodySmall, color = t.ink400,
                            )
                        }
                        Spacer(Modifier.height(16.dp))
                    }
                }
            }

            "Roster" -> {
                val filtered = MockData.employees.filter {
                    query.isBlank() || it.name.contains(query, true) || it.role.contains(query, true)
                }
                Column(Modifier.background(t.surface)) {
                    SearchField(query, { query = it }, "Search name or role")
                    HairlineDivider()
                }
                LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
                    items(filtered) { e ->
                        Column(Modifier.background(t.surface)) {
                            ListRow(
                                title = e.name,
                                subtitle = "${e.role} · ${Fmt.usdc(e.hourly)}/hr · ${e.hoursWeek}h" +
                                    if (e.overtime > 0) " · ${e.overtime}h OT" else "",
                                leading = { Avatar(e.name, 38, t.ink200) },
                                trailing = {
                                    StatusPill(
                                        if (e.active) "Active" else "Inactive",
                                        if (e.active) Tone.Good else Tone.Neutral,
                                    )
                                },
                                onClick = { onEmployee(e.id) },
                            )
                            HairlineDivider()
                        }
                    }
                }
            }

            "Servers" -> {
                val sellers = MockData.employees.filter { it.sales > 0 }.sortedByDescending { it.sales }
                LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
                    items(sellers) { e ->
                        Column(Modifier.padding(horizontal = 16.dp).padding(top = 12.dp)) {
                            SectionCard(onClick = { onEmployee(e.id) }) {
                                Row(
                                    Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                ) {
                                    Text(e.name, style = MaterialTheme.typography.titleMedium, color = t.ink900)
                                    Text(Fmt.usd(e.sales), style = MaterialTheme.typography.titleMedium, color = t.ink900)
                                }
                                Spacer(Modifier.height(6.dp))
                                MeterBar(e.sales.toFloat() / sellers.first().sales)
                                Spacer(Modifier.height(8.dp))
                                Text(
                                    "${Fmt.num(e.checks)} checks · ${Fmt.usdc(e.sales.toDouble() / e.checks)} avg · ${Fmt.usd(e.tips)} tips (${Fmt.pct(e.tips.toDouble() / e.sales * 100)})",
                                    style = MaterialTheme.typography.bodySmall, color = t.ink500,
                                )
                            }
                        }
                    }
                    item { Spacer(Modifier.height(16.dp)) }
                }
            }

            else -> {
                val active = MockData.employees.filter { it.active }
                val support = active.count { it.sales == 0 }
                LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
                    item {
                        Column(Modifier.padding(16.dp)) {
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                StatTile("Tips", Fmt.usd(tips), Modifier.weight(1f), slice.delta { it.tips })
                                StatTile("Tip rate", Fmt.pct(if (net == 0) 0.0 else tips.toDouble() / net * 100), Modifier.weight(1f), hint = "of net")
                            }
                            Spacer(Modifier.height(10.dp))
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                StatTile("Pooled", Fmt.usd((tips * 0.35).toInt()), Modifier.weight(1f), hint = "35% support")
                                StatTile("Direct", Fmt.usd((tips * 0.65).toInt()), Modifier.weight(1f), hint = "servers")
                            }
                        }
                    }
                    items(active) { e ->
                        val pool = if (e.sales == 0 && support > 0) tips * 0.35 / support else 0.0
                        Column(Modifier.background(t.surface)) {
                            ListRow(
                                title = e.name,
                                subtitle = "${e.role} · ${e.hoursWeek}h",
                                trailingText = Fmt.usd(e.tips * 0.65 + pool),
                                trailingSub = if (pool > 0) "pool share" else "direct",
                            )
                            HairlineDivider()
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun EmployeeDetailScreen(e: Employee, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        Avatar(e.name, 54)
                        Spacer(Modifier.width(14.dp))
                        Column(Modifier.weight(1f)) {
                            Text(e.name, style = MaterialTheme.typography.titleLarge, color = t.ink900)
                            Text("${e.role} · hired ${e.hiredOn}", style = MaterialTheme.typography.bodySmall, color = t.ink400)
                        }
                        StatusPill(if (e.active) "Active" else "Inactive", if (e.active) Tone.Good else Tone.Neutral)
                    }
                    Spacer(Modifier.height(14.dp))
                    HairlineDivider()
                    Spacer(Modifier.height(10.dp))
                    KeyValueRow("Email", e.email)
                    KeyValueRow("Phone", e.phone)
                    KeyValueRow("Hourly rate", "${Fmt.usdc(e.hourly)}/hr")
                    KeyValueRow("POS PIN", e.pin)
                }
            }
        }
        item {
            Column(Modifier.padding(horizontal = 16.dp)) {
                SectionCard {
                    CardHeader("Job codes", "What they can do at the terminal")
                    Row {
                        e.jobCodes.forEachIndexed { i, j ->
                            if (i > 0) Spacer(Modifier.width(8.dp))
                            StatusPill(j, Tone.Info)
                        }
                    }
                }
            }
        }
        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    CardHeader("This week")
                    KeyValueRow("Hours worked", Fmt.dur(e.hoursWeek * 60))
                    KeyValueRow("Overtime", if (e.overtime > 0) Fmt.dur(e.overtime * 60) else "None")
                    KeyValueRow("Labor cost", Fmt.usd(e.hoursWeek * e.hourly))
                    if (e.sales > 0) {
                        KeyValueRow("Sales rung", Fmt.usd(e.sales))
                        KeyValueRow("Checks", Fmt.num(e.checks))
                        KeyValueRow("Tips earned", Fmt.usd(e.tips))
                    }
                }
                Spacer(Modifier.height(16.dp))
            }
        }
    }
}
