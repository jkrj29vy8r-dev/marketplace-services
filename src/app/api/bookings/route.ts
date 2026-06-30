import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { createBookingSchema } from "@/lib/validation/schemas";
import { sendBookingConfirmationEmail, sendNewBookingVendorEmail } from "@/lib/email";

export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const bookings = await db.booking.findMany({
    where: { customerId: session.user.id },
    include: { service: { include: { vendor: true } }, transaction: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  try {
    const data = createBookingSchema.parse(await request.json());

    const service = await db.service.findUnique({
      where: { id: data.serviceId },
      include: { vendor: { include: { user: true } } },
    });
    if (!service || !service.active) {
      return NextResponse.json({ error: "Serviciu indisponibil" }, { status: 404 });
    }

    const booking = await db.$transaction(async (tx) => {
      const slot = await tx.availability.findUnique({ where: { id: data.availabilityId } });

      if (!slot || slot.vendorId !== service.vendorId || slot.isBooked) {
        throw new Error("SLOT_UNAVAILABLE");
      }

      const updated = await tx.availability.updateMany({
        where: { id: slot.id, isBooked: false },
        data: { isBooked: true },
      });

      if (updated.count === 0) {
        throw new Error("SLOT_UNAVAILABLE");
      }

      const totalPriceRON =
        service.pricingType === "FIXED"
          ? service.priceNetRON * (1 + service.vatRate)
          : service.priceNetRON * (1 + service.vatRate);

      const slotStart = combineDateAndTime(slot.date, slot.startTime);
      const slotEnd = combineDateAndTime(slot.date, slot.endTime);

      const newBooking = await tx.booking.create({
        data: {
          serviceId: service.id,
          customerId: session.user.id,
          availabilityId: slot.id,
          slotStart,
          slotEnd,
          totalPriceRON,
          paymentType: data.paymentType,
          status: "PENDING",
        },
      });

      await tx.transaction.create({
        data: {
          bookingId: newBooking.id,
          amountRON: totalPriceRON,
          method: data.paymentType,
          status: data.paymentType === "BANK_TRANSFER" ? "AWAITING_PROOF" : "PENDING",
        },
      });

      return newBooking;
    });

    if (session.user.email) {
      await sendBookingConfirmationEmail({
        to: session.user.email,
        customerName: session.user.name ?? "Client",
        serviceName: service.title,
        vendorName: service.vendor.displayName,
        slotStart: booking.slotStart,
        totalPriceRON: booking.totalPriceRON,
      });
    }
    if (service.vendor.user.email) {
      await sendNewBookingVendorEmail({
        to: service.vendor.user.email,
        vendorName: service.vendor.displayName,
        serviceName: service.title,
        customerName: session.user.name ?? "Client",
        slotStart: booking.slotStart,
      });
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message === "SLOT_UNAVAILABLE") {
      return NextResponse.json({ error: "Slot deja rezervat" }, { status: 409 });
    }
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}

function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}
