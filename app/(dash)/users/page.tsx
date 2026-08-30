"use client";

import React from "react";
import {
  Card, CardHeader, PageHeader, Button, Badge, Table, Td, Tr, Drawer,
  Field, inputClass, Toggle, Stat,
} from "@/components/ui";
import { employees } from "@/lib/data";
import { initials, num } from "@/lib/format";
import { IconPlus } from "@/components/shell/icons";

type Role = "Owner / Admin" | "Manager" | "Bookkeeper" | "Marketing";

const PERMISSIONS: Array<{ group: string; items: string[] }> = [
  { group: "Reporting", items: ["View sales and reports", "Export report data", "View labor cost"] },
  { group: "Operations", items: ["Edit menus and pricing", "Manage employees", "Void and refund orders"] },
  { group: "Money", items: ["View statements and deposits", "Change bank details"] },
  { group: "Marketing", items: ["Create campaigns", "Manage loyalty program", "Reply to reviews"] },
  { group: "Admin", items: ["Manage dashboard users", "Change business settings"] },
];

const ROLE_MATRIX: Record<Role, string[]> = {
  "Owner / Admin": PERMISSIONS.flatMap((p) => p.items),
  Manager: [
    "View sales and reports", "Export report data", "View labor cost",
    "Edit menus and pricing", "Manage employees", "Void and refund orders", "Reply to reviews",
  ],
  Bookkeeper: ["View sales and reports", "Export report data", "View statements and deposits"],
  Marketing: ["View sales and reports", "Create campaigns", "Manage loyalty program", "Reply to reviews"],
};

const USERS = [
  { id: "u1", name: employees[0].name, email: employees[0].email, role: "Owner / Admin" as Role, lastActive: "Active now", status: "Active", locations: 3 },
  { id: "u2", name: employees[6].name, email: employees[6].email, role: "Manager" as Role, lastActive: "2 hours ago", status: "Active", locations: 1 },
  { id: "u3", name: employees[11].name, email: employees[11].email, role: "Manager" as Role, lastActive: "Yesterday", status: "Active", locations: 2 },
  { id: "u4", name: "Priya Nair", email: "priya.nair@harborview.co", role: "Bookkeeper" as Role, lastActive: "4 days ago", status: "Active", locations: 3 },
  { id: "u5", name: "Owen Brennan", email: "owen.brennan@harborview.co", role: "Marketing" as Role, lastActive: "Never", status: "Invited", locations: 3 },
];

