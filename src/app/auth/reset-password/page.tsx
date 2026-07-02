"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Parolele nu coincid");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Parola a fost schimbată. Autentifică-te cu noua parolă.");
      router.push("/auth/sign-in");
    } else {
      const json = await res.json() as { error?: string };
      toast.error(json.error ?? "Eroare. Reîncearcă.");
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="glass-panel w-full max-w-md p-8 text-center">
          <h1 className="text-xl font-bold">Link invalid</h1>
          <p className="mt-2 text-sm text-white/50">Linkul de resetare lipsește sau e incomplet.</p>
          <Link href="/auth/forgot-password" className="mt-4 inline-block text-sm text-cyan-glow hover:underline">
            Solicită un link nou
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="glass-panel w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">Setează o parolă nouă</h1>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm text-white/60">Parolă nouă (minim 8 caractere)</label>
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/60">Confirmă parola</label>
            <input
              required
              type="password"
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo"
            />
          </div>
          <button type="submit" disabled={loading} className="glow-button disabled:opacity-50">
            {loading ? "Se salvează..." : "Salvează parola nouă"}
          </button>
        </form>
      </div>
    </main>
  );
}
