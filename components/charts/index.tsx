"use client";

import React from "react";
import { cx, Table, Td, Tr } from "@/components/ui";

/* ------------------------------------------------------------------ shared */

const GRID = "#e7ebed";   // hairline, one shade off surface — solid, never dashed
const AXIS_TEXT = "#6b7a8f";
const SURFACE = "#ffffff";

/** Measure the container so strokes stay a true 2px at any width. */
function useMeasure<T extends HTMLElement>(fallback = 720) {
  const ref = React.useRef<T | null>(null);
  const [w, setW] = React.useState(fallback);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const next = entry.contentRect.width;
      if (next > 0) setW(next);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** Nice-ish rounded ticks for a 0..max axis. */
function ticks(max: number, count = 4) {
  if (max <= 0) return [0];
  const raw = max / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? mag * 10;
  const out: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step) out.push(v);
  return out;
}

export type Tip = { x: number; y: number; rows: Array<{ label: string; value: string; color?: string }>; title: string };

function Tooltip({ tip, width }: { tip: Tip | null; width: number }) {
  if (!tip) return null;
  const flip = tip.x > width * 0.62;
  return (
    <div
      className="pointer-events-none absolute z-20 min-w-[132px] rounded-lg border border-ink-100 bg-white px-2.5 py-2 shadow-lg"
      style={{
        left: flip ? undefined : tip.x + 12,
        right: flip ? width - tip.x + 12 : undefined,
        top: Math.max(0, tip.y - 10),
      }}
      role="status"
    >
      <p className="mb-1 text-[11.5px] font-semibold text-ink-900">{tip.title}</p>
      {tip.rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-3 py-0.5">
          <span className="flex items-center gap-1.5 text-[11.5px] text-ink-500">
            {r.color && <span className="h-2 w-2 rounded-[2px]" style={{ background: r.color }} />}
            {r.label}
          </span>
          <span className="tnum text-[11.5px] font-medium text-ink-900">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Legend — always present for >= 2 series, so identity is never colour-alone. */
export function Legend({ items }: { items: Array<{ label: string; color: string }> }) {
  if (items.length < 2) return null;
  return (
    <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5 text-[12.5px] text-ink-500">
          <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: i.color }} />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

/**
 * Wraps a chart with its table-view twin. Every chart ships one, so no value is
 * reachable through hover alone.
 */
export function ChartFrame({
  children,
  tableColumns,
  tableRows,
  label,
}: {
  children: React.ReactNode;
  tableColumns: string[];
  tableRows: string[][];
  label: string;
}) {
  const [showTable, setShowTable] = React.useState(false);
  return (
    <div>
      <div className="mb-2 flex justify-end">
        <button
          onClick={() => setShowTable((v) => !v)}
          className="ring-focus rounded-md px-2 py-1 text-[12px] font-medium text-ink-400 hover:bg-ink-50 hover:text-ink-700"
          aria-pressed={showTable}
        >
          {showTable ? "Show chart" : "Show data table"}
        </button>
      </div>
      {showTable ? (
        <div className="max-h-[320px] overflow-y-auto scroll-thin">
          <Table columns={tableColumns.map((c, i) => ({ key: c, label: c, align: i === 0 ? "left" : "right" }))}>
            {tableRows.map((row) => (
              <Tr key={row[0]}>
                {row.map((cell, i) => (
                  <Td key={i} align={i === 0 ? "left" : "right"} strong={i === 0}>
                    {cell}
                  </Td>
                ))}
              </Tr>
            ))}
          </Table>
        </div>
      ) : (
        <figure aria-label={label}>{children}</figure>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- line/area */

export type Series = { key: string; label: string; color: string; values: number[] };

export function LineChart({
  labels,
  series,
  height = 240,
  area = false,
  format = (n: number) => String(Math.round(n)),
  yFormat,
  yDomain,
}: {
  labels: string[];
  series: Series[];
  height?: number;
  area?: boolean;
  format?: (n: number) => string;
  yFormat?: (n: number) => string;
  /** Explicit [min, max]. Use for bounded metrics where zero is not a meaningful floor. */
  yDomain?: [number, number];
}) {
  const [ref, w] = useMeasure<HTMLDivElement>();
  const [hover, setHover] = React.useState<number | null>(null);

  const padL = 46, padR = 12, padT = 12, padB = 26;
  const plotW = Math.max(40, w - padL - padR);
  const plotH = height - padT - padB;

  const max = Math.max(...series.flatMap((s) => s.values), 1);
  const yMin = yDomain ? yDomain[0] : 0;
  const yT = yDomain
    ? Array.from({ length: 5 }, (_, i) => yDomain[0] + ((yDomain[1] - yDomain[0]) / 4) * i)
    : ticks(max);
  const yMax = yT[yT.length - 1];
  const span = yMax - yMin || 1;

  const x = (i: number) => padL + (labels.length === 1 ? plotW / 2 : (i / (labels.length - 1)) * plotW);
  const y = (v: number) => padT + plotH - ((v - yMin) / span) * plotH;

  const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(" ");
  const areaPath = (vals: number[]) =>
    `${path(vals)} L${x(vals.length - 1).toFixed(2)},${padT + plotH} L${x(0).toFixed(2)},${padT + plotH} Z`;

  // label every nth tick so they never collide
  const stride = Math.max(1, Math.ceil(labels.length / Math.max(3, Math.floor(plotW / 64))));

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = Math.round(((px - padL) / plotW) * (labels.length - 1));
    setHover(Math.min(labels.length - 1, Math.max(0, i)));
  };

  const tip: Tip | null =
    hover === null
      ? null
      : {
          x: x(hover),
          y: Math.min(...series.map((s) => y(s.values[hover]))),
          title: labels[hover],
          rows: series.map((s) => ({ label: s.label, value: format(s.values[hover]), color: s.color })),
        };

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <div className="w-full overflow-hidden">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${w} ${height}`}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        style={{ display: "block", touchAction: "pan-y" }}
      >
        {/* recessive solid hairline grid */}
        {yT.map((t) => (
          <g key={t}>
            <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={AXIS_TEXT} className="tnum">
              {(yFormat ?? format)(t)}
            </text>
          </g>
        ))}

        {area && series[0] && (
          <path d={areaPath(series[0].values)} fill={series[0].color} opacity={0.08} />
        )}

        {series.map((s) => (
          <path
            key={s.key}
            d={path(s.values)}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* crosshair + markers, with a 2px surface ring so overlaps stay readable */}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + plotH} stroke="#9aa6b6" strokeWidth="1" />
            {series.map((s) => (
              <circle
                key={`m-${s.key}`}
                cx={x(hover)}
                cy={y(s.values[hover])}
                r="5"
                fill={s.color}
                stroke={SURFACE}
                strokeWidth="2"
              />
            ))}
          </g>
        )}

        {labels.map((l, i) => {
          const last = labels.length - 1;
          // Label on the stride, always label the last, and drop any strided
          // label that would sit on top of it.
          const show = i === last || (i % stride === 0 && last - i >= stride * 0.75);
          if (!show) return null;
          return (
            <text
              key={l + i}
              x={x(i)}
              y={height - 8}
              textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"}
              fontSize="11"
              fill={AXIS_TEXT}
            >
              {l}
            </text>
          );
        })}
      </svg>
      </div>
      <Tooltip tip={tip} width={w} />
    </div>
  );
}

/* ------------------------------------------------------------------- bars */

export function BarChart({
  labels,
  values,
  height = 220,
  color = "var(--color-s1)",
  format = (n: number) => String(Math.round(n)),
  highlight,
}: {
  labels: string[];
  values: number[];
  height?: number;
  color?: string;
  format?: (n: number) => string;
  /** index to emphasise; the rest recede (emphasis, not a value ramp) */
  highlight?: number;
}) {
  const [ref, w] = useMeasure<HTMLDivElement>();
  const [hover, setHover] = React.useState<number | null>(null);

  const padL = 46, padR = 12, padT = 12, padB = 26;
  const plotW = Math.max(40, w - padL - padR);
  const plotH = height - padT - padB;
  const max = Math.max(...values, 1);
  const yT = ticks(max);
  const yMax = yT[yT.length - 1];

  const slot = plotW / values.length;
  const barW = Math.max(3, Math.min(34, slot - 2)); // 2px surface gap between adjacent bars
  const bx = (i: number) => padL + i * slot + (slot - barW) / 2;
  const y = (v: number) => padT + plotH - (v / yMax) * plotH;
  const stride = Math.max(1, Math.ceil(labels.length / Math.max(3, Math.floor(plotW / 52))));

  const tip: Tip | null =
    hover === null
      ? null
      : { x: bx(hover) + barW / 2, y: y(values[hover]), title: labels[hover], rows: [{ label: "Value", value: format(values[hover]), color }] };

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <div className="w-full overflow-hidden">
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} role="img" style={{ display: "block" }}>
        {yT.map((t) => (
          <g key={t}>
            <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={AXIS_TEXT} className="tnum">
              {format(t)}
            </text>
          </g>
        ))}
        {values.map((v, i) => {
          const h = Math.max(2, (v / yMax) * plotH);
          const dim = highlight !== undefined && highlight !== i;
          return (
            <g key={i}>
              {/* generous hit target, independent of the thin mark */}
              <rect
                x={padL + i * slot}
                y={padT}
                width={slot}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
              <rect
                x={bx(i)}
                y={padT + plotH - h}
                width={barW}
                height={h}
                rx="4"     /* 4px rounded data-end, anchored to the baseline */
                fill={color}
                opacity={dim ? 0.28 : hover === i ? 0.85 : 1}
                pointerEvents="none"
              />
            </g>
          );
        })}
        {labels.map((l, i) => {
          const last = labels.length - 1;
          const show = i === last || (i % stride === 0 && last - i >= stride * 0.75);
          if (!show) return null;
          return (
            <text
              key={l + i}
              x={bx(i) + barW / 2}
              y={height - 8}
              textAnchor={i === last ? "end" : "middle"}
              fontSize="11"
              fill={AXIS_TEXT}
            >
              {l}
            </text>
          );
        })}
      </svg>
      </div>
      <Tooltip tip={tip} width={w} />
    </div>
  );
}

/* ------------------------------------------------------- horizontal bars */

export function HBarChart({
  rows,
  format = (n: number) => String(Math.round(n)),
  color = "var(--color-s1)",
}: {
  rows: Array<{ label: string; value: number; sub?: string }>;
  format?: (n: number) => string;
  color?: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="truncate text-[13px] font-medium text-ink-800">{r.label}</span>
            <span className="tnum shrink-0 text-[13px] text-ink-500">
              {format(r.value)}
              {r.sub && <span className="ml-2 text-ink-300">{r.sub}</span>}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max(1.5, (r.value / max) * 100)}%`, background: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ donut */

export function Donut({
  segments,
  centerLabel,
  centerValue,
  size = 168,
}: {
  segments: Array<{ label: string; value: number; color: string }>;
  centerLabel: string;
  centerValue: string;
  size?: number;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={centerLabel}>
        <g transform={`translate(${size / 2} ${size / 2}) rotate(-90)`}>
          {segments.map((s) => {
            const frac = s.value / total;
            // 2px surface gap between segments — a gap, never a border
            const dash = Math.max(0, frac * c - 2);
            const el = (
              <circle
                key={s.label}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += frac * c;
            return el;
          })}
        </g>
        <text x={size / 2} y={size / 2 - 2} textAnchor="middle" fontSize="20" fontWeight="600" fill="#090d12">
          {centerValue}
        </text>
        <text x={size / 2} y={size / 2 + 16} textAnchor="middle" fontSize="11" fill={AXIS_TEXT}>
          {centerLabel}
        </text>
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------- sparkline */

export function Sparkline({
  values,
  color = "var(--color-s1)",
  width = 96,
  height = 28,
}: {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const d = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / span) * (height - 4) - 2;
      return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={{ display: "block" }}>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* -------------------------------------------------------------- heat grid */

/** Sequential magnitude: ONE hue, light -> dark. Never a rainbow. */
export function HeatGrid({
  rows,
  cols,
  values,
  format,
}: {
  rows: string[];
  cols: string[];
  values: number[][];
  format: (n: number) => string;
}) {
  const max = Math.max(...values.flat(), 1);
  const [hover, setHover] = React.useState<{ r: number; c: number } | null>(null);
  return (
    <div className="scroll-thin overflow-x-auto">
      <div className="min-w-[520px]">
        <div className="flex">
          <div className="w-11 shrink-0" />
          {cols.map((c) => (
            <div key={c} className="flex-1 pb-1 text-center text-[10.5px] text-ink-400">
              {c}
            </div>
          ))}
        </div>
        {rows.map((r, ri) => (
          <div key={r} className="flex items-center">
            <div className="w-11 shrink-0 pr-2 text-right text-[11px] text-ink-400">{r}</div>
            {cols.map((c, ci) => {
              const v = values[ri][ci];
              const t = v / max;
              const on = hover?.r === ri && hover?.c === ci;
              return (
                <div key={c} className="relative flex-1 p-[1px]">
                  <div
                    className="h-7 rounded-[3px] transition-transform"
                    style={{
                      background: `color-mix(in oklab, var(--color-s1) ${8 + t * 92}%, #eef2f7)`,
                      transform: on ? "scale(1.06)" : undefined,
                    }}
                    onMouseEnter={() => setHover({ r: ri, c: ci })}
                    onMouseLeave={() => setHover(null)}
                    tabIndex={0}
                    onFocus={() => setHover({ r: ri, c: ci })}
                    onBlur={() => setHover(null)}
                    role="img"
                    aria-label={`${r} ${c}: ${format(v)}`}
                  />
                  {on && (
                    <div className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-[11px] font-medium text-white">
                      {format(v)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <div className="mt-3 flex items-center justify-end gap-2 text-[11px] text-ink-400">
          <span>Less</span>
          <div className="flex">
            {[10, 30, 50, 70, 90].map((s) => (
              <span
                key={s}
                className="h-3 w-6"
                style={{ background: `color-mix(in oklab, var(--color-s1) ${s}%, #eef2f7)` }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
