"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Send, MessageSquare } from "lucide-react";

type Message = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string };
  vendor?: { id: string; displayName: string } | null;
};

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const vendorId = searchParams.get("vendorId");
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function fetchMessages() {
    if (!vendorId) return;
    fetch(`/api/messages?vendorId=${vendorId}`)
      .then((r) => r.json())
      .then((d) => setMessages(d.messages ?? []));
  }

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => setThreads(d.messages ?? []));
  }, [session]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchMessages();
    if (!vendorId) return;
    const interval = setInterval(fetchMessages, 10_000);
    return () => clearInterval(interval);
  }, [vendorId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || !vendorId) return;
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId, body }),
    });
    setSending(false);
    if (res.ok) {
      setBody("");
      fetchMessages();
    }
  }

  return (
    <main className="min-h-screen pb-24">
      <Navbar />
      <section className="mx-auto flex max-w-5xl gap-6 px-6 py-10">
        {/* Thread list */}
        <aside className="w-64 shrink-0">
          <h2 className="mb-3 font-semibold text-white/80">Conversații</h2>
          <div className="flex flex-col gap-2">
            {threads.length === 0 && (
              <p className="text-sm text-white/40">Nicio conversație încă.</p>
            )}
            {threads.map((t) => (
              <a
                key={t.id}
                href={`/messages?vendorId=${t.vendor?.id}`}
                className={`glass-panel flex items-center gap-3 p-3 text-sm ${
                  vendorId === t.vendor?.id ? "border-cyan-500/50" : ""
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-glow to-cyan-glow text-xs font-bold text-black">
                  {t.vendor?.displayName.charAt(0)}
                </div>
                <span className="truncate">{t.vendor?.displayName}</span>
              </a>
            ))}
          </div>
        </aside>

        {/* Chat */}
        <div className="flex flex-1 flex-col">
          {!vendorId ? (
            <div className="glass-panel flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
              <MessageSquare className="h-12 w-12 text-white/20" />
              <p className="text-white/40">Selectează o conversație sau trimite un mesaj unui prestator din profilul său.</p>
            </div>
          ) : (
            <>
              <div className="glass-panel flex flex-1 flex-col gap-3 overflow-y-auto p-4" style={{ maxHeight: "60vh" }}>
                {messages.length === 0 && (
                  <p className="text-center text-sm text-white/30">Niciun mesaj încă. Fii primul!</p>
                )}
                {messages.map((m) => {
                  const isMine = m.senderId === session?.user?.id;
                  return (
                    <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                          isMine
                            ? "bg-gradient-to-r from-indigo-glow to-cyan-glow text-black"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        <p>{m.body}</p>
                        <p className={`mt-1 text-xs ${isMine ? "text-black/50" : "text-white/30"}`}>
                          {new Date(m.createdAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={send} className="mt-3 flex gap-2">
                <input
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Scrie un mesaj..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="submit"
                  disabled={sending || !body.trim()}
                  className="glow-button flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
