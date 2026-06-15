import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const line = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const Search = (p: P) => (
  <svg {...line} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

export const Heart = (p: P) => (
  <svg {...line} {...p}>
    <path d="M12 20.5s-7.5-4.6-9.6-9.2C1 7.7 2.9 4.7 6 4.7c1.9 0 3.4 1.1 4 2.4.6-1.3 2.1-2.4 4-2.4 3.1 0 5 3 3.6 6.6C19.5 15.9 12 20.5 12 20.5Z" />
  </svg>
);

export const HeartFilled = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 20.7s-7.6-4.7-9.7-9.4C.8 7.6 2.8 4.5 6 4.5c2 0 3.5 1.2 4 2.5.5-1.3 2-2.5 4-2.5 3.2 0 5.2 3.1 3.7 6.8-2.1 4.7-9.7 9.4-9.7 9.4Z" />
  </svg>
);

export const User = (p: P) => (
  <svg {...line} {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M5 20c.8-3.7 3.6-6 7-6s6.2 2.3 7 6" />
  </svg>
);

export const Bag = (p: P) => (
  <svg {...line} {...p}>
    <path d="M6 8h12l-.8 11.2a2 2 0 0 1-2 1.8H8.8a2 2 0 0 1-2-1.8L6 8Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </svg>
);

export const Whatsapp = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35Z" />
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2Zm0 18.13a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.23 8.23Z" />
  </svg>
);

export const Plus = (p: P) => (
  <svg {...line} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const Minus = (p: P) => (
  <svg {...line} {...p}>
    <path d="M5 12h14" />
  </svg>
);

export const Close = (p: P) => (
  <svg {...line} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const Menu = (p: P) => (
  <svg {...line} {...p}>
    <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
  </svg>
);

export const ArrowRight = (p: P) => (
  <svg {...line} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const ArrowUpRight = (p: P) => (
  <svg {...line} {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

export const ChevronDown = (p: P) => (
  <svg {...line} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const Star = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2.6l2.7 5.9 6.4.7-4.8 4.3 1.3 6.3L12 17l-5.6 3.1 1.3-6.3L3 9.5l6.4-.7L12 2.6Z" />
  </svg>
);

export const Leaf = (p: P) => (
  <svg {...line} {...p}>
    <path d="M4 20c0-9 5-15 16-16 0 11-6 16-15 16-1 0-1 0-1 0Z" />
    <path d="M9 15c2.5-3.5 5.5-6 9-7.5" />
  </svg>
);

export const Truck = (p: P) => (
  <svg {...line} {...p}>
    <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7" />
    <circle cx="7" cy="18" r="1.7" />
    <circle cx="17.5" cy="18" r="1.7" />
  </svg>
);

export const Shield = (p: P) => (
  <svg {...line} {...p}>
    <path d="M12 3 5 6v5c0 4.3 3 7.6 7 9 4-1.4 7-4.7 7-9V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const Clock = (p: P) => (
  <svg {...line} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const Tag = (p: P) => (
  <svg {...line} {...p}>
    <path d="M3.5 11.5 11 4h7.5V11l-7.5 7.5-7.5-7Z" />
    <circle cx="15" cy="8" r="1.2" />
  </svg>
);

export const Check = (p: P) => (
  <svg {...line} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const Sparkle = (p: P) => (
  <svg {...line} {...p}>
    <path d="M12 3c.4 4.6 1.4 5.6 6 6-4.6.4-5.6 1.4-6 6-.4-4.6-1.4-5.6-6-6 4.6-.4 5.6-1.4 6-6Z" />
  </svg>
);

export const MapPin = (p: P) => (
  <svg {...line} {...p}>
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const Quote = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M9 7c-2.8 0-5 2.2-5 5v5h5v-5H6.5c0-1.4 1.1-2.5 2.5-2.5V7Zm10 0c-2.8 0-5 2.2-5 5v5h5v-5h-2.5c0-1.4 1.1-2.5 2.5-2.5V7Z" />
  </svg>
);

export const Instagram = (p: P) => (
  <svg {...line} {...p}>
    <rect x="4" y="4" width="16" height="16" rx="5" />
    <circle cx="12" cy="12" r="3.6" />
    <circle cx="16.5" cy="7.5" r="0.6" fill="currentColor" />
  </svg>
);

export const Twitter = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M17.5 3h3l-6.6 7.5L21.7 21h-5.4l-4.2-5.5L7 21H4l7-8L3.4 3h5.5l3.8 5L17.5 3Zm-1 16h1.6L8 4.6H6.3L16.5 19Z" />
  </svg>
);

export const Facebook = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M13.5 21v-7h2.4l.4-2.9h-2.8V9.2c0-.8.3-1.4 1.5-1.4h1.4V5.2C16.6 5.1 15.7 5 14.7 5c-2.2 0-3.7 1.3-3.7 3.8v2.3H8.5V14h2.5v7h2.5Z" />
  </svg>
);

export const Refresh = (p: P) => (
  <svg {...line} {...p}>
    <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8" />
    <path d="M20 4v4h-4" />
    <path d="M20 12a8 8 0 0 1-13.7 5.6L4 16" />
    <path d="M4 20v-4h4" />
  </svg>
);

/** Small brand mark — a leaf contained in a droplet. */
export const LogoMark = (p: P) => (
  <svg viewBox="0 0 32 32" fill="none" {...p}>
    <path
      d="M6 20.5C6 12 11.5 6 21 5.5 20.5 15 15 20.5 6 20.5Z"
      fill="currentColor"
    />
    <circle cx="21.5" cy="9.5" r="2.4" fill="currentColor" opacity="0.55" />
  </svg>
);

export const CreditCard = (p: P) => (
  <svg {...line} {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20M6 14h2" />
  </svg>
);

export const ShieldCheck = (p: P) => (
  <svg {...line} {...p}>
    <path d="M12 3 5 6v5c0 4.3 3 7.6 7 9 4-1.4 7-4.7 7-9V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const Trash = (p: P) => (
  <svg {...line} {...p}>
    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

