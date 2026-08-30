"use client";

import React from "react";
import {
  Card, CardHeader, PageHeader, Button, Badge, Table, Td, Tr, Stat, Tabs,
  Drawer, Field, inputClass, Empty, cx,
} from "@/components/ui";
import { HBarChart } from "@/components/charts";
import { campaigns, customers, type Campaign } from "@/lib/data";
import { usd, num, pctPlain } from "@/lib/format";
import { IconPlus, IconCampaign } from "@/components/shell/icons";

const TEMPLATES = [
  { name: "Win back lapsed guests", body: "Reaches anyone who hasn't visited in 60 days with a time-boxed offer.", channel: "Email" },
  { name: "Birthday reward", body: "Fires automatically the week of a guest's birthday.", channel: "Email" },
  { name: "Slow-night flash offer", body: "Sends the morning of, to guests within three miles.", channel: "SMS" },
  { name: "New menu announcement", body: "Announces a menu change to your full opted-in list.", channel: "Email" },
];

export default function CampaignsPage() {
  const [tab, setTab] = React.useState("All campaigns");
  const [selected, setSelected] = React.useState<Campaign | null>(null);
  const [composing, setComposing] = React.useState(false);

  const sent = campaigns.filter((c) => c.status === "Sent");
  const totalRevenue = campaigns.reduce((a, c) => a + c.revenue, 0);
  const totalSent = campaigns.reduce((a, c) => a + c.sent, 0);
  const totalOpened = campaigns.reduce((a, c) => a + c.opened, 0);
  const totalRedeemed = campaigns.reduce((a, c) => a + c.redeemed, 0);
  const reachable = customers.filter((c) => c.optIn).length;

  const tone = (s: Campaign["status"]) =>
    s === "Sent" ? "neutral" : s === "Running" ? "good" : s === "Scheduled" ? "info" : "warning";

  const shown = tab === "All campaigns" ? campaigns : campaigns.filter((c) => c.channel === tab.replace(/s$/, ""));

  return (
    <>
      <PageHeader
        title="Campaigns"
        subtitle="Email and SMS marketing, with revenue attributed back to the check"
        actions={
          <Button size="sm" variant="primary" onClick={() => setComposing(true)}>
            <IconPlus size={15} /> New campaign
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Attributed revenue" value={usd(totalRevenue)} delta={18.6} hint="from redemptions" />
        <Stat label="Messages sent" value={num(totalSent)} hint={`${campaigns.length} campaigns`} />
        <Stat label="Open rate" value={pctPlain(totalSent ? (totalOpened / totalSent) * 100 : 0)} hint="across all sends" />
        <Stat label="Redemptions" value={num(totalRedeemed)} hint={`${pctPlain((totalRedeemed / totalOpened) * 100)} of opens`} />
        <Stat label="Reachable guests" value={num(reachable)} hint="opted in to marketing" />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Revenue by campaign" subtitle="Attributed to a redeemed offer within 14 days of the send" />
          <HBarChart
            rows={[...campaigns].filter((c) => c.revenue > 0).sort((a, b) => b.revenue - a.revenue)
              .map((c) => ({ label: c.name, value: c.revenue, sub: `${num(c.redeemed)} redeemed` }))}
            format={usd}
          />
        </Card>

        <Card>
          <CardHeader title="Start from a template" subtitle="The four that work hardest for restaurants" />
          <ul className="space-y-2">
            {TEMPLATES.map((t) => (
              <li key={t.name}>
                <button
                  onClick={() => setComposing(true)}
                  className="ring-focus w-full rounded-lg border border-ink-100 p-3 text-left transition-colors hover:border-brand-500 hover:bg-brand-50"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-ink-900">{t.name}</span>
                    <Badge tone="neutral">{t.channel}</Badge>
                  </span>
                  <span className="mt-1 block text-[12px] leading-snug text-ink-400">{t.body}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card padded={false}>
        <div className="px-4 pt-4 sm:px-5">
          <Tabs tabs={["All campaigns", "Emails", "SMS", "Social"]} active={tab} onChange={setTab} />
        </div>

        {shown.length === 0 ? (
          <div className="p-5">
            <Empty
              title="No campaigns on this channel"
              body="Create one to start reaching guests here."
              action={<Button size="sm" variant="primary" onClick={() => setComposing(true)}>New campaign</Button>}
            />
          </div>
        ) : (
          <Table
            columns={[
              { key: "name", label: "Campaign" },
              { key: "channel", label: "Channel", hideOn: "hidden sm:table-cell" },
              { key: "sent", label: "Sent", align: "right", hideOn: "hidden md:table-cell" },
              { key: "open", label: "Open rate", align: "right", hideOn: "hidden lg:table-cell" },
              { key: "redeemed", label: "Redeemed", align: "right", hideOn: "hidden md:table-cell" },
              { key: "revenue", label: "Revenue", align: "right" },
              { key: "status", label: "Status", align: "right" },
            ]}
          >
            {shown.map((c) => (
              <Tr key={c.id}>
                <Td strong>
                  <button onClick={() => setSelected(c)} className="ring-focus rounded text-left hover:text-brand-600 hover:underline">
                    {c.name}
                  </button>
                  <span className="mt-0.5 block text-[11.5px] font-normal text-ink-400">
                    {c.audience} · {c.date}
                  </span>
                </Td>
                <Td className="hidden sm:table-cell">{c.channel}</Td>
                <Td align="right" className="hidden md:table-cell">{c.sent ? num(c.sent) : "—"}</Td>
                <Td align="right" className="hidden lg:table-cell">
                  {c.sent ? pctPlain((c.opened / c.sent) * 100) : "—"}
                </Td>
                <Td align="right" className="hidden md:table-cell">{c.redeemed ? num(c.redeemed) : "—"}</Td>
                <Td align="right" strong>{c.revenue ? usd(c.revenue) : "—"}</Td>
                <Td align="right"><Badge tone={tone(c.status)}>{c.status}</Badge></Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      {/* --------------------------------------------------- campaign detail */}
      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ""}>
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Badge tone={tone(selected.status)}>{selected.status}</Badge>
              <Badge tone="neutral">{selected.channel}</Badge>
              <span className="text-[12.5px] text-ink-400">{selected.date}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["Audience", selected.audience],
                ["Sent", selected.sent ? num(selected.sent) : "Not yet sent"],
                ["Opened", selected.opened ? `${num(selected.opened)} (${pctPlain((selected.opened / selected.sent) * 100)})` : "—"],
                ["Clicked", selected.clicked ? num(selected.clicked) : "—"],
                ["Redeemed", selected.redeemed ? num(selected.redeemed) : "—"],
                ["Revenue", selected.revenue ? usd(selected.revenue) : "—"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-ink-50 px-3 py-2.5">
                  <p className="text-[11.5px] text-ink-400">{k}</p>
                  <p className="mt-0.5 text-[13.5px] font-medium text-ink-900">{v}</p>
                </div>
              ))}
            </div>

            {/* funnel — ordered stages, so a single hue stepped by position */}
            {selected.sent > 0 && (
              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-400">Funnel</p>
                <ul className="space-y-2">
                  {[
                    ["Sent", selected.sent],
                    ["Opened", selected.opened],
                    ["Clicked", selected.clicked],
                    ["Redeemed", selected.redeemed],
                  ].map(([label, value], i) => (
                    <li key={label as string}>
                      <div className="mb-1 flex justify-between text-[12.5px]">
                        <span className="text-ink-700">{label as string}</span>
                        <span className="tnum text-ink-500">
                          {num(value as number)}
                          <span className="ml-2 text-ink-300">
                            {pctPlain(((value as number) / selected.sent) * 100, 0)}
                          </span>
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${((value as number) / selected.sent) * 100}%`,
                            background: `color-mix(in oklab, var(--color-s1) ${100 - i * 18}%, #cbd5e1)`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* -------------------------------------------------------- composer */}
      <Drawer
        open={composing}
        onClose={() => setComposing(false)}
        title="New campaign"
        footer={
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => setComposing(false)}>Save draft</Button>
            <Button size="sm" variant="primary" className="flex-1" onClick={() => setComposing(false)}>Schedule</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Campaign name"><input placeholder="Fall menu preview" className={inputClass} /></Field>
          <Field label="Channel">
            <select className={inputClass}>{["Email", "SMS", "Social"].map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Audience" hint={`${reachable} guests are opted in to marketing.`}>
            <select className={inputClass}>
              {["All opted-in guests", "VIP tier", "Regulars & VIPs", "Lapsed 60+ days", "Birthday this month", "Within 3 miles"].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
          <Field label="Subject line"><input placeholder="Something new is on the menu" className={inputClass} /></Field>
          <Field label="Message" hint="Keep SMS under 160 characters to stay in one segment.">
            <textarea rows={5} className={cx(inputClass, "h-auto py-2")} placeholder="Write your message…" />
          </Field>
          <Field label="Offer" hint="Attaching an offer is what lets SpotOn attribute revenue back to the check.">
            <select className={inputClass}>
              {["No offer", "$10 off", "Free dessert", "Free appetizer", "20% off entrées"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Send at"><input type="datetime-local" className={inputClass} /></Field>

          <div className="flex items-start gap-2.5 rounded-lg bg-ink-50 p-3.5">
            <IconCampaign size={17} className="mt-0.5 shrink-0 text-ink-500" />
            <p className="text-[12.5px] leading-relaxed text-ink-500">
              Sends land best Tuesday–Thursday around 10am, based on your list&rsquo;s open history.
              Sent campaigns average {pctPlain(sent.length ? (sent.reduce((a, c) => a + c.opened, 0) / sent.reduce((a, c) => a + c.sent, 0)) * 100 : 0)} opens.
            </p>
          </div>
        </div>
      </Drawer>
    </>
  );
}
