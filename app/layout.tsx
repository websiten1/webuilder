import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/app/components/CookieBanner";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Insixlive — Your website live in six minutes",
  description: "AI-generated, production-ready websites deployed to your own Vercel account. You own the code. €49.99 one-time, no monthly fees.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
