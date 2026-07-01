import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Star, MessageSquare, FileText } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ServiceCard } from "@/components/service-card";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const vendor = await db.vendorProfile.findUnique({ where: { id: params.id }, select: { displayName: true } });
  return { title: vendor ? `${vendor.displayName} — Zervio` : "Prestator — Zervio" };
}

export default async function VendorProfilePage({ params }: { params: { id: string } }) {
  const vendor = await db.vendorProfile.findUnique({
    where: { id: params.id },
    include: {
      services: {
        where: { active: true },
        include: { category: true, vendor: true },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { booking: { include: { customer: { select: { name: true } } } } },
      },
    },
  });

  if (!vendor) {
    notFound();
  }

  const session = await getCurrentSession();
  const showNetPrice = session?.user.role === "CUSTOMER_B2B";
  const isB2B = session?.user.role === "CUSTOMER_B2B";
  const isLoggedIn = !!session?.user;

  // Rating breakdown by star
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: vendor.reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <main className="min-h-screen pb-24">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero panel */}
        <div className="glass-panel flex flex-col gap-6 p-8 sm:flex-row sm:items-start">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface">
            {vendor.galleryUrls[0] ? (
              <Image
                src={vendor.galleryUrls[0]}
                alt={vendor.displayName}
                width={112}
                height={112}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold bg-gradient-to-br from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                {vendor.displayName.charAt(0)}
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{vendor.displayName}</h1>
              {vendor.verifiedBadge && (
                <span className="flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-400">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verificat
                </span>
              )}
            </div>

            {vendor.bio && <p className="mt-2 max-w-2xl text-sm text-white/60">{vendor.bio}</p>}

            {/* Rating summary */}
            <div className="mt-3 flex items-center gap-2 text-sm">
              {vendor.ratingCount > 0 ? (
                <>
                  <div className="flex items-center gap-1 text-cyan-400">
                    <Star className="h-4 w-4 fill-cyan-400" />
                    <span className="font-bold">{vendor.ratingAvg.toFixed(1)}</span>
                  </div>
                  <span className="text-white/40">·</span>
                  <span className="text-white/50">{vendor.ratingCount} recenzii</span>
                </>
              ) : (
                <span className="text-white/40">Nou pe platformă</span>
              )}
            </div>

            {/* Action buttons */}
            {isLoggedIn && (
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/messages?vendorId=${vendor.id}`}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:border-cyan-500/50 hover:bg-white/10 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  Trimite mesaj
                </Link>
                {isB2B && (
                  <Link
                    href={`/rfq/new?vendorId=${vendor.id}`}
                    className="glow-button flex items-center gap-2 text-sm"
                  >
                    <FileText className="h-4 w-4" />
                    Solicită ofertă (RFQ)
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Rating breakdown */}
          {vendor.ratingCount > 0 && (
            <div className="shrink-0 space-y-1.5 rounded-xl border border-white/10 bg-white/5 p-4">
              {ratingBreakdown.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-6 text-right text-white/50">{star}★</span>
                  <div className="h-1.5 w-28 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{ width: `${vendor.ratingCount > 0 ? (count / vendor.ratingCount) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-4 text-white/40">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gallery */}
        {vendor.galleryUrls.length > 1 && (
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/40">Galerie</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {vendor.galleryUrls.slice(1).map((url) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden rounded-xl bg-surface">
                  <Image src={url} alt={vendor.displayName} fill className="object-cover transition-transform group-hover:scale-105" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {vendor.services.length > 0 && (
          <>
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
          </>
        )}

        {/* Reviews */}
        {vendor.reviews.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-white/80">Recenzii</h2>
            <div className="flex flex-col gap-3">
              {vendor.reviews.map((review) => (
                <div key={review.id} className="glass-panel p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white/80">{review.booking.customer.name ?? "Client anonim"}</p>
                      <div className="mt-1 flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-cyan-400 text-cyan-400" : "text-white/20"}`} />
                        ))}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-white/30">
                      {new Date(review.createdAt).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
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
