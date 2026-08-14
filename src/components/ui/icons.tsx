/** The Hoople icon set — one thin, rounded stroke family across the whole app. */

export interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  color?: string;
  style?: React.CSSProperties;
}

function Stroke({
  size = 16,
  className,
  strokeWidth = 1.9,
  color = 'currentColor',
  style,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const Logo = ({ size = 26, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3a9 9 0 1 0 8.5 6" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
    <path
      d="M15 2.5l6 1.2-1.2 6"
      stroke={color}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Search = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Stroke>
);

export const MapPin = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Stroke>
);

export const Calendar = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Stroke>
);

export const CalendarDots = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
    <circle cx="8" cy="14" r="1" fill="currentColor" />
    <circle cx="12" cy="14" r="1" fill="currentColor" />
    <circle cx="16" cy="14" r="1" fill="currentColor" />
  </Stroke>
);

export const Clock = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Stroke>
);

export const Grid = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Stroke>
);

export const Sliders = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
    <circle cx="9" cy="6" r="2" fill="#fff" />
    <circle cx="15" cy="12" r="2" fill="#fff" />
    <circle cx="8" cy="18" r="2" fill="#fff" />
  </Stroke>
);

export const Funnel = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z" />
  </Stroke>
);

export const ChevronDown = (p: IconProps) => (
  <Stroke strokeWidth={2} {...p}>
    <path d="M6 9l6 6 6-6" />
  </Stroke>
);

export const ChevronLeft = (p: IconProps) => (
  <Stroke strokeWidth={2} {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Stroke>
);

export const ChevronRight = (p: IconProps) => (
  <Stroke strokeWidth={2} {...p}>
    <path d="M9 5l7 7-7 7" />
  </Stroke>
);

export const ArrowRight = (p: IconProps) => (
  <Stroke strokeWidth={2} {...p}>
    <path d="M5 12h13M13 6l6 6-6 6" />
  </Stroke>
);

export const ArrowLeft = (p: IconProps) => (
  <Stroke strokeWidth={2} {...p}>
    <path d="M19 12H6M11 6l-6 6 6 6" />
  </Stroke>
);

export const ArrowUpRight = (p: IconProps) => (
  <Stroke strokeWidth={2} {...p}>
    <path d="M8 16 16 8M9 8h7v7" />
  </Stroke>
);

export const Heart = ({ filled = false, ...p }: IconProps & { filled?: boolean }) => (
  <svg
    width={p.size ?? 16}
    height={p.size ?? 16}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke={p.color ?? 'currentColor'}
    strokeWidth={p.strokeWidth ?? 1.9}
    className={p.className}
    aria-hidden="true"
  >
    <path d="M12 20s-7-4.6-7-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7 2.6C19 15.4 12 20 12 20Z" />
  </svg>
);

export const Bolt = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </Stroke>
);

export const Users = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5M16 5.6a3.2 3.2 0 0 1 0 5.6M18 14.6c2 .7 3.4 2.2 3.4 4.4" />
  </Stroke>
);

export const User = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5 20c0-3.4 3.1-5.6 7-5.6s7 2.2 7 5.6" />
  </Stroke>
);

export const UserCircle = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="10" r="2.6" />
    <path d="M7.5 18c.6-2 2.3-3 4.5-3s3.9 1 4.5 3" />
  </Stroke>
);

export const Star = ({ size = 16, color = '#F5B301', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6.1L12 16.8 6.6 19.7l1.2-6.1L3.3 9.4l6.1-.8L12 3Z" />
  </svg>
);

export const StarOutline = (p: IconProps) => (
  <Stroke {...p}>
    <path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6.1L12 16.8 6.6 19.7l1.2-6.1L3.3 9.4l6.1-.8L12 3Z" />
  </Stroke>
);

export const Ticket = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M3 8a2 2 0 0 0 0 8v2h18v-2a2 2 0 0 1 0-8V6H3v2Z" />
  </Stroke>
);

