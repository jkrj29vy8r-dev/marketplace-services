"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRON } from "@/lib/utils";

const PLAN_LABELS: Record<string, string> = {
  TOP_SEARCH_7D: "Top căutări · 7 zile",
  TOP_SEARCH_30D: "Top căutări · 30 zile",
  FEATURED_HOME_7D: "Recomandat homepage · 7 zile",
  FEATURED_HOME_30D: "Recomandat homepage · 30 zile",
};

export function PromoteButton({ plan, price }: { plan: string; price: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePromote() {
    setLoading(true);
    await fetch("/api/vendors/me/promote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handlePromote}
      disabled={loading}
      className="rounded-full border border-border px-4 py-2 text-sm transition hover:border-cyan/40 hover:text-cyan-glow disabled:opacity-50"
    >
      {PLAN_LABELS[plan]} — {formatRON(price)}
    </button>
  );
}
