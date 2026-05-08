"use client";

import Link from "next/link";

const BG = "#050510";

type Step = {
  n: string;
  title: string;
  body: string;
  items?: string[];
  note?: string;
};

const steps: Step[] = [
  {
    n: "01",
    title: "Buy a domain name",
    body: "Go to a domain registrar and search for the domain you want. Most .com domains cost €10–15 per year.",
    items: [
      "namecheap.com — good value, clean interface",
      "godaddy.com — popular, lots of options",
      "porkbun.com — often the cheapest",
    ],
    note: "Example: mybakery.com or johnplumbing.co.uk",
  },
  {
    n: "02",
    title: "Add the domain to Vercel",
    body: "Log in to vercel.com, open your project, then go to Settings → Domains.",
    items: [
      "Click the project you want to add a domain to",
      "Go to: Settings → Domains",
      "Type your domain (e.g. mybakery.com) and click Add",
      "Vercel will show you DNS records to configure",
    ],
    note: "Keep this page open — you'll need the DNS values in the next step.",
  },
  {
    n: "03",
    title: "Point your DNS to Vercel",
    body: "Go back to your domain registrar and update the nameservers to Vercel's. This tells the internet to send visitors to your Vercel site.",
    items: [
      "Log in to your registrar (Namecheap, GoDaddy, etc.)",
      "Find your domain → Manage → Nameservers",
      "Switch from Default to Custom nameservers",
      "Enter these four nameservers:",
      "  ns1.vercel-dns.com",
      "  ns2.vercel-dns.com",
      "Save changes",
    ],
    note: "Alternatively, some registrars let you add an A record pointing to 76.76.21.21 instead of changing nameservers.",
  },
  {
    n: "04",
    title: "Wait for DNS to propagate",
    body: "DNS changes take 15 minutes to 48 hours to take effect worldwide. Vercel will show a green 'Valid Configuration' badge once it's done.",
    items: [
      "Check status in Vercel → Settings → Domains",
      "You'll see a green checkmark when live",
      "Try visiting your domain in a browser",
    ],
    note: "Most propagations complete within an hour.",
  },
];

const issues = [
  {
    q: "Domain not working after 48 hours",
    a: "Double-check the nameservers are saved correctly in your registrar. DNS entries sometimes need a manual re-save.",
  },
  {
    q: "Vercel shows 'Invalid Configuration'",
    a: "The nameservers haven't propagated yet, or were entered incorrectly. Check for typos and wait a bit longer.",
  },
  {
    q: "Getting a blank or default page",
    a: "The domain is live but may be pointing to the wrong Vercel project. Make sure the domain is added to the correct project in Vercel.",
  },
  {
    q: "HTTPS / SSL not working",
    a: "Vercel automatically provisions SSL once the domain is verified. It usually takes a few minutes after the domain goes live.",
  },
];

export default function SetupCustomDomainPage() {
  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
      <nav
        className="fixed top-0 left-0 right-0 z-50 glass"
        style={{ borderTop: "none", borderLeft: "none", borderRight: "none" }}
      >
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold tracking-tight text-sm">
            WebBuilder
          </Link>
          <Link
            href="/dashboard"
            className="text-sm"
            style={{ color: "var(--text2)" }}
          >
            ← Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-28 pb-24">
        {/* Header */}
        <div className="mb-14">
          <p
            className="text-xs font-semibold tracking-widest mb-3"
            style={{ color: "var(--text3)", textTransform: "uppercase" }}
          >
            Help
          </p>
          <h1
            className="font-bold tracking-tight mb-4"
            style={{ fontSize: "2.4rem" }}
          >
            Set up a custom domain
          </h1>
          <p style={{ color: "var(--text2)", fontSize: "1.05rem", lineHeight: 1.7 }}>
            Your website is already live on a Vercel URL (e.g.{" "}
            <code
              style={{
                background: "rgba(255,255,255,0.06)",
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: "0.9em",
              }}
            >
              your-site.vercel.app
            </code>
            ). This guide shows you how to point your own domain at it so
            visitors see{" "}
            <code
              style={{
                background: "rgba(255,255,255,0.06)",
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: "0.9em",
              }}
            >
              yourbusiness.com
            </code>{" "}
            instead.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6 mb-16">
          {steps.map((step, i) => (
            <div
              key={step.n}
              className="glass rounded-2xl p-7"
              style={{
                borderLeft: "3px solid rgba(99,102,241,0.4)",
              }}
            >
              <div className="flex items-start gap-5">
                <div
                  style={{
                    minWidth: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#6366f1,#a855f7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h3
                    className="font-semibold mb-2"
                    style={{ fontSize: "1.1rem" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm mb-3"
                    style={{ color: "var(--text2)", lineHeight: 1.7 }}
                  >
                    {step.body}
                  </p>
                  {step.items && (
                    <ul className="space-y-1.5 mb-3">
                      {step.items.map((item) => (
                        <li
                          key={item}
                          className="text-sm flex items-start gap-2"
                          style={{ color: "var(--text2)" }}
                        >
                          <span style={{ color: "#6366f1", marginTop: 1 }}>
                            ›
                          </span>
                          <span
                            style={{
                              fontFamily: item.startsWith("  ")
                                ? "ui-monospace, monospace"
                                : undefined,
                              color: item.startsWith("  ")
                                ? "#a5b4fc"
                                : undefined,
                            }}
                          >
                            {item.trim()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {step.note && (
                    <div
                      className="text-xs px-3 py-2 rounded-lg"
                      style={{
                        background: "rgba(99,102,241,0.08)",
                        border: "1px solid rgba(99,102,241,0.15)",
                        color: "var(--text2)",
                      }}
                    >
                      💡 {step.note}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Troubleshooting */}
        <div>
          <h2
            className="font-bold tracking-tight mb-6"
            style={{ fontSize: "1.6rem" }}
          >
            Troubleshooting
          </h2>
          <div className="space-y-3">
            {issues.map((issue) => (
              <div key={issue.q} className="glass rounded-xl p-5">
                <p className="font-medium text-sm mb-1.5">{issue.q}</p>
                <p className="text-sm" style={{ color: "var(--text2)" }}>
                  {issue.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Still stuck */}
        <div className="glass rounded-2xl p-6 mt-10 text-center">
          <p className="font-semibold mb-1">Still stuck?</p>
          <p className="text-sm mb-3" style={{ color: "var(--text2)" }}>
            Send us an email and we&apos;ll help you get it sorted.
          </p>
          <a
            href="mailto:support@webbuilder.app"
            className="btn-primary rounded-xl px-6 py-2.5 text-sm inline-block"
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
