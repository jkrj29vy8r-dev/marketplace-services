import { Navbar } from "@/components/navbar";
import { ServiceCard } from "@/components/service-card";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const session = await getCurrentSession();
  const showNetPrice = session?.user.role === "CUSTOMER_B2B";

  const services = await db.service.findMany({
    where: {
      active: true,
      ...(searchParams.category ? { category: { slug: searchParams.category } } : {}),
      ...(searchParams.q
        ? {
            OR: [
              { title: { contains: searchParams.q, mode: "insensitive" } },
              { description: { contains: searchParams.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      vendor: {
        select: {
          displayName: true,
          verifiedBadge: true,
          ratingAvg: true,
          ratingCount: true,
          promotedUntil: true,
        },
      },
    },
    orderBy: [{ vendor: { promotedUntil: "desc" } }, { createdAt: "desc" }],
    take: 50,
  });

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-2xl font-bold">
          {searchParams.q ? `Rezultate pentru „${searchParams.q}”` : "Toate serviciile"}
        </h1>

        {services.length === 0 ? (
          <p className="mt-8 text-white/50">Niciun serviciu găsit.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={{
                  ...service,
                  vendor: {
                    ...service.vendor,
                    promotedUntil: service.vendor.promotedUntil?.toISOString() ?? null,
                  },
                }}
                showNetPrice={showNetPrice}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
