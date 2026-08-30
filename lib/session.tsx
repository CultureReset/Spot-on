"use client";

import React from "react";
import { locations, days90, type DayPoint, type Location } from "@/lib/data";

export type DateRange = "Today" | "Yesterday" | "Last 7 days" | "Last 30 days" | "Last 90 days";
export const DATE_RANGES: DateRange[] = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "Last 90 days"];

export type User = {
  name: string;
  email: string;
  role: string;
  business: string;
};

type SessionState = {
  user: User | null;
  location: Location;
  range: DateRange;
  ready: boolean;
  signIn: (email: string) => void;
  signOut: () => void;
  setLocation: (l: Location) => void;
  setRange: (r: DateRange) => void;
};

const Ctx = React.createContext<SessionState | null>(null);

const KEY = "spoton.session.v1";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [location, setLocationState] = React.useState<Location>(locations[0]);
  const [range, setRangeState] = React.useState<DateRange>("Last 7 days");
  const [ready, setReady] = React.useState(false);

  // Restore after mount so server and client render the same first pass.
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.user) setUser(saved.user);
        if (saved.locationId) {
          const loc = locations.find((l) => l.id === saved.locationId);
          if (loc) setLocationState(loc);
        }
        if (saved.range) setRangeState(saved.range);
      }
    } catch {
      /* private mode / blocked storage — fall back to defaults */
    }
    setReady(true);
  }, []);

  const persist = React.useCallback(
    (next: { user?: User | null; locationId?: string; range?: DateRange }) => {
      try {
        const raw = window.localStorage.getItem(KEY);
        const prev = raw ? JSON.parse(raw) : {};
        window.localStorage.setItem(KEY, JSON.stringify({ ...prev, ...next }));
      } catch {
        /* ignore */
      }
    },
    []
  );

  const signIn = React.useCallback(
    (email: string) => {
      const name = email
        .split("@")[0]
        .split(/[._-]/)
        .filter(Boolean)
        .map((p) => p[0].toUpperCase() + p.slice(1))
        .join(" ") || "Owner";
      const u: User = { name, email, role: "Owner / Admin", business: "Harborview Kitchen" };
      setUser(u);
      persist({ user: u });
    },
    [persist]
  );

  const signOut = React.useCallback(() => {
    setUser(null);
    persist({ user: null });
  }, [persist]);

  const setLocation = React.useCallback(
    (l: Location) => {
      setLocationState(l);
      persist({ locationId: l.id });
    },
    [persist]
  );

  const setRange = React.useCallback(
    (r: DateRange) => {
      setRangeState(r);
      persist({ range: r });
    },
    [persist]
  );

  const value = React.useMemo(
    () => ({ user, location, range, ready, signIn, signOut, setLocation, setRange }),
    [user, location, range, ready, signIn, signOut, setLocation, setRange]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}

/** How many days each range covers. */
export const RANGE_DAYS: Record<DateRange, number> = {
  "Today": 1,
  "Yesterday": 1,
  "Last 7 days": 7,
  "Last 30 days": 30,
  "Last 90 days": 90,
};

/**
 * Rows for the active date range, plus the immediately preceding window of the
 * same length. Every page scopes off this one selector, so the whole dashboard
 * re-renders against a single slice (no per-card filters).
 */
export function useRangeDays(): { rows: DayPoint[]; prev: DayPoint[]; delta: (key: keyof DayPoint) => number } {
  const { range } = useSession();
  return React.useMemo(() => {
    const n = RANGE_DAYS[range];
    const end = range === "Yesterday" ? days90.length - 1 : days90.length;
    const rows = days90.slice(Math.max(0, end - n), end);
    const prev = days90.slice(Math.max(0, end - n * 2), Math.max(0, end - n));

    const sum = (list: DayPoint[], key: keyof DayPoint) =>
      list.reduce((a, r) => a + (r[key] as number), 0);

    const delta = (key: keyof DayPoint) => {
      const p = sum(prev, key);
      if (!p) return 0;
      return ((sum(rows, key) - p) / p) * 100;
    };

    return { rows, prev, delta };
  }, [range]);
}
