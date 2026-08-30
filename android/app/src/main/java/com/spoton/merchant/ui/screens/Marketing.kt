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

/* ----------------------------------------------------------------- Campaigns */

private val CHANNELS = listOf("All", "Email", "SMS", "Social")

fun campaignTone(status: String) = when (status) {
    "Running" -> Tone.Good
    "Scheduled" -> Tone.Info
    "Draft" -> Tone.Warning
    else -> Tone.Neutral
}

@Composable
fun CampaignsScreen(onCampaign: (String) -> Unit, onNew: () -> Unit, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    var channel by remember { mutableStateOf("All") }
    val all = MockData.campaigns
    val shown = all.filter { channel == "All" || it.channel == channel }
    val revenue = all.sumOf { it.revenue }
    val sent = all.sumOf { it.sent }
    val opened = all.sumOf { it.opened }
    val redeemed = all.sumOf { it.redeemed }

    Column(Modifier.fillMaxSize().background(t.canvas)) {
        Column(Modifier.background(t.surface)) {
            FilterChipRow(CHANNELS, channel) { channel = it }
            HairlineDivider()
        }
        LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
            item {
                Column(Modifier.padding(16.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        StatTile("Revenue", Fmt.usd(revenue), Modifier.weight(1f), 18.6, "attributed")
                        StatTile("Sent", Fmt.num(sent), Modifier.weight(1f), hint = "${all.size} campaigns")
                    }
                    Spacer(Modifier.height(10.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        StatTile(
                            "Open rate",
                            Fmt.pct(if (sent == 0) 0.0 else opened.toDouble() / sent * 100),
                            Modifier.weight(1f), hint = "all sends",
                        )
                        StatTile("Redemptions", Fmt.num(redeemed), Modifier.weight(1f), hint = "offers used")
                    }
                    Spacer(Modifier.height(12.dp))
                    SectionCard {
                        CardHeader("Revenue by campaign", "Redemptions within 14 days of the send")
                        HBarList(
                            all.filter { it.revenue > 0 }.sortedByDescending { it.revenue }.map {
                                Triple(it.name, it.revenue.toFloat(), Fmt.usd(it.revenue))
                            },
                        )
                    }
                }
            }
            items(shown) { c ->
                Column(Modifier.background(t.surface)) {
                    ListRow(
                        title = c.name,
                        subtitle = "${c.channel} · ${c.audience} · ${c.date}",
                        trailingText = if (c.revenue > 0) Fmt.usd(c.revenue) else "—",
                        trailing = { StatusPill(c.status, campaignTone(c.status)) },
                        onClick = { onCampaign(c.id) },
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
                    ) { Text("New campaign") }
                    Spacer(Modifier.height(16.dp))
                }
            }
        }
    }
}

@Composable
fun CampaignDetailScreen(c: Campaign, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    Row {
                        StatusPill(c.status, campaignTone(c.status))
                        Spacer(Modifier.width(8.dp))
                        StatusPill(c.channel, Tone.Neutral)
                    }
                    Spacer(Modifier.height(12.dp))
                    Text(c.name, style = MaterialTheme.typography.titleLarge, color = t.ink900)
                    Text("${c.audience} · ${c.date}", style = MaterialTheme.typography.bodySmall, color = t.ink400)
                }
            }
        }
        if (c.sent > 0) {
            item {
                Column(Modifier.padding(horizontal = 16.dp)) {
                    SectionCard {
                        CardHeader("Funnel", "Each stage as a share of messages sent")
                        listOf(
                            "Sent" to c.sent, "Opened" to c.opened,
                            "Clicked" to c.clicked, "Redeemed" to c.redeemed,
                        ).forEachIndexed { i, (label, value) ->
                            if (i > 0) Spacer(Modifier.height(10.dp))
                            Row(
                                Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                            ) {
                                Text(label, style = MaterialTheme.typography.bodyMedium, color = t.ink700)
                                Text(
                                    "${Fmt.num(value)}  ·  ${Fmt.pct(value.toDouble() / c.sent * 100, 0)}",
                                    style = MaterialTheme.typography.bodyMedium, color = t.ink500,
                                )
                            }
                            Spacer(Modifier.height(4.dp))
                            // ordered stages, so one hue stepped by position
                            MeterBar(
                                value.toFloat() / c.sent,
                                MaterialTheme.colorScheme.primary.copy(alpha = 1f - i * 0.18f),
                            )
                        }
                    }
                }
            }
        }
        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    CardHeader("Results")
                    KeyValueRow("Audience", c.audience)
                    KeyValueRow("Sent", if (c.sent > 0) Fmt.num(c.sent) else "Not yet sent")
                    KeyValueRow("Opened", if (c.opened > 0) Fmt.num(c.opened) else "—")
                    KeyValueRow("Clicked", if (c.clicked > 0) Fmt.num(c.clicked) else "—")
                    KeyValueRow("Redeemed", if (c.redeemed > 0) Fmt.num(c.redeemed) else "—")
                    KeyValueRow("Attributed revenue", if (c.revenue > 0) Fmt.usd(c.revenue) else "—")
                }
                Spacer(Modifier.height(16.dp))
            }
        }
    }
}

