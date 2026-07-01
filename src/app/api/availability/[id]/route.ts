import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  const vendorProfile = await db.vendorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!vendorProfile) {
    return NextResponse.json({ error: "Profil inexistent" }, { status: 404 });
  }

  const slot = await db.availability.findUnique({ where: { id: params.id } });

  if (!slot || slot.vendorId !== vendorProfile.id) {
    return NextResponse.json({ error: "Slot inexistent" }, { status: 404 });
  }

  if (slot.isBooked) {
    return NextResponse.json({ error: "Slotul este rezervat și nu poate fi șters" }, { status: 400 });
  }

  await db.availability.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
