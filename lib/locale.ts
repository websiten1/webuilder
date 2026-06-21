export function detectLangFromHeader(acceptLanguage: string | null): "en" | "ro" {
  if (!acceptLanguage) return "en";
  const primary = acceptLanguage.split(",")[0]?.trim().toLowerCase() ?? "";
  return primary.startsWith("ro") ? "ro" : "en";
}
