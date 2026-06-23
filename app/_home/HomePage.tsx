"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DM_Sans } from "next/font/google";
import type { HomeCopy } from "./copy";
import FeaturedBentoSection from "./FeaturedBentoSection";
import { ProgressiveBlur } from "./ProgressiveBlur";

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
  { label: "Cum funcționează", href: "#how" },
  { label: "Exemple",          href: "#examples" },
  { label: "Prețuri",          href: "#pricing" },
  { label: "Începe",           href: "/signup", arrow: true },
] as const;

const PORTFOLIO_IMAGES = [
  { img: "https://motionsites.ai/assets/hero-grow-ai-preview-BlQ8tAQ-.gif",        cat: "Trades & Services" },
  { img: "https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif",   cat: "Beauty & Lifestyle" },
  { img: "https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif",         cat: "Food & Hospitality" },
  { img: "https://motionsites.ai/assets/hero-neuralyn-preview-Br4FRDQA.gif",       cat: "Portfolio & Creative" },
];

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

        /* ── Bionova: blur fade-up (reveal upgrade) ── */
        .aw .reveal { opacity: 0; transform: translateY(24px); filter: blur(4px); }
        .aw .reveal.in { opacity: 1; transform: translateY(0); filter: blur(0); transition: opacity .7s cubic-bezier(0.16,1,0.3,1), transform .7s cubic-bezier(0.16,1,0.3,1), filter .7s ease; }

        /* ── ViralMedia: liquid-glass ── */
        .aw .liquid-glass { background: rgba(255,255,255,0.01); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); box-shadow: inset 0 1px 1px rgba(255,255,255,0.1); position: relative; overflow: hidden; }
        .aw .liquid-glass::before { content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1.4px; background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }

        /* ── Axion: TextRoll button ── */
        .aw .btn-roll .roll-inner { display: inline-flex; flex-direction: column; overflow: hidden; height: 1.3em; vertical-align: bottom; }
        .aw .btn-roll .roll-inner span { display: flex; flex-direction: column; transition: transform .5s cubic-bezier(0.25,0.1,0.25,1); }
        .aw .btn-roll .roll-inner span::after { content: attr(data-text); }
        .aw .btn-roll:hover .roll-inner span { transform: translateY(-50%); }
        .aw .btn-roll .btn-circle { width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,0.18); display: inline-flex; align-items: center; justify-content: center; transition: transform .5s cubic-bezier(0.25,0.1,0.25,1); flex-shrink: 0; }
        .aw .btn-roll:hover .btn-circle { transform: rotate(-45deg); }

        /* ── Axion: section badge ── */
        .aw .sec-badge { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
        .aw .sec-badge .s-num { width: 26px; height: 26px; border-radius: 50%; background: var(--color-obsidian); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
        .aw .sec-badge .s-label { border: 1px solid var(--color-pebble); border-radius: 9999px; padding: 4px 14px; font-size: 12px; font-weight: 500; color: var(--color-graphite); }
        .aw .on-dark .sec-badge .s-num { background: rgba(255,255,255,0.15); }
        .aw .on-dark .sec-badge .s-label { border-color: rgba(255,255,255,0.2); color: var(--color-ash); }

        /* ── Guardnet: glow blob ── */
        .aw .glow-blob { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; z-index: 0; }

        /* ── Guardnet: gradient pill CTA ── */
        .aw .btn-grad-pill { position: relative; border-radius: 9999px; padding: 2px; background: linear-gradient(90deg, #FA8453 0%, #F8C9B2 100%); display: inline-flex; }
        .aw .btn-grad-pill .gp-inner { border-radius: 9999px; background: var(--color-obsidian); padding: 12px 28px; font-size: var(--text-body); font-weight: 500; color: #fff; cursor: pointer; font-family: inherit; border: none; transition: background .2s ease; white-space: nowrap; }
        .aw .btn-grad-pill:hover .gp-inner { background: #111; }
        .aw .btn-grad-fill { border-radius: 9999px; background: linear-gradient(90deg, #FA8453 0%, #F8C9B2 100%); padding: 13px 28px; font-size: var(--text-body); font-weight: 600; color: #000; border: none; cursor: pointer; font-family: inherit; transition: opacity .2s ease; white-space: nowrap; }
        .aw .btn-grad-fill:hover { opacity: 0.88; }

        /* ── Aurora: step card ── */
        .aw .step-aurora { border-radius: 20px; padding: 22px 24px; display: flex; flex-direction: column; gap: 10px; position: relative; border: 1px solid var(--color-fog); background: var(--color-snow); transition: border-color .25s ease, box-shadow .25s ease; }
        .aw .step-aurora:hover { border-color: var(--color-pebble); box-shadow: 0 6px 28px rgba(0,0,0,0.07); }
        .aw .step-aurora .sa-num { width: 34px; height: 34px; border-radius: 50%; background: var(--color-obsidian); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .aw .step-aurora h4 { font-size: var(--text-subheading); font-weight: 600; margin: 0; color: var(--color-obsidian); }
        .aw .step-aurora p { font-size: var(--text-body); color: var(--color-steel); margin: 0; line-height: 1.5; }
        .aw .step-aurora.is-live { background: var(--color-obsidian); border-color: var(--color-obsidian); }
        .aw .step-aurora.is-live .sa-num { background: rgba(255,255,255,0.12); }
        .aw .step-aurora.is-live h4 { color: #fff; }
        .aw .step-aurora.is-live p { color: rgba(255,255,255,0.55); }

        /* ── Axion: hover-expand pill on tiles ── */
        .aw .tile-pill { position: absolute; bottom: 18px; left: 18px; z-index: 3; display: flex; height: 36px; width: 36px; align-items: center; justify-content: center; overflow: hidden; border-radius: 9999px; background: rgba(255,255,255,0.9); transition: width .32s cubic-bezier(0.25,0.1,0.25,1); backdrop-filter: blur(4px); }
        .aw .tile:hover .tile-pill { width: 130px; }
        .aw .tile-pill .tp-text { white-space: nowrap; padding-left: 12px; font-size: 12px; font-weight: 600; color: var(--color-obsidian); opacity: 0; transition: opacity .18s ease .1s; }
        .aw .tile:hover .tile-pill .tp-text { opacity: 1; }
        .aw .tile-pill .tp-icon { position: absolute; right: 10px; transform: rotate(-45deg); transition: transform .32s ease; }
        .aw .tile:hover .tile-pill .tp-icon { transform: rotate(0deg); }

        /* ── ViralMedia: scroll-reveal words ── */
        .aw .word-reveal .word { opacity: 0.15; transition: opacity .4s ease; display: inline; }
        .aw .word-reveal.in .word { opacity: 1; }

        /* ── Guardnet: stat card on dark ── */
        .aw .stat-dark { display: flex; flex-direction: column; gap: 6px; }
        .aw .stat-dark .sd-num { font-size: clamp(2.5rem,5vw,3.5rem); font-weight: 700; color: var(--color-snow); letter-spacing: -0.03em; line-height: 1; }
        .aw .stat-dark .sd-lbl { font-size: var(--text-body); color: rgba(255,255,255,0.5); line-height: 1.4; }

        /* ── ViralMedia: manifesto text ── */
        .aw .manifesto-text { font-size: clamp(2rem,4vw,3.2rem); font-weight: 700; line-height: 1.15; color: var(--color-snow); letter-spacing: -0.025em; margin: 0; }
        .aw .manifesto-text .dim { color: rgba(255,255,255,0.25); font-weight: 300; }

        /* ── Guardnet: dark bento grid ── */
        .aw .bento { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .aw .bento-col { display: flex; flex-direction: column; gap: 16px; }
        .aw .bento-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 32px; position: relative; overflow: hidden; transition: border-color .28s ease, background .28s ease; flex: 1; }
        .aw .bento-card:hover { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.06); }
        .aw .bento-card .bento-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; flex-shrink: 0; }
        .aw .bento-card h3 { font-size: var(--text-heading-sm); font-weight: 600; color: var(--color-snow); margin: 0 0 10px; }
        .aw .bento-card p { font-size: var(--text-body); color: rgba(255,255,255,0.45); line-height: 1.6; margin: 0; }

        /* ── Aurora: step timeline ── */
        .aw .step-timeline { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; position: relative; }
        .aw .step-timeline::before { content: ''; position: absolute; top: 24px; left: 16.67%; right: 16.67%; height: 1px; background: linear-gradient(90deg, transparent 0%, var(--color-pebble) 15%, var(--color-pebble) 85%, transparent 100%); }
        .aw .step-t { padding: 0 28px 0 0; position: relative; }
        .aw .step-t .st-num { width: 48px; height: 48px; border-radius: 50%; border: 1.5px solid var(--color-pebble); background: var(--color-snow); display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: var(--color-obsidian); margin-bottom: 28px; position: relative; z-index: 1; }
        .aw .step-t.is-live .st-num { background: var(--color-obsidian); color: #fff; border-color: var(--color-obsidian); box-shadow: 0 0 0 6px rgba(9,9,11,0.1); }
        .aw .step-t h4 { font-size: var(--text-heading-sm); font-weight: 600; color: var(--color-obsidian); margin: 0 0 10px; }
        .aw .step-t p { font-size: var(--text-body); color: var(--color-steel); margin: 0; line-height: 1.55; }
        .aw .step-t.is-live h4 { color: var(--color-obsidian); }

        /* ── Axion: case study grid ── */
        .aw .cs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .aw .cs-col { display: flex; flex-direction: column; gap: 16px; }
        .aw .cs-card { border-radius: 24px; overflow: hidden; position: relative; cursor: pointer; min-height: 260px; }
        .aw .cs-card.cs-featured { min-height: 560px; }
        .aw .cs-bg { position: absolute; inset: 0; }
        .aw .cs-scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%); transition: opacity .3s ease; }
        .aw .cs-card:hover .cs-scrim { opacity: 0.85; }
        .aw .cs-body { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; padding: 28px; }
        .aw .cs-tag { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.5); margin-bottom: 6px; }
        .aw .cs-title { font-size: var(--text-heading-sm); font-weight: 600; color: #fff; margin: 0 0 14px; }
        .aw .cs-pill { display: inline-flex; height: 36px; width: 36px; align-items: center; justify-content: center; overflow: hidden; border-radius: 9999px; background: rgba(255,255,255,0.9); transition: width .32s cubic-bezier(0.25,0.1,0.25,1); position: absolute; top: 22px; right: 22px; z-index: 3; }
        .aw .cs-card:hover .cs-pill { width: 120px; }
        .aw .cs-pill .cp-text { white-space: nowrap; padding-right: 14px; font-size: 12px; font-weight: 600; color: var(--color-obsidian); opacity: 0; transition: opacity .18s ease .1s; }
        .aw .cs-card:hover .cs-pill .cp-text { opacity: 1; }
        .aw .cs-pill .cp-icon { position: absolute; left: 11px; transform: rotate(-45deg); transition: transform .32s ease; }
        .aw .cs-card:hover .cs-pill .cp-icon { transform: rotate(0deg); }

        /* ── ViralMedia: selected work image grid ── */
        .aw .vm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .aw .vm-card { display: flex; flex-direction: column; gap: 14px; cursor: pointer; }
        .aw .vm-img { border-radius: 20px; overflow: hidden; aspect-ratio: 4/3; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); }
        .aw .vm-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.6s cubic-bezier(0.33,1,0.68,1); }
        .aw .vm-card:hover .vm-img img { transform: scale(1.04); }
        .aw .vm-title { font-size: var(--text-subheading); font-weight: 600; color: var(--color-snow); margin: 0; }
        .aw .vm-category { font-size: var(--text-body); color: rgba(255,255,255,0.4); margin: 4px 0 0; }

        /* ── Bionova: hero stat cards ── */
        .aw .bio-cards { display: grid; grid-template-rows: auto auto; gap: 16px; margin: 48px 0 56px; }
        .aw .bio-card-main { position: relative; overflow: hidden; border-radius: 24px; background: #000; padding: 40px; display: flex; flex-direction: column; justify-content: space-between; min-height: 220px; }
        .aw .bio-card-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .aw .bio-card-sm { position: relative; overflow: hidden; border-radius: 24px; background: #000; padding: 32px; display: flex; flex-direction: column; justify-content: space-between; min-height: 210px; }
        .aw .bc-vid { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
        .aw .bc-vid-sm { position: absolute; left: 50%; top: 50%; width: 100%; height: 100%; object-fit: cover; transform: translate(-50%,-50%) scale(1.5); z-index: 0; }
        .aw .bc-overlay { position: absolute; inset: 0; z-index: 1; }
        .aw .bc-content { position: relative; z-index: 2; display: flex; flex-direction: column; justify-content: space-between; height: 100%; }
        .aw .bc-tag { display: inline-block; padding: 4px 12px; border-radius: 999px; background: #fff; color: #09090b; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: lowercase; width: fit-content; }
        .aw .bc-arrow { width: 40px; height: 40px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: opacity .2s; text-decoration: none; }
        .aw .bc-arrow:hover { opacity: 0.85; }
        .aw .bc-stat { font-size: clamp(4rem,8vw,6.5rem); font-weight: 300; color: #fff; line-height: 1; letter-spacing: -0.04em; margin: 0; }
        @media (max-width: 920px) {
          .aw .vm-grid { grid-template-columns: 1fr; }
          .aw .bio-card-row { grid-template-columns: 1fr; }
          .aw .bio-card-sm { min-height: 170px; }
        }

        /* ── Ownership statement (ViralMedia flip) ── */
        .aw .own-statement { font-size: clamp(2.2rem,4vw,3.6rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.03em; color: var(--color-obsidian); margin: 0; }
        .aw .own-statement .accent { color: #4ade80; }
        .aw .terminal-card { background: var(--color-obsidian); border-radius: 20px; padding: 24px; border: 1px solid rgba(255,255,255,0.07); }
        .aw .terminal-label { font-size: 11px; color: rgba(255,255,255,0.3); margin-bottom: 10px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; }
        .aw .terminal-body { font-family: ui-monospace,monospace; font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.7; }

        /* ── Guardnet: compare dark split ── */
        .aw .compare-dark { display: grid; grid-template-columns: 1fr 1fr; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.07); }
        .aw .compare-col { padding: 44px 40px; }
        .aw .compare-col.legacy { background: rgba(255,255,255,0.03); }
        .aw .compare-col.ours { background: rgba(255,255,255,0.06); position: relative; overflow: hidden; }
        .aw .compare-big-price { font-size: clamp(2.4rem,4.5vw,3.6rem); font-weight: 700; letter-spacing: -0.03em; color: var(--color-snow); margin: 10px 0 4px; line-height: 1; }
        .aw .compare-col.legacy .compare-big-price { color: rgba(255,255,255,0.2); text-decoration: line-through; text-decoration-color: rgba(255,255,255,0.15); }
        .aw .compare-row { display: flex; gap: 10px; align-items: center; padding: 9px 0; border-top: 1px solid rgba(255,255,255,0.06); font-size: var(--text-body); color: rgba(255,255,255,0.4); }
        .aw .compare-col.ours .compare-row { color: rgba(255,255,255,0.75); }
        .aw .cx { color: rgba(255,255,255,0.18); flex-shrink: 0; }
        .aw .ck { color: #4ade80; flex-shrink: 0; }

        /* ── ViralMedia: dark testimonial cards ── */
        .aw .dark-quote { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 32px; position: relative; overflow: hidden; display: flex; flex-direction: column; transition: border-color .25s ease; }
        .aw .dark-quote:hover { border-color: rgba(255,255,255,0.15); }
        .aw .dark-quote .big-q { font-size: 5rem; line-height: 0.7; color: #64CEFB; font-weight: 800; display: block; height: 40px; margin-bottom: 20px; }
        .aw .dark-quote p { font-size: var(--text-body-lg); line-height: 1.6; color: rgba(255,255,255,0.72); margin: 0 0 24px; flex: 1; }
        .aw .dark-quote .dq-author { display: flex; align-items: center; gap: 12px; }
        .aw .dark-quote .dq-av { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .aw .dark-quote .dq-name { font-size: var(--text-body); font-weight: 600; color: var(--color-snow); }
        .aw .dark-quote .dq-biz { font-size: 12px; color: rgba(255,255,255,0.4); }

        /* ── Footer dark (ViralMedia) ── */
        .aw .foot-dark { background: var(--color-obsidian); padding: 80px 0 40px; }
        .aw .foot-dark .foot-top { border-color: rgba(255,255,255,0.07); }
        .aw .foot-dark .foot-col h5 { color: rgba(255,255,255,0.35); }
        .aw .foot-dark .foot-col a { color: rgba(255,255,255,0.6); }
        .aw .foot-dark .foot-col a:hover { color: #fff; }
        .aw .foot-dark .foot-bottom { border-color: rgba(255,255,255,0.07); }
        .aw .foot-dark .foot-bottom span { color: rgba(255,255,255,0.3); }

        /* ── Bionova: floating shape animations ── */
        @keyframes aw-float-y { 0%, 100% { transform: translateY(0px) rotate(var(--s-rot,0deg)); } 50% { transform: translateY(-16px) rotate(var(--s-rot,0deg)); } }
        @keyframes aw-float-xy { 0%, 100% { transform: translate(0,0) rotate(var(--s-rot,0deg)); } 33% { transform: translate(9px,-14px) rotate(var(--s-rot,0deg)); } 66% { transform: translate(-7px,-8px) rotate(var(--s-rot,0deg)); } }
        @keyframes aw-pulse-out { 0% { transform: scale(1); opacity: 0.55; } 100% { transform: scale(1.75); opacity: 0; } }
        .aw .bio-pill { position: absolute; pointer-events: none; border-radius: 9999px; }
        .aw .bio-rect { position: absolute; pointer-events: none; border-radius: 22px; }
        .aw .bio-ring { position: absolute; pointer-events: none; border-radius: 50%; }
        .aw .bio-sq { position: absolute; pointer-events: none; border-radius: 16px; }
        .aw .float-a { animation: aw-float-y var(--s-dur,7s) ease-in-out infinite var(--s-delay,0s); }
        .aw .float-b { animation: aw-float-xy var(--s-dur,9s) ease-in-out infinite var(--s-delay,0s); }

        /* ── Bionova: pulsing concentric rings (behind headlines) ── */
        .aw .pulse-origin { position: absolute; pointer-events: none; border-radius: 50%; }
        .aw .pulse-origin .pr { position: absolute; inset: 0; border-radius: 50%; border: 1px solid rgba(100,206,251,0.22); animation: aw-pulse-out 3.2s ease-out infinite; }
        .aw .pulse-origin .pr:nth-child(2) { inset: -40%; border-color: rgba(100,206,251,0.12); animation-delay: 1.1s; }
        .aw .pulse-origin .pr:nth-child(3) { inset: -80%; border-color: rgba(100,206,251,0.06); animation-delay: 2.2s; }

        /* ── Guardnet: status pulse dot ── */
        @keyframes aw-dot-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.6); } 60% { box-shadow: 0 0 0 9px rgba(74,222,128,0); } }
        .aw .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; display: inline-block; flex-shrink: 0; animation: aw-dot-pulse 2s ease-out infinite; }

        /* ── Guardnet: dot-grid overlay (use as child div) ── */
        .aw .gn-dots-overlay { position: absolute; inset: 0; pointer-events: none; z-index: 0; background-image: radial-gradient(circle, rgba(255,255,255,0.065) 1px, transparent 1px); background-size: 32px 32px; }

        /* ── Pricing featured: Bionova glow border ── */
        .aw .plan.bionova-featured { background: transparent; border-radius: var(--radius-card); padding: 2px; background: linear-gradient(135deg, rgba(100,206,251,0.6) 0%, rgba(74,222,128,0.4) 50%, rgba(250,132,83,0.5) 100%); }
        .aw .plan.bionova-featured .bf-inner { background: var(--color-obsidian); border-radius: calc(var(--radius-card) - 2px); padding: 32px 28px; height: 100%; display: flex; flex-direction: column; }
        .aw .plan.bionova-featured .pamount { color: var(--color-snow); }
        .aw .plan.bionova-featured .pname, .aw .plan.bionova-featured .ptag, .aw .plan.bionova-featured .pafter { color: rgba(255,255,255,0.45); }
        .aw .plan.bionova-featured .pamount small { color: rgba(255,255,255,0.45); }
        .aw .plan.bionova-featured li { color: var(--color-snow); }
        .aw .plan.bionova-featured li .tick { background: rgba(255,255,255,0.08); }

        @media (prefers-reduced-motion: reduce) {
          .aw .reveal { opacity: 1; transform: none; filter: none; }
          .aw .logo-track { animation: none; }
        }

        @media (max-width: 920px) {
          .aw-mobile-scale { --text-display: 44px; --text-display-sm: 38px; --text-heading-lg: 32px; --text-heading: 26px; }
          .aw .hero-top-row, .aw .grid-3, .aw .grid-2, .aw .steps, .aw .stats, .aw .compare, .aw .plans, .aw .foot-top { grid-template-columns: 1fr; }
          .aw .bento, .aw .cs-grid, .aw .compare-dark, .aw .step-timeline { grid-template-columns: 1fr; }
          .aw .hero-top-row p:last-child { text-align: left; }
          .aw .stats { grid-template-columns: 1fr 1fr; }
          .aw .stat-dark { padding-right: 0 !important; padding-left: 0 !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px; }
          .aw .nav .links { display: none; }
          .aw .email-row { max-width: 100%; }
          .aw .step-timeline::before { display: none; }
          .aw .step-t { padding: 0; margin-bottom: 32px; }
          .aw .compare-col { padding: 28px 24px; }
        }
      `}</style>

      <div className={`aw aw-mobile-scale ${cosmica.variable}`}>
        {/* ─── Nav (DesignPro fixed dark pill) ─── */}
        <header className="dp-nav-header">
          <div className="dp-nav-inner">
            {/* Logo */}
            <a className="dp-logo" href="/" aria-label="insixlive home">
              <span style={{ fontFamily: "var(--font-cosmica), sans-serif", fontSize: 28, fontWeight: 200, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1, userSelect: "none" }}>6</span>
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
              <span style={{ fontFamily: "var(--font-cosmica), sans-serif", fontSize: 28, fontWeight: 200, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1, userSelect: "none" }}>6</span>
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

          {/* ── Bionova floating shapes over vignette ── */}
          <div className="bio-pill float-a" style={{ width: 320, height: 56, top: "18%", left: "-4%", background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.07)", zIndex: 3, "--s-rot": "14deg", "--s-dur": "8s" } as React.CSSProperties}/>
          <div className="bio-pill float-b" style={{ width: 180, height: 38, bottom: "30%", right: "1%", background: "rgba(100,206,251,0.035)", border: "1px solid rgba(100,206,251,0.12)", zIndex: 3, "--s-rot": "-21deg", "--s-dur": "10s", "--s-delay": "1.5s" } as React.CSSProperties}/>
          <div className="bio-rect float-a" style={{ width: 100, height: 100, top: "40%", right: "7%", background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.055)", zIndex: 3, "--s-dur": "9s", "--s-delay": "0.8s" } as React.CSSProperties}/>
          <div className="bio-pill float-b" style={{ width: 80, height: 24, top: "65%", left: "12%", background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.1)", zIndex: 3, "--s-rot": "8deg", "--s-dur": "7s", "--s-delay": "3s" } as React.CSSProperties}/>
          {/* Bionova pulsing concentric rings centered on headline */}
          <div className="pulse-origin" style={{ width: 220, height: 220, top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 2 }}>
            <div className="pr"/><div className="pr"/><div className="pr"/>
          </div>

          {/* Progressive blur fade-out at hero bottom */}
          <ProgressiveBlur
            direction="bottom"
            blurLayers={10}
            blurIntensity={0.4}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 160, zIndex: 8, pointerEvents: "none" }}
          />

          <div className="container hero-inner">
            {/* Centre — hardcoded headline */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" as const }}>
              <h1 className="reveal" style={{ fontFamily: "var(--font-cosmica), sans-serif", fontSize: "clamp(0.82rem, 1.4vw, 1.4rem)", fontWeight: 700, lineHeight: 1.5, letterSpacing: "-0.025em", color: "rgba(255,255,255,0.7)", margin: "0 0 0" }}>
                <span style={{ display: "block" }}>site-uri.profesionale /</span>
                <span style={{ display: "block", color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>publicate-pe-domeniu-propriu ✓</span>
              </h1>
              <div className="reveal" style={{ marginTop: 28 }}>
                <Link href={ctaHref} className="btn btn-primary btn-roll" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span className="roll-inner"><span data-text={copy.getStarted}>{copy.getStarted}</span></span>
                  <span className="btn-circle" aria-hidden>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                  </span>
                </Link>
              </div>
            </div>

            {/* Bottom badges */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              <span className="badge badge-overlay">app/page.tsx</span>
              <span className="badge badge-overlay">{copy.hero.deployReady}</span>
            </div>
          </div>
        </header>

        {/* ─── Logo strip (dark, flows from hero) ─── */}
        <div style={{ background: "var(--color-obsidian)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="logo-strip">
            <div className="logo-track">
              {[...LOGOS, ...LOGOS].map((l, i) => <span className="logo" key={`${l}-${i}`} style={{ color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>{l}</span>)}
            </div>
          </div>
        </div>

        {/* ─── Problem: ViralMedia full-bleed dark manifesto ─── */}
        <section style={{ background: "var(--color-obsidian)", padding: "100px 0", position: "relative", overflow: "hidden" }}>
          <div className="gn-dots-overlay"/>
          <div className="bio-pill float-a" style={{ width: 260, height: 48, top: "12%", right: "-3%", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.065)", "--s-rot": "-18deg", "--s-dur": "9s" } as React.CSSProperties}/>
          <div className="bio-rect float-b" style={{ width: 90, height: 90, bottom: "18%", left: "4%", background: "rgba(100,206,251,0.02)", border: "1px solid rgba(100,206,251,0.08)", "--s-dur": "11s", "--s-delay": "2s" } as React.CSSProperties}/>
          <div className="bio-pill float-a" style={{ width: 140, height: 28, bottom: "38%", right: "8%", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", "--s-rot": "10deg", "--s-dur": "8s", "--s-delay": "1s" } as React.CSSProperties}/>
          <div className="glow-blob" style={{ width: 700, height: 700, top: "50%", left: "30%", transform: "translateY(-50%)", background: "rgba(100,206,251,0.05)" }}/>
          <div className="container" style={{ position: "relative" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
              {/* Left: manifesto */}
              <div>
                <div className="sec-badge reveal">
                  <span className="s-num" style={{ background: "rgba(255,255,255,0.12)" }}>01</span>
                  <span className="s-label" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)" }}>{copy.problem.eyebrow}</span>
                </div>
                <h2 className="manifesto-text reveal">
                  {copy.problem.heading[0]}<br/><span className="dim">{copy.problem.heading[1]}</span>
                </h2>
                <p className="reveal" style={{ fontSize: "var(--text-body-lg)", color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginTop: 24, maxWidth: "44ch" }}>{copy.problem.lead}</p>
              </div>
              {/* Right: numbered pain points */}
              <div>
                {copy.problem.rows.map(([lead, key], i) => (
                  <div className="reveal" key={key} style={{ padding: "22px 0", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 24, alignItems: "flex-start" }}>
                    <span style={{ fontSize: "clamp(1.6rem,2.5vw,2.2rem)", fontWeight: 800, color: "rgba(255,255,255,0.08)", lineHeight: 1, flexShrink: 0, minWidth: 52, letterSpacing: "-0.04em" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p style={{ margin: 0, fontSize: "var(--text-subheading)", color: "rgba(255,255,255,0.35)", fontWeight: 300, lineHeight: 1.4 }}>{lead}</p>
                      <p style={{ margin: 0, fontSize: "var(--text-subheading)", color: "var(--color-snow)", fontWeight: 600, lineHeight: 1.4 }}>{key}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Solution: Guardnet dark bento grid ─── */}
        <section style={{ background: "#0c0c0e", padding: "100px 0", position: "relative", overflow: "hidden" }} id="solution">
          <div className="gn-dots-overlay"/>
          <div className="bio-pill float-b" style={{ width: 200, height: 42, top: "8%", left: "2%", background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.06)", "--s-rot": "22deg", "--s-dur": "10s" } as React.CSSProperties}/>
          <div className="bio-rect float-a" style={{ width: 70, height: 120, bottom: "15%", right: "3%", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", "--s-dur": "9s", "--s-delay": "1.5s" } as React.CSSProperties}/>
          <div className="bio-ring float-a" style={{ width: 180, height: 180, bottom: "10%", left: "8%", border: "1px solid rgba(100,206,251,0.07)", "--s-dur": "12s", "--s-delay": "0.5s" } as React.CSSProperties}/>
          <div className="glow-blob" style={{ width: 500, height: 500, top: -100, right: -80, background: "rgba(100,206,251,0.07)" }}/>
          <div className="container" style={{ position: "relative" }}>
            <div className="reveal" style={{ marginBottom: 0 }}>
              <div className="sec-badge">
                <span className="s-num" style={{ background: "rgba(255,255,255,0.12)" }}>02</span>
                <span className="s-label" style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)" }}>{copy.solution.eyebrow}</span>
              </div>
              <h2 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: "var(--color-snow)", margin: 0, letterSpacing: "-0.025em" }}>
                {copy.solution.heading[0]}<br/><span style={{ color: "rgba(255,255,255,0.28)", fontWeight: 300 }}>{copy.solution.heading[1]}</span>
              </h2>
            </div>

            {/* Asymmetric bento: tall featured card left + 2 stacked right */}
            <div className="bento">
              {/* Featured tall card */}
              <div className="bento-card reveal" style={{ display: "flex", flexDirection: "column", minHeight: 420, transitionDelay: "0s" }}>
                <div className="glow-blob" style={{ width: 280, height: 280, top: -60, right: -40, background: "rgba(100,206,251,0.12)" }}/>
                <div className="bento-icon" style={{ background: "rgba(100,206,251,0.1)", color: "#64CEFB" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    {FEATURE_ICONS[0]?.circle && <circle cx="12" cy="12" r="9"/>}<path d={FEATURE_ICONS[0]?.d}/>
                  </svg>
                </div>
                <h3>{copy.solution.features[0].t}</h3>
                <p>{copy.solution.features[0].b}</p>
                <div style={{ flex: 1 }}/>
                {/* Decorative number */}
                <div style={{ fontSize: "clamp(6rem,10vw,9rem)", fontWeight: 800, color: "rgba(255,255,255,0.03)", lineHeight: 1, letterSpacing: "-0.06em", userSelect: "none", marginTop: 16 }}>01</div>
              </div>
              {/* Two stacked smaller cards */}
              <div className="bento-col">
                {copy.solution.features.slice(1).map((f, i) => (
                  <div className="bento-card reveal" key={f.t} style={{ flex: 1, transitionDelay: `${(i + 1) * 0.12}s` }}>
                    <div className="glow-blob" style={{ width: 200, height: 200, bottom: -50, left: -40, background: i === 0 ? "rgba(74,222,128,0.09)" : "rgba(250,132,83,0.09)" }}/>
                    <div className="bento-icon" style={{ background: i === 0 ? "rgba(74,222,128,0.1)" : "rgba(250,132,83,0.1)", color: i === 0 ? "#4ade80" : "#FA8453" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        {FEATURE_ICONS[i + 1]?.circle && <circle cx="12" cy="12" r="9"/>}<path d={FEATURE_ICONS[i + 1]?.d}/>
                      </svg>
                    </div>
                    <h3>{f.t}</h3>
                    <p>{f.b}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── How it works: Aurora horizontal timeline ─── */}
        <section style={{ background: "var(--color-mist)", padding: "100px 0" }} id="how">
          <div className="container">
            <div className="reveal" style={{ textAlign: "center", marginBottom: 72 }}>
              <div className="sec-badge" style={{ justifyContent: "center" }}>
                <span className="s-num">03</span>
                <span className="s-label">{copy.how.eyebrow}</span>
              </div>
              <h2 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: "var(--color-obsidian)", margin: "0 auto", letterSpacing: "-0.025em", maxWidth: "18ch" }}>
                {copy.how.heading[0]}<br/><span style={{ color: "var(--color-steel)", fontWeight: 300 }}>{copy.how.heading[1]}</span>
              </h2>
            </div>
            {/* Clean minimal step cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {copy.how.steps.map(([t, s], i) => {
                const isLast = i === copy.how.steps.length - 1;
                return (
                  <div
                    key={STEP_NUMS[i]}
                    className="reveal"
                    style={{
                      background: isLast ? "var(--color-obsidian)" : "var(--color-snow)",
                      border: `1px solid ${isLast ? "rgba(255,255,255,0.06)" : "var(--color-fog)"}`,
                      borderRadius: 20,
                      padding: "24px 24px 28px",
                      display: "flex",
                      flexDirection: "column" as const,
                      gap: 10,
                      transitionDelay: `${i * 0.08}s`,
                    }}
                  >
                    <span style={{
                      fontFamily: "ui-monospace, monospace",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      color: isLast ? "rgba(255,255,255,0.25)" : "var(--color-ash)",
                    }}>
                      {STEP_NUMS[i]}
                    </span>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: "var(--text-subheading)", fontWeight: 600, margin: "0 0 6px", color: isLast ? "#fff" : "var(--color-obsidian)" }}>{t}</h4>
                      <p style={{ fontSize: "var(--text-body)", color: isLast ? "rgba(255,255,255,0.45)" : "var(--color-steel)", margin: 0, lineHeight: 1.55 }}>{s}</p>
                    </div>
                    {isLast && (
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4 }}>
                        <span className="status-dot" style={{ position: "static" }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#4ade80", letterSpacing: "0.04em" }}>{copy.how.liveBadge}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Featured bento (map / notifications / chart / features) ─── */}
        <FeaturedBentoSection />

        {/* ─── Portfolio: Axion case study grid (dark) ─── */}
        <section style={{ background: "var(--color-obsidian)", padding: "100px 0", position: "relative", overflow: "hidden" }} id="examples">
          <div className="gn-dots-overlay"/>
          <div className="bio-pill float-a" style={{ width: 180, height: 36, top: "6%", right: "5%", background: "rgba(255,255,255,0.012)", border: "1px solid rgba(255,255,255,0.06)", "--s-rot": "12deg", "--s-dur": "8s" } as React.CSSProperties}/>
          <div className="bio-ring float-b" style={{ width: 220, height: 220, bottom: "8%", right: "2%", border: "1px solid rgba(100,206,251,0.06)", "--s-dur": "13s", "--s-delay": "2s" } as React.CSSProperties}/>
          <div className="container">
            <div className="reveal" style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="sec-badge" style={{ justifyContent: "center" }}>
                <span className="s-num" style={{ background: "rgba(255,255,255,0.12)" }}>04</span>
                <span className="s-label" style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)" }}>{copy.examples.eyebrow}</span>
              </div>
              <h2 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: "var(--color-snow)", margin: 0, letterSpacing: "-0.025em" }}>
                {copy.examples.heading[0]}<br/>{copy.examples.heading[1]}
              </h2>
            </div>
            {/* Horizontal scroll strip */}
            <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 16, scrollSnapType: "x mandatory", msOverflowStyle: "none" as React.CSSProperties["msOverflowStyle"], scrollbarWidth: "none" as React.CSSProperties["scrollbarWidth"] }}>
              {PORTFOLIO_IMAGES.map((p, i) => {
                const tile = copy.examples.tiles[i];
                return (
                  <div className="vm-card reveal" key={p.img} style={{ transitionDelay: `${i * 0.1}s`, minWidth: 300, flexShrink: 0, scrollSnapAlign: "start" }}>
                    <div className="vm-img">
                      <img src={p.img} alt={tile?.name || p.cat} loading="lazy"/>
                    </div>
                    <div>
                      <h3 className="vm-title">{tile?.name || p.cat}</h3>
                      <p className="vm-category">{tile?.badges?.[0] || p.cat}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Ownership: ViralMedia bold statement (white, flipped from dark) ─── */}
        <section style={{ background: "var(--color-snow)", padding: "100px 0" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
              {/* Left: bold statement */}
              <div className="reveal">
                <div className="sec-badge">
                  <span className="s-num">05</span>
                  <span className="s-label">{copy.ownership.eyebrow}</span>
                </div>
                <h2 className="own-statement">
                  {copy.ownership.heading[0]}<br/><span className="accent">{copy.ownership.heading[1]}</span>
                </h2>
                <p style={{ fontSize: "var(--text-body-lg)", color: "var(--color-steel)", lineHeight: 1.6, marginTop: 24, maxWidth: "44ch" }}>{copy.ownership.lead}</p>
                <div style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {copy.ownership.badges.map(b => <span className="badge badge-dark" key={b}>{b}</span>)}
                </div>
              </div>
              {/* Right: terminal cards */}
              <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="terminal-card">
                  <div className="terminal-label">{copy.ownership.repoLabel}</div>
                  <div className="terminal-body">{copy.ownership.repoFiles}</div>
                </div>
                <div className="terminal-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div className="terminal-label">{copy.ownership.deployLabel}</div>
                    <div style={{ fontWeight: 600, color: "var(--color-snow)", fontSize: "var(--text-body)" }}>{copy.ownership.deployUrl}</div>
                  </div>
                  <span className="badge" style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}>{copy.ownership.readyBadge}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Compare: Guardnet dark split panel ─── */}
        <section style={{ background: "var(--color-obsidian)", padding: "100px 0", position: "relative", overflow: "hidden" }}>
          <div className="gn-dots-overlay"/>
          <div className="bio-rect float-a" style={{ width: 80, height: 80, top: "8%", left: "5%", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", "--s-dur": "9s" } as React.CSSProperties}/>
          <div className="bio-pill float-b" style={{ width: 220, height: 44, bottom: "10%", left: "2%", background: "rgba(74,222,128,0.025)", border: "1px solid rgba(74,222,128,0.08)", "--s-rot": "6deg", "--s-dur": "11s", "--s-delay": "1.5s" } as React.CSSProperties}/>
          <div className="glow-blob" style={{ width: 450, height: 450, top: "50%", right: -60, transform: "translateY(-50%)", background: "rgba(74,222,128,0.07)" }}/>
          <div className="container" style={{ position: "relative" }}>
            <div className="reveal" style={{ marginBottom: 56 }}>
              <div className="sec-badge">
                <span className="s-num" style={{ background: "rgba(255,255,255,0.12)" }}>06</span>
                <span className="s-label" style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)" }}>{copy.math.eyebrow}</span>
              </div>
              <h2 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: "var(--color-snow)", margin: 0, letterSpacing: "-0.025em" }}>{copy.math.heading}</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", marginTop: 12, fontSize: "var(--text-body-lg)", maxWidth: "56ch" }}>{copy.math.lead}</p>
            </div>
            <div className="compare-dark reveal">
              {/* Legacy / Agency */}
              <div className="compare-col legacy">
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "rgba(255,255,255,0.22)", marginBottom: 6 }}>{copy.math.traditional.colHead}</div>
                <div className="compare-big-price">{copy.math.traditional.price}</div>
                <div style={{ fontSize: "var(--text-body)", color: "rgba(255,255,255,0.22)", marginBottom: 32 }}>{copy.math.traditional.priceSub}</div>
                {copy.math.traditional.rows.map(r => (
                  <div className="compare-row" key={r}><span className="cx">✕</span>{r}</div>
                ))}
              </div>
              {/* insixlive */}
              <div className="compare-col ours">
                <div className="glow-blob" style={{ width: 320, height: 320, top: -80, right: -60, background: "rgba(74,222,128,0.11)" }}/>
                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)" }}>{copy.math.insixlive.badge}</div>
                    <span className="badge badge-ember">{copy.math.insixlive.badge}</span>
                  </div>
                  <div className="compare-big-price" style={{ color: "var(--color-snow)", textDecoration: "none" }}>{copy.math.insixlive.price}</div>
                  <div style={{ fontSize: "var(--text-body)", color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>{copy.math.insixlive.priceSub}</div>
                  {copy.math.insixlive.rows.map(r => (
                    <div className="compare-row" key={r}><span className="ck">✓</span>{r}</div>
                  ))}
                </div>
              </div>
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

        {/* ─── Testimonials: ViralMedia dark large-quote style ─── */}
        <section style={{ background: "var(--color-obsidian)", padding: "100px 0", position: "relative", overflow: "hidden" }} id="proof">
          <div className="gn-dots-overlay"/>
          <div className="bio-pill float-a" style={{ width: 300, height: 52, top: "7%", right: "-2%", background: "rgba(255,255,255,0.013)", border: "1px solid rgba(255,255,255,0.06)", "--s-rot": "-12deg", "--s-dur": "10s" } as React.CSSProperties}/>
          <div className="bio-ring float-b" style={{ width: 160, height: 160, bottom: "15%", left: "3%", border: "1px solid rgba(100,206,251,0.07)", "--s-dur": "12s", "--s-delay": "1s" } as React.CSSProperties}/>
          <div className="glow-blob" style={{ width: 600, height: 600, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "rgba(100,206,251,0.05)" }}/>
          <div className="container" style={{ position: "relative" }}>
            <div className="reveal" style={{ marginBottom: 56 }}>
              <div className="sec-badge">
                <span className="s-num" style={{ background: "rgba(255,255,255,0.12)" }}>07</span>
                <span className="s-label" style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)" }}>{copy.proof.eyebrow}</span>
              </div>
              <h2 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: "var(--color-snow)", margin: 0, letterSpacing: "-0.025em" }}>
                {copy.proof.heading[0]}<br/><span style={{ color: "rgba(255,255,255,0.28)", fontWeight: 300 }}>{copy.proof.heading[1]}</span>
              </h2>
            </div>
            <div style={{ position: "relative" }}>
              {/* Edge blurs */}
              <ProgressiveBlur
                direction="left"
                blurLayers={6}
                blurIntensity={0.35}
                style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 80, zIndex: 5, pointerEvents: "none" }}
              />
              <ProgressiveBlur
                direction="right"
                blurLayers={6}
                blurIntensity={0.35}
                style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 80, zIndex: 5, pointerEvents: "none" }}
              />
              <div className="grid-3" style={{ gap: 16 }}>
                {copy.proof.testimonials.map((t, i) => (
                  <div className="dark-quote reveal" key={t.name} style={{ transitionDelay: `${i * 0.1}s` }}>
                    <span className="big-q">&ldquo;</span>
                    <p>{t.quote}</p>
                    <div className="dq-author">
                      <div className="dq-av">{t.initials}</div>
                      <div>
                        <div className="dq-name">{t.name}</div>
                        <div className="dq-biz">{t.biz}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="pad-y" id="faq" style={{ background: "var(--color-snow)" }}>
          <div className="container" style={{ maxWidth: 920 }}>
            <div className="reveal">
              {/* Axion section badge */}
              <div className="sec-badge">
                <span className="s-num">08</span>
                <span className="s-label">{copy.faq.eyebrow}</span>
              </div>
              <h2 className="heading-lg">{copy.faq.heading}</h2>
              <p className="lead">{copy.faq.lead}</p>
            </div>
            <div className="faq reveal">
              {copy.faq.items.map(([q, a], i) => (
                <div className={`faq-item${openFaq === i ? " open" : ""}`} key={q} style={{ borderRadius: openFaq === i ? 16 : 0, transition: "border-radius .3s ease", marginBottom: openFaq === i ? 4 : 0 }}>
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
              {/* Guardnet dot-grid */}
              <div className="gn-dots-overlay"/>
              {/* Bionova pulsing origin ring — centered behind headline */}
              <div className="pulse-origin" style={{ width: 260, height: 260, top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1 }}>
                <div className="pr"/><div className="pr"/><div className="pr"/>
              </div>
              {/* Bionova large floating shapes */}
              <div className="bio-pill float-a" style={{ width: 400, height: 70, top: "-6%", left: "-8%", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.065)", "--s-rot": "15deg", "--s-dur": "9s" } as React.CSSProperties}/>
              <div className="bio-pill float-b" style={{ width: 260, height: 48, bottom: "-4%", right: "-4%", background: "rgba(100,206,251,0.03)", border: "1px solid rgba(100,206,251,0.1)", "--s-rot": "-20deg", "--s-dur": "11s", "--s-delay": "1.5s" } as React.CSSProperties}/>
              <div className="bio-rect float-a" style={{ width: 140, height: 140, top: "8%", right: "5%", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", "--s-dur": "10s", "--s-delay": "0.5s" } as React.CSSProperties}/>
              <div className="bio-ring float-b" style={{ width: 280, height: 280, bottom: "-20%", left: "5%", border: "1px solid rgba(255,255,255,0.04)", "--s-dur": "14s", "--s-delay": "2s" } as React.CSSProperties}/>
              {/* Guardnet multi-layer glow */}
              <div className="glow-blob" style={{ width: 700, height: 700, top: "50%", left: "50%", transform: "translate(-50%,-55%)", background: "rgba(250,132,83,0.14)" }}/>
              <div className="glow-blob" style={{ width: 300, height: 300, bottom: -60, right: 60, background: "rgba(100,206,251,0.08)" }}/>
              <div style={{ position: "relative" }}>
                <span className="eyebrow">{copy.final.eyebrow}</span>
                <h2 className="display-sm on-dark">{copy.final.heading}</h2>
                <p className="lead" style={{ margin: "0 auto 32px", maxWidth: "48ch" }}>{copy.final.lead}</p>
                <div className="cta-row">
                  {/* Guardnet gradient fill + Axion TextRoll */}
                  <Link href={ctaHref} className="btn btn-grad-fill btn-roll" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span className="roll-inner"><span data-text={primaryLabel}>{primaryLabel}</span></span>
                  </Link>
                  {/* Guardnet gradient pill outline */}
                  <a href="#pricing" className="btn-grad-pill">
                    <span className="gp-inner">{copy.final.secondaryCta}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Footer: ViralMedia dark 4-col ─── */}
        <footer className="foot-dark" style={{ position: "relative", overflow: "hidden" }}>
          <div className="gn-dots-overlay" style={{ opacity: 0.7 }}/>
          <div className="bio-pill float-a" style={{ width: 340, height: 54, top: "15%", right: "-5%", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", "--s-rot": "-10deg", "--s-dur": "12s" } as React.CSSProperties}/>
          <div className="container" style={{ position: "relative" }}>
            <div className="foot-top" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 32, paddingBottom: 40, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="foot-col">
                {/* Logo mark */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontFamily: "var(--font-cosmica), sans-serif", fontSize: 28, fontWeight: 200, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em", lineHeight: 1, userSelect: "none" }}>6</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>insixlive</span>
                </div>
                <p style={{ fontSize: "var(--text-body)", color: "rgba(255,255,255,0.35)", maxWidth: "32ch", margin: 0, lineHeight: 1.6 }}>{copy.footer.blurb}</p>
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
            <div className="foot-bottom" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 24, flexWrap: "wrap", gap: 12 }}>
              <span>{copy.footer.copyright}</span>
              <span>{copy.footer.builtWith}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
