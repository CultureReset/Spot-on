"use client";

import React from "react";
import {
  Card, CardHeader, PageHeader, Button, SearchInput, Badge, Table, Td, Tr,
  Tabs, Stat, Drawer, Field, inputClass, Bar,
} from "@/components/ui";
import { ChartFrame, LineChart, BarChart, HBarChart, Legend } from "@/components/charts";
import { employees, type Employee } from "@/lib/data";
import { useRangeDays, useSession } from "@/lib/session";
import { usd, usdc, num, pctPlain, dur, initials } from "@/lib/format";
import { IconPlus, IconDownload } from "@/components/shell/icons";

const LABOR_TARGET = 28;

export default function EmployeesPage() {
  const { range } = useSession();
  const { rows, delta } = useRangeDays();
  const [tab, setTab] = React.useState("Roster");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Employee | null>(null);

  const net = rows.reduce((a, r) => a + r.net, 0);
  const labor = rows.reduce((a, r) => a + r.labor, 0);
  const tips = rows.reduce((a, r) => a + r.tips, 0);
  const laborPct = net ? (labor / net) * 100 : 0;
  const hours = employees.reduce((a, e) => a + e.hoursWeek, 0);
  const overtime = employees.reduce((a, e) => a + e.overtime, 0);
  const salesPerHour = hours ? net / hours : 0;

  const filtered = employees.filter((e) =>
    query ? e.name.toLowerCase().includes(query.toLowerCase()) || e.role.toLowerCase().includes(query.toLowerCase()) : true
  );

  const sellers = employees.filter((e) => e.sales > 0).sort((a, b) => b.sales - a.sales);
  const byRole = Array.from(new Set(employees.map((e) => e.role)))
    .map((r) => ({ label: r, value: employees.filter((e) => e.role === r).reduce((a, e) => a + e.hoursWeek * e.hourly, 0) }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <PageHeader
        title="Team & labor"
        subtitle="Staff, scheduled hours, tips and what labor is costing you"
        actions={
          <>
            <Button size="sm"><IconDownload size={15} /> Payroll export</Button>
            <Button size="sm" variant="primary"><IconPlus size={15} /> Add employee</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Labor cost" value={usd(labor)} delta={delta("labor")} invertDelta />
        <Stat
          label="Labor %"
          value={pctPlain(laborPct)}
          hint={`target ${LABOR_TARGET.toFixed(1)}%`}
          delta={laborPct - LABOR_TARGET}
          invertDelta
        />
        <Stat label="Scheduled hours" value={dur(hours * 60)} hint="this week" />
        <Stat label="Overtime" value={dur(overtime * 60)} hint={`${employees.filter((e) => e.overtime > 0).length} employees`} />
        <Stat label="Sales per labor hour" value={usdc(salesPerHour)} hint="revenue efficiency" />
      </div>

      {/* Labor cost and sales share one dollar axis; the labor *rate* gets its
          own chart rather than a second y-scale. */}
      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Labor cost against sales" subtitle={`Both in dollars · ${range}`} />
          <ChartFrame
            label="Net sales and labor cost by day"
            tableColumns={["Day", "Net sales", "Labor cost"]}
            tableRows={rows.map((r) => [r.label, usd(r.net), usd(r.labor)])}
          >
            <LineChart
              labels={rows.map((r) => r.label)}
              height={240}
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

        <Card>
          <CardHeader title="Labor as a share of sales" subtitle={`Target ${LABOR_TARGET}% · ${range}`} />
          <ChartFrame
            label="Labor percentage by day"
            tableColumns={["Day", "Labor %", "Over target"]}
            tableRows={rows.map((r) => {
              const lp = (r.labor / r.net) * 100;
              return [r.label, pctPlain(lp), lp > LABOR_TARGET ? `+${(lp - LABOR_TARGET).toFixed(1)}` : "—"];
            })}
          >
            <BarChart
              labels={rows.map((r) => r.label)}
              values={rows.map((r) => (r.labor / r.net) * 100)}
              height={240}
              format={(n) => `${n.toFixed(0)}%`}
            />
          </ChartFrame>
          <p className="mt-2 text-[12.5px] text-ink-400">
            {rows.filter((r) => (r.labor / r.net) * 100 > LABOR_TARGET).length} of {rows.length} days ran over
            the {LABOR_TARGET}% target.
          </p>
        </Card>
      </div>

      <Card padded={false}>
        <div className="px-4 pt-4 sm:px-5">
          <Tabs tabs={["Roster", "Server performance", "Labor by role", "Tips"]} active={tab} onChange={setTab} />
        </div>

        {tab === "Roster" && (
          <>
            <div className="px-4 py-4 sm:px-5">
              <SearchInput value={query} onChange={setQuery} placeholder="Search by name or role…" className="sm:max-w-xs" />
            </div>
            <Table
              columns={[
                { key: "name", label: "Employee" },
                { key: "role", label: "Role", hideOn: "hidden sm:table-cell" },
                { key: "rate", label: "Rate", align: "right", hideOn: "hidden lg:table-cell" },
                { key: "hours", label: "Hours", align: "right" },
                { key: "ot", label: "OT", align: "right", hideOn: "hidden md:table-cell" },
                { key: "sales", label: "Sales", align: "right", hideOn: "hidden md:table-cell" },
                { key: "status", label: "Status", align: "right" },
              ]}
            >
              {filtered.map((e) => (
                <Tr key={e.id}>
                  <Td strong>
                    <button onClick={() => setSelected(e)} className="ring-focus flex items-center gap-2.5 rounded text-left hover:text-brand-600">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[11px] font-semibold text-ink-600">
                        {initials(e.name)}
                      </span>
                      <span>
                        <span className="block hover:underline">{e.name}</span>
                        <span className="block text-[11.5px] font-normal text-ink-400 sm:hidden">{e.role}</span>
                      </span>
                    </button>
                  </Td>
                  <Td className="hidden sm:table-cell">{e.role}</Td>
                  <Td align="right" className="hidden lg:table-cell">{usdc(e.hourly)}/hr</Td>
                  <Td align="right">{e.hoursWeek.toFixed(1)}</Td>
                  <Td align="right" className="hidden md:table-cell">
                    {e.overtime > 0 ? (
                      <span className="font-medium text-[color:var(--color-warning)]">{e.overtime.toFixed(1)}</span>
                    ) : "—"}
                  </Td>
                  <Td align="right" className="hidden md:table-cell">{e.sales ? usd(e.sales) : "—"}</Td>
                  <Td align="right">
                    <Badge tone={e.status === "active" ? "good" : "neutral"}>
                      {e.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Table>
          </>
        )}

        {tab === "Server performance" && (
          <div className="p-4 sm:p-5">
            <Table
              columns={[
                { key: "name", label: "Server" },
                { key: "checks", label: "Checks", align: "right" },
                { key: "sales", label: "Sales", align: "right" },
                { key: "avg", label: "Avg. check", align: "right" },
                { key: "tips", label: "Tips", align: "right", hideOn: "hidden sm:table-cell" },
                { key: "rate", label: "Tip %", align: "right", hideOn: "hidden md:table-cell" },
              ]}
            >
              {sellers.map((e) => (
                <Tr key={e.id}>
                  <Td strong>{e.name}</Td>
                  <Td align="right">{num(e.checks)}</Td>
                  <Td align="right">
                    {usd(e.sales)}
                    <span className="mt-1 block w-24 justify-self-end">
                      <Bar value={e.sales} max={sellers[0].sales} />
                    </span>
                  </Td>
                  <Td align="right">{usdc(e.sales / e.checks)}</Td>
                  <Td align="right" className="hidden sm:table-cell">{usd(e.tips)}</Td>
                  <Td align="right" className="hidden md:table-cell">{pctPlain((e.tips / e.sales) * 100)}</Td>
                </Tr>
              ))}
            </Table>
          </div>
        )}

        {tab === "Labor by role" && (
          <div className="p-4 sm:p-5">
            <p className="mb-4 text-[13px] text-ink-500">Weekly labor cost by job code.</p>
            <HBarChart rows={byRole} format={usd} />
          </div>
        )}

        {tab === "Tips" && (
          <div className="p-4 sm:p-5">
            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Tips collected" value={usd(tips)} delta={delta("tips")} />
              <Stat label="Tip rate" value={pctPlain(net ? (tips / net) * 100 : 0)} hint="of net sales" />
              <Stat label="Pooled" value={usd(tips * 0.35)} hint="35% to support staff" />
              <Stat label="Direct" value={usd(tips * 0.65)} hint="retained by servers" />
            </div>
            <Table
              columns={[
                { key: "name", label: "Employee" },
                { key: "role", label: "Role", hideOn: "hidden sm:table-cell" },
                { key: "hours", label: "Hours", align: "right" },
                { key: "tips", label: "Tips earned", align: "right" },
                { key: "pool", label: "Pool share", align: "right", hideOn: "hidden md:table-cell" },
                { key: "total", label: "Payout", align: "right" },
              ]}
            >
              {employees.filter((e) => e.status === "active").map((e) => {
                const pool = e.sales === 0 ? (tips * 0.35) / employees.filter((x) => x.sales === 0).length : 0;
                return (
                  <Tr key={e.id}>
                    <Td strong>{e.name}</Td>
                    <Td className="hidden sm:table-cell">{e.role}</Td>
                    <Td align="right">{e.hoursWeek.toFixed(1)}</Td>
                    <Td align="right">{e.tips ? usd(e.tips * 0.65) : "—"}</Td>
                    <Td align="right" className="hidden md:table-cell">{pool ? usd(pool) : "—"}</Td>
                    <Td align="right" strong>{usd(e.tips * 0.65 + pool)}</Td>
                  </Tr>
                );
              })}
            </Table>
          </div>
        )}
      </Card>

      {/* ---------------------------------------------------- employee detail */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        footer={
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => setSelected(null)}>Cancel</Button>
            <Button size="sm" variant="primary" className="flex-1" onClick={() => setSelected(null)}>Save</Button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-[16px] font-semibold text-white">
                {initials(selected.name)}
              </span>
              <div>
                <p className="text-[15px] font-semibold text-ink-900">{selected.name}</p>
                <p className="text-[12.5px] text-ink-400">{selected.role} · hired {selected.hiredOn}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Email"><input defaultValue={selected.email} className={inputClass} /></Field>
              <Field label="Phone"><input defaultValue={selected.phone} className={inputClass} /></Field>
              <Field label="Hourly rate"><input defaultValue={selected.hourly.toFixed(2)} className={inputClass} /></Field>
              <Field label="POS PIN" hint="Used to clock in at the terminal.">
                <input defaultValue={selected.pin} className={inputClass} />
              </Field>
            </div>

            <div>
              <p className="mb-1.5 text-[13px] font-medium text-ink-700">Job codes</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.jobCodes.map((j) => <Badge key={j} tone="info">{j}</Badge>)}
              </div>
            </div>

            <div className="rounded-lg bg-ink-50 p-3.5">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-400">This week</p>
              <dl className="grid grid-cols-2 gap-y-2.5 text-[13px]">
                {[
                  ["Hours worked", dur(selected.hoursWeek * 60)],
                  ["Overtime", selected.overtime ? dur(selected.overtime * 60) : "None"],
                  ["Sales rung", selected.sales ? usd(selected.sales) : "—"],
                  ["Tips earned", selected.tips ? usd(selected.tips) : "—"],
                  ["Checks", selected.checks ? num(selected.checks) : "—"],
                  ["Labor cost", usd(selected.hoursWeek * selected.hourly)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[11.5px] text-ink-400">{k}</dt>
                    <dd className="font-medium text-ink-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
