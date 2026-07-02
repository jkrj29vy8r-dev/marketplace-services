// Canonical category list — single source of truth, matches the homepage grid.
// ensureCategories() upserts them at runtime so the production DB
// self-heals without needing a manual seed run.
import { db } from "@/lib/db";

export const CANONICAL_CATEGORIES = [
  { slug: "auto", name: "Auto & Detailing", icon: "car" },
  { slug: "fitness-nutritie", name: "Fitness & Nutriție", icon: "dumbbell" },
  { slug: "beauty", name: "Beauty & Înfrumusețare", icon: "wand" },
  { slug: "curatenie", name: "Curățenie", icon: "scissors" },
  { slug: "dj-muzica", name: "DJ & Muzică", icon: "music" },
  { slug: "dansatori-artisti", name: "Dansatori & Artiști", icon: "sparkles" },
  { slug: "transport-logistica", name: "Transport & Logistică", icon: "truck" },
  { slug: "evenimente", name: "Organizare Evenimente", icon: "party" },
  { slug: "mentenanta", name: "Mentenanță & Reparații", icon: "wrench" },
  { slug: "foto-video", name: "Foto & Video", icon: "camera" },
  { slug: "gradinarit", name: "Grădinărit & Exterior", icon: "leaf" },
  { slug: "catering", name: "Catering & Mâncare", icon: "utensils" },
];

let ensured = false;

export async function ensureCategories() {
  if (ensured) return;
  for (const category of CANONICAL_CATEGORIES) {
    await db.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    }).catch(() => null); // ignore races between parallel lambdas
  }
  ensured = true;
}
