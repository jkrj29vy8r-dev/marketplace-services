"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CancelBookingButton({ bookingId, slotStart }: { bookingId: string; slotStart: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const hoursUntil = (new Date(slotStart).getTime() - Date.now()) / 3_600_000;
  const isFree = hoursUntil >= 24;

  async function confirm() {
    setLoading(true);
    const res = await fetch(`/api/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    setLoading(false);
    setOpen(false);
    if (res.ok) {
      toast.success("Rezervare anulată");
      router.refresh();
    } else {
      toast.error("Eroare la anulare");
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:border-red-500/30 hover:text-red-400"
      >
        Anulează
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-background p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Anulezi rezervarea?</h3>
            <p className="mt-2 text-sm text-white/50">
              {isFree
                ? "Poți anula gratuit deoarece rezervarea este cu mai mult de 24h înainte."
                : "Atenție: rezervarea este în mai puțin de 24h. Anularea poate fi tarifată."}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-white/60 hover:border-white/30"
              >
                Renunță
              </button>
              <button
                onClick={confirm}
                disabled={loading}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-50"
              >
                {loading ? "..." : "Anulează rezervarea"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
