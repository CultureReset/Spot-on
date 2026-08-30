"use client";

import React from "react";
import {
  Card, CardHeader, PageHeader, Button, Badge, Stat, Tabs, Table, Td, Tr,
  Drawer, Field, inputClass, Empty, cx,
} from "@/components/ui";
import { reservations, waitlist, type Reservation } from "@/lib/data";
import { num, dur } from "@/lib/format";
import { IconPlus, IconReservation } from "@/components/shell/icons";

/** A 32-table floor, laid out in four sections. */
const FLOOR = [
  { section: "Dining room", tables: Array.from({ length: 14 }, (_, i) => `T${i + 1}`) },
  { section: "Patio", tables: Array.from({ length: 8 }, (_, i) => `T${i + 15}`) },
  { section: "Bar", tables: Array.from({ length: 6 }, (_, i) => `T${i + 23}`) },
  { section: "Private", tables: Array.from({ length: 4 }, (_, i) => `T${i + 29}`) },
];

export default function ReservationsPage() {
  const [tab, setTab] = React.useState("Today");
  const [selected, setSelected] = React.useState<Reservation | null>(null);
  const [adding, setAdding] = React.useState(false);

  const covers = reservations.reduce((a, r) => a + r.party, 0);
  const seated = reservations.filter((r) => r.status === "Seated");
  const noShows = reservations.filter((r) => r.status === "No-show");
  const avgWait = Math.round(waitlist.reduce((a, w) => a + w.waiting, 0) / (waitlist.length || 1));

  const occupied = new Set(seated.map((r) => r.table));

  const tone = (s: Reservation["status"]) =>
    s === "Seated" ? "good" : s === "Confirmed" ? "info" : s === "Waitlist" ? "warning"
      : s === "No-show" ? "critical" : "neutral";

  return (
    <>
      <PageHeader
        title="Reservations"
        subtitle="Bookings, the waitlist and who is sitting where right now"
        actions={
          <>
            <Button size="sm">Availability rules</Button>
            <Button size="sm" variant="primary" onClick={() => setAdding(true)}>
              <IconPlus size={15} /> Add reservation
            </Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Reservations" value={num(reservations.length)} hint="booked tonight" />
        <Stat label="Covers" value={num(covers)} hint={`avg. party ${(covers / reservations.length).toFixed(1)}`} />
        <Stat label="Currently seated" value={num(seated.length)} hint={`${occupied.size} tables in use`} />
        <Stat label="On the waitlist" value={num(waitlist.length)} hint={`avg. wait ${dur(avgWait)}`} />
        <Stat label="No-shows" value={num(noShows.length)} hint="tonight" invertDelta />
      </div>

      <Card padded={false}>
        <div className="px-4 pt-4 sm:px-5">
          <Tabs tabs={["Today", "Waitlist", "Floor plan"]} active={tab} onChange={setTab} />
        </div>

        {tab === "Today" && (
          <Table
            columns={[
              { key: "time", label: "Time" },
              { key: "name", label: "Guest" },
              { key: "party", label: "Party", align: "right" },
              { key: "table", label: "Table", align: "right", hideOn: "hidden sm:table-cell" },
              { key: "notes", label: "Notes", hideOn: "hidden lg:table-cell" },
              { key: "status", label: "Status", align: "right" },
            ]}
          >
            {reservations.map((r) => (
              <Tr key={r.id}>
                <Td strong className="tnum">{r.time}</Td>
                <Td>
                  <button onClick={() => setSelected(r)} className="ring-focus rounded font-medium text-ink-900 hover:text-brand-600 hover:underline">
                    {r.name}
                  </button>
                  <span className="mt-0.5 block text-[11.5px] text-ink-400">{r.phone}</span>
                </Td>
                <Td align="right">{r.party}</Td>
                <Td align="right" className="hidden sm:table-cell">{r.table}</Td>
                <Td className="hidden lg:table-cell">
                  {r.notes ? <Badge tone="neutral">{r.notes}</Badge> : <span className="text-ink-300">—</span>}
                </Td>
                <Td align="right"><Badge tone={tone(r.status)}>{r.status}</Badge></Td>
              </Tr>
            ))}
          </Table>
        )}

        {tab === "Waitlist" && (
          <div className="p-4 sm:p-5">
            {waitlist.length === 0 ? (
              <Empty title="Nobody waiting" body="Walk-ins added at the host stand show up here." />
            ) : (
              <ul className="space-y-2">
                {waitlist.map((w) => {
                  const over = w.waiting > w.quoted;
                  return (
                    <li
                      key={w.id}
                      className={cx(
                        "flex flex-wrap items-center gap-3 rounded-xl border p-3.5",
                        over ? "border-[color:var(--color-critical)]/30 bg-[color:var(--color-critical-bg)]/40" : "border-ink-100"
                      )}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-[13px] font-semibold text-white">
                        {w.party}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium text-ink-900">{w.name}</span>
                        <span className="block text-[12px] text-ink-400">
                          Party of {w.party} · {w.phone}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className={cx("tnum block text-[14px] font-semibold", over ? "text-[color:var(--color-critical)]" : "text-ink-900")}>
                          {dur(w.waiting)}
                        </span>
                        <span className="block text-[11.5px] text-ink-400">quoted {dur(w.quoted)}</span>
                      </span>
                      <span className="flex gap-2">
                        <Button size="sm">Text</Button>
                        <Button size="sm" variant="primary">Seat</Button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {tab === "Floor plan" && (
          <div className="p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center gap-4 text-[12.5px] text-ink-500">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-[color:var(--color-good)]" /> Occupied
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-ink-200 bg-white" /> Open
              </span>
            </div>
            <div className="space-y-5">
              {FLOOR.map((s) => (
                <div key={s.section}>
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-400">
                    {s.section}
                    <span className="ml-2 font-normal normal-case text-ink-300">
                      {s.tables.filter((t) => occupied.has(t)).length} of {s.tables.length} in use
                    </span>
                  </p>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-10">
                    {s.tables.map((t) => {
                      const res = seated.find((r) => r.table === t);
                      return (
                        <button
                          key={t}
                          onClick={() => res && setSelected(res)}
                          className={cx(
                            "ring-focus flex aspect-square flex-col items-center justify-center rounded-lg border text-[12px] font-medium transition-colors",
                            res
                              ? "border-transparent bg-[color:var(--color-good)] text-white"
                              : "border-ink-200 bg-white text-ink-400 hover:border-ink-300"
                          )}
                          aria-label={res ? `${t}, seated: ${res.name}, party of ${res.party}` : `${t}, open`}
                        >
                          <span>{t}</span>
                          {res && <span className="mt-0.5 text-[10.5px] font-normal opacity-90">{res.party} top</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* -------------------------------------------------- reservation detail */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Reservation"
        footer={
          <div className="flex gap-2">
            <Button size="sm" className="flex-1">Message guest</Button>
            <Button size="sm" variant="primary" className="flex-1">Seat now</Button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[17px] font-semibold text-ink-900">{selected.name}</p>
                <p className="text-[13px] text-ink-500">{selected.phone}</p>
              </div>
              <Badge tone={tone(selected.status)}>{selected.status}</Badge>
            </div>
            <dl className="grid grid-cols-2 gap-3">
              {[
                ["Time", selected.time],
                ["Party size", `${selected.party} guests`],
                ["Table", selected.table],
                ["Notes", selected.notes || "None"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-ink-50 px-3 py-2.5">
                  <dt className="text-[11.5px] text-ink-400">{k}</dt>
                  <dd className="mt-0.5 text-[13.5px] font-medium text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="flex items-start gap-2.5 rounded-lg border border-ink-100 p-3.5">
              <IconReservation size={17} className="mt-0.5 shrink-0 text-ink-400" />
              <p className="text-[12.5px] leading-relaxed text-ink-500">
                Seating this party links their check to the reservation, so their spend flows into the guest
                profile automatically.
              </p>
            </div>
          </div>
        )}
      </Drawer>

      {/* ------------------------------------------------------- new booking */}
      <Drawer
        open={adding}
        onClose={() => setAdding(false)}
        title="Add reservation"
        footer={
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" variant="primary" className="flex-1" onClick={() => setAdding(false)}>Book table</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Guest name"><input placeholder="Full name" className={inputClass} /></Field>
          <Field label="Phone"><input placeholder="(415) 555-0100" className={inputClass} inputMode="tel" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date"><input type="date" className={inputClass} /></Field>
            <Field label="Time"><input type="time" className={inputClass} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Party size"><input defaultValue="2" className={inputClass} inputMode="numeric" /></Field>
            <Field label="Section">
              <select className={inputClass}>{FLOOR.map((f) => <option key={f.section}>{f.section}</option>)}</select>
            </Field>
          </div>
          <Field label="Notes" hint="Allergies, occasions and seating preferences reach the host stand.">
            <textarea rows={3} className={cx(inputClass, "h-auto py-2")} placeholder="Anniversary, window seat if possible" />
          </Field>
        </div>
      </Drawer>
    </>
  );
}
