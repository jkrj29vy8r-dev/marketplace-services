"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { formatRON } from "@/lib/utils";
import { ReviewButton } from "./review-button";
import { CancelBookingButton } from "./cancel-booking-button";

type Booking = {
  id: string;
  status: string;
  slotStart: string;
  totalPriceRON: number;
  paymentType: string;
  service: { title: string; vendor: { displayName: string } };
  review: { rating: number; comment: string | null } | null;
};

const TABS = ["Toate", "Active", "Istorice", "Anulate"] as const;
type Tab = (typeof TABS)[number];

function statusColor(s: string) {
  if (s === "CONFIRMED") return "bg-cyan-500/20 text-cyan-400";
  if (s === "PENDING") return "bg-yellow-500/20 text-yellow-300";
  if (s === "COMPLETED") return "bg-green-500/20 text-green-400";
  if (s === "CANCELLED") return "bg-red-500/20 text-red-400";
  return "bg-white/10 text-white/50";
}

function statusLabel(s: string) {
  if (s === "CONFIRMED") return "Confirmat";
  if (s === "PENDING") return "În așteptare";
  if (s === "COMPLETED") return "Finalizat";
  if (s === "CANCELLED") return "Anulat";
  return s;
}

export function BookingsTabs({ bookings }: { bookings: Booking[] }) {
  const [tab, setTab] = useState<Tab>("Toate");

  const filtered = bookings.filter((b) => {
    if (tab === "Active") return ["PENDING", "CONFIRMED"].includes(b.status);
    if (tab === "Istorice") return b.status === "COMPLETED";
    if (tab === "Anulate") return b.status === "CANCELLED";
    return true;
  });

  return (
    <div>
      <div className="mt-6 flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
        {TABS.map((t) => {
          const count = bookings.filter((b) => {
            if (t === "Active") return ["PENDING", "CONFIRMED"].includes(b.status);
            if (t === "Istorice") return b.status === "COMPLETED";
            if (t === "Anulate") return b.status === "CANCELLED";
            return true;
          }).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                tab === t ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              {t}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-xs ${tab === t ? "bg-cyan-500 text-black" : "bg-white/10"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="glass-panel flex flex-col items-center gap-4 py-14 text-center">
            <CalendarDays className="h-12 w-12 text-white/20" />
            <div>
              <p className="font-medium text-white/60">Nicio rezervare</p>
              <p className="mt-1 text-sm text-white/30">
                {tab === "Active" ? "Nu ai rezervări active momentan." : "Nu ai rezervări în această categorie."}
              </p>
            </div>
            {tab === "Toate" && (
              <Link href="/services" className="glow-button text-sm">
                Explorează servicii
              </Link>
            )}
          </div>
        ) : (
          filtered.map((booking) => (
            <div key={booking.id} className="glass-panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{booking.service.title}</p>
                  <p className="text-sm text-white/50">{booking.service.vendor.displayName}</p>
                  <p className="mt-1 text-sm text-white/40">
                    {new Date(booking.slotStart).toLocaleString("ro-RO", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <p className="font-semibold">{formatRON(booking.totalPriceRON)}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(booking.status)}`}>
                    {statusLabel(booking.status)}
                  </span>
                  {["PENDING", "CONFIRMED"].includes(booking.status) && (
                    <CancelBookingButton bookingId={booking.id} slotStart={booking.slotStart} />
                  )}
                </div>
              </div>

              {booking.status === "COMPLETED" && !booking.review && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <ReviewButton bookingId={booking.id} />
                </div>
              )}
              {booking.review && (
                <div className="mt-4 border-t border-white/10 pt-4 text-sm text-white/40">
                  Recenzia ta: {"★".repeat(booking.review.rating)}{" "}
                  {booking.review.comment ? `— ${booking.review.comment}` : ""}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
