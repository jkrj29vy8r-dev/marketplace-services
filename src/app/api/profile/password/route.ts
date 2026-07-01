import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z, ZodError } from "zod";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  try {
    const { currentPassword, newPassword } = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8).max(72),
    }).parse(await request.json());

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user?.passwordHash) return NextResponse.json({ error: "Cont OAuth — schimbarea parolei nu e disponibilă" }, { status: 400 });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Parola curentă incorectă" }, { status: 400 });

    const newHash = await bcrypt.hash(newPassword, 12);
    await db.user.update({ where: { id: session.user.id }, data: { passwordHash: newHash } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
