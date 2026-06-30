import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { registerCompanySchema, registerCustomerSchema, registerVendorSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
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
          email: data.email,
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
          email: data.email,
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
        email: data.email,
        passwordHash,
        role: "CUSTOMER_B2C",
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