export default function UsersPage() {
  const [selected, setSelected] = React.useState<(typeof USERS)[number] | null>(null);
  const [inviting, setInviting] = React.useState(false);

  return (
    <>
      <PageHeader
        title="Dashboard users"
        subtitle="Who can sign in to this dashboard, and what each of them can reach"
        actions={
          <Button size="sm" variant="primary" onClick={() => setInviting(true)}>
            <IconPlus size={15} /> Invite user
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Users" value={num(USERS.length)} hint="with dashboard access" />
        <Stat label="Admins" value={num(USERS.filter((u) => u.role === "Owner / Admin").length)} hint="full access" />
        <Stat label="Pending invites" value={num(USERS.filter((u) => u.status === "Invited").length)} hint="not yet accepted" />
        <Stat label="Two-factor" value="Required" hint="enforced for all users" />
      </div>

      <Card padded={false}>
        <div className="p-4 sm:p-5">
          <CardHeader title="Users" subtitle="Dashboard access is separate from POS employee logins" />
        </div>
        <Table
          columns={[
            { key: "user", label: "User" },
            { key: "role", label: "Role", hideOn: "hidden sm:table-cell" },
            { key: "locations", label: "Locations", align: "right", hideOn: "hidden md:table-cell" },
            { key: "active", label: "Last active", align: "right", hideOn: "hidden lg:table-cell" },
            { key: "status", label: "Status", align: "right" },
          ]}
        >
          {USERS.map((u) => (
            <Tr key={u.id}>
              <Td strong>
                <button onClick={() => setSelected(u)} className="ring-focus flex items-center gap-2.5 rounded text-left hover:text-brand-600">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[11px] font-semibold text-ink-600">
                    {initials(u.name)}
                  </span>
                  <span>
                    <span className="block hover:underline">{u.name}</span>
                    <span className="block text-[11.5px] font-normal text-ink-400">{u.email}</span>
                  </span>
                </button>
              </Td>
              <Td className="hidden sm:table-cell">{u.role}</Td>
              <Td align="right" className="hidden md:table-cell">{u.locations} of 3</Td>
              <Td align="right" className="hidden lg:table-cell">{u.lastActive}</Td>
              <Td align="right">
                <Badge tone={u.status === "Active" ? "good" : "warning"}>{u.status}</Badge>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>

      <Card className="mt-5">
        <CardHeader title="What each role can do" subtitle="Roles are fixed sets — pick the closest fit, then adjust per user" />
        <div className="scroll-thin -mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink-100">
                <th className="px-4 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wide text-ink-400">
                  Permission
                </th>
                {(Object.keys(ROLE_MATRIX) as Role[]).map((r) => (
                  <th key={r} className="px-3 py-2.5 text-center text-[12px] font-semibold uppercase tracking-wide text-ink-400">
                    {r.replace(" / Admin", "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((g) => (
                <React.Fragment key={g.group}>
                  <tr className="bg-ink-50">
                    <td colSpan={5} className="px-4 py-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-ink-500">
                      {g.group}
                    </td>
                  </tr>
                  {g.items.map((item) => (
                    <tr key={item} className="border-b border-ink-50">
                      <td className="px-4 py-2.5 text-[13px] text-ink-700">{item}</td>
                      {(Object.keys(ROLE_MATRIX) as Role[]).map((r) => (
                        <td key={r} className="px-3 py-2.5 text-center">
                          {ROLE_MATRIX[r].includes(item) ? (
                            <span className="text-[color:var(--color-good)]" aria-label="Allowed">
                              <svg width="15" height="15" viewBox="0 0 16 16" className="inline" aria-hidden="true">
                                <path d="m3 8.5 3.4 3.4L13 5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          ) : (
                            <span className="text-ink-200" aria-label="Not allowed">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title="User access"
        footer={
          <div className="flex gap-2">
            <Button size="sm" variant="danger" className="flex-1">Remove access</Button>
            <Button size="sm" variant="primary" className="flex-1" onClick={() => setSelected(null)}>Save</Button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-900 text-[14px] font-semibold text-white">
                {initials(selected.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-ink-900">{selected.name}</p>
                <p className="truncate text-[12.5px] text-ink-400">{selected.email}</p>
              </div>
            </div>

            <Field label="Role">
              <select defaultValue={selected.role} className={inputClass}>
                {(Object.keys(ROLE_MATRIX) as Role[]).map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>

            <div>
              <p className="mb-2 text-[13px] font-medium text-ink-700">Location access</p>
              <ul className="divide-y divide-ink-50 rounded-lg border border-ink-100">
                {["Downtown", "Marina", "Taproom"].map((l, i) => (
                  <li key={l} className="flex items-center justify-between px-3.5 py-2.5">
                    <span className="text-[13px] text-ink-700">{l}</span>
                    <Toggle checked={i < selected.locations} onChange={() => {}} label={`Access to ${l}`} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-ink-50 p-3.5">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">Effective permissions</p>
              <ul className="mt-2 space-y-1">
                {ROLE_MATRIX[selected.role].map((p) => (
                  <li key={p} className="text-[12.5px] text-ink-600">• {p}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Drawer>

      <Drawer
        open={inviting}
        onClose={() => setInviting(false)}
        title="Invite a user"
        footer={
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => setInviting(false)}>Cancel</Button>
            <Button size="sm" variant="primary" className="flex-1" onClick={() => setInviting(false)}>Send invite</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Email address" hint="They will get a link to set a password and enrol in two-factor.">
            <input placeholder="name@yourrestaurant.com" className={inputClass} type="email" />
          </Field>
          <Field label="Role">
            <select className={inputClass}>
              {(Object.keys(ROLE_MATRIX) as Role[]).map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-700">Location access</p>
            <ul className="divide-y divide-ink-50 rounded-lg border border-ink-100">
              {["Downtown", "Marina", "Taproom"].map((l) => (
                <li key={l} className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-[13px] text-ink-700">{l}</span>
                  <Toggle checked onChange={() => {}} label={`Access to ${l}`} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Drawer>
    </>
  );
}
