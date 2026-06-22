"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DM_Sans } from "next/font/google";
import type { HomeCopy } from "./copy";

// ─── insixlive Website (Awesomic) — ported from Claude Design ─────────────
// Source: claude.ai/design/p/019e130a-b156-7a53-9abe-2feed797f07c
//         files "insixlive Website (Awesomic).html" / "... RO (Awesomic).html"
const cosmica = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-cosmica" });

const LOGOS = ["Acme Plumbing", "Maria's Hair", "Lia Photo", "Bistro Marin", "Kohl Dental", "Forge Fitness", "Sole Café"];

const FEATURE_ICONS: { d: string; circle?: boolean }[] = [
  { d: "M12 3v18M3 12h18 M5 7l14 10M5 17l14-10" },
  { d: "M3 16l9-13 9 13H3z M8 16h8" },
  { d: "M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" },
  { d: "M12 7v5l3 2", circle: true },
  { d: "M3 12h18M12 3a13 13 0 010 18M12 3a13 13 0 000 18", circle: true },
  { d: "M3 12L12 3l9 9-9 9z" },
];

const STEP_NUMS = ["01", "02", "03", "04", "05", "06"];

const DP_NAV = [
  { label: "Home",          href: "/" },
  { label: "About Us",      href: "/about" },
  { label: "Courses",       href: "/courses" },
  { label: "Instructors",   href: "/instructors" },
  { label: "Testimonials",  href: "/testimonials" },
  { label: "Blog",          href: "/blog" },
  { label: "Contact us",    href: "/contact", arrow: true },
] as const;

const TILE_VISUALS: { bg: string; glow?: string; tagColor?: string; orchid?: boolean }[] = [
  { bg: "linear-gradient(160deg,#1a0e09,#09090b)", glow: "radial-gradient(80% 60% at 50% 30%, rgba(255,90,0,0.45), transparent 70%)" },
  { bg: "linear-gradient(160deg,#f4f4f5,#d4d4d8)", tagColor: "rgba(0,0,0,0.4)" },
  { bg: "", orchid: true },
  { bg: "linear-gradient(160deg,#241a10,#09090b)", glow: "radial-gradient(80% 60% at 50% 40%, rgba(251,191,36,0.32), transparent 70%)" },
  { bg: "linear-gradient(160deg,#eae6dd,#cfc8b8)", tagColor: "rgba(0,0,0,0.4)" },
  { bg: "linear-gradient(160deg,#0a1a12,#09090b)", glow: "radial-gradient(80% 60% at 50% 40%, rgba(74,222,128,0.3), transparent 70%)" },
];

