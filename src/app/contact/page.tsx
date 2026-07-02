import { Navbar } from "@/components/navbar";
import { Mail, MessageSquare, Clock } from "lucide-react";

export const metadata = { title: "Contact — Zervio" };

export default function ContactPage() {
  return (
    <main className="min-h-screen pb-24">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold">Contact</h1>
        <p className="mt-2 text-white/50">Suntem aici să te ajutăm.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a href="mailto:support@zervio.ro" className="glass-panel flex items-center gap-4 p-6 transition hover:border-cyan-500/40">
            <Mail className="h-8 w-8 shrink-0 text-cyan-glow" />
            <div>
              <h3 className="font-semibold">Suport clienți</h3>
              <p className="text-sm text-white/50">support@zervio.ro</p>
            </div>
          </a>
          <a href="mailto:parteneri@zervio.ro" className="glass-panel flex items-center gap-4 p-6 transition hover:border-cyan-500/40">
            <MessageSquare className="h-8 w-8 shrink-0 text-cyan-glow" />
            <div>
              <h3 className="font-semibold">Parteneriate vendori</h3>
              <p className="text-sm text-white/50">parteneri@zervio.ro</p>
            </div>
          </a>
        </div>

        <div className="mt-4 glass-panel flex items-center gap-4 p-6">
          <Clock className="h-8 w-8 shrink-0 text-cyan-glow" />
          <div>
            <h3 className="font-semibold">Program suport</h3>
            <p className="text-sm text-white/50">Luni – Vineri, 09:00 – 18:00 · Răspundem în maxim 24h lucrătoare</p>
          </div>
        </div>
      </section>
    </main>
  );
}
