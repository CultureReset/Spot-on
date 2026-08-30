"use client";

import React from "react";
import { Card, CardHeader, PageHeader, Stat, Button, Segmented, Table, Td, Tr } from "@/components/ui";
import { ChartFrame, LineChart, BarChart, HBarChart, HeatGrid, Legend } from "@/components/charts";
import { useRangeDays, useSession } from "@/lib/session";
import { hourly, channels, paymentTypes, menuCategories, menuItems, days90 } from "@/lib/data";
import { usd, usdc, num, pctPlain } from "@/lib/format";
import { IconDownload, IconPrinter } from "@/components/shell/icons";

const METRICS = ["Net sales", "Orders", "Guests", "Avg. ticket"] as const;
type Metric = (typeof METRICS)[number];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PARTS = ["Breakfast", "Lunch", "Happy hr", "Dinner", "Late"];

export default function SalesPage() {
  const { range } = useSession();
  const { rows, prev, delta } = useRangeDays();
  const [metric, setMetric] = React.useState<Metric>("Net sales");

  const net = rows.reduce((a, r) => a + r.net, 0);
  const gross = rows.reduce((a, r) => a + r.gross, 0);
  const ordersCount = rows.reduce((a, r) => a + r.orders, 0);
  const guests = rows.reduce((a, r) => a + r.guests, 0);
  const discounts = rows.reduce((a, r) => a + r.discounts, 0);
  const refunds = rows.reduce((a, r) => a + r.refunds, 0);
  const comps = rows.reduce((a, r) => a + r.comps, 0);
  const tips = rows.reduce((a, r) => a + r.tips, 0);
  const tax = Math.round(net * 0.08625);

  const seriesValues = (r: (typeof rows)[number]) =>
    metric === "Net sales" ? r.net
      : metric === "Orders" ? r.orders
      : metric === "Guests" ? r.guests
      : r.orders ? r.net / r.orders : 0;

  const fmt = (n: number) =>
    metric === "Net sales" ? usd(n) : metric === "Avg. ticket" ? usdc(n) : num(Math.round(n));

  /** Weekday x day-part average, over the full history so the pattern is stable. */
  const heat = React.useMemo(() => {
    const grid = DAYS.map(() => PARTS.map(() => 0));
    const share = [0.07, 0.24, 0.13, 0.44, 0.12];
    days90.forEach((d) => {
      const row = d.date.getDay();
      share.forEach((s, i) => { grid[row][i] += d.net * s; });
    });
    return grid.map((r) => r.map((v) => Math.round(v / 13)));
  }, []);

  const byCategory = menuCategories
    .map((c) => ({
      label: c,
      value: menuItems.filter((m) => m.category === c).reduce((a, m) => a + m.net, 0),
    }))
    .sort((a, b) => b.value - a.value);

  const summaryLines: Array<[string, number, boolean]> = [
    ["Gross sales", gross, false],
    ["Discounts", -discounts, false],
    ["Comps", -comps, false],
    ["Refunds", -refunds, false],
    ["Net sales", net, true],
    ["Sales tax", tax, false],
    ["Tips", tips, false],
    ["Total collected", net + tax + tips, true],
  ];

  return (
    <>
      <PageHeader
        title="Sales"
        subtitle={`Revenue performance for ${range.toLowerCase()}`}
        actions={
          <>
            <Button size="sm" onClick={() => window.print()}><IconPrinter size={15} /> Print</Button>
            <Button size="sm"><IconDownload size={15} /> Export CSV</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Net sales" value={usd(net)} delta={delta("net")} />
        <Stat label="Gross sales" value={usd(gross)} delta={delta("gross")} />
        <Stat label="Orders" value={num(ordersCount)} delta={delta("orders")} />
        <Stat label="Guests" value={num(guests)} delta={delta("guests")} />
        <Stat label="Avg. ticket" value={usdc(ordersCount ? net / ordersCount : 0)} hint="per order" />
        <Stat label="Avg. per guest" value={usdc(guests ? net / guests : 0)} hint="per cover" />
      </div>

      <Card className="mb-5">
        <CardHeader
          title="Trend"
          subtitle="Current period against the equivalent prior period"
          action={<Segmented options={[...METRICS]} value={metric} onChange={(v) => setMetric(v as Metric)} size="sm" />}
        />
        <ChartFrame
          label={`${metric} over time`}
          tableColumns={["Day", "This period", "Prior period"]}
          tableRows={rows.map((r, i) => [r.label, fmt(seriesValues(r)), fmt(prev[i] ? seriesValues(prev[i]) : 0)])}
        >
          <LineChart
            labels={rows.map((r) => r.label)}
            area
            height={280}
            format={fmt}
            series={[
              { key: "curr", label: "This period", color: "var(--color-s1)", values: rows.map(seriesValues) },
              { key: "prev", label: "Prior period", color: "#9aa6b6", values: rows.map((_, i) => (prev[i] ? seriesValues(prev[i]) : 0)) },
            ]}
          />
          <Legend items={[
            { label: "This period", color: "var(--color-s1)" },
            { label: "Prior period", color: "#9aa6b6" },
          ]} />
        </ChartFrame>
      </Card>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Sales by hour" subtitle="Where the day's revenue actually lands" />
          <ChartFrame
            label="Net sales by hour"
            tableColumns={["Hour", "Net sales", "Orders"]}
            tableRows={hourly.map((h) => [h.label, usd(h.net), num(h.orders)])}
          >
            <BarChart labels={hourly.map((h) => h.label)} values={hourly.map((h) => h.net)} height={240} format={usd} />
          </ChartFrame>
        </Card>

        <Card>
          <CardHeader title="Day part by weekday" subtitle="Average net sales · trailing 90 days" />
          <HeatGrid rows={DAYS} cols={PARTS} values={heat} format={usd} />
        </Card>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="By order channel" subtitle={range} />
          <HBarChart rows={channels.map((c) => ({ label: c.name, value: c.net, sub: `${num(c.orders)} orders` }))} format={usd} />
        </Card>
        <Card>
          <CardHeader title="By menu category" subtitle={range} />
          <HBarChart rows={byCategory.slice(0, 7)} format={usd} />
        </Card>
        <Card>
          <CardHeader title="By payment type" subtitle={range} />
          <HBarChart rows={paymentTypes.map((p) => ({ label: p.name, value: p.amount, sub: `${num(p.count)}` }))} format={usd} />
        </Card>
      </div>

      <Card padded={false}>
        <div className="p-4 sm:p-5">
          <CardHeader title="Sales summary" subtitle="How gross sales reconcile to what you were paid" />
        </div>
        <Table
          columns={[
            { key: "line", label: "Line" },
            { key: "amount", label: "Amount", align: "right" },
            { key: "share", label: "% of net", align: "right" },
          ]}
        >
          {summaryLines.map(([label, amount, strong]) => (
            <Tr key={label}>
              <Td strong={strong}>{label}</Td>
              <Td align="right" strong={strong}>
                {amount < 0 ? `(${usd(Math.abs(amount))})` : usd(amount)}
              </Td>
              <Td align="right">{net ? pctPlain((amount / net) * 100) : "—"}</Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
