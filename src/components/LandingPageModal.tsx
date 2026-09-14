import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Smartphone,
  Mic,
  Heart,
  ShieldCheck,
  Stethoscope,
  Share2,
  Sparkles,
  ExternalLink,
  Download,
  Users,
  ArrowRight,
  Eye,
  Globe,
  Copy,
  Check,
  FileText,
  Sliders,
  Send,
  MessageSquare,
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'presentation' | 'facebookPost'>('presentation');
  const [copiedPost, setCopiedPost] = useState<boolean>(false);

  if (!isOpen) return null;

  const fbPostContent = `❤️ Zadbaj o swoje serce i ciśnienie z nowoczesną, darmową aplikacją PULSIVIO! 🩺

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

  const handleCopyPost = () => {
    navigator.clipboard.writeText(fbPostContent);
    setCopiedPost(true);
    setTimeout(() => setCopiedPost(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-sky-50 via-slate-50 to-indigo-50/50 dark:from-slate-900 dark:to-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-slate-950 overflow-hidden border border-rose-500/30 p-0.5 shadow-sm">
              <img src="/avatars/pulsivio_official_brand.jpg" alt="Pulsivio Logo" className="h-full w-full object-cover rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
                  Pulsivio
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2.5 py-0.5 rounded-full">
                  Prezentacja & Materiały FB
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Oficjalna prezentacja dla pacjentów i generator posta na Facebooka
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('presentation')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'presentation'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Prezentacja
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('facebookPost')}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'facebookPost'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>Post na FB</span>
                <Sparkles className="h-3 w-3 text-amber-300" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: PRESENTATION */}
          {activeTab === 'presentation' && (
            <div className="space-y-6 animate-fade-in">
              {/* Hero Banner Section */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-950">
                <img
                  src="/pulsivio_baner_fb.jpg"
                  alt="Pulsivio - Twój Cyfrowy Dziennik Ciśnień"
                  className="w-full h-auto object-cover max-h-72 sm:max-h-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-6">
                  <div className="max-w-xl">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider shadow-sm mb-2">
                      <Sparkles className="w-3.5 h-3.5" /> Nowa Generacja Dziennika Kardiologicznego
                    </span>
                    <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">
                      Pulsivio — Kontrola ciśnienia bez stresu i papierków
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-200 mt-1.5 leading-relaxed">
                      Zaprojektowany z myślą o seniorach, pacjentach kardiologicznych oraz ich lekarzach. Działa na każdym telefonie i komputerze.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 text-white shadow-md">
                <div className="space-y-0.5 text-center sm:text-left">
                  <h3 className="font-black text-sm sm:text-base">Chcesz zacząć korzystać z aplikacji?</h3>
                  <p className="text-xs text-rose-100">
                    Nie musisz nic instalować z Google Play / App Store – działa od razu w przeglądarce!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenApp();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-rose-600 hover:bg-rose-50 text-xs font-black shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <span>Otwórz Dziennik</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Key Advantages Bento Grid */}
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-3">
                  Dlaczego Pulsivio wyróżnia się na tle innych aplikacji?
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  
                  {/* Feature 1 */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-2">
                    <div className="h-9 w-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 flex items-center justify-center">
                      <Mic className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Asystent Głosowy „Pulsi”</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Powiedz: <em>„Pulsi, zapisz 120 na 80 puls 68”</em>, a asystent automatycznie rozpozna i zapisze pomiar w dzienniku.
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-2">
                    <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                      <Eye className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Dla Seniorów & Słabowidzących</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Tryb wielkiej czcionki, uproszczony interfejs, ogromne przyciski o wysokim kontraście i synteza mowy odczytująca wyniki.
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-2">
                    <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Dedykowany Panel Lekarza</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Generowanie raportów PDF zgodnych ze standardami PTNT / ESH oraz bezpośredni link dostępu dla kardiologa.
                    </p>
                  </div>

                  {/* Feature 4 */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-2">
                    <div className="h-9 w-9 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">PC ↔ Telefon bez kabli</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Synchronizacja w czasie rzeczywistym kodem QR lub 6-znakowym kodem pokoju. Działa na telefonie, tablecie i laptopie.
                    </p>
                  </div>

                  {/* Feature 5 */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-2">
                    <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                      <Globe className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Wielojęzyczność (8 języków)</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Pełne wsparcie dla języków: Polski, Angielski, Niemiecki, Hiszpański, Francuski, Włoski, Portugalski, Rosyjski.
                    </p>
                  </div>

                  {/* Feature 6 */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-2">
                    <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Prywatność i Bezpieczeństwo</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Twoje dane są bezpiecznie przechowywane. Asystent wspiera Cię w pomiarach i pomaga wyciszyć się przed badaniem.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FACEBOOK READY POST & GRAPHICS */}
          {activeTab === 'facebookPost' && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-blue-950 dark:text-blue-100">
                    Gotowy Post Promocyjny na Facebooka
                  </h3>
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    Skopiuj poniższą treść i opublikuj na swoim fanpage'u <strong>facebook.com/pulsivio</strong>!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyPost}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  {copiedPost ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedPost ? 'Skopiowano treść!' : 'Kopiuj treść posta'}</span>
                </button>
              </div>

              {/* Mock Facebook Post Box */}
              <div className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-200 shadow-2xs">
                    <img src="/avatars/pulsivio_official_brand.jpg" alt="Pulsivio Avatar" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Pulsivio</h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Opublikowano teraz • 🌐 Publiczne</span>
                  </div>
                </div>

                <div className="whitespace-pre-line text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  {fbPostContent}
                </div>

                {/* Attached Banner Preview */}
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <img src="/pulsivio_baner_fb.jpg" alt="Pulsivio FB Banner" className="w-full h-auto object-cover" />
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">pulsivio.onrender.com</span>
                      <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">Pulsivio — Darmowy Dziennik Ciśnienia Krwi</h5>
                    </div>
                    <a
                      href="https://pulsivio.onrender.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold"
                    >
                      Otwórz
                    </a>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href="/pulsivio_baner_fb.jpg"
                    download="pulsivio_baner_fb.jpg"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Pobierz grafikę banera</span>
                  </a>
                  <a
                    href="/avatars/pulsivio_official_brand.jpg"
                    download="pulsivio_avatar.jpg"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Pobierz logo / avatar</span>
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>© 2026 Pulsivio — facebook.com/pulsivio</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenApp();
            }}
            className="font-bold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
          >
            Przejdź do aplikacji →
          </button>
        </div>

      </div>
    </div>
  );
};
