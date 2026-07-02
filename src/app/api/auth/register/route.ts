import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { registerCompanySchema, registerCustomerSchema, registerVendorSchema } from "@/lib/validation/schemas";
import { sendWelcomeEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(`register:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Prea multe încercări. Reîncearcă în 15 minute." }, { status: 429 });
  }

  const body = await request.json();
  const accountType = body.accountType as "B2C" | "B2B" | "VENDOR" | undefined;

  try {
    if (accountType === "VENDOR") {
      const data = registerVendorSchema.parse(body);

      const existing = await db.user.findUnique({ where: { email: data.email } });
      if (existing) {
        return NextResponse.json({ error: "Email deja înregistrat" }, { status: 409 });
      }

      const passwordHash = await bcrypt.hash(data.password, 12);

      const user = await db.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash,
          role: "VENDOR",
          vendorProfile: {
            create: {
              displayName: data.displayName,
              bio: data.bio,
            },
          },
        },
        select: { id: true, email: true, name: true, role: true },
      });

      sendWelcomeEmail({ to: user.email, name: user.name, role: user.role }).catch(() => null);
      return NextResponse.json({ user }, { status: 201 });
    }

    if (accountType === "B2B") {
      const data = registerCompanySchema.parse(body);

      const existing = await db.user.findUnique({ where: { email: data.email } });
      if (existing) {
        return NextResponse.json({ error: "Email deja înregistrat" }, { status: 409 });
      }

      const existingCui = await db.companyProfile.findUnique({ where: { cui: data.cui } });
      if (existingCui) {
        return NextResponse.json({ error: "CUI deja înregistrat" }, { status: 409 });
      }

      const passwordHash = await bcrypt.hash(data.password, 12);

      const user = await db.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash,
          role: "CUSTOMER_B2B",
          companyProfile: {
            create: {
              companyName: data.companyName,
              cui: data.cui.toUpperCase(),
              regCom: data.regCom,
              sediuSocial: data.sediuSocial,
            },
          },
        },
        select: { id: true, email: true, name: true, role: true },
      });

      sendWelcomeEmail({ to: user.email, name: user.name, role: user.role }).catch(() => null);
      return NextResponse.json({ user }, { status: 201 });
    }

    const data = registerCustomerSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Email deja înregistrat" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: "CUSTOMER_B2C",
      },
      select: { id: true, email: true, name: true, role: true },
    });

    sendWelcomeEmail({ to: user.email, name: user.name, role: user.role }).catch(() => null);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
