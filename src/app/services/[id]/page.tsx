import { notFound } from "next/navigation";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { formatRON } from "@/lib/utils";
import { BookingPanel } from "./booking-panel";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const service = await db.service.findUnique({ where: { id: params.id }, select: { title: true } });
  return { title: service ? `${service.title} — Zervio` : "Serviciu — Zervio" };
}

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  const service = await db.service.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      vendor: {
        select: {
          id: true,
          displayName: true,
          bio: true,
          verifiedBadge: true,
          ratingAvg: true,
          ratingCount: true,
        },
      },
    },
  });

  if (!service || !service.active) {
    notFound();
  }

  const session = await getCurrentSession();
  const isB2B = session?.user.role === "CUSTOMER_B2B";
  const grossPrice = service.priceNetRON * (1 + service.vatRate);

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <span className="text-xs font-medium uppercase tracking-wide text-white/40">
            {service.category.name}
          </span>
          <h1 className="mt-2 text-3xl font-bold">{service.title}</h1>

          <Link
            href={`/vendors/${service.vendor.id}`}
            className="mt-3 inline-flex items-center gap-1.5 text-white/60 hover:text-white"
          >
            {service.vendor.displayName}
            {service.vendor.verifiedBadge && <BadgeCheck className="h-4 w-4 text-cyan-glow" />}
          </Link>

          <p className="mt-6 whitespace-pre-line text-white/70">{service.description}</p>

          {isB2B && (
            <div className="glass-panel mt-8 p-5">
              <p className="text-sm text-white/60">
                Preț corporate: <strong>{formatRON(service.priceNetRON)}</strong> fără TVA ·{" "}
                <strong>{formatRON(grossPrice)}</strong> cu TVA
              </p>
              <Link
                href={`/rfq?serviceId=${service.id}`}
                className="mt-3 inline-block text-sm text-cyan-glow hover:underline"
              >
                Trimite o Cerere de Ofertă pentru proiecte mari →
              </Link>
            </div>
          )}
        </div>

        <div>
          <BookingPanel serviceId={service.id} grossPrice={grossPrice} />
        </div>
      </section>
    </main>
  );
}
