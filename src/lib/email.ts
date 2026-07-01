import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "Zervio <notificari@zervio.ro>";

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY lipsă — nu trimit "${subject}" către ${to}`);
    return;
  }

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (error) {
    console.error("[email] Trimitere eșuată:", error);
  }
}

export async function sendBookingConfirmationEmail(params: {
  to: string;
  customerName: string;
  serviceName: string;
  vendorName: string;
  slotStart: Date;
  totalPriceRON: number;
}) {
  const { to, customerName, serviceName, vendorName, slotStart, totalPriceRON } = params;
  await send(
    to,
    `Rezervare confirmată — ${serviceName}`,
    `<p>Salut ${customerName},</p>
     <p>Rezervarea ta pentru <strong>${serviceName}</strong> la <strong>${vendorName}</strong> a fost înregistrată.</p>
     <p>Data: ${slotStart.toLocaleString("ro-RO")}<br/>Total: ${totalPriceRON} RON</p>
     <p>Mulțumim că folosești Zervio!</p>`
  );
}

export async function sendNewBookingVendorEmail(params: {
  to: string;
  vendorName: string;
  serviceName: string;
  customerName: string;
  slotStart: Date;
}) {
  const { to, vendorName, serviceName, customerName, slotStart } = params;
  await send(
    to,
    `Rezervare nouă — ${serviceName}`,
    `<p>Salut ${vendorName},</p>
     <p>Ai o rezervare nouă de la <strong>${customerName}</strong> pentru <strong>${serviceName}</strong>.</p>
     <p>Data: ${slotStart.toLocaleString("ro-RO")}</p>`
  );
}

export async function sendRFQOfferEmail(params: {
  to: string;
  customerName: string;
  rfqTitle: string;
  vendorName: string;
  priceRON: number;
}) {
  const { to, customerName, rfqTitle, vendorName, priceRON } = params;
  await send(
    to,
    `Ofertă nouă pentru "${rfqTitle}"`,
    `<p>Salut ${customerName},</p>
     <p><strong>${vendorName}</strong> ți-a trimis o ofertă de <strong>${priceRON} RON</strong> pentru cererea ta "${rfqTitle}".</p>
     <p>Intră în contul tău Zervio pentru a o vedea.</p>`
  );
}

export async function sendBookingCancelledEmail(params: {
  to: string;
  name: string;
  serviceName: string;
  slotStart: Date;
}) {
  const { to, name, serviceName, slotStart } = params;
  await send(
    to,
    `Rezervare anulată — ${serviceName}`,
    `<p>Salut ${name},</p>
     <p>Rezervarea pentru <strong>${serviceName}</strong> din <strong>${slotStart.toLocaleString("ro-RO")}</strong> a fost anulată.</p>
     <p>Dacă ai întrebări, contactează-ne la support@zervio.ro.</p>`
  );
}

export async function sendRFQOfferDecisionEmail(params: {
  to: string;
  vendorName: string;
  rfqTitle: string;
  decision: "ACCEPTED" | "REJECTED";
}) {
  const { to, vendorName, rfqTitle, decision } = params;
  const accepted = decision === "ACCEPTED";
  await send(
    to,
    `Oferta ta a fost ${accepted ? "acceptată" : "respinsă"} — ${rfqTitle}`,
    `<p>Salut ${vendorName},</p>
     <p>Oferta ta pentru cererea <strong>${rfqTitle}</strong> a fost <strong>${accepted ? "acceptată" : "respinsă"}</strong>.</p>
     ${accepted ? "<p>Intră în contul Zervio pentru a finaliza comanda.</p>" : ""}`
  );
}
