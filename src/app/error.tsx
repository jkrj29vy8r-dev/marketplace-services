"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-gray-950 text-white">
        <section className="mx-auto flex max-w-xl flex-col items-center px-6 py-32 text-center">
          <p className="text-6xl font-bold text-red-500">500</p>
          <h1 className="mt-4 text-2xl font-semibold">Eroare internă</h1>
          <p className="mt-2 text-white/50">
            Ceva nu a mers bine. Încearcă din nou sau contactează-ne dacă problema persistă.
          </p>
          <button
            onClick={reset}
            className="mt-8 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-cyan-400"
          >
            Încearcă din nou
          </button>
        </section>
      </body>
    </html>
  );
}
