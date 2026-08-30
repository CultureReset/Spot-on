package com.spoton.merchant.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.spoton.merchant.data.*
import com.spoton.merchant.ui.components.*
import com.spoton.merchant.ui.theme.SpotOnTheme

/* -------------------------------------------------------------- Reservations */

private val RES_TABS = listOf("Today", "Waitlist", "Floor plan")

private val FLOOR = listOf(
    "Dining room" to (1..14).map { "T$it" },
    "Patio" to (15..22).map { "T$it" },
    "Bar" to (23..28).map { "T$it" },
    "Private" to (29..32).map { "T$it" },
)

fun reservationTone(status: String) = when (status) {
    "Seated" -> Tone.Good
    "Confirmed" -> Tone.Info
    "Waitlist" -> Tone.Warning
    "No-show" -> Tone.Critical
    else -> Tone.Neutral
}

@Composable
fun ReservationsScreen(onNew: () -> Unit, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    var tab by remember { mutableStateOf("Today") }
    val covers = MockData.reservations.sumOf { it.party }
    val seated = MockData.reservations.filter { it.status == "Seated" }
    val occupied = seated.map { it.table }.toSet()

    Column(Modifier.fillMaxSize().background(t.canvas)) {
        Column(Modifier.background(t.surface)) {
            FilterChipRow(RES_TABS, tab) { tab = it }
            HairlineDivider()
        }
        when (tab) {
            "Today" -> LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
                item {
                    Column(Modifier.padding(16.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            StatTile("Bookings", Fmt.num(MockData.reservations.size), Modifier.weight(1f), hint = "tonight")
                            StatTile("Covers", Fmt.num(covers), Modifier.weight(1f), hint = "guests")
                            StatTile("Seated", Fmt.num(seated.size), Modifier.weight(1f), hint = "now")
                        }
                    }
                }
                items(MockData.reservations) { r ->
                    Column(Modifier.background(t.surface)) {
                        ListRow(
                            title = "${r.time}  ·  ${r.name}",
                            subtitle = "Party of ${r.party} · ${r.table}" + if (r.notes.isNotBlank()) " · ${r.notes}" else "",
                            trailing = { StatusPill(r.status, reservationTone(r.status)) },
                        )
                        HairlineDivider()
                    }
                }
                item {
                    Column(Modifier.padding(16.dp)) {
                        Button(
                            onClick = onNew,
                            modifier = Modifier.fillMaxWidth().height(50.dp),
                            shape = RoundedCornerShape(10.dp),
                        ) { Text("Add reservation") }
                        Spacer(Modifier.height(16.dp))
                    }
                }
            }

            "Waitlist" -> LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
                if (MockData.waitlist.isEmpty()) {
                    item { EmptyState("Nobody waiting", "Walk-ins added at the host stand show up here.") }
                }
                items(MockData.waitlist) { w ->
                    val over = w.waiting > w.quoted
                    Column(Modifier.padding(horizontal = 16.dp).padding(top = 12.dp)) {
                        SectionCard {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    Modifier.size(42.dp).clip(RoundedCornerShape(10.dp)).background(t.ink900),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    Text(
                                        "${w.party}",
                                        style = MaterialTheme.typography.titleMedium, color = Color.White,
                                    )
                                }
                                Spacer(Modifier.width(12.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(w.name, style = MaterialTheme.typography.titleSmall, color = t.ink900)
                                    Text(
                                        "Party of ${w.party} · ${w.phone}",
                                        style = MaterialTheme.typography.bodySmall, color = t.ink400,
                                    )
                                }
                                Column(horizontalAlignment = Alignment.End) {
                                    Text(
                                        Fmt.dur(w.waiting.toDouble()),
                                        style = MaterialTheme.typography.titleSmall,
                                        color = if (over) t.critical else t.ink900,
                                    )
                                    Text(
                                        "quoted ${Fmt.dur(w.quoted.toDouble())}",
                                        style = MaterialTheme.typography.bodySmall, color = t.ink400,
                                    )
                                }
                            }
                            if (over) {
                                Spacer(Modifier.height(8.dp))
                                Text(
                                    "Over the quoted wait — worth a check-in.",
                                    style = MaterialTheme.typography.bodySmall, color = t.critical,
                                )
                            }
                            Spacer(Modifier.height(10.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                OutlinedButton(
                                    {}, Modifier.weight(1f), shape = RoundedCornerShape(10.dp),
                                ) { Text("Text") }
                                Button(
                                    {}, Modifier.weight(1f), shape = RoundedCornerShape(10.dp),
                                ) { Text("Seat") }
                            }
                        }
                    }
                }
                item { Spacer(Modifier.height(16.dp)) }
            }

            else -> LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
                item {
                    Row(
                        Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Box(Modifier.size(12.dp).clip(RoundedCornerShape(3.dp)).background(t.good))
                        Spacer(Modifier.width(6.dp))
                        Text("Occupied", style = MaterialTheme.typography.bodySmall, color = t.ink500)
                        Spacer(Modifier.width(16.dp))
                        Box(
                            Modifier.size(12.dp).clip(RoundedCornerShape(3.dp)).background(t.ink100),
                        )
                        Spacer(Modifier.width(6.dp))
                        Text("Open", style = MaterialTheme.typography.bodySmall, color = t.ink500)
                    }
                }
                FLOOR.forEach { (section, tables) ->
                    item {
                        Column(Modifier.padding(horizontal = 16.dp)) {
                            Text(
                                "$section — ${tables.count { it in occupied }} of ${tables.size} in use",
                                style = MaterialTheme.typography.labelMedium, color = t.ink400,
                            )
                            Spacer(Modifier.height(8.dp))
                            // a plain grid of tables; each cell names its state in text too
                            tables.chunked(4).forEach { row ->
                                Row(
                                    Modifier.fillMaxWidth().padding(bottom = 8.dp),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                ) {
                                    row.forEach { table ->
                                        val res = seated.firstOrNull { it.table == table }
                                        Column(
                                            Modifier
                                                .weight(1f)
                                                .height(58.dp)
                                                .clip(RoundedCornerShape(10.dp))
                                                .background(if (res != null) t.good else t.ink50),
                                            verticalArrangement = Arrangement.Center,
                                            horizontalAlignment = Alignment.CenterHorizontally,
                                        ) {
                                            Text(
                                                table,
                                                style = MaterialTheme.typography.titleSmall,
                                                color = if (res != null) Color.White else t.ink500,
                                            )
                                            Text(
                                                if (res != null) "${res.party} top" else "open",
                                                style = MaterialTheme.typography.labelSmall,
                                                color = if (res != null) Color.White else t.ink300,
                                            )
                                        }
                                    }
                                    repeat(4 - row.size) { Spacer(Modifier.weight(1f)) }
                                }
                            }
                            Spacer(Modifier.height(8.dp))
                        }
                    }
                }
                item { Spacer(Modifier.height(16.dp)) }
            }
        }
    }
}

