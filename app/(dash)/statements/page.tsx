"use client";

import React from "react";
import {
  Card, CardHeader, PageHeader, Button, Badge, Stat, Tabs, Table, Td, Tr, Drawer,
} from "@/components/ui";
import { ChartFrame, LineChart, HBarChart } from "@/components/charts";
import { deposits, paymentTypes, days90, type Deposit } from "@/lib/data";
import { usd, usdc, num, pctPlain } from "@/lib/format";
import { IconDownload, IconMoney } from "@/components/shell/icons";

export default function StatementsPage() {
  const [tab, setTab] = React.useState("Deposits");
  const [selected, setSelected] = React.useState<Deposit | null>(null);

  const paid = deposits.filter((d) => d.status === "Paid");
  const totalNet = deposits.reduce((a, d) => a + d.net, 0);
  const totalFees = deposits.reduce((a, d) => a + d.fees, 0);
  const totalGross = deposits.reduce((a, d) => a + d.gross, 0);
  const effectiveRate = totalGross ? (totalFees / totalGross) * 100 : 0;
  const inTransit = deposits.filter((d) => d.status !== "Paid").reduce((a, d) => a + d.net, 0);

  const payoutTrend = days90.slice(-30).map((d) => ({
    label: d.label,
    value: Math.round(d.gross * 0.974),
  }));

  return (
    <>
      <PageHeader
        title="Statements"
        subtitle="Deposits, processing fees and the batches behind every payout"
        actions={
          <>
            <Button size="sm">Bank settings</Button>
            <Button size="sm" variant="primary"><IconDownload size={15} /> Download statement</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Deposited" value={usd(totalNet)} hint={`${paid.length} settled payouts`} />
        <Stat label="In transit" value={usd(inTransit)} hint="arriving in 1–2 business days" />
        <Stat label="Processing fees" value={usd(totalFees)} hint="all card brands" />
        <Stat label="Effective rate" value={pctPlain(effectiveRate, 2)} hint="fees over gross volume" />
        <Stat label="Bank account" value="•••4417" hint="Wells Fargo checking" />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Daily payouts" subtitle="Net deposited to your bank · last 30 days" />
          <ChartFrame
            label="Daily net payouts"
            tableColumns={["Day", "Net payout"]}
            tableRows={payoutTrend.map((p) => [p.label, usd(p.value)])}
          >
            <LineChart
              labels={payoutTrend.map((p) => p.label)}
              area
              height={240}
              format={usd}
              series={[{ key: "p", label: "Net payout", color: "var(--color-s1)", values: payoutTrend.map((p) => p.value) }]}
            />
          </ChartFrame>
        </Card>

        <Card>
          <CardHeader title="Volume by card brand" subtitle="What you are actually being charged on" />
          <HBarChart
            rows={paymentTypes.filter((p) => p.name !== "Cash" && p.name !== "Gift card")
              .map((p) => ({ label: p.name, value: p.amount, sub: `${num(p.count)}` }))}
            format={usd}
          />
          <p className="mt-4 border-t border-ink-50 pt-3 text-[12.5px] leading-relaxed text-ink-400">
            Amex carries the highest per-transaction rate. It is{" "}
            <span className="font-medium text-ink-700">
              {pctPlain((paymentTypes[2].amount / paymentTypes.reduce((a, p) => a + p.amount, 0)) * 100)}
            </span>{" "}
            of your volume.
          </p>
        </Card>
      </div>

      <Card padded={false}>
        <div className="px-4 pt-4 sm:px-5">
          <Tabs tabs={["Deposits", "Fees", "Batches"]} active={tab} onChange={setTab} />
        </div>

        {tab === "Deposits" && (
          <Table
            columns={[
              { key: "date", label: "Deposit date" },
              { key: "gross", label: "Gross", align: "right", hideOn: "hidden md:table-cell" },
              { key: "fees", label: "Fees", align: "right", hideOn: "hidden sm:table-cell" },
              { key: "refunds", label: "Refunds", align: "right", hideOn: "hidden lg:table-cell" },
              { key: "net", label: "Net deposit", align: "right" },
              { key: "status", label: "Status", align: "right" },
            ]}
          >
            {deposits.map((d) => (
              <Tr key={d.id}>
                <Td strong>
                  <button onClick={() => setSelected(d)} className="ring-focus rounded text-left hover:text-brand-600 hover:underline">
                    {d.date}
                  </button>
                  <span className="mt-0.5 block text-[11.5px] font-normal text-ink-400">
                    {d.batches} {d.batches === 1 ? "batch" : "batches"} · {d.account}
                  </span>
                </Td>
                <Td align="right" className="hidden md:table-cell">{usd(d.gross)}</Td>
                <Td align="right" className="hidden sm:table-cell">({usd(d.fees)})</Td>
                <Td align="right" className="hidden lg:table-cell">{d.refunds ? `(${usd(d.refunds)})` : "—"}</Td>
                <Td align="right" strong>{usd(d.net)}</Td>
                <Td align="right">
                  <Badge tone={d.status === "Paid" ? "good" : d.status === "In transit" ? "info" : "warning"}>
                    {d.status}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Table>
        )}

        {tab === "Fees" && (
          <div className="p-4 sm:p-5">
            <p className="mb-4 text-[13px] text-ink-500">
              Processing fees for the period, broken out by what generated them.
            </p>
            <Table
              columns={[
                { key: "line", label: "Fee type" },
                { key: "count", label: "Transactions", align: "right" },
                { key: "rate", label: "Rate", align: "right", hideOn: "hidden sm:table-cell" },
                { key: "amount", label: "Amount", align: "right" },
              ]}
            >
              {[
                ["Card present — Visa/Mastercard/Discover", 4820, "2.35% + $0.10", totalFees * 0.58],
                ["Card present — Amex", 940, "2.89% + $0.10", totalFees * 0.17],
                ["Card not present (online orders)", 1210, "2.90% + $0.30", totalFees * 0.19],
                ["Chargebacks and retrievals", 3, "$15.00 each", 45],
                ["Monthly platform fee", 1, "Flat", totalFees * 0.05],
              ].map(([line, count, rate, amount]) => (
                <Tr key={line as string}>
                  <Td strong>{line as string}</Td>
                  <Td align="right">{num(count as number)}</Td>
                  <Td align="right" className="hidden sm:table-cell">{rate as string}</Td>
                  <Td align="right">{usd(amount as number)}</Td>
                </Tr>
              ))}
              <Tr className="bg-ink-50">
                <Td strong>Total fees</Td>
                <Td align="right">—</Td>
                <Td align="right" className="hidden sm:table-cell">{pctPlain(effectiveRate, 2)} effective</Td>
                <Td align="right" strong>{usd(totalFees)}</Td>
              </Tr>
            </Table>
          </div>
        )}

        {tab === "Batches" && (
          <Table
            columns={[
              { key: "batch", label: "Batch" },
              { key: "closed", label: "Closed", hideOn: "hidden sm:table-cell" },
              { key: "count", label: "Transactions", align: "right", hideOn: "hidden md:table-cell" },
              { key: "amount", label: "Amount", align: "right" },
              { key: "deposit", label: "Deposited", align: "right", hideOn: "hidden lg:table-cell" },
            ]}
          >
            {deposits.flatMap((d) =>
              Array.from({ length: d.batches }, (_, i) => (
                <Tr key={`${d.id}-${i}`}>
                  <Td strong className="tnum">B{d.id.split("-")[1]}-{i + 1}</Td>
                  <Td className="hidden sm:table-cell">{d.date}, 11:59 PM</Td>
                  <Td align="right" className="hidden md:table-cell">{num(Math.round(180 / d.batches))}</Td>
                  <Td align="right">{usdc(d.gross / d.batches)}</Td>
                  <Td align="right" className="hidden lg:table-cell">{d.date}</Td>
                </Tr>
              ))
            )}
          </Table>
        )}
      </Card>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Deposit detail">
        {selected && (
          <div className="space-y-5">
            <div className="rounded-xl bg-ink-900 p-4 text-white">
              <p className="text-[12px] uppercase tracking-wide text-ink-300">Net deposit</p>
              <p className="mt-1 text-[30px] font-semibold leading-none">{usd(selected.net)}</p>
              <p className="mt-2 text-[12.5px] text-ink-300">
                {selected.date} · {selected.account}
              </p>
            </div>

            <dl className="space-y-2 text-[13px]">
              {[
                ["Gross sales", selected.gross],
                ["Processing fees", -selected.fees],
                ["Refunds", -selected.refunds],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between">
                  <dt className="text-ink-500">{k as string}</dt>
                  <dd className="tnum text-ink-900">
                    {(v as number) < 0 ? `(${usd(Math.abs(v as number))})` : usd(v as number)}
                  </dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-ink-100 pt-2 text-[15px] font-semibold">
                <dt>Net deposit</dt>
                <dd className="tnum">{usd(selected.net)}</dd>
              </div>
            </dl>

            <div className="flex items-start gap-2.5 rounded-lg bg-ink-50 p-3.5">
              <IconMoney size={17} className="mt-0.5 shrink-0 text-ink-400" />
              <p className="text-[12.5px] leading-relaxed text-ink-500">
                {selected.status === "Paid"
                  ? "This deposit has settled to your bank account."
                  : "Funds are on the way. Deposits normally land in one to two business days."}
              </p>
            </div>

            <Button size="sm" className="w-full"><IconDownload size={15} /> Download this statement</Button>
          </div>
        )}
      </Drawer>
    </>
  );
}
