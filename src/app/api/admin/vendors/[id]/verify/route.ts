import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  const vendorProfile = await db.vendorProfile.update({
    where: { id: params.id },
    data: { verifiedBadge: true },
  });

  return NextResponse.json({ vendorProfile });
}
