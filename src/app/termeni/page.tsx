import { Navbar } from "@/components/navbar";

export const metadata = { title: "Termeni și condiții — Zervio" };

export default function TermsPage() {
  return (
    <main className="min-h-screen pb-24">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold">Termeni și condiții</h1>
        <p className="mt-2 text-sm text-white/40">Ultima actualizare: iulie 2026</p>

        <div className="prose-invert mt-8 flex flex-col gap-6 text-sm leading-relaxed text-white/70">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">1. Despre platformă</h2>
            <p>
              Zervio este o platformă online de tip marketplace care conectează clienți (persoane fizice și companii)
              cu prestatori de servicii din România. Zervio facilitează rezervarea, comunicarea și plata serviciilor,
              dar nu este parte în contractul de prestări servicii încheiat între client și prestator.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">2. Contul de utilizator</h2>
            <p>
              Pentru a folosi platforma este necesar un cont. Ești responsabil pentru confidențialitatea datelor de
              autentificare și pentru toate acțiunile efectuate din contul tău. Conturile cu informații false pot fi
              suspendate fără notificare prealabilă.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">3. Rezervări și plăți</h2>
            <p>
              Rezervările se confirmă de către prestator. Plata se poate face prin card bancar sau transfer bancar.
              Anularea unei rezervări cu mai mult de 24 de ore înainte este gratuită. Anulările sub 24 de ore pot fi
              supuse unor penalizări conform politicii fiecărui prestator.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">4. Obligațiile prestatorilor</h2>
            <p>
              Prestatorii se obligă să furnizeze informații corecte despre servicii și prețuri, să onoreze rezervările
              confirmate și să emită documentele fiscale prevăzute de lege pentru serviciile prestate.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">5. Recenzii</h2>
            <p>
              Recenziile pot fi lăsate doar de clienți care au finalizat o rezervare. Recenziile false, ofensatoare
              sau care conțin date personale vor fi eliminate.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">6. Limitarea răspunderii</h2>
            <p>
              Zervio nu răspunde pentru calitatea serviciilor prestate de vendori, pentru pagubele rezultate din
              relația client-prestator sau pentru indisponibilitatea temporară a platformei.
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">7. Contact</h2>
            <p>
              Pentru orice întrebări legate de acești termeni ne poți scrie la{" "}
              <a href="mailto:support@zervio.ro" className="text-cyan-glow hover:underline">support@zervio.ro</a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
