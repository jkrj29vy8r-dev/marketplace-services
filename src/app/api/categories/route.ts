import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureCategories();
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ categories });
}
