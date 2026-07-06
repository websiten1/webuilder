import type { AccentPart } from "./copy";

export function AccentText({ parts }: { parts: AccentPart[] }) {
  return (
    <>
      {parts.map((p, i) =>
        p.c ? (
          <span key={i} className="section-accent" style={{ color: p.c, fontWeight: p.w ?? 600 }}>{p.t}</span>
        ) : (
          <span key={i}>{p.t}</span>
        )
      )}
    </>
  );
}
