"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/constants/brand";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email sau parolă incorecte");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">
          Autentificare pe{" "}
          <span className="bg-gradient-to-r from-indigo-glow to-cyan-glow bg-clip-text text-transparent">
            {BRAND_NAME}
          </span>
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-indigo"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Parolă"
            className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-indigo"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="glow-button mt-2 disabled:opacity-50">
            {loading ? "Se autentifică..." : "Autentificare"}
          </button>
        </form>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="mt-4 w-full rounded-xl border border-border px-4 py-3 text-sm transition hover:border-white/30"
        >
          Continuă cu Google
        </button>

        <p className="mt-6 text-center text-sm text-white/50">
          Nu ai cont?{" "}
          <Link href="/auth/sign-up" className="text-cyan-glow hover:underline">
            Înregistrează-te
          </Link>
        </p>
      </div>
    </main>
  );
}
