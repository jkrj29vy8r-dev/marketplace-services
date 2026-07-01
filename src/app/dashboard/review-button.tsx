"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

export function ReviewButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Selectează o notă"); return; }
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/bookings/${bookingId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment: comment || undefined }),
    });

    setLoading(false);
    if (!res.ok) {
      const json = await res.json() as { error?: string };
      setError(json.error ?? "Eroare");
      return;
    }

    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-cyan-glow hover:underline"
      >
        Lasă o recenzie →
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
          >
            <Star
              className={`h-6 w-6 transition ${
                star <= (hovered || rating) ? "fill-cyan-glow text-cyan-glow" : "text-white/20"
              }`}
            />
          </button>
        ))}
      </div>
      <textarea
        placeholder="Comentariu opțional..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        maxLength={2000}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-cyan-500"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-cyan-500 px-4 py-1.5 text-sm font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
        >
          {loading ? "Se trimite..." : "Trimite recenzia"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-white/40 hover:text-white"
        >
          Anulează
        </button>
      </div>
    </form>
  );
}
