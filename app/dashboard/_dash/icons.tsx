import React from "react";

type IconProps = { size?: number; className?: string; style?: React.CSSProperties };

function I(paths: string[], opts: { sw?: number } = {}) {
  return function Icon({ size = 24, ...rest }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={opts.sw || 1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...rest}
      >
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    );
  };
}

function IC(children: React.ReactNode, opts: { sw?: number } = {}) {
  return function Icon({ size = 24, ...rest }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={opts.sw || 1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...rest}
      >
        {children}
      </svg>
    );
  };
}

export const Icons = {
  grid: I(["M4 4h7v7H4zM13 4h7v7h-7zM13 13h7v7h-7zM4 13h7v7H4z"]),
  globe: IC(
    <>
      <circle cx={12} cy={12} r={9} />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
    </>
  ),
  user: IC(
    <>
      <circle cx={12} cy={8} r={4} />
      <path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" />
    </>
  ),
  shield: I(["M12 3l7 3v5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6z", "M9 12l2 2 4-4"]),
  plug: I(["M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"]),
  card: IC(
    <>
      <rect x={3} y={5} width={18} height={14} rx={2.5} />
      <path d="M3 10h18" />
    </>
  ),
  bell: I(["M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6", "M10 20a2 2 0 0 0 4 0"]),
  alert: IC(
    <>
      <circle cx={12} cy={12} r={9} />
      <path d="M12 7.5v5M12 16h.01" />
    </>
  ),
  search: IC(
    <>
      <circle cx={11} cy={11} r={7} />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  chevDown: I(["M6 9l6 6 6-6"]),
  chevRight: I(["M9 6l6 6-6 6"]),
  chevLeft: I(["M15 6l-6 6 6 6"]),
  plus: I(["M12 5v14M5 12h14"]),
  check: I(["M5 12.5l4.5 4.5L19 7"]),
  checkCircle: IC(
    <>
      <circle cx={12} cy={12} r={9} />
      <path d="M8 12.2l2.6 2.6L16 9" />
    </>
  ),
  x: I(["M6 6l12 12M18 6L6 18"]),
  ext: I(["M14 4h6v6", "M20 4l-9 9", "M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"]),
  copy: IC(
    <>
      <rect x={9} y={9} width={11} height={11} rx={2} />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" />
    </>
  ),
  eye: IC(
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx={12} cy={12} r={3} />
    </>
  ),
  eyeOff: I([
    "M3 3l18 18",
    "M10.6 6.2A9.6 9.6 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.3 3.9M6.3 6.3A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 3.7-.7",
    "M9.9 9.9a3 3 0 0 0 4.2 4.2",
  ]),
  logout: I(["M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3", "M16 17l5-5-5-5", "M21 12H9"]),
  key: IC(
    <>
      <circle cx={8} cy={14} r={4} />
      <path d="M11 11l8-8 2 2-2 2 2 2-2 2-2-2-2 2" />
    </>
  ),
  device: IC(
    <>
      <rect x={3} y={4} width={18} height={12} rx={2} />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  phone: IC(
    <>
      <rect x={7} y={3} width={10} height={18} rx={2.5} />
      <path d="M11 18h2" />
    </>
  ),
  trash: I(["M4 7h16", "M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2", "M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13", "M10 11v6M14 11v6"]),
  dots: IC(
    <>
      <circle cx={12} cy={5} r={1.4} />
      <circle cx={12} cy={12} r={1.4} />
      <circle cx={12} cy={19} r={1.4} />
    </>
  ),
  receipt: I(["M5 3h14v18l-3-2-3 2-3-2-3 2V3z", "M9 8h6M9 12h6"]),
  download: I(["M12 4v11", "M8 11l4 4 4-4", "M5 20h14"]),
  edit: I(["M4 20h4l10-10-4-4L4 16v4z", "M13.5 6.5l4 4"]),
  lock: IC(
    <>
      <rect x={5} y={11} width={14} height={9} rx={2} />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  refresh: I(["M21 12a9 9 0 1 1-3-6.7", "M21 4v4h-4"]),
  link: I(["M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5", "M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1.5-1.5"]),
  rocket: I([
    "M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2c.8-.8.8-2 0-3s-2.2-.8-3 0z",
    "M9 15l-3-3c1-5 5-9 12-9 0 7-4 11-9 12z",
    "M14 8a1.5 1.5 0 1 0 0-.01",
  ]),
  bolt: I(["M13 2L4 14h7l-1 8 9-12h-7z"]),
  clock: IC(
    <>
      <circle cx={12} cy={12} r={9} />
      <path d="M12 7v5l3 2" />
    </>
  ),
  mail: IC(
    <>
      <rect x={3} y={5} width={18} height={14} rx={2} />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  cog: IC(
    <>
      <circle cx={12} cy={12} r={3} />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </>
  ),
  sparkle: I(["M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"]),
  arrowUpRight: I(["M7 17L17 7", "M8 7h9v9"]),
  arrowRight: I(["M5 12h14", "M13 6l6 6-6 6"]),
  building: I(["M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16", "M16 21V9h2a2 2 0 0 1 2 2v10", "M3 21h18", "M8 7h2M8 11h2M8 15h2"]),
  ssl: I(["M12 3l7 3v5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6z", "M12 11v3"]),
  vercel: ({ size = 24, ...rest }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...rest}>
      <path d="M12 3l9 16H3z" />
    </svg>
  ),
  stripe: ({ size = 24, ...rest }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...rest}>
      <path d="M11.7 9.3c0-.7.6-1 1.5-1 1.3 0 3 .4 4.3 1.1V5.5A11 11 0 0 0 13.2 5C10.3 5 8.3 6.5 8.3 9c0 4 5.4 3.3 5.4 5 0 .8-.7 1-1.7 1-1.4 0-3.3-.6-4.7-1.4v4a12 12 0 0 0 4.7 1c3 0 5-1.5 5-4 0-4.2-5.4-3.5-5.4-5.3z" />
    </svg>
  ),
  filter: I(["M4 5h16", "M7 12h10", "M10 19h4"]),
  sun: IC(
    <>
      <circle cx={12} cy={12} r={4} />
      <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
    </>
  ),
  question: IC(
    <>
      <circle cx={12} cy={12} r={9} />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7M12 16.5h.01" />
    </>
  ),
  layers: I(["M12 3l9 5-9 5-9-5z", "M3 13l9 5 9-5", "M3 18l9 5 9-5"]),
  chart: IC(
    <>
      <path d="M3 21h18" />
      <rect x={5} y={11} width={3.4} height={7} rx={1} />
      <rect x={10.3} y={6} width={3.4} height={12} rx={1} />
      <rect x={15.6} y={14} width={3.4} height={4} rx={1} />
    </>
  ),
  window: IC(
    <>
      <rect x={3} y={4} width={18} height={16} rx={2} />
      <path d="M3 9h18M6.5 6.5h.01M9.5 6.5h.01" />
    </>
  ),
  trendUp: I(["M3 17l6-6 4 4 8-8", "M17 7h4v4"]),
  trendDown: I(["M3 7l6 6 4-4 8 8", "M17 17h4v-4"]),
};
