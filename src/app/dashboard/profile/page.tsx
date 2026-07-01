"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loadingName, setLoadingName] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setLoadingName(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoadingName(false);
    if (res.ok) {
      await update({ name });
      toast.success("Numele a fost actualizat");
      router.refresh();
    } else {
      toast.error("Eroare la actualizare");
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Parola trebuie să aibă minim 8 caractere");
      return;
    }
    setLoadingPass(true);
    const res = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setLoadingPass(false);
    if (res.ok) {
      toast.success("Parola a fost schimbată");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      const json = await res.json() as { error?: string };
      toast.error(json.error ?? "Eroare");
    }
  }

  return (
    <main className="min-h-screen pb-24">
      <Navbar />
      <section className="mx-auto max-w-xl px-6 py-12">
        <h1 className="text-2xl font-bold">Profilul meu</h1>
        <p className="mt-1 text-sm text-white/40">{session?.user?.email}</p>

        {/* Name */}
        <form onSubmit={saveName} className="glass-panel mt-8 flex flex-col gap-4 p-6">
          <h2 className="font-semibold">Date personale</h2>
          <div>
            <label className="mb-1.5 block text-sm text-white/60">Nume complet</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={loadingName}
            className="glow-button self-start disabled:opacity-50"
          >
            {loadingName ? "Se salvează..." : "Salvează"}
          </button>
        </form>

        {/* Password */}
        <form onSubmit={savePassword} className="glass-panel mt-4 flex flex-col gap-4 p-6">
          <h2 className="font-semibold">Schimbă parola</h2>
          <div>
            <label className="mb-1.5 block text-sm text-white/60">Parola curentă</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/60">Parola nouă (minim 8 caractere)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={loadingPass}
            className="glow-button self-start disabled:opacity-50"
          >
            {loadingPass ? "Se schimbă..." : "Schimbă parola"}
          </button>
        </form>
      </section>
    </main>
  );
}
