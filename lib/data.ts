/**
 * Deterministic mock data for the SpotOn dashboard recreation.
 *
 * Everything is generated from a seeded PRNG and a fixed "today" so the server
 * and client render byte-identical markup (no hydration mismatch) and so the
 * demo tells the same story on every reload.
 */

// ---------------------------------------------------------------- seeded rng
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260830);
const rand = (min: number, max: number) => min + rng() * (max - min);
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));
const pick = <T,>(arr: readonly T[]): T => arr[randInt(0, arr.length - 1)];

/** Fixed reference date so the whole app agrees on "today". */
export const TODAY = new Date("2026-08-30T00:00:00");

export const dayOffset = (n: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + n);
  return d;
};

// ---------------------------------------------------------------- locations
export type Location = {
  id: string;
  name: string;
  address: string;
  city: string;
  timezone: string;
  status: "open" | "closed";
};

export const locations: Location[] = [
  { id: "loc-1", name: "Harborview Kitchen — Downtown", address: "418 Market St", city: "San Francisco, CA", timezone: "PT", status: "open" },
  { id: "loc-2", name: "Harborview Kitchen — Marina", address: "2201 Chestnut St", city: "San Francisco, CA", timezone: "PT", status: "open" },
  { id: "loc-3", name: "Harborview Taproom", address: "1140 Folsom St", city: "San Francisco, CA", timezone: "PT", status: "closed" },
];

// ---------------------------------------------------------------- sales core
export type DayPoint = {
  date: Date;
  label: string;
  net: number;
  gross: number;
  orders: number;
  guests: number;
  labor: number;
  tips: number;
  discounts: number;
  refunds: number;
  comps: number;
};

/** Weekday shape: quiet Mon–Wed, busy Fri/Sat. index 0 = Sunday */
const DOW_WEIGHT = [0.95, 0.62, 0.68, 0.78, 0.94, 1.32, 1.42];

function buildDays(count: number): DayPoint[] {
  const out: DayPoint[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const date = dayOffset(-i);
    const w = DOW_WEIGHT[date.getDay()];
    // gentle upward trend across the window plus noise
    const trend = 1 + (count - i) / (count * 9);
    const net = Math.round(8200 * w * trend * rand(0.93, 1.07));
    const orders = Math.round((net / rand(52, 66)) * rand(0.96, 1.04));
    const guests = Math.round(orders * rand(1.7, 2.4));
    out.push({
      date,
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      net,
      gross: Math.round(net * rand(1.09, 1.13)),
      orders,
      guests,
      labor: Math.round(net * rand(0.26, 0.325)),
      tips: Math.round(net * rand(0.15, 0.21)),
      discounts: Math.round(net * rand(0.01, 0.035)),
      refunds: Math.round(net * rand(0.002, 0.011)),
      comps: Math.round(net * rand(0.004, 0.014)),
    });
  }
  return out;
}

/** 90 days of history; slice from the end for shorter windows. */
export const days90 = buildDays(90);
export const last30 = days90.slice(-30);
export const last7 = days90.slice(-7);
export const today = days90[days90.length - 1];
export const yesterday = days90[days90.length - 2];

export const sumBy = <K extends keyof DayPoint>(rows: DayPoint[], key: K) =>
  rows.reduce((a, r) => a + (r[key] as number), 0);

/** % change between two equal-length windows of the same series. */
export function deltaPct(rows: DayPoint[], key: keyof DayPoint) {
  const half = Math.floor(rows.length / 2);
  if (half === 0) return 0;
  const prev = sumBy(rows.slice(0, half), key as never);
  const curr = sumBy(rows.slice(-half), key as never);
  if (!prev) return 0;
  return ((curr - prev) / prev) * 100;
}

// -------------------------------------------------------------- hourly sales
export type HourPoint = { hour: number; label: string; net: number; orders: number };

