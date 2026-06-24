import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { promotionPurchaseSchema } from "@/lib/validation/schemas";
import { PROMOTION_PLAN_PRICES_RON } from "@/lib/constants/brand";

const PLAN_DURATION_DAYS: Record<string, number> = {
  TOP_SEARCH_7D: 7,
  TOP_SEARCH_30D: 30,
  FEATURED_HOME_7D: 7,
  FEATURED_HOME_30D: 30,
};

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  const vendorProfile = await db.vendorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!vendorProfile) {
    return NextResponse.json({ error: "Profil de prestator inexistent" }, { status: 404 });
  }

  try {
    const data = promotionPurchaseSchema.parse(await request.json());

    const amountPaidRON = PROMOTION_PLAN_PRICES_RON[data.plan];
    const durationDays = PLAN_DURATION_DAYS[data.plan];

    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setDate(endsAt.getDate() + durationDays);

    const purchase = await db.$transaction(async (tx) => {
      const created = await tx.promotionPurchase.create({
        data: {
          vendorId: vendorProfile.id,
          plan: data.plan,
          amountPaidRON,
          startsAt,
          endsAt,
        },
      });

      await tx.vendorProfile.update({
        where: { id: vendorProfile.id },
        data: { promotedUntil: endsAt, promotionPlan: data.plan },
      });

      return created;
    });

    return NextResponse.json({ purchase }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
