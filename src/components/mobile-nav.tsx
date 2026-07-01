"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Search, CalendarDays, User } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: "/", label: "Acasă", icon: Home },
    { href: "/services", label: "Caută", icon: Search },
    {
      href: session?.user ? "/dashboard" : "/auth/sign-in",
      label: session?.user?.role === "CUSTOMER_B2B" ? "RFQ" : "Rezervări",
      icon: CalendarDays,
    },
    {
      href: session?.user ? "/dashboard" : "/auth/sign-in",
      label: "Cont",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/90 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
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
