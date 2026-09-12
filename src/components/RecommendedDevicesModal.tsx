import React, { useState, useMemo } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Stethoscope,
  Filter,
  Search,
  Tag,
  ArrowUpDown,
} from 'lucide-react';
import { RECOMMENDED_DEVICES, PriceCategory, RecommendedDevice } from '../data/recommendedDevices';
import { Language } from '../types';

interface RecommendedDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const RecommendedDevicesModal: React.FC<RecommendedDevicesModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PriceCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recommended' | 'priceAsc' | 'priceDesc'>('recommended');

  const categories: { id: PriceCategory; labelPl: string; labelEn: string; count: number }[] = [
    { id: 'all', labelPl: 'Wszystkie', labelEn: 'All', count: RECOMMENDED_DEVICES.length },
    { id: 'under70', labelPl: 'Do 70 zł', labelEn: 'Under 70 PLN', count: RECOMMENDED_DEVICES.filter((d) => d.category === 'under70').length },
    { id: 'under130', labelPl: 'Do 130 zł', labelEn: 'Under 130 PLN', count: RECOMMENDED_DEVICES.filter((d) => d.category === 'under130').length },
    { id: 'under200', labelPl: 'Do 200 zł', labelEn: 'Under 200 PLN', count: RECOMMENDED_DEVICES.filter((d) => d.category === 'under200').length },
    { id: 'premium', labelPl: 'Do 400 zł (Premium)', labelEn: 'Under 400 PLN', count: RECOMMENDED_DEVICES.filter((d) => d.category === 'premium').length },
  ];

  const filteredDevices = useMemo(() => {
    let list = RECOMMENDED_DEVICES.filter((device) => {
      const matchesCategory = selectedCategory === 'all' || device.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        device.name.toLowerCase().includes(query) ||
        device.brand.toLowerCase().includes(query) ||
        device.badge.toLowerCase().includes(query) ||
        device.keyFeatures.some((f) => f.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'priceAsc') {
      list = [...list].sort((a, b) => a.priceValue - b.priceValue);
    } else if (sortBy === 'priceDesc') {
      list = [...list].sort((a, b) => b.priceValue - a.priceValue);
    }

    return list;
  }, [selectedCategory, searchQuery, sortBy]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-col max-h-[94vh] cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-700 text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-inner">
              <Stethoscope className="h-5 w-5 text-white" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight text-white">
                {lang === 'pl' ? 'Polecane Ciśnieniomierze z Atestem' : 'Recommended Blood Pressure Monitors'}
              </h2>
              <p className="text-xs text-blue-100 font-medium">
                {lang === 'pl'
                  ? 'Katalog sprawdzonych aparatów naramiennych na każdą kieszeń'
                  : 'Clinically validated arm blood pressure monitors for every budget'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer shrink-0"
            title={lang === 'pl' ? 'Zamknij' : 'Close'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shrink-0 space-y-3">
          {/* Price Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span>{lang === 'pl' ? cat.labelPl : cat.labelEn}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'pl' ? 'Szukaj marki lub modelu (np. Omron, USB-C, arytmia)...' : 'Search brand or model...'}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 text-xs text-slate-600 dark:text-slate-400">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recommended' | 'priceAsc' | 'priceDesc')}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="recommended">{lang === 'pl' ? 'Najczęściej wybierane' : 'Recommended'}</option>
                <option value="priceAsc">{lang === 'pl' ? 'Cena: od najniższej' : 'Price: low to high'}</option>
                <option value="priceDesc">{lang === 'pl' ? 'Cena: od najwyższej' : 'Price: high to low'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto p-3 sm:p-6 space-y-4">
          {/* Medical advice note for seniors */}
          <div className="rounded-2xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/70 dark:bg-blue-950/40 p-3 sm:p-4 text-xs text-blue-950 dark:text-blue-200 flex items-start gap-2.5">
            <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">
                {lang === 'pl'
                  ? 'Zasada kardiologiczna: Zawsze wybieraj aparat naramienny'
                  : 'Cardiological standard: Always pick an upper-arm cuff'}
              </p>
              <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
                {lang === 'pl'
                  ? 'Polskie Towarzystwo Nadciśnienia Tętniczego (PTNT) zaleca wyłącznie ciśnieniomierze naramienne z uniwersalnym mankietem (do 36-42 cm). Wszystkie poniższe modele posiadają certyfikat wyrobu medycznego CE.'
                  : 'Upper-arm monitors provide accurate clinical measurements.'}
              </p>
            </div>
          </div>

          {filteredDevices.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs">
              {lang === 'pl' ? 'Brak modeli spełniających podane kryteria.' : 'No devices match your filter.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDevices.map((device) => (
                <div
                  key={device.id}
                  className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-4 sm:p-5 transition-all hover:border-blue-300 dark:hover:border-blue-700 space-y-3"
                >
                  {/* Device Title & Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black border mb-1.5 ${device.badgeColor}`}>
                        {device.badge}
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                        {device.name}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Producent: <strong>{device.brand}</strong>
                      </span>
                    </div>

                    <div className="sm:text-right shrink-0 bg-white dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                        Cena rynkowa:
                      </span>
                      <span className="text-sm sm:text-base font-black text-blue-600 dark:text-blue-400">
                        {device.priceEstimate}
                      </span>
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-200">Mankiet:</span> {device.cuffType}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-200">Atest:</span> {device.accuracyRating}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {device.keyFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Senior Note */}
                  <div className="text-[11px] text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-xl p-2.5">
                    <strong>💡 Ocena dla seniora:</strong> {device.seniorFriendlyNote}
                  </div>

                  {/* Call To Action Button with Affiliate Link */}
                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      Sprawdzona certyfikowana dystrybucja medyczna
                    </span>
                    <a
                      href={device.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <span>{lang === 'pl' ? 'Sprawdź oferty i porównaj ceny' : 'Check prices & availability'}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Transparent disclaimer */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed pt-2">
            ℹ️ {lang === 'pl'
              ? 'Wszystkie polecane modele to sprawdzone aparaty oscylometryczne z certyfikacją medyczną UE. Klikając w link, wspierasz dalszy rozwój darmowej aplikacji Pulsivio bez dodatkowych kosztów z Twojej strony.'
              : 'All recommended devices are clinically validated medical equipment.'}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-2 shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Łącznie: {filteredDevices.length} modeli
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {lang === 'pl' ? 'Zamknij' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
