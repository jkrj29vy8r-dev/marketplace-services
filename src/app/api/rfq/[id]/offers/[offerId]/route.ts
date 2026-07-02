import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { sendRFQOfferDecisionEmail } from "@/lib/email";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; offerId: string } },
) {
  const session = await getCurrentSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await request.json();
  const action = body.action as "ACCEPT" | "REJECT" | "WITHDRAW";

  if (action !== "ACCEPT" && action !== "REJECT" && action !== "WITHDRAW") {
    return NextResponse.json({ error: "Acțiune invalidă" }, { status: 400 });
  }

  const rfq = await db.rFQ.findUnique({ where: { id: params.id } });
  if (!rfq) {
    return NextResponse.json({ error: "Cerere inexistentă" }, { status: 404 });
  }

  const offer = await db.rFQOffer.findUnique({
    where: { id: params.offerId },
    include: { vendor: { include: { user: { select: { email: true } } } } },
  });

  if (!offer || offer.rfqId !== rfq.id) {
    return NextResponse.json({ error: "Ofertă inexistentă" }, { status: 404 });
  }

  // Vendor withdraws their own pending offer
  if (action === "WITHDRAW") {
    if (session.user.role !== "VENDOR" || offer.vendor.userId !== session.user.id) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }
    if (offer.status !== "PENDING") {
      return NextResponse.json({ error: "Doar ofertele în așteptare pot fi retrase" }, { status: 400 });
    }
    await db.rFQOffer.update({ where: { id: offer.id }, data: { status: "WITHDRAWN" } });
    return NextResponse.json({ success: true });
  }

  // Company accepts/rejects — only the RFQ owner
  if (session.user.role !== "CUSTOMER_B2B" || rfq.companyId !== session.user.id) {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  if (action === "ACCEPT") {
    await db.$transaction([
      db.rFQOffer.update({ where: { id: offer.id }, data: { status: "ACCEPTED" } }),
      db.rFQOffer.updateMany({
        where: { rfqId: rfq.id, id: { not: offer.id }, status: "PENDING" },
        data: { status: "REJECTED" },
      }),
      db.rFQ.update({ where: { id: rfq.id }, data: { status: "ACCEPTED" } }),
    ]);
  } else {
    await db.rFQOffer.update({ where: { id: offer.id }, data: { status: "REJECTED" } });
  }

  if (offer.vendor.user.email) {
    sendRFQOfferDecisionEmail({
      to: offer.vendor.user.email,
      vendorName: offer.vendor.displayName,
      rfqTitle: rfq.title,
      decision: action === "ACCEPT" ? "ACCEPTED" : "REJECTED",
    }).catch(() => null);
  }

  return NextResponse.json({ success: true });
}
