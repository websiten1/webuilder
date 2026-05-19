import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/app/components/CookieBanner";
import ChatBot from "@/app/components/ChatBot";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "insixlive — Your website live in six minutes",
  description: "AI-generated, production-ready websites deployed to your own Vercel account. You own the code. €49.99 one-time, no monthly fees.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  },
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
