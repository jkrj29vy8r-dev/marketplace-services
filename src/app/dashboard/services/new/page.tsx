"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";

type Category = { id: string; name: string };

export default function NewServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const data = {
      categoryId: (form.elements.namedItem("categoryId") as HTMLSelectElement).value,
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
      pricingType: (form.elements.namedItem("pricingType") as HTMLSelectElement).value,
      priceNetRON: parseFloat((form.elements.namedItem("priceNetRON") as HTMLInputElement).value),
      vatRate: 0.19,
      unit: (form.elements.namedItem("unit") as HTMLInputElement).value || undefined,
      durationMins: parseInt((form.elements.namedItem("durationMins") as HTMLInputElement).value) || undefined,
    };

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? "Eroare la salvare");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscută");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-bold">Adaugă serviciu nou</h1>

        <form onSubmit={handleSubmit} className="glass-panel mt-8 flex flex-col gap-5 p-6">
          <div>
            <label className="mb-1 block text-sm text-white/60">Categorie</label>
            <select
              name="categoryId"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="">{categories.length === 0 ? "Se încarcă..." : "Alege categoria..."}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/60">Titlu serviciu</label>
            <input
              name="title"
              type="text"
              required
              minLength={3}
              maxLength={150}
              placeholder="ex. Detailing auto complet"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/60">Descriere</label>
            <textarea
              name="description"
              required
              minLength={10}
              maxLength={3000}
              rows={4}
              placeholder="Descrie serviciul oferit..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-white/60">Tip preț</label>
              <select
                name="pricingType"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="FIXED">Fix</option>
                <option value="PER_UNIT">Per unitate</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-white/60">Preț net (RON, fără TVA)</label>
              <input
                name="priceNetRON"
                type="number"
                required
                min={1}
                step={0.01}
                placeholder="ex. 250"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-white/60">Unitate (opțional)</label>
              <input
                name="unit"
                type="text"
                maxLength={30}
                placeholder="ex. oră, km, bucată"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-white/60">Durată (minute, opțional)</label>
              <input
                name="durationMins"
                type="number"
                min={1}
                placeholder="ex. 120"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-white/60 hover:border-white/30"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-cyan-500 py-2.5 text-sm font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
            >
              {loading ? "Se salvează..." : "Publică serviciul"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
