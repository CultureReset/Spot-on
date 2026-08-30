"use client";

import React from "react";
import {
  Card, CardHeader, PageHeader, Button, Badge, Stat, Tabs, Table, Td, Tr,
  SearchInput, Field, inputClass, Drawer, Empty,
} from "@/components/ui";
import { ChartFrame, LineChart, HBarChart } from "@/components/charts";
import { giftCards, days90 } from "@/lib/data";
import { usd, usdc, num, pctPlain } from "@/lib/format";
import { IconPlus, IconGift } from "@/components/shell/icons";

export default function GiftCardsPage() {
  const [tab, setTab] = React.useState("Overview");
  const [query, setQuery] = React.useState("");
  const [issuing, setIssuing] = React.useState(false);

  const liability = days90.slice(-30).map((d, i) => ({
    label: d.label,
    value: Math.round(41000 + i * 62 + (d.orders % 300)),
  }));

  const filtered = giftCards.recent.filter((c) =>
    query ? c.code.toLowerCase().includes(query.toLowerCase()) : true
  );

  const netChange = giftCards.issuedThisMonth - giftCards.redeemedThisMonth;

  return (
    <>
      <PageHeader
        title="Gift cards"
        subtitle="Balances, liability and redemption across every terminal and the ordering site"
        actions={
          <>
            <Button size="sm">Check a balance</Button>
            <Button size="sm" variant="primary" onClick={() => setIssuing(true)}>
              <IconPlus size={15} /> Issue card
            </Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Outstanding balance" value={usd(giftCards.outstanding)} hint="your liability" />
        <Stat label="Active cards" value={num(giftCards.activeCards)} hint="with a balance" />
        <Stat label="Issued this month" value={usd(giftCards.issuedThisMonth)} delta={11.3} />
        <Stat label="Redeemed this month" value={usd(giftCards.redeemedThisMonth)} delta={8.1} />
        <Stat label="Breakage" value={pctPlain(giftCards.breakage)} hint="never redeemed" />
      </div>

      <Card padded={false}>
        <div className="px-4 pt-4 sm:px-5">
          <Tabs tabs={["Overview", "Cards", "Transactions"]} active={tab} onChange={setTab} />
        </div>

        {tab === "Overview" && (
          <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-2">
            <div>
              <h3 className="mb-1 text-[15px] font-semibold text-ink-900">Outstanding liability</h3>
              <p className="mb-4 text-[13px] text-ink-500">
                The total your guests could still redeem. It grows as you sell and falls as they spend.
              </p>
              <ChartFrame
                label="Gift card liability over time"
                tableColumns={["Day", "Outstanding"]}
                tableRows={liability.map((l) => [l.label, usd(l.value)])}
              >
                <LineChart
                  labels={liability.map((l) => l.label)}
                  area
                  height={230}
                  format={usd}
                  series={[{ key: "l", label: "Outstanding", color: "var(--color-s1)", values: liability.map((l) => l.value) }]}
                />
              </ChartFrame>
            </div>

            <div>
              <h3 className="mb-1 text-[15px] font-semibold text-ink-900">This month</h3>
              <p className="mb-4 text-[13px] text-ink-500">Issued against redeemed.</p>
              <HBarChart
                rows={[
                  { label: "Issued", value: giftCards.issuedThisMonth },
                  { label: "Redeemed", value: giftCards.redeemedThisMonth },
                ]}
                format={usd}
              />
              <div className="mt-5 rounded-lg bg-ink-50 p-3.5">
                <p className="text-[13px] font-medium text-ink-900">
                  Liability rose {usd(netChange)} this month
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">
                  You sold more than guests redeemed. That is cash in hand today, but it is money you owe in
                  food later — worth watching around the holidays.
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "Cards" && (
          <>
            <div className="px-4 py-4 sm:px-5">
              <SearchInput value={query} onChange={setQuery} placeholder="Search by card code…" className="sm:max-w-xs" />
            </div>
            {filtered.length === 0 ? (
              <div className="p-5"><Empty title="No cards found" body={`No card matches "${query}".`} /></div>
            ) : (
              <Table
                columns={[
                  { key: "code", label: "Card" },
                  { key: "balance", label: "Balance", align: "right" },
                  { key: "issued", label: "Issued", align: "right", hideOn: "hidden sm:table-cell" },
                  { key: "used", label: "Last used", align: "right", hideOn: "hidden md:table-cell" },
                  { key: "status", label: "Status", align: "right" },
                ]}
              >
                {filtered.map((c) => (
                  <Tr key={c.id}>
                    <Td strong>
                      <span className="flex items-center gap-2">
                        <IconGift size={16} className="shrink-0 text-ink-400" />
                        <span className="tnum">{c.code}</span>
                      </span>
                    </Td>
                    <Td align="right" strong>{usdc(c.balance)}</Td>
                    <Td align="right" className="hidden sm:table-cell">{c.issued}</Td>
                    <Td align="right" className="hidden md:table-cell">{c.lastUsed}</Td>
                    <Td align="right">
                      <Badge tone={c.status === "Active" ? "good" : "neutral"}>{c.status}</Badge>
                    </Td>
                  </Tr>
                ))}
              </Table>
            )}
          </>
        )}

        {tab === "Transactions" && (
          <Table
            columns={[
              { key: "date", label: "Date" },
              { key: "card", label: "Card", hideOn: "hidden sm:table-cell" },
              { key: "type", label: "Type" },
              { key: "amount", label: "Amount", align: "right" },
              { key: "balance", label: "Balance after", align: "right", hideOn: "hidden md:table-cell" },
            ]}
          >
            {giftCards.recent.map((c, i) => (
              <Tr key={c.id}>
                <Td strong>{c.lastUsed}</Td>
                <Td className="hidden sm:table-cell tnum">{c.code}</Td>
                <Td>
                  <Badge tone={i % 3 === 0 ? "info" : "neutral"}>{i % 3 === 0 ? "Issued" : "Redeemed"}</Badge>
                </Td>
                <Td align="right">
                  {i % 3 === 0 ? usdc(c.balance + 25) : `(${usdc(Math.min(c.balance + 15, 42))})`}
                </Td>
                <Td align="right" className="hidden md:table-cell">{usdc(c.balance)}</Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      <Drawer
        open={issuing}
        onClose={() => setIssuing(false)}
        title="Issue a gift card"
        footer={
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => setIssuing(false)}>Cancel</Button>
            <Button size="sm" variant="primary" className="flex-1" onClick={() => setIssuing(false)}>Issue card</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Amount"><input placeholder="$50.00" className={inputClass} inputMode="decimal" /></Field>
          <Field label="Delivery">
            <select className={inputClass}>
              {["Physical card at the terminal", "Email to recipient", "Print at home"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Recipient email" hint="Only needed for digital delivery.">
            <input placeholder="guest@example.com" className={inputClass} />
          </Field>
          <Field label="Message"><input placeholder="Happy birthday!" className={inputClass} /></Field>
          <div className="rounded-lg bg-ink-50 p-3.5">
            <p className="text-[12.5px] leading-relaxed text-ink-500">
              Issued cards work immediately at every terminal, on handhelds and at online checkout. The balance
              is added to your outstanding liability.
            </p>
          </div>
        </div>
      </Drawer>
    </>
  );
}
