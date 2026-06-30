"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SignUpPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"B2C" | "B2B" | "VENDOR">("B2C");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    cui: "",
    regCom: "",
    sediuSocial: "",
    displayName: "",
    bio: "",
  });

  function update(field: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountType, ...form }),
    });

    if (!response.ok) {
      const body = await response.json();
      setError(typeof body.error === "string" ? body.error : "Date invalide");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="glass-panel w-full max-w-lg p-8">
        <h1 className="text-2xl font-bold">Creează-ți contul</h1>

        <div className="mt-5 flex gap-2 rounded-full border border-border bg-white/5 p-1">
          {(["B2C", "B2B", "VENDOR"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setAccountType(type)}
              type="button"
              className={cn(
                "flex-1 rounded-full px-4 py-2 text-sm font-medium transition",
                accountType === type ? "bg-gradient-to-r from-indigo to-cyan text-background" : "text-white/60",
              )}
            >
              {type === "B2C" ? "Persoană fizică" : type === "B2B" ? "Companie" : "Prestator"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <input
            required
            placeholder="Nume complet"
            value={form.name}
            onChange={update("name")}
            className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-indigo"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={update("email")}
            className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-indigo"
          />
          <input
            required
            type="password"
            placeholder="Parolă (min. 8 caractere)"
            value={form.password}
            onChange={update("password")}
            className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-indigo"
          />

          {accountType === "B2B" && (
            <>
              <input
                required
                placeholder="Denumire companie"
                value={form.companyName}
                onChange={update("companyName")}
                className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-indigo"
              />
              <input
                required
                placeholder="CUI / CIF"
                value={form.cui}
                onChange={update("cui")}
                className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-indigo"
              />
              <input
                required
                placeholder="Nr. Reg. Comerțului"
                value={form.regCom}
                onChange={update("regCom")}
                className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-indigo"
              />
              <input
                required
                placeholder="Sediu social"
                value={form.sediuSocial}
                onChange={update("sediuSocial")}
                className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-indigo"
              />
            </>
          )}

          {accountType === "VENDOR" && (
            <>
              <input
                required
                placeholder="Nume afacere / brand prestator"
                value={form.displayName}
                onChange={update("displayName")}
                className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-indigo"
              />
              <textarea
                placeholder="Descriere scurtă a serviciilor tale (opțional)"
                value={form.bio}
                onChange={update("bio")}
                rows={3}
                className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-indigo"
              />
            </>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="glow-button mt-2 disabled:opacity-50">
            {loading ? "Se creează contul..." : "Creează cont"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Ai deja cont?{" "}
          <Link href="/auth/sign-in" className="text-cyan-glow hover:underline">
            Autentifică-te
          </Link>
        </p>
      </div>
    </main>
  );
}
