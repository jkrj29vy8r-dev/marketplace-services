"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VerifyVendorButton({ vendorId }: { vendorId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    setLoading(true);
    await fetch(`/api/admin/vendors/${vendorId}/verify`, { method: "PATCH" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleVerify}
      disabled={loading}
      className="rounded-full border border-border px-3 py-1.5 text-sm transition hover:border-cyan/40 hover:text-cyan-glow disabled:opacity-50"
    >
      {loading ? "Se verifică..." : "Aprobă verificare"}
    </button>
  );
}