@Composable
fun CampaignComposerScreen(contentPadding: PaddingValues, onDone: () -> Unit) {
    val t = SpotOnTheme.tokens
    var name by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }
    var channel by remember { mutableStateOf("Email") }
    var audience by remember { mutableStateOf("All opted-in guests") }
    var offer by remember { mutableStateOf("No offer") }

    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    CardHeader("Campaign", "Name it so you recognise it in the results table")
                    OutlinedTextField(
                        name, { name = it },
                        label = { Text("Campaign name") },
                        placeholder = { Text("Fall menu preview") },
                        modifier = Modifier.fillMaxWidth(), singleLine = true,
                        shape = RoundedCornerShape(10.dp),
                    )
                    Spacer(Modifier.height(12.dp))
                    Text("Channel", style = MaterialTheme.typography.titleSmall, color = t.ink700)
                    Spacer(Modifier.height(6.dp))
                    FilterChipRowInline(listOf("Email", "SMS", "Social"), channel) { channel = it }
                }
            }
        }
        item {
            Column(Modifier.padding(horizontal = 16.dp)) {
                SectionCard {
                    CardHeader("Audience", "${MockData.customers.count { it.optIn }} guests are opted in")
                    listOf(
                        "All opted-in guests", "VIP tier", "Regulars & VIPs",
                        "Lapsed 60+ days", "Birthday this month", "Within 3 miles",
                    ).forEach { a ->
                        Row(
                            Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            RadioButton(a == audience, { audience = a })
                            Text(a, style = MaterialTheme.typography.bodyMedium, color = t.ink700)
                        }
                    }
                }
            }
        }
        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    CardHeader("Message", if (channel == "SMS") "Keep under 160 characters for one segment" else null)
                    OutlinedTextField(
                        message, { message = it },
                        placeholder = { Text("Write your message…") },
                        modifier = Modifier.fillMaxWidth().height(120.dp),
                        shape = RoundedCornerShape(10.dp),
                    )
                    if (channel == "SMS") {
                        Spacer(Modifier.height(6.dp))
                        Text(
                            "${message.length} / 160 characters",
                            style = MaterialTheme.typography.bodySmall,
                            color = if (message.length > 160) t.critical else t.ink400,
                        )
                    }
                }
                Spacer(Modifier.height(12.dp))
                SectionCard {
                    CardHeader("Offer", "Attaching an offer is what lets SpotOn attribute revenue back to the check")
                    FilterChipRowInline(
                        listOf("No offer", "\$10 off", "Free dessert", "20% off"), offer,
                    ) { offer = it }
                }
                Spacer(Modifier.height(14.dp))
                Button(
                    onClick = onDone,
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape = RoundedCornerShape(10.dp),
                ) { Text("Schedule campaign") }
                Spacer(Modifier.height(10.dp))
                OutlinedButton(
                    onClick = onDone,
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape = RoundedCornerShape(10.dp),
                ) { Text("Save draft") }
                Spacer(Modifier.height(16.dp))
            }
        }
    }
}

/* ------------------------------------------------------------------- Reviews */

private val REVIEW_TABS = listOf("All", "Needs a reply", "Replied")
private val SOURCES = listOf("All sources", "Google", "Yelp", "Facebook", "SpotOn")

