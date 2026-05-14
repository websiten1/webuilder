"use client";
import { useState } from "react";
import SiteNav from "@/app/components/SiteNav";
import SiteFooter from "@/app/components/SiteFooter";
import { PageHero, FinalCTA, Section, Container, SiteMock, EXAMPLES } from "@/app/components/ui";
import { P } from "@/lib/design";

const EX_FILTERS = ["All", "Local services", "Health", "Beauty", "Restaurants", "Freelancers", "Shops", "Consultants"];

export default function ExamplesPage() {
  const [filter, setFilter] = useState("All");

  return (
    <>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{overflow-x:hidden}body{background:${P.bg};color:${P.ink};font-family:${P.font};overflow-x:hidden}a{text-decoration:none;color:inherit}@media(max-width:900px){.ex-grid{grid-template-columns:1fr 1fr!important}.pp{padding-left:20px!important;padding-right:20px!important}}@media(max-width:600px){.ex-grid{grid-template-columns:1fr!important}}`}</style>

      <SiteNav/>

      <PageHero
        eyebrow="// shipped sites"
        title={<>See what your<br/><span style={{ color: P.six }}>website could look like.</span></>}
        sub="Browse examples generated for small businesses, freelancers, clinics, restaurants, shops, and local services."
      />

      <Section paddingY={48}>
        <Container>
          {/* Filter pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 36 }}>
            {EX_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "8px 14px", borderRadius: 999,
                  background: filter === f ? P.ink : "#fff",
                  color: filter === f ? "#fff" : P.ink,
                  border: `1px solid ${filter === f ? P.ink : P.line}`,
                  fontFamily: P.font, fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Gallery grid */}
          <div className="ex-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {EXAMPLES.map(e => (
              <div key={e.name}>
                <SiteMock {...e}/>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: P.font, fontSize: 15, fontWeight: 700, color: P.ink }}>{e.name}</div>
                    <div style={{ fontFamily: P.mono, fontSize: 11.5, color: P.muted, marginTop: 2 }}>
                      {e.kind} · {e.pages.join(" · ")}
                    </div>
                  </div>
                  <span style={{ fontFamily: P.mono, fontSize: 11, fontWeight: 600, color: P.ink, padding: "6px 10px", borderRadius: 999, border: `1px solid ${P.line}`, background: "#fff" }}>
                    View ↗
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <FinalCTA/>
      <SiteFooter/>
    </>
  );
}
