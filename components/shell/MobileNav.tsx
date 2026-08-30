"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, ALL_NAV_ITEMS, MOBILE_TABS } from "@/lib/nav";
import { cx } from "@/components/ui";
import { Logo } from "./Logo";
import { IconClose, IconMore, IconLogout } from "./icons";
import { SidebarNav } from "./Sidebar";
import { useSession } from "@/lib/session";
import { initials } from "@/lib/format";

/** Full-height drawer — the complete IA, reachable from the hamburger or More. */
export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, signOut } = useSession();

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
      <div className="absolute inset-0 bg-ink-900/35" onClick={onClose} />
      <div className="animate-fade-up relative flex h-full w-[86%] max-w-[300px] flex-col bg-white shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink-100 px-4">
          <Logo size={25} className="text-ink-900" />
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="ring-focus rounded-lg p-2 text-ink-500 hover:bg-ink-50"
          >
            <IconClose size={19} />
          </button>
        </div>

        <SidebarNav onNavigate={onClose} />

        {user && (
          <div className="shrink-0 border-t border-ink-100 p-3">
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[12px] font-semibold text-white">
                {initials(user.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-ink-900">{user.name}</span>
                <span className="block truncate text-[11.5px] text-ink-400">{user.business}</span>
              </span>
              <button
                onClick={signOut}
                aria-label="Sign out"
                className="ring-focus rounded p-2 text-ink-400 hover:bg-ink-50 hover:text-ink-900"
              >
                <IconLogout size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Thumb-reachable tab bar: four destinations plus More. */
export function MobileTabBar({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();
  const tabs = MOBILE_TABS.map((href) => ALL_NAV_ITEMS.find((i) => i.href === href)!);
  const inMore = !MOBILE_TABS.includes(pathname);

  return (
    <nav
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-ink-100 bg-white/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <ul className="flex">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = pathname === t.href;
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "ring-focus flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10.5px] font-medium",
                  active ? "text-brand-600" : "text-ink-400"
                )}
              >
                <Icon size={21} />
                <span className="truncate">{t.label}</span>
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <button
            onClick={onMore}
            className={cx(
              "ring-focus flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10.5px] font-medium",
              inMore ? "text-brand-600" : "text-ink-400"
            )}
          >
            <IconMore size={21} />
            <span>More</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

/** Bottom sheet listing every section not in the tab bar. */
export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end lg:hidden" role="dialog" aria-modal="true" aria-label="All sections">
      <div className="absolute inset-0 bg-ink-900/35" onClick={onClose} />
      <div className="animate-fade-up relative max-h-[80vh] w-full overflow-y-auto scroll-thin rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-ink-100 bg-white px-5 py-3.5">
          <h2 className="text-[15px] font-semibold text-ink-900">All sections</h2>
          <button onClick={onClose} aria-label="Close" className="ring-focus rounded-lg p-1.5 text-ink-500 hover:bg-ink-50">
            <IconClose size={19} />
          </button>
        </div>
        <div className="px-4 py-4">
          {NAV.map((group) => (
            <div key={group.group} className="mb-5 last:mb-1">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.07em] text-ink-300">{group.group}</p>
              <ul className="grid grid-cols-2 gap-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="ring-focus flex h-full items-start gap-2.5 rounded-xl border border-ink-100 p-3 hover:border-brand-500 hover:bg-brand-50"
                      >
                        <Icon size={19} className="mt-0.5 shrink-0 text-ink-500" />
                        <span className="min-w-0">
                          <span className="block text-[13px] font-medium leading-tight text-ink-900">{item.label}</span>
                          <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-400">{item.description}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
