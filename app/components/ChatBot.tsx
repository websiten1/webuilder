"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";

const AGENT = "/support-agent.png";

const C = {
  orange: "#FF7A18",
  orangeLight: "#FF9F43",
  orangeGlow: "rgba(255, 122, 24, 0.35)",
  ink: "#0F1419",
  inkSoft: "#3D4451",
  muted: "#8B919E",
  white: "#FFFFFF",
  glass: "rgba(255, 255, 255, 0.72)",
  glassBorder: "rgba(255, 255, 255, 0.55)",
  surface: "#F7F8FA",
  line: "rgba(15, 20, 25, 0.08)",
  font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif',
};

const WELCOME = "Salut 👋 Sunt Alex de la insixlive. Întreabă-mă orice — prețuri, domenii, cum funcționează sau ce primești după plată.";
const WELCOME_SUGGESTIONS = ["Ce este insixlive?", "Cât costă un site?", "Cum funcționează?", "Dețin site-ul?"];
const ERROR_FALLBACK = "Ne pare rău — nu am putut contacta suportul acum. Scrie la support@insixlive.com și te ajutăm direct.";

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1");
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ fontWeight: 600, color: C.ink }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function MessageText({ text }: { text: string }) {
  const cleaned = stripMarkdown(text);
  const lines = cleaned.split("\n");

  return (
    <div style={{ fontFamily: C.font, fontSize: 14, lineHeight: 1.65, color: C.inkSoft }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: 8 }} />;

        const bullet = trimmed.match(/^[-•]\s+(.+)/);
        if (bullet) {
          return (
            <div key={i} style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "flex-start" }}>
              <span style={{ color: C.orange, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>•</span>
              <span>{renderInline(bullet[1])}</span>
            </div>
          );
        }

        const numbered = trimmed.match(/^(\d+)[.)]\s+(.+)/);
        if (numbered) {
          return (
            <div key={i} style={{ display: "flex", gap: 10, marginTop: 6, alignItems: "flex-start" }}>
              <span style={{
                flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                background: "rgba(255,122,24,0.1)", color: C.orange,
                fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                marginTop: 1,
              }}>{numbered[1]}</span>
              <span style={{ flex: 1, paddingTop: 2 }}>{renderInline(numbered[2])}</span>
            </div>
          );
        }

        return (
          <div key={i} style={{ marginTop: i > 0 ? 6 : 0 }}>
            {renderInline(trimmed)}
          </div>
        );
      })}
    </div>
  );
}

function AgentAvatar({ size = 40 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
        boxShadow: "0 4px 14px rgba(15,20,25,0.12)",
      }}
    >
      <Image src={AGENT} alt="Agent suport" width={size} height={size} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
    </div>
  );
}

type Message = {
  id: number;
  role: "bot" | "user";
  text: string;
  suggestions?: string[];
};

