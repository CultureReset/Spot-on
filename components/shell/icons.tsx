import React from "react";

type P = { className?: string; size?: number };
const S = ({ children, className, size = 20 }: P & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const IconHome = (p: P) => <S {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9.5V20h13V9.5" /><path d="M9.5 20v-5.5h5V20" /></S>;
export const IconSales = (p: P) => <S {...p}><path d="M3 20h18" /><path d="M6 20v-6" /><path d="M11 20V8" /><path d="M16 20v-9" /><path d="M21 20V5" /></S>;
export const IconReport = (p: P) => <S {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" /></S>;
export const IconOrders = (p: P) => <S {...p}><path d="M6 2.5h12l1.2 17a2 2 0 0 1-2 2.1H6.8a2 2 0 0 1-2-2.1z" /><path d="M9 6.5c0 1.7 1.3 3 3 3s3-1.3 3-3" /></S>;
export const IconMenu = (p: P) => <S {...p}><path d="M4 4.5h11a2.5 2.5 0 0 1 2.5 2.5v13H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M17.5 8H20v9.5a2.5 2.5 0 0 1-2.5 2.5" /><path d="M7.5 9h6M7.5 12.5h6M7.5 16h4" /></S>;
export const IconTeam = (p: P) => <S {...p}><circle cx="9" cy="8" r="3.2" /><path d="M2.8 20c.4-3.4 3.1-5.6 6.2-5.6s5.8 2.2 6.2 5.6" /><path d="M16.2 5.2a3.2 3.2 0 0 1 0 6.1" /><path d="M18 14.8c1.9.7 3.2 2.6 3.4 5.2" /></S>;
export const IconGuests = (p: P) => <S {...p}><circle cx="12" cy="7.5" r="3.6" /><path d="M4.5 20.5c0-4 3.4-6.6 7.5-6.6s7.5 2.6 7.5 6.6" /></S>;
export const IconLoyalty = (p: P) => <S {...p}><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.2 1.1 5.9L12 17l-5.3 2.8 1.1-5.9L3.5 9.7l5.9-.8z" /></S>;
export const IconCampaign = (p: P) => <S {...p}><path d="M3.5 9.5v5a1 1 0 0 0 1 1H8l6 4.5V4L8 8.5H4.5a1 1 0 0 0-1 1z" /><path d="M17.5 8.5a5 5 0 0 1 0 7" /><path d="M20 6a8.5 8.5 0 0 1 0 12" /></S>;
export const IconStar = ({ filled, ...p }: P & { filled?: boolean }) => (
  <S {...p}>
    <path
      d="M12 3.8 14.3 9l5.7.6-4.3 3.9 1.2 5.6L12 16.2 7.1 19.1l1.2-5.6L4 9.6 9.7 9z"
      fill={filled ? "currentColor" : "none"}
    />
  </S>
);
export const IconOnline = (p: P) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="M3.2 12h17.6" /><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" /></S>;
export const IconReservation = (p: P) => <S {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="2.2" /><path d="M3.5 9.8h17M8.5 3v4M15.5 3v4" /><path d="M8 13.5h3M8 17h6" /></S>;
export const IconGift = (p: P) => <S {...p}><rect x="3" y="9" width="18" height="11.5" rx="2" /><path d="M3 13.2h18M12 9v11.5" /><path d="M12 9S10.8 4.5 8.6 4.5a2.2 2.2 0 0 0 0 4.5zM12 9s1.2-4.5 3.4-4.5a2.2 2.2 0 0 1 0 4.5z" /></S>;
export const IconMoney = (p: P) => <S {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="2.2" /><circle cx="12" cy="12" r="2.8" /><path d="M6 9.5h.01M18 14.5h.01" /></S>;
export const IconDevice = (p: P) => <S {...p}><rect x="6" y="2.5" width="12" height="19" rx="2.4" /><path d="M10 5.5h4M10.5 18.5h3" /></S>;
export const IconSettings = (p: P) => <S {...p}><circle cx="12" cy="12" r="3.1" /><path d="M19.6 14.2a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V20a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H10a1.6 1.6 0 0 0 1-1.5V4a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V10a1.6 1.6 0 0 0 1.5 1H20a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></S>;
export const IconUsers = (p: P) => <S {...p}><path d="M15.5 20.5v-1.8a3.6 3.6 0 0 0-3.6-3.6H6.6A3.6 3.6 0 0 0 3 18.7v1.8" /><circle cx="9.2" cy="7.6" r="3.6" /><path d="M21 20.5v-1.8a3.6 3.6 0 0 0-2.7-3.5" /><path d="M15.5 4.1a3.6 3.6 0 0 1 0 7" /></S>;
export const IconBell = (p: P) => <S {...p}><path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.2 7.5-2.2 7.5h16.4S18 14.5 18 8.5z" /><path d="M13.7 20a2 2 0 0 1-3.4 0" /></S>;
export const IconSearch = (p: P) => <S {...p}><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" /></S>;
export const IconChevron = (p: P) => <S {...p}><path d="m6 9 6 6 6-6" /></S>;
export const IconChevronRight = (p: P) => <S {...p}><path d="m9 6 6 6-6 6" /></S>;
export const IconClose = (p: P) => <S {...p}><path d="M5 5l14 14M19 5 5 19" /></S>;
export const IconBars = (p: P) => <S {...p}><path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" /></S>;
export const IconMore = (p: P) => <S {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="19" cy="12" r="1.4" fill="currentColor" /></S>;
export const IconDownload = (p: P) => <S {...p}><path d="M12 3.5v11" /><path d="m7.5 10.5 4.5 4.5 4.5-4.5" /><path d="M4 20.5h16" /></S>;
export const IconPlus = (p: P) => <S {...p}><path d="M12 5v14M5 12h14" /></S>;
export const IconCalendar = (p: P) => <S {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="2.2" /><path d="M3.5 9.8h17M8.5 3v4M15.5 3v4" /></S>;
export const IconPin = (p: P) => <S {...p}><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" /><circle cx="12" cy="10" r="2.7" /></S>;
export const IconSpark = (p: P) => <S {...p}><path d="M12 3v3.5M12 17.5V21M4.2 12H7.7M16.3 12h3.5M6.5 6.5 9 9M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5" /></S>;
export const IconLogout = (p: P) => <S {...p}><path d="M9.5 20.5H5.8A1.8 1.8 0 0 1 4 18.7V5.3a1.8 1.8 0 0 1 1.8-1.8h3.7" /><path d="m15.5 16.5 4.5-4.5-4.5-4.5" /><path d="M20 12H9.5" /></S>;
export const IconCheck = (p: P) => <S {...p}><path d="m4.5 12.5 5 5 10-11" /></S>;
export const IconFilter = (p: P) => <S {...p}><path d="M3.5 5.5h17l-6.6 7.8v5.6l-3.8 2v-7.6z" /></S>;
export const IconPrinter = (p: P) => <S {...p}><path d="M7 9V3.5h10V9" /><rect x="3.5" y="9" width="17" height="7.5" rx="1.8" /><path d="M7 14.5h10v6H7z" /></S>;
