import React, { useState } from 'react';
import { X, Check, Sparkles, Image as ImageIcon, Maximize2, Download, Smartphone, Play, ExternalLink, ShieldCheck, Heart, Eye } from 'lucide-react';
import { Language } from '../types';

export interface AvatarOption {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  url: string;
  tag?: string;
  isPlayReady?: boolean;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'pulsivio_font_geometric',
    title: '1. Geometric Tech Glow (Nowoczesny Bezszeryfowy)',
    subtitle: 'Szwajcarski sans-serif • Szafirowa poświata EKG • Zero udziwnień',
    desc: 'Nowoczesny, wyrazisty krój bezszeryfowy w stylu technologicznym. Perfekcyjnie wyważone litery z łagodnym zaokrągleniem i subtelną szafirową poświatą na krawędziach, dopasowaną do neonu EKG. Wyjątkowo czytelny nawet jako miniaturowa ikonka na smartfonie.',
    url: '/avatars/pulsivio_font_geometric.jpg',
    tag: '⭐ Nowość • Propozycja 1 (Geometric Tech)',
    isPlayReady: true,
  },
  {
    id: 'pulsivio_font_neonscript',
    title: '2. Neon Pulse Signature (Płynny Podpis Kardio)',
    subtitle: 'Kaligraficzny podpis z neonowej linii serca • Rubin & Cyjan • Miękkie łuki',
    desc: 'Napis Pulsivio zaprojektowany jak płynny, odręczny podpis kardio – wyrysowany ze świecącej linii pulsu. Ciepła rubinowa luminescencja, organiczne łagodne krzywe, unikalny i prestiżowy charakter.',
    url: '/avatars/pulsivio_font_neonscript.jpg',
    tag: '⭐ Nowość • Propozycja 2 (Płynny Podpis)',
    isPlayReady: true,
  },
  {
    id: 'pulsivio_font_luxury',
    title: '3. Luxury Editorial (Prestiżowy Szeryf Kliniczny)',
    subtitle: 'Dostojna czcionka szeryfowa • Platynowy blask • Wysoki autorytet',
    desc: 'Wyrafinowana typografia szeryfowa o wysokich walorach estetycznych. Delikatne proporcje, subtelne szeryfy i platynowo-rubinowy blask nadają aplikacji prestiżowy wygląd znany z renomowanych klinik kardiologicznych.',
    url: '/avatars/pulsivio_font_luxury.jpg',
    tag: '⭐ Nowość • Propozycja 3 (Prestiżowy Szeryf)',
    isPlayReady: true,
  },
  {
    id: 'pulsivio_font_rounded',
    title: '4. Rounded Neo Tech (Ciepłe Krzywe + Kropka-Serce nad „i”)',
    subtitle: 'Zaokrąglone litery • Kropka z rubinowego tętna • Przyjazny i czytelny',
    desc: 'Nowoczesna typografia o miękkich, przyjaznych łukach. Kropka nad literą „i” w postaci świecącej kropli rubinowego serca. Doskonała widoczność w małym rozmiarze ikony.',
    url: '/avatars/pulsivio_font_rounded.jpg',
    tag: '⭐ Nowość • Propozycja 4 (Neo Rounded)',
    isPlayReady: true,
  },
  {
    id: 'pulsivio_elegant_curve',
    title: '5. Pulsivio Elegant Curve (Wariant Bazowy)',
    subtitle: 'Płynna czcionka z małych liter • 100% Pełny Kwadrat • Rzeźbiarskie 3D P',
    desc: 'Wariant bazowy z małych liter (bez Caps Locka), z płynnymi krzywymi bez zbędnych udziwnień. Trójwymiarowa litera P spleciona ze świecącym rubinowym sercem i tętnem wypełnia cały kadr 1:1.',
    url: '/avatars/pulsivio_elegant_curve.jpg',
    tag: 'Wariant Bazowy',
    isPlayReady: true,
  },
  {
    id: 'pulsivio_pure_cardio',
    title: '6. Pure 3D Symbol (Bez Napisów • Maksymalny Znak)',
    subtitle: 'Czysty emblemat kliniczny • Wyłącznie trójwymiarowy znak kardio',
    desc: 'Opcja minimalistyczna bez żadnego podpisu tekstowego pod spodem – sam rzeźbiarski, świecący symbol 3D P z sercem i falą EKG na pełnym kadrze. Idealny na małe ekrany smartfonów.',
    url: '/avatars/pulsivio_pure_cardio.jpg',
    tag: 'Czysty Symbol 3D',
    isPlayReady: true,
  },
  {
    id: 'pulsivio_signature_p',
    title: '7. Pulsivio Signature P (Czysty Podpis • Bez Marginesów)',
    subtitle: 'Zaokrąglona czcionka • Rubin i Szafir • 100% Kadr',
    desc: 'Nowoczesny, zaokrąglony i minimalistyczny krój nazwy Pulsivio bez wielkich liter blokowych. Krystaliczne szkło 3D, laserowy puls i głębokie tło.',
    url: '/avatars/pulsivio_signature_p.jpg',
    tag: 'Styl Podpisu',
    isPlayReady: true,
  },
  {
    id: 'pulsivio_electric_heart',
    title: '8. Pulsivio Electric Heart (Tytan & Rubinowe EKG)',
    subtitle: 'Rzeźbiarskie 3D P • Laserowy neon • Pełny kadr 1:1',
    desc: 'Masywna, trójwymiarowa litera P w odcieniach szczotkowanego tytanu i błękitnego szkła, zintegrowana z laserowym pulsem serca.',
    url: '/avatars/pulsivio_electric_heart.jpg',
    tag: 'Tytan 3D',
    isPlayReady: true,
  },
];

