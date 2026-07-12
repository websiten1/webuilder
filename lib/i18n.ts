export type Lang = "en" | "ro";

export function tt<T>(lang: Lang, en: T, ro: T): T {
  return lang === "ro" ? ro : en;
}

const LANG_STORAGE_KEY = "insixlive_lang";

// Same default as detectLangFromHeader (lib/locale.ts): Romanian only when
// explicitly requested, English otherwise — mirrors the homepage's proxy.ts rewrite.
export function detectLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
  if (stored === "en" || stored === "ro") return stored;
  const nav = (window.navigator.language || "").toLowerCase();
  return nav.startsWith("ro") ? "ro" : "en";
}

export function persistLang(lang: Lang): void {
  if (typeof window !== "undefined") window.localStorage.setItem(LANG_STORAGE_KEY, lang);
}