@Composable
fun ReviewsScreen(onReply: (String) -> Unit, contentPadding: PaddingValues) {
    val t = SpotOnTheme.tokens
    var tab by remember { mutableStateOf("All") }
    var source by remember { mutableStateOf("All sources") }

    val shown = MockData.reviews.filter {
        (tab == "All" || (tab == "Needs a reply" && !it.replied) || (tab == "Replied" && it.replied)) &&
            (source == "All sources" || it.source == source)
    }
    val needsReply = MockData.reviews.count { !it.replied }
    val responseRate = (MockData.reviews.size - needsReply).toDouble() / MockData.reviews.size * 100

    Column(Modifier.fillMaxSize().background(t.canvas)) {
        Column(Modifier.background(t.surface)) {
            FilterChipRow(SOURCES, source) { source = it }
            FilterChipRow(REVIEW_TABS, tab) { tab = it }
            HairlineDivider()
        }
        LazyColumn(Modifier.fillMaxSize(), contentPadding = contentPadding) {
            item {
                Column(Modifier.padding(16.dp)) {
                    SectionCard {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column {
                                Text(
                                    "${MockData.reviewAverage}",
                                    style = MaterialTheme.typography.displaySmall, color = t.ink900,
                                )
                                StarRow(MockData.reviewAverage.toInt())
                                Text(
                                    "${Fmt.num(MockData.reviewTotal)} reviews",
                                    style = MaterialTheme.typography.bodySmall, color = t.ink400,
                                )
                            }
                            Spacer(Modifier.width(20.dp))
                            Column(Modifier.weight(1f)) {
                                val max = MockData.reviewDistribution.maxOf { it.second }
                                MockData.reviewDistribution.forEach { (stars, count) ->
                                    Row(
                                        Modifier.fillMaxWidth().padding(vertical = 2.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                    ) {
                                        Text(
                                            "$stars",
                                            Modifier.width(12.dp),
                                            style = MaterialTheme.typography.bodySmall, color = t.ink400,
                                        )
                                        Box(Modifier.weight(1f)) { MeterBar(count.toFloat() / max, height = 5) }
                                        Spacer(Modifier.width(6.dp))
                                        Text(
                                            Fmt.num(count),
                                            Modifier.width(34.dp),
                                            style = MaterialTheme.typography.bodySmall, color = t.ink400,
                                        )
                                    }
                                }
                            }
                        }
                    }
                    Spacer(Modifier.height(10.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        StatTile("Response rate", Fmt.pct(responseRate), Modifier.weight(1f), hint = "$needsReply waiting")
                        StatTile("Response time", "6h", Modifier.weight(1f), hint = "under 24h target")
                    }
                }
            }
            if (shown.isEmpty()) {
                item { EmptyState("Nothing here", "No reviews match this filter.") }
            }
            items(shown) { r ->
                Column(Modifier.padding(horizontal = 16.dp).padding(bottom = 12.dp)) {
                    SectionCard {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            StarRow(r.rating, 14)
                            Spacer(Modifier.width(8.dp))
                            Text(r.author, style = MaterialTheme.typography.titleSmall, color = t.ink900)
                            Spacer(Modifier.width(8.dp))
                            StatusPill(r.source, Tone.Neutral)
                            Spacer(Modifier.weight(1f))
                            Text(r.date, style = MaterialTheme.typography.bodySmall, color = t.ink400)
                        }
                        Spacer(Modifier.height(8.dp))
                        Text(r.body, style = MaterialTheme.typography.bodyMedium, color = t.ink700)
                        Spacer(Modifier.height(10.dp))
                        if (r.replied) {
                            Column(
                                Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp))
                                    .background(t.ink50).padding(10.dp),
                            ) {
                                Text("Your reply", style = MaterialTheme.typography.labelMedium, color = t.ink900)
                                Spacer(Modifier.height(4.dp))
                                Text(
                                    "Thank you for taking the time to write this — we've shared it with the team.",
                                    style = MaterialTheme.typography.bodySmall, color = t.ink500,
                                )
                            }
                        } else {
                            Button(
                                onClick = { onReply(r.id) },
                                modifier = Modifier.fillMaxWidth().height(44.dp),
                                shape = RoundedCornerShape(10.dp),
                            ) { Text("Reply") }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ReviewReplyScreen(r: Review, contentPadding: PaddingValues, onDone: () -> Unit) {
    val t = SpotOnTheme.tokens
    var reply by remember { mutableStateOf("") }
    val suggestions = if (r.rating >= 4) {
        listOf(
            "Thank you so much — we'll pass this along to the kitchen. See you next time.",
            "This made our day. Thanks for taking the time to write it.",
        )
    } else {
        listOf(
            "We're sorry the timing let you down — that's on us, and we're working on it. We'd love another chance.",
            "Thank you for the honest feedback. I've shared it with the front-of-house team directly.",
        )
    }

    LazyColumn(Modifier.fillMaxSize().background(t.canvas), contentPadding = contentPadding) {
        item {
            Column(Modifier.padding(16.dp)) {
                SectionCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        StarRow(r.rating, 14)
                        Spacer(Modifier.width(8.dp))
                        Text(r.author, style = MaterialTheme.typography.titleSmall, color = t.ink900)
                        Spacer(Modifier.width(8.dp))
                        StatusPill(r.source, Tone.Neutral)
                    }
                    Spacer(Modifier.height(8.dp))
                    Text(r.body, style = MaterialTheme.typography.bodyMedium, color = t.ink700)
                }
                Spacer(Modifier.height(14.dp))
                SectionCard {
                    CardHeader("Your reply", "Posts publicly to ${r.source} under your business name")
                    OutlinedTextField(
                        reply, { reply = it },
                        placeholder = { Text("Thank them by name, address the specific point, and invite them back.") },
                        modifier = Modifier.fillMaxWidth().height(130.dp),
                        shape = RoundedCornerShape(10.dp),
                    )
                }
                Spacer(Modifier.height(14.dp))
                SectionCard {
                    CardHeader("Suggested replies")
                    suggestions.forEach { s ->
                        Surface(
                            onClick = { reply = s },
                            modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                            shape = RoundedCornerShape(10.dp),
                            color = t.surface,
                            border = androidx.compose.foundation.BorderStroke(1.dp, t.hairline),
                        ) {
                            Text(
                                s, Modifier.padding(12.dp),
                                style = MaterialTheme.typography.bodySmall, color = t.ink500,
                            )
                        }
                    }
                }
                Spacer(Modifier.height(14.dp))
                Button(
                    onClick = onDone,
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape = RoundedCornerShape(10.dp),
                    enabled = reply.isNotBlank(),
                ) { Text("Post reply") }
                Spacer(Modifier.height(16.dp))
            }
        }
    }
}
