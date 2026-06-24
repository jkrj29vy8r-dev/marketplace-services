"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("q", query.trim());
    }
    router.push(`/services?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel mx-auto flex w-full max-w-2xl items-center gap-3 px-5 py-4 shadow-glow"
    >
      <Search className="h-5 w-5 text-white/40" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Caută DJ, curățenie, transport, decor evenimente..."
        className="w-full bg-transparent text-base text-white placeholder:text-white/40 focus:outline-none"
      />
      <button type="submit" className="glow-button px-5 py-2.5 text-sm">
        Caută
      </button>
    </form>
  );
}
