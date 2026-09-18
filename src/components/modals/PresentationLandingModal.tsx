import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Heart, 
  Mic, 
  FileText, 
  Smartphone, 
  ShieldCheck, 
  Check, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Coffee
} from 'lucide-react';

interface PresentationLandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp?: () => void;
}

export const PresentationLandingModal: React.FC<PresentationLandingModalProps> = ({
  isOpen,
  onClose,
  onOpenApp
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const marketingText = `❤️ Zadbaj o swoje serce i ciśnienie z nowoczesną, darmową aplikacją PULSIVIO! 🩺

Zamiast zgubionych kartek w notesie i niewyraźnych zapisków – poznaj Pulsivio, Twój osobisty cyfrowy dziennik ciśnienia i pulsu.

Dlaczego warto wypróbować Pulsivio?
✅ Inteligentny Asystent Głosowy „Pulsi” – wystarczy powiedzieć np. „Pulsi, zapisz 120 na 80 puls 68”, a aplikacja zrobi resztę za Ciebie!
✅ Dedykowany Tryb Seniora – ogromne litery, wysoki kontrast, zero zbędnych rozpraszaczy.
✅ Gotowe raporty PDF dla Lekarza – wygeneruj podsumowanie zgodne ze standardami PTNT jednym kliknięciem przed wizytą u kardiologa.
✅ Synchronizacja PC ↔ Telefon bez kabli – wpisujesz na komputerze, a pomiary masz od razu w kieszeni na smartfonie.
✅ 100% Bezpieczeństwa i Prywatności – żadnych uciążliwych reklam, pełne poszanowanie danych Twoich i Twoich bliskich.

👉 Wypróbuj bezpłatnie już teraz w przeglądarce (na komputerze lub telefonie):
🌐 https://pulsivio.onrender.com

Polub nasz profil @pulsivio, udostępnij bliskim seniorom i bądź na bieżąco ze zdrowiem! 💙
#pulsivio #zdrowie #serce #nadcisnienie #kardiologia #zdrowysenior #dziennikcisnienia #polskaaplikacja #zdrowie2026`;

  const handleCopy = () => {
    navigator.clipboard.writeText(marketingText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-sky-50 via-slate-50 to-indigo-50/50 dark:from-slate-900 dark:to-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Heart className="h-5 w-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-lg text-slate-900 dark:text-white">
                  Pulsivio — Prezentacja & O Aplikacji
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  Wersja Oficjalna
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Wszystkie unikalne funkcje wdrożone dla Twoich pacjentów i bliskich
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-700 dark:text-slate-300">
          {/* Key Value Proposition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
              <div className="flex items-center gap-2.5 mb-2">
                <Mic className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Asystent Głosowy „Pulsi”
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Mów naturalnie: <em>„120 na 80 puls 68 rano”</em>. Aplikacja natychmiast wyodrębni wartości i zapisze pomiar bez ręcznego wpisywania cyfr.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
              <div className="flex items-center gap-2.5 mb-2">
                <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Dedykowany Tryb Seniora
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Wielkie cyfry widoczne z odległości 2 metrów, czytelne komunikaty kolorystyczne i lektor czytający wynik pomiaru na głos.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
              <div className="flex items-center gap-2.5 mb-2">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Raport A4 & Portal Lekarza
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Gotowy wydruk do teczki kardiologa z wyliczonym ciśnieniem tętna (PP), średnim tętniczym (MAP) i klasyfikacją zaleceń PTNT.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40">
              <div className="flex items-center gap-2.5 mb-2">
                <Smartphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Synchronizacja PC ↔ Telefon
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Wpisuj wygodnie na dużym monitorze komputera, a w gabinecie u lekarza pokaż telefon – wszystko synchronizuje się bez kabli.
              </p>
            </div>
          </div>

          {/* Marketing Copy Box */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Oficjalny tekst promocyjny do skopiowania na grupy i social media:
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-bold cursor-pointer transition-all"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Skopiowano!' : 'Kopiuj cały tekst'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-sans whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {marketingText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between">
          <a
            href="https://pulsivio.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            <span>Otwórz wdrożoną wersję: pulsivio.onrender.com</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenApp) onOpenApp();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
          >
            <span>Przejdź do Dziennika</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