export const Check = (p: IconProps) => (
  <Stroke strokeWidth={3} {...p}>
    <path d="M5 12.5 10 17l9-10" />
  </Stroke>
);

export const Copy = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M15 5.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 5.5 15" />
  </Stroke>
);

export const Download = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" />
  </Stroke>
);

export const Share = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" />
  </Stroke>
);

export const Bell = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M18 15V10a6 6 0 1 0-12 0v5l-1.5 2.5h15L18 15Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </Stroke>
);

export const Play = ({ size = 18, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
  </svg>
);

export const Photos = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <circle cx="8.5" cy="9.5" r="1.6" />
    <path d="m4 17 5-4.5 4.5 4 3-2.5L20 18" />
  </Stroke>
);

export const Recurring = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M4 12a8 8 0 0 1 13.7-5.6M20 12a8 8 0 0 1-13.7 5.6" />
    <path d="M18 2.5V7h-4.5M6 21.5V17h4.5" />
  </Stroke>
);

export const Repeat = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M4 12a8 8 0 0 1 13.7-5.6M20 12a8 8 0 0 1-13.7 5.6" />
    <path d="M18 3v4h-4" />
  </Stroke>
);

export const Shield = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M12 3 5 6v6c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6l-7-3Z" />
  </Stroke>
);

export const ShieldCheck = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M12 3 5 6v6c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6l-7-3Z" />
    <path d="M9 12l2 2 4-4" />
  </Stroke>
);

export const Info = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8v.1" />
  </Stroke>
);

export const Lock = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="4" y="10" width="16" height="10" rx="2.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Stroke>
);

export const Mail = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 7 8 6 8-6" />
  </Stroke>
);

export const Eye = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
    <circle cx="12" cy="12" r="2.8" />
  </Stroke>
);

export const EyeOff = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M3 3l18 18M10.6 10.7a2.8 2.8 0 0 0 3.8 3.8" />
    <path d="M6.7 6.9C4.3 8.4 2.5 12 2.5 12s3.5 6 9.5 6c1.7 0 3.2-.5 4.4-1.2M19.2 15c1.4-1.4 2.3-3 2.3-3S18 6 12 6c-.6 0-1.2.1-1.7.2" />
  </Stroke>
);

export const Globe = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 2.5 15 0 18M12 3c-2.5 2.6-2.5 15 0 18" />
  </Stroke>
);

export const Headset = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect x="2.5" y="13" width="4.5" height="6" rx="2" />
    <rect x="17" y="13" width="4.5" height="6" rx="2" />
  </Stroke>
);

export const Plus = (p: IconProps) => (
  <Stroke strokeWidth={2} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Stroke>
);

export const Menu = (p: IconProps) => (
  <Stroke strokeWidth={2} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Stroke>
);

export const Close = (p: IconProps) => (
  <Stroke strokeWidth={2} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Stroke>
);

export const Trash = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
  </Stroke>
);

export const Levels = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M5 20v-5M12 20V9M19 20V4" />
  </Stroke>
);

export const Room = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M7 4h10v16l-5-3.5L7 20V4Z" />
  </Stroke>
);

export const Learn = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M12 5 3 9l9 4 9-4-9-4Z" />
    <path d="M6 11v4c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4v-4" />
  </Stroke>
);

export const Box = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d="M12 8v6m0 0-2.5-2.5M12 14l2.5-2.5" />
  </Stroke>
);

export const Chat = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M4 5h11v8H8l-4 3V5Z" />
    <path d="M17 9h3v8l-3-2.5h-5" />
  </Stroke>
);

export const Tools = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M4 20 20 4M9 5l4 4M5 9l4 4" />
    <path d="M3.5 17.5 6.5 20.5" />
  </Stroke>
);

export const Shirt = (p: IconProps) => (
  <Stroke strokeWidth={1.6} {...p}>
    <path d="M9 4 4 6.5 6 11h2v9h8v-9h2l2-4.5L15 4a3 3 0 0 1-6 0Z" />
  </Stroke>
);

