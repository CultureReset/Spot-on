"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, DATE_RANGES, type DateRange } from "@/lib/session";
import { locations, notifications } from "@/lib/data";
import { ALL_NAV_ITEMS } from "@/lib/nav";
import { cx, Button } from "@/components/ui";
import { initials } from "@/lib/format";
import { Logo } from "./Logo";
import {
  IconBars, IconBell, IconCalendar, IconChevron, IconClose, IconPin, IconSearch, IconLogout, IconCheck,
} from "./icons";

/** Click-outside + Escape for the top bar's popovers. */
function useDismiss(onClose: () => void) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  return ref;
}

function Popover({
  label,
  children,
  panel,
  align = "right",
  className,
}: {
  label: string;
  children: React.ReactNode;
  panel: (close: () => void) => React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = useDismiss(() => setOpen(false));
  return (
    <div className={cx("relative", className)} ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={label}
        className="ring-focus flex h-9 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 text-[13px] font-medium text-ink-700 hover:bg-ink-50"
      >
        {children}
      </button>
      {open && (
        <div
          className={cx(
            "animate-fade-up absolute top-[calc(100%+6px)] z-40 min-w-[248px] rounded-xl border border-ink-100 bg-white p-1.5 shadow-xl",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {panel(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function TopBar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { user, location, setLocation, range, setRange, signOut } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const unread = notifications.filter((n) => n.unread).length;

  const current = ALL_NAV_ITEMS.find((i) => i.href === pathname);
  const results = query
    ? ALL_NAV_ITEMS.filter(
        (i) =>
          i.label.toLowerCase().includes(query.toLowerCase()) ||
          i.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // ⌘K / Ctrl-K opens search, like the rest of the product.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="no-print sticky top-0 z-20 border-b border-ink-100 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center gap-2 px-4 sm:px-6">
          {/* mobile: hamburger + logo */}
          <button
            onClick={onOpenMobileNav}
            aria-label="Open navigation"
            className="ring-focus -ml-1 rounded-lg p-2 text-ink-700 hover:bg-ink-50 lg:hidden"
          >
            <IconBars size={21} />
          </button>
          <Link href="/" className="ring-focus rounded text-ink-900 lg:hidden">
            <Logo size={24} wordmark={false} />
          </Link>

          {/* desktop: page title */}
          <div className="hidden min-w-0 flex-1 lg:block">
            <h2 className="truncate text-[15px] font-semibold text-ink-900">
              {current?.label ?? "Dashboard"}
            </h2>
          </div>

          <div className="flex-1 lg:hidden" />

          {/* ------------------------------------------------------ controls */}
          <div className="flex items-center gap-2">
            {/* search */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="ring-focus flex h-9 items-center gap-2 rounded-lg border border-ink-200 bg-white px-2.5 text-ink-400 hover:bg-ink-50"
            >
              <IconSearch size={17} />
              <span className="hidden text-[13px] xl:inline">Search…</span>
              <kbd className="hidden rounded border border-ink-200 px-1 text-[10.5px] font-medium text-ink-300 xl:inline">
                ⌘K
              </kbd>
            </button>

            {/* date range — one filter row scoping the whole dashboard */}
            <Popover
              label="Change date range"
              className="hidden sm:block"
              panel={(close) => (
                <ul role="listbox" aria-label="Date range">
                  {DATE_RANGES.map((r) => (
                    <li key={r}>
                      <button
                        role="option"
                        aria-selected={range === r}
                        onClick={() => { setRange(r as DateRange); close(); }}
                        className={cx(
                          "ring-focus flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] hover:bg-ink-50",
                          range === r ? "font-medium text-brand-600" : "text-ink-700"
                        )}
                      >
                        {r}
                        {range === r && <IconCheck size={15} />}
                      </button>
                    </li>
                  ))}
                  <li className="mt-1 border-t border-ink-100 pt-1">
                    <button className="ring-focus w-full rounded-lg px-3 py-2 text-left text-[13px] text-ink-500 hover:bg-ink-50">
                      Custom range…
                    </button>
                  </li>
                </ul>
              )}
            >
              <IconCalendar size={16} className="text-ink-400" />
              <span className="hidden md:inline">{range}</span>
              <IconChevron size={14} className="text-ink-300" />
            </Popover>

            {/* location switcher */}
            <Popover
              label="Switch location"
              panel={(close) => (
                <ul role="listbox" aria-label="Locations">
                  {locations.map((l) => (
                    <li key={l.id}>
                      <button
                        role="option"
                        aria-selected={location.id === l.id}
                        onClick={() => { setLocation(l); close(); }}
                        className={cx(
                          "ring-focus flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-ink-50",
                          location.id === l.id && "bg-brand-50"
                        )}
                      >
                        <IconPin size={16} className="mt-0.5 shrink-0 text-ink-400" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-ink-900">{l.name}</span>
                          <span className="block truncate text-[11.5px] text-ink-400">{l.address}</span>
                        </span>
                        {location.id === l.id && <IconCheck size={15} className="mt-0.5 shrink-0 text-brand-600" />}
                      </button>
                    </li>
                  ))}
                  <li className="mt-1 border-t border-ink-100 pt-1">
                    <button className="ring-focus w-full rounded-lg px-3 py-2 text-left text-[13px] font-medium text-brand-600 hover:bg-ink-50">
                      All locations combined
                    </button>
                  </li>
                </ul>
              )}
            >
              <IconPin size={16} className="text-ink-400" />
              <span className="hidden max-w-[130px] truncate lg:inline">
                {location.name.split("—")[1]?.trim() ?? location.name}
              </span>
              <IconChevron size={14} className="text-ink-300" />
            </Popover>

            {/* notifications */}
            <Popover
              label={`Notifications, ${unread} unread`}
              panel={() => (
                <div className="w-[300px]">
                  <div className="flex items-center justify-between px-3 py-2">
                    <p className="text-[13px] font-semibold text-ink-900">Notifications</p>
                    <button className="ring-focus rounded text-[12px] font-medium text-brand-600 hover:underline">
                      Mark all read
                    </button>
                  </div>
                  <ul className="max-h-[340px] overflow-y-auto scroll-thin">
                    {notifications.map((n) => (
                      <li key={n.id}>
                        <button className="ring-focus flex w-full gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-ink-50">
                          <span
                            className={cx(
                              "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                              n.unread ? "bg-brand-500" : "bg-transparent"
                            )}
                          />
                          <span className="min-w-0">
                            <span className="block text-[13px] font-medium text-ink-900">{n.title}</span>
                            <span className="mt-0.5 block text-[12px] leading-snug text-ink-500">{n.body}</span>
                            <span className="mt-1 block text-[11px] text-ink-300">{n.time}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            >
              <span className="relative">
                <IconBell size={17} className="text-ink-500" />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </span>
            </Popover>

            {/* profile */}
            <Popover
              label="Account menu"
              panel={() => (
                <div>
                  <div className="border-b border-ink-100 px-3 py-2.5">
                    <p className="truncate text-[13px] font-medium text-ink-900">{user?.name}</p>
                    <p className="truncate text-[12px] text-ink-400">{user?.email}</p>
                    <p className="mt-1 text-[11.5px] text-ink-400">{user?.role} · {user?.business}</p>
                  </div>
                  <ul className="py-1">
                    {[
                      ["My profile", "/settings"],
                      ["Dashboard users", "/users"],
                      ["Business settings", "/settings"],
                      ["Help center", "/settings"],
                    ].map(([label, href]) => (
                      <li key={label}>
                        <Link
                          href={href}
                          className="ring-focus block rounded-lg px-3 py-2 text-[13px] text-ink-700 hover:bg-ink-50"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-ink-100 pt-1">
                    <button
                      onClick={() => { signOut(); router.push("/login"); }}
                      className="ring-focus flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-ink-700 hover:bg-ink-50"
                    >
                      <IconLogout size={16} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-[10.5px] font-semibold text-white">
                {user ? initials(user.name) : "?"}
              </span>
              <IconChevron size={14} className="hidden text-ink-300 sm:block" />
            </Popover>
          </div>
        </div>

        {/* mobile date range strip — the same single filter, kept reachable */}
        <div className="scroll-thin flex gap-1.5 overflow-x-auto border-t border-ink-50 px-4 py-2 sm:hidden">
          {DATE_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={cx(
                "shrink-0 rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors",
                range === r ? "bg-ink-900 text-white" : "bg-ink-50 text-ink-500"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </header>

      {/* ------------------------------------------------------ command search */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Search the dashboard"
        >
          <div className="absolute inset-0 bg-ink-900/30" onClick={() => setSearchOpen(false)} />
          <div className="animate-fade-up relative w-full max-w-lg overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-2xl">
            <div className="flex items-center gap-2.5 border-b border-ink-100 px-4">
              <IconSearch size={18} className="text-ink-300" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reports, sections, settings…"
                className="h-14 flex-1 bg-transparent text-[15px] text-ink-900 outline-none placeholder:text-ink-300"
              />
              <button
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="ring-focus rounded p-1.5 text-ink-400 hover:bg-ink-50"
              >
                <IconClose size={17} />
              </button>
            </div>
            <ul className="max-h-[50vh] overflow-y-auto scroll-thin p-2">
              {(query ? results : ALL_NAV_ITEMS.slice(0, 6)).map((i) => {
                const Icon = i.icon;
                return (
                  <li key={i.href}>
                    <button
                      onClick={() => { router.push(i.href); setSearchOpen(false); setQuery(""); }}
                      className="ring-focus flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-ink-50"
                    >
                      <Icon size={18} className="shrink-0 text-ink-400" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-ink-900">{i.label}</span>
                        <span className="block truncate text-[12px] text-ink-400">{i.description}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
              {query && results.length === 0 && (
                <li className="px-3 py-8 text-center text-[13px] text-ink-400">
                  No matches for &ldquo;{query}&rdquo;
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
