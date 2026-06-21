"use client";
import React from "react";
import { Icons } from "./icons";
import { tt, type Lang } from "./i18n";

export function Avatar({ initials = "??", size = 32, className = "" }: { initials?: string; size?: number; className?: string }) {
  return (
    <div className={"avatar " + className} style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {initials}
    </div>
  );
}

export function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      className="toggle"
      data-on={on ? "1" : "0"}
      onClick={() => !disabled && onChange(!on)}
      aria-pressed={on}
      disabled={disabled}
      style={disabled ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
    >
      <i></i>
    </button>
  );
}

export function Pill({ kind = "", dot = false, children }: { kind?: string; dot?: boolean; children: React.ReactNode }) {
  return (
    <span className={"pill " + (kind ? "pill-" + kind : "")}>
      {dot && <span className="pd"></span>}
      {children}
    </span>
  );
}

export function LiveBadge({ lang = "en" }: { lang?: Lang }) {
  return (
    <span className="pill pill-ok">
      <span className="live-dot"></span>{tt(lang, "Live", "Online")}
    </span>
  );
}

export function Section({
  kicker,
  title,
  desc,
  action,
  children,
  className = "",
}: {
  kicker?: string;
  title?: React.ReactNode;
  desc?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"section " + className}>
      {(title || action) && (
        <div className="section-head">
          <div className="section-title">
            {kicker && <span className="st-k">{kicker}</span>}
            {title}
          </div>
          {desc && <div className="section-desc">{desc}</div>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Row({
  icon,
  title,
  desc,
  children,
  danger = false,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  desc?: React.ReactNode;
  children?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className={"row" + (danger ? " dz-row" : "")}>
      {icon && <div className="itile">{icon}</div>}
      <div className="row-main">
        <div className="row-h">{title}</div>
        {desc && <div className="row-d">{desc}</div>}
      </div>
      <div className="row-ctrl">{children}</div>
    </div>
  );
}

export function Field({
  label,
  opt,
  hint,
  children,
}: {
  label?: React.ReactNode;
  opt?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      {label && (
        <label className="flabel">
          {label}
          {opt && <span className="opt">{opt}</span>}
        </label>
      )}
      {children}
      {hint && <div className="fhint">{hint}</div>}
    </div>
  );
}

export function Callout({
  kind = "info",
  icon,
  title,
  children,
  action,
}: {
  kind?: string;
  icon?: React.ReactNode;
  title: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className={"callout " + kind}>
      <div className="co-ic">{icon}</div>
      <div style={{ flex: 1 }}>
        <div className="co-h">{title}</div>
        {children && <div className="co-d">{children}</div>}
      </div>
      {action}
    </div>
  );
}

export function PasswordInput({
  value,
  placeholder,
  onChange,
}: {
  value?: string;
  placeholder?: string;
  onChange?: (v: string) => void;
}) {
  const [show, setShow] = React.useState(false);
  const Eye = show ? Icons.eyeOff : Icons.eye;
  return (
    <div className="inp-wrap">
      <input
        className="inp"
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
      <span className="inp-icon" onClick={() => setShow((s) => !s)}>
        <Eye />
      </span>
    </div>
  );
}

export function CopyField({ value }: { value: string }) {
  const [done, setDone] = React.useState(false);
  return (
    <div className="inp-wrap">
      <input className="inp mono" readOnly value={value} />
      <span
        className="inp-icon"
        onClick={() => {
          navigator.clipboard?.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        }}
      >
        {done ? <Icons.check /> : <Icons.copy />}
      </span>
    </div>
  );
}
