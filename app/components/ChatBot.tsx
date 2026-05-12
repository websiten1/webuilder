"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const T = {
  ink: "#0A0E14", six: "#FF5A1F", em: "#00B377", em2: "#009062",
  emSoft: "#E5F7EE", bg: "#FAFAFA", bg2: "#F2F2EF", line: "#E2E2DE",
  muted: "#6B7180",
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
};

// ─── Knowledge base ──────────────────────────────────────────────────────────

type Intent = {
  id: string;
  patterns: string[];
  response: string;
  suggestions: string[];
};

const INTENTS: Intent[] = [
  {
    id: "greeting",
    patterns: ["hi", "hello", "hey", "what is insixlive", "what are you", "who are you", "what do you do", "tell me about", "about insixlive"],
    response: "insixlive generates professional websites for small businesses in under 2 minutes — and you own everything. One price (€49.99–€79.99), no monthly fees, full code ownership. The website is deployed to your own Vercel account, so it's truly yours forever.",
    suggestions: ["How much does it cost?", "How does it work?", "Do I own my website?"],
  },
  {
    id: "pricing",
    patterns: ["cost", "price", "how much", "pricing", "pay", "payment", "fee", "charge", "money", "euro", "€", "cheap", "expensive", "afford", "plans", "plan"],
    response: "Three one-time plans — no subscriptions, ever:\n\n• Basic — €49.99\n  Website + Vercel deployment, €15 per edit\n\n• Pro — €59.99\n  Includes 5 free edits (worth €75)\n\n• Premium — €79.99\n  15 free edits + unlimited free edits forever after\n\nMost users pick Pro. Premium pays for itself if you make more than 5 edits.",
    suggestions: ["Which plan is best for me?", "How do free edits work?", "What's included in all plans?"],
  },
  {
    id: "plan_compare",
    patterns: ["which plan", "recommend", "best plan", "choose", "difference", "compare", "vs", "basic vs", "pro vs", "premium vs"],
    response: "Here's how to choose:\n\n• Basic — if you need a quick website and won't change much\n• Pro — if you want to refine your site (5 edits free, then €15 each)\n• Premium — if your business evolves a lot (unlimited free edits after 15)\n\nMost people start with Pro. It's the sweet spot between price and flexibility.",
    suggestions: ["Tell me about Premium", "How do I get started?", "Do I own my website?"],
  },
  {
    id: "ownership",
    patterns: ["own", "ownership", "mine", "download", "export", "code", "lock-in", "leave", "move", "cancel", "stop using", "delete", "source"],
    response: "Yes — you own everything. The code, the Vercel project, the domain. Every single file is yours.\n\nYou can:\n• Download the source code anytime\n• Move to any other host\n• Modify the code yourself\n• Sell the website\n• Stop using insixlive — your site stays live forever\n\nThere's no lock-in. We literally can't hold your website hostage.",
    suggestions: ["Can I move my website?", "How do I access my code?", "What technology is used?"],
  },
  {
    id: "how_it_works",
    patterns: ["how does it work", "how it works", "process", "steps", "walkthrough", "what happens", "explain", "how do i", "workflow"],
    response: "Here's the full process:\n\n1. Sign up (free)\n2. Describe your business — name, type, style, pages\n3. Choose your plan (Basic/Pro/Premium)\n4. Pay once (€49.99–€79.99)\n5. AI generates your website (~30 seconds)\n6. Live at yoursitename.vercel.app\n7. Optionally add a custom domain\n\nFrom sign-up to live: about 2 minutes.",
    suggestions: ["How do I get started?", "How much does it cost?", "Can I add a custom domain?"],
  },
  {
    id: "get_started",
    patterns: ["get started", "start", "sign up", "register", "create account", "how do i start", "begin", "first step", "join"],
    response: "Easy — here's all you do:\n\n1. Go to insixlive.com\n2. Click 'Get Started'\n3. Create account with email + password\n4. Verify your email\n5. Describe your business\n6. Choose a plan + pay\n7. Website live in ~2 minutes\n\nNo credit card needed to sign up. You only pay when you generate your site.",
    suggestions: ["How much does it cost?", "What do I need to describe?", "What happens after I pay?"],
  },
  {
    id: "editing",
    patterns: ["edit", "change", "update", "modify", "request", "revision", "fix", "adjust", "update website", "make changes", "different color", "add page", "remove"],
    response: "Requesting a change takes about 10 seconds:\n\n1. Go to your dashboard\n2. Click 'Request Changes' on your site\n3. Describe what you want (e.g., 'change background to dark blue')\n4. We regenerate + redeploy in ~2 minutes\n5. Live on all your domains at once\n\nCost: €15 per edit (or free if included in your plan).",
    suggestions: ["How many free edits do I get?", "What can I change?", "How long does it take?"],
  },
  {
    id: "free_edits",
    patterns: ["free edit", "free changes", "included edit", "how many free", "edits included", "free revision"],
    response: "Free edits depend on your plan:\n\n• Basic — 0 free edits (€15 each)\n• Pro — 5 free edits, then €15/edit\n• Premium — 15 free edits, then FREE forever after\n\nPremium users get unlimited free edits once they've used the initial 15. Every change after that costs €0.",
    suggestions: ["Which plan is best value?", "How do I request a change?", "What counts as an edit?"],
  },
  {
    id: "domain",
    patterns: ["domain", "custom domain", "url", "website address", "my domain", "own domain", "www", "address", ".com", ".io", ".eu"],
    response: "Two ways to get a custom domain:\n\n1. Buy new from Vercel\n   → Automatic setup, live in 2–5 seconds\n   → Costs €12–30/year depending on TLD\n\n2. Use existing domain (you own it)\n   → We show you 2 DNS records to add\n   → Takes 15–30 minutes to go live\n   → No extra cost from us\n\nBoth options fully owned by you.",
    suggestions: ["I want to buy a new domain", "I have an existing domain", "What are DNS records?"],
  },
  {
    id: "buy_domain",
    patterns: ["buy domain", "purchase domain", "new domain", "get domain", "domain from vercel", "buy new"],
    response: "Buying a new domain through us is the easiest option:\n\n1. After your website is live, go to 'Add Domain'\n2. Search for your domain (e.g., 'medicalscrubs')\n3. See availability + pricing (.com, .eu, .io, etc.)\n4. Click 'Buy via Vercel'\n5. Complete purchase on Vercel\n6. Domain automatically configured\n7. Website live at your domain in 2–5 seconds\n\nThe domain is registered to your Vercel account — you own it.",
    suggestions: ["How much does a domain cost?", "What about an existing domain?", "Can I use both?"],
  },
  {
    id: "existing_domain",
    patterns: ["existing domain", "have a domain", "already have", "own a domain", "bought domain", "namecheap", "godaddy", "porkbun", "registrar"],
    response: "If you already own a domain, here's what to do:\n\n1. Go to your site's 'Domain' page\n2. Enter your domain name\n3. We show you 2 DNS records to add:\n   • A record: @ → 76.76.21.21\n   • CNAME: www → cname.vercel-dns.com\n4. Log in to your registrar (Namecheap, GoDaddy, etc.)\n5. Add those records in DNS settings\n6. Click 'Check Status' — usually 15–30 minutes\n\nWe have step-by-step guides for each registrar.",
    suggestions: ["What are DNS records?", "How long does DNS take?", "What if something goes wrong?"],
  },
  {
    id: "dns",
    patterns: ["dns", "dns record", "a record", "cname", "nameserver", "propagat", "76.76", "vercel-dns", "configure", "point domain"],
    response: "DNS tells the internet where your website is hosted. For insixlive, you need two records:\n\n• A record: @ → 76.76.21.21\n• CNAME: www → cname.vercel-dns.com\n\nAdd these at your domain registrar (Namecheap, GoDaddy, Porkbun, etc.) under 'DNS Settings' or 'Advanced DNS'.\n\nPropagation usually takes 15–30 minutes, sometimes up to 2 hours.",
    suggestions: ["How do I add DNS records?", "Which registrar guides do you have?", "How do I check if it worked?"],
  },
  {
    id: "tech_stack",
    patterns: ["technology", "tech", "next.js", "react", "tailwind", "framework", "built with", "stack", "language", "javascript", "typescript"],
    response: "Your website is built with:\n\n• Next.js 14 (modern React framework)\n• Tailwind CSS (styling)\n• Deployed on Vercel (global CDN)\n• Automatic HTTPS/SSL\n\nIt's the same tech used by major companies. Fast, SEO-friendly, mobile-responsive. If you're technical, you can read and modify the code yourself.",
    suggestions: ["Can I modify the code?", "Is it SEO-friendly?", "How fast is the website?"],
  },
  {
    id: "speed",
    patterns: ["fast", "speed", "quick", "time", "how long", "minutes", "seconds", "loading", "slow", "performance"],
    response: "Two kinds of 'speed' here:\n\n• Generation time: ~30 seconds to generate your website\n• Loading time: Very fast (Vercel's global CDN, optimized images)\n\nYour website will score well on speed tests. It's hosted on Vercel's infrastructure — the same platform used by companies like Meta and GitHub.",
    suggestions: ["Where is my website hosted?", "Is it SEO-friendly?", "What technology is used?"],
  },
  {
    id: "seo",
    patterns: ["seo", "google", "search engine", "ranking", "meta", "index", "found on google", "keywords"],
    response: "Your website includes SEO basics by default:\n\n• Proper meta titles and descriptions\n• Semantic HTML structure\n• Fast loading (good for rankings)\n• Mobile-responsive (Google prefers this)\n• HTTPS (required for good rankings)\n\nFor advanced SEO (keyword research, content strategy), you'd need a specialist — but the foundation is solid.",
    suggestions: ["How fast is my website?", "Is it mobile-friendly?", "Can I edit meta tags?"],
  },
  {
    id: "security",
    patterns: ["secure", "security", "ssl", "https", "certificate", "safe", "protect", "encrypt"],
    response: "Your website is secure by default:\n\n• Automatic SSL certificate (HTTPS)\n• Auto-renewed — you never have to think about it\n• Hosted on Vercel (enterprise-grade security)\n• No database to hack (static site)\n\nThe padlock in the browser appears automatically.",
    suggestions: ["Where is my website hosted?", "What about my account security?", "Can I add login to my website?"],
  },
  {
    id: "support",
    patterns: ["support", "help", "contact", "email", "stuck", "question", "talk to someone", "human", "person", "team", "reach out"],
    response: "You can reach us at:\n\n📧 support@insixlive.com\n\nWe typically respond within a few hours. For common questions, I can usually help right here — just ask!",
    suggestions: ["I have a billing question", "I have a technical issue", "How do I get started?"],
  },
  {
    id: "refund",
    patterns: ["refund", "money back", "return", "dissatisfied", "unhappy", "not happy", "cancel", "cancellation"],
    response: "Contact us at support@insixlive.com and we'll work something out. We want you to be happy with your website.\n\nIf you're not satisfied with the result, tell us what you'd like changed and we'll fix it. Often the solution is just an edit or two, which we'll handle for free.",
    suggestions: ["How do I request changes?", "Contact support", "What if I don't like my design?"],
  },
  {
    id: "troubleshoot",
    patterns: ["not working", "problem", "issue", "broken", "error", "doesn't work", "can't", "trouble", "help me", "wrong", "failed", "stuck"],
    response: "Sorry to hear something's not working! Most common fixes:\n\n• Login issues → check email/password, verify email was confirmed\n• Domain not loading → check DNS records, wait 15–30 min\n• Website slow → clear browser cache, try incognito\n• Payment issue → try different card or email us\n\nIf none of these help, email support@insixlive.com with details and we'll sort it out.",
    suggestions: ["I have a DNS issue", "I can't log in", "Contact support"],
  },
  {
    id: "mobile",
    patterns: ["mobile", "phone", "tablet", "responsive", "small screen", "iphone", "android", "works on mobile"],
    response: "Yes — all websites we generate are fully mobile-responsive. They look great on phones, tablets, and desktops. We build mobile-first, so your site works perfectly on any screen size.",
    suggestions: ["What technology is used?", "Is it fast on mobile?", "How do I edit my website?"],
  },
  {
    id: "what_included",
    patterns: ["what's included", "what do i get", "includes", "features", "pages", "what comes with"],
    response: "Every plan includes:\n\n• Complete custom website (5–10 pages typically)\n• Deployed to your Vercel account\n• Mobile-responsive design\n• HTTPS/SSL certificate\n• Fast global CDN\n• Contact forms\n• Social media links\n• Professional typography\n• Custom colors + branding\n• Full source code ownership\n• Unlimited bandwidth\n• No monthly fees",
    suggestions: ["How do I add a custom domain?", "Can I edit my website?", "What about my code?"],
  },
  {
    id: "generate_time",
    patterns: ["100 seconds", "2 minutes", "generation", "how long to generate", "when will it be ready", "wait"],
    response: "Your website is generated in about 30 seconds. Deployment to Vercel takes another 1–2 minutes. So you're looking at about 2 minutes from 'Generate' to live website. Quite fast for something custom-made for your business!",
    suggestions: ["What does my website include?", "How do I get started?", "Can I customize it after?"],
  },
];

