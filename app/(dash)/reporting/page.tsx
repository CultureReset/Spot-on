"use client";

import React from "react";
import { Card, CardHeader, PageHeader, Button, SearchInput, Badge, Table, Td, Tr, Empty, cx } from "@/components/ui";
import { ChartFrame, LineChart, Legend } from "@/components/charts";
import { reportCatalog, days90 } from "@/lib/data";
import { useRangeDays, useSession } from "@/lib/session";
import { usd, num, pctPlain } from "@/lib/format";
import { IconDownload, IconReport, IconChevronRight, IconCalendar } from "@/components/shell/icons";

/** A saved report the operator opens most days. */
const PINNED = ["Daily recap", "Labor vs. sales", "Product mix (PMIX)", "Payment summary"];

export default function ReportingPage() {
  const { range } = useSession();
  const { rows } = useRangeDays();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState<string | null>("Daily recap");

  const total = reportCatalog.reduce((a, g) => a + g.items.length, 0);

  const filtered = reportCatalog
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => i.toLowerCase().includes(query.toLowerCase())),
    }))
    .filter((g) => g.items.length > 0);

  // The preview pane renders the Daily recap — the report operators live in.
  const net = rows.reduce((a, r) => a + r.net, 0);
  const labor = rows.reduce((a, r) => a + r.labor, 0);

  return (
    <>
      <PageHeader
        title="Reporting"
        subtitle={`${total} built-in reports · scoped to ${range.toLowerCase()}`}
        actions={
          <>
            <Button size="sm"><IconCalendar size={15} /> Schedule delivery</Button>
            <Button size="sm" variant="primary"><IconDownload size={15} /> Export</Button>
          </>
        }
      />

      {/* pinned */}
      <div className="mb-5">
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-400">Pinned</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PINNED.map((r) => (
            <button
              key={r}
              onClick={() => setOpen(r)}
              className={cx(
                "ring-focus flex items-center gap-3 rounded-xl border bg-white p-3.5 text-left transition-colors",
                open === r ? "border-brand-500 bg-brand-50" : "border-ink-100 hover:border-ink-200"
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-white">
                <IconReport size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium text-ink-900">{r}</span>
                <span className="block text-[11.5px] text-ink-400">Updated just now</span>
              </span>
              <IconChevronRight size={15} className="shrink-0 text-ink-300" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* -------------------------------------------------------- catalogue */}
        <Card className="h-fit">
          <CardHeader title="All reports" subtitle="Grouped by what they answer" />
          <SearchInput value={query} onChange={setQuery} placeholder="Search reports…" className="mb-4" />
          {filtered.length === 0 ? (
            <Empty title="No reports match" body={`Nothing in the catalogue matches "${query}".`} />
          ) : (
            <div className="max-h-[640px] space-y-4 overflow-y-auto scroll-thin pr-1">
              {filtered.map((g) => (
                <div key={g.group}>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[.07em] text-ink-300">
                    {g.group}
                  </p>
                  <ul className="space-y-0.5">
                    {g.items.map((i) => (
                      <li key={i}>
                        <button
                          onClick={() => setOpen(i)}
                          className={cx(
                            "ring-focus flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors",
                            open === i ? "bg-brand-50 font-medium text-brand-600" : "text-ink-700 hover:bg-ink-50"
                          )}
                        >
                          <span className="truncate">{i}</span>
                          {PINNED.includes(i) && <Badge tone="neutral">Pinned</Badge>}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ---------------------------------------------------------- preview */}
        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader
              title={open ?? "Select a report"}
              subtitle={`${range} · Harborview Kitchen — Downtown`}
              action={
                <div className="flex gap-2">
                  <Button size="sm">Save view</Button>
                  <Button size="sm" variant="primary"><IconDownload size={14} /> CSV</Button>
                </div>
              }
            />

            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Net sales", usd(net)],
                ["Labor cost", usd(labor)],
                ["Labor %", pctPlain(net ? (labor / net) * 100 : 0)],
                ["Orders", num(rows.reduce((a, r) => a + r.orders, 0))],
              ].map(([l, v]) => (
                <div key={l} className="rounded-lg bg-ink-50 px-3 py-2.5">
                  <p className="text-[11.5px] text-ink-400">{l}</p>
                  <p className="mt-0.5 text-[17px] font-semibold text-ink-900">{v}</p>
                </div>
              ))}
            </div>

            {/* Labor and sales share one axis because both are dollars. The
                labor *rate* gets its own chart below rather than a second axis. */}
            <ChartFrame
              label="Net sales and labor cost"
              tableColumns={["Day", "Net sales", "Labor cost", "Labor %"]}
              tableRows={rows.map((r) => [
                r.label, usd(r.net), usd(r.labor), pctPlain((r.labor / r.net) * 100),
              ])}
            >
              <LineChart
                labels={rows.map((r) => r.label)}
                height={260}
                format={usd}
                series={[
                  { key: "net", label: "Net sales", color: "var(--color-s1)", values: rows.map((r) => r.net) },
                  { key: "labor", label: "Labor cost", color: "var(--color-s2)", values: rows.map((r) => r.labor) },
                ]}
              />
              <Legend items={[
                { label: "Net sales", color: "var(--color-s1)" },
                { label: "Labor cost", color: "var(--color-s2)" },
              ]} />
            </ChartFrame>
          </Card>

          <Card padded={false}>
            <div className="p-4 sm:p-5">
              <CardHeader title="Detail" subtitle="Every row behind the numbers above" />
            </div>
            <Table
              columns={[
                { key: "date", label: "Date" },
                { key: "net", label: "Net sales", align: "right" },
                { key: "orders", label: "Orders", align: "right" },
                { key: "guests", label: "Guests", align: "right" },
                { key: "avg", label: "Avg. ticket", align: "right" },
                { key: "labor", label: "Labor", align: "right" },
                { key: "lpct", label: "Labor %", align: "right" },
              ]}
            >
              {[...rows].reverse().map((r) => {
                const lp = (r.labor / r.net) * 100;
                return (
                  <Tr key={r.label}>
                    <Td strong>{r.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</Td>
                    <Td align="right">{usd(r.net)}</Td>
                    <Td align="right">{num(r.orders)}</Td>
                    <Td align="right">{num(r.guests)}</Td>
                    <Td align="right">{usd(r.net / r.orders)}</Td>
                    <Td align="right">{usd(r.labor)}</Td>
                    <Td align="right">
                      <span className={lp > 30 ? "font-medium text-[color:var(--color-critical)]" : ""}>
                        {pctPlain(lp)}
                      </span>
                    </Td>
                  </Tr>
                );
              })}
            </Table>
            <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3 text-[12.5px] text-ink-400">
              <span>Showing {rows.length} of {days90.length} days on record</span>
              <span className="tnum">Generated {new Date().toLocaleDateString("en-US")}</span>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
