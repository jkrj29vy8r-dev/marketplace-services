"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { X } from "lucide-react";

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
    setUploading(true);

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/uploads",
      });

      const nextUrls = [...urls, blob.url];
      setUrls(nextUrls);
      await persist(nextUrls);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la upload");
    } finally {
      setUploading(false);
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
          {uploading ? "Se încarcă..." : "+ Adaugă"}
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
