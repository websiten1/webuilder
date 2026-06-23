// @ts-nocheck — requires: npm install lucide-react dotted-map recharts
"use client";

import React from "react";
import { Activity, ArrowRight, Files, Globe, MapPin, Zap } from "lucide-react";
import DottedMap from "dotted-map";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import * as RechartsPrimitive from "recharts";

// ─── Minimal cn helper (no shadcn dep) ────────────────────────────────────────
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Dotted world-map ────────────────────────────────────────────────────────
const map = new DottedMap({ height: 55, grid: "diagonal" });
const mapPoints = map.getPoints();

function WorldMap() {
  return (
    <svg viewBox="0 0 120 60" className="w-full h-auto" style={{ color: "rgba(255,90,0,0.35)" }}>
      {mapPoints.map((point: { x: number; y: number }, i: number) => (
        <circle key={i} cx={point.x} cy={point.y} r={0.15} fill="currentColor" />
      ))}
      {/* Highlight dots for EU cities */}
      {[
        { cx: 57.5, cy: 22, label: "Berlin" },
        { cx: 56,   cy: 23, label: "Paris" },
        { cx: 59,   cy: 23, label: "Bucharest" },
        { cx: 56.5, cy: 22, label: "Amsterdam" },
        { cx: 58,   cy: 25, label: "Lisbon" },
      ].map(({ cx, cy, label }) => (
        <circle key={label} cx={cx} cy={cy} r={0.55} fill="#ff5a00" opacity={0.9} />
      ))}
    </svg>
  );
}

// ─── Chart ────────────────────────────────────────────────────────────────────
const chartData = [
  { luna: "Ian", sites: 12 },
  { luna: "Feb", sites: 28 },
  { luna: "Mar", sites: 45 },
  { luna: "Apr", sites: 61 },
  { luna: "Mai", sites: 94 },
  { luna: "Iun", sites: 138 },
];

function DeployChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fillSites" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff5a00" stopOpacity={0.55} />
            <stop offset="80%" stopColor="#ff5a00" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="luna" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12, color: "#fff" }}
          labelStyle={{ color: "rgba(255,255,255,0.5)" }}
          cursor={{ stroke: "rgba(255,90,0,0.3)" }}
          formatter={(v: number) => [`${v} site-uri`, ""]}
        />
        <Area strokeWidth={2} dataKey="sites" type="monotone" fill="url(#fillSites)" stroke="#ff5a00" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Notification messages ────────────────────────────────────────────────────
interface Message { title: string; time: string; content: string; color: string }
const messages: Message[] = [
  { title: "Site lansat", time: "acum 2 min", content: "bistrocuibul.ro e online și indexabil.", color: "from-orange-500 to-red-500" },
  { title: "Domeniu conectat", time: "acum 8 min", content: "cuibul-bistro.vercel.app → bistrocuibul.ro", color: "from-green-500 to-teal-500" },
  { title: "Cod tău în Vercel", time: "acum 14 min", content: "Repo deploy: acme-instalatii — 100% al tău.", color: "from-blue-500 to-indigo-600" },
  { title: "Generare completă", time: "acum 19 min", content: "5 pagini generate în 5 min 42 sec.", color: "from-yellow-400 to-orange-500" },
  { title: "Plată unică procesată", time: "acum 24 min", content: "Pro — 59,99 €. Fără factură lunară.", color: "from-purple-500 to-pink-500" },
  { title: "SSL activ", time: "acum 31 min", content: "Certificat Let's Encrypt aplicat automat.", color: "from-sky-400 to-blue-600" },
];

