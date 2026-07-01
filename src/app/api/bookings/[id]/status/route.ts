import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

const schema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED"]),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  try {
    const { status } = schema.parse(await request.json());

    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: { service: { include: { vendor: { include: { user: true } } } } },
    });

    if (!booking) return NextResponse.json({ error: "Rezervare inexistentă" }, { status: 404 });

    const isVendorOwner = booking.service.vendor.userId === session.user.id;
    const isCustomerOwner = booking.customerId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (status === "CONFIRMED" && !isVendorOwner && !isAdmin) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 403 });
    }
    if (status === "CANCELLED" && !isCustomerOwner && !isVendorOwner && !isAdmin) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 403 });
    }

    const updated = await db.$transaction(async (tx) => {
      const b = await tx.booking.update({ where: { id: params.id }, data: { status } });
      if (status === "CANCELLED" && booking.availabilityId) {
        await tx.availability.update({ where: { id: booking.availabilityId }, data: { isBooked: false } });
      }
      return b;
    });

    return NextResponse.json({ booking: updated });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
