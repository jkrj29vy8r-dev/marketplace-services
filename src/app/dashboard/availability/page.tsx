"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Trash2 } from "lucide-react";

type Service = { id: string; title: string };
type Slot = { id: string; date: string; startTime: string; endTime: string; isBooked: boolean };

export default function AvailabilityPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [form, setForm] = useState({ date: "", startTime: "09:00", endTime: "10:00" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/vendors/me")
      .then((r) => r.json())
      .then((d) => {
        const svcs: Service[] = d.vendorProfile?.services ?? [];
        setServices(svcs);
        if (svcs.length > 0) setSelectedServiceId(svcs[0].id);
      });
  }, []);

  useEffect(() => {
    if (!selectedServiceId) return;
    fetch(`/api/services/${selectedServiceId}/availability?all=true`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []));
  }, [selectedServiceId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const dateISO = new Date(`${form.date}T00:00:00.000Z`).toISOString();

    const res = await fetch(`/api/services/${selectedServiceId}/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateISO, startTime: form.startTime, endTime: form.endTime }),
    });

    setLoading(false);

    if (!res.ok) {
      const json = await res.json() as { error?: string };
      setError(json.error ?? "Eroare la salvare");
      return;
    }

    fetch(`/api/services/${selectedServiceId}/availability?all=true`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []));

    setForm((prev) => ({ ...prev, date: "" }));
  }

  async function handleDelete(slotId: string) {
    await fetch(`/api/availability/${slotId}`, { method: "DELETE" });
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Disponibilitate</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-white/50 hover:text-white"
          >
            ← Dashboard
          </button>
        </div>

        {services.length === 0 ? (
          <div className="glass-panel mt-8 p-6 text-center text-white/50">
            Adaugă mai întâi un serviciu din dashboard.
          </div>
        ) : (
          <>
            <div className="mt-6">
              <label className="mb-1 block text-sm text-white/60">Serviciu</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            <form onSubmit={handleAdd} className="glass-panel mt-6 flex flex-col gap-4 p-6">
              <h2 className="font-semibold text-white/80">Adaugă interval disponibil</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm text-white/60">Data</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-white/60">Ora început</label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-white/60">Ora sfârșit</label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="self-start rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
              >
                {loading ? "Se adaugă..." : "Adaugă slot"}
              </button>
            </form>

            <h2 className="mt-8 text-lg font-semibold text-white/80">Sloturi existente</h2>
            <div className="mt-4 flex flex-col gap-2">
              {slots.length === 0 && (
                <p className="text-sm text-white/40">Niciun slot adăugat încă.</p>
              )}
              {slots.map((slot) => (
                <div key={slot.id} className="glass-panel flex items-center justify-between p-4">
                  <div className="text-sm">
                    <span className="font-medium">
                      {new Date(slot.date).toLocaleDateString("ro-RO")}
                    </span>
                    <span className="ml-3 text-white/50">
                      {slot.startTime} – {slot.endTime}
                    </span>
                    {slot.isBooked && (
                      <span className="ml-3 rounded-full bg-cyan/10 px-2 py-0.5 text-xs text-cyan-glow">
                        Rezervat
                      </span>
                    )}
                  </div>
                  {!slot.isBooked && (
                    <button
                      onClick={() => handleDelete(slot.id)}
                      className="text-white/30 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