export const hourly: HourPoint[] = Array.from({ length: 16 }, (_, i) => {
  const hour = i + 8; // 8am – 11pm
  // two humps: lunch ~12-1, dinner ~18-20
  const lunch = Math.exp(-Math.pow(hour - 12.5, 2) / 3.2);
  const dinner = Math.exp(-Math.pow(hour - 19, 2) / 5.0) * 1.55;
  const net = Math.round((lunch + dinner) * 1180 * rand(0.85, 1.15) + rand(20, 90));
  return {
    hour,
    label: hour === 12 ? "12p" : hour < 12 ? `${hour}a` : `${hour - 12}p`,
    net,
    orders: Math.max(1, Math.round(net / rand(50, 64))),
  };
});

// ------------------------------------------------------------- order channels
export type Channel = { name: string; net: number; orders: number; color: string };

export const channels: Channel[] = [
  { name: "Dine-in", net: 0, orders: 0, color: "var(--color-s1)" },
  { name: "Takeout", net: 0, orders: 0, color: "var(--color-s2)" },
  { name: "Delivery", net: 0, orders: 0, color: "var(--color-s3)" },
  { name: "Online ordering", net: 0, orders: 0, color: "var(--color-s4)" },
];
{
  const share = [0.52, 0.21, 0.14, 0.13];
  const totalNet = sumBy(last30, "net");
  const totalOrders = sumBy(last30, "orders");
  channels.forEach((c, i) => {
    c.net = Math.round(totalNet * share[i]);
    c.orders = Math.round(totalOrders * share[i]);
  });
}

// ------------------------------------------------------------- payment types
export const paymentTypes = [
  { name: "Visa", amount: 0, count: 0 },
  { name: "Mastercard", amount: 0, count: 0 },
  { name: "Amex", amount: 0, count: 0 },
  { name: "Discover", amount: 0, count: 0 },
  { name: "Cash", amount: 0, count: 0 },
  { name: "Gift card", amount: 0, count: 0 },
];
{
  const share = [0.41, 0.24, 0.12, 0.04, 0.13, 0.06];
  const totalNet = sumBy(last30, "net");
  const totalOrders = sumBy(last30, "orders");
  paymentTypes.forEach((p, i) => {
    p.amount = Math.round(totalNet * share[i]);
    p.count = Math.round(totalOrders * share[i]);
  });
}

// ------------------------------------------------------------------ menu data
export type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  sold: number;
  net: number;
  modifiers: string[];
  available: boolean;
  station: string;
  taxRate: number;
  description: string;
};

const MENU_SEED: Array<[string, string, number, number, string]> = [
  ["Harbor Burger", "Entrées", 21, 6.4, "Grill"],
  ["Crispy Brussels", "Starters", 13, 2.9, "Fry"],
  ["Dungeness Crab Roll", "Entrées", 29, 11.2, "Cold"],
  ["Truffle Fries", "Sides", 11, 2.2, "Fry"],
  ["Cast-Iron Cornbread", "Starters", 9, 1.5, "Bake"],
  ["Grilled Branzino", "Entrées", 34, 13.1, "Grill"],
  ["Little Gem Caesar", "Salads", 15, 3.4, "Cold"],
  ["Short Rib Pappardelle", "Entrées", 31, 10.8, "Sauté"],
  ["Fried Chicken Sandwich", "Entrées", 19, 5.2, "Fry"],
  ["Clam Chowder", "Starters", 12, 3.1, "Sauté"],
  ["Ahi Poke Bowl", "Entrées", 24, 8.7, "Cold"],
  ["Margherita Flatbread", "Starters", 16, 3.8, "Bake"],
  ["Seasonal Vegetable Plate", "Entrées", 22, 5.6, "Sauté"],
  ["Buttermilk Biscuits", "Sides", 8, 1.2, "Bake"],
  ["Chocolate Budino", "Desserts", 11, 2.4, "Pastry"],
  ["Meyer Lemon Tart", "Desserts", 12, 2.8, "Pastry"],
  ["Old Fashioned", "Cocktails", 16, 3.2, "Bar"],
  ["Harbor Spritz", "Cocktails", 15, 2.9, "Bar"],
  ["Espresso Martini", "Cocktails", 17, 3.6, "Bar"],
  ["House Red — Glass", "Wine", 14, 3.5, "Bar"],
  ["House White — Glass", "Wine", 14, 3.4, "Bar"],
  ["Local IPA — Draft", "Beer", 9, 1.9, "Bar"],
  ["Pilsner — Draft", "Beer", 8, 1.7, "Bar"],
  ["Cold Brew", "Non-Alcoholic", 6, 0.9, "Bar"],
  ["House Lemonade", "Non-Alcoholic", 5, 0.6, "Bar"],
];

