"use client";

import React from "react";
import {
  Card, CardHeader, PageHeader, Button, Badge, Toggle, Field, inputClass,
  Table, Td, Tr, cx,
} from "@/components/ui";
import { locations } from "@/lib/data";
import { useSession } from "@/lib/session";
import { IconChevronRight } from "@/components/shell/icons";

const SECTIONS = [
  "Business profile",
  "Locations",
  "Hours",
  "Taxes & service charges",
  "Receipts",
  "Payments & payouts",
  "Notifications",
  "Security",
] as const;
type Section = (typeof SECTIONS)[number];

const HOURS = [
  ["Monday", "11:00 AM", "10:00 PM", true],
  ["Tuesday", "11:00 AM", "10:00 PM", true],
  ["Wednesday", "11:00 AM", "10:00 PM", true],
  ["Thursday", "11:00 AM", "11:00 PM", true],
  ["Friday", "11:00 AM", "12:00 AM", true],
  ["Saturday", "10:00 AM", "12:00 AM", true],
  ["Sunday", "10:00 AM", "9:00 PM", true],
] as const;

export default function SettingsPage() {
  const { user } = useSession();
  const [section, setSection] = React.useState<Section>("Business profile");
  const [notifs, setNotifs] = React.useState({
    dailyRecap: true, depositAlerts: true, laborAlerts: true,
    newReviews: true, deviceOffline: true, largeRefunds: false, weeklyDigest: true,
  });

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Business configuration that applies across the dashboard and every terminal"
        actions={<Button size="sm" variant="primary">Save changes</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        {/* section nav — a scrolling chip row on mobile, a list on desktop */}
        <nav aria-label="Settings sections" className="min-w-0">
          <div className="scroll-thin -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {SECTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSection(s)}
                aria-current={section === s ? "true" : undefined}
                className={cx(
                  "ring-focus shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-left text-[13.5px] font-medium transition-colors lg:flex lg:w-full lg:items-center lg:justify-between",
                  section === s ? "bg-brand-50 text-brand-600" : "text-ink-500 hover:bg-ink-50 hover:text-ink-900"
                )}
              >
                {s}
                <IconChevronRight size={14} className="hidden shrink-0 opacity-40 lg:block" />
              </button>
            ))}
          </div>
        </nav>

        <div className="space-y-4">
          {/* ------------------------------------------------ business profile */}
          {section === "Business profile" && (
            <Card>
              <CardHeader title="Business profile" subtitle="Appears on receipts, your ordering site and guest-facing messages" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Business name"><input defaultValue="Harborview Kitchen" className={inputClass} /></Field>
                <Field label="Legal entity"><input defaultValue="Harborview Hospitality LLC" className={inputClass} /></Field>
                <Field label="Business phone"><input defaultValue="(415) 555-0142" className={inputClass} /></Field>
                <Field label="Support email"><input defaultValue="hello@harborview.co" className={inputClass} /></Field>
                <Field label="Cuisine type">
                  <select className={inputClass} defaultValue="Casual dining">
                    {["Casual dining", "Fine dining", "Bar / Pub", "Brewery", "Quick service", "Fast casual", "Cafe / Bakery"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Time zone">
                  <select className={inputClass} defaultValue="Pacific Time (PT)">
                    {["Pacific Time (PT)", "Mountain Time (MT)", "Central Time (CT)", "Eastern Time (ET)"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Description" hint="Shown on your online ordering site.">
                  <textarea
                    rows={3}
                    className={cx(inputClass, "h-auto py-2")}
                    defaultValue="Coastal California cooking, a long bar and a patio that catches the afternoon sun."
                  />
                </Field>
              </div>
            </Card>
          )}

          {/* ------------------------------------------------------- locations */}
          {section === "Locations" && (
            <Card padded={false}>
              <div className="p-4 sm:p-5">
                <CardHeader
                  title="Locations"
                  subtitle="Each location has its own menus, staff and payouts"
                  action={<Button size="sm">Add location</Button>}
                />
              </div>
              <Table
                columns={[
                  { key: "name", label: "Location" },
                  { key: "address", label: "Address", hideOn: "hidden md:table-cell" },
                  { key: "tz", label: "Time zone", align: "right", hideOn: "hidden lg:table-cell" },
                  { key: "status", label: "Status", align: "right" },
                ]}
              >
                {locations.map((l) => (
                  <Tr key={l.id}>
                    <Td strong>{l.name}</Td>
                    <Td className="hidden md:table-cell">{l.address}, {l.city}</Td>
                    <Td align="right" className="hidden lg:table-cell">{l.timezone}</Td>
                    <Td align="right">
                      <Badge tone={l.status === "open" ? "good" : "neutral"}>
                        {l.status === "open" ? "Open" : "Closed"}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Table>
            </Card>
          )}

          {/* ----------------------------------------------------------- hours */}
          {section === "Hours" && (
            <Card>
              <CardHeader title="Hours of operation" subtitle="Drives online ordering availability and reservation slots" />
              <ul className="divide-y divide-ink-50">
                {HOURS.map(([day, open, close, isOpen]) => (
                  <li key={day} className="flex flex-wrap items-center gap-3 py-3">
                    <span className="w-24 shrink-0 text-[13.5px] font-medium text-ink-900">{day}</span>
                    <span className="flex items-center gap-2">
                      <input defaultValue={open} className={cx(inputClass, "h-9 w-28")} />
                      <span className="text-ink-400">to</span>
                      <input defaultValue={close} className={cx(inputClass, "h-9 w-28")} />
                    </span>
                    <span className="ml-auto flex items-center gap-2">
                      <span className="text-[12.5px] text-ink-400">{isOpen ? "Open" : "Closed"}</span>
                      <Toggle checked={isOpen} onChange={() => {}} label={`${day} open`} />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-lg bg-ink-50 p-3.5">
                <p className="text-[12.5px] leading-relaxed text-ink-500">
                  Holiday hours and one-off closures are set per date and override these defaults.
                </p>
              </div>
            </Card>
          )}

          {/* ----------------------------------------------------------- taxes */}
          {section === "Taxes & service charges" && (
            <>
              <Card padded={false}>
                <div className="p-4 sm:p-5">
                  <CardHeader title="Tax rates" subtitle="Applied per item category at the point of sale" />
                </div>
                <Table
                  columns={[
                    { key: "name", label: "Tax" },
                    { key: "rate", label: "Rate", align: "right" },
                    { key: "applies", label: "Applies to", hideOn: "hidden sm:table-cell" },
                  ]}
                >
                  {[
                    ["Sales tax", "8.625%", "Food and non-alcoholic beverages"],
                    ["Alcohol tax", "9.750%", "Beer, wine and cocktails"],
                    ["Local district tax", "0.500%", "All taxable items"],
                  ].map(([n, r, a]) => (
                    <Tr key={n}>
                      <Td strong>{n}</Td>
                      <Td align="right">{r}</Td>
                      <Td className="hidden sm:table-cell">{a}</Td>
                    </Tr>
                  ))}
                </Table>
              </Card>

              <Card padded={false}>
                <div className="p-4 sm:p-5">
                  <CardHeader title="Service charges" subtitle="Added automatically at the check" />
                </div>
                <Table
                  columns={[
                    { key: "name", label: "Charge" },
                    { key: "amount", label: "Amount", align: "right" },
                    { key: "when", label: "When", hideOn: "hidden sm:table-cell" },
                  ]}
                >
                  {[
                    ["Large party gratuity", "20%", "Parties of 6 or more"],
                    ["Private dining fee", "$150.00", "Private room bookings"],
                    ["Delivery fee", "$4.99", "Delivery orders"],
                  ].map(([n, a, w]) => (
                    <Tr key={n}>
                      <Td strong>{n}</Td>
                      <Td align="right">{a}</Td>
                      <Td className="hidden sm:table-cell">{w}</Td>
                    </Tr>
                  ))}
                </Table>
              </Card>
            </>
          )}

          {/* -------------------------------------------------------- receipts */}
          {section === "Receipts" && (
            <Card>
              <CardHeader title="Receipts" subtitle="What guests see on paper and in email" />
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <Field label="Header line"><input defaultValue="Harborview Kitchen" className={inputClass} /></Field>
                  <Field label="Footer message">
                    <textarea rows={3} className={cx(inputClass, "h-auto py-2")} defaultValue="Thanks for coming in. Join Harborview Rewards at harborview.co/rewards." />
                  </Field>
                  <ul className="divide-y divide-ink-50 rounded-lg border border-ink-100">
                    {[
                      ["Print receipts automatically", true],
                      ["Offer email receipts", true],
                      ["Show itemised modifiers", true],
                      ["Show loyalty balance", true],
                      ["Include a tip line on printed receipts", false],
                    ].map(([label, on]) => (
                      <li key={label as string} className="flex items-center justify-between px-3.5 py-2.5">
                        <span className="text-[13px] text-ink-700">{label as string}</span>
                        <Toggle checked={on as boolean} onChange={() => {}} label={label as string} />
                      </li>
                    ))}
                  </ul>
                </div>

                {/* live-ish preview — receipts are the one setting worth showing */}
                <div className="rounded-xl border border-ink-100 bg-ink-50 p-4">
                  <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-400">Preview</p>
                  <div className="mx-auto max-w-[260px] rounded-lg bg-white p-4 font-mono text-[11px] leading-relaxed text-ink-700 shadow-sm">
                    <p className="text-center text-[13px] font-semibold">Harborview Kitchen</p>
                    <p className="text-center text-ink-400">418 Market St, San Francisco</p>
                    <p className="my-2 border-t border-dashed border-ink-200" />
                    <p className="flex justify-between"><span>2× Harbor Burger</span><span>42.00</span></p>
                    <p className="pl-3 text-ink-400">med rare, add bacon</p>
                    <p className="flex justify-between"><span>1× Truffle Fries</span><span>11.00</span></p>
                    <p className="flex justify-between"><span>2× Local IPA</span><span>18.00</span></p>
                    <p className="my-2 border-t border-dashed border-ink-200" />
                    <p className="flex justify-between"><span>Subtotal</span><span>71.00</span></p>
                    <p className="flex justify-between"><span>Tax</span><span>6.24</span></p>
                    <p className="flex justify-between font-semibold"><span>Total</span><span>77.24</span></p>
                    <p className="my-2 border-t border-dashed border-ink-200" />
                    <p className="text-center text-ink-400">Rewards balance: 1,240 pts</p>
                    <p className="mt-2 text-center text-[10px] text-ink-400">
                      Thanks for coming in. Join Harborview Rewards at harborview.co/rewards.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ------------------------------------------------------- payments */}
          {section === "Payments & payouts" && (
            <>
              <Card>
                <CardHeader title="Payouts" subtitle="Where your money lands and how often" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Bank account"><input defaultValue="Wells Fargo checking •••4417" className={inputClass} readOnly /></Field>
                  <Field label="Payout schedule">
                    <select className={inputClass} defaultValue="Daily (next business day)">
                      {["Daily (next business day)", "Weekly on Monday", "Monthly on the 1st"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Batch close time" hint="When the day's transactions settle.">
                    <input defaultValue="11:59 PM" className={inputClass} />
                  </Field>
                  <Field label="Statement delivery">
                    <select className={inputClass} defaultValue="Email monthly">
                      {["Email monthly", "Email weekly", "Dashboard only"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
              </Card>

              <Card>
                <CardHeader title="Accepted payments" subtitle="What terminals and the ordering site will take" />
                <ul className="divide-y divide-ink-50">
                  {[
                    ["Visa, Mastercard, Discover", true],
                    ["American Express", true],
                    ["Apple Pay and Google Pay", true],
                    ["Cash", true],
                    ["SpotOn gift cards", true],
                    ["Manual card entry", false],
                  ].map(([label, on]) => (
                    <li key={label as string} className="flex items-center justify-between py-2.5">
                      <span className="text-[13px] text-ink-700">{label as string}</span>
                      <Toggle checked={on as boolean} onChange={() => {}} label={label as string} />
                    </li>
                  ))}
                </ul>
              </Card>
            </>
          )}

          {/* --------------------------------------------------- notifications */}
          {section === "Notifications" && (
            <Card>
              <CardHeader title="Notifications" subtitle={`Sent to ${user?.email} and the SpotOn mobile app`} />
              <ul className="divide-y divide-ink-50">
                {([
                  ["dailyRecap", "Daily recap", "A summary of yesterday's sales, labor and covers, each morning."],
                  ["depositAlerts", "Deposit alerts", "When a payout leaves for your bank account."],
                  ["laborAlerts", "Labor alerts", "When labor crosses your target percentage during service."],
                  ["newReviews", "New reviews", "Any new review on a connected platform."],
                  ["deviceOffline", "Device offline", "When a terminal, handheld or KDS stops reporting in."],
                  ["largeRefunds", "Large refunds", "Refunds over $100, as they happen."],
                  ["weeklyDigest", "Weekly digest", "A wider read on the week, sent Monday morning."],
                ] as const).map(([key, label, hint]) => (
                  <li key={key} className="flex items-start justify-between gap-4 py-3">
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-medium text-ink-900">{label}</span>
                      <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-400">{hint}</span>
                    </span>
                    <Toggle
                      checked={notifs[key]}
                      onChange={(v) => setNotifs((s) => ({ ...s, [key]: v }))}
                      label={label}
                    />
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* -------------------------------------------------------- security */}
          {section === "Security" && (
            <>
              <Card>
                <CardHeader title="Your account" subtitle="Sign-in and verification for this dashboard user" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name"><input defaultValue={user?.name} className={inputClass} /></Field>
                  <Field label="Email"><input defaultValue={user?.email} className={inputClass} /></Field>
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    ["Password", "Last changed 4 months ago", "Change password"],
                    ["Two-factor authentication", "Enabled via SMS to •••4417", "Manage"],
                    ["Active sessions", "3 devices signed in", "Review"],
                  ].map(([label, hint, action]) => (
                    <div key={label} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-100 p-3.5">
                      <div>
                        <p className="text-[13.5px] font-medium text-ink-900">{label}</p>
                        <p className="mt-0.5 text-[12.5px] text-ink-400">{hint}</p>
                      </div>
                      <Button size="sm">{action}</Button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader title="Business security policy" subtitle="Applies to every dashboard user on this account" />
                <ul className="divide-y divide-ink-50">
                  {[
                    ["Require two-factor for all users", true],
                    ["Sign out after 8 hours of inactivity", true],
                    ["Require a manager PIN for voids and refunds", true],
                    ["Alert on sign-in from a new device", true],
                  ].map(([label, on]) => (
                    <li key={label as string} className="flex items-center justify-between py-2.5">
                      <span className="text-[13px] text-ink-700">{label as string}</span>
                      <Toggle checked={on as boolean} onChange={() => {}} label={label as string} />
                    </li>
                  ))}
                </ul>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}
