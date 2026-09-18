import React, { useState } from 'react';
import { X, Image as ImageIcon, Download, Copy, Check, ExternalLink, Share2 } from 'lucide-react';

interface SocialKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SocialKitModal: React.FC<SocialKitModalProps> = ({ isOpen, onClose }) => {
  const [copiedPost, setCopiedPost] = useState(false);

  if (!isOpen) return null;

  const samplePost = `❤️ Zadbaj o swoje serce i ciśnienie z nowoczesną, darmową aplikacją PULSIVIO! 🩺

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
    navigator.clipboard.writeText(samplePost);
    setCopiedPost(true);
    setTimeout(() => setCopiedPost(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-600/30">
              <Share2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Materiały na Social Media dla Pulsivio
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Gotowe do pobrania
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pobierz oficjalny Avatar i Baner na swój Facebook Fanpage (facebook.com/pulsivio)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Assets List */}
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative h-24 w-24 shrink-0 rounded-2xl overflow-hidden border-2 border-rose-500/40 shadow-xl bg-slate-900">
                <img
                  src="/social_avatar.jpg"
                  alt="Pulsivio Oficjalny Avatar"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-white text-base">
                  1. Avatar / Zdjęcie Profilowe
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Format kwadratowy (1024x1024), logo Pulsivio ze stetoskopem i sercem na ciemnogranatowym tle.
                </p>
                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                  <a
                    href="/social_avatar.jpg"
                    download="pulsivio_avatar.jpg"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Pobierz Avatar</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Facebook Post Template */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-white text-sm">
                2. Gotowy Post Powitalny na Facebooka
              </h3>
              <button
                type="button"
                onClick={handleCopyPost}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700"
              >
                {copiedPost ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedPost ? 'Skopiowano!' : 'Kopiuj treść'}</span>
              </button>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs text-slate-300 font-mono whitespace-pre-line max-h-48 overflow-y-auto leading-relaxed">
              {samplePost}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <a
                href="https://www.facebook.com/pulsivio/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:underline font-bold"
              >
                <span>Przejdź do facebook.com/pulsivio</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
