import { notFound } from "next/navigation";
import Image from "next/image";
import { BadgeCheck, Star } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ServiceCard } from "@/components/service-card";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function VendorProfilePage({ params }: { params: { id: string } }) {
  const vendor = await db.vendorProfile.findUnique({
    where: { id: params.id },
    include: {
      services: {
        where: { active: true },
        include: { category: true, vendor: true },
      },
      reviews: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!vendor) {
    notFound();
  }

  const session = await getCurrentSession();
  const showNetPrice = session?.user.role === "CUSTOMER_B2B";

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="glass-panel flex flex-col gap-6 p-8 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface">
            {vendor.galleryUrls[0] ? (
              <Image
                src={vendor.galleryUrls[0]}
                alt={vendor.displayName}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white/30">
                {vendor.displayName.charAt(0)}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{vendor.displayName}</h1>
              {vendor.verifiedBadge && <BadgeCheck className="h-5 w-5 text-cyan-glow" />}
            </div>
            {vendor.bio && <p className="mt-2 max-w-2xl text-white/60">{vendor.bio}</p>}
            <div className="mt-3 flex items-center gap-1 text-sm text-white/70">
              <Star className="h-4 w-4 fill-cyan-glow text-cyan-glow" />
              <span className="font-medium">{vendor.ratingAvg.toFixed(1)}</span>
              <span className="text-white/40">({vendor.ratingCount} recenzii)</span>
            </div>
          </div>
        </div>

        {vendor.galleryUrls.length > 1 && (
          <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {vendor.galleryUrls.slice(1).map((url) => (
              <div key={url} className="relative aspect-square overflow-hidden rounded-xl bg-surface">
                <Image src={url} alt={vendor.displayName} fill className="object-cover" />
              </div>
            ))}
          </div>
        )}

        <h2 className="mt-10 text-lg font-semibold text-white/80">Servicii oferite</h2>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vendor.services.map((service) => (
            <ServiceCard
              key={service.id}
              service={{
                ...service,
                vendor: {
                  displayName: vendor.displayName,
                  verifiedBadge: vendor.verifiedBadge,
                  ratingAvg: vendor.ratingAvg,
                  ratingCount: vendor.ratingCount,
                  promotedUntil: vendor.promotedUntil?.toISOString() ?? null,
                },
              }}
              showNetPrice={showNetPrice}
            />
          ))}
        </div>

        {vendor.reviews.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-white/80">Recenzii</h2>
            <div className="flex flex-col gap-3">
              {vendor.reviews.map((review) => (
                <div key={review.id} className="glass-panel p-4">
                  <div className="flex items-center gap-1 text-sm text-cyan-glow">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star key={index} className="h-3.5 w-3.5 fill-cyan-glow" />
                    ))}
                  </div>
                  {review.comment && <p className="mt-2 text-sm text-white/70">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
