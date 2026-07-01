import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { sendNewMessageEmail } from "@/lib/email";

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get("vendorId");

  if (vendorId) {
    const messages = await db.message.findMany({
      where: {
        vendorId,
        OR: [{ senderId: session.user.id }, { vendor: { userId: session.user.id } }],
      },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
      take: 100,
    });
    return NextResponse.json({ messages });
  }

  const messages = await db.message.findMany({
    where: { senderId: session.user.id, vendorId: { not: null } },
    include: { vendor: { select: { id: true, displayName: true } } },
    orderBy: { createdAt: "desc" },
    distinct: ["vendorId"],
    take: 20,
  });

  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  try {
    const { vendorId, body } = z.object({
      vendorId: z.string().cuid(),
      body: z.string().min(1).max(2000),
    }).parse(await request.json());

    const vendor = await db.vendorProfile.findUnique({
      where: { id: vendorId },
      include: { user: { select: { email: true, name: true } } },
    });
    if (!vendor) return NextResponse.json({ error: "Prestator inexistent" }, { status: 404 });

    const message = await db.message.create({
      data: { senderId: session.user.id, vendorId, body },
      include: { sender: { select: { id: true, name: true } } },
    });

    // Notify the vendor by email (fire-and-forget)
    if (vendor.user.email && vendor.userId !== session.user.id) {
      sendNewMessageEmail({
        to: vendor.user.email,
        recipientName: vendor.user.name ?? vendor.displayName,
        senderName: session.user.name ?? "Un client",
        preview: body,
        vendorId,
      }).catch(() => null);
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
