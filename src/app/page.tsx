import { Navbar } from "@/components/navbar";
import { SearchBar } from "@/components/landing/search-bar";
import { CategoryGrid } from "@/components/landing/category-grid";
import { VendorCard, type VendorCardData } from "@/components/vendor-card";
import { BRAND_NAME } from "@/lib/constants/brand";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getPromotedVendors(): Promise<VendorCardData[]> {
  const now = new Date();

  const vendors = await db.vendorProfile.findMany({
    where: { promotedUntil: { gt: now } },
    orderBy: { ratingAvg: "desc" },
    take: 8,
  });

  return vendors.map((vendor) => ({
    id: vendor.id,
    displayName: vendor.displayName,
    bio: vendor.bio,
    galleryUrls: vendor.galleryUrls,
    verifiedBadge: vendor.verifiedBadge,
    ratingAvg: vendor.ratingAvg,
    ratingCount: vendor.ratingCount,
    isPromoted: true,
  }));
}

export default async function HomePage() {
  const promotedVendors = await getPromotedVendors();

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-24 pb-16 text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60">
          Servicii · Logistică · Evenimente, oriunde în România
        </span>

        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Găsește prestatorul potrivit
          <br />
          <span className="bg-gradient-to-r from-indigo-glow to-cyan-glow bg-clip-text text-transparent">
            în câteva secunde
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-white/50">
          {BRAND_NAME} conectează clienți persoane fizice și companii cu prestatori
          verificați — de la DJ și dansatori, la curățenie, transport și mentenanță.
        </p>

        <div className="mt-10 w-full">
          <SearchBar />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-6 text-lg font-semibold text-white/80">Categorii populare</h2>
        <CategoryGrid />
      </section>

      {promotedVendors.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <h2 className="mb-6 text-lg font-semibold text-white/80">Recomandate</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {promotedVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
