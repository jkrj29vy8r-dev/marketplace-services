"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      const json = await res.json() as { error?: string };
      toast.error(json.error ?? "Eroare. Reîncearcă.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="glass-panel w-full max-w-md p-8">
        {sent ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <MailCheck className="h-12 w-12 text-cyan-glow" />
            <h1 className="text-xl font-bold">Verifică-ți emailul</h1>
            <p className="text-sm text-white/60">
              Dacă există un cont pentru <strong>{email}</strong>, vei primi un link de resetare a parolei. Linkul e valabil 1 oră.
            </p>
            <Link href="/auth/sign-in" className="text-sm text-cyan-glow hover:underline">
              Înapoi la autentificare
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Ai uitat parola?</h1>
            <p className="mt-2 text-sm text-white/50">
              Introdu adresa de email și îți trimitem un link de resetare.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm text-white/60">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="adresa@email.ro"
                  className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-indigo"
                />
              </div>
              <button type="submit" disabled={loading} className="glow-button disabled:opacity-50">
                {loading ? "Se trimite..." : "Trimite link de resetare"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-white/50">
              Ți-ai amintit parola?{" "}
              <Link href="/auth/sign-in" className="text-cyan-glow hover:underline">
                Autentifică-te
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
