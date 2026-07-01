import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

const schema = z.object({ availabilityId: z.string().cuid() });

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  try {
    const { availabilityId } = schema.parse(await request.json());

    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: { service: true },
    });

    if (!booking) return NextResponse.json({ error: "Rezervare inexistentă" }, { status: 404 });
    if (booking.customerId !== session.user.id) return NextResponse.json({ error: "Neautorizat" }, { status: 403 });
    if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
      return NextResponse.json({ error: "Nu se poate reprograma o rezervare în statusul curent" }, { status: 400 });
    }

    const newSlot = await db.availability.findUnique({ where: { id: availabilityId } });
    if (!newSlot || newSlot.isBooked) {
      return NextResponse.json({ error: "Slot indisponibil" }, { status: 400 });
    }
    // Verify slot belongs to same vendor
    const serviceVendor = await db.service.findUnique({ where: { id: booking.serviceId }, select: { vendorId: true } });
    if (!serviceVendor || newSlot.vendorId !== serviceVendor.vendorId) {
      return NextResponse.json({ error: "Slot indisponibil" }, { status: 400 });
    }

    const updated = await db.$transaction(async (tx) => {
      if (booking.availabilityId) {
        await tx.availability.update({ where: { id: booking.availabilityId }, data: { isBooked: false } });
      }
      await tx.availability.update({ where: { id: availabilityId }, data: { isBooked: true } });
      return tx.booking.update({
        where: { id: params.id },
        data: {
          availabilityId,
          slotStart: newSlot.startTime,
          slotEnd: newSlot.endTime,
          status: "PENDING",
        },
      });
    });

    return NextResponse.json({ booking: updated });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
