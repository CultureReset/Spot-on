package com.spoton.merchant.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.spoton.merchant.data.Fmt
import com.spoton.merchant.ui.theme.Poppins
import com.spoton.merchant.ui.theme.SpotOnTheme
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.floor
import kotlin.math.log10
import kotlin.math.pow
import kotlin.math.roundToInt

data class ChartSeries(val label: String, val color: Color, val values: List<Float>)

private val AxisText = Color(0xFF6B7A8F)
private val Grid = Color(0xFFE7EBED)

private fun niceTicks(max: Float, count: Int = 4): List<Float> {
    if (max <= 0f) return listOf(0f)
    val raw = max / count
    val mag = 10.0.pow(floor(log10(raw.toDouble()))).toFloat()
    val step = listOf(1f, 2f, 2.5f, 5f, 10f).map { it * mag }.firstOrNull { it >= raw } ?: (mag * 10)
    // The top tick must sit at or above the data max, or the tallest mark
    // overflows the plot and gets clipped.
    val steps = ceil(max / step).toInt().coerceAtLeast(1)
    return (0..steps).map { it * step }
}

private fun axisStyle() = TextStyle(fontFamily = Poppins, fontSize = 10.sp, color = AxisText)

/**
 * Line chart with an optional comparison series.
 *
 * Touch has no hover, so a tap selects the nearest index and the readout above
 * the plot names every series' value there — the phone equivalent of the web
 * dashboard's crosshair tooltip. Values stay reachable without the gesture too:
 * the axis is labelled and the caller prints the headline figure.
 */