type ApiMessage = { role: "user" | "assistant"; content: string };

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);

  const nextId = () => ++idRef.current;

  const openChat = useCallback(() => {
    setHintVisible(false);
    setOpen(true);
  }, []);

  const closeChat = useCallback(() => setOpen(false), []);

  const addBotMessage = useCallback((text: string, suggestions?: string[]) => {
    setMessages(prev => [...prev, { id: nextId(), role: "bot", text, suggestions }]);
  }, []);

  useEffect(() => {
    if (open && !started) {
      setStarted(true);
      setTimeout(() => addBotMessage(WELCOME, WELCOME_SUGGESTIONS), 400);
    }
  }, [open, started, addBotMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    setInput("");
    const userMessage: Message = { id: nextId(), role: "user", text: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setTyping(true);

    const history: ApiMessage[] = [...messages, userMessage]
      .filter(m => m.role === "user" || m.role === "bot")
      .map(m => ({
        role: m.role === "user" ? "user" as const : "assistant" as const,
        content: m.text,
      }));

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          locale: "ro",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Request failed");
      }

      addBotMessage(typeof data.reply === "string" ? data.reply : ERROR_FALLBACK);
    } catch (err) {
      const msg = err instanceof Error ? err.message : ERROR_FALLBACK;
      addBotMessage(
        msg === "Request failed" || msg === "Failed to fetch" ? ERROR_FALLBACK : msg,
        ["Cât costă un site?", "Contactează suportul"],
      );
    } finally {
      setTyping(false);
    }
  }, [typing, addBotMessage, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      <style>{`
        @keyframes chatWindowIn {
          from { opacity: 0; transform: translateY(20px) scale(0.94); filter: blur(4px); }
          to { opacity: 1; transform: none; filter: none; }
        }
        @keyframes chatBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes msgSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes fabIn {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes dotWave {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes hintIn {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: none; }
        }
        .chat-backdrop { animation: chatBackdropIn .25s ease both; }
        .chat-window-premium { animation: chatWindowIn .38s cubic-bezier(.22,1,.36,1) both; }
        .msg-in { animation: msgSlideIn .32s cubic-bezier(.22,1,.36,1) both; }
        .fab-premium { animation: fabIn .4s cubic-bezier(.22,1,.36,1) both; }
        .support-hint { animation: hintIn .45s ease .6s both; pointer-events: auto; }
        .typing-dot:nth-child(1) { animation: dotWave 1.2s .0s infinite ease-in-out; }
        .typing-dot:nth-child(2) { animation: dotWave 1.2s .15s infinite ease-in-out; }
        .typing-dot:nth-child(3) { animation: dotWave 1.2s .3s infinite ease-in-out; }
        .chip-premium {
          transition: transform .18s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease, color .18s ease;
        }
        .chip-premium:hover {
          transform: translateY(-1px);
          background: linear-gradient(135deg, #FF7A18, #FF9F43) !important;
          border-color: transparent !important;
          color: #fff !important;
          box-shadow: 0 6px 20px rgba(255,122,24,0.28);
        }
        .chat-input-premium:focus {
          outline: none;
          border-color: rgba(255,122,24,0.45) !important;
          box-shadow: 0 0 0 4px rgba(255,122,24,0.1);
        }
        .send-premium:not(:disabled):hover {
          transform: scale(1.06);
          box-shadow: 0 8px 24px rgba(255,122,24,0.4);
        }
        .send-premium:not(:disabled):active { transform: scale(0.96); }
        .fab-btn:hover { transform: scale(1.06); }
        .fab-btn:active { transform: scale(0.96); }
        .messages-scroll::-webkit-scrollbar { width: 5px; }
        .messages-scroll::-webkit-scrollbar-thumb { background: rgba(15,20,25,0.12); border-radius: 99px; }
        @media (max-width: 480px) {
          .chat-window-premium {
            width: calc(100vw - 20px) !important;
            right: 10px !important;
            bottom: 84px !important;
            max-height: min(78vh, 620px) !important;
          }
          .support-hint { display: none !important; }
        }
      `}</style>

      {open && (
        <div
          className="chat-backdrop"
          onClick={closeChat}
          style={{
            position: "fixed", inset: 0, zIndex: 100000,
            background: "rgba(15, 20, 25, 0.18)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {open && (
        <div
          className="chat-window-premium"
          style={{
            position: "fixed", bottom: 92, right: 20, zIndex: 100001,
            width: 400, maxHeight: 620, height: "min(78vh, 620px)",
            borderRadius: 28,
            display: "flex", flexDirection: "column", overflow: "hidden",
            background: C.glass,
            backdropFilter: "blur(24px) saturate(1.4)",
            WebkitBackdropFilter: "blur(24px) saturate(1.4)",
            border: `1px solid ${C.glassBorder}`,
            boxShadow: "0 32px 80px rgba(15,20,25,0.18), 0 0 0 1px rgba(255,255,255,0.5) inset",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "18px 18px 16px",
            background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(247,248,250,0.85) 100%)",
            borderBottom: `1px solid ${C.line}`,
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <AgentAvatar size={48} />
                <div>
                  <p style={{ fontFamily: C.font, fontSize: 15, fontWeight: 700, color: C.ink, margin: 0, letterSpacing: -0.3 }}>
                    Suport insixlive
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: typing ? C.orange : "#22C55E",
                      boxShadow: typing ? `0 0 8px ${C.orangeGlow}` : "0 0 6px rgba(34,197,94,0.5)",
                      transition: "background .3s, box-shadow .3s",
                    }} />
                    <p style={{ fontFamily: C.font, fontSize: 12, color: C.muted, margin: 0 }}>
                      {typing ? "Scrie…" : "Online · răspunde instant"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={closeChat}
                aria-label="Închide chat-ul"
                style={{
                  background: "rgba(15,20,25,0.05)", border: "none", color: C.muted,
                  width: 32, height: 32, borderRadius: 10, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, lineHeight: 1, transition: "background .15s",
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="messages-scroll"
            style={{
              flex: 1, overflowY: "auto", padding: "18px 16px 10px",
              display: "flex", flexDirection: "column", gap: 14, minHeight: 0,
              background: "linear-gradient(180deg, #F7F8FA 0%, #EEF0F4 100%)",
            }}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                className="msg-in"
                style={{
                  display: "flex",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-end",
                  gap: 10,
                }}
              >
                {msg.role === "bot" && <AgentAvatar size={32} />}

                <div style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", gap: 8, maxWidth: "calc(100% - 42px)" }}>
                  <div style={{
                    padding: "12px 16px",
                    borderRadius: msg.role === "user" ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
                    background: msg.role === "user"
                      ? "linear-gradient(135deg, #0F1419 0%, #1E2633 100%)"
                      : "rgba(255,255,255,0.92)",
                    border: msg.role === "bot" ? `1px solid ${C.line}` : "none",
                    boxShadow: msg.role === "user"
                      ? "0 8px 24px rgba(15,20,25,0.18)"
                      : "0 4px 16px rgba(15,20,25,0.06)",
                  }}>
                    {msg.role === "user" ? (
                      <p style={{ fontFamily: C.font, fontSize: 14, color: "#fff", margin: 0, lineHeight: 1.55 }}>{msg.text}</p>
                    ) : (
                      <MessageText text={msg.text} />
                    )}
                  </div>

                  {msg.role === "bot" && msg.suggestions && msg.suggestions.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {msg.suggestions.map(s => (
                        <button
                          key={s}
                          className="chip-premium"
                          onClick={() => void sendMessage(s)}
                          style={{
                            background: "rgba(255,255,255,0.85)",
                            border: `1px solid ${C.line}`,
                            color: C.inkSoft,
                            borderRadius: 999,
                            padding: "6px 14px",
                            fontFamily: C.font,
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: "pointer",
                            whiteSpace: "nowrap" as const,
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="msg-in" style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                <AgentAvatar size={32} />
                <div style={{
                  padding: "14px 18px",
                  background: "rgba(255,255,255,0.92)",
                  border: `1px solid ${C.line}`,
                  borderRadius: "20px 20px 20px 6px",
                  display: "flex", gap: 5, alignItems: "center",
                  boxShadow: "0 4px 16px rgba(15,20,25,0.06)",
                }}>
                  {[0, 1, 2].map(n => (
                    <div
                      key={n}
                      className="typing-dot"
                      style={{ width: 7, height: 7, borderRadius: "50%", background: C.orange }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "14px 16px 16px",
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(12px)",
            borderTop: `1px solid ${C.line}`,
            flexShrink: 0,
          }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                ref={inputRef}
                className="chat-input-premium"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Întreabă orice…"
                style={{
                  flex: 1,
                  border: `1px solid ${C.line}`,
                  borderRadius: 999,
                  padding: "12px 18px",
                  fontFamily: C.font,
                  fontSize: 14,
                  color: C.ink,
                  background: C.white,
                  transition: "border-color .2s, box-shadow .2s",
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="send-premium"
                style={{
                  width: 44, height: 44, borderRadius: 22, border: "none",
                  background: input.trim() && !typing
                    ? "linear-gradient(135deg, #FF7A18 0%, #FF9F43 100%)"
                    : "rgba(15,20,25,0.08)",
                  cursor: input.trim() && !typing ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  transition: "transform .18s ease, box-shadow .18s ease, background .18s ease",
                  boxShadow: input.trim() && !typing ? "0 6px 20px rgba(255,122,24,0.32)" : "none",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M14 8L2 2l3 6-3 6 12-6z" fill={input.trim() && !typing ? "#fff" : C.muted} />
                </svg>
              </button>
            </form>
            <p style={{ fontFamily: C.font, fontSize: 11, color: C.muted, textAlign: "center", marginTop: 10, marginBottom: 0 }}>
              Sau scrie la{" "}
              <a href="mailto:support@insixlive.com" style={{ color: C.orange, textDecoration: "none", fontWeight: 500 }}>
                support@insixlive.com
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Floating launcher + hint */}
      <div
        className="fab-premium"
        style={{
          position: "fixed", bottom: 20, right: 20, zIndex: 100000,
          display: "flex", alignItems: "center", gap: 12,
          pointerEvents: "none",
        }}
      >
        {!open && hintVisible && (
          <button
            type="button"
            className="support-hint"
            onClick={openChat}
            style={{
              pointerEvents: "auto",
              position: "relative",
              border: `1px solid ${C.line}`,
              borderRadius: 16,
              padding: "10px 14px",
              maxWidth: 220,
              background: "rgba(255,255,255,0.96)",
              boxShadow: "0 8px 28px rgba(15,20,25,0.12)",
              cursor: "pointer",
              fontFamily: C.font,
              fontSize: 13,
              fontWeight: 500,
              lineHeight: 1.45,
              color: C.inkSoft,
              textAlign: "left",
            }}
          >
            Ai nevoie de ajutor? Sunt aici.
            <span
              aria-hidden
              style={{
                position: "absolute",
                right: -6,
                bottom: 18,
                width: 12,
                height: 12,
                background: "rgba(255,255,255,0.96)",
                borderRight: `1px solid ${C.line}`,
                borderBottom: `1px solid ${C.line}`,
                transform: "rotate(-45deg)",
              }}
            />
          </button>
        )}

        <button
          type="button"
          onClick={() => (open ? closeChat() : openChat())}
          className="fab-btn"
          aria-label={open ? "Închide suportul" : "Deschide suportul"}
          style={{
            pointerEvents: "auto",
            position: "relative",
            zIndex: 2,
            width: 60, height: 60, borderRadius: "50%",
            border: "none", cursor: "pointer", padding: 0, overflow: "hidden",
            background: open ? C.ink : C.white,
            boxShadow: "0 8px 28px rgba(15,20,25,0.18), 0 0 0 3px #fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s ease, background .22s ease",
          }}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <path d="M4 4l12 12M16 4L4 16" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          ) : (
            <Image src={AGENT} alt="Deschide suportul" width={60} height={60} style={{ objectFit: "cover", width: "100%", height: "100%", pointerEvents: "none" }} />
          )}
        </button>
      </div>
    </>
  );
}