export const Bottle = (p: IconProps) => (
  <Stroke strokeWidth={1.6} {...p}>
    <path d="M10 2h4v3h-4z" />
    <path d="M9 5h6l1.5 3v12a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V8L9 5Z" />
    <path d="M7.5 12h9" />
  </Stroke>
);

export const Apron = (p: IconProps) => (
  <Stroke strokeWidth={1.6} {...p}>
    <path d="M9 3v2a3 3 0 0 0 6 0V3" />
    <path d="M8 5c-2 1-3 3-3 6v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8c0-3-1-5-3-6" />
  </Stroke>
);

export const HeartOutlineLarge = (p: IconProps) => (
  <Stroke strokeWidth={1.6} {...p}>
    <path d="M12 20s-7.5-4.8-7.5-10A4.4 4.4 0 0 1 12 7.4 4.4 4.4 0 0 1 19.5 10c0 5.2-7.5 10-7.5 10Z" />
  </Stroke>
);

export const Bag = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M9 3h6l1 4H8l1-4Z" />
    <rect x="6" y="7" width="12" height="14" rx="3" />
  </Stroke>
);

export const Card = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="6" width="18" height="13" rx="3" />
    <path d="M3 10h18" />
  </Stroke>
);

export const Doc = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="4" y="3" width="16" height="18" rx="3" />
    <path d="M8 8h8M8 12h5" />
  </Stroke>
);

export const Parking = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3" />
  </Stroke>
);

export const Accessible = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="12" cy="5" r="2" />
    <path d="M10 8v6h5l3 5M7 12a6 6 0 1 0 8 7" />
  </Stroke>
);

export const Sparkle = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M12 3v5M12 16v5M3 12h5M16 12h5M6.5 6.5l3 3M14.5 14.5l3 3M17.5 6.5l-3 3M9.5 14.5l-3 3" />
  </Stroke>
);

export const Compass = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15 9-2 4-4 2 2-4 4-2Z" />
  </Stroke>
);

export const Chart = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M4 20h16" />
    <path d="M7 20v-6M12 20V7M17 20v-9" />
  </Stroke>
);

export const Wallet = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="6" width="18" height="13" rx="3" />
    <path d="M16 12.5h2.5" />
  </Stroke>
);

export const Layers = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M12 4 2.5 9 12 14l9.5-5L12 4Z" />
    <path d="M6 11v4.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V11" />
  </Stroke>
);

export const Dice = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" />
    <circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
  </Stroke>
);

export const Bulb = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M9.5 18h5M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5.9 1.2 1 1.9v.2h5v-.2c.1-.7.4-1.4 1-1.9A6 6 0 0 0 12 3Z" />
  </Stroke>
);

export const Tag = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M11.6 3H4v7.6a2 2 0 0 0 .6 1.4l7.4 7.4a2 2 0 0 0 2.8 0l5.6-5.6a2 2 0 0 0 0-2.8L13 3.6a2 2 0 0 0-1.4-.6Z" />
    <circle cx="8" cy="8" r="1.3" />
  </Stroke>
);

export const Sprout = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M12 21v-8" />
    <path d="M12 13c0-3-2-5-5-5-.5 0-1 .1-1.4.2C5.3 11.2 7.5 13 10.5 13H12Z" />
    <path d="M12 13c0-3.5 2.4-6 5.6-6 .5 0 1 .1 1.4.2C19.4 10.8 16.6 13 13.4 13H12Z" />
  </Stroke>
);

export const LinkChain = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.4 1.4" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.4-1.4" />
  </Stroke>
);

export const Sun = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
  </Stroke>
);

export const Cloud = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M7 18h10a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.5 1.3A3.5 3.5 0 0 0 7 18Z" />
  </Stroke>
);

export const Moon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
  </Stroke>
);

export const Pencil = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
    <path d="M14.5 6.5l3 3" />
  </Stroke>
);

