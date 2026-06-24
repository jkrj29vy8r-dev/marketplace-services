import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { createRFQSchema } from "@/lib/validation/schemas";

export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  if (session.user.role === "CUSTOMER_B2B") {
    const rfqs = await db.rFQ.findMany({
      where: { companyId: session.user.id },
      include: { offers: { include: { vendor: true } }, service: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ rfqs });
  }

  if (session.user.role === "VENDOR") {
    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: session.user.id },
    });

    const rfqs = await db.rFQ.findMany({
      where: { status: "OPEN" },
      include: { offers: { where: { vendorId: vendorProfile?.id ?? "" } }, company: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ rfqs });
  }

  return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user || session.user.role !== "CUSTOMER_B2B") {
    return NextResponse.json(
      { error: "Doar conturile companie pot trimite cereri de ofertă" },
      { status: 403 },
    );
  }

  const companyProfile = await db.companyProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!companyProfile) {
    return NextResponse.json({ error: "Profil companie inexistent" }, { status: 404 });
  }

  try {
    const data = createRFQSchema.parse(await request.json());

    const rfq = await db.rFQ.create({
      data: {
        companyId: session.user.id,
        companyProfileId: companyProfile.id,
        serviceId: data.serviceId,
        title: data.title,
        description: data.description,
        budgetMinRON: data.budgetMinRON,
        budgetMaxRON: data.budgetMaxRON,
      },
    });

    return NextResponse.json({ rfq }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
