"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { MobileDrawer, MobileTabBar, MoreSheet } from "@/components/shell/MobileNav";
import { useSession } from "@/lib/session";
import { cx } from "@/components/ui";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawer, setDrawer] = React.useState(false);
  const [more, setMore] = React.useState(false);

  React.useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  // Restore the sidebar width preference after mount (keeps SSR markup stable).
  React.useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem("spoton.sidebar") === "collapsed");
    } catch { /* ignore */ }
  }, []);

  const toggle = () => {
    setCollapsed((v) => {
      const next = !v;
      try { window.localStorage.setItem("spoton.sidebar", next ? "collapsed" : "expanded"); } catch { /* ignore */ }
      return next;
    });
  };

  if (!ready || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-ink-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />
          <p className="text-[13px] text-ink-400">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} />
      <MoreSheet open={more} onClose={() => setMore(false)} />

      <div className={cx("transition-[padding] duration-200", collapsed ? "lg:pl-[68px]" : "lg:pl-[248px]")}>
        <TopBar onOpenMobileNav={() => setDrawer(true)} />
        <main id="main" className="mx-auto max-w-[1400px] px-4 pb-24 pt-5 sm:px-6 lg:pb-10">
          {children}
        </main>
      </div>

      <MobileTabBar onMore={() => setMore(true)} />
    </div>
  );
}
