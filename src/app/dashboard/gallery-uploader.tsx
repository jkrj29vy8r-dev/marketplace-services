"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

const MAX_DIMENSION = 1600;

async function compressImage(file: File): Promise<File> {
  if (file.type === "image/avif") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
  if (!blob) return file;

  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
}

export function GalleryUploader({
  displayName,
  bio,
  galleryUrls,
}: {
  displayName: string;
  bio: string | null;
  galleryUrls: string[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urls, setUrls] = useState(galleryUrls);
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function persist(nextUrls: string[]) {
    await fetch("/api/vendors/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio: bio ?? undefined, galleryUrls: nextUrls }),
    });
    router.refresh();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.size > 8 * 1024 * 1024) {
      setError("Poza e prea mare (max. 8MB)");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);

    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 30000);

    try {
      setStage("Comprim imaginea...");
      const t0 = performance.now();
      const compressed = await compressImage(file);
      console.log(`[upload] compress done in ${Math.round(performance.now() - t0)}ms`, {
        originalSize: file.size,
        compressedSize: compressed.size,
        type: compressed.type,
      });

      setStage("Trimit către storage...");
      const t1 = performance.now();
      const formData = new FormData();
      formData.append("file", compressed);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
        signal: timeoutController.signal,
      });
      console.log(`[upload] server put done in ${Math.round(performance.now() - t1)}ms`);

      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Eroare la upload");
      }

      const { url } = (await res.json()) as { url: string };
      const nextUrls = [...urls, url];
      setUrls(nextUrls);
      await persist(nextUrls);
    } catch (err) {
      console.error("[upload] failed", err);
      const message = err instanceof Error ? err.message : String(err);
      if (err instanceof Error && (err.name === "AbortError" || /abort/i.test(message))) {
        setError("Conexiune prea slabă — încearcă din nou pe WiFi");
      } else {
        setError(message || "Eroare la upload");
      }
    } finally {
      clearTimeout(timeoutId);
      setUploading(false);
      setStage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemove(url: string) {
    const nextUrls = urls.filter((u) => u !== url);
    setUrls(nextUrls);
    await persist(nextUrls);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {urls.map((url) => (
          <div key={url} className="group relative h-24 w-24 overflow-hidden rounded-lg border border-border">
            <img src={url} alt="Galerie" className="h-full w-full object-cover" />
            <button
              onClick={() => handleRemove(url)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 opacity-0 transition group-hover:opacity-100"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}

        <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border text-xs text-white/50 transition hover:border-cyan/40 hover:text-cyan-glow">
          {uploading ? stage ?? "Se încarcă..." : "+ Adaugă"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
