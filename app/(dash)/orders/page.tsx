"use client";

import React from "react";
import {
  Card, CardHeader, PageHeader, Button, SearchInput, Badge, Table, Td, Tr,
  Tabs, Drawer, Empty, Stat, cx,
} from "@/components/ui";
import { orders, type Order, menuItems } from "@/lib/data";
import { usdc, num } from "@/lib/format";
import { IconDownload, IconFilter, IconPrinter } from "@/components/shell/icons";

const TABS = ["All", "Open", "Paid", "Refunded", "Voided"];

export default function OrdersPage() {
  const [tab, setTab] = React.useState("All");
  const [query, setQuery] = React.useState("");
  const [channel, setChannel] = React.useState("All channels");
  const [selected, setSelected] = React.useState<Order | null>(null);

  const filtered = orders.filter((o) => {
    if (tab !== "All" && o.status !== tab) return false;
    if (channel !== "All channels" && o.channel !== channel) return false;
    if (query) {
      const q = query.toLowerCase();
      return o.ticket.toLowerCase().includes(q) || o.server.toLowerCase().includes(q) || o.table.toLowerCase().includes(q);
    }
    return true;
  });

  const totals = {
    count: filtered.length,
    sales: filtered.reduce((a, o) => a + o.subtotal, 0),
    tips: filtered.reduce((a, o) => a + o.tip, 0),
    avg: filtered.length ? filtered.reduce((a, o) => a + o.total, 0) / filtered.length : 0,
  };

  const tone = (s: Order["status"]) =>
    s === "Paid" ? "good" : s === "Open" ? "info" : s === "Refunded" ? "warning" : "critical";

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Every ticket rung on the point of sale, with the detail behind it"
        actions={
          <>
            <Button size="sm"><IconFilter size={15} /> Filters</Button>
            <Button size="sm"><IconDownload size={15} /> Export</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Orders" value={num(totals.count)} hint="matching filters" />
        <Stat label="Sales" value={usdc(totals.sales)} hint="subtotal, before tax" />
        <Stat label="Tips" value={usdc(totals.tips)} hint={`${((totals.tips / (totals.sales || 1)) * 100).toFixed(1)}% of sales`} />
        <Stat label="Avg. order" value={usdc(totals.avg)} hint="including tax and tip" />
      </div>

      <Card padded={false}>
        <div className="px-4 pt-4 sm:px-5">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search ticket, server or table…"
              className="sm:max-w-xs"
            />
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              aria-label="Filter by channel"
              className="ring-focus h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900"
            >
              {["All channels", "Dine-in", "Takeout", "Delivery", "Online"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
        </div>

        {filtered.length === 0 ? (
          <div className="p-5">
            <Empty
              title="No orders match"
              body="Try clearing the search or switching tabs."
              action={<Button size="sm" onClick={() => { setQuery(""); setTab("All"); setChannel("All channels"); }}>Clear filters</Button>}
            />
          </div>
        ) : (
          <Table
            columns={[
              { key: "ticket", label: "Ticket" },
              { key: "channel", label: "Channel" },
              { key: "table", label: "Table", hideOn: "hidden md:table-cell" },
              { key: "server", label: "Server", hideOn: "hidden lg:table-cell" },
              { key: "items", label: "Items", align: "right", hideOn: "hidden sm:table-cell" },
              { key: "total", label: "Total", align: "right" },
              { key: "tip", label: "Tip", align: "right", hideOn: "hidden md:table-cell" },
              { key: "status", label: "Status", align: "right" },
            ]}
          >
            {filtered.map((o) => (
              <Tr key={o.id} className="cursor-pointer">
                <Td strong>
                  <button onClick={() => setSelected(o)} className="ring-focus rounded text-left hover:text-brand-600 hover:underline">
                    {o.ticket}
                    <span className="ml-2 text-[11.5px] font-normal text-ink-400">{o.time}</span>
                  </button>
                </Td>
                <Td>{o.channel}</Td>
                <Td className="hidden md:table-cell">{o.table}</Td>
                <Td className="hidden lg:table-cell">{o.server}</Td>
                <Td align="right" className="hidden sm:table-cell">{o.items}</Td>
                <Td align="right" strong>{usdc(o.total)}</Td>
                <Td align="right" className="hidden md:table-cell">{o.tip > 0 ? usdc(o.tip) : "—"}</Td>
                <Td align="right"><Badge tone={tone(o.status)}>{o.status}</Badge></Td>
              </Tr>
            ))}
          </Table>
        )}

        <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3 text-[12.5px] text-ink-400">
          <span>Showing {filtered.length} of {orders.length} orders</span>
          <div className="flex gap-2">
            <Button size="sm" disabled>Previous</Button>
            <Button size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>

      {/* -------------------------------------------------------- ticket detail */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Ticket ${selected.ticket}` : ""}
        footer={
          <div className="flex gap-2">
            <Button size="sm" className="flex-1"><IconPrinter size={15} /> Reprint</Button>
            <Button size="sm" variant="danger" className="flex-1">Refund</Button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <Badge tone={tone(selected.status)}>{selected.status}</Badge>
              <span className="text-[12.5px] text-ink-400">{selected.time}</span>
            </div>

            <dl className="grid grid-cols-2 gap-y-3 text-[13px]">
              {[
                ["Channel", selected.channel],
                ["Table", selected.table],
                ["Server", selected.server],
                ["Payment", selected.payment],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11.5px] uppercase tracking-wide text-ink-400">{k}</dt>
                  <dd className="mt-0.5 font-medium text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>

            <div>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-400">
                Items ({selected.items})
              </p>
              <ul className="divide-y divide-ink-50 rounded-lg border border-ink-100">
                {menuItems.slice(0, selected.items).map((m, i) => (
                  <li key={m.id} className="flex items-start justify-between gap-3 px-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block text-[13px] font-medium text-ink-900">
                        <span className="tnum mr-1.5 text-ink-400">{(i % 2) + 1}×</span>
                        {m.name}
                      </span>
                      {m.modifiers.length > 0 && (
                        <span className="mt-0.5 block text-[11.5px] text-ink-400">{m.modifiers.join(" · ")}</span>
                      )}
                    </span>
                    <span className="tnum shrink-0 text-[13px] text-ink-700">{usdc(m.price * ((i % 2) + 1))}</span>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="space-y-1.5 border-t border-ink-100 pt-3 text-[13px]">
              {[
                ["Subtotal", selected.subtotal],
                ["Tax", selected.tax],
                ["Tip", selected.tip],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between">
                  <dt className="text-ink-500">{k as string}</dt>
                  <dd className="tnum text-ink-900">{usdc(v as number)}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-ink-100 pt-2 text-[15px] font-semibold">
                <dt>Total</dt>
                <dd className="tnum">{usdc(selected.total)}</dd>
              </div>
            </dl>
          </div>
        )}
      </Drawer>
    </>
  );
}
