"use client";

import React from "react";
import Link from "next/link";
import {
  Card, CardHeader, Stat, Badge, Button, Delta, Table, Td, Tr, Empty, cx,
} from "@/components/ui";
import { ChartFrame, LineChart, BarChart, HBarChart, Donut, Legend } from "@/components/charts";
import { useSession, useRangeDays } from "@/lib/session";
import {
  hourly, channels, menuItems, orders, customers, campaigns, reviews, reviewStats,
  insights, loyalty, TODAY,
} from "@/lib/data";
import { usd, usdc, num, pctPlain } from "@/lib/format";
import { IconSpark, IconChevronRight, IconDownload, IconStar } from "@/components/shell/icons";

export default function DashboardHome() {
  const { user, location, range } = useSession();
  const { rows, prev, delta } = useRangeDays();

  const net = rows.reduce((a, r) => a + r.net, 0);
  const ordersCount = rows.reduce((a, r) => a + r.orders, 0);
  const guests = rows.reduce((a, r) => a + r.guests, 0);
  const labor = rows.reduce((a, r) => a + r.labor, 0);
  const tips = rows.reduce((a, r) => a + r.tips, 0);
  const avgTicket = ordersCount ? net / ordersCount : 0;
  const laborPct = net ? (labor / net) * 100 : 0;
  const prevNet = prev.reduce((a, r) => a + r.net, 0);
  const prevLaborPct = prevNet ? (prev.reduce((a, r) => a + r.labor, 0) / prevNet) * 100 : 0;

  const labels = rows.map((r) => r.label);
  const topItems = menuItems.slice(0, 6);
  const recentOrders = orders.slice(0, 6);
  const newCustomers = customers.filter((c) => c.tier === "New").length;
  const liveCampaigns = campaigns.filter((c) => c.status === "Running" || c.status === "Scheduled");
  const needsReply = reviews.filter((r) => !r.replied);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  })();

  return (
    <>
      {/* ------------------------------------------------------------ header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight tracking-[-.01em] text-ink-900 sm:text-[26px]">
            {greeting}, {user?.name.split(" ")[0]}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-good)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--color-good)]" />
              </span>
              {location.name.split("—")[1]?.trim() ?? location.name} is open
            </span>
            <span className="text-ink-200">·</span>
            <span>{range}</span>
            <span className="text-ink-200">·</span>
            <span>
              {TODAY.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm"><IconDownload size={15} /> Export</Button>
          <Button size="sm" variant="primary" onClick={() => window.print()}>
            Daily recap
          </Button>
        </div>
      </div>

      {/* --------------------------------------------------------------- KPIs */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Net sales" value={usd(net)} delta={delta("net")} hint="vs. prior period" />
        <Stat label="Orders" value={num(ordersCount)} delta={delta("orders")} hint="vs. prior period" />
        <Stat label="Avg. ticket" value={usdc(avgTicket)} delta={delta("net") - delta("orders")} hint="per order" />
        <Stat
          label="Labor %"
          value={pctPlain(laborPct)}
          delta={laborPct - prevLaborPct}
          invertDelta
          hint="target 28.0%"
        />
        <Stat label="Guests" value={num(guests)} delta={delta("guests")} hint={`${usdc(net / (guests || 1))} per guest`} />
      </div>

      {/* ------------------------------------------------------------ insights */}
      <Card className="mb-5">
        <CardHeader
          title="Insights"
          subtitle="Patterns worth acting on, pulled from this location's POS data"
          action={<Badge tone="info">Profit Assist</Badge>}
        />
        <ul className="grid gap-3 lg:grid-cols-3">
          {insights.map((i) => (
            <li
              key={i.id}
              className={cx(
                "rounded-lg border p-3.5",
                i.tone === "warning" && "border-[color:var(--color-warning)]/25 bg-[color:var(--color-warning-bg)]/45",
                i.tone === "good" && "border-[color:var(--color-good)]/25 bg-[color:var(--color-good-bg)]/45",
                i.tone === "info" && "border-ink-100 bg-ink-50/60"
              )}
            >
              <p className="flex items-start gap-2 text-[13.5px] font-semibold leading-snug text-ink-900">
                <IconSpark size={16} className="mt-0.5 shrink-0 text-ink-500" />
                {i.title}
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-500">{i.body}</p>
              <Link
                href={i.href}
                className="ring-focus mt-2.5 inline-flex items-center gap-1 rounded text-[12.5px] font-medium text-brand-600 hover:underline"
              >
                {i.action} <IconChevronRight size={13} />
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      {/* --------------------------------------------------- sales + day parts */}
      <div className="mb-5 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Net sales"
            subtitle={`${range} compared with the previous ${rows.length === 1 ? "day" : `${rows.length} days`}`}
            action={<Delta value={delta("net")} />}
          />
          <ChartFrame
            label="Net sales, current period versus prior period"
            tableColumns={["Day", "This period", "Prior period"]}
            tableRows={rows.map((r, i) => [r.label, usd(r.net), usd(prev[i]?.net ?? 0)])}
          >
            <LineChart
              labels={labels}
              area
              height={260}
              format={(n) => usd(n)}
              series={[
                { key: "curr", label: "This period", color: "var(--color-s1)", values: rows.map((r) => r.net) },
                {
                  key: "prev",
                  label: "Prior period",
                  color: "#9aa6b6",
                  values: rows.map((_, i) => prev[i]?.net ?? 0),
                },
              ]}
            />
            <Legend items={[
              { label: "This period", color: "var(--color-s1)" },
              { label: "Prior period", color: "#9aa6b6" },
            ]} />
          </ChartFrame>
        </Card>

        <Card>
          <CardHeader title="Sales by hour" subtitle="Today, 8am – 11pm" />
          <ChartFrame
            label="Net sales by hour of day"
            tableColumns={["Hour", "Net sales", "Orders"]}
            tableRows={hourly.map((h) => [h.label, usd(h.net), num(h.orders)])}
          >
            <BarChart
              labels={hourly.map((h) => h.label)}
              values={hourly.map((h) => h.net)}
              height={260}
              format={(n) => usd(n)}
              highlight={hourly.reduce((best, h, i, a) => (h.net > a[best].net ? i : best), 0)}
            />
          </ChartFrame>
          <p className="mt-2 text-[12.5px] text-ink-400">
            Peak hour highlighted. Dinner service carries{" "}
            <span className="font-medium text-ink-700">
              {pctPlain(
                (hourly.filter((h) => h.hour >= 17).reduce((a, h) => a + h.net, 0) /
                  hourly.reduce((a, h) => a + h.net, 0)) * 100
              )}
            </span>{" "}
            of the day.
          </p>
        </Card>
      </div>

      {/* ------------------------------------------- channels + items + orders */}
      <div className="mb-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader title="Order channels" subtitle={`Share of net sales · ${range}`} />
          <Donut
            segments={channels.map((c) => ({ label: c.name, value: c.net, color: c.color }))}
            centerLabel="net sales"
            centerValue={usd(channels.reduce((a, c) => a + c.net, 0) / 1000) + "k"}
          />
          <Legend items={channels.map((c) => ({ label: c.name, color: c.color }))} />
          <div className="mt-4 space-y-2 border-t border-ink-50 pt-3">
            {channels.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 text-ink-700">
                  <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: c.color }} />
                  {c.name}
                </span>
                <span className="tnum text-ink-500">
                  {usd(c.net)}
                  <span className="ml-2 text-ink-300">{num(c.orders)} orders</span>
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Top selling items"
            subtitle={`By net sales · ${range}`}
            action={<Link href="/menus" className="text-[12.5px] font-medium text-brand-600 hover:underline">Menus</Link>}
          />
          <HBarChart
            rows={topItems.map((i) => ({ label: i.name, value: i.net, sub: `${num(i.sold)} sold` }))}
            format={(n) => usd(n)}
          />
        </Card>

        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader
            title="Recent orders"
            subtitle="Live from the point of sale"
            action={<Link href="/orders" className="text-[12.5px] font-medium text-brand-600 hover:underline">All orders</Link>}
          />
          <ul className="divide-y divide-ink-50">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center gap-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-[11px] font-semibold text-ink-500">
                  {o.channel === "Dine-in" ? o.table : o.channel.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="tnum text-[13px] font-medium text-ink-900">{o.ticket}</span>
                    <Badge tone={o.status === "Paid" ? "good" : o.status === "Open" ? "info" : "critical"}>
                      {o.status}
                    </Badge>
                  </span>
                  <span className="block truncate text-[12px] text-ink-400">
                    {o.channel} · {o.server} · {o.time}
                  </span>
                </span>
                <span className="tnum shrink-0 text-[13px] font-medium text-ink-900">{usdc(o.total)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* --------------------------------------- guests / campaigns / reviews */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader
            title="Customers"
            subtitle="Guest activity this period"
            action={<Link href="/customers" className="text-[12.5px] font-medium text-brand-600 hover:underline">View</Link>}
          />
          <div className="grid grid-cols-3 gap-3">
            {[
              ["New", num(newCustomers)],
              ["Returning", num(customers.length - newCustomers)],
              ["Loyalty members", num(loyalty.members)],
            ].map(([l, v]) => (
              <div key={l}>
                <p className="text-[22px] font-semibold leading-none text-ink-900">{v}</p>
                <p className="mt-1.5 text-[12px] text-ink-400">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-ink-50 pt-3">
            <p className="mb-2 text-[12.5px] font-medium text-ink-700">Top guests by spend</p>
            <ul className="space-y-1.5">
              {customers.slice(0, 3).map((c) => (
                <li key={c.id} className="flex items-center justify-between text-[13px]">
                  <span className="truncate text-ink-700">{c.name}</span>
                  <span className="tnum shrink-0 text-ink-500">
                    {usd(c.spend)} <span className="text-ink-300">· {c.visits} visits</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Campaigns"
            subtitle="Marketing in flight"
            action={<Link href="/campaigns" className="text-[12.5px] font-medium text-brand-600 hover:underline">View</Link>}
          />
          {liveCampaigns.length === 0 ? (
            <Empty title="Nothing scheduled" body="Create a campaign to bring guests back in." />
          ) : (
            <ul className="space-y-2.5">
              {liveCampaigns.map((c) => (
                <li key={c.id} className="rounded-lg border border-ink-100 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-medium leading-snug text-ink-900">{c.name}</p>
                    <Badge tone={c.status === "Running" ? "good" : "info"}>{c.status}</Badge>
                  </div>
                  <p className="mt-1 text-[12px] text-ink-400">
                    {c.channel} · {c.audience} · {c.date}
                  </p>
                  {c.sent > 0 && (
                    <p className="tnum mt-2 text-[12px] text-ink-500">
                      {num(c.sent)} sent · {num(c.opened)} opened · {usd(c.revenue)} attributed
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Reviews"
            subtitle="Across Google, Yelp, Facebook and SpotOn"
            action={<Link href="/reviews" className="text-[12.5px] font-medium text-brand-600 hover:underline">View</Link>}
          />
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[30px] font-semibold leading-none text-ink-900">{reviewStats.average}</p>
              <div className="mt-1.5 flex gap-0.5 text-[color:var(--color-s4)]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <IconStar
                    key={s}
                    size={14}
                    filled={s <= Math.round(reviewStats.average)}
                    className={s <= Math.round(reviewStats.average) ? "" : "text-ink-200"}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-[12px] text-ink-400">{num(reviewStats.total)} reviews</p>
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              {reviewStats.distribution.map((d) => {
                const max = Math.max(...reviewStats.distribution.map((x) => x.count));
                return (
                  <div key={d.stars} className="flex items-center gap-2">
                    <span className="tnum w-3 text-[11px] text-ink-400">{d.stars}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                      <span
                        className="block h-full rounded-full bg-[color:var(--color-s1)]"
                        style={{ width: `${(d.count / max) * 100}%` }}
                      />
                    </span>
                    <span className="tnum w-8 text-right text-[11px] text-ink-400">{d.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {needsReply.length > 0 && (
            <div className="mt-4 rounded-lg bg-[color:var(--color-warning-bg)]/60 px-3 py-2.5">
              <p className="text-[12.5px] font-medium text-ink-900">
                {needsReply.length} reviews awaiting a reply
              </p>
              <p className="mt-0.5 text-[12px] text-ink-500">
                Replying within 24 hours lifts your rating over time.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* tips footnote — small but genuinely useful to an owner */}
      <p className="mt-5 text-center text-[12.5px] text-ink-400">
        {usd(tips)} in tips collected this period · {usd(net + tips)} total collected
      </p>
    </>
  );
}
