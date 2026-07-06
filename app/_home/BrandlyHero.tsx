"use client";

import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-brandly-sans" });

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_102305_3a7cab3b-7a86-46e8-a0f9-6937f035b087.mp4";

const NAV_LINKS = [
  { label: "Cum funcționează", href: "#how" },
  { label: "Exemple", href: "#examples" },
  { label: "Prețuri", href: "#pricing" },
] as const;

const CLIENTS = [
  { name: "Restaurante", icon: "restaurante" as const },
  { name: "Clinici", icon: "clinici" as const },
  { name: "Salon", icon: "salon" as const },
  { name: "Avocatură", icon: "avocatura" as const },
  { name: "Imobiliare", icon: "imobiliare" as const },
  { name: "Startup", icon: "startup" as const },
];

type IconType = (typeof CLIENTS)[number]["icon"];

const ICON_COLORS = {
  restaurante: "#06B6D4",
  clinici: "#14B8A6",
  salon: "#8B5CF6",
  avocatura: "#3B82F6",
  imobiliare: "#0EA5E9",
  startup: "#6366F1",
} as const;

const IMOBILIARE_SHADOW = "#0369A1";

function ClientIcon({ type }: { type: IconType }) {
  const base = { width: 32, height: 32, viewBox: "0 0 32 32", "aria-hidden": true as const };

  switch (type) {
    case "restaurante":
      return (
        <svg {...base}>
          {/* furculiță — siluetă recreată din referință */}
          <path
            fill={ICON_COLORS.restaurante}
            d="M9.29 2.6 8.42 10.09 10.77 14.03 9.89 27.98 10.55 29.56 11.48 29.95 12.96 28.2 12.08 14.74 12.46 13.1 14.32 10.86 14.32 6.1 13.45 2.6 13.23 8.56 12.46 9.11 11.86 3.2 11.26 2.6 10.82 8.56 10.06 9.11Z"
          />
          {/* cuțit — siluetă recreată din referință */}
          <path
            fill={ICON_COLORS.restaurante}
            d="M22.53 2 21.38 2.71 20.01 5.34 19.03 11.52 19.25 15.34 21.21 18.52 20.45 28.14 20.94 29.4 21.93 29.95 22.96 29.4 23.51 27.76 22.96 18.08 23.24 2.71Z"
          />
        </svg>
      );
    case "clinici":
      return (
        <svg {...base}>
          <circle cx="16" cy="16" r="10.6" fill="none" stroke={ICON_COLORS.clinici} strokeWidth="2.35" />
          <path
            fill="none"
            stroke={ICON_COLORS.clinici}
            strokeWidth="2.35"
            strokeLinecap="square"
            d="M16 10.15v11.7M10.15 16h11.7"
          />
        </svg>
      );
    case "salon":
      return (
        <svg {...base}>
          <path
            fill={ICON_COLORS.salon}
            d="M3.26 8.29 2 13.27 4.3 18.79 3.31 21.8 5.39 20.59 7.36 16.06 13.05 14.03 15.07 11.63 14.8 17.48 12.88 20.65 9.71 19.88 8.95 21.03 10.15 25.46 14.69 26.88 21.14 24.75 23.27 26.23 23.11 24.31 21.41 23.06 15.18 24.31 12.72 23.55 21.25 22.62 26.06 24.42 28.47 22.95 29.73 17.75 27.59 19.12 27.59 17.48 18.62 17.04 22.51 17.15 23.77 15.73 19.17 15.45 17.75 10.97 13.48 5.94 8.29 5.06Z"
          />
        </svg>
      );
    case "avocatura":
      return (
        <svg {...base}>
          <path
            fill={ICON_COLORS.avocatura}
            d="M15.89 2 15.18 5.99 6.75 6.27 7.63 7.47 4.57 16.38 6.81 18.52 10.2 17.91 11.29 15.78 8.23 7.41 15.18 6.81 14.96 21.96 11.46 24.09 20.48 24.09 16.98 21.96 16.54 7.03 23.71 7.41 20.64 15.78 21.74 17.91 25.46 18.41 27.37 15.67 24.31 7.47 25.18 6.27 16.76 5.99Z"
          />
        </svg>
      );
    case "imobiliare":
      return (
        <svg {...base}>
          <path
            fill={ICON_COLORS.imobiliare}
            d="M27.38 13.89 14.69 3.17 9.49 7.65 9.27 6.28 6.76 6.28 6.59 9.95 2.05 13.78 2 16.07 14.69 6.39 27.32 16.07Z"
          />
          <path
            fill={IMOBILIARE_SHADOW}
            d="M7.47 14.52 7.47 18.62 17.97 18.89 23.55 19.71 23.49 14.74 15.51 8.67Z"
          />
          <rect x={13.32} y={11.95} width={1.97} height={1.86} fill="#fff" />
          <rect x={15.62} y={11.95} width={1.91} height={1.97} fill="#fff" />
          <rect x={13.32} y={14.08} width={1.91} height={1.97} fill="#fff" />
          <rect x={15.62} y={14.08} width={1.91} height={1.97} fill="#fff" />
          <path
            fill={IMOBILIARE_SHADOW}
            d="M2 22.01 5.12 22.94 12.45 21.46 19.45 21.08 29.23 22.89 22.89 20.64 15.78 19.82 7.85 20.32Z"
          />
          <path
            fill={ICON_COLORS.imobiliare}
            d="M29.56 26.79 23.55 25.53 16.66 25.32 9.71 25.92 2.71 27.39 5.06 28.76 17.91 26.41Z"
          />
        </svg>
      );
    case "startup":
      return (
        <svg {...base}>
          <path fill={ICON_COLORS.startup} d="M5.94 29.84 25.96 29.95 24.54 27.54 21.42 27.21 19.73 25.13 18.14 25.46 17.21 27.1 15.79 26.5 14.42 27.38 13.66 25.57 11.52 25.24 10.21 27.38 7.75 27.54Z" />
          <path fill={ICON_COLORS.startup} d="M13.27 6.21 12.4 10.2 12.73 18.02 13.38 18.13 13.82 19.12 17.92 19.12 19.01 18.08 19.4 10.8 18.52 6.27 15.62 6.76Z" />
          <path fill={ICON_COLORS.startup} d="M11.74 14.47 10.26 15.84 11.25 20.81 12.23 18.68Z" />
          <path fill={ICON_COLORS.startup} d="M20.05 14.47 19.56 18.57 20.55 20.81 21.59 15.89Z" />
          <path fill={ICON_COLORS.startup} d="M13.6 5.39 15.08 5.94 17.1 5.88 18.19 5.55 17.54 4.24 15.9 2 14.64 3.59Z" />
          <path fill={ICON_COLORS.startup} d="M13.66 20.1 18.25 20.1 18.09 19.61 13.82 19.61Z" />
          <path fill={ICON_COLORS.startup} d="M14.31 20.48 14.04 20.7 14.04 23.27 14.2 23.44 14.48 23.44 14.69 23.22 14.69 20.76 14.53 20.54Z" />
          <path fill={ICON_COLORS.startup} d="M15.79 21.74 15.57 21.96 15.57 24.91 15.68 25.08 16.01 25.13 16.23 24.91 16.23 21.96 16.12 21.8Z" />
          <path fill={ICON_COLORS.startup} d="M17.43 20.48 17.16 20.59 17.1 20.76 17.1 23.22 17.32 23.44 17.59 23.44 17.76 23.22 17.76 20.76 17.65 20.54Z" />
          <path fill={ICON_COLORS.startup} d="M15.51 7.63 16.28 7.63 17.1 7.96 17.87 8.73 18.19 9.77 17.76 11.24 16.39 12.17 15.41 12.17 14.59 11.79 13.82 10.91 13.6 10.15 13.71 9.16 14.09 8.51Z" />
          <path fill={ICON_COLORS.startup} d="M15.73 13.81 16.06 13.81 16.28 14.03 16.28 18.3 16.01 18.57 15.68 18.52 15.51 18.3 15.51 14.03Z" />
        </svg>
      );
  }
}