interface AvatarSelectorModalProps {
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
  const [activeTab, setActiveTab] = useState<'googlePlay' | 'all'>('googlePlay');
  const [zoomImage, setZoomImage] = useState<AvatarOption | null>(null);

  if (!isOpen) return null;

  const currentOption = AVATAR_OPTIONS.find(
    (o) => currentAvatar.includes(o.url.replace('/avatars/', '').split('.')[0]) || currentAvatar === o.url
  ) || AVATAR_OPTIONS[0];

  const playCandidates = AVATAR_OPTIONS.filter((o) => o.isPlayReady);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border-2 border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-3.5 bg-gradient-to-r from-sky-50 via-indigo-50/40 to-purple-50/30 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-xs shrink-0">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {lang === 'pl' ? 'Logo i Awatar Pulsivio (Google Play)' : 'Pulsivio Logo & Avatars'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {lang === 'pl' 
                  ? 'Duży format HD, ikony pod sklep Google Play oraz podgląd na żywo' 
                  : 'HD large format, Google Play ready icons, and live preview'}
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-100/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('googlePlay')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'googlePlay'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Kandydaci na Google Play (Duży format)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Wszystkie warianty awatarów ({AVATAR_OPTIONS.length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-5 text-slate-800 dark:text-slate-200">

          {/* Active Avatar Highlight Banner */}
          <div className="rounded-3xl border-2 border-indigo-300/80 dark:border-indigo-700/80 bg-gradient-to-br from-indigo-50/90 via-slate-50 to-sky-50/80 dark:from-slate-800 dark:via-slate-800/90 dark:to-indigo-950/50 p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Clickable Large Zoomable Image */}
              <div 
                onClick={() => setZoomImage(currentOption)}
                className="group relative h-28 w-28 sm:h-32 sm:w-32 shrink-0 rounded-3xl overflow-hidden border-3 border-indigo-400 dark:border-indigo-500 shadow-xl bg-slate-950 ring-4 ring-indigo-100 dark:ring-indigo-950 cursor-pointer"
                title="Kliknij, aby powiększyć na pełny ekran"
              >
                <img
                  src={currentAvatar}
                  alt="Wybrany awatar"
                  referrerPolicy="no-referrer"
                  draggable={false}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-1 right-1 rounded-full bg-emerald-500 text-white p-1 shadow-xs ring-2 ring-white dark:ring-slate-900">
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
                <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                  <Maximize2 className="h-5 w-5 drop-shadow" />
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold mb-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Aktualnie aktywne logo w aplikacji</span>
                </div>
                <h3 translate="no" className="notranslate text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {currentOption.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {currentOption.desc}
                </p>

                {/* Actions & Mockups */}
                <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => setZoomImage(currentOption)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-sky-600" />
                    <span>Powiększ na pełny ekran</span>
                  </button>

                  <a
                    href={currentAvatar}
                    download="pulsivio_google_play_icon.jpg"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Pobierz plik JPG</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Realistic Mockups Showcase */}
            <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Android Home Screen App Icon Mockup */}
              <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-3 text-center flex flex-col items-center justify-center border border-slate-800 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 mb-2 flex items-center gap-1">
                  <Smartphone className="h-3 w-3" />
                  Makieta: Ekran główny Android
                </span>
                <div className="flex flex-col items-center gap-1.5 py-1">
                  <div className="h-14 w-14 rounded-2xl overflow-hidden shadow-lg border border-white/20 ring-2 ring-black/40">
                    <img
                      src={currentAvatar}
                      alt="Icon"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span translate="no" className="notranslate text-xs font-medium text-white/90 drop-shadow">
                    Pulsivio
                  </span>
                </div>
              </div>

              {/* Google Play Store Search Result Mockup */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                <div className="h-13 w-13 rounded-2xl overflow-hidden shadow-md shrink-0 border border-slate-100 dark:border-slate-700 bg-slate-950">
                  <img
                    src={currentAvatar}
                    alt="Play"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    Karta w Google Play
                  </span>
                  <h4 translate="no" className="notranslate text-xs font-bold text-slate-900 dark:text-white truncate">
                    Pulsivio: Dziennik Ciśnienia
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    <span className="font-bold text-amber-500">5.0 ★</span>
                    <span>Zdrowie i uroda</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: Google Play Store Flagship Candidates (Large Display) */}
          {activeTab === 'googlePlay' ? (
            <div className="space-y-4">
              {/* Special Card: Font & Effect Proposals for 'Pulsivio' */}
              <div className="rounded-3xl border-2 border-indigo-400/70 dark:border-indigo-600/70 bg-gradient-to-br from-indigo-50/90 via-sky-50/50 to-white dark:from-slate-800 dark:via-indigo-950/40 dark:to-slate-900 p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs shrink-0">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-indigo-950 dark:text-indigo-200">
                        🎨 Propozycje nowej czcionki nazwy Pulsivio (ten sam awatar 3D)
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        Trójwymiarowy emblemat kardio 3D P z sercem pozostaje bez zmian – kliknij poniżej, aby natychmiast przetestować 4 różne style typografii i efektów świetlnych:
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { id: 'pulsivio_font_geometric', name: '1. Geometric Tech', sub: 'Szwajcarski sans • Bez udziwnień' },
                    { id: 'pulsivio_font_neonscript', name: '2. Neon Signature', sub: 'Płynny odręczny podpis kardio' },
                    { id: 'pulsivio_font_luxury', name: '3. Luxury Serif', sub: 'Prestiżowy krój kliniczny' },
                    { id: 'pulsivio_font_rounded', name: '4. Neo Rounded', sub: 'Ciepłe krzywe + serce nad „i”' },
                  ].map((fontItem) => {
                    const matchOpt = AVATAR_OPTIONS.find((o) => o.id === fontItem.id);
                    const isSelected = currentAvatar.includes(fontItem.id);
                    return (
                      <button
                        key={fontItem.id}
                        type="button"
                        onClick={() => {
                          if (matchOpt) onSelectAvatar(matchOpt.url);
                        }}
                        className={`p-2.5 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? 'border-indigo-600 bg-white dark:bg-slate-800 shadow-md ring-2 ring-indigo-400/40'
                            : 'border-slate-200/90 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 hover:border-indigo-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-900 dark:text-white leading-tight">
                            {fontItem.name}
                          </span>
                          {isSelected && (
                            <span className="h-4 w-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                          {fontItem.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    Wszystkie warianty z dużą literą P i napisem Pulsivio
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Przygotowane pod kątem wymogów Google Play Console (kwadrat z zaokrągleniami, wysoka rozdzielczość)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {playCandidates.map((opt) => {
                  const isSelected = currentAvatar.includes(opt.url.replace('/avatars/', '').split('.')[0]) || currentAvatar === opt.url;
                  return (
                    <div
                      key={opt.id}
                      className={`relative rounded-3xl border-2 transition-all p-3.5 sm:p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 shadow-sm ring-2 ring-sky-300/40 dark:ring-sky-500/20'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
                      }`}
                    >
                      {/* Large HD Thumbnail */}
                      <div
                        onClick={() => setZoomImage(opt)}
                        className="group relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md bg-slate-950 cursor-pointer"
                        title="Kliknij, aby otworzyć powiększenie HD"
                      >
                        <img
                          src={opt.url}
                          alt={opt.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                          <Maximize2 className="h-4 w-4" />
                        </span>
                      </div>

                      <div className="flex-1 text-center sm:text-left min-w-0">
                        <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                          <h5 translate="no" className="notranslate text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            {opt.title}
                          </h5>
                          {opt.tag && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                              {opt.tag}
                            </span>
                          )}
                        </div>
                        <span className="block text-xs font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
                          {opt.subtitle}
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {opt.desc}
                        </p>

                        <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => onSelectAvatar(opt.url)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 hover:bg-sky-500 hover:text-white'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>{isSelected ? 'Aktualnie wybrane' : 'Ustaw to logo jako główne'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setZoomImage(opt)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Duży podgląd</span>
                          </button>

                          <a
                            href={opt.url}
                            download={`${opt.id}.jpg`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <Download className="h-3 w-3" />
                            <span>Zapisz JPG</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* TAB 2: All Available App Avatars */
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                  Wszystkie dostępne awatary ({AVATAR_OPTIONS.length}):
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AVATAR_OPTIONS.map((opt) => {
                  const isSelected = currentAvatar.includes(opt.url.replace('/avatars/', '').split('.')[0]) || currentAvatar === opt.url;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onSelectAvatar(opt.url)}
                      className={`group text-left relative flex flex-col p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 shadow-sm ring-2 ring-sky-300/40 dark:ring-sky-500/20'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative h-16 w-16 sm:h-18 sm:w-18 shrink-0 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md bg-slate-900 group-hover:scale-105 transition-transform">
                          <img
                            src={opt.url}
                            alt={opt.title}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                          {isSelected && (
                            <span className="absolute inset-0 bg-sky-500/20 flex items-center justify-center">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white shadow-xs">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                              </span>
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span translate="no" className="notranslate text-sm font-bold text-slate-900 dark:text-white leading-tight">
                              {opt.title}
                            </span>
                            {opt.tag && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                {opt.tag}
                              </span>
                            )}
                          </div>
                          <span className="block text-xs font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
                            {opt.subtitle}
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {opt.desc}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400">
                          {isSelected ? '✓ Aktualnie wybrany' : 'Kliknij, aby wybrać'}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 group-hover:bg-sky-100 group-hover:text-sky-800'
                          }`}
                        >
                          {isSelected ? 'Wybrany' : 'Ustaw'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Ustawienia zapisują się lokalnie w Twojej przeglądarce
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 text-xs sm:text-sm font-bold shadow-xs cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Gotowe
          </button>
        </div>

      </div>

      {/* Fullscreen HD Zoom Lightbox */}
      {zoomImage && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4 animate-fade-in"
          onClick={() => setZoomImage(null)}
        >
          <div 
            className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-center space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 rounded-full bg-slate-800 p-2 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950 border border-sky-800 text-sky-300 text-xs font-semibold">
              <Play className="h-3 w-3 fill-current" />
              Podgląd w wysokiej rozdzielczości (HD)
            </span>

            <div className="relative mx-auto h-64 w-64 sm:h-80 sm:w-80 rounded-3xl overflow-hidden border-4 border-slate-700 shadow-2xl bg-black">
              <img
                src={zoomImage.url}
                alt={zoomImage.title}
                referrerPolicy="no-referrer"
                draggable={false}
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <h3 translate="no" className="notranslate text-lg font-black text-white">
                {zoomImage.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                {zoomImage.desc}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onSelectAvatar(zoomImage.url);
                  setZoomImage(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 text-xs font-bold shadow-md cursor-pointer"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Ustaw jako aktywne logo</span>
              </button>

              <a
                href={zoomImage.url}
                download={`${zoomImage.id}.jpg`}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 text-xs font-bold border border-slate-700 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Pobierz plik</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
