"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";

export function RetryPaymentButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);

  async function retry() {
    setLoading(true);
    const res = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
    setLoading(false);
    if (res.ok) {
      const { url } = await res.json() as { url: string };
      window.location.href = url;
    } else {
      const json = await res.json() as { error?: string };
      toast.error(json.error ?? "Eroare la inițierea plății");
    }
  }

  return (
    <button
      onClick={retry}
      disabled={loading}
      className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-500/30 disabled:opacity-50"
    >
      <CreditCard className="h-4 w-4" />
      {loading ? "Se redirecționează..." : "Reia plata cu cardul"}
    </button>
  );
}