function NotificationCard() {
  return (
    <div style={{
      width: "100%", maxWidth: 380, height: 260,
      background: "rgba(255,255,255,0.02)",
      borderRadius: 16, padding: 12,
      overflowY: "hidden", position: "relative",
    }}>
      {/* fade-out at bottom */}
      <div style={{
        position: "absolute", inset: "auto 0 0 0", height: 64,
        background: "linear-gradient(to top, rgba(12,12,14,0.95), transparent)",
        zIndex: 2, borderRadius: "0 0 16px 16px",
      }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              padding: "10px 12px",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              background: "rgba(255,255,255,0.03)",
              animation: `isi-fadeup 0.4s ease ${i * 0.18}s both`,
            }}
          >
            <div
              style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: `linear-gradient(135deg, var(--from), var(--to))`,
              }}
              className={`bg-gradient-to-br ${msg.color}`}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>{msg.title}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>· {msg.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2, lineHeight: 1.4 }}>{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, subtitle, description }: {
  icon: React.ReactNode; title: string; subtitle: string; description: string;
}) {
  return (
    <div style={{
      position: "relative", display: "flex", flexDirection: "column", gap: 12,
      padding: "24px 20px",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      borderLeft: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(255,255,255,0.02)",
      transition: "background .2s ease",
      overflow: "hidden",
      minHeight: 160,
    }}>
      <div>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
          {icon} {title}
        </span>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 500, color: "#fff", lineHeight: 1.4 }}>
          {subtitle}{" "}
          <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>{description}</span>
        </h3>
      </div>
      {/* Corner arrow */}
      <div style={{
        position: "absolute", bottom: 14, right: 14,
        width: 32, height: 32, borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(255,255,255,0.5)",
        transition: "border-color .2s, color .2s",
      }}>
        <ArrowRight size={14} />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FeaturedBentoSection() {
  return (
    <section style={{
      background: "#0c0c0e",
      padding: "100px 0",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes isi-fadeup { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        .isi-bento-cell { transition: background .25s ease; }
        .isi-bento-cell:hover { background: rgba(255,255,255,0.04) !important; }
        @media (max-width: 768px) {
          .isi-bento-grid { grid-template-columns: 1fr !important; }
          .isi-bento-cell { border-right: none !important; }
        }
        @media (max-width: 640px) {
          .isi-bento-cell { padding: 24px 20px !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Grid: 2×2 */}
        <div className="isi-bento-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "auto auto",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 24,
          overflow: "hidden",
        }}>

          {/* 1 — MAP (top left) */}
          <div className="isi-bento-cell" style={{
            padding: "36px 32px",
            borderRight: "1px solid rgba(255,255,255,0.07)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.01)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
              <MapPin size={13} /> insixlive · UE
            </div>
            <h3 style={{ margin: "0 0 16px", fontSize: "clamp(1rem,1.6vw,1.2rem)", fontWeight: 500, color: "#fff", lineHeight: 1.4 }}>
              Site-uri active în toată Europa.{" "}
              <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>Fiecare punct — o afacere care deține codul.</span>
            </h3>
            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute", top: 32, left: "50%", transform: "translateX(-50%)",
                zIndex: 10, padding: "5px 12px",
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                fontSize: 11, color: "#fff", fontWeight: 500,
                display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", flexShrink: 0, display: "inline-block" }} />
                Ultima lansare: Cluj-Napoca, RO
              </div>
              <WorldMap />
            </div>
          </div>

          {/* 2 — NOTIFICATIONS (top right) */}
          <div className="isi-bento-cell" style={{
            padding: "36px 32px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.02)",
            display: "flex", flexDirection: "column", gap: 20,
          }}>
            <div>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 6 }}>
                <Globe size={13} /> Activitate în timp real
              </span>
              <h3 style={{ margin: "10px 0 0", fontSize: "clamp(1rem,1.6vw,1.2rem)", fontWeight: 500, color: "#fff", lineHeight: 1.4 }}>
                De la brief la online.{" "}
                <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>Fiecare notificare = un antreprenor care tocmai și-a lansat site-ul.</span>
              </h3>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <NotificationCard />
            </div>
          </div>

          {/* 3 — CHART (bottom left) */}
          <div className="isi-bento-cell" style={{
            padding: "36px 32px",
            borderRight: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.01)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
              <Activity size={13} /> Site-uri lansate / lună
            </div>
            <h3 style={{ margin: "0 0 24px", fontSize: "clamp(1rem,1.6vw,1.2rem)", fontWeight: 500, color: "#fff", lineHeight: 1.4 }}>
              Creștere lunară.{" "}
              <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>Mai mulți antreprenori aleg să dețină în loc să închirieze.</span>
            </h3>
            <DeployChart />
          </div>

          {/* 4 — FEATURE CARDS (bottom right, 2 stacked) */}
          <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", background: "rgba(255,255,255,0.01)" }}>
            <FeatureCard
              icon={<Files size={13} />}
              title="Cod complet"
              subtitle="100% al tău."
              description="Fiecare fișier livrat în Vercel-ul tău. Modifică, mută, dă-l unui dev."
            />
            <FeatureCard
              icon={<Zap size={13} />}
              title="AI în 6 minute"
              subtitle="Brief → Online."
              description="Descrie afacerea. AI generează site-ul. Publicat direct în contul tău."
            />
          </div>

        </div>
      </div>
    </section>
  );
}
