"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function BookingActionButton({
  bookingId,
  action,
}: {
  bookingId: string;
  action: "CONFIRMED" | "CANCELLED";
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    const res = await fetch(`/api/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action }),
    });

    setLoading(false);
    if (res.ok) {
      toast.success(action === "CONFIRMED" ? "Rezervare confirmată" : "Rezervare anulată");
      router.refresh();
    } else {
      const json = await res.json() as { error?: string };
      toast.error(json.error ?? "Eroare");
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
        action === "CONFIRMED"
          ? "bg-cyan-500 text-black hover:bg-cyan-400"
          : "border border-white/10 text-white/60 hover:border-white/30 hover:text-white"
      }`}
    >
      {loading ? "..." : action === "CONFIRMED" ? "Confirmă" : "Anulează"}
    </button>
  );
}
