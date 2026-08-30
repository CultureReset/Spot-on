# SpotOn Merchant — Android app

A native Android recreation of the **SpotOn merchant app**: the sign-in flow, the
bottom-navigation shell, and every section an operator uses to run a restaurant
from their phone.

Kotlin + Jetpack Compose + Material 3, built against the same brand tokens and the
same seeded data as the web dashboard in this repository, so the two tell an
identical story.

> Independent interface recreation, built for demonstration and design reference.
> Not affiliated with, endorsed by, or connected to SpotOn Transact, LLC.

---

## Building it

```bash
cd android
echo "sdk.dir=/path/to/android-sdk" > local.properties

./gradlew assembleDebug          # APK at app/build/outputs/apk/debug/
./gradlew installDebug           # to a connected device or emulator
./gradlew testDebugUnitTest      # 38 tests, incl. every screen rendered to PNG
```

| | |
|---|---|
| Language | Kotlin 2.0.21 |
| UI | Jetpack Compose, Material 3, Navigation Compose |
| min / target SDK | 26 (Android 8.0) / 35 (Android 15) |
| Charts | Compose `Canvas` — no charting dependency |
| Screenshot tests | Robolectric + Roborazzi, rendered on the JVM |

---

## Screen inventory

**33 screens**, reachable start to finish. Each is rendered to
`app/build/screens/` by the screenshot suite.

### Sign-in (4 steps)

| Screen | What it does |
|---|---|
| Email | Validated before advancing, so a typo fails here rather than after a password attempt |
| Password | Show/hide, "keep me signed in", forgot link; the email is echoed with a **Change** action |
| Verify | Six boxes that auto-advance on entry and step back on backspace, `NumberPassword` keyboard |
| Location | Multi-site operators pick their site up front; open/closed state is shown |

A four-segment progress bar runs across all of them.

### Bottom navigation (4 tabs + More)

`Dashboard · Sales · Orders · Menus · More`

**More** opens a bottom sheet listing every remaining section, grouped and
described, plus the account screen.

### Sections

| Group | Screen | Contents |
|---|---|---|
| Overview | **Dashboard** | Greeting, 5 KPI tiles, Profit Assist insights, net-sales trend vs. prior period, sales by hour, channel donut, top items, recent orders, guest and review snapshots |
| | **Sales** | Metric switcher (net sales / orders / guests / avg. ticket), trend with comparison, sales by hour, weekday × day-part heat grid, channel / category / payment splits, gross→net reconciliation |
| | **Reporting** | Pinned reports, searchable catalogue of 39 reports in 6 groups, report detail with chart and per-day rows |
| Operations | **Orders** | Status tabs, channel search, live ticket list |
| | **Order detail** | Line items with modifiers, subtotal / tax / tip, reprint and refund |
| | **Menus** | Items with inline 86'ing, categories, menu-engineering quadrants, modifier groups |
| | **Menu item** | Availability, pricing, margin, station routing, performance |
| | **Team & labor** | Labor vs. sales, labor rate against target, roster, server performance, tip pooling |
| | **Employee** | Contact, rate, PIN, job codes, weekly hours and sales |
| | **Reservations** | Tonight's bookings, waitlist with over-quote alerts, 32-table floor plan |
| | **Add reservation** | Guest, party, section, notes |
| Guests | **Customers** | Tier filters, spend-by-tier, guest list |
| | **Guest profile** | Visits, lifetime spend, points, send-a-reward |
| | **Loyalty** | Points liability, rewards, tiers, member list |
| | **Campaigns** | Revenue by campaign, campaign list |
| | **Campaign detail** | Send → open → click → redeem funnel |
| | **New campaign** | Channel, audience, message with SMS segment counter, offer |
| | **Reviews** | Rating breakdown, cross-platform feed, source filters |
| | **Reply to review** | Composer with rating-aware suggested replies |
| Channels | **Online ordering** | Live accepting/paused switch, revenue trend, fulfilment settings |
| | **Gift cards** | Outstanding liability, issued vs. redeemed, card list |
| Money | **Statements** | Payout trend, volume by card brand, deposit list |
| | **Deposit detail** | Gross → fees → refunds → net |
| Setup | **Devices** | Attention banner, terminals / KDS / printers, printer routing |
| | **Dashboard users** | Users and an expandable role × permission matrix |
| | **Settings** | 8 sections: profile, locations, hours, taxes, receipts (with a live receipt preview), payouts, notifications, security |
| Utility | **Search** | Across every section and report |
| | **Notifications** | Unread markers, deposit / device / labor / review alerts |
| | **Account** | Profile, current scope, sign out |

