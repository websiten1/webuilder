import type { Metadata } from "next";
import EmailPreferencesClient from "./EmailPreferencesClient";

export const metadata: Metadata = {
  title: "inSIXlive — Email Preferences",
  description: "Choose which emails you'd like to receive from inSIXlive.",
};

export default async function EmailPreferencesPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = sp.lang === "ro" ? "ro" : "en";
  return <EmailPreferencesClient lang={lang} />;
}
