import type React from "react";
import {
  IconHome, IconSales, IconReport, IconOrders, IconMenu, IconTeam, IconGuests,
  IconLoyalty, IconCampaign, IconStar, IconOnline, IconReservation, IconGift,
  IconMoney, IconDevice, IconSettings, IconUsers,
} from "@/components/shell/icons";

export type NavItem = {
  href: string;
  label: string;
  icon: (p: { className?: string; size?: number }) => React.JSX.Element;
  badge?: string;
  description: string;
};

export type NavGroup = { group: string; items: NavItem[] };

/**
 * Information architecture mirrors the SpotOn merchant dashboard: an overview,
 * the reporting spine, the operational sections, the guest-facing sections,
 * money, and setup.
 */
export const NAV: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: IconHome, description: "Today at a glance" },
      { href: "/sales", label: "Sales", icon: IconSales, description: "Revenue, day parts, channels" },
      { href: "/reporting", label: "Reporting", icon: IconReport, description: "90+ built-in reports" },
    ],
  },
  {
    group: "Operations",
    items: [
      { href: "/orders", label: "Orders", icon: IconOrders, description: "Tickets, refunds, voids" },
      { href: "/menus", label: "Menus", icon: IconMenu, description: "Items, modifiers, pricing" },
      { href: "/employees", label: "Team & labor", icon: IconTeam, description: "Staff, shifts, tips" },
      { href: "/reservations", label: "Reservations", icon: IconReservation, description: "Bookings and waitlist" },
    ],
  },
  {
    group: "Guests",
    items: [
      { href: "/customers", label: "Customers", icon: IconGuests, description: "Guest profiles and spend" },
      { href: "/loyalty", label: "Loyalty", icon: IconLoyalty, description: "Points, tiers, rewards" },
      { href: "/campaigns", label: "Campaigns", icon: IconCampaign, description: "Email and SMS marketing" },
      { href: "/reviews", label: "Reviews", icon: IconStar, badge: "3", description: "Ratings across platforms" },
    ],
  },
  {
    group: "Channels",
    items: [
      { href: "/online-ordering", label: "Online ordering", icon: IconOnline, description: "Your ordering site" },
      { href: "/gift-cards", label: "Gift cards", icon: IconGift, description: "Balances and liability" },
    ],
  },
  {
    group: "Money",
    items: [
      { href: "/statements", label: "Statements", icon: IconMoney, description: "Deposits, fees, batches" },
    ],
  },
  {
    group: "Setup",
    items: [
      { href: "/devices", label: "Devices", icon: IconDevice, description: "Terminals, KDS, printers" },
      { href: "/users", label: "Dashboard users", icon: IconUsers, description: "Access and permissions" },
      { href: "/settings", label: "Settings", icon: IconSettings, description: "Business configuration" },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV.flatMap((g) => g.items);

/** The five destinations that get a permanent slot in the mobile tab bar. */
export const MOBILE_TABS = ["/", "/sales", "/orders", "/menus"];
