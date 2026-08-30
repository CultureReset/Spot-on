"use client";

import React from "react";
import {
  Card, CardHeader, PageHeader, Button, Badge, Table, Td, Tr, Stat, Tabs, Toggle,
  Field, inputClass, Bar,
} from "@/components/ui";
import { ChartFrame, LineChart, HBarChart } from "@/components/charts";
import { loyalty, customers, days90 } from "@/lib/data";
import { usd, num, pctPlain } from "@/lib/format";
import { IconPlus, IconLoyalty } from "@/components/shell/icons";

export default function LoyaltyPage() {
  const [tab, setTab] = React.useState("Overview");
  const [rewards, setRewards] = React.useState(loyalty.program.rewards);

  const enrolment = days90.slice(-30).map((d, i) => ({
    label: d.label,
    value: Math.round(2900 + i * 9 + (d.orders % 40)),
  }));

  const members = customers.filter((c) => c.loyaltyPoints > 0).sort((a, b) => b.loyaltyPoints - a.loyaltyPoints);

  return (
    <>
      <PageHeader
        title="Loyalty"
        subtitle={`${loyalty.program.name} — ${loyalty.program.earn}`}
        actions={
          <>
            <Button size="sm">Program settings</Button>
            <Button size="sm" variant="primary"><IconPlus size={15} /> Add reward</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Members" value={num(loyalty.members)} delta={7.2} hint="vs. prior month" />
        <Stat label="New this month" value={num(loyalty.newThisMonth)} delta={12.4} />
        <Stat label="Active rate" value={pctPlain(loyalty.activeRate)} hint="earned in last 90 days" />
        <Stat label="Points outstanding" value={num(loyalty.pointsIssued - loyalty.pointsRedeemed)} hint="unredeemed liability" />
        <Stat label="Visit lift" value={`${loyalty.avgVisitLift}×`} hint="members vs. non-members" />
      </div>

      <Card padded={false}>
        <div className="px-4 pt-4 sm:px-5">
          <Tabs tabs={["Overview", "Rewards", "Tiers", "Members"]} active={tab} onChange={setTab} />
        </div>

        {tab === "Overview" && (
          <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2">
            <div>
              <h3 className="mb-1 text-[15px] font-semibold text-ink-900">Membership growth</h3>
              <p className="mb-4 text-[13px] text-ink-500">Enrolled members over the last 30 days.</p>
              <ChartFrame
                label="Loyalty membership over time"
                tableColumns={["Day", "Members"]}
                tableRows={enrolment.map((e) => [e.label, num(e.value)])}
              >
                <LineChart
                  labels={enrolment.map((e) => e.label)}
                  area
                  height={230}
                  format={(n) => num(Math.round(n))}
                  series={[{ key: "m", label: "Members", color: "var(--color-s1)", values: enrolment.map((e) => e.value) }]}
                />
              </ChartFrame>
            </div>

            <div>
              <h3 className="mb-1 text-[15px] font-semibold text-ink-900">Points activity</h3>
              <p className="mb-4 text-[13px] text-ink-500">Issued against redeemed, all time.</p>
              <HBarChart
                rows={[
                  { label: "Points issued", value: loyalty.pointsIssued },
                  { label: "Points redeemed", value: loyalty.pointsRedeemed },
                  { label: "Outstanding", value: loyalty.pointsIssued - loyalty.pointsRedeemed },
                ]}
                format={(n) => num(Math.round(n))}
              />
              <div className="mt-5 rounded-lg bg-ink-50 p-3.5">
                <p className="text-[13px] font-medium text-ink-900">
                  {pctPlain((loyalty.pointsRedeemed / loyalty.pointsIssued) * 100)} redemption rate
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">
                  {num(loyalty.rewardsRedeemed)} rewards have been redeemed. Outstanding points are a real
                  liability — {usd((loyalty.pointsIssued - loyalty.pointsRedeemed) * 0.05)} at your current
                  redemption value.
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "Rewards" && (
          <div className="p-4 sm:p-5">
            <Table
              columns={[
                { key: "name", label: "Reward" },
                { key: "cost", label: "Point cost", align: "right" },
                { key: "redeemed", label: "Redeemed", align: "right" },
                { key: "value", label: "Value given", align: "right", hideOn: "hidden sm:table-cell" },
                { key: "active", label: "Active", align: "right" },
              ]}
            >
              {rewards.map((r, i) => (
                <Tr key={r.name}>
                  <Td strong>
                    <span className="flex items-center gap-2">
                      <IconLoyalty size={16} className="shrink-0 text-ink-400" />
                      {r.name}
                    </span>
                  </Td>
                  <Td align="right">{num(r.cost)}</Td>
                  <Td align="right">
                    {num(r.redeemed)}
                    <span className="mt-1 block w-20 justify-self-end">
                      <Bar value={r.redeemed} max={Math.max(...rewards.map((x) => x.redeemed))} />
                    </span>
                  </Td>
                  <Td align="right" className="hidden sm:table-cell">{usd(r.redeemed * (r.cost / 20))}</Td>
                  <Td align="right">
                    <div className="flex justify-end">
                      <Toggle
                        checked={r.active}
                        onChange={(v) => setRewards((s) => s.map((x, j) => (j === i ? { ...x, active: v } : x)))}
                        label={`${r.name} active`}
                      />
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>
          </div>
        )}

        {tab === "Tiers" && (
          <div className="p-4 sm:p-5">
            <p className="mb-4 text-[13px] text-ink-500">
              Guests move up automatically as they accumulate points. Perks apply at the terminal and online.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {loyalty.program.tiers.map((t, i) => (
                <div key={t.name} className="rounded-xl border border-ink-100 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-[15px] font-semibold text-ink-900">{t.name}</h3>
                    <Badge tone={i === 2 ? "brand" : "neutral"}>Tier {i + 1}</Badge>
                  </div>
                  <p className="tnum text-[13px] text-ink-500">
                    {t.threshold === 0 ? "From enrolment" : `${num(t.threshold)}+ points`}
                  </p>
                  <p className="mt-3 border-t border-ink-50 pt-3 text-[13px] leading-relaxed text-ink-700">{t.perk}</p>
                  <p className="mt-3 text-[12px] text-ink-400">
                    {num(customers.filter((c) => c.loyaltyPoints >= t.threshold).length)} guests qualify
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-ink-100 p-4">
              <h3 className="mb-3 text-[14px] font-semibold text-ink-900">Earn rule</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Points per dollar"><input defaultValue="1" className={inputClass} /></Field>
                <Field label="Point value at redemption"><input defaultValue="$0.05" className={inputClass} /></Field>
                <Field label="Points expire after"><input defaultValue="12 months" className={inputClass} /></Field>
              </div>
            </div>
          </div>
        )}

        {tab === "Members" && (
          <Table
            columns={[
              { key: "name", label: "Member" },
              { key: "tier", label: "Tier", hideOn: "hidden sm:table-cell" },
              { key: "points", label: "Points", align: "right" },
              { key: "visits", label: "Visits", align: "right", hideOn: "hidden md:table-cell" },
              { key: "spend", label: "Lifetime spend", align: "right" },
              { key: "last", label: "Last visit", align: "right", hideOn: "hidden lg:table-cell" },
            ]}
          >
            {members.map((c) => (
              <Tr key={c.id}>
                <Td strong>{c.name}</Td>
                <Td className="hidden sm:table-cell">
                  <Badge tone={c.tier === "VIP" ? "brand" : "neutral"}>{c.tier}</Badge>
                </Td>
                <Td align="right">{num(c.loyaltyPoints)}</Td>
                <Td align="right" className="hidden md:table-cell">{c.visits}</Td>
                <Td align="right">{usd(c.spend)}</Td>
                <Td align="right" className="hidden lg:table-cell">{c.lastVisit}</Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </>
  );
}
