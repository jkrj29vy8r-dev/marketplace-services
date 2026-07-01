import Link from "next/link";
import { Navbar } from "@/components/navbar";

export const metadata = {
  title: "Pagina negăsită — Zervio",
};

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto flex max-w-xl flex-col items-center px-6 py-32 text-center">
        <p className="text-6xl font-bold text-cyan-500">404</p>
        <h1 className="mt-4 text-2xl font-semibold">Pagina nu a fost găsită</h1>
        <p className="mt-2 text-white/50">
          Resursa pe care o cauți nu există sau a fost mutată.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-cyan-400"
        >
          Înapoi la pagina principală
        </Link>
      </section>
    </main>
  );
}
