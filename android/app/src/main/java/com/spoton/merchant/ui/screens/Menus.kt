package com.spoton.merchant.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.spoton.merchant.data.*
import com.spoton.merchant.ui.components.*
import com.spoton.merchant.ui.theme.SpotOnTheme

private val MENU_TABS = listOf("Items", "Categories", "Engineering", "Modifiers")

private val QUADRANT_HELP = mapOf(
    "Star" to "Popular and profitable. Protect the recipe, feature it everywhere.",
    "Plowhorse" to "Popular but thin margin. Re-engineer the plate cost or nudge the price.",
    "Puzzle" to "Profitable but overlooked. Move it up the menu or train staff to sell it.",
    "Dog" to "Neither popular nor profitable. A candidate to cut at the next menu change.",
)

@Composable
fun MenusScreen(vm: AppViewModel, onItem: (String) -> Unit, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    var tab by remember { mutableStateOf("Items") }
    var query by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("All") }

    val eightySix = vm.itemAvailability.count { !it.value }
    val avgMargin = MockData.menuItems.map { it.marginPct }.average()

    Column(Modifier.fillMaxSize().background(t.canvas)) {
        Column(Modifier.background(t.surface)) {
            FilterChipRow(MENU_TABS, tab) { tab = it }
            HairlineDivider()
        }

        when (tab) {
            "Items" -> {
                val cats = listOf("All") + MockData.menuCategories
                val filtered = MockData.menuItems.filter {
                    (category == "All" || it.category == category) &&
                        (query.isBlank() || it.name.contains(query, true))
                }
                Column(Modifier.background(t.surface)) {
                    SearchField(query, { query = it }, "Search items")
                    FilterChipRow(cats, category) { category = it }
                    HairlineDivider()
                }
                LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
                    item {
                        Row(
                            Modifier.padding(16.dp).fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                        ) {
                            StatTile("Active", Fmt.num(MockData.menuItems.size - eightySix), Modifier.weight(1f), hint = "of ${MockData.menuItems.size}")
                            StatTile("86'd now", Fmt.num(eightySix), Modifier.weight(1f), hint = "hidden")
                            StatTile("Margin", Fmt.pct(avgMargin), Modifier.weight(1f), hint = "average")
                        }
                    }
                    if (filtered.isEmpty()) {
                        item { EmptyState("No items match", "Adjust the search or category filter.") }
                    }
                    items(filtered) { m ->
                        Column(Modifier.background(t.surface)) {
                            ListRow(
                                title = m.name,
                                subtitle = "${m.category} · ${Fmt.usdc(m.price)} · ${Fmt.num(m.sold)} sold · ${Fmt.pct(m.marginPct, 0)} margin",
                                trailing = {
                                    Switch(
                                        checked = vm.itemAvailability[m.id] ?: true,
                                        onCheckedChange = { vm.updateAvailability(m.id, it) },
                                    )
                                },
                                onClick = { onItem(m.id) },
                            )
                            HairlineDivider()
                        }
                    }
                }
            }

            "Categories" -> {
                val byCategory = MockData.menuCategories.map { c ->
                    c to MockData.menuItems.filter { it.category == c }
                }.sortedByDescending { p -> p.second.sumOf { it.net } }
                LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
                    item {
                        Column(Modifier.padding(16.dp)) {
                            SectionCard {
                                CardHeader("Net sales by category", "Trailing period")
                                HBarList(
                                    byCategory.map { (c, items) ->
                                        Triple(c, items.sumOf { it.net }.toFloat(), Fmt.usd(items.sumOf { it.net }))
                                    },
                                )
                            }
                        }
                    }
                    items(byCategory) { (c, items) ->
                        Column(Modifier.background(t.surface)) {
                            ListRow(
                                title = c,
                                subtitle = "${items.size} items · ${Fmt.num(items.sumOf { it.sold })} units sold",
                                trailingText = Fmt.usd(items.sumOf { it.net }),
                            )
                            HairlineDivider()
                        }
                    }
                }
            }

            "Engineering" -> {
                LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
                    item {
                        Column(Modifier.padding(16.dp)) {
                            Row(
                                Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(t.ink50)
                                    .padding(12.dp),
                            ) {
                                Icon(Icons.Outlined.AutoAwesome, null, tint = t.ink500, modifier = Modifier.size(17.dp))
                                Spacer(Modifier.width(8.dp))
                                Text(
                                    "Items are placed by popularity against the menu median, and by margin. The quadrant tells you what to do with each one.",
                                    style = MaterialTheme.typography.bodySmall, color = t.ink500,
                                )
                            }
                        }
                    }
                    items(listOf("Star", "Plowhorse", "Puzzle", "Dog")) { q ->
                        val items = MockData.menuItems.filter { it.quadrant == q }
                        Column(Modifier.padding(horizontal = 16.dp).padding(bottom = 12.dp)) {
                            SectionCard {
                                CardHeader(
                                    "${q}s", QUADRANT_HELP[q],
                                    trailing = {
                                        StatusPill(
                                            "${items.size}",
                                            when (q) { "Star" -> Tone.Good; "Dog" -> Tone.Critical; else -> Tone.Neutral },
                                        )
                                    },
                                )
                                if (items.isEmpty()) {
                                    Text("None", style = MaterialTheme.typography.bodySmall, color = t.ink300)
                                } else {
                                    items.take(6).forEach { m ->
                                        Row(
                                            Modifier.fillMaxWidth().padding(vertical = 3.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                        ) {
                                            Text(m.name, style = MaterialTheme.typography.bodyMedium, color = t.ink700)
                                            Text(
                                                "${Fmt.num(m.sold)} · ${Fmt.pct(m.marginPct, 0)}",
                                                style = MaterialTheme.typography.bodySmall, color = t.ink400,
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            else -> {
                val mods = MockData.menuItems.flatMap { it.modifiers }.distinct()
                LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
                    item {
                        Text(
                            "Modifier groups attach to items and drive both kitchen routing and upsell revenue.",
                            Modifier.padding(16.dp),
                            style = MaterialTheme.typography.bodyMedium, color = t.ink500,
                        )
                    }
                    items(mods) { mod ->
                        val count = MockData.menuItems.count { it.modifiers.contains(mod) }
                        Column(Modifier.background(t.surface)) {
                            ListRow(
                                title = mod,
                                subtitle = "Attached to $count items",
                                trailingText = if (mods.indexOf(mod) % 2 == 0) Fmt.usdc(1.5 + mods.indexOf(mod) * 0.5) else "—",
                                trailingSub = if (mods.indexOf(mod) % 3 == 0) "Required" else "Optional",
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
fun MenuItemScreen(item: MenuItem, vm: AppViewModel, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    CardHeader(item.name, item.description)
                    Spacer(Modifier.height(4.dp))
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Column {
                            Text("Available", style = MaterialTheme.typography.bodyLarge, color = t.ink900)
                            Text(
                                "Turning this off 86's the item everywhere",
                                style = MaterialTheme.typography.bodySmall, color = t.ink400,
                            )
                        }
                        Switch(
                            checked = vm.itemAvailability[item.id] ?: true,
                            onCheckedChange = { vm.updateAvailability(item.id, it) },
                        )
                    }
                }
            }
        }
        item {
            Column(Modifier.padding(horizontal = 16.dp)) {
                SectionCard {
                    CardHeader("Pricing")
                    KeyValueRow("Price", Fmt.usdc(item.price))
                    KeyValueRow("Plate cost", Fmt.usdc(item.cost))
                    KeyValueRow("Gross margin", Fmt.pct(item.marginPct))
                    KeyValueRow("Tax rate", "${item.taxRate}%")
                    KeyValueRow("Category", item.category)
                    KeyValueRow("Kitchen station", item.station)
                }
            }
        }
        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    CardHeader("Performance", "Trailing period")
                    KeyValueRow("Units sold", Fmt.num(item.sold))
                    KeyValueRow("Net sales", Fmt.usd(item.net))
                    KeyValueRow("Classification", item.quadrant)
                }
                if (item.modifiers.isNotEmpty()) {
                    Spacer(Modifier.height(12.dp))
                    SectionCard {
                        CardHeader("Modifiers", "${item.modifiers.size} attached")
                        item.modifiers.forEach {
                            Text("• $it", style = MaterialTheme.typography.bodyMedium, color = t.ink700)
                        }
                    }
                }
                Spacer(Modifier.height(16.dp))
            }
        }
    }
}
