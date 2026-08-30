"use client";

import React from "react";
import {
  Card, CardHeader, PageHeader, Button, Badge, Stat, Toggle, Tabs, Field, inputClass, Table, Td, Tr, cx,
} from "@/components/ui";
import { ChartFrame, LineChart, BarChart } from "@/components/charts";
import { onlineOrdering, days90, orders, menuItems } from "@/lib/data";
import { usd, usdc, num, pctPlain } from "@/lib/format";
import { IconOnline } from "@/components/shell/icons";

export default function OnlineOrderingPage() {
  const [tab, setTab] = React.useState("Overview");
  const [settings, setSettings] = React.useState(onlineOrdering.settings);
  const accepting = settings[0].value;

  const weekly = days90.slice(-28).map((d) => ({
    label: d.label,
    orders: Math.round(d.orders * 0.13),
    revenue: Math.round(d.net * 0.13),
  }));

  const onlineOrders = orders.filter((o) => o.channel === "Online" || o.channel === "Delivery" || o.channel === "Takeout");

  return (
    <>
      <PageHeader
        title="Online ordering"
        subtitle="Your commission-free ordering site, and how it is performing"
        actions={
          <>
            <Button size="sm">Preview site</Button>
            <Button size="sm" variant="primary">Edit site</Button>
          </>
        }
      />

      {/* live status banner — the single most consequential control on this page */}
      <div
        className={cx(
          "mb-5 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
          accepting
            ? "border-[color:var(--color-good)]/25 bg-[color:var(--color-good-bg)]/50"
            : "border-[color:var(--color-critical)]/25 bg-[color:var(--color-critical-bg)]/50"
        )}
      >
        <div className="flex items-start gap-3">
          <IconOnline size={20} className="mt-0.5 shrink-0 text-ink-700" />
          <div>
            <p className="text-[14px] font-semibold text-ink-900">
              {accepting ? "Accepting online orders" : "Online ordering is paused"}
            </p>
            <p className="mt-0.5 text-[12.5px] text-ink-500">
              <a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-brand-600 hover:underline">
                {onlineOrdering.url}
              </a>
              {" · "}
              {accepting
                ? `Quoting ${onlineOrdering.prepTime} minutes for pickup`
                : "Guests see a closed message at checkout"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-ink-700">{accepting ? "Live" : "Paused"}</span>
          <Toggle
            checked={accepting}
            onChange={(v) => setSettings((s) => s.map((x, i) => (i === 0 ? { ...x, value: v } : x)))}
            label="Accepting online orders"
          />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Orders this week" value={num(onlineOrdering.ordersThisWeek)} delta={9.8} />
        <Stat label="Revenue this week" value={usd(onlineOrdering.revenueThisWeek)} delta={14.2} />
        <Stat label="Avg. ticket" value={usdc(onlineOrdering.avgTicket)} hint="vs. $38.40 dine-in" />
        <Stat label="Prep time" value={`${onlineOrdering.prepTime} min`} hint="quoted at checkout" />
        <Stat label="Conversion" value={pctPlain(onlineOrdering.conversionRate)} hint="visits that order" />
      </div>

      <Card padded={false}>
        <div className="px-4 pt-4 sm:px-5">
          <Tabs tabs={["Overview", "Settings", "Menu availability", "Recent orders"]} active={tab} onChange={setTab} />
        </div>

        {tab === "Overview" && (
          <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-2">
            <div>
              <h3 className="mb-1 text-[15px] font-semibold text-ink-900">Online revenue</h3>
              <p className="mb-4 text-[13px] text-ink-500">Last 28 days.</p>
              <ChartFrame
                label="Online ordering revenue over time"
                tableColumns={["Day", "Revenue", "Orders"]}
                tableRows={weekly.map((w) => [w.label, usd(w.revenue), num(w.orders)])}
              >
                <LineChart
                  labels={weekly.map((w) => w.label)}
                  area
                  height={230}
                  format={usd}
                  series={[{ key: "r", label: "Revenue", color: "var(--color-s1)", values: weekly.map((w) => w.revenue) }]}
                />
              </ChartFrame>
            </div>
            <div>
              <h3 className="mb-1 text-[15px] font-semibold text-ink-900">Orders per day</h3>
              <p className="mb-4 text-[13px] text-ink-500">Last 28 days.</p>
              <ChartFrame
                label="Online orders per day"
                tableColumns={["Day", "Orders"]}
                tableRows={weekly.map((w) => [w.label, num(w.orders)])}
              >
                <BarChart
                  labels={weekly.map((w) => w.label)}
                  values={weekly.map((w) => w.orders)}
                  height={230}
                  format={(n) => num(Math.round(n))}
                />
              </ChartFrame>
            </div>
          </div>
        )}

        {tab === "Settings" && (
          <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-[15px] font-semibold text-ink-900">Fulfilment</h3>
              <ul className="divide-y divide-ink-50 rounded-xl border border-ink-100">
                {settings.map((s, i) => (
                  <li key={s.key} className="flex items-center justify-between gap-3 px-3.5 py-3">
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-medium text-ink-900">{s.key}</span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-ink-400">{s.hint}</span>
                    </span>
                    <Toggle
                      checked={s.value}
                      onChange={(v) => setSettings((st) => st.map((x, j) => (j === i ? { ...x, value: v } : x)))}
                      label={s.key}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-[15px] font-semibold text-ink-900">Site &amp; timing</h3>
              <Field label="Ordering URL"><input defaultValue={onlineOrdering.url} className={inputClass} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Pickup prep time"><input defaultValue={`${onlineOrdering.prepTime} minutes`} className={inputClass} /></Field>
                <Field label="Delivery radius"><input defaultValue="3 miles" className={inputClass} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Delivery minimum"><input defaultValue="$20.00" className={inputClass} /></Field>
                <Field label="Delivery fee"><input defaultValue="$4.99" className={inputClass} /></Field>
              </div>
              <Field label="Order-ahead window" hint="How far in advance guests can schedule.">
                <select className={inputClass} defaultValue="7 days">{["Same day only", "3 days", "7 days", "14 days"].map((o) => <option key={o}>{o}</option>)}</select>
              </Field>
            </div>
          </div>
        )}

        {tab === "Menu availability" && (
          <div className="p-4 sm:p-5">
            <p className="mb-4 text-[13px] text-ink-500">
              Items hidden here stay orderable in the dining room. Use this to keep prep-heavy dishes off the
              online menu at peak.
            </p>
            <Table
              columns={[
                { key: "item", label: "Item" },
                { key: "cat", label: "Category", hideOn: "hidden sm:table-cell" },
                { key: "price", label: "Online price", align: "right" },
                { key: "sold", label: "Online units", align: "right", hideOn: "hidden md:table-cell" },
                { key: "on", label: "Show online", align: "right" },
              ]}
            >
              {menuItems.slice(0, 12).map((m, i) => (
                <Tr key={m.id}>
                  <Td strong>{m.name}</Td>
                  <Td className="hidden sm:table-cell">{m.category}</Td>
                  <Td align="right">{usdc(m.price)}</Td>
                  <Td align="right" className="hidden md:table-cell">{num(Math.round(m.sold * 0.13))}</Td>
                  <Td align="right">
                    <div className="flex justify-end">
                      <Toggle checked={i % 7 !== 3} onChange={() => {}} label={`${m.name} online`} />
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>
          </div>
        )}

        {tab === "Recent orders" && (
          <Table
            columns={[
              { key: "ticket", label: "Ticket" },
              { key: "channel", label: "Type", hideOn: "hidden sm:table-cell" },
              { key: "items", label: "Items", align: "right", hideOn: "hidden md:table-cell" },
              { key: "total", label: "Total", align: "right" },
              { key: "status", label: "Status", align: "right" },
            ]}
          >
            {onlineOrders.map((o) => (
              <Tr key={o.id}>
                <Td strong>
                  {o.ticket}
                  <span className="ml-2 text-[11.5px] font-normal text-ink-400">{o.time}</span>
                </Td>
                <Td className="hidden sm:table-cell">{o.channel}</Td>
                <Td align="right" className="hidden md:table-cell">{o.items}</Td>
                <Td align="right" strong>{usdc(o.total)}</Td>
                <Td align="right">
                  <Badge tone={o.status === "Paid" ? "good" : o.status === "Open" ? "info" : "critical"}>
                    {o.status}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </>
  );
}
