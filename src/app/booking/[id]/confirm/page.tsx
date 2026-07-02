import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock, CreditCard, Banknote, CalendarDays } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { formatRON } from "@/lib/utils";
import { RetryPaymentButton } from "./retry-payment-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rezervare confirmată — Zervio" };

export default async function BookingConfirmPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { paid?: string; cancelled?: string };
}) {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/auth/sign-in");

  const booking = await db.booking.findUnique({
    where: { id: params.id },
    include: {
      service: { include: { vendor: { select: { displayName: true } } } },
      transaction: true,
    },
  });

  if (!booking || booking.customerId !== session.user.id) notFound();

  const isBankTransfer = booking.paymentType === "BANK_TRANSFER";
  const justPaid = searchParams.paid === "1";
  const paymentCancelled = searchParams.cancelled === "1" && booking.transaction?.status !== "PAID";

  return (
    <main className="min-h-screen pb-24">
      <Navbar />
      <section className="mx-auto max-w-lg px-6 py-16 text-center">
        <div className="flex justify-center">
          <CheckCircle className="h-20 w-20 text-cyan-400" strokeWidth={1.5} />
        </div>

        <h1 className="mt-6 text-2xl font-bold">
          {justPaid
            ? "Plată efectuată cu succes!"
            : isBankTransfer
              ? "Rezervare înregistrată!"
              : "Rezervare confirmată!"}
        </h1>
        <p className="mt-2 text-white/50">
          {justPaid
            ? "Plata cu cardul a fost procesată. Rezervarea ta e confirmată — vei primi un email cu detaliile."
            : isBankTransfer
              ? "Rezervarea ta a fost înregistrată. Trimite dovada plății pentru confirmare finală."
              : "Rezervarea ta a fost confirmată. Vei primi un email cu detaliile."}
        </p>

        {paymentCancelled && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-left">
            <p className="text-sm font-medium text-red-300">Plata a fost anulată.</p>
            <p className="mt-1 text-sm text-red-300/80">
              Rezervarea rămâne în așteptare. Poți relua plata din dashboard sau contacta prestatorul.
            </p>
            <RetryPaymentButton bookingId={booking.id} />
          </div>
        )}

        <div className="glass-panel mt-8 p-6 text-left">
          <h2 className="font-semibold text-white/80">Detalii rezervare</h2>
          <div className="mt-4 flex flex-col gap-3">
            <Row label="Serviciu" value={booking.service.title} />
            <Row label="Prestator" value={booking.service.vendor.displayName} />
            <Row
              label="Data și ora"
              value={booking.slotStart.toLocaleString("ro-RO", {
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
              icon={<CalendarDays className="h-4 w-4" />}
            />
            <Row label="Total" value={formatRON(booking.totalPriceRON)} className="text-cyan-400 font-semibold" />
            <Row
              label="Plată"
              value={isBankTransfer ? "Transfer bancar" : "Card"}
              icon={isBankTransfer ? <Banknote className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
            />
            <Row
              label="Status"
              value={booking.status}
              className={
                booking.status === "CONFIRMED"
                  ? "text-green-400"
                  : booking.status === "PENDING"
                    ? "text-yellow-300"
                    : "text-white/60"
              }
            />
          </div>

          {isBankTransfer && (
            <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
                <div className="text-sm text-yellow-300">
                  <p className="font-medium">Pasul următor:</p>
                  <p className="mt-1 text-yellow-300/80">
                    Efectuează transferul la IBAN: <strong>RO49 AAAA 1B31 0075 9384 0000</strong> (Zervio SRL) și
                    încarcă dovada plății din dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard" className="glow-button flex-1 text-center">
            Vezi rezervarea în dashboard
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-xl border border-white/10 py-3 text-sm text-white/60 hover:border-white/30 hover:text-white"
          >
            Înapoi acasă
          </Link>
        </div>
      </section>
    </main>
  );
}

function Row({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-white/40">{label}</span>
      <span className={`flex items-center gap-1.5 text-right font-medium ${className ?? "text-white"}`}>
        {icon}
        {value}
      </span>
    </div>
  );
}
