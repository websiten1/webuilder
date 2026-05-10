// Inline mini-website mockups — purely CSS/SVG, no images required.
// Each renders a convincing full-page website at small scale inside a browser frame.

import React from "react";

function BrowserChrome({ url, dark = false }: { url: string; dark?: boolean }) {
  return (
    <div style={{
      height: 34, background: dark ? "#1A1A1A" : "#F0F0ED",
      borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#E0E0DC"}`,
      display: "flex", alignItems: "center", padding: "0 10px", gap: 8, flexShrink: 0,
    }}>
      <div style={{ display: "flex", gap: 5 }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#FF5F57" }}/>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#FEBC2E" }}/>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#28C840" }}/>
      </div>
      <div style={{
        flex: 1, height: 20, background: dark ? "#2A2A2A" : "#fff",
        borderRadius: 5, display: "flex", alignItems: "center", padding: "0 8px", gap: 4,
        border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#E0E0DC"}`,
      }}>
        <svg width="8" height="9" viewBox="0 0 8 9" fill="none">
          <path d="M1.5 4V3a2.5 2.5 0 015 0v1M1 4h6v3.5H1V4z" stroke={dark ? "#666" : "#AAA"} strokeWidth="0.8" strokeLinecap="round"/>
        </svg>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 9, color: dark ? "#888" : "#888", letterSpacing: 0.2 }}>{url}</span>
      </div>
    </div>
  );
}

// ─── 1. Bistro Marin — Fine Dining Restaurant (dark, editorial) ───────────────

