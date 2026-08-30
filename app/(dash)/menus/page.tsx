"use client";

import React from "react";
import {
  Card, CardHeader, PageHeader, Button, SearchInput, Badge, Table, Td, Tr,
  Tabs, Drawer, Toggle, Field, inputClass, Stat, Empty, cx,
} from "@/components/ui";
import { HBarChart } from "@/components/charts";
import { menuItems, menuCategories, menuQuadrant, type MenuItem } from "@/lib/data";
import { usd, usdc, num, pctPlain } from "@/lib/format";
import { IconPlus, IconDownload, IconSpark } from "@/components/shell/icons";

const QUADRANT_HELP: Record<string, string> = {
  Star: "Popular and profitable. Protect the recipe, feature it everywhere.",
  Plowhorse: "Popular but thin margin. Re-engineer the plate cost or nudge the price.",
  Puzzle: "Profitable but overlooked. Move it up the menu or train the staff to sell it.",
  Dog: "Neither popular nor profitable. A candidate to cut at the next menu change.",
};

export default function MenusPage() {
  const [tab, setTab] = React.useState("Items");
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("All categories");
  const [selected, setSelected] = React.useState<MenuItem | null>(null);
  const [availability, setAvailability] = React.useState<Record<string, boolean>>(
    Object.fromEntries(menuItems.map((m) => [m.id, m.available]))
  );

  const filtered = menuItems.filter((m) => {
    if (category !== "All categories" && m.category !== category) return false;
    if (query) return m.name.toLowerCase().includes(query.toLowerCase());
    return true;
  });

  const eightySix = Object.entries(availability).filter(([, v]) => !v).length;
  const avgMargin =
    menuItems.reduce((a, m) => a + (m.price - m.cost) / m.price, 0) / menuItems.length * 100;

  const byCategory = menuCategories
    .map((c) => ({ label: c, value: menuItems.filter((m) => m.category === c).reduce((a, m) => a + m.net, 0) }))
    .sort((a, b) => b.value - a.value);

  const quadrants = ["Star", "Plowhorse", "Puzzle", "Dog"] as const;

  return (
    <>
      <PageHeader
        title="Menus"
        subtitle="Items, modifiers, pricing and availability — pushed to every terminal"
        actions={
          <>
            <Button size="sm"><IconDownload size={15} /> Export</Button>
            <Button size="sm" variant="primary"><IconPlus size={15} /> Add item</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Active items" value={num(menuItems.length - eightySix)} hint={`${menuItems.length} total`} />
        <Stat label="86'd right now" value={num(eightySix)} hint="hidden from ordering" />
        <Stat label="Avg. gross margin" value={pctPlain(avgMargin)} hint="price less plate cost" />
        <Stat label="Categories" value={num(menuCategories.length)} hint="across all menus" />
      </div>

      <Card padded={false}>
        <div className="px-4 pt-4 sm:px-5">
          <Tabs tabs={["Items", "Categories", "Menu engineering", "Modifiers"]} active={tab} onChange={setTab} />
        </div>

        {/* ----------------------------------------------------------- items */}
        {tab === "Items" && (
          <>
            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
              <SearchInput value={query} onChange={setQuery} placeholder="Search items…" className="sm:max-w-xs" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter by category"
                className="ring-focus h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900"
              >
                <option>All categories</option>
                {menuCategories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="p-5"><Empty title="No items match" body="Adjust the search or category filter." /></div>
            ) : (
              <Table
                columns={[
                  { key: "name", label: "Item" },
                  { key: "cat", label: "Category", hideOn: "hidden md:table-cell" },
                  { key: "price", label: "Price", align: "right" },
                  { key: "cost", label: "Cost", align: "right", hideOn: "hidden lg:table-cell" },
                  { key: "margin", label: "Margin", align: "right", hideOn: "hidden sm:table-cell" },
                  { key: "sold", label: "Sold", align: "right" },
                  { key: "net", label: "Net sales", align: "right", hideOn: "hidden md:table-cell" },
                  { key: "avail", label: "Available", align: "right" },
                ]}
              >
                {filtered.map((m) => {
                  const margin = ((m.price - m.cost) / m.price) * 100;
                  return (
                    <Tr key={m.id}>
                      <Td strong>
                        <button onClick={() => setSelected(m)} className="ring-focus rounded text-left hover:text-brand-600 hover:underline">
                          {m.name}
                        </button>
                        <span className="mt-0.5 block text-[11.5px] font-normal text-ink-400 md:hidden">{m.category}</span>
                      </Td>
                      <Td className="hidden md:table-cell">{m.category}</Td>
                      <Td align="right">{usdc(m.price)}</Td>
                      <Td align="right" className="hidden lg:table-cell">{usdc(m.cost)}</Td>
                      <Td align="right" className="hidden sm:table-cell">
                        <span className={margin < 65 ? "text-[color:var(--color-warning)]" : ""}>{pctPlain(margin, 0)}</span>
                      </Td>
                      <Td align="right">{num(m.sold)}</Td>
                      <Td align="right" className="hidden md:table-cell">{usd(m.net)}</Td>
                      <Td align="right">
                        <div className="flex justify-end">
                          <Toggle
                            checked={availability[m.id]}
                            onChange={(v) => setAvailability((s) => ({ ...s, [m.id]: v }))}
                            label={`${m.name} availability`}
                          />
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </Table>
            )}
          </>
        )}

        {/* ------------------------------------------------------ categories */}
        {tab === "Categories" && (
          <div className="p-4 sm:p-5">
            <div className="mb-5">
              <p className="mb-3 text-[13px] text-ink-500">Net sales by category, for the trailing period.</p>
              <HBarChart rows={byCategory} format={usd} />
            </div>
            <Table
              columns={[
                { key: "cat", label: "Category" },
                { key: "items", label: "Items", align: "right" },
                { key: "sold", label: "Units sold", align: "right" },
                { key: "net", label: "Net sales", align: "right" },
                { key: "share", label: "% of sales", align: "right" },
              ]}
            >
              {byCategory.map((c) => {
                const items = menuItems.filter((m) => m.category === c.label);
                const totalNet = byCategory.reduce((a, x) => a + x.value, 0);
                return (
                  <Tr key={c.label}>
                    <Td strong>{c.label}</Td>
                    <Td align="right">{items.length}</Td>
                    <Td align="right">{num(items.reduce((a, m) => a + m.sold, 0))}</Td>
                    <Td align="right">{usd(c.value)}</Td>
                    <Td align="right">{pctPlain((c.value / totalNet) * 100)}</Td>
                  </Tr>
                );
              })}
            </Table>
          </div>
        )}

        {/* ------------------------------------------------ menu engineering */}
        {tab === "Menu engineering" && (
          <div className="p-4 sm:p-5">
            <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-ink-50 p-3.5">
              <IconSpark size={17} className="mt-0.5 shrink-0 text-ink-500" />
              <p className="text-[12.5px] leading-relaxed text-ink-500">
                Every item is placed by <span className="font-medium text-ink-900">popularity</span> (units sold
                against the menu median) and <span className="font-medium text-ink-900">margin</span> (price less
                plate cost). The quadrant tells you what to do with it.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {quadrants.map((q) => {
                const items = menuItems.filter((m) => menuQuadrant(m) === q);
                return (
                  <div key={q} className="rounded-xl border border-ink-100 p-3.5">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="text-[14px] font-semibold text-ink-900">{q}s</h3>
                      <Badge tone={q === "Star" ? "good" : q === "Dog" ? "critical" : "neutral"}>
                        {items.length}
                      </Badge>
                    </div>
                    <p className="mb-3 text-[12px] leading-snug text-ink-400">{QUADRANT_HELP[q]}</p>
                    <ul className="space-y-1.5">
                      {items.slice(0, 6).map((m) => (
                        <li key={m.id} className="flex items-center justify-between gap-2 text-[12.5px]">
                          <span className="truncate text-ink-700">{m.name}</span>
                          <span className="tnum shrink-0 text-ink-400">{num(m.sold)}</span>
                        </li>
                      ))}
                      {items.length === 0 && <li className="text-[12.5px] text-ink-300">None</li>}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- modifiers */}
        {tab === "Modifiers" && (
          <div className="p-4 sm:p-5">
            <p className="mb-4 text-[13px] text-ink-500">
              Modifier groups attach to items and drive both kitchen routing and upsell revenue.
            </p>
            <Table
              columns={[
                { key: "mod", label: "Modifier group" },
                { key: "items", label: "Attached to", align: "right" },
                { key: "req", label: "Required", align: "right" },
                { key: "price", label: "Upcharge", align: "right" },
              ]}
            >
              {Array.from(new Set(menuItems.flatMap((m) => m.modifiers))).map((mod, i) => (
                <Tr key={mod}>
                  <Td strong>{mod}</Td>
                  <Td align="right">{menuItems.filter((m) => m.modifiers.includes(mod)).length} items</Td>
                  <Td align="right">{i % 3 === 0 ? "Yes" : "No"}</Td>
                  <Td align="right">{i % 2 === 0 ? usdc(1.5 + i * 0.5) : "—"}</Td>
                </Tr>
              ))}
            </Table>
          </div>
        )}
      </Card>

      {/* ------------------------------------------------------------ editor */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? "Edit item" : ""}
        footer={
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => setSelected(null)}>Cancel</Button>
            <Button size="sm" variant="primary" className="flex-1" onClick={() => setSelected(null)}>Save changes</Button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-4">
            <Field label="Item name">
              <input defaultValue={selected.name} className={inputClass} />
            </Field>
            <Field label="Description" hint="Shown on the online ordering site and on handhelds.">
              <textarea defaultValue={selected.description} rows={3} className={cx(inputClass, "h-auto py-2")} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price">
                <input defaultValue={selected.price.toFixed(2)} className={inputClass} inputMode="decimal" />
              </Field>
              <Field label="Plate cost">
                <input defaultValue={selected.cost.toFixed(2)} className={inputClass} inputMode="decimal" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <select defaultValue={selected.category} className={inputClass}>
                  {menuCategories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Kitchen station" hint="Controls printer and KDS routing.">
                <select defaultValue={selected.station} className={inputClass}>
                  {["Grill", "Fry", "Cold", "Sauté", "Bake", "Pastry", "Bar"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Tax rate">
              <input defaultValue={`${selected.taxRate}%`} className={inputClass} />
            </Field>

            <div className="rounded-lg border border-ink-100 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-ink-900">Available</p>
                  <p className="mt-0.5 text-[12px] text-ink-400">Turning this off 86&rsquo;s the item everywhere.</p>
                </div>
                <Toggle
                  checked={availability[selected.id]}
                  onChange={(v) => setAvailability((s) => ({ ...s, [selected.id]: v }))}
                  label="Available"
                />
              </div>
            </div>

            <div className="rounded-lg bg-ink-50 p-3.5">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-400">Performance</p>
              <dl className="grid grid-cols-2 gap-y-2 text-[13px]">
                {[
                  ["Units sold", num(selected.sold)],
                  ["Net sales", usd(selected.net)],
                  ["Gross margin", pctPlain(((selected.price - selected.cost) / selected.price) * 100)],
                  ["Classification", menuQuadrant(selected)],
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