const MOD_POOL = [
  "Temperature", "Add avocado", "Sub side salad", "No onion", "Extra sauce",
  "Gluten-free bun", "Add bacon", "Dressing on side", "Make it a double", "Spice level",
];

export const menuItems: MenuItem[] = MENU_SEED.map(([name, category, price, cost, station], i) => {
  const sold = randInt(48, 610);
  return {
    id: `item-${i + 1}`,
    name,
    category,
    price,
    cost,
    sold,
    net: Math.round(sold * price),
    modifiers: Array.from({ length: randInt(0, 3) }, () => pick(MOD_POOL)).filter(
      (v, idx, a) => a.indexOf(v) === idx
    ),
    available: rng() > 0.08,
    station,
    taxRate: category === "Cocktails" || category === "Wine" || category === "Beer" ? 9.75 : 8.625,
    description: `${name} — house specialty, prepared to order at the ${station.toLowerCase()} station.`,
  };
}).sort((a, b) => b.net - a.net);

export const menuCategories = Array.from(new Set(menuItems.map((m) => m.category)));

/** Menu-engineering quadrant: stars / plowhorses / puzzles / dogs */
export function menuQuadrant(item: MenuItem) {
  const margin = (item.price - item.cost) / item.price;
  const medianSold = 260;
  const medianMargin = 0.72;
  const popular = item.sold >= medianSold;
  const profitable = margin >= medianMargin;
  if (popular && profitable) return "Star";
  if (popular && !profitable) return "Plowhorse";
  if (!popular && profitable) return "Puzzle";
  return "Dog";
}

// ------------------------------------------------------------------ employees
export type Employee = {
  id: string;
  name: string;
  role: string;
  jobCodes: string[];
  email: string;
  phone: string;
  status: "active" | "inactive";
  hourly: number;
  hoursWeek: number;
  overtime: number;
  sales: number;
  tips: number;
  checks: number;
  pin: string;
  hiredOn: string;
};

const NAMES = [
  "Marisol Vega", "Devon Pierce", "Aisha Rahman", "Tomás Ortiz", "Grace Lindqvist",
  "Noah Bellamy", "Priya Nair", "Caleb Fontaine", "Ruth Adeyemi", "Jonah Weiss",
  "Lena Moreau", "Andre Baptiste", "Sofia Duarte", "Kenji Watanabe", "Halima Farah",
  "Owen Brennan", "Mira Castellanos", "Elias Thorne",
];
const ROLES = ["Server", "Bartender", "Line Cook", "Host", "Busser", "Shift Lead", "Manager", "Expo"];