export function DemoBistro({ compact = false }: { compact?: boolean }) {
  const h = compact ? 220 : 280;
  return (
    <div style={{ width: "100%", borderRadius: 12, overflow: "hidden", border: "1px solid #E2E2DE", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
      <BrowserChrome url="bistromarin.vercel.app" dark />
      <div style={{ height: h, background: "#0A0B0E", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {/* Grain texture */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}/>
        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: 2, textTransform: "uppercase" }}>Bistro Marin</span>
            <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 1 }}>Est. 2019 · Munich</span>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {["Menu", "Reservations", "About"].map(l => <span key={l} style={{ fontFamily: "ui-monospace,monospace", fontSize: 8, color: "rgba(255,255,255,0.45)", letterSpacing: 1, textTransform: "uppercase" }}>{l}</span>)}
          </div>
        </div>
        {/* Hero */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 20px 18px", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: "60%", bottom: 0, background: "linear-gradient(135deg, rgba(200,120,40,0.15), rgba(180,80,20,0.08))", borderLeft: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.5 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)" }}/>
              </div>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 8, color: "#FF5A1F", letterSpacing: 2, textTransform: "uppercase" }}>Fine Dining · Contemporary French</span>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: compact ? 20 : 24, fontWeight: 400, color: "#fff", margin: "6px 0 10px", letterSpacing: -0.5, lineHeight: 1.15, fontStyle: "italic" }}>
              Where every meal<br/>becomes a memory.
            </h2>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ background: "#FF5A1F", borderRadius: 6, padding: "6px 14px", fontFamily: "ui-monospace,monospace", fontSize: 9, color: "#fff", letterSpacing: 0.8, textTransform: "uppercase" }}>Reserve a Table</div>
              <div style={{ border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "6px 14px", fontFamily: "ui-monospace,monospace", fontSize: 9, color: "rgba(255,255,255,0.6)", letterSpacing: 0.8, textTransform: "uppercase" }}>View Menu</div>
            </div>
          </div>
        </div>
        {/* Bottom strip */}
        <div style={{ height: 30, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
          {["Tues–Sun 6pm–11pm", "+49 89 1234 5678", "Maximilianstr. 12"].map(t => (
            <span key={t} style={{ fontFamily: "ui-monospace,monospace", fontSize: 8, color: "rgba(255,255,255,0.28)", letterSpacing: 0.6 }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 2. Sarah A. Studio — Photography Portfolio (light, editorial) ────────────

export function DemoPhoto({ compact = false }: { compact?: boolean }) {
  const h = compact ? 220 : 280;
  return (
    <div style={{ width: "100%", borderRadius: 12, overflow: "hidden", border: "1px solid #E2E2DE", boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}>
      <BrowserChrome url="sarah-a-studio.vercel.app" />
      <div style={{ height: h, background: "#FAFAF8", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid #EEEEE9" }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#0A0E14", letterSpacing: 1, fontStyle: "italic" }}>Sarah A.</span>
          <div style={{ display: "flex", gap: 16 }}>
            {["Work", "About", "Contact"].map(l => <span key={l} style={{ fontFamily: "ui-monospace,monospace", fontSize: 8, color: "#888", letterSpacing: 1.2, textTransform: "uppercase" }}>{l}</span>)}
          </div>
        </div>
        {/* Photo grid */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2, padding: 10 }}>
          <div style={{ background: "#D8D0C8", borderRadius: 6, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #C8BFB5, #E0D8CF)" }}/>
            <div style={{ position: "absolute", bottom: 10, left: 10 }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 10, color: "rgba(255,255,255,0.9)", fontStyle: "italic" }}>Wedding Collection</div>
              <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 8, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>24 photos</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[["#E8E0D6", "Portrait"], ["#CED8D0", "Outdoor"], ["#D6D0E0", "Events"]].map(([c, l]) => (
              <div key={l} style={{ flex: 1, background: c, borderRadius: 6, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 7, color: "rgba(0,0,0,0.45)", letterSpacing: 0.8, textTransform: "uppercase" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Tagline */}
        <div style={{ padding: "8px 14px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: compact ? 11 : 13, color: "#0A0E14", fontStyle: "italic" }}>Wedding & Portrait Photography</div>
            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 8, color: "#888", marginTop: 2, letterSpacing: 0.6 }}>Munich · Available worldwide</div>
          </div>
          <div style={{ background: "#0A0E14", borderRadius: 6, padding: "5px 12px", fontFamily: "ui-monospace,monospace", fontSize: 8, color: "#fff", letterSpacing: 0.8, textTransform: "uppercase" }}>Book Now</div>
        </div>
      </div>
    </div>
  );
}

// ─── 3. Acme Plumbing — Emergency Service (dark navy, emerald) ────────────────

export function DemoPlumbing({ compact = false }: { compact?: boolean }) {
  const h = compact ? 220 : 280;
  return (
    <div style={{ width: "100%", borderRadius: 12, overflow: "hidden", border: "1px solid #E2E2DE", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
      <BrowserChrome url="acme-plumbing.vercel.app" dark />
      <div style={{ height: h, background: "#0D1829", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: "#00B377", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 5V3a2 2 0 012-2h1v2M9 3V1h1a2 2 0 012 2v2M3 5h8v4a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </div>
            <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: -0.3 }}>Acme Plumbing</span>
          </div>
          <div style={{ background: "#00B377", borderRadius: 6, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M2 3h2l1 3-1.5 1.5a10 10 0 005 5L10 11l3 1v2a1 1 0 01-1 1A11 11 0 012 3z" fill="#fff"/></svg>
            <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 8, color: "#fff", fontWeight: 700 }}>24/7 Emergency</span>
          </div>
        </div>
        {/* Hero */}
        <div style={{ flex: 1, padding: "18px 18px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(0,179,119,0.15)", border: "1px solid rgba(0,179,119,0.25)", borderRadius: 99, padding: "3px 10px", marginBottom: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: "#00B377" }}/>
              <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 8, color: "#00B377", letterSpacing: 0.8 }}>Available Now · Munich</span>
            </div>
            <h2 style={{ fontFamily: "var(--font)", fontSize: compact ? 17 : 20, fontWeight: 700, color: "#fff", margin: "0 0 6px", lineHeight: 1.2, letterSpacing: -0.5 }}>
              24/7 Emergency<br/>Plumbing & Repairs
            </h2>
            <p style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, color: "rgba(255,255,255,0.45)", margin: 0 }}>Licensed · Insured · 30-min response</p>
          </div>
          <div>
            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: compact ? 16 : 20, fontWeight: 700, color: "#00B377", letterSpacing: -0.5, marginBottom: 10 }}>+49 89 5555 1234</div>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ flex: 1, background: "#FF5A1F", borderRadius: 7, padding: "7px 0", textAlign: "center" as const, fontFamily: "ui-monospace,monospace", fontSize: 9, color: "#fff", letterSpacing: 0.5, textTransform: "uppercase" as const }}>Call Now</div>
              <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 7, padding: "7px 0", textAlign: "center" as const, fontFamily: "ui-monospace,monospace", fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: 0.5, textTransform: "uppercase" as const }}>Get Quote</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 4. Dr. Park Dental — Dental Clinic (clean, professional) ────────────────

export function DemoDental({ compact = false }: { compact?: boolean }) {
  const h = compact ? 220 : 280;
  return (
    <div style={{ width: "100%", borderRadius: 12, overflow: "hidden", border: "1px solid #E2E2DE", boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}>
      <BrowserChrome url="drpark-dental.vercel.app" />
      <div style={{ height: h, background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 18px", borderBottom: "1px solid #F0F0EC" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "#0066FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 2c1.5 0 2 1 4 1s2.5-.8 3.5-.8c1.5 0 2 1.2 2 2.6C14.5 8.7 13 11.5 12 14c-.4 1.2-1.4 1-1.5-.4L10 11c-.1-.8-1.2-.8-1.3 0l-.5 2.6C8 14.8 7 14.5 6.7 13.2 5.4 10 4 7 4 4.8c0-1.4.5-2.8.6-2.8H5z" fill="#fff"/></svg>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font)", fontSize: 11, fontWeight: 700, color: "#0A0E14" }}>Dr. Park Dental</div>
              <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 7, color: "#888", letterSpacing: 0.5 }}>Family & Cosmetic Dentistry</div>
            </div>
          </div>
          <div style={{ background: "#0066FF", borderRadius: 6, padding: "5px 12px", fontFamily: "var(--font)", fontSize: 9, color: "#fff", fontWeight: 600 }}>Book Online</div>
        </div>
        {/* Hero split */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#EEF4FF", borderRadius: 99, padding: "3px 9px", marginBottom: 10, width: "fit-content" }}>
              <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="#0066FF" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 8, color: "#0066FF" }}>New Patient Special</span>
            </div>
            <h2 style={{ fontFamily: "var(--font)", fontSize: compact ? 15 : 17, fontWeight: 700, color: "#0A0E14", margin: "0 0 6px", lineHeight: 1.2, letterSpacing: -0.4 }}>Smile brighter.<br/>Live better.</h2>
            <p style={{ fontFamily: "var(--font)", fontSize: 10, color: "#6B7180", margin: "0 0 12px", lineHeight: 1.5 }}>Professional dental care for the whole family.</p>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ background: "#0A0E14", borderRadius: 6, padding: "5px 10px", fontFamily: "var(--font)", fontSize: 8, color: "#fff", fontWeight: 600 }}>Schedule Visit</div>
              <div style={{ border: "1px solid #E2E2DE", borderRadius: 6, padding: "5px 10px", fontFamily: "var(--font)", fontSize: 8, color: "#6B7180" }}>Learn More</div>
            </div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #EEF4FF, #DCE9FF)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 80, height: 80, borderRadius: "50%", background: "rgba(0,102,255,0.12)", border: "2px solid rgba(0,102,255,0.2)" }}/>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 50, height: 50, borderRadius: "50%", background: "rgba(0,102,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 3c2 0 2.5 1.2 5 1.2s3.2-1 4.5-1c2 0 2.5 1.5 2.5 3.3 0 5-2.4 9-3.9 13-.6 1.8-2.3 1.2-2.3-1.2L12.3 17c-.2-1-2.1-1-2.3 0l-.5 1.3c0 2.4-1.8 3-2.3 1C5.3 15 3 11 3 7.5c0-2 .7-4.5 1-4.5H7z" fill="#0066FF" fillOpacity="0.6"/></svg>
            </div>
          </div>
        </div>
        {/* Trust bar */}
        <div style={{ height: 28, borderTop: "1px solid #F0F0EC", display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
          {["⭐ 4.9/5 (240 reviews)", "15+ Years Experience", "Same-day appointments"].map(t => (
            <span key={t} style={{ fontFamily: "ui-monospace,monospace", fontSize: 8, color: "#888" }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 5. Meridian Partners — Consulting (minimal, monospace) ──────────────────

export function DemoConsult({ compact = false }: { compact?: boolean }) {
  const h = compact ? 220 : 280;
  return (
    <div style={{ width: "100%", borderRadius: 12, overflow: "hidden", border: "1px solid #E2E2DE", boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}>
      <BrowserChrome url="meridian-partners.vercel.app" />
      <div style={{ height: h, background: "#FAFAF8", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
          <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, fontWeight: 700, color: "#0A0E14", letterSpacing: -0.3 }}>MERIDIAN</span>
          <div style={{ display: "flex", gap: 16 }}>
            {["Services", "Work", "Contact"].map(l => <span key={l} style={{ fontFamily: "ui-monospace,monospace", fontSize: 8, color: "#888", letterSpacing: 1 }}>{l}</span>)}
          </div>
        </div>
        {/* Divider line */}
        <div style={{ height: 1, background: "#E8E8E4", margin: "0 20px" }}/>
        {/* Hero */}
        <div style={{ flex: 1, padding: "20px 20px 0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 8, color: "#FF5A1F", letterSpacing: 2, textTransform: "uppercase" as const }}>Strategy · Consulting</span>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: compact ? 18 : 22, fontWeight: 400, color: "#0A0E14", margin: "8px 0 12px", lineHeight: 1.2, letterSpacing: -0.4 }}>
              Building businesses<br/><em>that last.</em>
            </h2>
            <p style={{ fontFamily: "var(--font)", fontSize: 10, color: "#6B7180", margin: 0, lineHeight: 1.65, maxWidth: 260 }}>
              Strategic advisory for growth-stage companies. We help founders make the decisions that define the next decade.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, paddingBottom: 18 }}>
            <div style={{ background: "#0A0E14", borderRadius: 6, padding: "7px 16px", fontFamily: "var(--font)", fontSize: 9, color: "#fff", fontWeight: 600 }}>Schedule a call</div>
            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, color: "#888", display: "flex", alignItems: "center" }}>hello@meridian.co</div>
          </div>
        </div>
        {/* Stats row */}
        <div style={{ height: 38, borderTop: "1px solid #E8E8E4", display: "flex" }}>
          {[["12+", "years"], ["40+", "clients"], ["€2.4B+", "value created"]].map(([v, l]) => (
            <div key={l} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", borderRight: "1px solid #E8E8E4", gap: 1 }}>
              <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, fontWeight: 700, color: "#0A0E14" }}>{v}</span>
              <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 7, color: "#888", textTransform: "uppercase" as const, letterSpacing: 0.8 }}>{l}</span>
            </div>
          ))}
          <div style={{ flex: 1 }}/>
        </div>
      </div>
    </div>
  );
}

// ─── 6. Maria's Hair Studio — Salon (warm, inviting) ─────────────────────────

export function DemoSalon({ compact = false }: { compact?: boolean }) {
  const h = compact ? 220 : 280;
  return (
    <div style={{ width: "100%", borderRadius: 12, overflow: "hidden", border: "1px solid #E2E2DE", boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}>
      <BrowserChrome url="marias-studio.vercel.app" />
      <div style={{ height: h, background: "#FFF8F3", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 18px", borderBottom: "1px solid #F0E8E0" }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontStyle: "italic", color: "#2A1810" }}>Maria&apos;s Studio</div>
            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 7, color: "#B08060", letterSpacing: 0.8, textTransform: "uppercase" as const }}>Hair · Color · Styling</div>
          </div>
          <div style={{ background: "#FF5A1F", borderRadius: 20, padding: "5px 12px", fontFamily: "var(--font)", fontSize: 9, color: "#fff", fontWeight: 600 }}>Book a Session</div>
        </div>
        {/* Service grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, padding: "10px 12px 8px" }}>
          {[
            { bg: "#E8D5C4", label: "Cut & Style", price: "from €45" },
            { bg: "#D4C0B0", label: "Color", price: "from €85" },
            { bg: "#C8B8A0", label: "Balayage", price: "from €120" },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 8, padding: "8px 8px 6px", position: "relative", overflow: "hidden" }}>
              <div style={{ height: compact ? 36 : 44, background: "rgba(255,255,255,0.3)", borderRadius: 5, marginBottom: 5 }}/>
              <div style={{ fontFamily: "var(--font)", fontSize: 8, fontWeight: 600, color: "#2A1810" }}>{s.label}</div>
              <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 7, color: "#8A6050", marginTop: 1 }}>{s.price}</div>
            </div>
          ))}
        </div>
        {/* Hero text */}
        <div style={{ flex: 1, padding: "6px 14px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: compact ? 14 : 17, fontWeight: 400, color: "#2A1810", margin: "0 0 4px", fontStyle: "italic", lineHeight: 1.3 }}>
              Your hair, your story.
            </h2>
            <p style={{ fontFamily: "var(--font)", fontSize: 9, color: "#8A6050", margin: 0, lineHeight: 1.55 }}>
              Premium hair salon in Schwabing, Munich. 10 years of transformations.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 3 }}>
              {[...Array(5)].map((_,i) => <span key={i} style={{ color: "#FF5A1F", fontSize: 9 }}>★</span>)}
            </div>
            <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 8, color: "#8A6050" }}>4.9 · 312 reviews</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Large hero demo (used in landing page hero section) ──────────────────────

export function DemoHero() {
  return (
    <div style={{ width: "100%", borderRadius: 14, overflow: "hidden", border: "1px solid #E2E2DE", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
      <BrowserChrome url="acme-plumbing.vercel.app" dark />
      {/* Full website preview */}
      <div style={{ background: "#0D1829", height: 420, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#00B377", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5V3a2 2 0 012-2h1v2M9 3V1h1a2 2 0 012 2v2M3 5h8v4a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </div>
            <div>
              <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: -0.3 }}>Acme Plumbing</div>
              <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 0.5 }}>Licensed · Munich</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {["Services", "About", "Reviews"].map(l => <span key={l} style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: 0.8 }}>{l}</span>)}
            <div style={{ background: "#00B377", borderRadius: 8, padding: "7px 16px", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 3h2l1 3-1.5 1.5a10 10 0 005 5L10 11l3 1v2a1 1 0 01-1 1A11 11 0 012 3z" fill="#fff"/></svg>
              <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: "#fff", fontWeight: 700 }}>24/7 Emergency</span>
            </div>
          </div>
        </div>
        {/* Hero */}
        <div style={{ flex: 1, display: "flex", padding: "36px 28px", gap: 32, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,179,119,0.15)", border: "1px solid rgba(0,179,119,0.3)", borderRadius: 99, padding: "4px 12px", marginBottom: 16 }}>
              <div style={{ width: 7, height: 7, borderRadius: 4, background: "#00B377" }}/>
              <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: "#00B377", letterSpacing: 1 }}>Available Now · 30-min response</span>
            </div>
            <h1 style={{ fontFamily: "var(--font)", fontSize: 36, fontWeight: 800, color: "#fff", margin: "0 0 14px", lineHeight: 1.1, letterSpacing: -1 }}>
              Emergency Plumbing<br/>Done Right. 24/7.
            </h1>
            <p style={{ fontFamily: "var(--font)", fontSize: 14, color: "rgba(255,255,255,0.55)", margin: "0 0 24px", lineHeight: 1.65, maxWidth: 380 }}>
              Certified plumbers available around the clock. Transparent pricing, guaranteed workmanship.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ background: "#FF5A1F", borderRadius: 10, padding: "12px 24px", fontFamily: "var(--font)", fontSize: 13, fontWeight: 700, color: "#fff", boxShadow: "0 4px 14px rgba(255,90,31,0.35)" }}>Call Now: +49 89 5555 1234</div>
              <div style={{ border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: "12px 20px", fontFamily: "var(--font)", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Get a Quote</div>
            </div>
          </div>
          {/* Right: service cards */}
          <div style={{ width: 200, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["Burst Pipes", "Emergency repair"],
              ["Drain Cleaning", "Same-day service"],
              ["Boiler Repair", "Certified engineers"],
            ].map(([t, s]) => (
              <div key={t} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(0,179,119,0.2)", border: "1px solid rgba(0,179,119,0.3)", flexShrink: 0 }}/>
                <div>
                  <div style={{ fontFamily: "var(--font)", fontSize: 12, fontWeight: 600, color: "#fff" }}>{t}</div>
                  <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Trust bar */}
        <div style={{ height: 36, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", gap: 32, flexShrink: 0 }}>
          {["⭐ 4.9/5 · 340 Reviews", "✓ Fully Licensed & Insured", "✓ 30-min Guaranteed Response", "✓ Upfront Pricing"].map(t => (
            <span key={t} style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
