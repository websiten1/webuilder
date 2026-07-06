// Shared design-system primitives – imported by "use client" page files
import React from "react";
import Link from "next/link";
import { P, T } from "@/lib/design";

// ─── Typography ────────────────────────────────────────────────────────────────

export const H1 = ({ children, dark = false, size = 72, style = {} }: {
  children: React.ReactNode; dark?: boolean; size?: number; style?: React.CSSProperties;
}) => {
  const fs = `clamp(${Math.round(size * 0.5)}px, ${(size / 1200 * 100).toFixed(1)}vw, ${size}px)`;
  return (
    <h1 style={{ fontFamily: P.display, fontSize: fs, lineHeight: 0.98, fontWeight: 400, letterSpacing: -0.02, color: dark ? "#fff" : P.ink, margin: "0 0 18px", ...style }}>{children}</h1>
  );
};

export const H2 = ({ children, dark = false, size = 48, style = {} }: {
  children: React.ReactNode; dark?: boolean; size?: number; style?: React.CSSProperties;
}) => {
  const min = Math.max(Math.round(size * 0.58), 18);
  const fs = `clamp(${min}px, ${(size / 1200 * 100).toFixed(1)}vw, ${size}px)`;
  return (
    <h2 style={{ fontFamily: P.display, fontSize: fs, lineHeight: 1.02, fontWeight: 400, letterSpacing: -0.02, color: dark ? "#fff" : P.ink, margin: "0 0 12px", ...style }}>{children}</h2>
  );
};

export const Lead = ({ children, dark = false, size = 18, style = {} }: {
  children: React.ReactNode; dark?: boolean; size?: number; style?: React.CSSProperties;
}) => (
  <p style={{ fontFamily: P.font, fontSize: size, lineHeight: 1.5, fontWeight: 400, color: dark ? "rgba(255,255,255,0.62)" : P.muted, margin: "0 0 28px", maxWidth: 640, ...style }}>{children}</p>
);

// ─── Eyebrow ───────────────────────────────────────────────────────────────────

export const Eyebrow = ({ children, dark = false, color }: { children: React.ReactNode; dark?: boolean; color?: string }) => {
  const c = color || (dark ? T.green : P.six);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: P.mono, fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase" as const, color: c, marginBottom: 18 }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: c, boxShadow: dark ? `0 0 8px ${c}` : "none" }}/>
      {children}
    </div>
  );
};

// ─── Button ────────────────────────────────────────────────────────────────────

const BTN_V: Record<string, React.CSSProperties> = {
  primary: { background: "linear-gradient(180deg,#FF6A33 0%,#E54B14 100%)", color: "#fff", boxShadow: "0 1px 0 rgba(255,255,255,0.20) inset,0 14px 30px rgba(255,90,31,0.32)" },
  ink:     { background: P.ink, color: "#fff", boxShadow: "0 1px 0 rgba(255,255,255,0.08) inset,0 8px 22px rgba(10,14,20,0.18)" },
  light:   { background: "#fff", color: P.ink, border: `1px solid ${P.line}` },
  ghost:   { background: "transparent", color: P.ink, border: `1px solid ${P.line}` },
  dark:    { background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.10)" },
};

const BTN_S: Record<string, { height: number; padding: string; fontSize: number; borderRadius: number }> = {
  lg: { height: 56, padding: "0 22px", fontSize: 16, borderRadius: 12 },
  md: { height: 46, padding: "0 18px", fontSize: 14, borderRadius: 10 },
  sm: { height: 36, padding: "0 14px", fontSize: 13, borderRadius: 8 },
};

export const Btn = ({ children, href, onClick, variant = "primary", size = "lg", style = {} }: {
  children: React.ReactNode; href?: string; onClick?: () => void;
  variant?: string; size?: string; style?: React.CSSProperties;
}) => {
  const vs = BTN_V[variant] ?? BTN_V.primary;
  const sz = BTN_S[size] ?? BTN_S.lg;
  const base: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: P.font, fontWeight: 600, letterSpacing: -0.1, cursor: "pointer", textDecoration: "none", height: sz.height, padding: sz.padding, fontSize: sz.fontSize, borderRadius: sz.borderRadius, ...vs, ...style };
  if (href) return <Link href={href} style={base}>{children}</Link>;
  return <button onClick={onClick} style={{ ...base, border: (vs.border as string) || "none" }}>{children}</button>;
};

// ─── Icons ─────────────────────────────────────────────────────────────────────

