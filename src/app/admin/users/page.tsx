import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { Users, ArrowLeft } from "lucide-react";

export const metadata = { title: "Utilizatori — Admin Zervio" };

const ROLE_LABEL: Record<string, string> = {
  CUSTOMER_B2C: "Client B2C",
  CUSTOMER_B2B: "Client B2B",
  VENDOR: "Prestator",
  ADMIN: "Admin",
};

const ROLE_COLOR: Record<string, string> = {
  CUSTOMER_B2C: "text-white/60 bg-white/5",
  CUSTOMER_B2B: "text-blue-400 bg-blue-400/10",
  VENDOR: "text-cyan-400 bg-cyan-400/10",
  ADMIN: "text-red-400 bg-red-400/10",
};

export default async function AdminUsersPage() {
  const session = await getCurrentSession();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      _count: { select: { bookings: true } },
      vendorProfile: { select: { id: true, displayName: true, verifiedBadge: true } },
    },
  });

  const roleCounts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="min-h-screen pb-24">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="rounded-lg border border-white/10 p-2 hover:border-white/30">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Utilizatori</h1>
            <p className="mt-0.5 text-sm text-white/40">{users.length} utilizatori totali</p>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 flex flex-wrap gap-3">
          {Object.entries(roleCounts).map(([role, count]) => (
            <div key={role} className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${ROLE_COLOR[role] ?? "text-white/50 bg-white/5"}`}>
              <span>{ROLE_LABEL[role] ?? role}</span>
              <span className="font-bold">{count}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-white/40">
                <th className="px-4 py-3">Utilizator</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3 text-right">Rezervări</th>
                <th className="px-4 py-3">Înregistrat</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-xs font-bold text-black">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/60">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLOR[user.role] ?? ""}`}>
                      {ROLE_LABEL[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white/60">{user._count.bookings}</td>
                  <td className="px-4 py-3 text-white/40">
                    {new Date(user.createdAt).toLocaleDateString("ro-RO")}
                  </td>
                  <td className="px-4 py-3">
                    {user.vendorProfile && (
                      <Link
                        href={`/vendors/${user.vendorProfile.id}`}
                        className="text-xs text-cyan-400 hover:underline"
                      >
                        Profil vendor →
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
