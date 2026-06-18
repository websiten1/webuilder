"use client";
import React from "react";
import { Avatar, Field, Pill } from "./primitives";

export function ProfilePage({ email, initials, joined, toast }: { email: string; initials: string; joined: string; toast: (m: string) => void }) {
  return (
    <div className="page narrow view-enter">
      <div className="page-head">
        <div className="kicker">// Account</div>
        <h1 className="page-title">Profile</h1>
        <p className="page-sub">How you appear across insixlive. Your email is the identity tied to every site you own.</p>
      </div>

      <div className="card">
        <div className="card-pad">
          <div className="avatar-edit">
            <Avatar initials={initials} size={78} />
            <div className="ae-actions">
              <div className="ae-h">Profile photo</div>
              <div className="ae-d">Generated from your initials. Upload coming soon.</div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button className="b b-ghost b-sm" disabled>
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-pad">
          <Field label="Email address">
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input className="inp" readOnly value={email} style={{ flex: 1 }} />
              <Pill kind="ok" dot>
                Verified
              </Pill>
            </div>
            <div className="fhint">Contact support to change your account email address.</div>
          </Field>
          <Field label="Display name" opt="optional" hint="Not stored yet — coming soon.">
            <input className="inp" placeholder="Your name" />
          </Field>
          <Field label="Company" opt="optional" hint="Not stored yet — coming soon.">
            <input className="inp" placeholder="Your company" />
          </Field>
        </div>
        <div className="row" style={{ borderTop: "1px solid var(--hair)", justifyContent: "space-between" }}>
          <div className="row-d" style={{ margin: 0 }}>
            Member since {joined}
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <button className="b b-primary" onClick={() => toast("Display name & company aren't stored yet")}>
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
