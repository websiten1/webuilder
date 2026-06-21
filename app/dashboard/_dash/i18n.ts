export type Lang = "en" | "ro";

export function tt(lang: Lang, en: string, ro: string): string {
  return lang === "ro" ? ro : en;
}
