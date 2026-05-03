// app/page.tsx - Landing page

"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <div className="text-2xl font-bold text-blue-600">WebBuilder</div>
        <div className="space-x-6">
          <Link href="/login" className="text-gray-600 hover:text-gray-900">
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Professional Website in 5 Minutes
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Create a stunning website for your business. AI-powered. You own the code. €50 one-time.
        </p>
        <Link
          href="/signup"
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-700 inline-block"
        >
          Start Creating →
        </Link>
      </section>

      {/* Features Section */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">✍️</div>
            <h3 className="text-xl font-bold mb-2">Describe</h3>
            <p className="text-gray-600">
              Tell us about your business in a few words
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold mb-2">Generate</h3>
            <p className="text-gray-600">
              AI creates your professional website in seconds
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2">Deploy</h3>
            <p className="text-gray-600">
              Your site goes live instantly, you own the code
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Simple Pricing</h2>
          <div className="bg-gray-800 p-12 rounded-lg inline-block">
            <div className="text-6xl font-bold mb-2">€50</div>
            <p className="text-gray-400 mb-8">One-time payment. No monthly fees.</p>
            <ul className="text-left space-y-3 mb-8">
              <li>✅ Professional website</li>
              <li>✅ Your code on GitHub</li>
              <li>✅ Live on vercel.app</li>
              <li>✅ You own it forever</li>
            </ul>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-600">
          <p>© 2024 WebBuilder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
