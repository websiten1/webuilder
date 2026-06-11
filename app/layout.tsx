import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/app/components/CookieBanner";
import ChatBot from "@/app/components/ChatBot";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.insixlive.com"),
  title: "insixlive — Your website live in six minutes",
  description: "AI-generated, production-ready websites deployed to your own Vercel account. You own the code. €59.99 one-time, no monthly fees.",
  openGraph: {
    title: "insixlive — Your website live in six minutes",
    description: "AI-generated websites deployed to your own Vercel account. €59.99 one-time. No subscription.",
    url: "https://www.insixlive.com",
    siteName: "insixlive",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "insixlive" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "insixlive — Your website live in six minutes",
    description: "AI-generated websites deployed to your own Vercel account. €59.99 one-time. No subscription.",
    images: ["/opengraph-image"],
  },
  // Icons are auto-detected from app/icon.tsx and app/apple-icon.tsx (the insixlive "6" mark).
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        {children}
        <CookieBanner />
        <ChatBot />
      </body>
    </html>
  );
}
