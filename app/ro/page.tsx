import type { Metadata } from "next";
import HomePage from "../_home/HomePage";
import { RO } from "../_home/copy";

// "/" already serves this same Romanian copy by default — canonicalized so
// search engines consolidate ranking signals on one URL.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePageRo() {
  return <HomePage copy={RO} />;
}
