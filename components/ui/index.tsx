"use client";

import React from "react";

// ---------------------------------------------------------------- utilities
export const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

// -------------------------------------------------------------------- Card
export function Card({
  children,
  className,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cx(
        "min-w-0 rounded-xl border border-ink-100 bg-white shadow-[0_1px_2px_rgba(9,13,18,.04)]",
        padded && "p-4 sm:p-5",
        className
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold leading-tight text-ink-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[13px] leading-snug text-ink-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 empty:hidden">{action}</div>}
    </header>
  );
}

// ------------------------------------------------------------------ Button
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({ variant = "secondary", size = "md", className, ...rest }: BtnProps) {
  const base =
    "ring-focus inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap";
  const sizes = { sm: "h-8 px-3 text-[13px]", md: "h-10 px-4 text-sm" };
  const variants = {
    primary: "bg-brand-500 text-white hover:bg-brand-600",
    secondary: "border border-ink-200 bg-white text-ink-800 hover:bg-ink-50",
    ghost: "text-ink-500 hover:bg-ink-50 hover:text-ink-900",
    danger: "border border-[color:var(--color-critical)]/30 bg-[color:var(--color-critical-bg)] text-[color:var(--color-critical)] hover:brightness-97",
  };
  return <button className={cx(base, sizes[size], variants[variant], className)} {...rest} />;
}

// ------------------------------------------------------------------- Badge
export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warning" | "critical" | "info" | "brand";
}) {
  const tones = {
    neutral: "bg-ink-50 text-ink-500 border-ink-200",
    good: "bg-[color:var(--color-good-bg)] text-[color:var(--color-good)] border-transparent",
    warning: "bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] border-transparent",
    critical: "bg-[color:var(--color-critical-bg)] text-[color:var(--color-critical)] border-transparent",
    info: "bg-[color:var(--color-info-bg)] text-brand-700 border-transparent",
    brand: "bg-brand-500 text-white border-transparent",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11.5px] font-medium leading-5",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

// -------------------------------------------------------------- Delta chip
export function Delta({ value, invert = false }: { value: number; invert?: boolean }) {
  const up = value >= 0;
  const good = invert ? !up : up;
  return (
    <span
      className={cx(
        "tnum inline-flex items-center gap-0.5 text-[12.5px] font-medium",
        good ? "text-[color:var(--color-good)]" : "text-[color:var(--color-critical)]"
      )}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <path
          d={up ? "M5 1.5 L9 8 L1 8 Z" : "M5 8.5 L1 2 L9 2 Z"}
          fill="currentColor"
        />
      </svg>
      {Math.abs(value).toFixed(1)}%
      <span className="sr-only">{up ? "increase" : "decrease"}</span>
    </span>
  );
}

// --------------------------------------------------------------- Stat tile
export function Stat({
  label,
  value,
  delta,
  hint,
  invertDelta,
  children,
}: {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  invertDelta?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-[0_1px_2px_rgba(9,13,18,.04)]">
      <p className="text-[12.5px] font-medium uppercase tracking-wide text-ink-400">{label}</p>
      {/* proportional figures on display-size numbers, not tabular */}
      <p className="mt-1.5 text-[26px] font-semibold leading-none tracking-[-.02em] text-ink-900">
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {delta !== undefined && <Delta value={delta} invert={invertDelta} />}
        {hint && <span className="text-[12.5px] text-ink-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// -------------------------------------------------------------------- Tabs
export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <div role="tablist" className="scroll-thin -mx-1 flex gap-1 overflow-x-auto border-b border-ink-100 px-1">
      {tabs.map((t) => (
        <button
          key={t}
          role="tab"
          aria-selected={active === t}
          onClick={() => onChange(t)}
          className={cx(
            "ring-focus -mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-[13.5px] font-medium transition-colors",
            active === t
              ? "border-brand-500 text-brand-600"
              : "border-transparent text-ink-500 hover:text-ink-900"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------- Table
export function Table({
  columns,
  children,
  className,
}: {
  columns: Array<{ key: string; label: string; align?: "left" | "right"; hideOn?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("scroll-thin -mx-4 overflow-x-auto sm:mx-0", className)}>
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink-100">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cx(
                  "whitespace-nowrap px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wide text-ink-400",
                  c.align === "right" ? "text-right" : "text-left",
                  c.hideOn
                )}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  align = "left",
  className,
  strong,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
  strong?: boolean;
}) {
  return (
    <td
      className={cx(
        "px-4 py-3 align-middle",
        align === "right" ? "tnum text-right" : "text-left",
        strong ? "font-medium text-ink-900" : "text-ink-700",
        className
      )}
    >
      {children}
    </td>
  );
}

export function Tr({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cx("border-b border-ink-50 last:border-0 hover:bg-ink-50/60", className)}>{children}</tr>;
}

// ------------------------------------------------------------------ Toggle
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        "ring-focus relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-brand-500" : "bg-ink-200"
      )}
    >
      <span
        className={cx(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

// ------------------------------------------------------------- Segmented
export function Segmented({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className={cx("inline-flex rounded-lg border border-ink-200 bg-white p-0.5", size === "sm" && "text-[13px]")}>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={cx(
            "ring-focus rounded-[6px] font-medium transition-colors",
            size === "sm" ? "px-2.5 py-1 text-[12.5px]" : "px-3 py-1.5 text-[13px]",
            value === o ? "bg-ink-900 text-white" : "text-ink-500 hover:text-ink-900"
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Progress
export function Bar({ value, max, color = "var(--color-s1)" }: { value: number; max: number; color?: string }) {
  const w = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100" aria-hidden="true">
      <div className="h-full rounded-full" style={{ width: `${w}%`, background: color }} />
    </div>
  );
}

// ------------------------------------------------------------------- Empty
export function Empty({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50/40 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      <p className="mt-1 max-w-sm text-[13px] text-ink-500">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ------------------------------------------------------------------- Drawer
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink-900/25" onClick={onClose} />
      <div className="animate-fade-up relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Button>
        </header>
        <div className="scroll-thin flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="border-t border-ink-100 px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
}

// -------------------------------------------------------------- Page header
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-.01em] text-ink-900 sm:text-[26px]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-[13.5px] text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

// ------------------------------------------------------------- Search input
export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cx("relative", className)}>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
        width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
      >
        <circle cx="7" cy="7" r="4.6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="ring-focus h-10 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-300"
      />
    </div>
  );
}

// -------------------------------------------------------------------- Field
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-ink-400">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "ring-focus h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 placeholder:text-ink-300";