---

## The UX decisions

**One filter, one scope.** The date range lives in a chip under the top bar and
scopes every figure in the app. There are no per-card filters. Every range also
carries the equivalent window immediately before it, so deltas are real
comparisons rather than decoration; metrics where lower is better (labor %) invert
the good/bad colouring.

**Touch replaces hover, explicitly.** A phone has no hover, so charts gain a tap
layer instead: tapping a line chart selects the nearest day and a readout above
the plot names every series' value there; tapping a bar or a heat-grid cell does
the same. When nothing is selected the readout says so rather than sitting blank.

**Bottom-sheet controls.** Location switching, date range and the More menu are
all `ModalBottomSheet`s — reachable with one thumb, dismissible by swipe, unlike a
top-anchored dropdown.

**Detail is a destination, not a dialog.** Tickets, employees, guests, deposits
and campaigns push a screen with a back arrow, so the system back gesture works
and deep state is shareable.

**Material 3, not a web port.** `NavigationBar`, `TopAppBar`, `FilterChip`,
`Switch`, `OutlinedTextField` and `ModalBottomSheet` are the real components, with
the SpotOn palette mapped onto the M3 `ColorScheme` — and an extra token set
(`SpotOnTokens`) for the neutral ink ramp, status pairs and chart series that M3
has no slot for.

**Edge to edge.** `enableEdgeToEdge()`, with the scaffold's top inset given to the
`NavHost` and the bottom inset handed to each list's `contentPadding`, so content
scrolls under the navigation bar instead of being clipped by it.

---

## Charts

Hand-drawn on Compose `Canvas`. The rules match the web dashboard exactly:

- **One axis, always.** Labor cost and sales are both dollars, so they share a
  scale honestly; the labor *rate* gets its own chart rather than a second y-axis.
- Solid hairline gridlines one shade off the surface, never dashed.
- 2dp lines, 4dp rounded bar ends anchored to the baseline, a 2dp gap between
  adjacent bars and between donut segments — a gap, never a border.
- A legend whenever there are two or more series; the value is always printed
  beside a meter bar, never conveyed by length alone.
- Sequential magnitude (the heat grid) is one hue light→dark. Never a rainbow.
- The top axis tick always sits at or above the data max, so the tallest mark
  cannot overflow the plot.

**Palette** — brand-anchored and validated for colour-vision deficiency:

```
#0759ef  #eb6834  #1baf7a  #eda100  #e87ba4  #4a3aa7
```

Worst adjacent CVD ΔE 9.1, worst adjacent normal-vision ΔE 19.6.

---

## Data

`data/MockData.kt` is a Kotlin port of the web app's `lib/data.ts`, down to the
`mulberry32` seed (`20260830`) and the fixed reference date. Same PRNG, same
sequence, same numbers — the Android app and the web dashboard show the same
restaurant on the same day.

---

## Verification

- `gradle assembleDebug` / `assembleRelease` — both APKs build
- `gradle testDebugUnitTest` — **38 tests pass**
  - **35 screenshot tests** render every screen at 411×891dp xhdpi to
    `app/build/screens/*.png`, so the UI is reviewed by looking at it
  - **3 navigation tests** compose the real `NavHost`, walk sign-in through all
    four steps to the dashboard, and visit every bottom-nav tab

Two bugs were caught by rendering rather than by compiling, and are fixed here:
the axis tick generator could produce a top tick below the data max (clipping the
tallest mark — the same bug existed in the web charts and was fixed there too),
and the logo mark drew its ring gap in hardcoded white, so it collapsed into a
solid blob on the dark sign-in panel.
