"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ApproveTransactionButton({ transactionId }: { transactionId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handle() {
    setLoading(true);
    const res = await fetch(`/api/admin/transactions/${transactionId}/approve`, { method: "POST" });
    setLoading(false);
    if (res.ok) {
      toast.success("Tranzacție aprobată — rezervare confirmată");
      router.refresh();
    } else {
      toast.error("Eroare la aprobare");
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-green-400 disabled:opacity-50"
    >
      {loading ? "..." : "Aprobă"}
    </button>
  );
}
