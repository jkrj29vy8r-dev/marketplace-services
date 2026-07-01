import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  try {
    const { name } = z.object({ name: z.string().min(2).max(100) }).parse(await request.json());
    await db.user.update({ where: { id: session.user.id }, data: { name } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
