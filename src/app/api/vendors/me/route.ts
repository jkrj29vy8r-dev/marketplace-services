import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { updateVendorProfileSchema } from "@/lib/validation/schemas";

export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  const vendorProfile = await db.vendorProfile.findUnique({
    where: { userId: session.user.id },
    include: { services: true, promotionPurchases: true },
  });

  return NextResponse.json({ vendorProfile });
}

export async function PUT(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  try {
    const data = updateVendorProfileSchema.parse(await request.json());

    const vendorProfile = await db.vendorProfile.upsert({
      where: { userId: session.user.id },
      update: {
        displayName: data.displayName,
        bio: data.bio,
        galleryUrls: data.galleryUrls ?? [],
      },
      create: {
        userId: session.user.id,
        displayName: data.displayName,
        bio: data.bio,
        galleryUrls: data.galleryUrls ?? [],
      },
    });

    return NextResponse.json({ vendorProfile });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
