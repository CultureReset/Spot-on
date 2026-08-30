package com.spoton.merchant.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.spoton.merchant.data.Fmt
import com.spoton.merchant.ui.theme.SpotOnTheme
import kotlin.math.abs

/** The card every screen is built from: white, hairline border, no heavy elevation. */
@Composable
fun SectionCard(
    modifier: Modifier = Modifier,
    contentPadding: PaddingValues = PaddingValues(16.dp),
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    val t = SpotOnTheme.tokens
    val base = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(14.dp))
        .background(t.surface)
        .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
    Surface(
        modifier = modifier.then(base),
        color = t.surface,
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, t.hairline),
    ) {
        Column(Modifier.padding(contentPadding), content = content)
    }
}

@Composable
fun CardHeader(title: String, subtitle: String? = null, trailing: @Composable (() -> Unit)? = null) {
    val t = SpotOnTheme.tokens
    Row(
        Modifier.fillMaxWidth().padding(bottom = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Top,
    ) {
        Column(Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.titleMedium, color = t.ink900)
            if (subtitle != null) {
                Spacer(Modifier.height(2.dp))
                Text(subtitle, style = MaterialTheme.typography.bodySmall, color = t.ink500)
            }
        }
        if (trailing != null) { Spacer(Modifier.width(12.dp)); trailing() }
    }
}

/** Direction is carried by the arrow glyph and a content description, never colour alone. */
@Composable
fun DeltaChip(value: Double, invert: Boolean = false) {
    val t = SpotOnTheme.tokens
    val up = value >= 0
    val good = if (invert) !up else up
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(
            text = if (up) "▲" else "▼",
            fontSize = 9.sp,
            color = if (good) t.good else t.critical,
        )
        Spacer(Modifier.width(3.dp))
        Text(
            text = Fmt.pct(abs(value)),
            style = MaterialTheme.typography.labelMedium,
            color = if (good) t.good else t.critical,
        )
    }
}

@Composable
fun StatTile(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    delta: Double? = null,
    hint: String? = null,
    invertDelta: Boolean = false,
) {
    val t = SpotOnTheme.tokens
    Surface(
        modifier = modifier,
        color = t.surface,
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, t.hairline),
    ) {
        Column(Modifier.padding(14.dp)) {
            Text(
                label.uppercase(),
                style = MaterialTheme.typography.labelSmall,
                color = t.ink400,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Spacer(Modifier.height(6.dp))
            Text(
                value,
                style = MaterialTheme.typography.headlineSmall,
                color = t.ink900,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            if (delta != null || hint != null) {
                Spacer(Modifier.height(6.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (delta != null) { DeltaChip(delta, invertDelta); Spacer(Modifier.width(6.dp)) }
                    if (hint != null) {
                        Text(
                            hint,
                            style = MaterialTheme.typography.bodySmall,
                            color = t.ink400,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                }
            }
        }
    }
}

enum class Tone { Neutral, Good, Warning, Critical, Info, Brand }

@Composable
fun StatusPill(text: String, tone: Tone = Tone.Neutral) {
    val t = SpotOnTheme.tokens
    val (bg, fg) = when (tone) {
        Tone.Neutral -> t.ink50 to t.ink500
        Tone.Good -> t.goodBg to t.good
        Tone.Warning -> t.warningBg to t.warning
        Tone.Critical -> t.criticalBg to t.critical
        Tone.Info -> Color(0xFFE5EEFB) to Color(0xFF12349F)
        Tone.Brand -> MaterialTheme.colorScheme.primary to Color.White
    }
    Box(
        Modifier.clip(CircleShape).background(bg).padding(horizontal = 8.dp, vertical = 3.dp),
    ) {
        Text(text, style = MaterialTheme.typography.labelSmall, color = fg, maxLines = 1)
    }
}

@Composable
fun Avatar(name: String, size: Int = 36, background: Color? = null) {
    val t = SpotOnTheme.tokens
    Box(
        Modifier
            .size(size.dp)
            .clip(CircleShape)
            .background(background ?: t.ink900),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            Fmt.initials(name),
            style = MaterialTheme.typography.labelMedium,
            color = Color.White,
            fontSize = (size * 0.32f).sp,
        )
    }
}

/** A tappable row — the workhorse of every list screen. */
@Composable
fun ListRow(
    title: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    leading: @Composable (() -> Unit)? = null,
    trailingText: String? = null,
    trailingSub: String? = null,
    trailing: @Composable (() -> Unit)? = null,
    onClick: (() -> Unit)? = null,
) {
    val t = SpotOnTheme.tokens
    Row(
        modifier
            .fillMaxWidth()
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (leading != null) { leading(); Spacer(Modifier.width(12.dp)) }
        Column(Modifier.weight(1f)) {
            Text(
                title,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.Medium,
                color = t.ink900,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            if (subtitle != null) {
                Spacer(Modifier.height(2.dp))
                Text(
                    subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = t.ink400,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
        if (trailingText != null) {
            Spacer(Modifier.width(10.dp))
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    trailingText,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium,
                    color = t.ink900,
                    maxLines = 1,
                )
                if (trailingSub != null) {
                    Spacer(Modifier.height(2.dp))
                    Text(trailingSub, style = MaterialTheme.typography.bodySmall, color = t.ink400, maxLines = 1)
                }
            }
        }
        if (trailing != null) { Spacer(Modifier.width(10.dp)); trailing() }
    }
}

@Composable
fun HairlineDivider(modifier: Modifier = Modifier) {
    HorizontalDivider(modifier, thickness = 1.dp, color = SpotOnTheme.tokens.hairline)
}

@Composable
fun SectionLabel(text: String, modifier: Modifier = Modifier) {
    Text(
        text.uppercase(),
        modifier = modifier.padding(horizontal = 16.dp, vertical = 8.dp),
        style = MaterialTheme.typography.labelSmall,
        color = SpotOnTheme.tokens.ink300,
    )
}

@Composable
fun EmptyState(title: String, body: String, action: @Composable (() -> Unit)? = null) {
    val t = SpotOnTheme.tokens
    Column(
        Modifier.fillMaxWidth().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(title, style = MaterialTheme.typography.titleMedium, color = t.ink900)
        Spacer(Modifier.height(6.dp))
        Text(body, style = MaterialTheme.typography.bodyMedium, color = t.ink500)
        if (action != null) { Spacer(Modifier.height(16.dp)); action() }
    }
}

/** A meter bar. Value is always printed beside it, never conveyed by length alone. */
@Composable
fun MeterBar(fraction: Float, color: Color = MaterialTheme.colorScheme.primary, height: Int = 6) {
    val t = SpotOnTheme.tokens
    Box(
        Modifier.fillMaxWidth().height(height.dp).clip(CircleShape).background(t.ink100),
    ) {
        Box(
            Modifier
                .fillMaxWidth(fraction.coerceIn(0.02f, 1f))
                .fillMaxHeight()
                .clip(CircleShape)
                .background(color),
        )
    }
}

@Composable
fun KeyValueRow(label: String, value: String, valueColor: Color? = null) {
    val t = SpotOnTheme.tokens
    Row(
        Modifier.fillMaxWidth().padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = t.ink500)
        Text(
            value,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Medium,
            color = valueColor ?: t.ink900,
        )
    }
}
