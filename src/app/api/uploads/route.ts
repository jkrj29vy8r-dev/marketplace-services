import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentSession } from "@/lib/session";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Acces interzis" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fișier lipsă" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Tip de fișier neacceptat" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Fișierul depășește 5MB" }, { status: 400 });
  }

  const extension = file.type.split("/")[1];
  const pathname = `vendor-uploads/${session.user.id}/${Date.now()}.${extension}`;

  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
