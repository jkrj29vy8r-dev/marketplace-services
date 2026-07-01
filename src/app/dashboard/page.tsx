import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { formatRON } from "@/lib/utils";
import { PROMOTION_PLAN_PRICES_RON } from "@/lib/constants/brand";
import { PromoteButton } from "./promote-button";
import { GalleryUploader } from "./gallery-uploader";
import { ReviewButton } from "./review-button";
import { BookingActionButton } from "./booking-action-button";
import { ServiceToggleButton } from "./service-toggle-button";
import { Star, CalendarCheck, TrendingUp, Package } from "lucide-react";

export const metadata = { title: "Dashboard — Zervio" };

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/auth/sign-in");
  if (session.user.role === "ADMIN") redirect("/admin");

  /* ── VENDOR ── */
  if (session.user.role === "VENDOR") {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        services: { orderBy: { createdAt: "desc" } },
        availabilities: {
          where: { isBooked: true },
          include: {
            booking: {
              include: {
                customer: { select: { name: true, email: true } },
                service: true,
                transaction: true,
              },
            },
          },
          orderBy: { date: "desc" },
          take: 30,
        },
      },
    });

    if (!vendorProfile) {
      return (
        <main className="min-h-screen pb-24">
          <Navbar />
          <section className="mx-auto max-w-5xl px-6 py-12">
            <p className="text-white/60">Completează-ți profilul de prestator pentru a începe.</p>
          </section>
        </main>
      );
    }

    const bookings = vendorProfile.availabilities.map((s) => s.booking).filter(Boolean);

    const revenueThisMonth = bookings
      .filter((b) => b && b.status !== "CANCELLED" && new Date(b.createdAt) >= startOfMonth)
      .reduce((sum, b) => sum + (b?.totalPriceRON ?? 0), 0);

    const activeToday = bookings.filter(
      (b) => b && b.status === "CONFIRMED" && new Date(b.slotStart) >= startOfToday,
    ).length;

    const pendingBookings = bookings.filter((b) => b?.status === "PENDING");

    return (
      <main className="min-h-screen pb-24">
        <Navbar />
        <section className="mx-auto max-w-5xl px-6 py-12">
          <h1 className="text-2xl font-bold">Panou Prestator</h1>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 text-white/40">
                <CalendarCheck className="h-4 w-4" />
                <span className="text-xs">Azi active</span>
              </div>
              <p className="mt-1 text-2xl font-bold">{activeToday}</p>
            </div>
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 text-white/40">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Venit luna</span>
              </div>
              <p className="mt-1 text-2xl font-bold">{formatRON(revenueThisMonth)}</p>
            </div>
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 text-white/40">
                <Star className="h-4 w-4" />
                <span className="text-xs">Rating</span>
              </div>
              <p className="mt-1 text-2xl font-bold">
                {vendorProfile.ratingCount > 0 ? vendorProfile.ratingAvg.toFixed(1) : "—"}
              </p>
            </div>
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 text-white/40">
                <Package className="h-4 w-4" />
                <span className="text-xs">Servicii</span>
              </div>
              <p className="mt-1 text-2xl font-bold">{vendorProfile.services.length}</p>
            </div>
          </div>

          {/* Promotion */}
          <div className="glass-panel mt-6 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{vendorProfile.displayName}</h2>
              <p className="text-sm text-white/50">
                {vendorProfile.promotedUntil && new Date(vendorProfile.promotedUntil) > new Date()
                  ? `Promovat până la ${new Date(vendorProfile.promotedUntil).toLocaleDateString("ro-RO")}`
                  : "Fără promovare activă"}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(PROMOTION_PLAN_PRICES_RON).map(([plan, price]) => (
                <PromoteButton key={plan} plan={plan} price={price} />
              ))}
            </div>
          </div>

          {/* Pending bookings alert */}
          {pendingBookings.length > 0 && (
            <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
              <p className="text-sm font-medium text-yellow-300">
                ⚠️ Ai {pendingBookings.length} rezerv{pendingBookings.length === 1 ? "are" : "ări"} în așteptare
              </p>
            </div>
          )}

          {/* Gallery */}
          <h2 className="mt-8 text-lg font-semibold text-white/80">Galerie foto</h2>
          <div className="glass-panel mt-4 p-6">
            <GalleryUploader
              displayName={vendorProfile.displayName}
              bio={vendorProfile.bio}
              galleryUrls={vendorProfile.galleryUrls}
            />
          </div>

          {/* Services */}
          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white/80">Serviciile mele</h2>
            <div className="flex gap-2">
              <Link
                href="/dashboard/availability"
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:border-white/30 hover:text-white"
              >
                Disponibilitate
              </Link>
              <Link
                href="/dashboard/services/new"
                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black hover:bg-cyan-400"
              >
                + Adaugă serviciu
              </Link>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {vendorProfile.services.length === 0 && (
              <p className="text-sm text-white/40">Niciun serviciu adăugat încă.</p>
            )}
            {vendorProfile.services.map((service) => (
              <div key={service.id} className="glass-panel flex items-center justify-between p-4">
                <div>
                  <p className={service.active ? "font-medium" : "font-medium text-white/40 line-through"}>
                    {service.title}
                  </p>
                  <p className="text-sm text-white/40">{formatRON(service.priceNetRON)}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/services/${service.id}/edit`}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:border-white/30 hover:text-white"
                  >
                    Editează
                  </Link>
                  <ServiceToggleButton serviceId={service.id} active={service.active} />
                </div>
              </div>
            ))}
          </div>

          {/* Bookings received */}
          <h2 className="mt-8 text-lg font-semibold text-white/80">Rezervări primite</h2>
          <div className="mt-4 flex flex-col gap-3">
            {bookings.length === 0 && (
              <p className="text-sm text-white/40">Nicio rezervare încă.</p>
            )}
            {vendorProfile.availabilities.map((slot) => {
              const booking = slot.booking;
              if (!booking) return null;
              return (
                <div key={slot.id} className="glass-panel p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{booking.service.title}</p>
                      <p className="text-sm text-white/50">
                        {booking.customer.name} · {booking.customer.email}
                      </p>
                      <p className="mt-1 text-sm text-white/40">
                        {new Date(slot.date).toLocaleDateString("ro-RO")} · {slot.startTime}–{slot.endTime}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-semibold">{formatRON(booking.totalPriceRON)}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${
                          booking.status === "CONFIRMED"
                            ? "bg-green-500/20 text-green-400"
                            : booking.status === "PENDING"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : booking.status === "CANCELLED"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-white/10 text-white/50"
                        }`}
                      >
                        {booking.status}
                      </span>
                      {booking.status === "PENDING" && (
                        <div className="flex gap-2">
                          <BookingActionButton bookingId={booking.id} action="CONFIRMED" />
                          <BookingActionButton bookingId={booking.id} action="CANCELLED" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    );
  }

  /* ── CLIENT (B2C + B2B) ── */
  const bookings = await db.booking.findMany({
    where: { customerId: session.user.id },
    include: { service: { include: { vendor: true } }, review: true },
    orderBy: { createdAt: "desc" },
  });

  const active = bookings.filter((b) => ["PENDING", "CONFIRMED"].includes(b.status));
  const past = bookings.filter((b) => ["COMPLETED", "CANCELLED"].includes(b.status));

  return (
    <main className="min-h-screen pb-24">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-bold">Rezervările mele</h1>

        {session.user.role === "CUSTOMER_B2B" && (
          <Link href="/rfq" className="mt-3 inline-block text-sm text-cyan-glow hover:underline">
            Gestionează Cererile de Ofertă →
          </Link>
        )}

        {bookings.length === 0 ? (
          <div className="glass-panel mt-8 flex flex-col items-center gap-4 py-14 text-center">
            <p className="text-white/50">Nu ai nicio rezervare încă.</p>
            <Link
              href="/services"
              className="rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-cyan-400"
            >
              Explorează servicii →
            </Link>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <>
                <h2 className="mt-8 text-base font-semibold text-white/60">Active</h2>
                <div className="mt-3 flex flex-col gap-4">
                  {active.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} showCancel />
                  ))}
                </div>
              </>
            )}
            {past.length > 0 && (
              <>
                <h2 className="mt-8 text-base font-semibold text-white/60">Istorice</h2>
                <div className="mt-3 flex flex-col gap-4">
                  {past.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} showCancel={false} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function BookingCard({
  booking,
  showCancel,
}: {
  booking: {
    id: string;
    status: string;
    slotStart: Date;
    totalPriceRON: number;
    service: { title: string; vendor: { displayName: string } };
    review: { rating: number; comment: string | null } | null;
  };
  showCancel: boolean;
}) {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">{booking.service.title}</p>
          <p className="text-sm text-white/50">{booking.service.vendor.displayName}</p>
          <p className="mt-1 text-sm text-white/40">
            {booking.slotStart.toLocaleString("ro-RO")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <p className="font-semibold">{formatRON(booking.totalPriceRON)}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${
              booking.status === "CONFIRMED"
                ? "bg-green-500/20 text-green-400"
                : booking.status === "PENDING"
                  ? "bg-yellow-500/20 text-yellow-300"
                  : booking.status === "CANCELLED"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-white/10 text-white/50"
            }`}
          >
            {booking.status}
          </span>
        </div>
      </div>

      {booking.status === "COMPLETED" && !booking.review && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <ReviewButton bookingId={booking.id} />
        </div>
      )}
      {booking.review && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-sm text-white/40">
            Ai acordat {booking.review.rating} ⭐{booking.review.comment ? ` — ${booking.review.comment}` : ""}
          </p>
        </div>
      )}
    </div>
  );
}
