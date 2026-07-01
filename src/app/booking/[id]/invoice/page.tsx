import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { formatRON } from "@/lib/utils";
import { PrintInvoiceButton } from "./print-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Factură rezervare — Zervio` };
}

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/auth/sign-in");

  const booking = await db.booking.findUnique({
    where: { id: params.id },
    include: {
      service: { include: { vendor: { include: { user: { select: { email: true } } } } } },
      customer: { select: { id: true, name: true, email: true } },
      transaction: true,
    },
  });

  if (!booking || booking.customerId !== session.user.id) notFound();
  if (!booking.transaction || booking.transaction.status !== "PAID") {
    redirect(`/booking/${params.id}/confirm`);
  }

  const invoiceNumber = `ZRV-${booking.id.slice(-8).toUpperCase()}`;
  const issueDate = new Date(booking.transaction.updatedAt).toLocaleDateString("ro-RO");

  return (
    <div className="min-h-screen bg-white text-gray-900 print:bg-white">
      {/* Print controls — hidden on print */}
      <div className="flex items-center justify-between border-b bg-gray-50 px-8 py-4 print:hidden">
        <span className="text-sm text-gray-500">Factură {invoiceNumber}</span>
        <PrintInvoiceButton />
      </div>

      {/* Invoice */}
      <div className="mx-auto max-w-2xl px-8 py-12">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-indigo-700">Zervio</h1>
            <p className="mt-1 text-sm text-gray-500">Marketplace de servicii România</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">FACTURĂ</p>
            <p className="text-sm text-gray-500">#{invoiceNumber}</p>
            <p className="text-sm text-gray-500">Data: {issueDate}</p>
          </div>
        </div>

        <hr className="my-8" />

        {/* Parties */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Furnizor</p>
            <p className="mt-2 font-semibold">{booking.service.vendor.displayName}</p>
            <p className="text-sm text-gray-500">{booking.service.vendor.user.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Client</p>
            <p className="mt-2 font-semibold">{booking.customer.name}</p>
            <p className="text-sm text-gray-500">{booking.customer.email}</p>
          </div>
        </div>

        <hr className="my-8" />

        {/* Items */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wider text-gray-400">
              <th className="pb-3">Descriere</th>
              <th className="pb-3 text-right">Data serviciului</th>
              <th className="pb-3 text-right">Valoare</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-4 font-medium">{booking.service.title}</td>
              <td className="py-4 text-right text-gray-600">
                {new Date(booking.slotStart).toLocaleString("ro-RO", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </td>
              <td className="py-4 text-right font-semibold">{formatRON(booking.totalPriceRON)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="pt-4 text-right font-semibold uppercase text-gray-500">Total</td>
              <td className="pt-4 text-right text-lg font-bold text-indigo-700">{formatRON(booking.totalPriceRON)}</td>
            </tr>
          </tfoot>
        </table>

        <hr className="my-8" />

        {/* Payment info */}
        <div className="rounded-lg bg-gray-50 p-4 text-sm">
          <p className="font-medium text-gray-700">Metodă de plată: {booking.paymentType === "CARD" ? "Card bancar" : "Transfer bancar"}</p>
          <p className="mt-1 text-gray-500">Status: Plătit</p>
          <p className="mt-1 text-gray-500">Referință: {booking.transaction.id}</p>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Zervio SRL · CUI RO12345678 · support@zervio.ro · zervio.ro
        </p>
      </div>
    </div>
  );
}