export const Grip = ({ size = 16, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <circle cx="9" cy="5" r="1.6" />
    <circle cx="15" cy="5" r="1.6" />
    <circle cx="9" cy="12" r="1.6" />
    <circle cx="15" cy="12" r="1.6" />
    <circle cx="9" cy="19" r="1.6" />
    <circle cx="15" cy="19" r="1.6" />
  </svg>
);

export const Minus = (p: IconProps) => (
  <Stroke strokeWidth={2} {...p}>
    <path d="M5 12h14" />
  </Stroke>
);

export const Reset = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M4 12a8 8 0 1 1 2.5 5.8" />
    <path d="M3.5 8.5V13H8" />
  </Stroke>
);

export const Wifi = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0M12 19.5v.1" />
  </Stroke>
);

export const Snowflake = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M12 2.5v19M3.8 7.2l16.4 9.6M20.2 7.2 3.8 16.8" />
    <path d="M9.5 4.5 12 6.8l2.5-2.3M9.5 19.5 12 17.2l2.5 2.3" />
  </Stroke>
);

export const Locker = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2.5" />
    <path d="M12 3v18M8.5 8h.1M15.5 8h.1" />
  </Stroke>
);

export const Prayer = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M5 21V10a7 7 0 0 1 14 0v11" />
    <path d="M3.5 21h17M12 6v4M10 8h4" />
  </Stroke>
);

export const Cafe = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M4 8h12v6a5 5 0 0 1-10 0V8Z" />
    <path d="M16 9.5h1.8a2.5 2.5 0 0 1 0 5H16M4 21h14" />
  </Stroke>
);

export const Smoking = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="14" width="14" height="4" rx="1.5" />
    <path d="M19 14v4M14 14v4M15 3c0 2 2 2.4 2 4s-1 2-1 3" />
  </Stroke>
);

export const Restroom = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="7.5" cy="4.5" r="1.8" />
    <path d="M5 21v-5H4l1.6-6h3.8L11 16H9.8v5H5Z" />
    <circle cx="16.5" cy="4.5" r="1.8" />
    <path d="M13.5 15 16 8h1l2.5 7h-2v6h-2v-6h-2Z" />
  </Stroke>
);

export const Dots = ({ size = 16, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <circle cx="5.5" cy="12" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="18.5" cy="12" r="1.7" />
  </svg>
);

export const Camera = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M3 8.5h3.5L8 6h8l1.5 2.5H21v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-10Z" />
    <circle cx="12" cy="13" r="3.4" />
  </Stroke>
);

export const Upload = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M7 16.5a4.5 4.5 0 0 1 .6-9 6 6 0 0 1 11.3 1.6A3.9 3.9 0 0 1 18 16.5" />
    <path d="M12 21v-9M9 14.5 12 11.5l3 3" />
  </Stroke>
);

export const VideoFile = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M10 8.5v7l6-3.5-6-3.5Z" />
  </Stroke>
);

export const Send = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M21 3 10.5 13.5M21 3l-6.8 18-3.7-7.5L3 9.8 21 3Z" />
  </Stroke>
);

export const Dashboard = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="M3 9h18M9 9v11" />
  </Stroke>
);

export const Palette = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M12 3a9 9 0 0 0 0 18c1.4 0 2-.9 2-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7Z" />
    <circle cx="7.5" cy="12" r="1.1" fill="currentColor" />
    <circle cx="9.5" cy="8" r="1.1" fill="currentColor" />
    <circle cx="14.5" cy="8" r="1.1" fill="currentColor" />
  </Stroke>
);

export const Monitor = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="4" width="18" height="12.5" rx="2.5" />
    <path d="M9 20.5h6M12 16.5v4" />
  </Stroke>
);

export const Building = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M3 21h18M5 21V9.5L12 5l7 4.5V21" />
    <path d="M9.5 21v-4.5h5V21M9.5 12h.1M14.5 12h.1" />
  </Stroke>
);

export const Mic = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="9" y="3" width="6" height="10.5" rx="3" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" />
  </Stroke>
);

export const Flag = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M5 21V4M5 4.5h11l-1.8 3.5L16 11.5H5" />
  </Stroke>
);

