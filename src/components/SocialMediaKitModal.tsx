import React from 'react';
import { X, Download, Image as ImageIcon, ExternalLink, Sparkles, Check } from 'lucide-react';

interface SocialMediaKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SocialMediaKitModal: React.FC<SocialMediaKitModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-600/30">
              <ImageIcon className="h-5 w-5" />
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
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Element 1: Avatar */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative h-28 w-28 shrink-0 rounded-2xl overflow-hidden border-2 border-rose-500/40 shadow-xl shadow-rose-950/40 bg-slate-900">
                <img
                  src="/social_avatar.jpg"
                  alt="Pulsivio Oficjalny Avatar"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="font-bold text-white text-base">1. Avatar / Zdjęcie Profilowe</h3>
                  <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">1:1 (Kwadrat)</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Oficjalny, prestiżowy logotyp z wyraźną nazwą <strong>Pulsivio</strong> i neonowym sercem kardiologicznym 3D.
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <a
                    href="/social_avatar.jpg"
                    download="pulsivio_avatar.jpg"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Pobierz Avatar (JPG)
                  </a>
                  <a
                    href="/social_avatar.jpg"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Otwórz w pełnym rozmiarze
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Element 2: Baner */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">2. Baner w Tle (Cover Photo)</h3>
                  <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">16:9 (Panoramiczny)</span>
                </div>
                <a
                  href="/social_banner.jpg"
                  download="pulsivio_banner.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  <Download className="h-3.5 w-3.5" />
                  Pobierz Baner (JPG)
                </a>
              </div>
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-slate-700/60 shadow-lg bg-slate-900">
                <img
                  src="/social_banner.jpg"
                  alt="Pulsivio Oficjalny Baner"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-xs text-slate-400">
                Bogaty w treść baner z nazwą Pulsivio, wyróżnionymi kluczowymi funkcjami (Asystent AI, Raport A4, Synchronizacja, Tryb Seniora), wskaźnikiem 120/80 oraz adresem strony.
              </p>
            </div>
          </div>

          {/* Wskazówka jak ustawić */}
          <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-3 flex items-start gap-2.5 text-xs text-blue-200">
            <Sparkles className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Jak ustawić na Facebooku:</strong>
              Kliknij przycisk <strong>„Pobierz Avatar”</strong> oraz <strong>„Pobierz Baner”</strong>. Następnie wejdź na swój fanpage <a href="https://www.facebook.com/pulsivio/" target="_blank" rel="noreferrer" className="underline font-bold text-blue-300">facebook.com/pulsivio</a>, kliknij ikonę aparatu przy obecnym zdjęciu i wgraj pobrane pliki.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-800 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
