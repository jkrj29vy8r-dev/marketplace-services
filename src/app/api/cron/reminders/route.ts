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
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // 1) Auto-complete confirmed bookings whose slot has ended,
  //    so customers can leave reviews.
  const completed = await db.booking.updateMany({
    where: { status: "CONFIRMED", slotEnd: { lt: now } },
    data: { status: "COMPLETED" },
  });

  // 2) Send reminders for bookings happening tomorrow (cron runs daily on Hobby plan)
  const bookings = await db.booking.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      slotStart: { gte: in24h, lte: in48h },
    },
    include: {
      customer: { select: { email: true, name: true } },
      service: { select: { title: true, vendor: { select: { displayName: true } } } },
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
    sent++;
  }

  return NextResponse.json({ sent, completed: completed.count });
}
