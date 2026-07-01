import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentSession } from "@/lib/session";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Acces interzis" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Fișier lipsă" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Tip de fișier nepermis" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Fișier prea mare (max. 8MB)" }, { status: 400 });
  }

  try {
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Eroare la upload" },
      { status: 500 },
    );
  }
}
