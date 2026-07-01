import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentSession } from "@/lib/session";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

const supabase = createClient(
  "https://zpkoxhmhoggkpubilssk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwa294aG1ob2dna3B1Ymlsc3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTk0MzksImV4cCI6MjA5Nzg5NTQzOX0.qkFuIsFl2JJC_onkBw5u6SaqVu5JPXuRXa851k9doF4",
);

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

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${session.user.id}/${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error } = await supabase.storage
    .from("gallery")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from("gallery").getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl });
}