function CheckMark() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3.5 3.5L13 5"/></svg>;
}
function ArrowIcon() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>;
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function HomePage({ copy }: { copy: HomeCopy }) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [cycleIdx, setCycleIdx] = useState(0);
  const [cycleVisible, setCycleVisible] = useState(true);
  const [heroEmail, setHeroEmail] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setLoggedIn(!!d.user)).catch(() => setLoggedIn(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setCycleVisible(false);
      setTimeout(() => {
        setCycleIdx(i => (i + 1) % copy.hero.cycleWords.length);
        setCycleVisible(true);
      }, 300);
    }, 2600);
    return () => clearInterval(t);
  }, [copy.hero.cycleWords.length]);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
  }, []);

  const ctaHref = loggedIn ? "/dashboard" : "/signup";
  const signInHref = loggedIn ? "/dashboard" : "/login";
  const signInLabel = loggedIn ? copy.dashboardLabel : copy.signIn;
  const primaryLabel = loggedIn ? copy.dashboardLabel : copy.getStarted;

  const handleHeroEmailSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(heroEmail ? `/signup?email=${encodeURIComponent(heroEmail)}` : "/signup");
  };

  return (
    <div className={cosmica.variable}>
      <style>{`
        :root {
          --color-obsidian: #09090b;
          --color-ink: #18181b;
          --color-graphite: #3f3f46;
          --color-slate: #52525b;
          --color-steel: #71717a;
          --color-ash: #a1a1aa;
          --color-pebble: #d4d4d8;
          --color-fog: #ececee;
          --color-mist: #f4f4f5;
          --color-snow: #ffffff;
          --color-ember: #ff5a00;
          --color-orchid-flash: #fe45e2;

          --font-cosmica: var(--font-cosmica), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

          --text-caption: 10px;
          --text-body: 14px;
          --text-body-lg: 16px;
          --text-subheading: 18px;
          --text-heading-sm: 20px;
          --text-heading: 32px;
          --text-heading-lg: 40px;
          --text-display-sm: 56px;
          --text-display: 64px;

          --page-max-width: 1200px;
          --section-gap: 80px;

          --radius-hero: 48px;
          --radius-pill: 10000px;
          --radius-card: 36px;
          --radius-card-compact: 28px;
          --radius-icon: 40px;
          --radius-badge: 12px;
          --radius-input: 14px;

          --shadow-primary: rgba(255, 255, 255, 0.5) 0px 0.5px 0px 0px inset,
                            rgba(117, 123, 133, 0.4) 0px 9px 14px -5px inset,
                            rgb(44, 46, 52) 0px 0px 0px 1.5px,
                            rgba(0, 0, 0, 0.14) 0px 4px 6px 0px;
          --shadow-card-inset: rgb(228, 228, 231) 0px 1px 0px 0px inset;
          --shadow-card-hi: rgb(255, 255, 255) 0px 0.5px 0px 0px inset;
          --shadow-md: rgba(0, 0, 0, 0.04) 0px 4px 12px 0px;

          --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        html, body { margin: 0; padding: 0; }
        body {
          background: var(--color-mist);
          font-family: var(--font-cosmica);
          color: var(--color-ink);
          font-size: var(--text-body-lg);
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }
        .aw a { color: inherit; text-decoration: none; }
        .aw button { font-family: inherit; cursor: pointer; }
        .aw img { display: block; max-width: 100%; }

        .aw .container { max-width: var(--page-max-width); margin: 0 auto; padding: 0 24px; }

        .aw .eyebrow { display: inline-block; font-size: var(--text-caption); font-weight: 600; text-transform: uppercase; letter-spacing: 0.14em; color: var(--color-steel); margin-bottom: 20px; }
        .aw .display { font-size: var(--text-display); line-height: 1; font-weight: 700; color: var(--color-obsidian); margin: 0; }
        .aw .display-sm { font-size: var(--text-display-sm); line-height: 1.06; font-weight: 700; color: var(--color-obsidian); margin: 0; }
        .aw .heading-lg { font-size: var(--text-heading-lg); line-height: 1.18; font-weight: 700; color: var(--color-obsidian); margin: 0; }
        .aw .heading { font-size: var(--text-heading); line-height: 1.2; font-weight: 700; color: var(--color-obsidian); margin: 0; }
        .aw .lead { font-size: var(--text-body-lg); line-height: 1.6; color: var(--color-steel); margin: 18px 0 0; max-width: 56ch; }
        .aw .light { font-weight: 300; }
        .aw .muted-fg { color: var(--color-ash); }
        .aw .on-dark { color: var(--color-snow); }
        .aw .on-dark .lead { color: var(--color-ash); }
        .aw .on-dark .heading, .aw .on-dark .heading-lg, .aw .on-dark .display, .aw .on-dark .display-sm { color: var(--color-snow); }
        .aw .on-dark .eyebrow { color: var(--color-ash); }

        .aw .btn { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-cosmica); white-space: nowrap; transition: transform .25s var(--ease-spring), opacity .25s ease; border: none; }
        .aw .btn:active { transform: scale(0.97); }
        .aw .btn-primary { background: var(--color-obsidian); color: var(--color-snow); font-size: var(--text-body); font-weight: 500; border: none; border-radius: var(--radius-card); padding: 13px 20px; box-shadow: var(--shadow-primary); }
        .aw .btn-primary:hover { transform: translateY(-1px); }
        .aw .btn-outline { background: var(--color-snow); color: var(--color-graphite); font-size: var(--text-body); font-weight: 500; border: 1px solid var(--color-graphite); border-radius: var(--radius-card); padding: 12px 20px; }
        .aw .btn-outline:hover { background: var(--color-mist); }
        .aw .btn-dark-rect { background: var(--color-obsidian); color: var(--color-snow); font-size: var(--text-body); font-weight: 500; border: 1px solid rgba(255,255,255,0.2); border-radius: 16px; padding: 13px 18px; }
        .aw .btn-ghost { background: transparent; color: var(--color-ink); font-size: var(--text-body); font-weight: 500; border: none; padding: 12px 4px; }
        .aw .btn-ghost svg { transition: transform .25s var(--ease-spring); }
        .aw .btn-ghost:hover svg { transform: translateX(4px); }

        .aw .badge { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 500; border-radius: var(--radius-badge); padding: 4px 8px; line-height: 1.2; }
        .aw .badge-dark { background: var(--color-graphite); color: #fafafa; }
        .aw .badge-overlay { background: transparent; color: var(--color-snow); border: 1px solid rgba(255,255,255,0.35); backdrop-filter: blur(6px); }
        .aw .badge-ember { background: var(--color-ember); color: var(--color-snow); font-weight: 600; }

        .aw .card { background: var(--color-snow); border-radius: var(--radius-card); padding: 28px; box-shadow: var(--shadow-card-hi), var(--shadow-card-inset); }
        .aw .card-muted { background: var(--color-fog); border-radius: var(--radius-card-compact); padding: 24px; }
        .aw .dark-panel { background: var(--color-obsidian); border-radius: var(--radius-card); color: var(--color-snow); }

        .aw section { position: relative; }
        .aw .pad-y { padding: 80px 0; }

        .aw .icon-tile { width: 48px; height: 48px; border-radius: 16px; background: var(--color-mist); display: flex; align-items: center; justify-content: center; color: var(--color-ink); flex-shrink: 0; }
        .aw .dark-panel .icon-tile { background: rgba(255,255,255,0.06); color: var(--color-snow); }

        .aw .banner { margin: 16px auto 0; max-width: calc(var(--page-max-width) - 48px); background: rgba(24,24,27,0.92); color: var(--color-snow); border-radius: var(--radius-hero); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; gap: 14px; padding: 10px 22px; font-size: var(--text-body); font-weight: 400; flex-wrap: wrap; text-align: center; }
        .aw .banner .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--color-ember); flex-shrink: 0; }
        .aw .banner a { color: var(--color-ash); font-weight: 500; display: inline-flex; align-items: center; gap: 4px; }
        .aw .banner a:hover { color: var(--color-snow); }

        /* ── DesignPro fixed nav ── */
        .dp-nav-header { position: fixed; inset: 0; bottom: auto; z-index: 50; padding: 16px 24px; pointer-events: none; }
        .dp-nav-inner { max-width: 1280px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; pointer-events: auto; }
        .dp-logo { display: flex; align-items: center; gap: 10px; color: #fff; text-decoration: none; flex-shrink: 0; }
        .dp-logo-mark { width: 36px; height: 36px; border-radius: 50%; border: 2px solid #fff; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .dp-logo-mark span { width: 38%; height: 38%; border-radius: 50%; background: #fff; display: block; }
        .dp-logo-name { font-size: 15px; font-weight: 600; letter-spacing: -0.01em; color: #fff; }
        .dp-pill { display: flex; align-items: center; gap: 2px; border: 1px solid rgb(55,65,81); background: rgba(0,0,0,0.35); backdrop-filter: blur(8px); border-radius: 9999px; padding: 6px; }
        .dp-pill a { display: flex; align-items: center; gap: 4px; border-radius: 9999px; padding: 6px 14px; font-size: 14px; color: rgba(255,255,255,0.8); text-decoration: none; transition: color .2s ease; white-space: nowrap; }
        .dp-pill a:hover { color: #fff; }
        .dp-pill a svg { opacity: 0.8; transition: transform .25s ease; }
        .dp-pill a:hover svg { transform: translateX(3px); }
        .dp-hamburger { display: none; border: 1px solid rgb(55,65,81); background: rgba(0,0,0,0.35); backdrop-filter: blur(8px); border-radius: 9999px; width: 40px; height: 40px; align-items: center; justify-content: center; color: #fff; cursor: pointer; }
        /* mobile overlay */
        .dp-backdrop { position: fixed; inset: 0; z-index: 60; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); opacity: 0; transition: opacity .25s ease; pointer-events: none; }
        .dp-backdrop.open { opacity: 1; pointer-events: auto; }
        .dp-drawer { position: fixed; right: 0; top: 0; z-index: 70; height: 100dvh; width: min(88vw,320px); transform: translateX(100%); transition: transform .35s cubic-bezier(0.22,1,0.36,1); border-left: 1px solid rgb(55,65,81); background: rgba(0,0,0,0.95); backdrop-filter: blur(12px); display: flex; flex-direction: column; }
        .dp-drawer.open { transform: translateX(0); }
        .dp-drawer-head { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgb(31,41,55); padding: 16px 20px; }
        .dp-drawer-links { display: flex; flex-direction: column; gap: 4px; padding: 24px 16px; }
        .dp-drawer-links a { display: flex; align-items: center; gap: 8px; border-radius: 12px; padding: 12px; font-size: 16px; font-weight: 500; color: rgba(255,255,255,0.9); text-decoration: none; transition: background .2s ease; }
        .dp-drawer-links a:hover { background: rgba(255,255,255,0.05); }
        .dp-close { background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 9999px; }
        @media (max-width: 1024px) { .dp-pill { display: none; } .dp-hamburger { display: flex; } }

        /* ── Video hero ── */
        .aw .hero { position: relative; height: 100vh; min-height: 640px; display: flex; flex-direction: column; overflow: hidden; padding: 0; }
        .aw .hero-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
        .aw .hero-vignette { position: absolute; inset: 0; pointer-events: none; z-index: 1; background: linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.48) 40%, rgba(0,0,0,0.84) 100%); }
        .aw .hero-inner { position: relative; z-index: 10; display: flex; flex-direction: column; height: 100%; padding: 36px 0 32px; }
        .aw .hero-top-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        /* ── ShinyText ── */
        @keyframes aw-shiny { from { background-position: 200% 0%; } to { background-position: -200% 0%; } }
        .aw .shiny-text { display: inline; background-image: linear-gradient(100deg, #64CEFB 0%, #64CEFB 30%, #ffffff 50%, #64CEFB 70%, #64CEFB 100%); background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; animation: aw-shiny 3s linear infinite; transition: opacity .3s ease; }
        /* ── Email row (works on both dark hero and page) ── */
        .aw .email-row { display: flex; gap: 8px; margin-top: 22px; max-width: 460px; }
        .aw .email-row input { flex: 1; min-width: 0; background: rgba(255,255,255,0.12); color: var(--color-snow); border: 1px solid rgba(255,255,255,0.28); border-radius: var(--radius-input); padding: 13px 16px; font-family: var(--font-cosmica); font-size: var(--text-body); font-weight: 400; outline: none; backdrop-filter: blur(8px); }
        .aw .email-row input::placeholder { color: rgba(255,255,255,0.5); }
        .aw .email-row input:focus { outline: none; border-color: rgba(255,255,255,0.6); }

        .aw .logo-strip { overflow: hidden; padding: 28px 0; -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
        .aw .logo-track { display: flex; gap: 56px; width: max-content; animation: aw-scroll-left 34s linear infinite; }
        .aw .logo-track .logo { font-size: var(--text-heading-sm); font-weight: 600; color: var(--color-ash); white-space: nowrap; }
        @keyframes aw-scroll-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .aw .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .aw .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .aw .feature h3 { font-size: var(--text-heading-sm); font-weight: 600; margin: 18px 0 6px; color: var(--color-obsidian); }
        .aw .feature p { font-size: var(--text-body); color: var(--color-steel); line-height: 1.56; margin: 0; }

        .aw .problem-row { display: flex; align-items: center; gap: 16px; padding: 18px 0; border-top: 1px solid rgba(255,255,255,0.08); }
        .aw .problem-row:first-child { border-top: none; }
        .aw .problem-row .dotmark { width: 28px; height: 28px; border-radius: 50%; background: var(--color-graphite); flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .aw .problem-row .dotmark span { width: 8px; height: 8px; border-radius: 50%; background: var(--color-ash); }
        .aw .problem-row p { margin: 0; font-size: var(--text-subheading); line-height: 1.45; }
        .aw .problem-row .li { color: var(--color-ash); font-weight: 300; }
        .aw .problem-row .key { color: var(--color-snow); font-weight: 600; }

        .aw .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .aw .step { background: var(--color-snow); border-radius: var(--radius-card-compact); padding: 24px; box-shadow: var(--shadow-card-inset); position: relative; }
        .aw .step .num { font-size: var(--text-caption); font-weight: 700; letter-spacing: 0.1em; color: var(--color-steel); margin-bottom: 14px; }
        .aw .step.live .num { color: var(--color-ember); }
        .aw .step h4 { font-size: var(--text-subheading); font-weight: 600; margin: 0 0 4px; color: var(--color-obsidian); }
        .aw .step p { font-size: var(--text-body); color: var(--color-steel); margin: 0; line-height: 1.5; }

        .aw .tiles { display: flex; gap: 18px; overflow-x: auto; padding: 8px 24px 24px; scroll-snap-type: x mandatory; -ms-overflow-style: none; scrollbar-width: none; }
        .aw .tiles::-webkit-scrollbar { display: none; }
        .aw .tile { position: relative; flex-shrink: 0; width: 320px; height: 440px; border-radius: var(--radius-card); overflow: hidden; scroll-snap-align: start; display: flex; flex-direction: column; justify-content: flex-end; transition: transform .3s var(--ease-spring); }
        .aw .tile:hover { transform: translateY(-6px); }
        .aw .tile .scrim { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.72)); z-index: 1; }
        .aw .tile .preview-tag { position: absolute; top: 18px; left: 18px; z-index: 2; font-size: var(--text-caption); letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.6); font-weight: 600; }
        .aw .tile .body { position: relative; z-index: 2; padding: 22px; }
        .aw .tile .t-title { font-size: var(--text-heading-sm); font-weight: 600; color: var(--color-snow); margin: 0 0 10px; }
        .aw .tile .t-badges { display: flex; gap: 6px; flex-wrap: wrap; }
        .aw .tile.orchid { background: var(--color-orchid-flash); justify-content: center; align-items: flex-start; padding: 36px; }
        .aw .tile.orchid .scrim { display: none; }
        .aw .tile.orchid .decor { font-size: var(--text-display-sm); line-height: 1.05; font-weight: 700; color: var(--color-snow); margin: 0; }
        .aw .tile.orchid .preview-tag { color: rgba(255,255,255,0.7); }

        .aw .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .aw .stat .num { font-size: var(--text-heading-lg); font-weight: 700; color: var(--color-obsidian); line-height: 1; letter-spacing: -0.02em; }
        .aw .stat .lbl { font-size: 13px; font-weight: 400; color: var(--color-steel); margin-top: 8px; line-height: 1.4; }
        .aw .on-dark .stat .num { color: var(--color-snow); }
        .aw .on-dark .stat .lbl { color: var(--color-ash); }

        .aw .compare { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 44px; }
        .aw .compare .col-head { font-size: var(--text-caption); font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--color-steel); margin-bottom: 14px; }
        .aw .compare .price { font-size: var(--text-heading); font-weight: 700; letter-spacing: -0.02em; margin-bottom: 2px; }
        .aw .compare .price-sub { font-size: var(--text-body); color: var(--color-steel); margin-bottom: 22px; }
        .aw .compare .row { display: flex; gap: 10px; align-items: flex-start; padding: 9px 0; font-size: var(--text-body); }
        .aw .compare .x { color: var(--color-ember); flex-shrink: 0; margin-top: 2px; }
        .aw .compare .check { color: #4ade80; flex-shrink: 0; margin-top: 2px; }
        .aw .compare .ins .price, .aw .compare .ins .row { color: var(--color-snow); }
        .aw .compare .ins .price-sub { color: var(--color-ash); }

        .aw .plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; align-items: stretch; }
        .aw .plan { position: relative; display: flex; flex-direction: column; }
        .aw .plan .pname { font-size: var(--text-caption); font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--color-steel); }
        .aw .plan .pamount { font-size: var(--text-display-sm); font-weight: 700; letter-spacing: -0.03em; line-height: 1; margin: 14px 0 2px; }
        .aw .plan .pamount small { font-size: var(--text-body); font-weight: 400; color: var(--color-steel); letter-spacing: 0; }
        .aw .plan .ptag { font-size: var(--text-body); color: var(--color-steel); margin-bottom: 22px; }
        .aw .plan ul { list-style: none; margin: 0 0 24px; padding: 0; display: flex; flex-direction: column; gap: 11px; flex: 1; }
        .aw .plan li { display: flex; gap: 10px; align-items: flex-start; font-size: var(--text-body); color: var(--color-graphite); }
        .aw .plan li .tick { width: 18px; height: 18px; border-radius: 9px; background: var(--color-mist); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .aw .plan .pafter { margin-top: 14px; font-size: 12px; color: var(--color-steel); text-align: center; }
        .aw .plan.featured { background: var(--color-obsidian); color: var(--color-snow); border-radius: var(--radius-card); padding: 32px 28px; overflow: hidden; }
        .aw .plan.featured .pamount, .aw .plan.featured li { color: var(--color-snow); }
        .aw .plan.featured .pname, .aw .plan.featured .ptag, .aw .plan.featured .pamount small, .aw .plan.featured .pafter { color: var(--color-ash); }
        .aw .plan.featured li .tick { background: rgba(255,255,255,0.08); }
        .aw .plan-head { display: flex; align-items: center; justify-content: space-between; }

        .aw .domain-card { display: flex; flex-direction: column; gap: 12px; }
        .aw .domain-bar { display: flex; align-items: center; gap: 12px; background: var(--color-snow); border-radius: var(--radius-input); padding: 14px 18px; box-shadow: var(--shadow-card-inset); }
        .aw .domain-bar .lock { color: var(--color-steel); }
        .aw .domain-bar .url { font-size: var(--text-body-lg); font-weight: 500; }
        .aw .domain-bar .url b { color: var(--color-obsidian); }
        .aw .domain-bar .url span { color: var(--color-ash); }
        .aw .domain-bar .status { margin-left: auto; font-size: 12px; font-weight: 600; color: #16a34a; display: inline-flex; align-items: center; gap: 6px; }

        .aw .quote-card { display: flex; flex-direction: column; }
        .aw .quote-card .qmark { font-size: 44px; line-height: 0.6; font-weight: 700; color: var(--color-pebble); height: 24px; }
        .aw .quote-card p { font-size: var(--text-body-lg); line-height: 1.55; color: var(--color-ink); margin: 0 0 22px; flex: 1; }
        .aw .quote-card .who { display: flex; align-items: center; gap: 12px; }
        .aw .quote-card .av { width: 38px; height: 38px; border-radius: 50%; background: var(--color-fog); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: var(--color-ink); flex-shrink: 0; }
        .aw .quote-card .nm { font-size: var(--text-body); font-weight: 600; }
        .aw .quote-card .bz { font-size: 12px; color: var(--color-steel); }

        .aw .faq { margin-top: 36px; border-top: 1px solid var(--color-fog); }
        .aw .faq-item { border-bottom: 1px solid var(--color-fog); }
        .aw .faq-q { width: 100%; background: none; border: none; text-align: left; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 22px 4px; font-size: var(--text-subheading); font-weight: 500; color: var(--color-obsidian); }
        .aw .faq-q .pm { width: 22px; height: 22px; flex-shrink: 0; position: relative; }
        .aw .faq-q .pm::before, .aw .faq-q .pm::after { content: ""; position: absolute; background: var(--color-steel); transition: transform .3s var(--ease-spring), opacity .3s ease; }
        .aw .faq-q .pm::before { left: 4px; right: 4px; top: 50%; height: 1.5px; transform: translateY(-50%); }
        .aw .faq-q .pm::after { top: 4px; bottom: 4px; left: 50%; width: 1.5px; transform: translateX(-50%); }
        .aw .faq-item.open .pm::after { transform: translateX(-50%) scaleY(0); opacity: 0; }
        .aw .faq-a { display: grid; grid-template-rows: 0fr; overflow: hidden; transition: grid-template-rows .35s ease; }
        .aw .faq-a > p { margin: 0; padding: 0 48px 22px 4px; font-size: var(--text-body-lg); line-height: 1.6; color: var(--color-steel); min-height: 0; overflow: hidden; }
        .aw .faq-item.open .faq-a { grid-template-rows: 1fr; }

        .aw .final { text-align: center; }
        .aw .final .display-sm { margin: 0 auto 22px; max-width: 14ch; }
        .aw .final .cta-row { display: flex; gap: 12px; justify-content: center; margin-top: 8px; flex-wrap: wrap; }

        .aw footer { padding: 64px 0 40px; }
        .aw .foot-top { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 32px; padding-bottom: 40px; border-bottom: 1px solid var(--color-fog); }
        .aw .foot-col h5 { font-size: var(--text-caption); text-transform: uppercase; letter-spacing: 0.12em; color: var(--color-steel); margin: 0 0 16px; font-weight: 700; }
        .aw .foot-col a { display: block; font-size: var(--text-body); color: var(--color-ink); padding: 6px 0; }
        .aw .foot-col a:hover { color: var(--color-ember); }
        .aw .foot-bottom { display: flex; align-items: center; justify-content: space-between; padding-top: 24px; flex-wrap: wrap; gap: 12px; }
        .aw .foot-bottom span { font-size: 12px; color: var(--color-steel); }

        .aw .reveal { opacity: 0; transform: translateY(18px); }
        .aw .reveal.in { opacity: 1; transform: translateY(0); transition: opacity .6s ease, transform .6s var(--ease-spring); }
        @media (prefers-reduced-motion: reduce) {
          .aw .reveal { opacity: 1; transform: none; }
          .aw .logo-track { animation: none; }
        }

        @media (max-width: 920px) {
          .aw-mobile-scale { --text-display: 44px; --text-display-sm: 38px; --text-heading-lg: 32px; --text-heading: 26px; }
          .aw .hero-top-row, .aw .grid-3, .aw .grid-2, .aw .steps, .aw .stats, .aw .compare, .aw .plans, .aw .foot-top { grid-template-columns: 1fr; }
          .aw .hero-top-row p:last-child { text-align: left; }
          .aw .stats { grid-template-columns: 1fr 1fr; }
          .aw .nav .links { display: none; }
          .aw .email-row { max-width: 100%; }
        }
      `}</style>

      <div className={`aw aw-mobile-scale ${cosmica.variable}`}>
        {/* ─── Nav (DesignPro fixed dark pill) ─── */}
        <header className="dp-nav-header">
          <div className="dp-nav-inner">
            {/* Logo */}
            <a className="dp-logo" href="/" aria-label="insixlive home">
              <span className="dp-logo-mark"><span /></span>
              <span className="dp-logo-name">insixlive</span>
            </a>

            {/* Desktop pill */}
            <nav className="dp-pill" aria-label="Primary">
              {DP_NAV.map(item => (
                <a key={item.href} href={item.href}>
                  {item.label}
                  {"arrow" in item && item.arrow && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                  )}
                </a>
              ))}
            </nav>

            {/* Mobile hamburger */}
            <button className="dp-hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
          </div>
        </header>

        {/* Mobile backdrop */}
        <div className={`dp-backdrop${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)} aria-hidden />

        {/* Mobile drawer */}
        <aside className={`dp-drawer${menuOpen ? " open" : ""}`} aria-label="Mobile menu">
          <div className="dp-drawer-head">
            <a className="dp-logo" href="/" onClick={() => setMenuOpen(false)}>
              <span className="dp-logo-mark"><span /></span>
              <span className="dp-logo-name">insixlive</span>
            </a>
            <button className="dp-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <nav className="dp-drawer-links">
            {DP_NAV.map(item => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
                {"arrow" in item && item.arrow && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                )}
              </a>
            ))}
          </nav>
        </aside>

        <span id="top"></span>

        {/* ─── Hero ─── */}
        <header className="hero">
          {/* Background video */}
          <video autoPlay loop muted playsInline className="hero-video">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4" type="video/mp4" />
          </video>
          <div className="hero-vignette" aria-hidden />

          <div className="container hero-inner">
            {/* Top two-col info row */}
            <div className="hero-top-row">
              <p style={{ fontSize: "var(--text-body)", color: "rgba(255,255,255,0.72)", margin: 0, lineHeight: 1.55, maxWidth: "44ch" }}>
                {copy.hero.lead}
              </p>
              <p style={{ fontSize: "var(--text-body)", color: "rgba(255,255,255,0.72)", margin: 0, textAlign: "right" as const, fontWeight: 500 }}>
                {copy.hero.liveIn}&nbsp;&nbsp;·&nbsp;&nbsp;{copy.hero.oneTimeFrom}
              </p>
            </div>

            {/* Centre — headline + form */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" as const }}>
              <p style={{ fontSize: "var(--text-body)", textTransform: "uppercase" as const, letterSpacing: "0.14em", color: "rgba(255,255,255,0.65)", margin: "0 0 24px", fontWeight: 600 }}>
                {copy.hero.previewLabel}
              </p>
              <h1 className="reveal" style={{ fontSize: "clamp(2.8rem, 8vw, 7rem)", fontWeight: 700, lineHeight: 0.9, letterSpacing: "-0.02em", color: "var(--color-snow)", margin: 0 }}>
                <span style={{ display: "block" }}>{copy.hero.headline1}</span>
                <span style={{ display: "block" }}>
                  {copy.hero.headlineLead}<span className="shiny-text" style={{ opacity: cycleVisible ? 1 : 0 }}>{copy.hero.cycleWords[cycleIdx]}</span>
                </span>
              </h1>
              <form className="email-row reveal" onSubmit={handleHeroEmailSubmit} style={{ justifyContent: "center", maxWidth: 460 }}>
                <input type="email" required value={heroEmail} onChange={e => setHeroEmail(e.target.value)} placeholder={copy.hero.emailPlaceholder} aria-label="Email" />
                <button className="btn btn-primary" type="submit">{copy.hero.submitLabel}</button>
              </form>
            </div>

            {/* Bottom badges */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              <span className="badge badge-overlay">app/page.tsx</span>
              <span className="badge badge-overlay">{copy.hero.deployReady}</span>
            </div>
          </div>
        </header>

        {/* ─── Logo strip ─── */}
        <div className="logo-strip">
          <div className="logo-track">
            {[...LOGOS, ...LOGOS].map((l, i) => <span className="logo" key={`${l}-${i}`}>{l}</span>)}
          </div>
        </div>

        {/* ─── Dark problem panel ─── */}
        <section className="pad-y">
          <div className="container">
            <div className="dark-panel reveal" style={{ padding: 56 }}>
              <div className="grid-2" style={{ gap: 56, alignItems: "center" }}>
                <div>
                  <span className="eyebrow" style={{ color: "var(--color-ash)" }}>{copy.problem.eyebrow}</span>
                  <h2 className="heading on-dark" style={{ color: "var(--color-snow)" }}>{copy.problem.heading[0]}<br/><span className="muted-fg light">{copy.problem.heading[1]}</span></h2>
                  <p className="lead" style={{ color: "var(--color-ash)" }}>{copy.problem.lead}</p>
                </div>
                <div>
                  {copy.problem.rows.map(([lead, key]) => (
                    <div className="problem-row" key={key}><span className="dotmark"><span></span></span><p><span className="li">{lead}</span> <span className="key">{key}</span></p></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Solution feature cards ─── */}
        <section className="pad-y" id="solution">
          <div className="container">
            <div className="reveal">
              <span className="eyebrow">{copy.solution.eyebrow}</span>
              <h2 className="heading-lg">{copy.solution.heading[0]}<br/><span className="muted-fg light">{copy.solution.heading[1]}</span></h2>
              <p className="lead">{copy.solution.lead}</p>
            </div>
            <div className="grid-3" style={{ marginTop: 48 }}>
              {copy.solution.features.map((f, i) => (
                <div className="card feature reveal" key={f.t}>
                  <div className="icon-tile"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{FEATURE_ICONS[i]?.circle && <circle cx="12" cy="12" r="9"/>}<path d={FEATURE_ICONS[i]?.d}/></svg></div>
                  <h3>{f.t}</h3>
                  <p>{f.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How it works ─── */}
        <section className="pad-y" id="how" style={{ background: "var(--color-snow)" }}>
          <div className="container">
            <div className="reveal">
              <span className="eyebrow">{copy.how.eyebrow}</span>
              <h2 className="heading-lg">{copy.how.heading[0]}<br/><span className="muted-fg light">{copy.how.heading[1]}</span></h2>
              <p className="lead">{copy.how.lead}</p>
            </div>
            <div className="steps" style={{ marginTop: 48 }}>
              {copy.how.steps.map(([t, s], i) => (
                <div className={`step reveal${i === copy.how.steps.length - 1 ? " live" : ""}`} key={STEP_NUMS[i]} style={i === copy.how.steps.length - 1 ? { position: "relative", overflow: "hidden" } : undefined}>
                  <div className="num">{STEP_NUMS[i]}</div>
                  <h4>{t}</h4>
                  <p>{s}</p>
                  {i === copy.how.steps.length - 1 && <span className="badge badge-ember" style={{ position: "absolute", top: 20, right: 20 }}>{copy.how.liveBadge}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Portfolio tiles ─── */}
        <section className="pad-y" id="examples">
          <div className="container" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
            <div className="reveal">
              <span className="eyebrow">{copy.examples.eyebrow}</span>
              <h2 className="heading-lg">{copy.examples.heading[0]}<br/>{copy.examples.heading[1]}</h2>
            </div>
            <a className="btn btn-outline reveal" href="#pricing">{copy.examples.viewAll} <ArrowIcon/></a>
          </div>

          <div className="tiles" style={{ marginTop: 40 }}>
            {copy.examples.tiles.map((tile, i) => TILE_VISUALS[i]?.orchid ? (
              <div className="tile orchid" key={`orchid-${i}`}>
                <span className="preview-tag">// {copy.examples.decorativeTag}</span>
                <p className="decor">{copy.examples.decorText[0]}<br/>{copy.examples.decorText[1]}</p>
              </div>
            ) : (
              <div className="tile" style={{ background: TILE_VISUALS[i]?.bg }} key={tile.name}>
                <div className="scrim"></div>
                <span className="preview-tag" style={TILE_VISUALS[i]?.tagColor ? { color: TILE_VISUALS[i]?.tagColor } : undefined}>// {copy.examples.previewTag}</span>
                {TILE_VISUALS[i]?.glow && <div style={{ position: "absolute", inset: 0, background: TILE_VISUALS[i]?.glow }}/>}
                <div className="body">
                  <h3 className="t-title">{tile.name}</h3>
                  <div className="t-badges">
                    {tile.badges?.map(b => <span className="badge badge-overlay" key={b}>{b}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Stats ─── */}
        <section className="pad-y" style={{ background: "var(--color-snow)" }}>
          <div className="container">
            <div className="stats">
              {copy.stats.map(([num, lbl]) => (
                <div className="stat reveal" key={lbl}><div className="num">{num}</div><div className="lbl">{lbl}</div></div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Ownership (dark) ─── */}
        <section className="pad-y">
          <div className="container">
            <div className="dark-panel on-dark reveal" style={{ padding: 56, overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", top: -160, right: -120, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,90,0,0.18), transparent 65%)" }}/>
              <div className="grid-2" style={{ gap: 56, alignItems: "center", position: "relative" }}>
                <div>
                  <span className="eyebrow">{copy.ownership.eyebrow}</span>
                  <h2 className="heading on-dark">{copy.ownership.heading[0]}<br/><span style={{ color: "#4ade80" }}>{copy.ownership.heading[1]}</span></h2>
                  <p className="lead">{copy.ownership.lead}</p>
                  <div style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {copy.ownership.badges.map(b => <span className="badge badge-dark" key={b}>{b}</span>)}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="card-muted" style={{ background: "var(--color-slate)", color: "var(--color-snow)" }}>
                    <div style={{ fontSize: 12, color: "var(--color-pebble)", marginBottom: 6 }}>{copy.ownership.repoLabel}</div>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 13, color: "var(--color-pebble)" }}>{copy.ownership.repoFiles}</div>
                  </div>
                  <div className="card-muted" style={{ background: "var(--color-slate)", color: "var(--color-snow)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div><div style={{ fontSize: 12, color: "var(--color-pebble)", marginBottom: 4 }}>{copy.ownership.deployLabel}</div><div style={{ fontWeight: 600 }}>{copy.ownership.deployUrl}</div></div>
                    <span className="badge badge-overlay" style={{ borderColor: "rgba(74,222,128,0.5)", color: "#4ade80" }}>{copy.ownership.readyBadge}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── The math / compare ─── */}
        <section className="pad-y" style={{ background: "var(--color-snow)" }}>
          <div className="container">
            <div className="reveal">
              <span className="eyebrow">{copy.math.eyebrow}</span>
              <h2 className="heading-lg">{copy.math.heading}</h2>
              <p className="lead">{copy.math.lead}</p>
            </div>
            <div className="compare">
              <div className="card reveal">
                <div className="col-head">{copy.math.traditional.colHead}</div>
                <div className="price">{copy.math.traditional.price}</div>
                <div className="price-sub">{copy.math.traditional.priceSub}</div>
                {copy.math.traditional.rows.map(r => <div className="row" key={r}><span className="x">✕</span> {r}</div>)}
              </div>
              <div className="dark-panel ins reveal" style={{ padding: 28, overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", top: -80, right: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,222,128,0.28), transparent 65%)" }}/>
                <div style={{ position: "relative" }}>
                  <span className="badge badge-dark" style={{ marginBottom: 14 }}>{copy.math.insixlive.badge}</span>
                  <div className="price">{copy.math.insixlive.price}</div>
                  <div className="price-sub">{copy.math.insixlive.priceSub}</div>
                  {copy.math.insixlive.rows.map(r => <div className="row" key={r}><span className="check">✓</span> {r}</div>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Pricing ─── */}
        <section className="pad-y" id="pricing">
          <div className="container" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
            <div className="reveal">
              <span className="eyebrow">{copy.pricing.eyebrow}</span>
              <h2 className="heading-lg">{copy.pricing.heading[0]}<br/><span className="muted-fg light">{copy.pricing.heading[1]}</span></h2>
            </div>
          </div>
          <div className="container">
            <div className="plans" style={{ marginTop: 40 }}>
              {copy.pricing.plans.map(p => (
                <div className={p.featured ? "plan featured reveal" : "card plan reveal"} key={p.name}>
                  <div style={p.featured ? { position: "relative", display: "flex", flexDirection: "column", height: "100%" } : undefined}>
                    {p.featured && <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,90,0,0.4), transparent 65%)" }}/>}
                    <div className="plan-head" style={{ position: "relative" }}>
                      <span className="pname">{p.name}</span>
                      {p.featured && <span className="badge badge-ember">{copy.pricing.popularBadge}</span>}
                    </div>
                    <div className="pamount" style={{ position: "relative" }}>{p.price} <small>one-time</small></div>
                    <div className="ptag">{p.tag}</div>
                    <ul>
                      {p.items.map(it => <li key={it}><span className="tick"><CheckMark/></span> {it}</li>)}
                      {p.muted && <li><span className="tick" style={{ color: "var(--color-ash)" }}>–</span> {p.muted}</li>}
                    </ul>
                    <Link className={p.featured ? "btn btn-primary" : "btn btn-outline"} href={ctaHref} style={{ justifyContent: "center", width: "100%" }}>{p.cta}</Link>
                    <div className="pafter">{p.after}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-muted reveal" style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "16px 22px" }}>
              <span className="badge badge-dark">{copy.pricing.note.badge}</span>
              <span style={{ fontSize: "var(--text-body)", color: "var(--color-graphite)" }}>{copy.pricing.note.text}</span>
            </div>
          </div>
        </section>

        {/* ─── Domains ─── */}
        <section className="pad-y" id="domains" style={{ background: "var(--color-snow)" }}>
          <div className="container">
            <div className="grid-2" style={{ gap: 48, alignItems: "center" }}>
              <div className="reveal">
                <span className="eyebrow">{copy.domains.eyebrow}</span>
                <h2 className="heading-lg">{copy.domains.heading[0]}<br/><span className="muted-fg light">{copy.domains.heading[1]}</span></h2>
                <p className="lead">{copy.domains.lead.split(copy.domains.exampleDomain)[0]}<b style={{ color: "var(--color-obsidian)" }}>{copy.domains.exampleDomain}</b>{copy.domains.lead.split(copy.domains.exampleDomain)[1]}</p>
                <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {copy.domains.registrars.map(r => <span className="badge badge-dark" key={r}>{r}</span>)}
                </div>
              </div>
              <div className="domain-card reveal">
                <div className="domain-bar">
                  <svg className="lock" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>
                  <span className="url"><span>https://</span><b>{copy.domains.bar1.domain.split(".")[0]}</b><span>.{copy.domains.bar1.domain.split(".").slice(1).join(".")}</span></span>
                  <span className="status">{copy.domains.bar1.status}</span>
                </div>
                <div style={{ textAlign: "center" as const, color: "var(--color-ash)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>
                </div>
                <div className="domain-bar">
                  <svg className="lock" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>
                  <span className="url"><span>https://</span><b>{copy.domains.bar2.domain.split(".")[0]}</b><span>.{copy.domains.bar2.domain.split(".").slice(1).join(".")}</span></span>
                  <span className="status">{copy.domains.bar2.status}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        <section className="pad-y" id="proof">
          <div className="container">
            <div className="reveal">
              <span className="eyebrow">{copy.proof.eyebrow}</span>
              <h2 className="heading-lg">{copy.proof.heading[0]}<br/><span className="muted-fg light">{copy.proof.heading[1]}</span></h2>
              <p className="lead">{copy.proof.lead}</p>
            </div>
            <div className="grid-3" style={{ marginTop: 48 }}>
              {copy.proof.testimonials.map(t => (
                <div className="card quote-card reveal" key={t.name}>
                  <div className="qmark">&quot;</div>
                  <p>{t.quote}</p>
                  <div className="who">
                    <div className="av">{t.initials}</div>
                    <div><div className="nm">{t.name}</div><div className="bz">{t.biz}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="pad-y" id="faq" style={{ background: "var(--color-snow)" }}>
          <div className="container" style={{ maxWidth: 920 }}>
            <div className="reveal">
              <span className="eyebrow">{copy.faq.eyebrow}</span>
              <h2 className="heading-lg">{copy.faq.heading}</h2>
              <p className="lead">{copy.faq.lead}</p>
            </div>
            <div className="faq">
              {copy.faq.items.map(([q, a], i) => (
                <div className={`faq-item${openFaq === i ? " open" : ""}`} key={q}>
                  <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>{q}<span className="pm"></span></button>
                  <div className="faq-a"><p>{a}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="pad-y">
          <div className="container">
            <div className="dark-panel on-dark final reveal" style={{ padding: "80px 56px", overflow: "hidden", position: "relative", borderRadius: "var(--radius-hero)" }}>
              <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 760, height: 760, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,90,0,0.22), transparent 60%)" }}/>
              <div style={{ position: "relative" }}>
                <span className="eyebrow">{copy.final.eyebrow}</span>
                <h2 className="display-sm on-dark">{copy.final.heading}</h2>
                <p className="lead" style={{ margin: "0 auto 8px", maxWidth: "48ch" }}>{copy.final.lead}</p>
                <div className="cta-row">
                  <Link className="btn btn-primary" href={ctaHref}>{primaryLabel}</Link>
                  <a className="btn btn-dark-rect" href="#pricing">{copy.final.secondaryCta}</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer>
          <div className="container">
            <div className="foot-top">
              <div className="foot-col">
                <a className="wordmark" href="#top" style={{ marginBottom: 14, display: "inline-flex" }}><span className="mark">6</span>insix<span className="six">live</span></a>
                <p style={{ fontSize: "var(--text-body)", color: "var(--color-steel)", maxWidth: "32ch", margin: 0 }}>{copy.footer.blurb}</p>
              </div>
              <div className="foot-col">
                <h5>{copy.footer.productHeader}</h5>
                {copy.navLinks.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
              </div>
              <div className="foot-col">
                <h5>{copy.footer.companyHeader}</h5>
                <a href="#proof">{copy.footer.customers}</a>
                <Link href={ctaHref}>{copy.footer.waitlist}</Link>
                <a href="#solution">{copy.footer.whyInsixlive}</a>
              </div>
              <div className="foot-col">
                <h5>{copy.footer.startHeader}</h5>
                <Link href={ctaHref}>{copy.footer.createSite}</Link>
                <Link href={signInHref}>{signInLabel}</Link>
              </div>
            </div>
            <div className="foot-bottom">
              <span>{copy.footer.copyright}</span>
              <span>{copy.footer.builtWith}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
