import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; offerId: string } },
) {
  const session = await getCurrentSession();

  if (!session?.user || session.user.role !== "CUSTOMER_B2B") {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  const body = await request.json();
  const action = body.action as "ACCEPT" | "REJECT";

  if (action !== "ACCEPT" && action !== "REJECT") {
    return NextResponse.json({ error: "Acțiune invalidă" }, { status: 400 });
  }

  const rfq = await db.rFQ.findUnique({ where: { id: params.id } });

  if (!rfq || rfq.companyId !== session.user.id) {
    return NextResponse.json({ error: "Cerere inexistentă" }, { status: 404 });
  }

  const offer = await db.rFQOffer.findUnique({ where: { id: params.offerId } });

  if (!offer || offer.rfqId !== rfq.id) {
    return NextResponse.json({ error: "Ofertă inexistentă" }, { status: 404 });
  }

  if (action === "ACCEPT") {
    await db.$transaction([
      db.rFQOffer.update({ where: { id: offer.id }, data: { status: "ACCEPTED" } }),
      db.rFQOffer.updateMany({
        where: { rfqId: rfq.id, id: { not: offer.id } },
        data: { status: "REJECTED" },
      }),
      db.rFQ.update({ where: { id: rfq.id }, data: { status: "ACCEPTED" } }),
    ]);
  } else {
    await db.rFQOffer.update({ where: { id: offer.id }, data: { status: "REJECTED" } });
  }

  return NextResponse.json({ success: true });
}
