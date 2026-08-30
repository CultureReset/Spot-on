"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shell/Logo";
import { Button, Field, inputClass, cx } from "@/components/ui";
import { useSession } from "@/lib/session";
import { locations } from "@/lib/data";

type Step = "email" | "password" | "code" | "location";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, setLocation, user, ready } = useSession();

  const [step, setStep] = React.useState<Step>("email");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [code, setCode] = React.useState(["", "", "", "", "", ""]);
  const [remember, setRemember] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  // Already signed in? Go straight through.
  React.useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, user, router]);

  const codeRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    await wait(420);
    setBusy(false);
    setStep("password");
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    await wait(520);
    setBusy(false);
    setStep("code");
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (code.some((c) => !c)) {
      setError("Enter all six digits.");
      return;
    }
    setBusy(true);
    await wait(520);
    setBusy(false);
    setStep("location");
  }

  function chooseLocation(id: string) {
    const loc = locations.find((l) => l.id === id)!;
    setLocation(loc);
    signIn(email);
    router.push("/");
  }

  function onCodeChange(i: number, v: string) {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = digit;
    setCode(next);
    if (digit && i < 5) codeRefs.current[i + 1]?.focus();
  }

  function onCodeKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[i] && i > 0) codeRefs.current[i - 1]?.focus();
  }

  function onCodePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = [...code];
    for (let i = 0; i < 6; i++) next[i] = text[i] ?? "";
    setCode(next);
    codeRefs.current[Math.min(text.length, 5)]?.focus();
  }

  const stepIndex = { email: 0, password: 1, code: 2, location: 3 }[step];

  return (
    <main className="flex min-h-dvh flex-col lg:flex-row">
      {/* ------------------------------------------------ brand panel (desktop) */}
      <aside className="relative hidden overflow-hidden bg-ink-900 lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 h-[560px] w-[560px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(7,89,239,.45), transparent 62%)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-24 h-[460px] w-[460px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(30,104,239,.28), transparent 66%)" }}
        />
        <Logo className="relative text-white" size={30} />

        <div className="relative max-w-md">
          <h2 className="text-[34px] font-semibold leading-[1.15] tracking-[-.02em] text-white xl:text-[40px]">
            Every number that runs your restaurant, in one place.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-200">
            Sales, labor, menu performance, guests and payouts — live from your point of sale,
            on any device.
          </p>
          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-white/15 pt-8">
            {[
              ["90+", "Built-in reports"],
              ["Real time", "POS sync"],
              ["0%", "Online order commission"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="text-[22px] font-semibold text-white">{v}</dt>
                <dd className="mt-1 text-[12.5px] leading-snug text-ink-300">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="relative text-[12.5px] text-ink-400">
          © 2026 SpotOn Transact, LLC. This is an interface recreation for demonstration.
        </p>
      </aside>

      {/* -------------------------------------------------------- form column */}
      <div className="flex flex-1 flex-col bg-white">
        <header className="flex items-center justify-between px-5 py-5 lg:px-12">
          <Logo className="text-ink-900 lg:hidden" size={26} />
          <span className="hidden lg:block" />
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="ring-focus rounded text-[13px] font-medium text-brand-600 hover:underline"
          >
            Need help signing in?
          </a>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 pb-16 lg:px-12">
          <div className="w-full max-w-[400px]">
            {/* progress */}
            <ol className="mb-8 flex items-center gap-2" aria-label="Sign-in progress">
              {["Email", "Password", "Verify", "Location"].map((s, i) => (
                <li key={s} className="flex flex-1 flex-col gap-1.5">
                  <span
                    className={cx(
                      "h-1 rounded-full transition-colors",
                      i <= stepIndex ? "bg-brand-500" : "bg-ink-100"
                    )}
                  />
                  <span
                    className={cx(
                      "text-[11px] font-medium",
                      i <= stepIndex ? "text-ink-700" : "text-ink-300"
                    )}
                  >
                    {s}
                  </span>
                </li>
              ))}
            </ol>

            {/* ------------------------------------------------------ step: email */}
            {step === "email" && (
              <form onSubmit={submitEmail} className="animate-fade-up">
                <h1 className="text-[26px] font-semibold tracking-[-.02em] text-ink-900">Sign in</h1>
                <p className="mt-1.5 text-sm text-ink-500">
                  Use the email tied to your SpotOn merchant account.
                </p>

                <div className="mt-7 space-y-4">
                  <Field label="Email address">
                    <input
                      type="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@yourrestaurant.com"
                      className={inputClass}
                      aria-invalid={!!error}
                    />
                  </Field>

                  {error && <ErrorNote>{error}</ErrorNote>}

                  <Button type="submit" variant="primary" className="w-full" disabled={busy}>
                    {busy ? "Checking…" : "Continue"}
                  </Button>
                </div>

                <Divider />

                <Button type="button" className="w-full" onClick={() => setEmail("owner@harborview.co")}>
                  Use the demo account
                </Button>

                <p className="mt-6 text-center text-[13px] text-ink-500">
                  New to SpotOn?{" "}
                  <a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-brand-600 hover:underline">
                    Talk to sales
                  </a>
                </p>
              </form>
            )}

            {/* --------------------------------------------------- step: password */}
            {step === "password" && (
              <form onSubmit={submitPassword} className="animate-fade-up">
                <h1 className="text-[26px] font-semibold tracking-[-.02em] text-ink-900">
                  Enter your password
                </h1>
                <p className="mt-1.5 truncate text-sm text-ink-500">
                  Signing in as <span className="font-medium text-ink-800">{email}</span>{" "}
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="ring-focus rounded font-medium text-brand-600 hover:underline"
                  >
                    Change
                  </button>
                </p>

                <div className="mt-7 space-y-4">
                  <Field label="Password">
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        autoComplete="current-password"
                        autoFocus
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={cx(inputClass, "pr-16")}
                        aria-invalid={!!error}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="ring-focus absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-[12.5px] font-medium text-ink-500 hover:text-ink-900"
                      >
                        {showPw ? "Hide" : "Show"}
                      </button>
                    </div>
                  </Field>

                  {error && <ErrorNote>{error}</ErrorNote>}

                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-700">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="ring-focus h-4 w-4 rounded border-ink-200 accent-[color:var(--color-brand-500)]"
                      />
                      Keep me signed in
                    </label>
                    <a href="#" onClick={(e) => e.preventDefault()} className="text-[13px] font-medium text-brand-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>

                  <Button type="submit" variant="primary" className="w-full" disabled={busy}>
                    {busy ? "Signing in…" : "Sign in"}
                  </Button>
                </div>
              </form>
            )}

            {/* ------------------------------------------------------- step: 2FA */}
            {step === "code" && (
              <form onSubmit={submitCode} className="animate-fade-up">
                <h1 className="text-[26px] font-semibold tracking-[-.02em] text-ink-900">
                  Verify it&rsquo;s you
                </h1>
                <p className="mt-1.5 text-sm text-ink-500">
                  We texted a 6-digit code to the phone ending in <span className="tnum font-medium text-ink-800">••4417</span>.
                </p>

                <div className="mt-7">
                  <fieldset>
                    <legend className="mb-1.5 text-[13px] font-medium text-ink-700">Verification code</legend>
                    <div className="flex gap-2" onPaste={onCodePaste}>
                      {code.map((c, i) => (
                        <input
                          key={i}
                          ref={(el) => { codeRefs.current[i] = el; }}
                          value={c}
                          onChange={(e) => onCodeChange(i, e.target.value)}
                          onKeyDown={(e) => onCodeKey(i, e)}
                          inputMode="numeric"
                          autoComplete={i === 0 ? "one-time-code" : "off"}
                          autoFocus={i === 0}
                          maxLength={1}
                          aria-label={`Digit ${i + 1}`}
                          className="ring-focus tnum h-12 w-full rounded-lg border border-ink-200 text-center text-lg font-semibold text-ink-900"
                        />
                      ))}
                    </div>
                  </fieldset>

                  {error && <div className="mt-4"><ErrorNote>{error}</ErrorNote></div>}

                  <Button type="submit" variant="primary" className="mt-4 w-full" disabled={busy}>
                    {busy ? "Verifying…" : "Verify"}
                  </Button>

                  <div className="mt-4 flex items-center justify-between text-[13px]">
                    <button
                      type="button"
                      onClick={() => setCode(["1", "2", "3", "4", "5", "6"])}
                      className="ring-focus rounded font-medium text-brand-600 hover:underline"
                    >
                      Fill demo code
                    </button>
                    <button type="button" className="ring-focus rounded text-ink-500 hover:text-ink-900">
                      Resend code
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* -------------------------------------------------- step: location */}
            {step === "location" && (
              <div className="animate-fade-up">
                <h1 className="text-[26px] font-semibold tracking-[-.02em] text-ink-900">
                  Choose a location
                </h1>
                <p className="mt-1.5 text-sm text-ink-500">
                  You have access to {locations.length} locations. You can switch at any time from the top bar.
                </p>

                <ul className="mt-7 space-y-2">
                  {locations.map((l) => (
                    <li key={l.id}>
                      <button
                        onClick={() => chooseLocation(l.id)}
                        className="ring-focus group flex w-full items-center gap-3 rounded-xl border border-ink-200 p-3.5 text-left transition-colors hover:border-brand-500 hover:bg-brand-50"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-[13px] font-semibold text-white">
                          {l.name.split("—")[1]?.trim()[0] ?? l.name[0]}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink-900">{l.name}</span>
                          <span className="block truncate text-[12.5px] text-ink-500">
                            {l.address}, {l.city}
                          </span>
                        </span>
                        <span
                          className={cx(
                            "shrink-0 rounded-full px-2 py-0.5 text-[11.5px] font-medium",
                            l.status === "open"
                              ? "bg-[color:var(--color-good-bg)] text-[color:var(--color-good)]"
                              : "bg-ink-50 text-ink-400"
                          )}
                        >
                          {l.status === "open" ? "Open" : "Closed"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                <Button
                  variant="ghost"
                  className="mt-4 w-full"
                  onClick={() => chooseLocation(locations[0].id)}
                >
                  View all locations combined
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-lg bg-[color:var(--color-critical-bg)] px-3 py-2 text-[13px] text-[color:var(--color-critical)]"
    >
      <svg width="15" height="15" viewBox="0 0 16 16" className="mt-0.5 shrink-0" aria-hidden="true">
        <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.5v4M8 11.2v.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {children}
    </p>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-ink-100" />
      <span className="text-[12px] font-medium uppercase tracking-wide text-ink-300">or</span>
      <span className="h-px flex-1 bg-ink-100" />
    </div>
  );
}