export const Utensils = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M6 3v7a2 2 0 0 0 4 0V3M8 12v9" />
    <path d="M17 3c-1.5 1.2-2 3-2 5s.7 3 2 3.2V21" />
  </Stroke>
);

export const Phone = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M6.5 3h3l1.5 4-2 1.4a12 12 0 0 0 5.6 5.6L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z" />
  </Stroke>
);

export const DotsVertical = ({ size = 16, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <circle cx="12" cy="5.5" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="12" cy="18.5" r="1.7" />
  </svg>
);

export const TextBold = (p: IconProps) => (
  <Stroke strokeWidth={2.2} {...p}>
    <path d="M7 4h6a4 4 0 0 1 0 8H7V4ZM7 12h6.5a4 4 0 0 1 0 8H7v-8Z" />
  </Stroke>
);

export const TextItalic = (p: IconProps) => (
  <Stroke strokeWidth={2.2} {...p}>
    <path d="M15 4h-5M14 20H9M13.5 4 10.5 20" />
  </Stroke>
);

export const ListBullets = (p: IconProps) => (
  <Stroke strokeWidth={2} {...p}>
    <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.1M4.5 12h.1M4.5 18h.1" />
  </Stroke>
);

export const ListNumbers = (p: IconProps) => (
  <Stroke strokeWidth={2} {...p}>
    <path d="M10 6h10M10 12h10M10 18h10M4 5.5h1.2V9M4 15h2v1.5H4.5V19H6" />
  </Stroke>
);

export const Emoji = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.1M15 9.5h.1" />
  </Stroke>
);

export const Rocket = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M13.5 3.5c3.5 0 7 3.5 7 7-2.6 4-6 6.5-9.5 8L8 15.5 4.5 13c1.5-3.5 4-6.9 9-9.5Z" />
    <circle cx="14.5" cy="9.5" r="1.8" />
    <path d="M8 15.5c-1.6.6-2.6 2-3 4.5 2.5-.4 3.9-1.4 4.5-3" />
  </Stroke>
);

export const TextUnderline = (p: IconProps) => (
  <Stroke strokeWidth={2.2} {...p}>
    <path d="M7 4v6a5 5 0 0 0 10 0V4M5.5 20h13" />
  </Stroke>
);

export const Facebook = ({ size = 18, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" />
  </svg>
);

export const XMark = ({ size = 18, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M17.5 3h3l-6.6 7.5L21.7 21h-6l-4.7-6.1L5.6 21h-3l7-8L2.6 3h6.2l4.2 5.6L17.5 3Zm-1 16.2h1.6L7.6 4.7H5.9l10.6 14.5Z" />
  </svg>
);

export const WhatsApp = ({ size = 18, color = 'currentColor', className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1a13 13 0 0 1-5-4.4c-.4-.6-1-1.5-1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.5c-.1.2-.3.3-.1.6a9 9 0 0 0 3.6 3c.3.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l2 1c.2.1.4.2.4.3.1.1.1.6-.1 1.3Z" />
  </svg>
);

/* ---------- Organizer console ---------- */

export const Home = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-8.5Z" />
  </Stroke>
);

export const Gear = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="3.1" />
    <path d="M19.1 14.6a1.6 1.6 0 0 0 .32 1.76l.06.06a1.9 1.9 0 1 1-2.7 2.7l-.05-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-1 1.47v.17a1.9 1.9 0 1 1-3.8 0v-.09a1.6 1.6 0 0 0-1.05-1.47 1.6 1.6 0 0 0-1.76.32l-.06.06a1.9 1.9 0 1 1-2.7-2.7l.06-.06a1.6 1.6 0 0 0 .32-1.76 1.6 1.6 0 0 0-1.46-1H3.2a1.9 1.9 0 1 1 0-3.8h.09a1.6 1.6 0 0 0 1.47-1.05 1.6 1.6 0 0 0-.32-1.76l-.06-.06a1.9 1.9 0 1 1 2.7-2.7l.06.06a1.6 1.6 0 0 0 1.76.32h.08a1.6 1.6 0 0 0 1-1.46V3.2a1.9 1.9 0 1 1 3.8 0v.09a1.6 1.6 0 0 0 1 1.46 1.6 1.6 0 0 0 1.77-.32l.05-.06a1.9 1.9 0 1 1 2.7 2.7l-.06.06a1.6 1.6 0 0 0-.32 1.76v.08a1.6 1.6 0 0 0 1.47 1h.17a1.9 1.9 0 1 1 0 3.8h-.09a1.6 1.6 0 0 0-1.46 1Z" />
  </Stroke>
);

export const Gift = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="8" width="18" height="4" rx="1.5" />
    <path d="M5 12v7.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V12M12 8v13" />
    <path d="M12 8S10.5 3 8 3a2.5 2.5 0 0 0 0 5M12 8s1.5-5 4-5a2.5 2.5 0 0 1 0 5" />
  </Stroke>
);