const FALLBACK: Omit<Intent, "id" | "patterns"> = {
  response: "That's a great question! I'm not sure I have the exact answer, but email support@insixlive.com and the team will help you out directly. Is there anything else I can help with?",
  suggestions: ["How does it work?", "What's the price?", "Contact support"],
};

const WELCOME = "Hey 👋 I'm the insixlive assistant — ask me anything about building your website, pricing, domains, or how things work. What can I help with?";
const WELCOME_SUGGESTIONS = ["What is insixlive?", "How much does it cost?", "How does it work?", "Do I own my website?"];

// ─── Response engine ─────────────────────────────────────────────────────────

function findResponse(userMessage: string): { response: string; suggestions: string[] } {
  const msg = userMessage.toLowerCase();
  let best: Intent | null = null;
  let bestScore = 0;

  for (const intent of INTENTS) {
    let score = 0;
    for (const pattern of intent.patterns) {
      if (msg.includes(pattern)) {
        score += pattern.split(" ").length; // longer patterns score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  if (best && bestScore > 0) return { response: best.response, suggestions: best.suggestions };
  return FALLBACK;
}

// ─── Message formatting ───────────────────────────────────────────────────────

function MessageText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div style={{ fontFamily: T.font, fontSize: 14, lineHeight: 1.65, color: T.ink }}>
      {lines.map((line, i) => {
        if (line.startsWith("•")) {
          return <div key={i} style={{ paddingLeft: 12, position: "relative" }}><span style={{ position: "absolute", left: 0 }}>•</span>{line.slice(1)}</div>;
        }
        if (line === "") return <div key={i} style={{ height: 6 }} />;
        if (line.startsWith("  ")) return <div key={i} style={{ paddingLeft: 14, color: T.muted, fontSize: 13 }}>{line.trim()}</div>;
        return <div key={i}>{line}</div>;
      })}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

type Message = {
  id: number;
  role: "bot" | "user";
  text: string;
  suggestions?: string[];
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);

  const nextId = () => ++idRef.current;

  const addBotMessage = useCallback((text: string, suggestions?: string[]) => {
    const id = nextId();
    setMessages(prev => [...prev, { id, role: "bot", text, suggestions }]);
  }, []);

  // Initialise with welcome message when first opened
  useEffect(() => {
    if (open && !started) {
      setStarted(true);
      setTimeout(() => {
        addBotMessage(WELCOME, WELCOME_SUGGESTIONS);
      }, 300);
    }
  }, [open, started, addBotMessage]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    setInput("");
    setMessages(prev => [...prev, { id: nextId(), role: "user", text: trimmed }]);
    setTyping(true);

    const { response, suggestions } = findResponse(trimmed);
    const delay = 600 + Math.random() * 600; // 600–1200ms typing simulation

    setTimeout(() => {
      setTyping(false);
      addBotMessage(response, suggestions);
    }, delay);
  }, [typing, addBotMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      <style>{`
        @keyframes chatIn { from { opacity:0; transform:translateY(12px) scale(.96); } to { opacity:1; transform:none; } }
        @keyframes dotBounce { 0%,80%,100% { transform:translateY(0); } 40% { transform:translateY(-5px); } }
        .chat-window { animation: chatIn .22s ease both; }
        .msg-in { animation: chatIn .2s ease both; }
        .dot1 { animation: dotBounce 1.2s .0s infinite ease-in-out; }
        .dot2 { animation: dotBounce 1.2s .2s infinite ease-in-out; }
        .dot3 { animation: dotBounce 1.2s .4s infinite ease-in-out; }
        .chip:hover { background: #0A0E14 !important; color: #fff !important; }
        .chat-input:focus { outline: none; border-color: #0A0E14 !important; }
        .send-btn:hover { opacity: .8; }
        @media (max-width: 480px) {
          .chat-window { width: calc(100vw - 24px) !important; right: 12px !important; bottom: 76px !important; }
        }
      `}</style>

      {/* Chat window */}
      {open && (
        <div className="chat-window" style={{
          position: "fixed", bottom: 88, right: 20, zIndex: 9998,
          width: 380, maxHeight: 580,
          background: "#fff", borderRadius: 18,
          boxShadow: "0 16px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ background: T.ink, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: T.six, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: T.font, fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1 }}>6</span>
              </div>
              <div>
                <p style={{ fontFamily: T.font, fontSize: 14, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: -0.3 }}>insixlive</p>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: T.em }} />
                  <p style={{ fontFamily: T.font, fontSize: 11, color: "rgba(255,255,255,0.5)", margin: 0 }}>Online · replies instantly</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.7)", width: 28, height: 28, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, lineHeight: 1 }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 8px", display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
            {messages.map(msg => (
              <div key={msg.id} className="msg-in" style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", gap: 8 }}>
                <div style={{
                  maxWidth: "85%", padding: "10px 14px", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: msg.role === "user" ? T.ink : T.bg2,
                  border: msg.role === "bot" ? `1px solid ${T.line}` : "none",
                }}>
                  {msg.role === "user"
                    ? <p style={{ fontFamily: T.font, fontSize: 14, color: "#fff", margin: 0, lineHeight: 1.55 }}>{msg.text}</p>
                    : <MessageText text={msg.text} />
                  }
                </div>

                {/* Suggestion chips */}
                {msg.role === "bot" && msg.suggestions && msg.suggestions.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxWidth: "95%" }}>
                    {msg.suggestions.map(s => (
                      <button key={s} className="chip" onClick={() => sendMessage(s)}
                        style={{ background: "#fff", border: `1px solid ${T.line}`, color: T.ink, borderRadius: 20, padding: "5px 12px", fontFamily: T.font, fontSize: 12, cursor: "pointer", transition: "all .15s", whiteSpace: "nowrap" as const }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="msg-in" style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={{ padding: "12px 16px", background: T.bg2, border: `1px solid ${T.line}`, borderRadius: "14px 14px 14px 4px", display: "flex", gap: 4, alignItems: "center" }}>
                  {[1, 2, 3].map(n => (
                    <div key={n} className={`dot${n}`} style={{ width: 6, height: 6, borderRadius: 3, background: T.muted }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px 12px", borderTop: `1px solid ${T.line}`, flexShrink: 0 }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                ref={inputRef}
                className="chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything…"
                style={{ flex: 1, border: `1px solid ${T.line}`, borderRadius: 24, padding: "10px 16px", fontFamily: T.font, fontSize: 14, color: T.ink, background: T.bg2, transition: "border-color .15s" }}
              />
              <button type="submit" disabled={!input.trim() || typing} className="send-btn"
                style={{ width: 38, height: 38, borderRadius: 19, background: input.trim() && !typing ? T.ink : T.line, border: "none", cursor: input.trim() && !typing ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .15s" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 8L2 2l3 6-3 6 12-6z" fill={input.trim() && !typing ? "#fff" : T.muted} />
                </svg>
              </button>
            </form>
            <p style={{ fontFamily: T.font, fontSize: 10, color: T.muted, textAlign: "center", marginTop: 6 }}>
              Or email <a href="mailto:support@insixlive.com" style={{ color: T.six, textDecoration: "none" }}>support@insixlive.com</a>
            </p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: 20, right: 20, zIndex: 9999,
          width: 56, height: 56, borderRadius: 28,
          background: open ? T.muted : T.ink,
          border: "none", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.22)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background .2s, transform .2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 4l12 12M16 4L4 16" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <span style={{ fontFamily: T.font, fontSize: 20, fontWeight: 800, color: T.six, lineHeight: 1 }}>6</span>
          </div>
        )}
      </button>

      {/* Unread dot (shown before first open) */}
      {!started && !open && (
        <div style={{ position: "fixed", bottom: 66, right: 18, zIndex: 10000, width: 10, height: 10, borderRadius: 5, background: T.six, border: "2px solid #fff" }} />
      )}
    </>
  );
}
