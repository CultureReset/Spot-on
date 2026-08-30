package com.spoton.merchant.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.CalendarToday
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.MoreHoriz
import androidx.compose.material.icons.outlined.AccountCircle
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.spoton.merchant.data.DateRange
import com.spoton.merchant.data.Location
import com.spoton.merchant.data.MockData
import com.spoton.merchant.nav.BottomTabs
import com.spoton.merchant.nav.Dest
import com.spoton.merchant.ui.theme.SpotOnTheme

/**
 * The SpotOn mark: a stroked ring around a solid dot, drawn on a Canvas so the
 * gap is genuinely transparent and the mark works on any background.
 */
@Composable
fun SpotOnMark(size: Int = 28, color: Color = SpotOnTheme.tokens.ink900) {
    Canvas(Modifier.size(size.dp)) {
        val r = this.size.minDimension / 2f
        val stroke = r * 0.30f
        drawCircle(
            color = color,
            radius = r - stroke / 2f,
            style = Stroke(width = stroke),
        )
        drawCircle(color = color, radius = r * 0.42f)
    }
}

@Composable
fun SpotOnWordmark(color: Color = SpotOnTheme.tokens.ink900, markSize: Int = 26) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        SpotOnMark(markSize, color)
        Spacer(Modifier.width(8.dp))
        Row {
            Text("Spot", style = MaterialTheme.typography.titleLarge, color = color, fontWeight = FontWeight.SemiBold)
            Text("On", style = MaterialTheme.typography.titleLarge, color = color, fontWeight = FontWeight.Normal)
        }
    }
}

/**
 * Top bar for the four tab-bar destinations: identity on the left, the global
 * scope controls (date range, location) and utilities on the right.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeTopBar(
    title: String,
    locationName: String,
    rangeLabel: String,
    unreadCount: Int,
    onSearch: () -> Unit,
    onNotifications: () -> Unit,
    onRange: () -> Unit,
    onLocation: () -> Unit,
) {
    val t = SpotOnTheme.tokens
    Column(Modifier.background(t.surface)) {
        TopAppBar(
            title = {
                Column {
                    Text(title, style = MaterialTheme.typography.titleLarge, color = t.ink900)
                    Text(
                        locationName,
                        style = MaterialTheme.typography.bodySmall,
                        color = t.ink400,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            },
            actions = {
                IconButton(onSearch) {
                    Icon(Icons.Outlined.Search, "Search", tint = t.ink500)
                }
                IconButton(onNotifications) {
                    BadgedBox(
                        badge = {
                            if (unreadCount > 0) {
                                Badge(containerColor = MaterialTheme.colorScheme.primary) {
                                    Text("$unreadCount")
                                }
                            }
                        },
                    ) { Icon(Icons.Outlined.Notifications, "Notifications", tint = t.ink500) }
                }
                IconButton(onLocation) {
                    Icon(Icons.Outlined.LocationOn, "Switch location", tint = t.ink500)
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = t.surface),
        )
        // The one global filter, kept visible rather than buried in a menu.
        DateRangeStrip(rangeLabel, onRange)
        HairlineDivider()
    }
}

@Composable
private fun DateRangeStrip(rangeLabel: String, onRange: () -> Unit) {
    val t = SpotOnTheme.tokens
    Row(
        Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        AssistChip(
            onClick = onRange,
            label = { Text(rangeLabel, style = MaterialTheme.typography.labelMedium) },
            leadingIcon = { Icon(Icons.Outlined.CalendarToday, null, Modifier.size(15.dp)) },
            colors = AssistChipDefaults.assistChipColors(
                containerColor = t.ink50,
                labelColor = t.ink800,
                leadingIconContentColor = t.ink500,
            ),
            border = null,
        )
        Spacer(Modifier.weight(1f))
        Text(
            "Scopes every figure",
            style = MaterialTheme.typography.bodySmall,
            color = t.ink300,
        )
    }
}

/** Top bar for pushed screens: back arrow and an optional action. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DetailTopBar(
    title: String,
    subtitle: String? = null,
    onBack: () -> Unit,
    actions: @Composable RowScope.() -> Unit = {},
) {
    val t = SpotOnTheme.tokens
    Column {
        TopAppBar(
            title = {
                Column {
                    Text(
                        title,
                        style = MaterialTheme.typography.titleMedium,
                        color = t.ink900,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    if (subtitle != null) {
                        Text(
                            subtitle,
                            style = MaterialTheme.typography.bodySmall,
                            color = t.ink400,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                }
            },
            navigationIcon = {
                IconButton(onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = t.ink700)
                }
            },
            actions = actions,
            colors = TopAppBarDefaults.topAppBarColors(containerColor = t.surface),
        )
        HairlineDivider()
    }
}

/** Bottom navigation: four destinations plus More. */
@Composable
fun SpotOnBottomBar(current: String?, onSelect: (String) -> Unit, onMore: () -> Unit) {
    val t = SpotOnTheme.tokens
    val inMore = current != null && BottomTabs.none { it.route == current }
    Column {
        HairlineDivider()
        NavigationBar(containerColor = t.surface, tonalElevation = 0.dp) {
            BottomTabs.forEach { d ->
                val selected = current == d.route
                NavigationBarItem(
                    selected = selected,
                    onClick = { onSelect(d.route) },
                    icon = { Icon(d.icon, null) },
                    label = { Text(d.title, maxLines = 1) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = MaterialTheme.colorScheme.primary,
                        selectedTextColor = MaterialTheme.colorScheme.primary,
                        indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                        unselectedIconColor = t.ink400,
                        unselectedTextColor = t.ink400,
                    ),
                )
            }
            NavigationBarItem(
                selected = inMore,
                onClick = onMore,
                icon = { Icon(Icons.Outlined.MoreHoriz, null) },
                label = { Text("More", maxLines = 1) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = MaterialTheme.colorScheme.primary,
                    selectedTextColor = MaterialTheme.colorScheme.primary,
                    indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                    unselectedIconColor = t.ink400,
                    unselectedTextColor = t.ink400,
                ),
            )
        }
    }
}

