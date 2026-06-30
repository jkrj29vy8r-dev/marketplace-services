import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { createRFQOfferSchema } from "@/lib/validation/schemas";
import { sendRFQOfferEmail } from "@/lib/email";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();

  if (!session?.user || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Doar prestatorii pot trimite oferte" }, { status: 403 });
  }

  const vendorProfile = await db.vendorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!vendorProfile) {
    return NextResponse.json({ error: "Profil de prestator inexistent" }, { status: 404 });
  }

  const rfq = await db.rFQ.findUnique({ where: { id: params.id }, include: { company: true } });

  if (!rfq || rfq.status !== "OPEN") {
    return NextResponse.json({ error: "Cererea nu mai este deschisă" }, { status: 400 });
  }

  try {
    const data = createRFQOfferSchema.parse(await request.json());

    const offer = await db.$transaction(async (tx) => {
      const created = await tx.rFQOffer.create({
        data: {
          rfqId: rfq.id,
          vendorId: vendorProfile.id,
          priceRON: data.priceRON,
          message: data.message,
        },
      });

      await tx.rFQ.update({ where: { id: rfq.id }, data: { status: "OFFER_RECEIVED" } });

      return created;
    });

    if (rfq.company.email) {
      await sendRFQOfferEmail({
        to: rfq.company.email,
        customerName: rfq.company.name ?? "Client",
        rfqTitle: rfq.title,
        vendorName: vendorProfile.displayName,
        priceRON: data.priceRON,
      });
    }

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
