import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { createAvailabilitySchema } from "@/lib/validation/schemas";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const service = await db.service.findUnique({ where: { id: params.id } });

  if (!service) {
    return NextResponse.json({ error: "Serviciu inexistent" }, { status: 404 });
  }

  const slots = await db.availability.findMany({
    where: { vendorId: service.vendorId, isBooked: false, date: { gte: new Date() } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json({ slots });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();

  if (!session?.user || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Doar prestatorii pot seta disponibilitate" }, { status: 403 });
  }

  const service = await db.service.findUnique({ where: { id: params.id } });
  if (!service) {
    return NextResponse.json({ error: "Serviciu inexistent" }, { status: 404 });
  }

  const vendorProfile = await db.vendorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!vendorProfile || vendorProfile.id !== service.vendorId) {
    return NextResponse.json({ error: "Nu deții acest serviciu" }, { status: 403 });
  }

  try {
    const data = createAvailabilitySchema.parse(await request.json());

    const slot = await db.availability.create({
      data: {
        vendorId: vendorProfile.id,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
      },
    });

    return NextResponse.json({ slot }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    // Unique constraint [vendorId, date, startTime] prevents duplicate slots
    return NextResponse.json({ error: "Slot deja existent sau eroare server" }, { status: 409 });
  }
}
