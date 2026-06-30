import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { formatRON } from "@/lib/utils";
import { PROMOTION_PLAN_PRICES_RON } from "@/lib/constants/brand";
import { PromoteButton } from "./promote-button";
import { GalleryUploader } from "./gallery-uploader";

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  if (session.user.role === "VENDOR") {
    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: session.user.id },
      include: { services: true },
    });

    return (
      <main className="min-h-screen">
        <Navbar />
        <section className="mx-auto max-w-5xl px-6 py-12">
          <h1 className="text-2xl font-bold">Panou Prestator</h1>

          {!vendorProfile ? (
            <p className="mt-6 text-white/60">
              Completează-ți profilul de prestator pentru a începe.
            </p>
          ) : (
            <>
              <div className="glass-panel mt-6 p-6">
                <h2 className="font-semibold">{vendorProfile.displayName}</h2>
                <p className="mt-2 text-sm text-white/50">
                  {vendorProfile.promotedUntil && new Date(vendorProfile.promotedUntil) > new Date()
                    ? `Promovat până la ${new Date(vendorProfile.promotedUntil).toLocaleDateString("ro-RO")}`
                    : "Niciun pachet de promovare activ"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(PROMOTION_PLAN_PRICES_RON).map(([plan, price]) => (
                    <PromoteButton key={plan} plan={plan} price={price} />
                  ))}
                </div>
              </div>

              <h2 className="mt-8 text-lg font-semibold text-white/80">Galerie foto</h2>
              <div className="glass-panel mt-4 p-6">
                <GalleryUploader
                  displayName={vendorProfile.displayName}
                  bio={vendorProfile.bio}
                  galleryUrls={vendorProfile.galleryUrls}
                />
              </div>

              <h2 className="mt-8 text-lg font-semibold text-white/80">Serviciile mele</h2>
              <div className="mt-4 flex flex-col gap-3">
                {vendorProfile.services.map((service) => (
                  <div key={service.id} className="glass-panel flex items-center justify-between p-4">
                    <span>{service.title}</span>
                    <span className="text-white/50">{formatRON(service.priceNetRON)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    );
  }

  const bookings = await db.booking.findMany({
    where: { customerId: session.user.id },
    include: { service: { include: { vendor: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-bold">Rezervările mele</h1>

        {session.user.role === "CUSTOMER_B2B" && (
          <Link href="/rfq" className="mt-4 inline-block text-sm text-cyan-glow hover:underline">
            Gestionează Cererile de Ofertă →
          </Link>
        )}

        <div className="mt-8 flex flex-col gap-4">
          {bookings.length === 0 && <p className="text-white/50">Nicio rezervare încă.</p>}
          {bookings.map((booking) => (
            <div key={booking.id} className="glass-panel flex items-center justify-between p-5">
              <div>
                <p className="font-semibold">{booking.service.title}</p>
                <p className="text-sm text-white/50">{booking.service.vendor.displayName}</p>
                <p className="mt-1 text-sm text-white/40">
                  {booking.slotStart.toLocaleString("ro-RO")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatRON(booking.totalPriceRON)}</p>
                <p className="text-xs uppercase text-white/40">{booking.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
