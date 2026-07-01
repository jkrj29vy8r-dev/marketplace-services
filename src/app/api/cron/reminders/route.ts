import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendBookingReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const bookings = await db.booking.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      slotStart: { gte: in24h, lte: in25h },
    },
    include: {
      customer: { select: { email: true, name: true } },
      service: { select: { title: true }, include: { vendor: { select: { displayName: true } } } },
    },
  });

  let sent = 0;
  for (const booking of bookings) {
    await sendBookingReminderEmail({
      to: booking.customer.email!,
      customerName: booking.customer.name ?? "Client",
      serviceName: booking.service.title,
      vendorName: booking.service.vendor.displayName,
      slotStart: booking.slotStart,
    });
    await db.booking.update({ where: { id: booking.id }, data: { reminderSentAt: now } }).catch(() => null);
    sent++;
  }

  return NextResponse.json({ sent });
}
