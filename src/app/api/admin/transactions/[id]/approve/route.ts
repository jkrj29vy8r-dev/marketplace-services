import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Neautorizat" }, { status: 403 });
  }

  const tx = await db.transaction.findUnique({ where: { id: params.id } });
  if (!tx) return NextResponse.json({ error: "Tranzacție inexistentă" }, { status: 404 });

  const updated = await db.$transaction(async (t) => {
    const transaction = await t.transaction.update({
      where: { id: params.id },
      data: { status: "PAID" },
    });
    if (transaction.bookingId) {
      await t.booking.update({
        where: { id: transaction.bookingId },
        data: { status: "CONFIRMED" },
      });
    }
    return transaction;
  });

  return NextResponse.json({ transaction: updated });
}