@Composable
fun ReservationComposerScreen(contentPadding: PaddingValues, onDone: () -> Unit) {
    val t = SpotOnTheme.tokens
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var party by remember { mutableStateOf("2") }
    var section by remember { mutableStateOf("Dining room") }
    var notes by remember { mutableStateOf("") }

    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    CardHeader("Guest")
                    OutlinedTextField(
                        name, { name = it }, label = { Text("Full name") },
                        modifier = Modifier.fillMaxWidth(), singleLine = true,
                        shape = RoundedCornerShape(10.dp),
                    )
                    Spacer(Modifier.height(10.dp))
                    OutlinedTextField(
                        phone, { phone = it }, label = { Text("Phone") },
                        modifier = Modifier.fillMaxWidth(), singleLine = true,
                        shape = RoundedCornerShape(10.dp),
                    )
                }
                Spacer(Modifier.height(12.dp))
                SectionCard {
                    CardHeader("Table")
                    OutlinedTextField(
                        party, { party = it }, label = { Text("Party size") },
                        modifier = Modifier.fillMaxWidth(), singleLine = true,
                        shape = RoundedCornerShape(10.dp),
                    )
                    Spacer(Modifier.height(10.dp))
                    Text("Section", style = MaterialTheme.typography.titleSmall, color = t.ink700)
                    Spacer(Modifier.height(6.dp))
                    FilterChipRowInline(FLOOR.map { it.first }, section) { section = it }
                }
                Spacer(Modifier.height(12.dp))
                SectionCard {
                    CardHeader("Notes", "Allergies and occasions reach the host stand")
                    OutlinedTextField(
                        notes, { notes = it },
                        placeholder = { Text("Anniversary, window seat if possible") },
                        modifier = Modifier.fillMaxWidth().height(100.dp),
                        shape = RoundedCornerShape(10.dp),
                    )
                }
                Spacer(Modifier.height(14.dp))
                Button(
                    onClick = onDone,
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape = RoundedCornerShape(10.dp),
                ) { Text("Book table") }
                Spacer(Modifier.height(16.dp))
            }
        }
    }
}

