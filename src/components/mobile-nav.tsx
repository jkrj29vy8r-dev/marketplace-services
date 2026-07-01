"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Search, CalendarDays, User } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: "/", label: "Acasă", icon: Home, match: (p: string) => p === "/" },
    { href: "/services", label: "Caută", icon: Search, match: (p: string) => p.startsWith("/services") },
    {
      href: session?.user ? "/dashboard" : "/auth/sign-in",
      label: session?.user?.role === "CUSTOMER_B2B" ? "RFQ" : "Rezervări",
      icon: CalendarDays,
      match: (p: string) => p.startsWith("/dashboard") || p.startsWith("/booking") || p.startsWith("/rfq"),
    },
    {
      href: session?.user ? "/dashboard/profile" : "/auth/sign-in",
      label: "Cont",
      icon: User,
      match: (p: string) => p.startsWith("/dashboard/profile") || p === "/auth/sign-in" || p === "/auth/sign-up",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/90 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {links.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={label}
              href={href}
              className={`flex min-h-[48px] min-w-[60px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-[10px] font-medium transition ${
                active ? "text-cyan-400" : "text-white/40 hover:text-white/70"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-cyan-400" : ""}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