/** Location switcher, as a bottom sheet — reachable with one thumb. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LocationSheet(current: Location, onPick: (Location) -> Unit, onDismiss: () -> Unit) {
    val t = SpotOnTheme.tokens
    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = t.surface) {
        Text(
            "Switch location",
            Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
            style = MaterialTheme.typography.titleLarge,
            color = t.ink900,
        )
        MockData.locations.forEach { l ->
            ListRow(
                title = l.name,
                subtitle = "${l.address}, ${l.city}",
                leading = {
                    Icon(Icons.Outlined.LocationOn, null, tint = t.ink400)
                },
                trailing = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        StatusPill(if (l.isOpen) "Open" else "Closed", if (l.isOpen) Tone.Good else Tone.Neutral)
                        if (l.id == current.id) {
                            Spacer(Modifier.width(8.dp))
                            Icon(Icons.Outlined.Check, "Selected", tint = MaterialTheme.colorScheme.primary)
                        }
                    }
                },
                onClick = { onPick(l); onDismiss() },
            )
        }
        Spacer(Modifier.height(24.dp))
    }
}

/** Date range picker — the single filter that scopes the whole app. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DateRangeSheet(current: DateRange, onPick: (DateRange) -> Unit, onDismiss: () -> Unit) {
    val t = SpotOnTheme.tokens
    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = t.surface) {
        Text(
            "Date range",
            Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
            style = MaterialTheme.typography.titleLarge,
            color = t.ink900,
        )
        Text(
            "Applies to every figure in the app.",
            Modifier.padding(horizontal = 20.dp).padding(bottom = 8.dp),
            style = MaterialTheme.typography.bodySmall,
            color = t.ink400,
        )
        DateRange.all.forEach { r ->
            ListRow(
                title = r.label,
                trailing = {
                    if (r == current) Icon(Icons.Outlined.Check, "Selected", tint = MaterialTheme.colorScheme.primary)
                },
                onClick = { onPick(r); onDismiss() },
            )
        }
        Spacer(Modifier.height(24.dp))
    }
}

/** The More sheet: every section not in the tab bar, described. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MoreSheet(onPick: (Dest) -> Unit, onProfile: () -> Unit, onDismiss: () -> Unit) {
    val t = SpotOnTheme.tokens
    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = t.surface) {
        LazyColumn(Modifier.fillMaxWidth().heightIn(max = 560.dp)) {
            item {
                Text(
                    "All sections",
                    Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
                    style = MaterialTheme.typography.titleLarge,
                    color = t.ink900,
                )
            }
            Dest.groups.forEach { (group, dests) ->
                item { SectionLabel(group) }
                items(dests) { d ->
                    ListRow(
                        title = d.title,
                        subtitle = d.blurb,
                        leading = {
                            Box(
                                Modifier.size(36.dp).clip(RoundedCornerShape(10.dp)).background(t.ink50),
                                contentAlignment = Alignment.Center,
                            ) { Icon(d.icon, null, tint = t.ink500, modifier = Modifier.size(19.dp)) }
                        },
                        onClick = { onPick(d); onDismiss() },
                    )
                }
            }
            item {
                HairlineDivider()
                ListRow(
                    title = "Account & profile",
                    subtitle = "Your details, security and sign-out",
                    leading = {
                        Box(
                            Modifier.size(36.dp).clip(RoundedCornerShape(10.dp)).background(t.ink50),
                            contentAlignment = Alignment.Center,
                        ) {
                            Icon(
                                Icons.Outlined.AccountCircle,
                                null, tint = t.ink500, modifier = Modifier.size(19.dp),
                            )
                        }
                    },
                    onClick = { onProfile(); onDismiss() },
                )
                Spacer(Modifier.height(24.dp))
            }
        }
    }
}

/** Scrollable filter chips — used above lists, never inside a card. */
@Composable
fun FilterChipRow(options: List<String>, selected: String, onSelect: (String) -> Unit) {
    val t = SpotOnTheme.tokens
    Row(
        Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 8.dp),
    ) {
        options.forEachIndexed { i, o ->
            if (i > 0) Spacer(Modifier.width(8.dp))
            FilterChip(
                selected = o == selected,
                onClick = { onSelect(o) },
                label = { Text(o, style = MaterialTheme.typography.labelMedium) },
                colors = FilterChipDefaults.filterChipColors(
                    containerColor = t.ink50,
                    labelColor = t.ink500,
                    selectedContainerColor = t.ink900,
                    selectedLabelColor = Color.White,
                ),
                border = null,
            )
        }
    }
}
