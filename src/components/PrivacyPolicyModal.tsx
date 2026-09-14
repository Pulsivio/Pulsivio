import React from 'react';
import { X, ShieldCheck, Lock, Eye, FileText, ExternalLink } from 'lucide-react';
import { Language } from '../types';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              {lang === 'pl' ? 'Polityka Prywatności i Plików Cookies' : 'Privacy & Cookie Policy'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs">
            <strong>Krótko i przejrzyście:</strong> Twoje dane medyczne (pomiary ciśnienia krwi, tętno, notatki o lekach) są przechowywane w pierwszej kolejności <strong>lokalnie w Twoim urządzeniu</strong> (Local Storage). Nie sprzedajemy ani nie profilujemy Twoich danych wrażliwych.
          </div>

          <section className="space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">1. Administrator Danych</h3>
            <p>
              Aplikacja <strong>Pulsivio</strong> jest niezależnym narzędziem do samokontroli i ewidencji ciśnienia tętniczego krwi. Wszelkie zapytania dotyczące prywatności można kierować bezpośrednio do twórcy.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">2. Bezpieczeństwo i Przechowywanie Danych</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Pomiary ciśnienia:</strong> Domyślnie zapisywane są bezpośrednio w pamięci Twojej przeglądarki (Local Storage).</li>
              <li><strong>Kopia w chmurze (Synchronizacja PC ↔ Smartfon):</strong> Jeśli korzystasz z 6-cyfrowego kodu parowania lub konta, dane przesyłane są w bezpiecznym, szyfrowanym połączeniu SSL/TLS.</li>
              <li><strong>Eksport dla Lekarza:</strong> Wygenerowane raporty PDF lub linki dla lekarza są tworzone lokalnie na Twoim urządzeniu.</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">3. Reklamy Google AdSense i Pliki Cookies</h3>
            <p>
              W celu utrzymania darmowego działania aplikacji i serwerów, w serwisie mogą być wyświetlane nieinwazyjne reklamy dostarczane przez <strong>Google LLC (Google AdSense)</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dostawcy zewnętrzni, w tym Google, używają plików cookie do wyświetlania reklam na podstawie poprzednich odwiedzin użytkownika w tej lub innych witrynach.</li>
              <li>Użytkownicy mogą zrezygnować ze spersonalizowanych reklam w <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ustawieniach reklam Google</a>.</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">4. Prawa Użytkownika (RODO / GDPR)</h3>
            <p>
              Masz pełne prawo do wglądu w swoje dane, ich pobrania (plik JSON / CSV), modyfikacji oraz całkowitego usunięcia jednym kliknięciem w Ustawieniach aplikacji.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">5. Zastrzeżenie Medyczne</h3>
            <p className="text-rose-700 dark:text-rose-400 font-medium">
              Pulsivio jest narzędziem pomocniczym i nie zastępuje profesjonalnej porady lekarskiej, diagnozy ani leczenia. W sytuacjach zagrożenia życia zawsze należy niezwłocznie wezwać pogotowie ratunkowe (112 lub 999).
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 dark:border dark:border-slate-700 text-white font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {lang === 'pl' ? 'Rozumiem i akceptuję' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
