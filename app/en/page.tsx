import type { Metadata } from "next";
import HomePage from "../_home/HomePage";
import { EN } from "../_home/copy";

// Only reachable directly at /en, or via the "/" rewrite in proxy.ts for
// non-Romanian visitors — canonicalized to "/" so search engines consolidate
// ranking signals on one URL instead of splitting them across variants.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePageEn() {
  return <HomePage copy={EN} />;
}