const LONGEST_CYCLE_WORD = "timp pierdut";

export function BrandlyHero({
  ctaHref,
  signInHref,
  signInLabel,
  ctaLabel,
  cycleWord,
  cycleColor,
  cycleVisible,
  onMenuOpen,
}: {
  ctaHref: string;
  signInHref: string;
  signInLabel: string;
  ctaLabel: string;
  cycleWord: string;
  cycleColor: string;
  cycleVisible: boolean;
  onMenuOpen: () => void;
}) {
  return (
    <header className={`brandly-hero ${inter.variable}`}>
      <div className="brandly-hero-bar-wrap">
        <Link href="/" className="brandly-wordmark brandly-display" aria-label="insixlive">insixlive</Link>
        <div className="brandly-hero-bar">
          <nav className="brandly-dp-pill" aria-label="Primary">
            {NAV_LINKS.map(item => (
              <a key={item.href} href={item.href}>{item.label}</a>
            ))}
            <a href={signInHref}>{signInLabel}</a>
            <a href={ctaHref}>
              {ctaLabel}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
          </nav>
          <button type="button" className="brandly-dp-hamburger" onClick={onMenuOpen} aria-label="Deschide meniul">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
        </div>
      </div>

      <div className="brandly-hero-stage">
        <div className="brandly-hero-media-wrap" aria-hidden>
          <video className="brandly-hero-video" src={HERO_VIDEO} autoPlay loop muted playsInline />
          <div className="brandly-hero-gradient" />
        </div>

        <div className="brandly-hero-main">
        <div className="brandly-headline-row">
          <h1 className="brandly-headline brandly-display">
            Zile de muncă
            <br />
            <span className="brandly-headline-last-line">
              economisite. Fără{" "}
              <span className="brandly-cycle-slot">
                <span className="brandly-cycle-ghost" aria-hidden="true">{LONGEST_CYCLE_WORD}</span>
                <span
                  className="brandly-cycle"
                  style={{ color: cycleColor, opacity: cycleVisible ? 1 : 0, transition: "opacity .3s ease, color .3s ease" }}
                >
                  {cycleWord}
                </span>
              </span>
            </span>
          </h1>
          <p className="brandly-stat-top brandly-display">
            Brandul tău online
            <br />
            în șase minute
          </p>
        </div>

        <div className="brandly-mid-row">
          <div className="brandly-mid-left">
            <Link href={ctaHref} className="brandly-cta-pill">
              Începe acum
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </Link>
            <p className="brandly-lead brandly-lead-full">
              Îți publicăm site-ul online în câteva minute — design premium, text personalizat
              și domeniu live, fără agenție și fără săptămâni de așteptare.
            </p>
            <p className="brandly-lead brandly-lead-short">
              Site premium, live în 6 minute — fără agenție, plată unică.
            </p>
            <div className="brandly-social" aria-label="Social media">
              <a href="#facebook" aria-label="Facebook" className="brandly-social-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#instagram" aria-label="Instagram" className="brandly-social-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#youtube" aria-label="YouTube" className="brandly-social-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </a>
            </div>
          </div>
          <p className="brandly-stat-bottom brandly-display">Premium UX și UI Webdesign</p>
        </div>

        <div className="brandly-clients">
          {CLIENTS.map(c => (
            <div key={c.name} className="brandly-client-card">
              <ClientIcon type={c.icon} />
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
      </div>

      <style jsx>{`
        .brandly-hero {
          position: relative;
          display: flex;
          flex-direction: column;
          min-height: 100svh;
          min-height: 100dvh;
          overflow: hidden;
          background: #f5f3ee;
          color: #080808;
          font-family: var(--font-brandly-sans), Inter, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .brandly-hero-stage {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 0;
          padding: 8px 20px 28px;
        }
        @media (min-width: 768px) {
          .brandly-hero-stage { padding: 12px 40px 36px; }
        }
        .brandly-hero-media-wrap {
          position: absolute;
          top: 46%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: min(92vw, 680px);
          height: clamp(210px, 34vh, 400px);
          border-radius: 22px;
          overflow: hidden;
          z-index: 0;
          box-shadow: 0 20px 56px rgba(8, 8, 8, 0.1);
        }
        @media (min-width: 768px) {
          .brandly-hero-media-wrap {
            width: min(72vw, 860px);
            height: clamp(260px, 42vh, 480px);
            border-radius: 28px;
          }
        }
        .brandly-hero-video {
          position: absolute;
          inset: 0;
          z-index: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
        }
        .brandly-hero-gradient {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            linear-gradient(180deg, rgba(245,243,238,0.45) 0%, rgba(245,243,238,0.06) 45%, rgba(245,243,238,0.06) 55%, rgba(245,243,238,0.5) 100%);
        }
        .brandly-hero-bar-wrap,
        .brandly-hero-bar,
        .brandly-hero-main {
          position: relative;
          z-index: 2;
        }
        .brandly-hero-bar-wrap {
          flex-shrink: 0;
          position: relative;
          width: 100%;
          margin: 0;
          padding: 20px 52px 20px 24px;
        }
        @media (min-width: 768px) {
          .brandly-hero-bar-wrap { padding: 24px 40px; }
        }
        .brandly-hero-bar {
          position: absolute;
          top: 0;
          left: 50%;
          width: 100vw;
          height: 100%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .brandly-display {
          font-family: var(--font-display), Anton, system-ui, sans-serif;
          font-weight: 400;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: #080808;
        }
        .brandly-wordmark {
          position: relative;
          z-index: 1;
          display: block;
          margin: 0;
          font-size: clamp(1.75rem, 5vw, 3rem);
          line-height: 0.92;
          text-decoration: none;
        }
        .brandly-wordmark:hover { opacity: 0.88; }
        /* DesignPro transparent pill — centered, compact */
        .brandly-dp-pill {
          display: none;
          align-items: center;
          gap: 1px;
          border: 1px solid rgb(55, 65, 81);
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 9999px;
          padding: 4px;
          pointer-events: auto;
        }
        @media (min-width: 1024px) {
          .brandly-dp-pill { display: flex; }
        }
        .brandly-dp-pill a {
          display: flex;
          align-items: center;
          gap: 3px;
          border-radius: 9999px;
          padding: 5px 11px;
          font-family: var(--font-brandly-sans), Inter, system-ui, sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.82);
          text-decoration: none;
          transition: color 0.2s ease, background 0.2s ease;
          white-space: nowrap;
        }
        .brandly-dp-pill a:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.06);
        }
        .brandly-dp-pill a svg {
          opacity: 0.85;
          transition: transform 0.25s ease;
          flex-shrink: 0;
        }
        .brandly-dp-pill a:hover svg { transform: translateX(3px); }
        .brandly-dp-hamburger {
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          right: max(24px, calc((100vw - min(100vw, 1280px)) / 2 + 24px));
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 9999px;
          border: 1px solid rgb(55, 65, 81);
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #fff;
          cursor: pointer;
          pointer-events: auto;
        }
        @media (min-width: 1024px) {
          .brandly-dp-hamburger { display: none; }
        }
        .brandly-hero-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 28px;
          min-height: 0;
          width: 100%;
          max-width: 920px;
          margin: 0 auto;
          padding: clamp(3.5rem, 14vh, 8rem) 8px 0;
        }
        .brandly-headline-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding-top: clamp(1rem, 4vh, 2.5rem);
          width: 100%;
        }
        .brandly-headline {
          margin: 0;
          flex: none;
          width: 100%;
          max-width: 22ch;
          font-size: clamp(2.25rem, 8vw, 5.5rem);
          line-height: 0.92;
          min-height: 0;
          text-align: center;
        }
        .brandly-headline-last-line {
          white-space: nowrap;
        }
        .brandly-cycle-slot {
          display: inline-grid;
          vertical-align: bottom;
        }
        .brandly-cycle-ghost,
        .brandly-cycle {
          grid-area: 1 / 1;
        }
        .brandly-cycle-ghost {
          visibility: hidden;
          pointer-events: none;
          user-select: none;
        }
        .brandly-cycle { font-weight: 400; }
        .brandly-stat-top,
        .brandly-stat-bottom {
          font-size: clamp(calc(1.125rem - 5px), calc(4.5vw - 5px), calc(3.25rem - 5px));
          line-height: 0.92;
        }
        .brandly-stat-top {
          flex-shrink: 0;
          margin: 0;
          padding-top: 0;
          text-align: center;
        }
        .brandly-mid-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
        }
        @media (min-width: 640px) {
          .brandly-mid-row {
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
        }
        .brandly-mid-left {
          max-width: 32rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .brandly-cta-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          align-self: center;
          border: none;
          border-radius: 9999px;
          background: #080808;
          color: #fff;
          padding: 9px 16px;
          font-family: var(--font-brandly-sans), Inter, system-ui, sans-serif;
          font-size: 13px;
          font-weight: 500;
          line-height: 1;
          text-decoration: none;
          white-space: nowrap;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .brandly-cta-pill:hover { background: rgba(8, 8, 8, 0.9); color: #fff; }
        .brandly-cta-pill svg { flex-shrink: 0; }
        .brandly-lead {
          margin: 0;
          font-size: 14px;
          font-weight: 300;
          line-height: 1.625;
          color: rgba(8, 8, 8, 0.85);
          text-align: center;
        }
        @media (min-width: 768px) {
          .brandly-lead { font-size: 16px; }
        }
        .brandly-social {
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(8, 8, 8, 0.7);
        }
        .brandly-social-link {
          display: flex;
          color: inherit;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .brandly-social-link:hover { color: #080808; }
        .brandly-stat-bottom {
          margin: 0;
          text-align: center;
        }
        .brandly-clients {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          width: 100%;
          max-width: 720px;
        }
        @media (min-width: 640px) {
          .brandly-clients { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 768px) {
          .brandly-clients { grid-template-columns: repeat(6, 1fr); gap: 16px; }
        }
        .brandly-client-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 12px;
          border: 1px solid rgba(8, 8, 8, 0.1);
          background: rgba(255, 255, 255, 0.42);
          padding: 16px 12px;
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          color: rgba(8, 8, 8, 0.9);
        }
        .brandly-client-card span {
          font-size: 12px;
          font-weight: 500;
          text-align: center;
          line-height: 1.25;
        }
        .brandly-lead-short { display: none; }

        /* ── Mobile: simplified hero ── */
        @media (max-width: 767px) {
          .brandly-hero {
            height: auto;
            min-height: 100svh;
            min-height: 100dvh;
            overflow: hidden;
          }
          .brandly-hero-stage {
            position: relative;
            flex: 1;
            min-height: calc(100svh - 52px);
            min-height: calc(100dvh - 52px);
            padding: 0 16px 20px;
            justify-content: flex-start;
          }
          .brandly-hero-media-wrap {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -52%);
            width: min(94vw, 520px);
            height: clamp(200px, 36vh, 340px);
            border-radius: 18px;
          }
          .brandly-hero-bar-wrap {
            padding: 16px 56px 16px 20px;
          }
          .brandly-hero-main {
            position: absolute;
            inset: 0;
            flex: none;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
            gap: 18px;
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 0 12px clamp(1.25rem, 6vh, 2.5rem) !important;
          }
          .brandly-headline-row {
            gap: 0;
            padding-top: 0 !important;
            margin-bottom: 4px;
          }
          .brandly-headline {
            font-size: clamp(2.1rem, 10vw, 3rem);
            max-width: none;
          }
          .brandly-headline-last-line {
            white-space: normal;
          }
          .brandly-cycle-slot {
            display: inline;
          }
          .brandly-cycle-ghost {
            display: none;
          }
          .brandly-stat-top,
          .brandly-stat-bottom,
          .brandly-social,
          .brandly-clients {
            display: none;
          }
          .brandly-mid-row {
            gap: 16px;
          }
          .brandly-mid-left {
            max-width: none;
            gap: 14px;
          }
          .brandly-lead-full { display: none; }
          .brandly-lead-short { display: block; }
          .brandly-lead {
            font-size: 15px;
            line-height: 1.55;
            max-width: 34ch;
            text-align: center;
          }
          .brandly-cta-pill {
            padding: 12px 20px;
            font-size: 14px;
          }
        }

        @media (max-width: 380px) {
          .brandly-headline {
            font-size: clamp(2rem, 10.5vw, 2.65rem);
          }
          .brandly-wordmark {
            font-size: 1.5rem;
          }
        }
      `}</style>
      <style jsx global>{`
        .brandly-hero a.brandly-cta-pill {
          display: inline-flex !important;
          align-items: center;
          gap: 6px;
          border-radius: 9999px;
          background: #080808 !important;
          color: #fff !important;
          padding: 9px 16px;
          font-family: var(--font-brandly-sans), Inter, system-ui, sans-serif;
          font-size: 13px;
          font-weight: 500;
          line-height: 1;
          text-decoration: none !important;
          white-space: nowrap;
        }
        .brandly-hero a.brandly-cta-pill:hover {
          background: rgba(8, 8, 8, 0.9) !important;
          color: #fff !important;
        }
        .brandly-hero a.brandly-wordmark {
          color: #080808;
          text-decoration: none;
        }
      `}</style>
    </header>
  );
}
