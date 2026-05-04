"use client";

import Link from "next/link";

const competitors = [
  { name: "WebBuilder", price: "€50", recurrence: "one-time", ai: true, codeOwnership: true, deployment: true, setup: "< 5 min", highlight: true },
  { name: "Wix", price: "€17", recurrence: "/month", ai: false, codeOwnership: false, deployment: true, setup: "Hours" },
  { name: "Squarespace", price: "€16", recurrence: "/month", ai: false, codeOwnership: false, deployment: true, setup: "Hours" },
  { name: "Webflow", price: "€14", recurrence: "/month", ai: false, codeOwnership: false, deployment: true, setup: "Days" },
];

const advantages = [
  { title: "You own the code", body: "Your website's source code is pushed to your GitHub. No lock-in, no dependency on us." },
  { title: "AI-generated in seconds", body: "Describe your business. Claude generates a complete, production-ready site. No templates, no drag-and-drop." },
  { title: "Live immediately", body: "Deployed to Vercel the moment it's generated. Your site is online before you finish your coffee." },
  { title: "Pay once, keep forever", body: "€50 flat. No monthly fees, no hidden costs, no cancellation anxiety." },
  { title: "Professional quality", body: "Every site is responsive, fast, and built with modern Next.js — the same stack used by Fortune 500 companies." },
  { title: "Editable anytime", body: "The code is yours. Hire a developer later, or edit it yourself. Full flexibility, zero friction." },
];

const partners = [
  { name: "Anthropic", label: "AI Engine" },
  { name: "Vercel", label: "Deployment" },
  { name: "GitHub", label: "Code Storage" },
  { name: "Next.js", label: "Framework" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-semibold tracking-tight">WebBuilder</span>
          <div className="flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">How it works</a>
            <a href="#pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Pricing</a>
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Login</Link>
            <Link href="/signup" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-600 mb-8">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            AI-powered — powered by Claude
          </div>
          <h1 className="text-6xl font-bold tracking-tight leading-tight text-gray-900 mb-6">
            A professional website<br />in under 5 minutes.
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            Describe your business. We generate a complete, live website and hand you the code. One payment, yours forever.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup" className="bg-gray-900 text-white px-8 py-3.5 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors">
              Create your website — €50
            </Link>
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Trusted by / Partners */}
      <section className="border-t border-b border-gray-100 py-12 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-semibold tracking-widest text-gray-400 uppercase mb-8">Built on trusted infrastructure</p>
          <div className="grid grid-cols-4 gap-8 max-w-2xl mx-auto">
            {partners.map((p) => (
              <div key={p.name} className="text-center">
                <p className="text-base font-semibold text-gray-700">{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Process</p>
            <h2 className="text-4xl font-bold tracking-tight">Three steps to live.</h2>
          </div>
          <div className="grid grid-cols-3 gap-12">
            {[
              { step: "01", title: "Describe", body: "Tell us your business name, type, and a brief description. No forms, no templates." },
              { step: "02", title: "Generate", body: "Claude writes a complete, responsive Next.js website tailored to your business in seconds." },
              { step: "03", title: "Own it", body: "Your site goes live on Vercel. The code is pushed to GitHub. It belongs to you, permanently." },
            ].map((item) => (
              <div key={item.step} className="border-t border-gray-200 pt-6">
                <span className="text-xs font-semibold text-gray-400 tracking-widest">{item.step}</span>
                <h3 className="text-xl font-semibold mt-3 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="py-28 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Who we are</p>
            <h2 className="text-4xl font-bold tracking-tight mb-6">We believe every business deserves a great website.</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              WebBuilder was built out of frustration. Getting a professional website meant either paying thousands to an agency, spending weeks on a page builder, or writing code yourself.
            </p>
            <p className="text-gray-500 leading-relaxed">
              We combined the best AI coding model in the world with production-grade deployment infrastructure to make professional web presence accessible to any business — at a fair, one-time price.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { number: "< 5min", label: "Average generation time" },
              { number: "€50", label: "One-time flat price" },
              { number: "100%", label: "Code ownership" },
              { number: "0", label: "Monthly fees" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-6">
                <p className="text-3xl font-bold tracking-tight">{stat.number}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-28 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Advantages</p>
            <h2 className="text-4xl font-bold tracking-tight">Why WebBuilder.</h2>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {advantages.map((a) => (
              <div key={a.title} className="group">
                <h3 className="text-base font-semibold mb-2">{a.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor comparison */}
      <section className="py-28 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Comparison</p>
            <h2 className="text-4xl font-bold tracking-tight">How we compare.</h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-white">
                  <th className="text-left px-6 py-4 font-medium text-gray-500">Platform</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500">Price</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500">AI generation</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500">Code ownership</th>
                  <th className="text-left px-6 py-4 font-medium text-gray-500">Time to live</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((c) => (
                  <tr
                    key={c.name}
                    className={`border-b border-gray-200 last:border-0 ${c.highlight ? "bg-gray-900 text-white" : "bg-white"}`}
                  >
                    <td className="px-6 py-4 font-semibold">{c.name}{c.highlight && <span className="ml-2 text-xs bg-white text-gray-900 px-2 py-0.5 rounded-full">You</span>}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold">{c.price}</span>
                      <span className={`text-xs ml-1 ${c.highlight ? "text-gray-400" : "text-gray-400"}`}>{c.recurrence}</span>
                    </td>
                    <td className="px-6 py-4">
                      {c.ai
                        ? <span className={`font-medium ${c.highlight ? "text-green-400" : "text-green-600"}`}>Yes</span>
                        : <span className="text-gray-400">No</span>}
                    </td>
                    <td className="px-6 py-4">
                      {c.codeOwnership
                        ? <span className={`font-medium ${c.highlight ? "text-green-400" : "text-green-600"}`}>Yes</span>
                        : <span className="text-gray-400">No</span>}
                    </td>
                    <td className="px-6 py-4">{c.setup}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-28 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Pricing</p>
            <h2 className="text-4xl font-bold tracking-tight">Simple, honest pricing.</h2>
          </div>
          <div className="max-w-md">
            <div className="border border-gray-200 rounded-xl p-8">
              <p className="text-sm font-medium text-gray-500 mb-2">One-time</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-bold tracking-tight">€50</span>
                <span className="text-gray-400 text-sm">forever</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-gray-600">
                {[
                  "Complete custom website, generated by AI",
                  "Deployed live on Vercel",
                  "Source code on your GitHub",
                  "Fully responsive & mobile-ready",
                  "No monthly fees, ever",
                  "You own it, no lock-in",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-gray-900 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full text-center bg-gray-900 text-white py-3 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Ready to go live?</h2>
          <p className="text-gray-400 mb-8 text-lg">Your website could be live in the next 5 minutes.</p>
          <Link href="/signup" className="inline-block bg-white text-gray-900 px-8 py-3.5 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
            Create your website — €50
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-sm font-semibold">WebBuilder</span>
          <p className="text-xs text-gray-400">© 2026 WebBuilder. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-xs text-gray-400 hover:text-gray-900 transition-colors">Login</Link>
            <Link href="/signup" className="text-xs text-gray-400 hover:text-gray-900 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