export const employees: Employee[] = NAMES.map((name, i) => {
  const role = i === 0 ? "General Manager" : pick(ROLES);
  const hourly = role === "General Manager" ? 38 : role === "Manager" ? 31 : rand(17.5, 26.5);
  const hoursWeek = rand(12, 41);
  const sales = ["Server", "Bartender", "Shift Lead"].includes(role) ? Math.round(rand(3200, 14800)) : 0;
  return {
    id: `emp-${i + 1}`,
    name,
    role,
    jobCodes: [role, ...(rng() > 0.7 ? [pick(ROLES)] : [])].filter((v, idx, a) => a.indexOf(v) === idx),
    email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@harborview.co`,
    phone: `(415) 555-${String(randInt(1000, 9999))}`,
    status: rng() > 0.12 ? "active" : "inactive",
    hourly: Math.round(hourly * 100) / 100,
    hoursWeek: Math.round(hoursWeek * 10) / 10,
    overtime: hoursWeek > 38 ? Math.round((hoursWeek - 38) * 10) / 10 : 0,
    sales,
    tips: sales ? Math.round(sales * rand(0.16, 0.22)) : 0,
    checks: sales ? randInt(48, 210) : 0,
    pin: String(randInt(1000, 9999)),
    hiredOn: dayOffset(-randInt(40, 1100)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };
});

// ------------------------------------------------------------------ customers
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  visits: number;
  spend: number;
  avgCheck: number;
  lastVisit: string;
  loyaltyPoints: number;
  tier: "New" | "Returning" | "Regular" | "VIP";
  optIn: boolean;
};

const CUST_NAMES = [
  "Hannah โ Cole", "Peter Ilyich", "Yuki Tanaka", "Amara Okonkwo", "Ben Sorensen",
  "Clara Jimenez", "Dmitri Volkov", "Esther Whitfield", "Felix Nakamura", "Georgia Bell",
  "Hugo Marchetti", "Imani Clarke", "Jasper Reid", "Kira Lindholm", "Liam O'Donnell",
  "Maya Srinivasan", "Nate Kowalski", "Olive Fairbanks", "Paulo Rocha", "Quinn Alvarez",
  "Rosa Delgado", "Simon Achebe", "Tessa Bright", "Uma Kapoor",
].map((n) => n.replace("โ ", ""));

export const customers: Customer[] = CUST_NAMES.map((name, i) => {
  const visits = randInt(1, 44);
  const avgCheck = Math.round(rand(28, 96));
  const tier: Customer["tier"] = visits > 30 ? "VIP" : visits > 12 ? "Regular" : visits > 3 ? "Returning" : "New";
  return {
    id: `cust-${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
    phone: `(415) 555-${String(randInt(1000, 9999))}`,
    visits,
    spend: visits * avgCheck,
    avgCheck,
    lastVisit: dayOffset(-randInt(0, 120)).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    loyaltyPoints: visits * randInt(8, 30),
    tier,
    optIn: rng() > 0.25,
  };
}).sort((a, b) => b.spend - a.spend);

// ------------------------------------------------------------------- campaigns
export type Campaign = {
  id: string;
  name: string;
  channel: "Email" | "SMS" | "Social";
  status: "Sent" | "Scheduled" | "Draft" | "Running";
  sent: number;
  opened: number;
  clicked: number;
  redeemed: number;
  revenue: number;
  date: string;
  audience: string;
};

const CAMPAIGN_SEED: Array<[string, Campaign["channel"], Campaign["status"], string]> = [
  ["Labor Day Prix Fixe", "Email", "Scheduled", "All opted-in guests"],
  ["We miss you — 20% off", "Email", "Sent", "Lapsed 60+ days"],
  ["Taproom Trivia Tuesdays", "SMS", "Running", "Regulars & VIPs"],
  ["Birthday reward", "Email", "Running", "Birthday this month"],
  ["Brunch launch announcement", "Email", "Sent", "All opted-in guests"],
  ["Happy hour flash — today only", "SMS", "Sent", "Within 3 miles"],
  ["Fall menu preview", "Email", "Draft", "VIP tier"],
  ["Double points weekend", "SMS", "Sent", "Loyalty members"],
];

export const campaigns: Campaign[] = CAMPAIGN_SEED.map(([name, channel, status, audience], i) => {
  const sent = status === "Draft" ? 0 : randInt(420, 5200);
  const opened = Math.round(sent * rand(0.28, 0.62));
  const clicked = Math.round(opened * rand(0.09, 0.31));
  const redeemed = Math.round(clicked * rand(0.11, 0.38));
  return {
    id: `camp-${i + 1}`,
    name,
    channel,
    status,
    sent,
    opened,
    clicked,
    redeemed,
    revenue: Math.round(redeemed * rand(38, 88)),
    date: dayOffset(status === "Scheduled" ? randInt(2, 14) : -randInt(1, 60)).toLocaleDateString("en-US", {
      month: "short", day: "numeric",
    }),
    audience,
  };
});

// --------------------------------------------------------------------- reviews
export type Review = {
  id: string;
  author: string;
  source: "Google" | "Yelp" | "Facebook" | "SpotOn";
  rating: number;
  body: string;
  date: string;
  replied: boolean;
};

const REVIEW_BODIES = [
  "The short rib pappardelle was outstanding and our server Marisol was so attentive. Will be back.",
  "Great food but we waited 25 minutes past our reservation time. Front of house felt overwhelmed.",
  "Best crab roll in the city, full stop. The patio is a hidden gem on a warm evening.",
  "Cocktails are creative and well balanced. The espresso martini is dangerous.",
  "Food was good, prices have crept up noticeably since last year.",
  "Ordered takeout through their site — ready right on time, packaged perfectly, still hot.",
  "Lovely brunch. The biscuits alone are worth the trip.",
  "Service was slow and our order came out wrong twice. Manager comped dessert which was appreciated.",
  "Consistently excellent. We've been coming for three years and it never misses.",
  "The vegetarian plate was thoughtful, not an afterthought. Rare and appreciated.",
  "Loud on a Saturday night — hard to hold a conversation, but the food made up for it.",
  "Quick lunch, friendly staff, in and out in 40 minutes. Exactly what I needed.",
];

export const reviews: Review[] = REVIEW_BODIES.map((body, i) => ({
  id: `rev-${i + 1}`,
  author: pick(CUST_NAMES),
  source: pick(["Google", "Yelp", "Facebook", "SpotOn"] as const),
  rating: body.includes("slow") || body.includes("waited") || body.includes("crept") ? randInt(2, 3) : randInt(4, 5),
  body,
  date: dayOffset(-randInt(0, 45)).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  replied: rng() > 0.55,
}));

export const reviewStats = {
  average: Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10,
  total: 1487,
  distribution: [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: stars >= 4 ? randInt(380, 720) : stars === 3 ? randInt(90, 160) : randInt(20, 70),
  })),
};