export const ArrowR = ({ size = 14, color = "#fff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 14 14"><path d="M3 7h8M8 4l3 3-3 3" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

export const Check = ({ size = 11, color = P.em2 }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

export const XIcon = ({ size = 11, color = P.six }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M3 3l6 6M9 3l-6 6"/></svg>
);

// ─── DotGrid ───────────────────────────────────────────────────────────────────

export const DotGrid = ({ opacity = 0.06 }: { opacity?: number }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px)`, backgroundSize: "18px 18px" }}/>
);

// ─── TechBadge ─────────────────────────────────────────────────────────────────

export const TechBadge = ({ children, color = T.green }: { children: React.ReactNode; color?: string }) => {
  const bg = color === T.green ? "rgba(74,222,128,0.08)" : color === T.six ? "rgba(255,90,31,0.10)" : "rgba(255,255,255,0.04)";
  const bd = color === T.green ? "rgba(74,222,128,0.30)" : color === T.six ? "rgba(255,90,31,0.35)" : "rgba(255,255,255,0.10)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: P.mono, fontSize: 10.5, fontWeight: 700, color, letterSpacing: 0.5, textTransform: "uppercase" as const, padding: "5px 9px", borderRadius: 999, background: bg, border: `1px solid ${bd}` }}>
      <span style={{ width: 5, height: 5, borderRadius: 3, background: color, boxShadow: `0 0 8px ${color}` }}/>
      {children}
    </span>
  );
};

// ─── TechWindow ────────────────────────────────────────────────────────────────

export const TechWindow = ({ title, sub, status, children, height, style = {} }: {
  title: string; sub?: string; status?: React.ReactNode;
  children: React.ReactNode; height?: number; style?: React.CSSProperties;
}) => (
  <div style={{ background: T.bg, border: `1px solid ${T.line}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 28px 80px rgba(0,0,0,0.40),0 1px 0 rgba(255,255,255,0.04) inset", display: "flex", flexDirection: "column", position: "relative", height, ...style }}>
    <div style={{ height: 32, background: T.bg2, borderBottom: `1px solid ${T.line}`, display: "flex", alignItems: "center", padding: "0 12px", gap: 10, flexShrink: 0 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: 6, background: c }}/>)}
      </div>
      <div style={{ flex: 1, textAlign: "center" as const, fontFamily: P.mono, fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: 0.3, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>
        {title}{sub && <span style={{ marginLeft: 8, color: "rgba(255,255,255,0.25)" }}>· {sub}</span>}
      </div>
      {status ?? <div style={{ width: 45, flexShrink: 0 }}/>}
    </div>
    <div style={{ flex: 1, overflow: "hidden", background: T.bg }}>{children}</div>
  </div>
);

// ─── Code display ──────────────────────────────────────────────────────────────

export const Tok = ({ c = T.text, b = false, children }: { c?: string; b?: boolean; children: React.ReactNode }) => (
  <span style={{ color: c, fontWeight: b ? 600 : 400 }}>{children}</span>
);

export const CodeLine = ({ n, indent = 0, hi = false, children }: { n: number; indent?: number; hi?: boolean; children: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "baseline", minHeight: 20, background: hi ? "rgba(255,90,31,0.07)" : "transparent", borderLeft: hi ? `2px solid ${T.six}` : "2px solid transparent" }}>
    <span style={{ color: T.muted, opacity: 0.45, fontFamily: P.mono, fontSize: 11, width: 30, textAlign: "right" as const, paddingRight: 12, userSelect: "none" as const, flexShrink: 0 }}>{n}</span>
    <span style={{ fontFamily: P.mono, fontSize: 12.5, lineHeight: "20px", paddingLeft: indent * 12, whiteSpace: "pre" as const, color: T.text }}>{children}</span>
  </div>
);

const CODE_LINES: [number, React.ReactNode][] = [
  [0, <><Tok c={T.muted}>{"// app/page.tsx · generated"}</Tok></>],
  [0, <><Tok c={T.plum} b>{"export default"}</Tok>{" "}<Tok c={T.plum} b>{"function"}</Tok>{" "}<Tok c={T.blue}>{"Page"}</Tok>{"() {"}</>],
  [1, <><Tok c={T.plum} b>{"return"}</Tok>{" ("}</>],
  [2, <>{"<"}<Tok c={T.red}>{"main"}</Tok>{" "}<Tok c={T.amber}>{"className"}</Tok>{"="}<Tok c={T.green}>{'"bg-ink text-white"'}</Tok>{">"}</>],
  [3, <>{"<"}<Tok c={T.red}>{"Hero"}</Tok></>],
  [4, <><Tok c={T.amber}>{"eyebrow"}</Tok>{"="}<Tok c={T.green}>{'"24/7 Emergency"'}</Tok></>],
  [4, <><Tok c={T.amber}>{"title"}</Tok>{"="}<Tok c={T.green}>{'"Burst pipe?"'}</Tok></>],
  [4, <><Tok c={T.amber}>{"cta"}</Tok>{"="}<Tok c={T.green}>{'"Call now"'}</Tok>{" />"}</>],
  [3, <>{"<"}<Tok c={T.red}>{"Services"}</Tok>{" "}<Tok c={T.amber}>{"items"}</Tok>{"={services} />"}</>],
  [3, <>{"<"}<Tok c={T.red}>{"Contact"}</Tok>{" "}<Tok c={T.amber}>{"phone"}</Tok>{"={phone} />"}</>],
  [2, <>{"</"}<Tok c={T.red}>{"main"}</Tok>{">"}</>],
  [1, <>{"});"}</>],
  [0, <>{"}"}</>],
];

export const CodeStream = ({ count = CODE_LINES.length, hi = -1, caret = true }: { count?: number; hi?: number; caret?: boolean }) => {
  const lines = CODE_LINES.slice(0, count);
  return (
    <div style={{ padding: "10px 0" }}>
      {lines.map(([indent, c], i) => (
        <CodeLine key={i} n={i + 1} indent={indent as number} hi={i === hi}>
          {c}
          {i === lines.length - 1 && caret && (
            <span style={{ display: "inline-block", width: 6, height: 13, background: T.green, marginLeft: 4, verticalAlign: "middle", animation: "caret 1s infinite", boxShadow: `0 0 6px ${T.green}` }}/>
          )}
        </CodeLine>
      ))}
    </div>
  );
};

// ─── SiteMock ─────────────────────────────────────────────────────────────────

const HEADLINES: Record<string, React.ReactNode> = {
  "Acme Plumbing":   <>Burst pipe?<br/>18 min away.</>,
  "Maria's Hair":    <>Cuts &amp; color,<br/>by Maria.</>,
  "Lia · Photo":     <>Weddings,<br/>told softly.</>,
  "Bistro Marin":    <>The Med,<br/>plated nightly.</>,
  "Dr. Kohl Dental": <>Calm dental<br/>care, Munich.</>,
  "Forge Fitness":   <>Train hard.<br/>Eat well.</>,
  "Sole Café":       <>Coffee,<br/>slow &amp; dark.</>,
  "Stein & Co.":     <>Counsel, on<br/>tap.</>,
  "Bloom Studio":    <>Florals for<br/>the moment.</>,
};

export const SiteMock = ({ name, kind, tint = "dark", accent = P.six, pages = [], slug }: {
  name: string; kind: string; tint?: string; accent?: string; pages?: string[]; slug?: string;
}) => {
  const dark = tint === "dark";
  const bg = dark ? "#0F1A2A" : tint === "warm" ? "#FFEDE4" : "#FFFFFF";
  const fg = dark ? "#FFFFFF" : "#0A0E14";
  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${P.line}`, background: "#fff", boxShadow: "0 12px 30px rgba(10,14,20,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: P.bg2, borderBottom: `1px solid ${P.line}` }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: 4, background: c }}/>)}
        </div>
        <div style={{ flex: 1, fontFamily: P.mono, fontSize: 10.5, color: P.muted }}>{slug || "example.com"}</div>
      </div>
      <div style={{ height: 180, background: bg, position: "relative", overflow: "hidden", padding: "16px 18px" }}>
        <div style={{ position: "absolute", top: -40, right: -30, width: 200, height: 200, borderRadius: 100, background: `radial-gradient(circle,${accent}66,transparent 70%)`, filter: "blur(8px)" }}/>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          <span style={{ fontFamily: P.font, fontSize: 11, fontWeight: 700, color: fg, letterSpacing: -0.2 }}>{name}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {pages.slice(0,3).map(pg => <span key={pg} style={{ fontFamily: P.font, fontSize: 9, color: dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" }}>{pg}</span>)}
          </div>
        </div>
        <div style={{ position: "relative", marginTop: 26 }}>
          <div style={{ fontFamily: P.mono, fontSize: 7, fontWeight: 700, color: accent, textTransform: "uppercase" as const, letterSpacing: 1.4, marginBottom: 4 }}>{kind}</div>
          <div style={{ fontFamily: P.font, fontSize: 18, fontWeight: 700, color: fg, letterSpacing: -0.5, lineHeight: 1.0 }}>
            {HEADLINES[name] ?? <>Crafted for<br/>{name}.</>}
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
            <div style={{ background: accent, color: "#fff", padding: "4px 8px", borderRadius: 4, fontFamily: P.font, fontSize: 9, fontWeight: 600 }}>
              {name === "Acme Plumbing" ? "Call now" : name === "Bistro Marin" ? "Reserve" : "Get in touch"}
            </div>
            <div style={{ border: `1px solid ${dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.15)"}`, color: fg, padding: "4px 8px", borderRadius: 4, fontFamily: P.font, fontSize: 9, fontWeight: 600 }}>Menu</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Layout ────────────────────────────────────────────────────────────────────

export const Container = ({ children, max = 1200, style = {} }: { children: React.ReactNode; max?: number; style?: React.CSSProperties }) => (
  <div style={{ maxWidth: max, margin: "0 auto", padding: "0 clamp(16px, 4vw, 32px)", ...style }}>{children}</div>
);

export const Section = ({ children, dark = false, paddingY = 96, style = {} }: {
  children: React.ReactNode; dark?: boolean; paddingY?: number; style?: React.CSSProperties;
}) => {
  const half = Math.round(paddingY / 2);
  const vw = (paddingY / 900 * 100).toFixed(1);
  const pad = `clamp(${half}px, ${vw}vw, ${paddingY}px)`;
  return (
    <section style={{ padding: `${pad} 0`, background: dark ? T.bg : "transparent", color: dark ? "#fff" : P.ink, position: "relative", overflow: "hidden", ...style }}>
      {children}
    </section>
  );
};

// ─── PageHero ──────────────────────────────────────────────────────────────────

export const PageHero = ({ eyebrow, title, sub, dark = false, children }: {
  eyebrow: string; title: React.ReactNode; sub?: string; dark?: boolean; children?: React.ReactNode;
}) => (
  <Section dark={dark} paddingY={dark ? 100 : 88}>
    {dark && <DotGrid opacity={0.05}/>}
    {dark && <div style={{ position: "absolute", top: -160, right: -160, width: 520, height: 520, borderRadius: 260, background: "radial-gradient(circle,rgba(255,90,31,0.28),rgba(255,90,31,0) 65%)", filter: "blur(20px)", pointerEvents: "none" }}/>}
    <Container>
      <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
      <H1 dark={dark} size={dark ? 72 : 64}>{title}</H1>
      {sub && <Lead dark={dark} style={{ maxWidth: 680 }}>{sub}</Lead>}
      {children}
    </Container>
  </Section>
);

// ─── FinalCTA ──────────────────────────────────────────────────────────────────

export const FinalCTA = () => (
  <Section dark paddingY={120}>
    <DotGrid opacity={0.05}/>
    <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 900, height: 900, borderRadius: 450, background: "radial-gradient(circle,rgba(255,90,31,0.25),rgba(255,90,31,0) 60%)", filter: "blur(20px)", pointerEvents: "none" }}/>
    <Container max={900}>
      <div style={{ textAlign: "center" as const, position: "relative" }}>
        <Eyebrow dark>// six minutes</Eyebrow>
        <H1 dark size={64} style={{ textAlign: "center" as const, maxWidth: 800, margin: "0 auto 18px" }}>
          Six minutes from now,<br/>
          <span style={{ color: T.six }}>your website could be live.</span>
        </H1>
        <Lead dark size={18} style={{ margin: "0 auto 32px", textAlign: "center" as const, maxWidth: 540 }}>
          One-time payment. No subscription. Full ownership of the code.
        </Lead>
        <Btn variant="primary" href="/signup">
          Build my website — from €49 <ArrowR/>
        </Btn>
        <div style={{ marginTop: 18, fontFamily: P.mono, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          Stripe checkout · 7-day refund if generation fails
        </div>
      </div>
    </Container>
  </Section>
);

// ─── PLANS + PlanCard ──────────────────────────────────────────────────────────

export const PLANS = [
  { id: "website", name: "Website", price: 59.99, tag: "One website. Fully yours. Forever.", cta: "Build my website", after: "Domain not included — purchase separately on Vercel", badge: null as string | null, items: [["AI-generated professional website",true],["Deployed to your own Vercel account",true],["Full source code ownership — keep it forever",true],["Mobile-responsive · SSL · custom domain ready",true],["Custom domain not included — buy on Vercel (~€12–30/yr)",false]] as [string,boolean][] },
];

export const PlanCard = ({ plan, compact = false }: { plan: typeof PLANS[0]; compact?: boolean }) => {
  const featured = plan.badge != null;
  return (
    <div style={{ position: "relative", padding: compact ? "26px 24px" : "32px 28px", borderRadius: 18, background: featured ? T.bg : "#fff", color: featured ? "#fff" : P.ink, border: featured ? "none" : `1px solid ${P.line}`, boxShadow: featured ? "0 24px 60px rgba(10,14,20,0.28)" : "0 1px 0 rgba(0,0,0,0.02)", overflow: "hidden" }}>
      {featured && <><DotGrid opacity={0.05}/><div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: 110, background: "radial-gradient(circle,rgba(255,90,31,0.45),rgba(255,90,31,0) 65%)", pointerEvents: "none" }}/></>}
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontFamily: P.mono, fontSize: 12, fontWeight: 700, color: featured ? T.muted : P.muted, letterSpacing: 0.8, textTransform: "uppercase" as const }}>{plan.name}</span>
          {plan.badge && <TechBadge color={T.six}>{plan.badge}</TechBadge>}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
          <span style={{ fontFamily: P.mono, fontSize: `clamp(28px, ${compact ? 3.5 : 4.3}vw, ${compact ? 42 : 52}px)`, fontWeight: 700, letterSpacing: -2, color: featured ? "#fff" : P.ink }}>€{plan.price.toFixed(2)}</span>
          <span style={{ fontFamily: P.font, fontSize: 14, color: featured ? T.muted : P.muted }}>one-time</span>
        </div>
        <div style={{ fontFamily: P.font, fontSize: 14, color: featured ? "rgba(255,255,255,0.65)" : P.muted, marginBottom: 24 }}>{plan.tag}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {plan.items.map(([text, ok], i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontFamily: P.font, fontSize: 14, color: featured ? "rgba(255,255,255,0.85)" : P.inkSoft }}>
              <div style={{ width: 18, height: 18, borderRadius: 9, background: ok ? (featured ? "rgba(74,222,128,0.15)" : P.emSoft) : (featured ? "rgba(255,255,255,0.06)" : P.bg2), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                {ok ? <Check size={10} color={featured ? T.green : P.em2}/> : <svg width="9" height="9" viewBox="0 0 9 9"><path d="M2 4.5h5" stroke={featured ? T.muted : P.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>}
              </div>
              {text}
            </div>
          ))}
        </div>
        <Btn variant={featured ? "primary" : "ink"} href="/signup" style={{ width: "100%" }}>
          {plan.cta}
        </Btn>
        <div style={{ marginTop: 14, fontFamily: P.mono, fontSize: 11, color: featured ? T.muted : P.muted, textAlign: "center" as const }}>{plan.after}</div>
      </div>
    </div>
  );
};

