import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { formatRON } from "@/lib/utils";
import { VerifyVendorButton } from "./verify-vendor-button";
import { ApproveTransactionButton } from "./approve-transaction-button";
import { Users, Store, CalendarDays, TrendingUp } from "lucide-react";

export const metadata = { title: "Admin — Zervio" };

export default async function AdminPage() {
  const session = await getCurrentSession();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const [userCount, vendors, bookings, transactions] = await Promise.all([
    db.user.count(),
    db.vendorProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { email: true } } },
    }),
    db.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        service: { select: { title: true } },
        customer: { select: { name: true, email: true } },
      },
    }),
    db.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { booking: { include: { service: { select: { title: true } }, customer: { select: { name: true } } } } },
    }),
  ]);

  const totalRevenue = transactions
    .filter((tx) => tx.status === "PAID")
    .reduce((sum, tx) => sum + tx.amountRON, 0);

  const awaitingProof = transactions.filter((tx) => tx.status === "AWAITING_PROOF");

  return (
    <main className="min-h-screen pb-24">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Panou Admin</h1>
          <Link href="/admin/users" className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/60 hover:border-white/30 hover:text-white transition-colors">
            Toți utilizatorii →
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 text-white/40">
              <Users className="h-4 w-4" />
              <span className="text-xs">Utilizatori</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{userCount}</p>
          </div>
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 text-white/40">
              <Store className="h-4 w-4" />
              <span className="text-xs">Prestatori</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{vendors.length}</p>
          </div>
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 text-white/40">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs">Rezervări</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{bookings.length}</p>
          </div>
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 text-white/40">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Venit total</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{formatRON(totalRevenue)}</p>
          </div>
        </div>

        {/* Awaiting proof alert */}
        {awaitingProof.length > 0 && (
          <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
            <p className="text-sm font-medium text-yellow-300">
              ⚠️ {awaitingProof.length} transfer{awaitingProof.length > 1 ? "uri" : ""} bancar{awaitingProof.length > 1 ? "e" : ""} în așteptare aprobare
            </p>
          </div>
        )}

        {/* Vendors */}
        <h2 className="mt-10 text-lg font-semibold text-white/80">Prestatori</h2>
        <div className="mt-4 flex flex-col gap-3">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="glass-panel flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{vendor.displayName}</p>
                <p className="text-xs text-white/40">{vendor.user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40">
                  ★ {vendor.ratingAvg.toFixed(1)} ({vendor.ratingCount})
                </span>
                {vendor.verifiedBadge ? (
                  <span className="text-sm text-cyan-glow">✓ Verificat</span>
                ) : (
                  <VerifyVendorButton vendorId={vendor.id} />
                )}
                <Link
                  href={`/vendors/${vendor.id}`}
                  className="text-xs text-white/40 hover:text-white"
                >
                  Vezi profil →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <h2 className="mt-10 text-lg font-semibold text-white/80">Rezervări recente</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-white/40">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Serviciu</th>
                <th className="px-4 py-3">Slot</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <p>{b.customer.name}</p>
                    <p className="text-xs text-white/40">{b.customer.email}</p>
                  </td>
                  <td className="px-4 py-3">{b.service.title}</td>
                  <td className="px-4 py-3 text-white/60">
                    {b.slotStart.toLocaleString("ro-RO")}
                  </td>
                  <td className="px-4 py-3">{formatRON(b.totalPriceRON)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${
                        b.status === "CONFIRMED"
                          ? "bg-green-500/20 text-green-400"
                          : b.status === "PENDING"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : b.status === "CANCELLED"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-white/10 text-white/50"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Transactions */}
        <h2 className="mt-10 text-lg font-semibold text-white/80">Tranzacții</h2>
        <div className="mt-4 flex flex-col gap-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="glass-panel flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{tx.booking?.service.title ?? "—"}</p>
                <p className="text-xs text-white/40">
                  {tx.booking?.customer.name ?? "—"} · {tx.method} · {new Date(tx.createdAt).toLocaleDateString("ro-RO")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-semibold">{formatRON(tx.amountRON)}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${
                    tx.status === "PAID"
                      ? "bg-green-500/20 text-green-400"
                      : tx.status === "AWAITING_PROOF"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-white/10 text-white/50"
                  }`}
                >
                  {tx.status}
                </span>
                {tx.status === "AWAITING_PROOF" && (
                  <ApproveTransactionButton transactionId={tx.id} />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
