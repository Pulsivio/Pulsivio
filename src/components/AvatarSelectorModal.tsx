import React, { useState, useRef } from 'react';
import {
  X,
  Check,
  Upload,
  Sparkles,
  Maximize2,
  Download,
  Smartphone,
  ShieldCheck,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Language } from '../types';

export interface AvatarSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSelectAvatar: (url: string) => void;
  lang: Language;
}

export const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSelectAvatar,
  lang,
}) => {
  const [isUploadingGlobal, setIsUploadingGlobal] = useState<boolean>(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const officialAvatar = '/avatars/pulsivio_official_brand.jpg';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage(lang === 'pl' ? 'Wybierz plik graficzny (JPG, PNG, WEBP).' : 'Please choose an image file.');
      return;
    }
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewImage(result);
      // Automatically apply locally
      onSelectAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDeployGlobal = async () => {
    if (!previewImage) return;
    try {
      setIsUploadingGlobal(true);
      setErrorMessage(null);
      setUploadSuccessMessage(null);

      const res = await fetch('/api/admin/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: previewImage }),
      });

      if (!res.ok) {
        throw new Error('Błąd serwera podczas zapisywania awatara.');
      }

      const data = await res.json();
      const updatedUrl = data.url || officialAvatar;
      onSelectAvatar(updatedUrl);

      setUploadSuccessMessage(
        lang === 'pl'
          ? '🎉 Sukces! Nowe zdjęcie zostało wdrożone globalnie na serwerze i jest teraz widoczne dla wszystkich odwiedzających stronę!'
          : '🎉 Success! New avatar deployed globally and is now visible to all site visitors!'
      );
      setTimeout(() => setUploadSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Nie udało się wdrożyć zdjęcia.');
    } finally {
      setIsUploadingGlobal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border-2 border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-3.5 bg-gradient-to-r from-sky-50 via-indigo-50/40 to-purple-50/30 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-xs shrink-0">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {lang === 'pl' ? 'Logo i Awatar Pulsivio' : 'Pulsivio Logo & Avatar'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {lang === 'pl'
                  ? 'Wgraj własne zdjęcie lub użyj oficjalnego logotypu marki'
                  : 'Upload your custom photo or use the official brand logo'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
            title="Zamknij"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-800 dark:text-slate-200">
          
          {/* Notifications */}
          {uploadSuccessMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-start gap-3 animate-fade-in">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200 leading-snug">
                {uploadSuccessMessage}
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 flex items-start gap-3 animate-fade-in">
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200 leading-snug">
                {errorMessage}
              </p>
            </div>
          )}

          {/* SECTION 1: UPLOAD CUSTOM PHOTO (PRIMARY) */}
          <div className="rounded-3xl border-2 border-indigo-200 dark:border-indigo-800/70 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/50 dark:from-slate-800/80 dark:via-slate-900 dark:to-indigo-950/40 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                <Upload className="h-4 w-4" />
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {lang === 'pl' ? 'Wgraj własne zdjęcie / logo' : 'Upload custom photo / logo'}
              </h3>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                {lang === 'pl' ? 'Polecane' : 'Recommended'}
              </span>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-100/50 dark:bg-indigo-950/60 scale-[1.01]'
                  : 'border-slate-300 hover:border-indigo-400 bg-white/70 hover:bg-indigo-50/30 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 flex items-center justify-center mb-2 shadow-xs">
                <Upload className="h-6 w-6" />
              </div>

              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'pl'
                  ? 'Kliknij tutaj lub przeciągnij plik ze zdjęciem'
                  : 'Click here or drag & drop an image file'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Obsługiwane formaty: JPG, PNG, WEBP (optymalnie format 1:1 kwadrat)
              </p>
            </div>

            {/* If a new custom photo was uploaded / preview is available */}
            {previewImage && (
              <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 animate-fade-in">
                <div className="relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden border-2 border-indigo-400 shadow-md bg-slate-950">
                  <img
                    src={previewImage}
                    alt="Podgląd wgranego zdjęcia"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 rounded-full bg-emerald-500 text-white p-0.5">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                    ✓ Zdjęcie wczytane poprawnie
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Możesz jednym kliknięciem zapisać je na stałe na serwerze, aby każdy odwiedzający stronę je widział.
                  </p>

                  <div className="mt-2.5 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      disabled={isUploadingGlobal}
                      onClick={handleDeployGlobal}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingGlobal ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Zapisywanie na serwerze...</span>
                        </>
                      ) : (
                        <>
                          <Globe className="h-3.5 w-3.5" />
                          <span>Wdróż globalnie dla wszystkich</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectAvatar(previewImage)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Ustaw tylko u mnie</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: OFFICIAL BRAND AVATAR */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div
                onClick={() => setIsZoomOpen(true)}
                className="group relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-700 shadow-md bg-slate-950 cursor-pointer"
                title="Kliknij, aby powiększyć"
              >
                <img
                  src={officialAvatar}
                  alt="Oficjalny Logotyp Pulsivio"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                  <Maximize2 className="h-5 w-5 drop-shadow" />
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold mb-1">
                  <ShieldCheck className="h-3 w-3 text-sky-600" />
                  <span>Domyślny Oficjalny Logotyp Pulsivio</span>
                </div>

                <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  👑 Oficjalny Logotyp Pulsivio (Nowy)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Zaprojektowany z napisem Pulsivio, trójwymiarowym świecącym sercem i linią EKG. Zgodny z materiałami promocyjnymi i postami na Facebooku.
                </p>

                <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectAvatar(officialAvatar);
                      setUploadSuccessMessage(lang === 'pl' ? 'Wybrano oficjalny logotyp Pulsivio.' : 'Official logo selected.');
                      setTimeout(() => setUploadSuccessMessage(null), 3000);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentAvatar === officialAvatar || currentAvatar.includes('pulsivio_official_brand')
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>
                      {currentAvatar === officialAvatar || currentAvatar.includes('pulsivio_official_brand')
                        ? 'Aktualnie wybrane'
                        : 'Wybierz ten logotyp'}
                    </span>
                  </button>

                  <a
                    href={officialAvatar}
                    download="pulsivio_logo_official.jpg"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Pobierz plik JPG</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Smart mockups preview */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
                <Smartphone className="h-4 w-4 text-sky-500 mb-1" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Podgląd na telefonie</span>
                <span className="text-[10px] text-slate-500">Ikona aplikacji PWA</span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
                <Globe className="h-4 w-4 text-emerald-500 mb-1" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Widoczność w sieci</span>
                <span className="text-[10px] text-slate-500">Facebook & przeglądarka</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 dark:border dark:border-slate-700 text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {lang === 'pl' ? 'Zamknij' : 'Close'}
          </button>
        </div>
      </div>

      {/* Fullscreen Zoom Lightbox */}
      {isZoomOpen && (
        <div
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg animate-fade-in cursor-pointer"
        >
          <div className="relative max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <img
              src={officialAvatar}
              alt="Powiększone logo"
              className="w-full h-auto object-contain"
            />
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
