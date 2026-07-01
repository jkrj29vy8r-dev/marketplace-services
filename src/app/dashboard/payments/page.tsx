import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { formatRON } from "@/lib/utils";
import { Receipt, Download } from "lucide-react";

export const metadata = { title: "Istoricul plăților — Zervio" };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "În așteptare",
  PAID: "Plătit",
  AWAITING_PROOF: "Dovadă așteptată",
  FAILED: "Eșuat",
  REFUNDED: "Rambursat",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-400/10",
  PAID: "text-green-400 bg-green-400/10",
  AWAITING_PROOF: "text-orange-400 bg-orange-400/10",
  FAILED: "text-red-400 bg-red-400/10",
  REFUNDED: "text-blue-400 bg-blue-400/10",
};

export default async function PaymentsPage() {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/auth/sign-in");

  const transactions = await db.transaction.findMany({
    where: {
      booking: { customerId: session.user.id },
    },
    include: {
      booking: {
        include: {
          service: { select: { title: true } },
          customer: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalPaid = transactions
    .filter((tx) => tx.status === "PAID")
    .reduce((sum, tx) => sum + tx.amountRON, 0);

  return (
    <main className="min-h-screen pb-24">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Istoricul plăților</h1>
            <p className="mt-1 text-sm text-white/40">Total plătit: {formatRON(totalPaid)}</p>
          </div>
          <Receipt className="h-8 w-8 text-white/20" />
        </div>

        {transactions.length === 0 ? (
          <div className="glass-panel mt-8 flex flex-col items-center gap-4 py-20 text-center">
            <Receipt className="h-12 w-12 text-white/20" />
            <p className="text-white/40">Nu ai nicio plată înregistrată.</p>
            <Link href="/services" className="glow-button text-sm">Explorează servicii</Link>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="glass-panel flex items-center justify-between gap-4 p-4">
                <div className="flex-1">
                  <p className="font-medium">{tx.booking?.service.title ?? "—"}</p>
                  <p className="mt-0.5 text-xs text-white/40">
                    {new Date(tx.createdAt).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
                    {" · "}
                    {tx.method === "CARD" ? "Card" : "Transfer bancar"}
                  </p>
                </div>

                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[tx.status] ?? "text-white/50"}`}>
                  {STATUS_LABEL[tx.status] ?? tx.status}
                </span>

                <p className="shrink-0 font-bold text-white">{formatRON(tx.amountRON)}</p>

                {tx.status === "PAID" && tx.bookingId && (
                  <Link
                    href={`/booking/${tx.bookingId}/invoice`}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:border-cyan-500/50 hover:text-white transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Factură
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
