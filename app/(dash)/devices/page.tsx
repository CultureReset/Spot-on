"use client";

import React from "react";
import { Card, CardHeader, PageHeader, Button, Badge, Stat, Table, Td, Tr, cx } from "@/components/ui";
import { devices } from "@/lib/data";
import { num } from "@/lib/format";
import { IconPlus, IconDevice } from "@/components/shell/icons";

export default function DevicesPage() {
  const online = devices.filter((d) => d.status === "Online");
  const issues = devices.filter((d) => d.status !== "Online");
  const outdated = devices.filter((d) => d.version === "12.3.8");

  const tone = (s: string) => (s === "Online" ? "good" : s === "Offline" ? "critical" : "warning");

  return (
    <>
      <PageHeader
        title="Devices"
        subtitle="Terminals, handhelds, kitchen displays and peripherals on this location's network"
        actions={
          <>
            <Button size="sm">Run diagnostics</Button>
            <Button size="sm" variant="primary"><IconPlus size={15} /> Pair device</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Devices" value={num(devices.length)} hint="paired to this location" />
        <Stat label="Online" value={num(online.length)} hint="reporting in now" />
        <Stat label="Need attention" value={num(issues.length)} hint="offline or low supplies" />
        <Stat label="Update available" value={num(outdated.length)} hint="running an older build" />
      </div>

      {issues.length > 0 && (
        <div className="mb-5 rounded-xl border border-[color:var(--color-warning)]/25 bg-[color:var(--color-warning-bg)]/50 p-4">
          <p className="text-[14px] font-semibold text-ink-900">{issues.length} devices need attention</p>
          <ul className="mt-2 space-y-1.5">
            {issues.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-2 text-[13px] text-ink-700">
                <span className="font-medium">{d.name}</span>
                <Badge tone={tone(d.status)}>{d.status}</Badge>
                <span className="text-ink-400">
                  {d.status === "Offline"
                    ? `Last seen ${d.lastSeen.toLowerCase()} — check power and the charging dock.`
                    : "Load a fresh roll at the expo station."}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Card padded={false}>
        <div className="p-4 sm:p-5">
          <CardHeader title="All devices" subtitle="Everything paired to Harborview Kitchen — Downtown" />
        </div>
        <Table
          columns={[
            { key: "name", label: "Device" },
            { key: "type", label: "Type", hideOn: "hidden sm:table-cell" },
            { key: "serial", label: "Serial", hideOn: "hidden lg:table-cell" },
            { key: "version", label: "Software", align: "right", hideOn: "hidden md:table-cell" },
            { key: "seen", label: "Last seen", align: "right", hideOn: "hidden sm:table-cell" },
            { key: "status", label: "Status", align: "right" },
          ]}
        >
          {devices.map((d) => (
            <Tr key={d.id}>
              <Td strong>
                <span className="flex items-center gap-2.5">
                  <span
                    className={cx(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      d.status === "Online" ? "bg-ink-50 text-ink-500" : "bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]"
                    )}
                  >
                    <IconDevice size={16} />
                  </span>
                  <span>
                    {d.name}
                    <span className="mt-0.5 block text-[11.5px] font-normal text-ink-400 sm:hidden">{d.type}</span>
                  </span>
                </span>
              </Td>
              <Td className="hidden sm:table-cell">{d.type}</Td>
              <Td className="hidden lg:table-cell tnum">{d.serial}</Td>
              <Td align="right" className="hidden md:table-cell">
                {d.version}
                {d.version === "12.3.8" && <Badge tone="warning">Update</Badge>}
              </Td>
              <Td align="right" className="hidden sm:table-cell">{d.lastSeen}</Td>
              <Td align="right"><Badge tone={tone(d.status)}>{d.status}</Badge></Td>
            </Tr>
          ))}
        </Table>
      </Card>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Printer routing" subtitle="Which station prints which items" />
          <ul className="divide-y divide-ink-50">
            {[
              ["Hot line printer", "Entrées, Starters (Grill, Sauté, Fry)"],
              ["Cold station printer", "Salads, Cold apps, Raw bar"],
              ["Bar printer", "Cocktails, Beer, Wine, Non-alcoholic"],
              ["Expo printer", "All items — runner ticket"],
            ].map(([name, routes]) => (
              <li key={name} className="flex items-start justify-between gap-3 py-2.5">
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium text-ink-900">{name}</span>
                  <span className="block text-[12px] text-ink-400">{routes}</span>
                </span>
                <Button size="sm">Edit</Button>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Network" subtitle="Connectivity for this location" />
          <dl className="space-y-3">
            {[
              ["Connection", "Business fibre · 940 Mbps down"],
              ["Backup", "LTE failover — active and tested 3 days ago"],
              ["Offline mode", "Enabled — terminals keep ringing sales without internet"],
              ["Last sync", "Just now"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 border-b border-ink-50 pb-3 last:border-0 last:pb-0">
                <dt className="text-[13px] text-ink-500">{k}</dt>
                <dd className="text-right text-[13px] font-medium text-ink-900">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </>
  );
}
