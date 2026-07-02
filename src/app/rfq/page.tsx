"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { formatRON } from "@/lib/utils";

type Offer = {
  id: string;
  priceRON: number;
  message: string;
  status: string;
  vendor: { displayName: string };
};

type RFQItem = {
  id: string;
  title: string;
  description: string;
  budgetMinRON: number | null;
  budgetMaxRON: number | null;
  status: string;
  offers: Offer[];
  company?: { name: string };
};

export default function RFQPage() {
  return (
    <Suspense fallback={null}>
      <RFQPageContent />
    </Suspense>
  );
}

function RFQPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [rfqs, setRfqs] = useState<RFQItem[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budgetMinRON: "",
    budgetMaxRON: "",
  });
  const [offerForms, setOfferForms] = useState<Record<string, { priceRON: string; message: string }>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);

  const isB2B = session?.user.role === "CUSTOMER_B2B";
  const isVendor = session?.user.role === "VENDOR";

  function refresh() {
    fetch("/api/rfq")
      .then((res) => res.json())
      .then((data) => setRfqs(data.rfqs ?? []));
  }

  useEffect(() => {
    if (session) refresh();
  }, [session]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/rfq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        serviceId: searchParams.get("serviceId") ?? undefined,
        budgetMinRON: form.budgetMinRON ? Number(form.budgetMinRON) : undefined,
        budgetMaxRON: form.budgetMaxRON ? Number(form.budgetMaxRON) : undefined,
      }),
    });

    if (!response.ok) {
      const body = await response.json();
      setError(typeof body.error === "string" ? body.error : "Date invalide");
      return;
    }

    setForm({ title: "", description: "", budgetMinRON: "", budgetMaxRON: "" });
    refresh();
  }

  async function handleOffer(rfqId: string) {
    const data = offerForms[rfqId];
    if (!data?.priceRON || !data?.message) return;

    await fetch(`/api/rfq/${rfqId}/offers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceRON: Number(data.priceRON), message: data.message }),
    });

    refresh();
  }

  async function handleDecision(rfqId: string, offerId: string, action: "ACCEPT" | "REJECT" | "WITHDRAW") {
    await fetch(`/api/rfq/${rfqId}/offers/${offerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    refresh();
  }

  const RFQ_STATUS: Record<string, { label: string; cls: string }> = {
    OPEN: { label: "Deschisă", cls: "bg-cyan-500/15 text-cyan-400 animate-pulse" },
    OFFER_RECEIVED: { label: "Oferte primite", cls: "bg-yellow-500/15 text-yellow-400" },
    ACCEPTED: { label: "Acceptată", cls: "bg-green-500/15 text-green-400" },
    REJECTED: { label: "Respinsă", cls: "bg-red-500/15 text-red-400" },
    CLOSED: { label: "Închisă", cls: "bg-white/10 text-white/40" },
  };

  const OFFER_STATUS: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "În așteptare", cls: "text-yellow-400" },
    ACCEPTED: { label: "Acceptată", cls: "text-green-400" },
    REJECTED: { label: "Respinsă", cls: "text-red-400" },
    WITHDRAWN: { label: "Retrasă", cls: "text-white/40" },
  };

  if (!session) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <p className="mx-auto max-w-2xl px-6 py-20 text-center text-white/60">
          Autentifică-te cu un cont de companie pentru a trimite cereri de ofertă.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-bold">Cereri de Ofertă (RFQ)</h1>

        {isB2B && (
          <form onSubmit={handleCreate} className="glass-panel mt-6 flex flex-col gap-3 p-6">
            <h2 className="font-semibold text-white/80">Trimite o cerere nouă</h2>
            <label className="-mb-2 text-sm text-white/60">Titlu cerere</label>
            <input
              required
              placeholder="Titlu (ex: Curățenie hală 2000mp)"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-indigo"
            />
            <label className="-mb-2 text-sm text-white/60">Descriere</label>
            <textarea
              required
              placeholder="Descriere detaliată a proiectului"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={4}
              className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-indigo"
            />
            <label className="-mb-2 text-sm text-white/60">Buget estimat (RON)</label>
            <div className="flex gap-3">
              <input
                placeholder="Buget minim (RON)"
                value={form.budgetMinRON}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, budgetMinRON: event.target.value }))
                }
                className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-indigo"
              />
              <input
                placeholder="Buget maxim (RON)"
                value={form.budgetMaxRON}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, budgetMaxRON: event.target.value }))
                }
                className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-indigo"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" className="glow-button mt-1">
              Trimite cererea
            </button>
          </form>
        )}

        <div className="mt-8 flex flex-col gap-4">
          {rfqs.length === 0 && (
            <p className="text-sm text-white/40">
              {isB2B ? "Nu ai cereri de ofertă trimise." : "Nicio cerere deschisă momentan."}
            </p>
          )}
          {rfqs.map((rfq) => (
            <div key={rfq.id} className="glass-panel p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{rfq.title}</h3>
                <div className="flex items-center gap-2">
                  {rfq.offers.length > 0 && (
                    <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-medium text-cyan-400">
                      {rfq.offers.length} {rfq.offers.length === 1 ? "ofertă" : "oferte"}
                    </span>
                  )}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${RFQ_STATUS[rfq.status]?.cls ?? "text-white/40"}`}>
                    {RFQ_STATUS[rfq.status]?.label ?? rfq.status}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-white/60">{rfq.description}</p>
              {(rfq.budgetMinRON || rfq.budgetMaxRON) && (
                <p className="mt-2 text-sm text-white/40">
                  Buget: {rfq.budgetMinRON ? formatRON(rfq.budgetMinRON) : "—"} -{" "}
                  {rfq.budgetMaxRON ? formatRON(rfq.budgetMaxRON) : "—"}
                </p>
              )}

              {isVendor && rfq.status === "OPEN" && (
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                  <input
                    placeholder="Preț ofertă (RON)"
                    value={offerForms[rfq.id]?.priceRON ?? ""}
                    onChange={(event) =>
                      setOfferForms((prev) => ({
                        ...prev,
                        [rfq.id]: { ...prev[rfq.id], priceRON: event.target.value, message: prev[rfq.id]?.message ?? "" },
                      }))
                    }
                    className="rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm placeholder:text-white/40 focus:outline-none"
                  />
                  <textarea
                    placeholder="Mesaj / detalii ofertă"
                    value={offerForms[rfq.id]?.message ?? ""}
                    onChange={(event) =>
                      setOfferForms((prev) => ({
                        ...prev,
                        [rfq.id]: { ...prev[rfq.id], message: event.target.value, priceRON: prev[rfq.id]?.priceRON ?? "" },
                      }))
                    }
                    rows={2}
                    className="rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm placeholder:text-white/40 focus:outline-none"
                  />
                  <button onClick={() => handleOffer(rfq.id)} className="glow-button self-start text-sm">
                    Trimite contraofertă
                  </button>
                </div>
              )}

              {rfq.offers.length > 0 && (
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                  {rfq.offers.map((offer) => (
                    <div key={offer.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{offer.vendor.displayName}</span> —{" "}
                        {formatRON(offer.priceRON)} · {offer.message}
                        <span className={`ml-2 text-xs font-medium ${OFFER_STATUS[offer.status]?.cls ?? "text-white/40"}`}>
                          {OFFER_STATUS[offer.status]?.label ?? offer.status}
                        </span>
                      </div>
                      {isB2B && offer.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDecision(rfq.id, offer.id, "ACCEPT")}
                            className="rounded-full bg-cyan/20 px-3 py-1 text-cyan-glow"
                          >
                            Acceptă
                          </button>
                          <button
                            onClick={() => handleDecision(rfq.id, offer.id, "REJECT")}
                            className="rounded-full bg-white/10 px-3 py-1 text-white/60"
                          >
                            Respinge
                          </button>
                        </div>
                      )}
                      {isVendor && offer.status === "PENDING" && (
                        <button
                          onClick={() => handleDecision(rfq.id, offer.id, "WITHDRAW")}
                          className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60 hover:text-red-400"
                        >
                          Retrage oferta
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
