import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const service = await db.service.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      vendor: {
        select: {
          id: true,
          displayName: true,
          bio: true,
          galleryUrls: true,
          verifiedBadge: true,
          ratingAvg: true,
          ratingCount: true,
        },
      },
    },
  });

  if (!service) {
    return NextResponse.json({ error: "Serviciu inexistent" }, { status: 404 });
  }

  return NextResponse.json({ service });
}

const updateSchema = z.object({
  title: z.string().min(3).max(150).optional(),
  description: z.string().min(10).max(3000).optional(),
  priceNetRON: z.number().positive().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const service = await db.service.findUnique({ where: { id: params.id }, include: { vendor: true } });
  if (!service) return NextResponse.json({ error: "Serviciu inexistent" }, { status: 404 });

  const isOwner = service.vendor.userId === session.user.id;
  if (!isOwner && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Neautorizat" }, { status: 403 });
  }

  try {
    const data = updateSchema.parse(await request.json());
    const updated = await db.service.update({ where: { id: params.id }, data });
    return NextResponse.json({ service: updated });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const service = await db.service.findUnique({ where: { id: params.id }, include: { vendor: true } });
  if (!service) return NextResponse.json({ error: "Serviciu inexistent" }, { status: 404 });

  const isOwner = service.vendor.userId === session.user.id;
  if (!isOwner && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Neautorizat" }, { status: 403 });
  }

  await db.service.update({ where: { id: params.id }, data: { active: false } });
  return NextResponse.json({ success: true });
}
