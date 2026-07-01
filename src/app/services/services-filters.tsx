"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Category = { id: string; slug: string; name: string };

export function ServicesFilters({
  categories,
  currentParams,
}: {
  categories: Category[];
  currentParams: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/services?${params.toString()}`);
    },
    [router, searchParams],
  );

  const clear = () => router.push("/services");

  const hasFilters = ["category", "priceMin", "priceMax", "ratingMin", "sort", "pricingType"].some(
    (k) => currentParams[k],
  );

  return (
    <div className="glass-panel flex flex-col gap-5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white/80">Filtre</p>
        {hasFilters && (
          <button onClick={clear} className="text-xs text-cyan-400 hover:underline">
            Resetează
          </button>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-white/50">Categorie</label>
        <select
          value={currentParams.category ?? ""}
          onChange={(e) => update("category", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
        >
          <option value="">Toate categoriile</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-white/50">Tip preț</label>
        <select
          value={currentParams.pricingType ?? ""}
          onChange={(e) => update("pricingType", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
        >
          <option value="">Oricare</option>
          <option value="FIXED">Preț fix</option>
          <option value="PER_UNIT">Per unitate</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-white/50">Interval preț (RON)</label>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            defaultValue={currentParams.priceMin ?? ""}
            onBlur={(e) => update("priceMin", e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <input
            type="number"
            min={0}
            placeholder="Max"
            defaultValue={currentParams.priceMax ?? ""}
            onBlur={(e) => update("priceMax", e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-white/50">Rating minim</label>
        <select
          value={currentParams.ratingMin ?? ""}
          onChange={(e) => update("ratingMin", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
        >
          <option value="">Orice rating</option>
          <option value="4">4★ și mai mult</option>
          <option value="3">3★ și mai mult</option>
          <option value="2">2★ și mai mult</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-white/50">Sortare</label>
        <select
          value={currentParams.sort ?? ""}
          onChange={(e) => update("sort", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
        >
          <option value="">Relevanță</option>
          <option value="price_asc">Preț crescător</option>
          <option value="price_desc">Preț descrescător</option>
          <option value="rating">Cel mai bun rating</option>
          <option value="newest">Cele mai noi</option>
        </select>
      </div>
    </div>
  );
}
