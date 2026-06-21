import type { Metadata } from "next";
import EmailPreferencesClient from "./EmailPreferencesClient";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const lang = sp.lang === "ro" ? "ro" : "en";
  return lang === "ro"
    ? { title: "inSIXlive — Preferințe email", description: "Alege ce emailuri dorești să primești de la inSIXlive." }
    : { title: "inSIXlive — Email Preferences", description: "Choose which emails you'd like to receive from inSIXlive." };
}

export default async function EmailPreferencesPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = sp.lang === "ro" ? "ro" : "en";
  return <EmailPreferencesClient lang={lang} />;
}
