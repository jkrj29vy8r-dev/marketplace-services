import { Navbar } from "@/components/navbar";
import { VendorCard } from "@/components/vendor-card";
import { db } from "@/lib/db";
import { Store } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Prestatori — Zervio" };

export default async function VendorsPage() {
  const now = new Date();
  const vendors = await db.vendorProfile.findMany({
    where: { services: { some: { active: true } } },
    orderBy: [{ verifiedBadge: "desc" }, { ratingAvg: "desc" }, { createdAt: "desc" }],
    take: 60,
  });

  return (
    <main className="min-h-screen pb-24">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-2xl font-bold">Prestatori pe Zervio</h1>
        <p className="mt-1 text-sm text-white/40">{vendors.length} prestatori activi</p>

        {vendors.length === 0 ? (
          <div className="glass-panel mt-10 flex flex-col items-center gap-4 py-20 text-center">
            <Store className="h-12 w-12 text-white/20" />
            <p className="text-white/40">Niciun prestator activ momentan.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={{
                  id: vendor.id,
                  displayName: vendor.displayName,
                  bio: vendor.bio,
                  galleryUrls: vendor.galleryUrls,
                  verifiedBadge: vendor.verifiedBadge,
                  ratingAvg: vendor.ratingAvg,
                  ratingCount: vendor.ratingCount,
                  isPromoted: !!vendor.promotedUntil && vendor.promotedUntil > now,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