// ---------------------------------------------------------------------- orders
export type Order = {
  id: string;
  ticket: string;
  channel: "Dine-in" | "Takeout" | "Delivery" | "Online";
  table: string;
  server: string;
  items: number;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  status: "Open" | "Paid" | "Refunded" | "Voided";
  time: string;
  payment: string;
};

export const orders: Order[] = Array.from({ length: 42 }, (_, i) => {
  const subtotal = Math.round(rand(22, 340) * 100) / 100;
  const tax = Math.round(subtotal * 0.08625 * 100) / 100;
  const tip = Math.round(subtotal * rand(0.0, 0.26) * 100) / 100;
  const channel = pick(["Dine-in", "Dine-in", "Dine-in", "Takeout", "Delivery", "Online"] as const);
  const status: Order["status"] =
    rng() > 0.93 ? (rng() > 0.5 ? "Refunded" : "Voided") : rng() > 0.82 ? "Open" : "Paid";
  const t = new Date(TODAY);
  t.setHours(randInt(11, 22), randInt(0, 59));
  return {
    id: `ord-${i + 1}`,
    ticket: `#${1200 + i}`,
    channel,
    table: channel === "Dine-in" ? `T${randInt(1, 32)}` : "—",
    server: pick(employees.filter((e) => e.sales > 0)).name,
    items: randInt(1, 11),
    subtotal,
    tax,
    tip,
    total: Math.round((subtotal + tax + tip) * 100) / 100,
    status,
    time: t.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    payment: pick(["Visa •4821", "Mastercard •9013", "Amex •3007", "Cash", "Gift card •7742"]),
  };
}).sort((a, b) => (a.time < b.time ? 1 : -1));

// ------------------------------------------------------------------ statements
export type Deposit = {
  id: string;
  date: string;
  gross: number;
  fees: number;
  refunds: number;
  net: number;
  status: "Paid" | "In transit" | "Pending";
  account: string;
  batches: number;
};

export const deposits: Deposit[] = Array.from({ length: 18 }, (_, i) => {
  const d = days90[days90.length - 1 - i];
  const gross = Math.round(d.gross);
  const fees = Math.round(gross * rand(0.021, 0.029));
  const refunds = Math.round(d.refunds);
  return {
    id: `dep-${i + 1}`,
    date: d.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    gross,
    fees,
    refunds,
    net: gross - fees - refunds,
    status: i === 0 ? "Pending" : i === 1 ? "In transit" : "Paid",
    account: "Wells Fargo •••4417",
    batches: randInt(1, 4),
  };
});

