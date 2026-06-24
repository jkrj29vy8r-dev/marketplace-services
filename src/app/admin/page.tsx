import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { VerifyVendorButton } from "./verify-vendor-button";

export default async function AdminPage() {
  const session = await getCurrentSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [vendors, transactions] = await Promise.all([
    db.vendorProfile.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    db.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { booking: { include: { service: true } } },
    }),
  ]);

  const totalRevenue = transactions
    .filter((tx) => tx.status === "PAID")
    .reduce((sum, tx) => sum + tx.amountRON, 0);

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-2xl font-bold">Panou Admin</h1>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="glass-panel p-5">
            <p className="text-sm text-white/50">Prestatori activi</p>
            <p className="mt-1 text-2xl font-bold">{vendors.length}</p>
          </div>
          <div className="glass-panel p-5">
            <p className="text-sm text-white/50">Tranzacții recente</p>
            <p className="mt-1 text-2xl font-bold">{transactions.length}</p>
          </div>
          <div className="glass-panel p-5">
            <p className="text-sm text-white/50">Venit total încasat</p>
            <p className="mt-1 text-2xl font-bold">{totalRevenue.toFixed(2)} RON</p>
          </div>
        </div>

        <h2 className="mt-10 text-lg font-semibold text-white/80">Prestatori</h2>
        <div className="mt-4 flex flex-col gap-3">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="glass-panel flex items-center justify-between p-4">
              <span>{vendor.displayName}</span>
              {vendor.verifiedBadge ? (
                <span className="text-sm text-cyan-glow">Verificat</span>
              ) : (
                <VerifyVendorButton vendorId={vendor.id} />
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
