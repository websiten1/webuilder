"use client";
import React from "react";
import { Icons } from "./icons";
import { Field } from "./primitives";

export function DeleteModal({ onClose, toast }: { onClose: () => void; toast: (m: string) => void }) {
  const [val, setVal] = React.useState("");
  const ok = val.trim().toLowerCase() === "delete";
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "grid",
        placeItems: "center",
        background: "color-mix(in srgb, var(--text) 32%, transparent)",
        backdropFilter: "blur(8px)",
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="card"
        style={{ width: "min(440px, 92vw)", border: "1px solid var(--danger-line)", animation: "menuIn .2s var(--ease) both", transformOrigin: "center" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="card-pad">
          <div className="itile lg" style={{ color: "var(--danger)", borderColor: "var(--danger-line)", background: "var(--danger-soft)", marginBottom: 16 }}>
            <Icons.trash size={24} />
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, letterSpacing: "-.02em" }}>Delete your account?</h2>
          <p style={{ margin: "0 0 18px", fontSize: 14, color: "var(--text-2)", lineHeight: 1.55 }}>
            This removes your billing history, edit credits and account profile. Your{" "}
            <b style={{ color: "var(--text)" }}>generated code stays yours</b> — it already lives in your own Vercel and repos.
          </p>
          <Field
            label={
              <span>
                Type <b className="mono" style={{ color: "var(--danger)" }}>delete</b> to confirm
              </span>
            }
          >
            <input className="inp" value={val} onChange={(e) => setVal(e.target.value)} placeholder="delete" autoFocus />
          </Field>
        </div>
        <div className="row" style={{ justifyContent: "flex-end", gap: 9 }}>
          <button className="b b-quiet" onClick={onClose}>
            Cancel
          </button>
          <button
            className="b b-danger-solid"
            disabled={!ok}
            onClick={() => {
              onClose();
              toast("Account deletion isn't wired up yet — contact support@insixlive.com");
            }}
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}
