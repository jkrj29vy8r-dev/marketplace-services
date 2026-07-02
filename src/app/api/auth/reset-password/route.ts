import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z, ZodError } from "zod";
import { db } from "@/lib/db";
import { verifyResetToken } from "@/lib/reset-token";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(`reset:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Prea multe încercări. Reîncearcă în 15 minute." }, { status: 429 });
  }

  try {
    const { token, newPassword } = z.object({
      token: z.string().min(10),
      newPassword: z.string().min(8).max(72),
    }).parse(await request.json());

    const userId = await verifyResetToken(token, async (id) => {
      const user = await db.user.findUnique({ where: { id }, select: { passwordHash: true } });
      return user?.passwordHash ?? null;
    });

    if (!userId) {
      return NextResponse.json({ error: "Link invalid sau expirat. Solicită un link nou." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.user.update({ where: { id: userId }, data: { passwordHash } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
