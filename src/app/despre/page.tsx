import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Store, CalendarCheck, ShieldCheck } from "lucide-react";

export const metadata = { title: "Despre noi — Zervio" };

export default function AboutPage() {
  return (
    <main className="min-h-screen pb-24">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold">Despre Zervio</h1>
        <p className="mt-4 text-white/70 leading-relaxed">
          Zervio este marketplace-ul românesc care conectează oamenii și companiile cu prestatori de servicii
          verificați — de la curățenie și auto, la evenimente, fitness și logistică. Rezervi online în câteva
          minute, plătești sigur și lași recenzii care contează.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="glass-panel p-5 text-center">
            <Store className="mx-auto h-8 w-8 text-cyan-glow" />
            <h3 className="mt-3 font-semibold">Prestatori verificați</h3>
            <p className="mt-1 text-sm text-white/50">Profiluri cu badge de verificare și recenzii reale.</p>
          </div>
          <div className="glass-panel p-5 text-center">
            <CalendarCheck className="mx-auto h-8 w-8 text-cyan-glow" />
            <h3 className="mt-3 font-semibold">Rezervare instant</h3>
            <p className="mt-1 text-sm text-white/50">Calendar cu sloturi disponibile în timp real.</p>
          </div>
          <div className="glass-panel p-5 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-cyan-glow" />
            <h3 className="mt-3 font-semibold">Plăți sigure</h3>
            <p className="mt-1 text-sm text-white/50">Card sau transfer bancar, cu factură pentru fiecare plată.</p>
          </div>
        </div>

        <div className="mt-10 glass-panel p-6 text-center">
          <h2 className="text-lg font-semibold">Ești prestator de servicii?</h2>
          <p className="mt-1 text-sm text-white/50">Creează-ți profilul gratuit și primește clienți noi.</p>
          <Link href="/auth/sign-up" className="glow-button mt-4 inline-block">
            Devino partener Zervio
          </Link>
        </div>
      </section>
    </main>
  );
}
