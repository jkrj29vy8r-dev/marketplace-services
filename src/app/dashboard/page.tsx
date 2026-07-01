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
import { BookingsTabs } from "./bookings-tabs";
import { Star, CalendarCheck, TrendingUp, Package, Receipt, MessageSquare } from "lucide-react";

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
  const [bookings, reviews, messages] = await Promise.all([
    db.booking.findMany({
      where: { customerId: session.user.id },
      include: { service: { include: { vendor: true } }, review: true },
      orderBy: { createdAt: "desc" },
    }),
    db.review.findMany({
      where: { booking: { customerId: session.user.id } },
      include: { vendor: { select: { displayName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.message.findMany({
      where: { senderId: session.user.id },
      include: { vendor: { select: { displayName: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const activeCount = bookings.filter((b) => ["PENDING", "CONFIRMED"].includes(b.status)).length;
  const serializedBookings = bookings.map((b) => ({
    ...b,
    slotStart: b.slotStart.toISOString(),
    slotEnd: b.slotEnd.toISOString(),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));

  return (
    <main className="min-h-screen pb-24">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-glow to-cyan-glow text-lg font-bold text-black">
            {session.user.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bună, {session.user.name?.split(" ")[0]}!</h1>
            <p className="text-sm text-white/40">
              {new Date().toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="glass-panel p-4 text-center">
            <p className="text-2xl font-bold text-cyan-400">{activeCount}</p>
            <p className="mt-1 text-xs text-white/40">Rezervări active</p>
          </div>
          <div className="glass-panel p-4 text-center">
            <p className="text-2xl font-bold">{bookings.length}</p>
            <p className="mt-1 text-xs text-white/40">Total rezervări</p>
          </div>
          <div className="glass-panel p-4 text-center">
            <p className="text-2xl font-bold">{reviews.length}</p>
            <p className="mt-1 text-xs text-white/40">Recenzii lăsate</p>
          </div>
        </div>

        {session.user.role === "CUSTOMER_B2B" && (
          <Link href="/rfq" className="mt-4 inline-flex items-center gap-1 text-sm text-cyan-glow hover:underline">
            Gestionează Cererile de Ofertă →
          </Link>
        )}

        {/* Bookings with tabs */}
        <h2 className="mt-8 flex items-center gap-2 text-lg font-semibold text-white/80">
          <CalendarCheck className="h-5 w-5" />
          Rezervările mele
        </h2>
        <BookingsTabs bookings={serializedBookings} />

        {/* Reviews */}
        {reviews.length > 0 && (
          <>
            <h2 className="mt-10 flex items-center gap-2 text-lg font-semibold text-white/80">
              <Star className="h-5 w-5" />
              Recenziile mele
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {reviews.map((r) => (
                <div key={r.id} className="glass-panel p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{r.vendor.displayName}</p>
                    <span className="text-sm text-cyan-400">{"★".repeat(r.rating)}</span>
                  </div>
                  {r.comment && <p className="mt-1 text-sm text-white/50">{r.comment}</p>}
                  <p className="mt-1 text-xs text-white/30">{new Date(r.createdAt).toLocaleDateString("ro-RO")}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Messages shortcut */}
        <div className="mt-10 glass-panel flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-white/40" />
            <div>
              <p className="font-medium">Mesajele mele</p>
              <p className="text-sm text-white/40">Conversații cu prestatorii</p>
            </div>
          </div>
          <Link href="/messages" className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/60 hover:border-white/30 hover:text-white">
            Deschide →
          </Link>
        </div>

        {/* Payments shortcut */}
        <div className="mt-4 glass-panel flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <Receipt className="h-5 w-5 text-white/40" />
            <div>
              <p className="font-medium">Istoricul plăților</p>
              <p className="text-sm text-white/40">Tranzacții și facturi</p>
            </div>
          </div>
          <Link href="/dashboard/payments" className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/60 hover:border-white/30 hover:text-white">
            Vezi →
          </Link>
        </div>

        {/* Profile link */}
        <div className="mt-4 glass-panel flex items-center justify-between p-5">
          <div>
            <p className="font-medium">Profilul meu</p>
            <p className="text-sm text-white/40">Editează date personale și parolă</p>
          </div>
          <Link href="/dashboard/profile" className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/60 hover:border-white/30 hover:text-white">
            Editează →
          </Link>
        </div>
      </section>
    </main>
  );
}
