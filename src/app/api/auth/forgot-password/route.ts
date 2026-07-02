import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { db } from "@/lib/db";
import { createResetToken } from "@/lib/reset-token";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(`forgot:${clientIp(request)}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Prea multe încercări. Reîncearcă în 15 minute." }, { status: 429 });
  }

  try {
    const { email } = z.object({ email: z.string().email() }).parse(await request.json());

    const user = await db.user.findUnique({ where: { email } });

    // Always return success so the endpoint doesn't leak which emails exist
    if (user?.passwordHash) {
      const token = createResetToken(user.id, user.passwordHash);
      const baseUrl = process.env.NEXTAUTH_URL ?? "https://marketplace-services-delta.vercel.app";
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl: `${baseUrl}/auth/reset-password?token=${token}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Email invalid" }, { status: 400 });
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
