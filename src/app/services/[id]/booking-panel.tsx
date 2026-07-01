"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { formatRON } from "@/lib/utils";
import { Clock } from "lucide-react";

type Slot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
};

function groupByDate(slots: Slot[]) {
  return slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const key = slot.date.slice(0, 10);
    (acc[key] ??= []).push(slot);
    return acc;
  }, {});
}

export function BookingPanel({
  serviceId,
  grossPrice,
  durationMins,
}: {
  serviceId: string;
  grossPrice: number;
  durationMins?: number | null;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<"CARD" | "BANK_TRANSFER">("CARD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/services/${serviceId}/availability`)
      .then((res) => res.json())
      .then((data) => {
        const s = data.slots ?? [];
        setSlots(s);
        if (s.length > 0) setSelectedDate(s[0].date.slice(0, 10));
      });
  }, [serviceId]);

  const grouped = groupByDate(slots);
  const dates = Object.keys(grouped).sort();
  const slotsForDay = selectedDate ? (grouped[selectedDate] ?? []) : [];

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
      const body = await response.json() as { error?: string };
      const msg = typeof body.error === "string" ? body.error : "Slot indisponibil";
      setError(msg);
      toast.error(msg);
      fetch(`/api/services/${serviceId}/availability`)
        .then((r) => r.json())
        .then((d) => setSlots(d.slots ?? []));
      return;
    }

    const { booking } = await response.json() as { booking: { id: string } };
    toast.success("Rezervare creată cu succes!");
    router.push(`/booking/${booking.id}/confirm`);
  }

  return (
    <div className="glass-panel p-6">
      <p className="text-2xl font-bold">{formatRON(grossPrice)}</p>
      {durationMins && (
        <div className="mt-1 flex items-center gap-1.5 text-sm text-white/40">
          <Clock className="h-3.5 w-3.5" />
          ~{durationMins} minute
        </div>
      )}

      {slots.length === 0 ? (
        <div className="mt-5 rounded-xl border border-white/10 p-4 text-center text-sm text-white/40">
          Niciun interval disponibil momentan.
        </div>
      ) : (
        <>
          <h3 className="mt-5 text-sm font-medium text-white/70">Alege data</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => { setSelectedDate(date); setSelectedSlotId(null); }}
                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                  selectedDate === date
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                    : "border-white/10 text-white/60 hover:border-white/30"
                }`}
              >
                {new Date(date + "T00:00:00").toLocaleDateString("ro-RO", { weekday: "short", month: "short", day: "numeric" })}
              </button>
            ))}
          </div>

          {selectedDate && (
            <>
              <h3 className="mt-4 text-sm font-medium text-white/70">Alege ora</h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {slotsForDay.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`rounded-xl border px-3 py-2.5 text-sm transition ${
                      selectedSlotId === slot.id
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                        : "border-white/10 text-white/60 hover:border-white/30"
                    }`}
                  >
                    {slot.startTime} – {slot.endTime}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <h3 className="mt-5 text-sm font-medium text-white/70">Metodă plată</h3>
      <div className="mt-2 flex gap-2 rounded-full border border-border bg-white/5 p-1">
        {(["CARD", "BANK_TRANSFER"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setPaymentType(type)}
            className={`flex-1 rounded-full px-3 py-2 text-sm transition ${
              paymentType === type ? "bg-gradient-to-r from-indigo to-cyan text-background" : "text-white/60"
            }`}
          >
            {type === "CARD" ? "Card" : "Transfer bancar"}
          </button>
        ))}
      </div>

      {paymentType === "BANK_TRANSFER" && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/50">
          <p className="font-medium text-white/70">Date transfer:</p>
          <p>IBAN: RO49 AAAA 1B31 0075 9384 0000</p>
          <p>Beneficiar: Zervio SRL</p>
          <p>Referință: rezervarea ta</p>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {selectedSlotId && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
          <p className="text-white/50">Rezumat:</p>
          <p className="mt-1 font-medium">{formatRON(grossPrice)}</p>
          <p className="text-white/40">
            {new Date(selectedDate! + "T00:00:00").toLocaleDateString("ro-RO")} ·{" "}
            {slotsForDay.find((s) => s.id === selectedSlotId)?.startTime}
          </p>
        </div>
      )}

      <button
        onClick={handleBook}
        disabled={loading || slots.length === 0}
        className="glow-button mt-4 w-full disabled:opacity-50"
      >
        {loading ? "Se procesează..." : session ? "Rezervă acum" : "Autentifică-te pentru a rezerva"}
      </button>
    </div>
  );
}
