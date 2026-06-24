import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const booking = await db.booking.findUnique({
    where: { id: params.id },
    include: { service: { include: { vendor: true } }, transaction: true },
  });

  if (!booking || booking.customerId !== session.user.id) {
    return NextResponse.json({ error: "Rezervare inexistentă" }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const booking = await db.booking.findUnique({ where: { id: params.id } });

  if (!booking || booking.customerId !== session.user.id) {
    return NextResponse.json({ error: "Rezervare inexistentă" }, { status: 404 });
  }

  if (booking.status === "COMPLETED") {
    return NextResponse.json({ error: "Rezervare deja finalizată" }, { status: 400 });
  }

  await db.$transaction([
    db.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } }),
    ...(booking.availabilityId
      ? [
          db.availability.update({
            where: { id: booking.availabilityId },
            data: { isBooked: false },
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ success: true });
}
