"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutDashboard, User, LogOut } from "lucide-react";
import { BRAND_NAME } from "@/lib/constants/brand";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-glow to-cyan-glow bg-clip-text text-transparent">
            {BRAND_NAME}
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          {[
            { href: "/services", label: "Servicii" },
            { href: "/vendors", label: "Prestatori" },
            { href: "/rfq", label: "Cerere de Ofertă" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`transition hover:text-white ${isActive(href) ? "text-white" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm transition hover:border-white/30"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-glow to-cyan-glow text-xs font-bold text-black">
                  {getInitials(session.user?.name ?? "?")}
                </span>
                <span className="hidden max-w-[120px] truncate md:block text-white/80">
                  {session.user?.name?.split(" ")[0]}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>

              {open && (
                <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-background/95 shadow-xl backdrop-blur-xl">
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="text-sm font-medium text-white">{session.user?.name}</p>
                    <p className="text-xs text-white/40 truncate">{session.user?.email}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      <User className="h-4 w-4" />
                      Contul meu
                    </Link>
                    <button
                      onClick={() => { setOpen(false); signOut(); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      Deconectare
                    </button>
                  </div>
                </div>
              )}
            </div>
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
