"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function VerifyVendorButton({ vendorId }: { vendorId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    setLoading(true);
    const res = await fetch(`/api/admin/vendors/${vendorId}/verify`, { method: "PATCH" });
    setLoading(false);
    if (res.ok) {
      toast.success("Prestator verificat cu succes");
      router.refresh();
    } else {
      toast.error("Eroare la verificare");
    }
  }

  return (
    <button
      onClick={handleVerify}
      disabled={loading}
      className="rounded-lg border border-cyan-500/30 px-3 py-1.5 text-xs text-cyan-400 transition hover:border-cyan-400 disabled:opacity-50"
    >
      {loading ? "..." : "Verifică"}
    </button>
  );
}
