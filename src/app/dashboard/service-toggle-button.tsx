"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ServiceToggleButton({ serviceId, active }: { serviceId: string; active: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/services/${serviceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success(active ? "Serviciu dezactivat" : "Serviciu activat");
      router.refresh();
    } else {
      toast.error("Eroare la actualizare");
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
        active
          ? "border border-white/10 text-white/60 hover:border-red-500/30 hover:text-red-400"
          : "border border-cyan-500/30 text-cyan-400 hover:border-cyan-400"
      }`}
    >
      {loading ? "..." : active ? "Dezactivează" : "Activează"}
    </button>
  );
}
