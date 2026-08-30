"use client";

import React from "react";
import {
  Card, CardHeader, PageHeader, Button, SearchInput, Badge, Table, Td, Tr,
  Stat, Drawer, Segmented, Empty,
} from "@/components/ui";
import { HBarChart, Donut, Legend } from "@/components/charts";
import { customers, type Customer } from "@/lib/data";
import { usd, usdc, num, pctPlain, initials } from "@/lib/format";
import { IconDownload, IconCampaign } from "@/components/shell/icons";

const TIERS = ["All", "VIP", "Regular", "Returning", "New"] as const;
const TIER_COLORS: Record<string, string> = {
  VIP: "var(--color-s1)",
  Regular: "var(--color-s2)",
  Returning: "var(--color-s3)",
  New: "var(--color-s4)",
};

export default function CustomersPage() {
  const [tier, setTier] = React.useState<string>("All");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Customer | null>(null);

  const filtered = customers.filter((c) => {
    if (tier !== "All" && c.tier !== tier) return false;
    if (query) {
      const q = query.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    }
    return true;
  });

  const totalSpend = customers.reduce((a, c) => a + c.spend, 0);
  const optedIn = customers.filter((c) => c.optIn).length;
  const repeatRate = (customers.filter((c) => c.visits > 1).length / customers.length) * 100;

  const tierSegments = (["VIP", "Regular", "Returning", "New"] as const).map((t) => ({
    label: t,
    value: customers.filter((c) => c.tier === t).length,
    color: TIER_COLORS[t],
  }));

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Guest profiles built automatically from card and loyalty activity"
        actions={
          <>
            <Button size="sm"><IconDownload size={15} /> Export list</Button>
            <Button size="sm" variant="primary"><IconCampaign size={15} /> Create campaign</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Guests on file" value={num(customers.length)} hint="with a matched profile" />
        <Stat label="Lifetime spend" value={usd(totalSpend)} hint="all guests" />
        <Stat label="Avg. lifetime value" value={usd(totalSpend / customers.length)} hint="per guest" />
        <Stat label="Repeat rate" value={pctPlain(repeatRate)} hint="more than one visit" />
        <Stat label="Marketing opt-in" value={pctPlain((optedIn / customers.length) * 100)} hint={`${optedIn} reachable`} />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Guests by tier" subtitle="Assigned from visit frequency" />
          <Donut
            segments={tierSegments}
            centerLabel="guests"
            centerValue={num(customers.length)}
          />
          <Legend items={tierSegments.map((s) => ({ label: s.label, color: s.color }))} />
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Spend by tier" subtitle="Where your revenue actually comes from" />
          <HBarChart
            rows={tierSegments.map((t) => ({
              label: t.label,
              value: customers.filter((c) => c.tier === t.label).reduce((a, c) => a + c.spend, 0),
              sub: `${t.value} guests`,
            }))}
            format={usd}
          />
          <p className="mt-4 text-[12.5px] leading-relaxed text-ink-400">
            VIP and Regular guests are{" "}
            <span className="font-medium text-ink-700">
              {pctPlain(((tierSegments[0].value + tierSegments[1].value) / customers.length) * 100)}
            </span>{" "}
            of your list but{" "}
            <span className="font-medium text-ink-700">
              {pctPlain(
                (customers.filter((c) => c.tier === "VIP" || c.tier === "Regular").reduce((a, c) => a + c.spend, 0) /
                  totalSpend) * 100
              )}
            </span>{" "}
            of lifetime spend.
          </p>
        </Card>
      </div>

      <Card padded={false}>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
          <SearchInput value={query} onChange={setQuery} placeholder="Search name or email…" className="sm:max-w-xs" />
          <Segmented options={[...TIERS]} value={tier} onChange={setTier} size="sm" />
        </div>

        {filtered.length === 0 ? (
          <div className="p-5"><Empty title="No guests match" body="Try a different tier or search term." /></div>
        ) : (
          <Table
            columns={[
              { key: "name", label: "Guest" },
              { key: "tier", label: "Tier", hideOn: "hidden sm:table-cell" },
              { key: "visits", label: "Visits", align: "right" },
              { key: "avg", label: "Avg. check", align: "right", hideOn: "hidden md:table-cell" },
              { key: "spend", label: "Lifetime spend", align: "right" },
              { key: "points", label: "Points", align: "right", hideOn: "hidden lg:table-cell" },
              { key: "last", label: "Last visit", align: "right", hideOn: "hidden md:table-cell" },
            ]}
          >
            {filtered.map((c) => (
              <Tr key={c.id}>
                <Td strong>
                  <button onClick={() => setSelected(c)} className="ring-focus flex items-center gap-2.5 rounded text-left hover:text-brand-600">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[11px] font-semibold text-ink-600">
                      {initials(c.name)}
                    </span>
                    <span>
                      <span className="block hover:underline">{c.name}</span>
                      <span className="block text-[11.5px] font-normal text-ink-400">{c.email}</span>
                    </span>
                  </button>
                </Td>
                <Td className="hidden sm:table-cell">
                  <Badge tone={c.tier === "VIP" ? "brand" : c.tier === "Regular" ? "info" : "neutral"}>{c.tier}</Badge>
                </Td>
                <Td align="right">{c.visits}</Td>
                <Td align="right" className="hidden md:table-cell">{usdc(c.avgCheck)}</Td>
                <Td align="right" strong>{usd(c.spend)}</Td>
                <Td align="right" className="hidden lg:table-cell">{num(c.loyaltyPoints)}</Td>
                <Td align="right" className="hidden md:table-cell">{c.lastVisit}</Td>
              </Tr>
            ))}
          </Table>
        )}
        <div className="border-t border-ink-100 px-4 py-3 text-[12.5px] text-ink-400">
          Showing {filtered.length} of {customers.length} guests
        </div>
      </Card>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Guest profile"
        footer={<Button size="sm" variant="primary" className="w-full">Send a reward</Button>}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-[16px] font-semibold text-white">
                {initials(selected.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-ink-900">{selected.name}</p>
                <p className="truncate text-[12.5px] text-ink-400">{selected.email}</p>
                <div className="mt-1.5 flex gap-1.5">
                  <Badge tone={selected.tier === "VIP" ? "brand" : "info"}>{selected.tier}</Badge>
                  <Badge tone={selected.optIn ? "good" : "neutral"}>
                    {selected.optIn ? "Opted in" : "Not opted in"}
                  </Badge>
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3">
              {[
                ["Visits", num(selected.visits)],
                ["Lifetime spend", usd(selected.spend)],
                ["Average check", usdc(selected.avgCheck)],
                ["Loyalty points", num(selected.loyaltyPoints)],
                ["Last visit", selected.lastVisit],
                ["Phone", selected.phone],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-ink-50 px-3 py-2.5">
                  <dt className="text-[11.5px] text-ink-400">{k}</dt>
                  <dd className="mt-0.5 text-[14px] font-medium text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>

            <div>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-400">Recent visits</p>
              <ul className="divide-y divide-ink-50 rounded-lg border border-ink-100">
                {Array.from({ length: Math.min(4, selected.visits) }).map((_, i) => (
                  <li key={i} className="flex items-center justify-between px-3 py-2.5 text-[13px]">
                    <span className="text-ink-700">
                      {i === 0 ? selected.lastVisit : `${selected.lastVisit.split(" ")[0]} ${Number(selected.lastVisit.split(" ")[1]) - i * 7}`}
                      <span className="ml-2 text-ink-400">{i % 2 === 0 ? "Dine-in" : "Takeout"}</span>
                    </span>
                    <span className="tnum font-medium text-ink-900">{usdc(selected.avgCheck * (1 + (i % 3) * 0.12))}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