/* ----------------------------------------------------------------- Reporting */

@Composable
fun ReportingScreen(onReport: (String) -> Unit, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    var query by remember { mutableStateOf("") }
    val groups = MockData.reportCatalog
        .map { g -> g.copy(items = g.items.filter { it.contains(query, true) }) }
        .filter { it.items.isNotEmpty() }

    Column(Modifier.fillMaxSize().background(t.canvas)) {
        Column(Modifier.background(t.surface)) {
            SearchField(query, { query = it }, "Search ${MockData.reportCount} reports")
            HairlineDivider()
        }
        LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
            if (query.isBlank()) {
                item {
                    Column(Modifier.padding(16.dp)) {
                        Text("Pinned", style = MaterialTheme.typography.labelMedium, color = t.ink400)
                        Spacer(Modifier.height(8.dp))
                        MockData.pinnedReports.chunked(2).forEach { row ->
                            Row(
                                Modifier.fillMaxWidth().padding(bottom = 10.dp),
                                horizontalArrangement = Arrangement.spacedBy(10.dp),
                            ) {
                                row.forEach { r ->
                                    Surface(
                                        onClick = { onReport(r) },
                                        modifier = Modifier.weight(1f).height(74.dp),
                                        shape = RoundedCornerShape(12.dp),
                                        color = t.surface,
                                        border = androidx.compose.foundation.BorderStroke(1.dp, t.hairline),
                                    ) {
                                        Column(
                                            Modifier.padding(12.dp),
                                            verticalArrangement = Arrangement.Center,
                                        ) {
                                            Text(
                                                r, style = MaterialTheme.typography.titleSmall,
                                                color = t.ink900, maxLines = 2,
                                            )
                                            Text(
                                                "Updated just now",
                                                style = MaterialTheme.typography.labelSmall, color = t.ink300,
                                            )
                                        }
                                    }
                                }
                                if (row.size == 1) Spacer(Modifier.weight(1f))
                            }
                        }
                    }
                }
            }
            if (groups.isEmpty()) {
                item { EmptyState("No reports match", "Nothing in the catalogue matches \"$query\".") }
            }
            groups.forEach { g ->
                item { SectionLabel(g.group) }
                items(g.items) { r ->
                    Column(Modifier.background(t.surface)) {
                        ListRow(
                            title = r,
                            trailing = {
                                if (r in MockData.pinnedReports) StatusPill("Pinned", Tone.Neutral)
                            },
                            onClick = { onReport(r) },
                        )
                        HairlineDivider()
                    }
                }
            }
        }
    }
}

@Composable
fun ReportDetailScreen(name: String, vm: AppViewModel, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    val slice = vm.slice
    val net = slice.sum { it.net }
    val labor = slice.sum { it.labor }

    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        item {
            Column(Modifier.padding(16.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Net sales", Fmt.usd(net), Modifier.weight(1f))
                    StatTile("Labor", Fmt.usd(labor), Modifier.weight(1f))
                }
                Spacer(Modifier.height(10.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Labor %", Fmt.pct(laborPct(net, labor)), Modifier.weight(1f))
                    StatTile("Orders", Fmt.num(slice.sum { it.orders }), Modifier.weight(1f))
                }
                Spacer(Modifier.height(12.dp))
                SectionCard {
                    CardHeader("Net sales and labor cost", "Both in dollars · ${vm.range.label}")
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
        item { SectionLabel("Detail") }
        items(slice.rows.reversed()) { d ->
            val lp = laborPct(d.net, d.labor)
            Column(Modifier.background(t.surface)) {
                ListRow(
                    title = "${d.weekday}, ${d.label}",
                    subtitle = "${Fmt.num(d.orders)} orders · ${Fmt.num(d.guests)} guests · ${Fmt.usdc(avgTicket(d.net, d.orders))} avg",
                    trailingText = Fmt.usd(d.net),
                    trailingSub = "${Fmt.pct(lp)} labor",
                )
                HairlineDivider()
            }
        }
        item {
            Text(
                "Report: $name · generated for ${vm.location.shortName}",
                Modifier.padding(16.dp),
                style = MaterialTheme.typography.bodySmall, color = t.ink400,
                textAlign = TextAlign.Center,
            )
        }
    }
}
