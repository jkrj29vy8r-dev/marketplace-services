import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe neconfigurat" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Semnătură lipsă" }, { status: 400 });

  let event: Stripe.Event;
  try {
    const payload = await request.text();
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Semnătură invalidă" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkout = event.data.object as Stripe.Checkout.Session;
    const bookingId = checkout.metadata?.bookingId;

    if (bookingId && checkout.payment_status === "paid") {
      await db.$transaction([
        db.transaction.updateMany({
          where: { bookingId },
          data: { status: "PAID", stripePaymentId: checkout.id },
        }),
        db.booking.update({
          where: { id: bookingId },
          data: { status: "CONFIRMED" },
        }),
      ]).catch((error) => {
        console.error("[stripe] webhook DB update failed:", error);
      });
    }
  }

  return NextResponse.json({ received: true });
}
