import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Plata cu cardul nu e disponibilă momentan. Alege transfer bancar." },
      { status: 503 },
    );
  }

  try {
    const { bookingId } = z.object({ bookingId: z.string().cuid() }).parse(await request.json());

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: { select: { title: true, vendor: { select: { displayName: true } } } },
        transaction: true,
      },
    });

    if (!booking || booking.customerId !== session.user.id) {
      return NextResponse.json({ error: "Rezervare inexistentă" }, { status: 404 });
    }
    if (booking.paymentType !== "CARD") {
      return NextResponse.json({ error: "Rezervarea nu e cu plata prin card" }, { status: 400 });
    }
    if (booking.transaction?.status === "PAID") {
      return NextResponse.json({ error: "Rezervarea e deja plătită" }, { status: 400 });
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? "https://marketplace-services-delta.vercel.app";

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: "ron",
            unit_amount: Math.round(booking.totalPriceRON * 100),
            product_data: {
              name: booking.service.title,
              description: `${booking.service.vendor.displayName} · ${booking.slotStart.toLocaleString("ro-RO")}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { bookingId: booking.id },
      success_url: `${baseUrl}/booking/${booking.id}/confirm?paid=1`,
      cancel_url: `${baseUrl}/booking/${booking.id}/confirm?cancelled=1`,
    });

    if (booking.transaction) {
      await db.transaction.update({
        where: { id: booking.transaction.id },
        data: { stripePaymentId: checkout.id },
      });
    }

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    console.error("[stripe] checkout error:", error);
    return NextResponse.json({ error: "Eroare la inițierea plății" }, { status: 500 });
  }
}
