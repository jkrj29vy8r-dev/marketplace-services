import Link from "next/link";
import { BadgeCheck, Zap } from "lucide-react";
import { formatRON } from "@/lib/utils";

export type ServiceCardData = {
  id: string;
  title: string;
  pricingType: "FIXED" | "PER_UNIT";
  priceNetRON: number;
  vatRate: number;
  unit: string | null;
  category: { name: string };
  vendor: {
    displayName: string;
    verifiedBadge: boolean;
    ratingAvg: number;
    ratingCount: number;
    promotedUntil: string | null;
  };
};

export function ServiceCard({
  service,
  showNetPrice,
}: {
  service: ServiceCardData;
  showNetPrice: boolean;
}) {
  const grossPrice = service.priceNetRON * (1 + service.vatRate);
  const isPromoted = service.vendor.promotedUntil
    ? new Date(service.vendor.promotedUntil) > new Date()
    : false;

  return (
    <Link
      href={`/services/${service.id}`}
      className="glass-panel block p-5 transition hover:border-indigo/40 hover:shadow-glow"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-white/40">
          {service.category.name}
        </span>
        {isPromoted && (
          <span className="badge-promoted">
            <Zap className="h-3 w-3" />
            Promovat
          </span>
        )}
      </div>

      <h3 className="mt-2 text-lg font-semibold">{service.title}</h3>

      <div className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
        <span>{service.vendor.displayName}</span>
        {service.vendor.verifiedBadge && <BadgeCheck className="h-3.5 w-3.5 text-cyan-glow" />}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xl font-bold">
            {formatRON(grossPrice)}
            {service.unit && <span className="text-sm text-white/40"> / {service.unit}</span>}
          </p>
          {showNetPrice && (
            <p className="text-xs text-white/40">{formatRON(service.priceNetRON)} fără TVA</p>
          )}
        </div>
        <span className="text-sm text-white/50">
          ★ {service.vendor.ratingAvg.toFixed(1)} ({service.vendor.ratingCount})
        </span>
      </div>
    </Link>
  );
}
