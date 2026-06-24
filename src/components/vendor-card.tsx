import Link from "next/link";
import Image from "next/image";
import { Star, BadgeCheck, Zap } from "lucide-react";

export type VendorCardData = {
  id: string;
  displayName: string;
  bio: string | null;
  galleryUrls: string[];
  verifiedBadge: boolean;
  ratingAvg: number;
  ratingCount: number;
  isPromoted: boolean;
};

export function VendorCard({ vendor }: { vendor: VendorCardData }) {
  const coverImage = vendor.galleryUrls[0];

  return (
    <Link
      href={`/vendors/${vendor.id}`}
      className="glass-panel group block overflow-hidden transition hover:border-indigo/40 hover:shadow-glow"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={vendor.displayName}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/20">
            Fără imagine
          </div>
        )}

        {vendor.isPromoted && (
          <span className="badge-promoted absolute left-3 top-3">
            <Zap className="h-3 w-3" />
            Promovat
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-white">{vendor.displayName}</h3>
          {vendor.verifiedBadge && <BadgeCheck className="h-4 w-4 text-cyan-glow" />}
        </div>

        {vendor.bio && (
          <p className="mt-1 line-clamp-2 text-sm text-white/50">{vendor.bio}</p>
        )}

        <div className="mt-3 flex items-center gap-1 text-sm text-white/70">
          <Star className="h-4 w-4 fill-cyan-glow text-cyan-glow" />
          <span className="font-medium">{vendor.ratingAvg.toFixed(1)}</span>
          <span className="text-white/40">({vendor.ratingCount})</span>
        </div>
      </div>
    </Link>
  );
}
