"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";
import { Logo } from "./Logo";
import { cx } from "@/components/ui";
import { IconChevron, IconLogout } from "./icons";
import { useSession } from "@/lib/session";
import { initials } from "@/lib/format";

export function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className="scroll-thin flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
      {NAV.map((group) => (
        <div key={group.group} className="mb-5 last:mb-2">
          {!collapsed && (
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[.07em] text-ink-300">
              {group.group}
            </p>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                    className={cx(
                      "ring-focus group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                      collapsed && "justify-center px-0",
                      active
                        ? "bg-brand-50 text-brand-600"
                        : "text-ink-500 hover:bg-ink-50 hover:text-ink-900"
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-500" />
                    )}
                    <Icon size={19} className="shrink-0" />
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="tnum rounded-full bg-brand-500 px-1.5 py-0.5 text-[10.5px] font-semibold leading-4 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { user, signOut } = useSession();
  return (
    <aside
      className={cx(
        "no-print fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-ink-100 bg-white transition-[width] duration-200 lg:flex",
        collapsed ? "w-[68px]" : "w-[248px]"
      )}
    >
      <div className={cx("flex h-16 shrink-0 items-center border-b border-ink-100", collapsed ? "justify-center px-2" : "px-5")}>
        <Link href="/" className="ring-focus rounded text-ink-900">
          <Logo wordmark={!collapsed} size={collapsed ? 24 : 26} />
        </Link>
      </div>

      <SidebarNav collapsed={collapsed} />

      <div className="shrink-0 border-t border-ink-100 p-3">
        {!collapsed && user && (
          <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[11.5px] font-semibold text-white">
              {initials(user.name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-ink-900">{user.name}</span>
              <span className="block truncate text-[11.5px] text-ink-400">{user.role}</span>
            </span>
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="ring-focus rounded p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-900"
            >
              <IconLogout size={17} />
            </button>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cx(
            "ring-focus flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-medium text-ink-400 hover:bg-ink-50 hover:text-ink-900",
            collapsed && "justify-center px-0"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <IconChevron size={16} className={cx("transition-transform", collapsed ? "-rotate-90" : "rotate-90")} />
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}
