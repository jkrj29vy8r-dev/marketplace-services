import { Navbar } from "@/components/navbar";
import { ServiceCard } from "@/components/service-card";
import { ServicesFilters } from "./services-filters";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Servicii — Zervio" };

type SearchParams = {
  q?: string;
  category?: string;
  priceMin?: string;
  priceMax?: string;
  ratingMin?: string;
  sort?: string;
  pricingType?: string;
};

export default async function ServicesPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getCurrentSession();
  const showNetPrice = session?.user.role === "CUSTOMER_B2B";

  const priceMin = searchParams.priceMin ? parseFloat(searchParams.priceMin) : undefined;
  const priceMax = searchParams.priceMax ? parseFloat(searchParams.priceMax) : undefined;
  const ratingMin = searchParams.ratingMin ? parseFloat(searchParams.ratingMin) : undefined;

  const orderBy = (() => {
    switch (searchParams.sort) {
      case "price_asc": return [{ priceNetRON: "asc" as const }];
      case "price_desc": return [{ priceNetRON: "desc" as const }];
      case "rating": return [{ vendor: { ratingAvg: "desc" as const } }];
      case "newest": return [{ createdAt: "desc" as const }];
      default: return [{ vendor: { promotedUntil: "desc" as const } }, { createdAt: "desc" as const }];
    }
  })();

  const [services, categories] = await Promise.all([
    db.service.findMany({
      where: {
        active: true,
        ...(searchParams.category ? { category: { slug: searchParams.category } } : {}),
        ...(searchParams.pricingType ? { pricingType: searchParams.pricingType as "FIXED" | "PER_UNIT" } : {}),
        ...(priceMin !== undefined || priceMax !== undefined
          ? { priceNetRON: { ...(priceMin !== undefined ? { gte: priceMin } : {}), ...(priceMax !== undefined ? { lte: priceMax } : {}) } }
          : {}),
        ...(ratingMin !== undefined ? { vendor: { ratingAvg: { gte: ratingMin } } } : {}),
        ...(searchParams.q
          ? { OR: [{ title: { contains: searchParams.q, mode: "insensitive" } }, { description: { contains: searchParams.q, mode: "insensitive" } }] }
          : {}),
      },
      include: {
        category: true,
        vendor: { select: { displayName: true, verifiedBadge: true, ratingAvg: true, ratingCount: true, promotedUntil: true } },
      },
      orderBy,
      take: 50,
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const hasFilters = searchParams.q || searchParams.category || searchParams.priceMin || searchParams.priceMax || searchParams.ratingMin || searchParams.sort;

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-2xl font-bold">
            {searchParams.q ? `Rezultate pentru „${searchParams.q}"` : "Toate serviciile"}
          </h1>
          <p className="text-sm text-white/40">{services.length} servicii găsite</p>
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <aside className="w-full lg:w-64 lg:shrink-0">
            <ServicesFilters categories={categories} currentParams={searchParams} />
          </aside>

          <div className="flex-1">
            {services.length === 0 ? (
              <div className="glass-panel flex flex-col items-center gap-4 py-16 text-center">
                <p className="text-white/50">Niciun serviciu găsit pentru filtrele selectate.</p>
                {hasFilters && (
                  <a href="/services" className="text-sm text-cyan-400 hover:underline">
                    Elimină filtrele →
                  </a>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={{
                      ...service,
                      vendor: { ...service.vendor, promotedUntil: service.vendor.promotedUntil?.toISOString() ?? null },
                    }}
                    showNetPrice={showNetPrice}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
