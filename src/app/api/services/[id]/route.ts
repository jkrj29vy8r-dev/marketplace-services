import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const service = await db.service.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      vendor: {
        select: {
          id: true,
          displayName: true,
          bio: true,
          galleryUrls: true,
          verifiedBadge: true,
          ratingAvg: true,
          ratingCount: true,
        },
      },
    },
  });

  if (!service) {
    return NextResponse.json({ error: "Serviciu inexistent" }, { status: 404 });
  }

  return NextResponse.json({ service });
}