// ─── EXAMPLES data ─────────────────────────────────────────────────────────────

export const EXAMPLES = [
  { name: "Acme Plumbing",   kind: "24/7 Emergency",    tint: "dark",  accent: T.six,   pages: ["Home","Services","Contact"],  slug: "acme-plumbing.vercel.app" },
  { name: "Maria's Hair",    kind: "Salon · Munich",    tint: "white", accent: P.six,   pages: ["Home","Menu","Book"],         slug: "marias-hair.com" },
  { name: "Lia · Photo",     kind: "Wedding portfolio", tint: "warm",  accent: P.ink,   pages: ["Work","About","Contact"],     slug: "liaphoto.de" },
  { name: "Bistro Marin",    kind: "Restaurant",        tint: "dark",  accent: T.amber, pages: ["Menu","Reservations"],        slug: "bistromarin.fr" },
  { name: "Dr. Kohl Dental", kind: "Clinic",            tint: "white", accent: T.sky,   pages: ["Care","Book","Insurance"],    slug: "kohl-dental.de" },
  { name: "Forge Fitness",   kind: "Coach",             tint: "dark",  accent: T.green, pages: ["Programs","Coach","Reviews"], slug: "forgefit.io" },
  { name: "Sole Café",       kind: "Coffee",            tint: "warm",  accent: P.six,   pages: ["Menu","Hours","Find us"],     slug: "solecafe.berlin" },
  { name: "Stein & Co.",     kind: "Law practice",      tint: "white", accent: P.ink,   pages: ["Areas","Team","Contact"],     slug: "stein-co.de" },
  { name: "Bloom Studio",    kind: "Florals · Events",  tint: "warm",  accent: "#E45A92", pages: ["Work","Inquire","About"],   slug: "bloomstudio.co" },
];
