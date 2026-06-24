import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { createServiceSchema } from "@/lib/validation/schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const categorySlug = searchParams.get("category")?.trim();

  const services = await db.service.findMany({
    where: {
      active: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      vendor: {
        select: {
          id: true,
          displayName: true,
          verifiedBadge: true,
          ratingAvg: true,
          ratingCount: true,
          promotedUntil: true,
        },
      },
    },
    orderBy: [{ vendor: { promotedUntil: "desc" } }, { createdAt: "desc" }],
    take: 50,
  });

  return NextResponse.json({ services });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Doar prestatorii pot crea servicii" }, { status: 403 });
  }

  const vendorProfile = await db.vendorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!vendorProfile) {
    return NextResponse.json({ error: "Profil de prestator inexistent" }, { status: 404 });
  }

  try {
    const data = createServiceSchema.parse(await request.json());

    const service = await db.service.create({
      data: {
        vendorId: vendorProfile.id,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        pricingType: data.pricingType,
        priceNetRON: data.priceNetRON,
        vatRate: data.vatRate,
        unit: data.unit,
        durationMins: data.durationMins,
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
