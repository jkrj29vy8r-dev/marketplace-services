"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatRON } from "@/lib/utils";

type Slot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
};

export function BookingPanel({
  serviceId,
  grossPrice,
}: {
  serviceId: string;
  grossPrice: number;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<"CARD" | "BANK_TRANSFER">("CARD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/services/${serviceId}/availability`)
      .then((res) => res.json())
      .then((data) => setSlots(data.slots ?? []));
  }, [serviceId]);

  async function handleBook() {
    if (!session) {
      router.push("/auth/sign-in");
      return;
    }
    if (!selectedSlotId) {
      setError("Selectează un interval orar");
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId, availabilityId: selectedSlotId, paymentType }),
    });

    setLoading(false);

    if (!response.ok) {
      const body = await response.json();
      setError(typeof body.error === "string" ? body.error : "Slot indisponibil, alege altul");
      fetch(`/api/services/${serviceId}/availability`)
        .then((res) => res.json())
        .then((data) => setSlots(data.slots ?? []));
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="glass-panel p-6">
      <p className="text-2xl font-bold">{formatRON(grossPrice)}</p>

      <h3 className="mt-5 text-sm font-medium text-white/70">Alege un interval disponibil</h3>

      {slots.length === 0 ? (
        <p className="mt-3 text-sm text-white/40">Niciun interval disponibil momentan.</p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => setSelectedSlotId(slot.id)}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                selectedSlotId === slot.id
                  ? "border-cyan bg-cyan/10 text-cyan-glow"
                  : "border-border text-white/70 hover:border-white/30"
              }`}
            >
              <div>{new Date(slot.date).toLocaleDateString("ro-RO")}</div>
              <div className="text-white/40">
                {slot.startTime} - {slot.endTime}
              </div>
            </button>
          ))}
        </div>
      )}

      <h3 className="mt-5 text-sm font-medium text-white/70">Plată</h3>
      <div className="mt-3 flex gap-2 rounded-full border border-border bg-white/5 p-1">
        <button
          onClick={() => setPaymentType("CARD")}
          className={`flex-1 rounded-full px-3 py-2 text-sm transition ${
            paymentType === "CARD" ? "bg-gradient-to-r from-indigo to-cyan text-background" : "text-white/60"
          }`}
        >
          Card
        </button>
        <button
          onClick={() => setPaymentType("BANK_TRANSFER")}
          className={`flex-1 rounded-full px-3 py-2 text-sm transition ${
            paymentType === "BANK_TRANSFER" ? "bg-gradient-to-r from-indigo to-cyan text-background" : "text-white/60"
          }`}
        >
          Ordin de Plată
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <button onClick={handleBook} disabled={loading} className="glow-button mt-5 w-full disabled:opacity-50">
        {loading ? "Se procesează..." : "Rezervă acum"}
      </button>
    </div>
  );
}
