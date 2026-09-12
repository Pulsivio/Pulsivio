import React from 'react';
import { X, CheckCircle2, Smartphone, Mic, Heart, ShieldCheck, Stethoscope, Share2, Sparkles, ExternalLink, Download, Users, ArrowRight, Eye, Globe } from 'lucide-react';
import { Language } from '../types';

interface LandingPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenApp: () => void;
}

export const LandingPageModal: React.FC<LandingPageModalProps> = ({
  isOpen,
  onClose,
  lang,
  onOpenApp,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-slate-950 overflow-hidden border border-rose-500/30 p-0.5">
              <img src="/avatars/original_pulsify.png" alt="Pulsivio Logo" className="h-full w-full object-cover rounded-lg" />
            </div>
            <div>
              <span className="font-black text-slate-900 dark:text-white tracking-tight text-base">Pulsivio</span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                Prezentacja Projektu
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Hero Banner Section */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-950">
            <img
              src="/pulsivio_baner_fb.jpg"
              alt="Pulsivio - Twój Cyfrowy Dziennik Ciśnień"
              className="w-full h-auto object-cover max-h-72 sm:max-h-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-6">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[11px] font-black uppercase tracking-wider shadow-sm mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Nowa Generacja Dziennika Kardiologicznego
                </span>
                <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">
                  Pulsivio — Twój Cyfrowy Dziennik Ciśnień
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 mt-1.5 leading-relaxed">
                  Stworzony dla każdego przedziału wiekowego, dedykowany również seniorom i osobom słabowidzącym z inteligentnym asystentem głosowym.
                </p>
                <div className="mt-3.5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenApp();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Otwórz Dziennik</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <a
                    href="https://buycoffee.to/pulsivio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm transition-all"
                  >
                    <span>Wesprzyj Twórcę (BLIK)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Key Advantages Bento Grid */}
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-3">
              Dlaczego Pulsivio wyróżnia się na tle zwykłych aplikacji?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              
              {/* Feature 1 */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-2">
                <div className="h-9 w-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Asystent Głosowy AI</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Wystarczy powiedzieć np. <em>"129/85/78 przed tabletkami"</em> lub <em>"120 na 80 puls 70"</em>, a asystent automatycznie rozpozna i zapisze pomiar w dzienniku.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-2">
                <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Dla Osób Słabowidzących</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tryb wielkiej czcionki, uproszczony interfejs seniora, ogromne przyciski o wysokim kontraście i synteza mowy odczytująca wyniki.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-2">
                <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Dedykowany Panel Lekarza</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Generowanie raportów PDF zgodnych ze standardami PTNT / ESH oraz bezpośredni kod dostępu dla lekarza bez konieczności instalacji czegokolwiek.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-2">
                <div className="h-9 w-9 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">PC ↔ Telefon bez kabli</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Synchronizacja w czasie rzeczywistym kodem QR lub 6-znakowym kodem pokoju. Działa na komputerze, tablecie, iPhone i Androidzie jako PWA.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-2">
                <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Wielojęzyczność</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pełne wsparcie dla 8 języków (Polski, Angielski, Niemiecki, Hiszpański, Francuski, Włoski, Portugalski, Rosyjski) wraz z głosowym asystentem.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-2">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Prywatność i Bezpieczeństwo</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Dane pacjenta są szyfrowane i przechowywane bezpiecznie. Asystent nigdy nie udziela porad lekarskich, zawsze rekomendując kontakt z lekarzem.
                </p>
              </div>

            </div>
          </div>

          {/* Social Media & Support Widget Section */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-blue-50/40 dark:from-slate-800/80 dark:to-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Wspieraj rozwój niezależnego projektu Pulsivio</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Pulsivio jest tworzone z pasji dla zdrowia milionów osób. Jeśli aplikacja Ci pomaga, postaw symboliczną kawę!
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://buycoffee.to/pulsivio"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
              >
                🇵🇱 BuyCoffee (BLIK)
              </a>
              <a
                href="https://buymeacoffee.com/pulsivio"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all"
              >
                🌍 BuyMeACoffee (Karta)
              </a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>© 2026 Pulsivio — Twój Cyfrowy Dziennik Ciśnień</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenApp();
            }}
            className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Przejdź do aplikacji →
          </button>
        </div>

      </div>
    </div>
  );
};
