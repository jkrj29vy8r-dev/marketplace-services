"use client";

import {
  Music4,
  Sparkles,
  Truck,
  Scissors,
  PartyPopper,
  Wrench,
  Camera,
  Leaf,
  Car,
  Dumbbell,
  Wand2,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const CATEGORIES = [
  { slug: "auto", name: "Auto & Detailing", icon: Car },
  { slug: "fitness-nutritie", name: "Fitness & Nutriție", icon: Dumbbell },
  { slug: "beauty", name: "Beauty & Înfrumusețare", icon: Wand2 },
  { slug: "curatenie", name: "Curățenie", icon: Scissors },
  { slug: "dj-muzica", name: "DJ & Muzică", icon: Music4 },
  { slug: "dansatori-artisti", name: "Dansatori & Artiști", icon: Sparkles },
  { slug: "transport-logistica", name: "Transport & Logistică", icon: Truck },
  { slug: "evenimente", name: "Organizare Evenimente", icon: PartyPopper },
  { slug: "mentenanta", name: "Mentenanță & Reparații", icon: Wrench },
  { slug: "foto-video", name: "Foto & Video", icon: Camera },
  { slug: "gradinarit", name: "Grădinărit & Exterior", icon: Leaf },
  { slug: "catering", name: "Catering & Mâncare", icon: UtensilsCrossed },
];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {CATEGORIES.map((category, index) => {
        const Icon = category.icon;
        return (
          <motion.div
            key={category.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
          >
            <Link
              href={`/services?category=${category.slug}`}
              className="glass-panel group flex flex-col items-center gap-3 px-4 py-6 text-center transition hover:border-indigo/40 hover:shadow-glow"
            >
              <Icon className="h-7 w-7 text-cyan-glow transition group-hover:scale-110 group-hover:animate-float" />
              <span className="text-sm font-medium text-white/80">{category.name}</span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
