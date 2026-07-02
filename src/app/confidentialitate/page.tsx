import { Navbar } from "@/components/navbar";

export const metadata = { title: "Politică de confidențialitate — Zervio" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen pb-24">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold">Politică de confidențialitate</h1>
        <p className="mt-2 text-sm text-white/40">Conform Regulamentului (UE) 2016/679 (GDPR)</p>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-white/70">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">1. Ce date colectăm</h2>
            <p>
              Colectăm datele pe care ni le furnizezi la înregistrare (nume, email, parolă criptată), datele companiei
              pentru conturile B2B (CUI, Reg. Com., sediu social), datele rezervărilor și mesajele trimise prin
              platformă. Nu stocăm date de card — plățile sunt procesate de furnizori autorizați.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">2. Cum folosim datele</h2>
            <p>
              Folosim datele pentru funcționarea platformei: crearea contului, procesarea rezervărilor, comunicarea
              între client și prestator, emiterea facturilor și trimiterea notificărilor legate de contul tău
              (confirmări, remindere). Nu vindem datele tale către terți.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">3. Cine are acces la date</h2>
            <p>
              Prestatorul vede datele necesare rezervării (nume, serviciu, dată). Furnizorii noștri tehnici (găzduire,
              bază de date, trimitere email) procesează datele strict pentru operarea platformei, pe baza unor acorduri
              de prelucrare conforme GDPR.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">4. Drepturile tale</h2>
            <p>
              Ai dreptul de acces, rectificare, ștergere („dreptul de a fi uitat&rdquo;), restricționare, portabilitate și
              opoziție. Pentru exercitarea acestor drepturi scrie-ne la{" "}
              <a href="mailto:privacy@zervio.ro" className="text-cyan-glow hover:underline">privacy@zervio.ro</a>.
              Ai de asemenea dreptul de a depune o plângere la ANSPDCP.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">5. Perioada de stocare</h2>
            <p>
              Păstrăm datele contului cât timp contul este activ. Datele facturilor se păstrează conform obligațiilor
              legale contabile (10 ani). La ștergerea contului, datele personale sunt anonimizate.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