// ------------------------------------------------------------------ gift cards
export const giftCards = {
  outstanding: 42815,
  issuedThisMonth: 9340,
  redeemedThisMonth: 7120,
  activeCards: 618,
  breakage: 3.2,
  recent: Array.from({ length: 10 }, (_, i) => ({
    id: `gc-${i + 1}`,
    code: `GC-${randInt(100000, 999999)}`,
    balance: Math.round(rand(0, 250)),
    issued: dayOffset(-randInt(1, 300)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    lastUsed: dayOffset(-randInt(0, 60)).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    status: rng() > 0.2 ? "Active" : "Depleted",
  })),
};

// ---------------------------------------------------------------- reservations
export type Reservation = {
  id: string;
  name: string;
  party: number;
  time: string;
  table: string;
  status: "Confirmed" | "Seated" | "Waitlist" | "Completed" | "No-show";
  phone: string;
  notes: string;
};

export const reservations: Reservation[] = Array.from({ length: 16 }, (_, i) => {
  const h = 17 + Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return {
    id: `res-${i + 1}`,
    name: pick(CUST_NAMES),
    party: randInt(1, 8),
    time: `${h > 12 ? h - 12 : h}:${m} PM`,
    table: `T${randInt(1, 32)}`,
    status: pick(["Confirmed", "Confirmed", "Seated", "Waitlist", "Completed", "No-show"] as const),
    phone: `(415) 555-${String(randInt(1000, 9999))}`,
    notes: pick(["", "", "Anniversary", "Window seat requested", "Allergy: shellfish", "Regular — comp bread"]),
  };
});

export const waitlist = Array.from({ length: 5 }, (_, i) => ({
  id: `wait-${i + 1}`,
  name: pick(CUST_NAMES),
  party: randInt(2, 6),
  quoted: randInt(15, 60),
  waiting: randInt(3, 48),
  phone: `(415) 555-${String(randInt(1000, 9999))}`,
}));

// -------------------------------------------------------------------- devices
export const devices = [
  { id: "dev-1", name: "Terminal 1 — Bar", type: "SpotOn Terminal", serial: "ST-88214", status: "Online", version: "12.4.1", lastSeen: "Just now" },
  { id: "dev-2", name: "Terminal 2 — Server station", type: "SpotOn Terminal", serial: "ST-88215", status: "Online", version: "12.4.1", lastSeen: "Just now" },
  { id: "dev-3", name: "Handheld A", type: "SpotOn Handheld", serial: "SH-40912", status: "Online", version: "12.4.1", lastSeen: "2 min ago" },
  { id: "dev-4", name: "Handheld B", type: "SpotOn Handheld", serial: "SH-40913", status: "Offline", version: "12.3.8", lastSeen: "4 hours ago" },
  { id: "dev-5", name: "Kitchen Display — Hot line", type: "KDS", serial: "KD-11204", status: "Online", version: "8.2.0", lastSeen: "Just now" },
  { id: "dev-6", name: "Kitchen Display — Cold line", type: "KDS", serial: "KD-11205", status: "Online", version: "8.2.0", lastSeen: "Just now" },
  { id: "dev-7", name: "Receipt printer — Expo", type: "Printer", serial: "PR-77341", status: "Needs paper", version: "—", lastSeen: "Just now" },
  { id: "dev-8", name: "Cash drawer 1", type: "Peripheral", serial: "CD-20118", status: "Online", version: "—", lastSeen: "Just now" },
];

// ------------------------------------------------------------------- reports
export const reportCatalog = [
  { group: "Sales", items: ["Daily recap", "Sales summary", "Sales by day part", "Sales by revenue center", "Sales by order type", "Hourly sales", "Voids & comps", "Discounts", "Tax summary"] },
  { group: "Menu", items: ["Product mix (PMIX)", "Menu mix by category", "Menu engineering", "Modifier sales", "Item velocity", "Cost of goods"] },
  { group: "Labor", items: ["Labor summary", "Labor vs. sales", "Time punches", "Overtime", "Job code breakdown", "Sales per labor hour"] },
  { group: "Payments", items: ["Payment summary", "Batches", "Settlements", "Tips & gratuity", "Refunds & chargebacks", "Cash reconciliation"] },
  { group: "Employees", items: ["Employee performance", "Server sales", "Checkout report", "Tip pooling", "Payroll export"] },
  { group: "Guests", items: ["Customer list", "Loyalty activity", "Gift card liability", "Campaign performance", "Review summary"] },
];

// --------------------------------------------------------------- loyalty stats
export const loyalty = {
  members: 3184,
  newThisMonth: 214,
  activeRate: 38.4,
  pointsIssued: 184920,
  pointsRedeemed: 96410,
  rewardsRedeemed: 612,
  avgVisitLift: 2.4,
  program: {
    name: "Harborview Rewards",
    earn: "1 point per $1 spent",
    tiers: [
      { name: "Member", threshold: 0, perk: "Birthday dessert" },
      { name: "Regular", threshold: 500, perk: "Free appetizer + priority waitlist" },
      { name: "VIP", threshold: 2000, perk: "Chef's table access + 10% off" },
    ],
    rewards: [
      { name: "$10 off your next visit", cost: 200, redeemed: 284, active: true },
      { name: "Free dessert", cost: 120, redeemed: 196, active: true },
      { name: "Free appetizer", cost: 150, redeemed: 108, active: true },
      { name: "$25 off parties of 4+", cost: 500, redeemed: 24, active: false },
    ],
  },
};

// ------------------------------------------------------------ online ordering
export const onlineOrdering = {
  enabled: true,
  url: "order.harborviewkitchen.com",
  ordersThisWeek: 412,
  revenueThisWeek: 18940,
  avgTicket: 45.97,
  prepTime: 22,
  conversionRate: 6.8,
  settings: [
    { key: "Accepting orders", value: true, hint: "Pause to temporarily stop new online orders" },
    { key: "Pickup", value: true, hint: "Guests collect at the counter" },
    { key: "Delivery", value: true, hint: "Dispatched through SpotOn Delivery" },
    { key: "Curbside", value: false, hint: "Guests check in on arrival" },
    { key: "Scheduled orders", value: true, hint: "Allow ordering up to 7 days ahead" },
    { key: "Tipping at checkout", value: true, hint: "Show a tip prompt before payment" },
  ],
};

// ---------------------------------------------------------------- notifications
export const notifications = [
  { id: "n1", title: "Deposit on the way", body: "$9,412.88 is in transit to Wells Fargo •••4417.", time: "12m ago", unread: true, kind: "money" as const },
  { id: "n2", title: "Handheld B went offline", body: "Last seen 4 hours ago. Check the charging dock.", time: "4h ago", unread: true, kind: "alert" as const },
  { id: "n3", title: "Labor is tracking high", body: "Labor is 34.1% of sales today vs. your 28% target.", time: "5h ago", unread: true, kind: "alert" as const },
  { id: "n4", title: "New 2-star review on Yelp", body: "\"Service was slow and our order came out wrong twice…\"", time: "1d ago", unread: false, kind: "review" as const },
  { id: "n5", title: "Campaign sent", body: "\"Double points weekend\" reached 2,140 guests.", time: "2d ago", unread: false, kind: "info" as const },
];

// ----------------------------------------------------------------- AI insights
export const insights = [
  {
    id: "i1",
    tone: "warning" as const,
    title: "Labor ran 6.1 points over target on Saturday",
    body: "You scheduled 214 labor hours against $12,880 in sales. Trimming two bussers from the 4–7pm block would have held you at target without touching service ratios.",
    action: "Open labor vs. sales",
    href: "/employees",
  },
  {
    id: "i2",
    tone: "good" as const,
    title: "Short Rib Pappardelle is your strongest star",
    body: "It carries a 65% margin and sold 412 units this month — 38% above the category median. Featuring it in the next campaign is the highest-leverage move available.",
    action: "View menu engineering",
    href: "/menus",
  },
  {
    id: "i3",
    tone: "info" as const,
    title: "Online ordering converts best at 5–7pm",
    body: "68% of online revenue lands in that window. Your current promo runs 2–4pm, when traffic is thinnest.",
    action: "Adjust online ordering",
    href: "/online-ordering",
  },
];
