import Link from "next/link";
import { BRAND_NAME } from "@/lib/constants/brand";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-background/60 pb-24 pt-12 md:pb-12">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <span className="bg-gradient-to-r from-indigo-glow to-cyan-glow bg-clip-text text-lg font-bold tracking-tight text-transparent">
            {BRAND_NAME}
          </span>
          <p className="mt-2 text-xs text-white/40">
            Marketplace hibrid B2B+B2C pentru servicii, logistică și evenimente în România.
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">Platformă</p>
          <ul className="flex flex-col gap-2 text-sm text-white/50">
            <li><Link href="/services" className="hover:text-white">Servicii</Link></li>
            <li><Link href="/vendors" className="hover:text-white">Prestatori</Link></li>
            <li><Link href="/rfq" className="hover:text-white">Cerere de Ofertă</Link></li>
            <li><Link href="/auth/sign-up" className="hover:text-white">Înregistrare</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">Companie</p>
          <ul className="flex flex-col gap-2 text-sm text-white/50">
            <li><Link href="/despre" className="hover:text-white">Despre noi</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/termeni" className="hover:text-white">Termeni și condiții</Link></li>
            <li><Link href="/confidentialitate" className="hover:text-white">Politică confidențialitate</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">Social</p>
          <ul className="flex flex-col gap-2 text-sm text-white/50">
            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook</a></li>
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a></li>
            <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn</a></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-white/5 px-6 pt-6">
        <p className="text-center text-xs text-white/20">
          © {new Date().getFullYear()} {BRAND_NAME}. Toate drepturile rezervate.
        </p>
      </div>
    </footer>
  );
}
