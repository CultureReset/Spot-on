# SpotOn Dashboard — interface recreation

A working recreation of the **SpotOn merchant dashboard** for restaurant point-of-sale:
the login flow, the responsive shell, and all seventeen sections an operator uses to run
a restaurant — sales, reporting, orders, menus, labor, guests, marketing, channels,
payouts and setup.

Everything runs against a deterministic mock data layer, so the whole product is
clickable end to end with no backend.

> This is an independent interface recreation built for demonstration and design
> reference. It is not affiliated with, endorsed by, or connected to SpotOn Transact, LLC.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

You land on `/login`. Use **"Use the demo account"** → any password (6+ chars) →
**"Fill demo code"** → pick a location. The session persists in `localStorage`.

```bash
npm run build && npm start   # production build
```

---

## The stack

| | |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4, design tokens in `app/globals.css` |
| Charts | Hand-built SVG — no charting dependency |
| Data | `lib/data.ts` — seeded PRNG, fixed reference date |
| Runtime deps | `next`, `react`, `react-dom`. That's it. |

---

## Design language

Tokens were taken from the live spoton.com stylesheet rather than guessed:

| Role | Value |
|---|---|
| Brand blue | `#0759ef` (hover `#1540d6`, tint `#1e68ef`) |
| Ink | `#090d12` → `#242d38` → `#445469` |
| Hairlines | `#d6dadf`, `#e7ebed` |
| Canvas | `#f4f6f8` on white cards |
| Typeface | Poppins (the site's `--font-poppins`) |

The dashboard is a **committed light-mode design**, matching the production product.

### Chart palette

Categorical series are brand-anchored and validated — not eyeballed:

```
#0759ef  #eb6834  #1baf7a  #eda100  #e87ba4  #4a3aa7
```

Passes the lightness band, chroma floor, colour-vision-deficiency separation
(worst adjacent ΔE 9.1), and normal-vision floor (worst adjacent ΔE 19.6). Three
slots sit under 3:1 contrast on white, so every chart ships **direct labels, a
legend, and a data-table twin** — no value is reachable through colour or hover alone.

Chart rules held throughout: one y-axis ever (labor cost and sales share a dollar
axis; the labor *rate* gets its own chart rather than a second scale), solid
hairline gridlines, 2px lines, 4px rounded bar ends, a 2px surface gap between
fills, a legend whenever there are ≥2 series, and one filter row scoping every
chart on the page.

---

## Information architecture

The left nav mirrors the merchant dashboard's grouping.

| Group | Section | Route | What it does |
|---|---|---|---|
| **Overview** | Dashboard | `/` | Today at a glance: KPIs, insights, trend, channels, top items, recent orders, guest/campaign/review snapshots |
| | Sales | `/sales` | Trend by metric, sales by hour, day-part × weekday heat grid, channel/category/payment splits, gross→net reconciliation |
| | Reporting | `/reporting` | 39-report catalogue in 6 groups, pinned reports, preview pane with detail table |
| **Operations** | Orders | `/orders` | Ticket list with status tabs, channel filter, search; ticket drawer with line items and payment |
| | Menus | `/menus` | Items with inline 86'ing, categories, menu-engineering quadrants, modifier groups, item editor |
| | Team & labor | `/employees` | Labor vs. sales, labor %, roster, server performance, labor by role, tip pooling, employee drawer |
| | Reservations | `/reservations` | Bookings, waitlist with over-quote alerts, live 32-table floor plan |
| **Guests** | Customers | `/customers` | Guest profiles, tier mix, spend by tier, profile drawer with visit history |
| | Loyalty | `/loyalty` | Membership growth, points liability, rewards, tiers, member list |
| | Campaigns | `/campaigns` | Revenue by campaign, templates, performance table, funnel detail, composer |
| | Reviews | `/reviews` | Rating breakdown and trend, cross-platform feed, reply drawer with suggestions |
| **Channels** | Online ordering | `/online-ordering` | Live accepting/paused control, revenue and order trend, fulfilment settings, per-item online availability |
| | Gift cards | `/gift-cards` | Outstanding liability trend, card lookup, transactions, issue flow |
| **Money** | Statements | `/statements` | Payout trend, volume by card brand, deposits, fee breakdown, batches, deposit drawer |
| **Setup** | Devices | `/devices` | Terminals/handhelds/KDS/printers, attention banner, printer routing, network |
| | Dashboard users | `/users` | Users, role × permission matrix, per-user location access, invite flow |
| | Settings | `/settings` | Business profile, locations, hours, taxes, receipts (with live preview), payouts, notifications, security |

---

## The UX, in detail

### Login (`/login`)

A four-step flow with a persistent progress bar, because each step has a different
failure mode and lumping them together hides which one failed.

1. **Email** — validated before advancing, so a typo fails here rather than after a password attempt.
2. **Password** — show/hide, "keep me signed in", forgot-password. The email is echoed with a **Change** link so you can correct it without going back.
3. **Verification** — six auto-advancing digit inputs with backspace-to-previous and full-code paste (`one-time-code` autocomplete for OS autofill).
4. **Location** — multi-location operators pick their site up front; open/closed status is shown so you don't land on a closed store by accident.

The brand panel is desktop-only; mobile gets the form full-bleed with the logo in
the header. Signing in while already authenticated redirects straight through.

### The shell

**Desktop (≥1024px)**
- Collapsible sidebar (248px ↔ 68px), grouped with section labels, active item marked by both a tint and a left rail (never colour alone). The width preference persists.
- Top bar: page title, ⌘K search, date-range selector, location switcher, notifications with unread count, profile menu.
- The user card and sign-out sit at the foot of the sidebar.

**Mobile (<1024px)**
- Hamburger opens a **full-IA drawer**; a bottom **tab bar** keeps Dashboard / Sales / Orders / Menus one thumb-tap away, and **More** opens a bottom sheet with every remaining section as a labelled, described card.
- The date range moves to a horizontally scrolling chip row under the top bar, so the one global filter never gets buried.
- Tab bar respects `env(safe-area-inset-bottom)`; hit targets are ≥56px.

### Cross-cutting patterns

- **One filter row per page.** The date range lives in the top bar and scopes every card on every page — never a per-card filter.
- **Comparison built in.** Every range carries its immediately preceding window, so deltas are real rather than decorative. `Labor %` and similar "lower is better" metrics invert the good/bad colouring.
- **Table-view twin.** Every chart has a *Show data table* toggle.
- **Drawers, not page jumps.** Detail (a ticket, an employee, a guest, a deposit, a review reply) opens in a right-hand drawer that closes on Escape or scrim click, so you keep your place in the list.
- **Empty and filtered states** are written for every list, with a clear-filters action.
- **Accessibility**: skip link, one focus-ring definition used everywhere, `aria-current` on nav, `role="switch"` toggles, labelled icon-only buttons, `aria-pressed` on segmented controls, keyboard-reachable heat-grid cells, `sr-only` direction text on delta chips.
- **Print**: navigation is `no-print`; Daily recap and Sales print cleanly.

---

## Project layout

```
app/
  layout.tsx            Poppins, session provider, skip link
  globals.css           design tokens
  icon.svg              favicon
  login/page.tsx        four-step sign-in
  (dash)/
    layout.tsx          auth guard + responsive shell
    page.tsx            Dashboard home
    <section>/page.tsx  the sixteen other sections
components/
  ui/index.tsx          Card, Stat, Button, Badge, Table, Tabs, Drawer, Toggle, …
  charts/index.tsx      LineChart, BarChart, HBarChart, Donut, Sparkline, HeatGrid, ChartFrame
  shell/                Logo, Sidebar, TopBar, MobileNav, icons
lib/
  data.ts               seeded mock data for every section
  session.tsx           auth, location, date range (localStorage-backed)
  nav.ts                the information architecture
  format.ts             currency, number, duration, initials
```

### Why the data is seeded

`lib/data.ts` derives everything from a fixed seed and a fixed reference date. That
buys three things: server and client render identical markup (no hydration
mismatch), the demo tells the same story on every reload, and screenshots stay
comparable across builds.

---

## Verification

- `npx tsc --noEmit` — clean, strict mode
- `npm run build` — all 19 routes build and prerender
- All 17 dashboard pages plus the login flow were rendered in Chromium at **390px,
  768px and 1440px** and checked for console errors and horizontal overflow: none at
  any width.