@Composable
fun LineChart(
    labels: List<String>,
    series: List<ChartSeries>,
    modifier: Modifier = Modifier,
    height: Int = 190,
    area: Boolean = false,
    valueFormat: (Float) -> String = { Fmt.usd(it.roundToInt()) },
    axisFormat: (Float) -> String = { Fmt.usdShort(it.roundToInt()) },
    yDomain: Pair<Float, Float>? = null,
) {
    val t = SpotOnTheme.tokens
    val measurer = rememberTextMeasurer()
    var selected by remember(labels) { mutableStateOf<Int?>(null) }
    val density = LocalDensity.current

    Column(modifier.fillMaxWidth()) {
        // readout — replaces hover on touch
        val idx = selected
        Row(
            Modifier.fillMaxWidth().padding(bottom = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (idx != null && idx in labels.indices) {
                Text(labels[idx], style = MaterialTheme.typography.labelMedium, color = t.ink900)
                Spacer(Modifier.width(10.dp))
                series.forEach { s ->
                    Box(Modifier.size(8.dp).clip(RoundedCornerShape(2.dp)).background(s.color))
                    Spacer(Modifier.width(4.dp))
                    Text(
                        valueFormat(s.values.getOrElse(idx) { 0f }),
                        style = MaterialTheme.typography.labelMedium,
                        color = t.ink700,
                    )
                    Spacer(Modifier.width(10.dp))
                }
            } else {
                Text(
                    "Tap the chart for a day's figures",
                    style = MaterialTheme.typography.bodySmall,
                    color = t.ink300,
                )
            }
        }

        Canvas(
            Modifier
                .fillMaxWidth()
                .height(height.dp)
                .pointerInput(labels, series) {
                    detectTapGestures { offset ->
                        val padL = with(density) { 40.dp.toPx() }
                        val padR = with(density) { 6.dp.toPx() }
                        val plotW = size.width - padL - padR
                        if (plotW <= 0 || labels.size < 2) return@detectTapGestures
                        val i = (((offset.x - padL) / plotW) * (labels.size - 1)).roundToInt()
                        selected = i.coerceIn(0, labels.size - 1)
                    }
                },
        ) {
            val padL = 40.dp.toPx(); val padR = 6.dp.toPx()
            val padT = 8.dp.toPx(); val padB = 18.dp.toPx()
            val plotW = size.width - padL - padR
            val plotH = size.height - padT - padB
            if (plotW <= 0 || plotH <= 0) return@Canvas

            val dataMax = series.flatMap { it.values }.maxOrNull() ?: 1f
            val yMin = yDomain?.first ?: 0f
            val ticks = if (yDomain != null) {
                val (lo, hi) = yDomain
                (0..4).map { lo + (hi - lo) / 4 * it }
            } else niceTicks(dataMax)
            val yMax = ticks.last()
            val span = (yMax - yMin).takeIf { it != 0f } ?: 1f

            fun x(i: Int) = padL + if (labels.size == 1) plotW / 2 else i.toFloat() / (labels.size - 1) * plotW
            fun y(v: Float) = padT + plotH - ((v - yMin) / span) * plotH

            // recessive solid hairline grid — never dashed
            ticks.forEach { tv ->
                val yy = y(tv)
                drawLine(Grid, Offset(padL, yy), Offset(size.width - padR, yy), strokeWidth = 1f)
                val lay = measurer.measure(axisFormat(tv), axisStyle())
                drawText(lay, topLeft = Offset(padL - lay.size.width - 5.dp.toPx(), yy - lay.size.height / 2))
            }

            // only the primary series is filled; filling a comparison muddies the overlap
            if (area && series.isNotEmpty()) {
                val s = series.first()
                val p = Path().apply {
                    moveTo(x(0), y(s.values[0]))
                    s.values.forEachIndexed { i, v -> if (i > 0) lineTo(x(i), y(v)) }
                    lineTo(x(s.values.lastIndex), padT + plotH)
                    lineTo(x(0), padT + plotH)
                    close()
                }
                drawPath(p, s.color.copy(alpha = 0.09f))
            }

            series.forEach { s ->
                val p = Path().apply {
                    s.values.forEachIndexed { i, v -> if (i == 0) moveTo(x(i), y(v)) else lineTo(x(i), y(v)) }
                }
                drawPath(p, s.color, style = Stroke(width = 2.dp.toPx()))
            }

            // selection marker with a surface ring so overlaps stay readable
            selected?.let { i ->
                if (i in labels.indices) {
                    drawLine(Color(0xFF9AA6B6), Offset(x(i), padT), Offset(x(i), padT + plotH), strokeWidth = 1f)
                    series.forEach { s ->
                        val v = s.values.getOrElse(i) { 0f }
                        drawCircle(Color.White, radius = 5.dp.toPx(), center = Offset(x(i), y(v)))
                        drawCircle(s.color, radius = 3.5f.dp.toPx(), center = Offset(x(i), y(v)))
                    }
                }
            }

            // x labels: first, last, and a middle one — phones have no room for more
            val show = listOfNotNull(0, labels.size / 2, labels.lastIndex).distinct()
            show.forEach { i ->
                val lay = measurer.measure(labels[i], axisStyle())
                val cx = when (i) {
                    0 -> x(i)
                    labels.lastIndex -> x(i) - lay.size.width
                    else -> x(i) - lay.size.width / 2
                }
                drawText(lay, topLeft = Offset(cx.coerceIn(0f, size.width - lay.size.width), size.height - lay.size.height))
            }
        }

        if (series.size >= 2) {
            Spacer(Modifier.height(8.dp))
            ChartLegend(series.map { it.label to it.color })
        }
    }
}

/** Bar chart. Tap selects a bar and names its value above the plot. */
@Composable
fun BarChart(
    labels: List<String>,
    values: List<Float>,
    modifier: Modifier = Modifier,
    height: Int = 170,
    color: Color = MaterialTheme.colorScheme.primary,
    valueFormat: (Float) -> String = { Fmt.usd(it.roundToInt()) },
    axisFormat: (Float) -> String = { Fmt.usdShort(it.roundToInt()) },
    highlightMax: Boolean = false,
) {
    val t = SpotOnTheme.tokens
    val measurer = rememberTextMeasurer()
    var selected by remember(labels) { mutableStateOf<Int?>(null) }
    val density = LocalDensity.current
    val maxIndex = remember(values) { values.indices.maxByOrNull { values[it] } ?: 0 }

    Column(modifier.fillMaxWidth()) {
        Row(Modifier.fillMaxWidth().padding(bottom = 6.dp)) {
            val idx = selected ?: if (highlightMax) maxIndex else null
            if (idx != null && idx in labels.indices) {
                Text(labels[idx], style = MaterialTheme.typography.labelMedium, color = t.ink900)
                Spacer(Modifier.width(8.dp))
                Text(
                    valueFormat(values[idx]),
                    style = MaterialTheme.typography.labelMedium,
                    color = t.ink700,
                )
                if (selected == null && highlightMax) {
                    Spacer(Modifier.width(6.dp))
                    Text("peak", style = MaterialTheme.typography.bodySmall, color = t.ink300)
                }
            } else {
                Text("Tap a bar for its value", style = MaterialTheme.typography.bodySmall, color = t.ink300)
            }
        }

        Canvas(
            Modifier
                .fillMaxWidth()
                .height(height.dp)
                .pointerInput(labels, values) {
                    detectTapGestures { offset ->
                        val padL = with(density) { 40.dp.toPx() }
                        val padR = with(density) { 6.dp.toPx() }
                        val plotW = size.width - padL - padR
                        if (plotW <= 0 || values.isEmpty()) return@detectTapGestures
                        val slot = plotW / values.size
                        val i = ((offset.x - padL) / slot).toInt()
                        selected = i.coerceIn(0, values.lastIndex)
                    }
                },
        ) {
            val padL = 40.dp.toPx(); val padR = 6.dp.toPx()
            val padT = 8.dp.toPx(); val padB = 18.dp.toPx()
            val plotW = size.width - padL - padR
            val plotH = size.height - padT - padB
            if (plotW <= 0 || plotH <= 0 || values.isEmpty()) return@Canvas

            val ticks = niceTicks(values.max())
            val yMax = ticks.last().takeIf { it > 0f } ?: 1f

            ticks.forEach { tv ->
                val yy = padT + plotH - (tv / yMax) * plotH
                drawLine(Grid, Offset(padL, yy), Offset(size.width - padR, yy), strokeWidth = 1f)
                val lay = measurer.measure(axisFormat(tv), axisStyle())
                drawText(lay, topLeft = Offset(padL - lay.size.width - 5.dp.toPx(), yy - lay.size.height / 2))
            }

            val slot = plotW / values.size
            // 2dp surface gap between adjacent bars — a gap, never a border
            val barW = (slot - 2.dp.toPx()).coerceIn(2f, 26.dp.toPx())
            val active = selected ?: if (highlightMax) maxIndex else -1

            values.forEachIndexed { i, v ->
                val h = ((v / yMax) * plotH).coerceAtLeast(2f)
                val left = padL + i * slot + (slot - barW) / 2
                drawRoundRect(
                    color = if (active >= 0 && i != active) color.copy(alpha = 0.28f) else color,
                    topLeft = Offset(left, padT + plotH - h),
                    size = Size(barW, h),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(4.dp.toPx(), 4.dp.toPx()),
                )
            }

            val show = listOfNotNull(0, values.size / 2, values.lastIndex).distinct()
            show.forEach { i ->
                val lay = measurer.measure(labels[i], axisStyle())
                val cx = padL + i * slot + slot / 2 - lay.size.width / 2
                drawText(lay, topLeft = Offset(cx.coerceIn(0f, size.width - lay.size.width), size.height - lay.size.height))
            }
        }
    }
}

@Composable
fun ChartLegend(items: List<Pair<String, Color>>) {
    val t = SpotOnTheme.tokens
    Row(verticalAlignment = Alignment.CenterVertically) {
        items.forEachIndexed { i, (label, color) ->
            if (i > 0) Spacer(Modifier.width(14.dp))
            Box(Modifier.size(9.dp).clip(RoundedCornerShape(2.dp)).background(color))
            Spacer(Modifier.width(5.dp))
            Text(label, style = MaterialTheme.typography.bodySmall, color = t.ink500)
        }
    }
}

/** Part-to-whole at a glance. Segments are also listed with values beneath. */
@Composable
fun DonutChart(
    segments: List<Triple<String, Float, Color>>,
    centerValue: String,
    centerLabel: String,
    modifier: Modifier = Modifier,
    size: Int = 150,
) {
    val t = SpotOnTheme.tokens
    val total = segments.sumOf { it.second.toDouble() }.toFloat().takeIf { it > 0f } ?: 1f
    Box(modifier.size(size.dp), contentAlignment = Alignment.Center) {
        Canvas(Modifier.fillMaxSize()) {
            val stroke = 15.dp.toPx()
            val inset = stroke / 2
            var start = -90f
            segments.forEach { (_, value, color) ->
                val sweep = value / total * 360f
                // 2dp gap between segments, expressed in degrees at this radius
                val gapDeg = 2.5f
                drawArc(
                    color = color,
                    startAngle = start,
                    sweepAngle = (sweep - gapDeg).coerceAtLeast(0.5f),
                    useCenter = false,
                    topLeft = Offset(inset, inset),
                    size = Size(this.size.width - stroke, this.size.height - stroke),
                    style = Stroke(width = stroke),
                )
                start += sweep
            }
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(centerValue, style = MaterialTheme.typography.titleLarge, color = t.ink900)
            Text(centerLabel, style = MaterialTheme.typography.bodySmall, color = t.ink400)
        }
    }
}

/** Horizontal bars with the value always printed — the phone's workhorse comparison. */
@Composable
fun HBarList(
    rows: List<Triple<String, Float, String>>,
    modifier: Modifier = Modifier,
    color: Color = MaterialTheme.colorScheme.primary,
) {
    val t = SpotOnTheme.tokens
    val max = rows.maxOfOrNull { it.second }?.takeIf { it > 0f } ?: 1f
    Column(modifier.fillMaxWidth()) {
        rows.forEachIndexed { i, (label, value, valueText) ->
            if (i > 0) Spacer(Modifier.height(12.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(
                    label,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium,
                    color = t.ink800,
                    modifier = Modifier.weight(1f, fill = false),
                    maxLines = 1,
                )
                Spacer(Modifier.width(8.dp))
                Text(valueText, style = MaterialTheme.typography.bodyMedium, color = t.ink500, maxLines = 1)
            }
            Spacer(Modifier.height(5.dp))
            MeterBar(value / max, color)
        }
    }
}

/** Sequential magnitude: one hue, light to dark. Never a rainbow. */
@Composable
fun HeatGrid(
    rowLabels: List<String>,
    colLabels: List<String>,
    values: List<List<Float>>,
    modifier: Modifier = Modifier,
    valueFormat: (Float) -> String = { Fmt.usdShort(it.roundToInt()) },
) {
    val t = SpotOnTheme.tokens
    val base = MaterialTheme.colorScheme.primary
    val max = values.flatten().maxOrNull()?.takeIf { it > 0f } ?: 1f
    var sel by remember { mutableStateOf<Pair<Int, Int>?>(null) }

    Column(modifier.fillMaxWidth()) {
        Row(Modifier.fillMaxWidth().padding(bottom = 6.dp)) {
            val s = sel
            if (s != null) {
                Text(
                    "${rowLabels[s.first]} · ${colLabels[s.second]}",
                    style = MaterialTheme.typography.labelMedium, color = t.ink900,
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    valueFormat(values[s.first][s.second]),
                    style = MaterialTheme.typography.labelMedium, color = t.ink700,
                )
            } else {
                Text("Tap a cell for its average", style = MaterialTheme.typography.bodySmall, color = t.ink300)
            }
        }
        Row(Modifier.fillMaxWidth()) {
            Spacer(Modifier.width(34.dp))
            colLabels.forEach { c ->
                Text(
                    c, modifier = Modifier.weight(1f),
                    style = MaterialTheme.typography.labelSmall, color = t.ink400,
                    fontSize = 9.sp, maxLines = 1,
                )
            }
        }
        Spacer(Modifier.height(4.dp))
        rowLabels.forEachIndexed { ri, r ->
            Row(Modifier.fillMaxWidth().padding(vertical = 1.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(
                    r, modifier = Modifier.width(34.dp),
                    style = MaterialTheme.typography.labelSmall, color = t.ink400, maxLines = 1,
                )
                colLabels.indices.forEach { ci ->
                    val v = values[ri][ci]
                    val alpha = 0.10f + (v / max) * 0.90f
                    Box(
                        Modifier
                            .weight(1f)
                            .padding(1.dp)
                            .height(26.dp)
                            .clip(RoundedCornerShape(3.dp))
                            .background(base.copy(alpha = alpha))
                            .pointerInput(ri, ci) { detectTapGestures { sel = ri to ci } },
                    )
                }
            }
        }
        Spacer(Modifier.height(8.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End, verticalAlignment = Alignment.CenterVertically) {
            Text("Less", style = MaterialTheme.typography.bodySmall, color = t.ink400)
            Spacer(Modifier.width(6.dp))
            listOf(0.15f, 0.35f, 0.55f, 0.75f, 0.95f).forEach { a ->
                Box(Modifier.size(width = 18.dp, height = 10.dp).background(base.copy(alpha = a)))
            }
            Spacer(Modifier.width(6.dp))
            Text("More", style = MaterialTheme.typography.bodySmall, color = t.ink400)
        }
    }
}
