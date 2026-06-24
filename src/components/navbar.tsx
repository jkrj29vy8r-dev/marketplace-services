"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { BRAND_NAME } from "@/lib/constants/brand";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-glow to-cyan-glow bg-clip-text text-transparent">
            {BRAND_NAME}
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          <Link href="/services" className="transition hover:text-white">
            Servicii
          </Link>
          <Link href="/vendors" className="transition hover:text-white">
            Prestatori
          </Link>
          <Link href="/rfq" className="transition hover:text-white">
            Cerere de Ofertă
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full border border-border px-4 py-2 text-sm transition hover:border-white/30"
              >
                Contul meu
              </Link>
              <button
                onClick={() => signOut()}
                className="rounded-full px-4 py-2 text-sm text-white/60 transition hover:text-white"
              >
                Deconectare
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="rounded-full border border-border px-4 py-2 text-sm transition hover:border-white/30"
              >
                Autentificare
              </Link>
              <Link href="/auth/sign-up" className="glow-button text-sm">
                Înregistrare
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