export const CheckCircle = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M20.5 11.2V12a8.5 8.5 0 1 1-5-7.8" />
    <path d="m8.5 11.5 3 3 8.5-9" />
  </Stroke>
);

export const ExternalLink = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M13 4h7v7M20 4l-9 9" />
    <path d="M18 14v5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H10" />
  </Stroke>
);

export const Crown = (p: IconProps) => (
  <svg
    width={p.size ?? 16}
    height={p.size ?? 16}
    viewBox="0 0 24 24"
    fill={p.color ?? 'currentColor'}
    className={p.className}
    aria-hidden="true"
  >
    <path d="M3 8.5 6.5 12 12 4.5 17.5 12 21 8.5v8A1.5 1.5 0 0 1 19.5 18h-15A1.5 1.5 0 0 1 3 16.5v-8Z" />
  </svg>
);

export const IdCard = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <circle cx="9" cy="11" r="2" />
    <path d="M5.8 16c.5-1.4 1.7-2.2 3.2-2.2s2.7.8 3.2 2.2M15 10h3.5M15 13.5h3.5" />
  </Stroke>
);

export const Trend = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M4 15.5 9.5 10l3.5 3.5L20 7" />
    <path d="M15 7h5v5" />
  </Stroke>
);

/* ---------- Brand marks ---------- */

export const GoogleMark = ({ size = 17 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"
    />
    <path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14Z" />
    <path
      fill="#EA4335"
      d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3 14.7 2 12 2a10 10 0 0 0-8.9 5.4L6.4 10c.8-2.3 3-4.1 5.6-4.1Z"
    />
  </svg>
);

export const AppleMark = ({ size = 16, color = '#12121A' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
    <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.2c.9-1.2 1.2-2.4 1.2-2.5 0 0-2.4-.9-2.4-3.6ZM14.2 5.9c.6-.8 1-1.9.9-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-.9 2.9 1 0 2.1-.5 2.7-1.3Z" />
  </svg>
);

export const PlayStoreMark = ({ size = 17, color = '#fff' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
    <path d="M4 3.2v17.6c0 .5.5.8.9.5l9.4-8.3-9.4-8.3c-.4-.3-.9 0-.9.5ZM16.1 10.8l2.7 2.4c.5.4.5 1.2 0 1.6l-2.7 2.4-2.9-2.6 2.9-2.6ZM5.6 21.6l8.8-7.8 2.4 2.1-9.8 6.1c-.5.3-1.1-.1-1.4-.4Z" />
  </svg>
);

export const Instagram = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </Stroke>
);

export const TikTok = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M15 3c.6 2.6 2.2 4.2 5 4.5v3.2c-1.9.1-3.6-.4-5-1.4v6.4A6.3 6.3 0 1 1 9 9.5v3.3a3 3 0 1 0 2.8 3V3H15Z" />
  </Stroke>
);

export const YouTube = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="4.5" />
    <path d="M10.5 9.5l5 2.5-5 2.5v-5Z" />
  </Stroke>
);

export const LinkedIn = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="M7.5 10.5V17M7.5 7.4v.1M12 17v-3.6c0-1.3.8-2.1 1.9-2.1s1.9.8 1.9 2.1V17" />
  </Stroke>
);
