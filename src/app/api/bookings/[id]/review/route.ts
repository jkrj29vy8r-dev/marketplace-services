import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const booking = await db.booking.findUnique({
    where: { id: params.id },
    include: { service: true, review: true },
  });

  if (!booking || booking.customerId !== session.user.id) {
    return NextResponse.json({ error: "Rezervare inexistentă" }, { status: 404 });
  }

  if (booking.status !== "COMPLETED") {
    return NextResponse.json({ error: "Poți recenza doar rezervări finalizate" }, { status: 400 });
  }

  if (booking.review) {
    return NextResponse.json({ error: "Ai lăsat deja o recenzie pentru această rezervare" }, { status: 409 });
  }

  try {
    const data = createReviewSchema.parse(await request.json());

    const review = await db.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          vendorId: booking.service.vendorId,
          bookingId: booking.id,
          rating: data.rating,
          comment: data.comment,
        },
      });

      const { _avg, _count } = await tx.review.aggregate({
        where: { vendorId: booking.service.vendorId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.vendorProfile.update({
        where: { id: booking.service.vendorId },
        data: {
          ratingAvg: _avg.rating ?? 0,
          ratingCount: _count.rating,
        },
      });

      return created;
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
