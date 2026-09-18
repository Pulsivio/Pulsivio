import React, { useState } from 'react';
import { CERTIFIED_MONITORS, MarketAnalysisMonitor } from '../../data/certifiedMonitors';
import { X, ShieldCheck, ExternalLink, Check, AlertCircle, Star } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
}

export const RecommendedMonitorsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedRange, setSelectedRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'price-asc' | 'price-desc'>('recommended');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load partner tag strictly if configured by user in Admin Panel; otherwise empty (clean direct URLs)
  const [partnerTag] = useState<string>(() => {
    try {
      return localStorage.getItem('pulsivio_partner_tag') || '';
    } catch {
      return '';
    }
  });

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: `Wszystkie (50-400 zł)`, count: CERTIFIED_MONITORS.length },
    { id: '50-90', label: '50 - 90 zł (Budżetowe)', count: CERTIFIED_MONITORS.filter(d => d.priceRange === '50-90').length },
    { id: '90-160', label: '90 - 160 zł (Średnia klasa)', count: CERTIFIED_MONITORS.filter(d => d.priceRange === '90-160').length },
    { id: '160-260', label: '160 - 260 zł (Mankiet 360°)', count: CERTIFIED_MONITORS.filter(d => d.priceRange === '160-260').length },
    { id: '260-400', label: '260 - 400 zł (Premium / AFIB)', count: CERTIFIED_MONITORS.filter(d => d.priceRange === '260-400').length },
  ];

  let filteredDevices = CERTIFIED_MONITORS.filter(device => {
    const matchesCat = selectedRange === 'all' || device.priceRange === selectedRange;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      device.name.toLowerCase().includes(query) || 
      device.brand.toLowerCase().includes(query) ||
      device.keyFeatures.some(f => f.toLowerCase().includes(query));
    return matchesCat && matchesSearch;
  });

  if (sortBy === 'price-asc') {
    filteredDevices = [...filteredDevices].sort((a, b) => a.priceValue - b.priceValue);
  } else if (sortBy === 'price-desc') {
    filteredDevices = [...filteredDevices].sort((a, b) => b.priceValue - a.priceValue);
  } else if (sortBy === 'rating') {
    filteredDevices = [...filteredDevices].sort((a, b) => b.userRating - a.userRating || b.reviewCount - a.reviewCount);
  }

  const getAffiliateUrl = (device: MarketAnalysisMonitor) => {
    const base = device.affiliateUrl;
    if (!partnerTag || !partnerTag.trim()) {
      return base;
    }
    if (base.includes('ceneo.pl')) {
      return `${base}#pid=${encodeURIComponent(partnerTag.trim())}`;
    }
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}tag=${encodeURIComponent(partnerTag.trim())}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Przegląd rynku ciśnieniomierzy naramiennych (50 – 400 zł)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Najwyżej oceniane modele w Polsce z atestem medycznym CE i walidacją kliniczną ESH / PTNT
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij listę aparatów"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer touch-manipulation"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 bg-white dark:bg-slate-900">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedRange(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedRange === cat.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Search & Sort Toolbar */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Szukaj np. Omron, Microlife, USB-C, 360°, arytmia..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-hidden focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Sortuj:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              aria-label="Sortuj ciśnieniomierze"
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
            >
              <option value="recommended">Polecane wg PTNT</option>
              <option value="rating">Najwyższe opinie pacjentów</option>
              <option value="price-asc">Cena: od najniższej</option>
              <option value="price-desc">Cena: od najwyższej</option>
            </select>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-3.5 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Rekomendacja ekspertów:</span> Zgodnie ze standardem Polskiego Towarzystwa Nadciśnienia Tętniczego (PTNT) zalecane są wyłącznie <b>aparaty naramienne</b>. W przedziale 50–400 zł wybraliśmy wyłącznie modele z certyfikacją medyczną.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDevices.map(device => (
              <div
                key={device.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 flex flex-col justify-between hover:border-rose-300 dark:hover:border-rose-600 transition-all shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                        {device.brand}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {device.name}
                      </h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${device.badgeColor}`}>
                      {device.badge}
                    </span>
                  </div>

                  {/* Rating & reviews */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{device.userRating} / 5</span>
                    </div>
                    <span className="text-slate-500 text-[11px]">
                      ({device.reviewCount.toLocaleString('pl-PL')} zweryfikowanych opinii)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700/60 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      Mankiet: {device.cuffType}
                    </span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
                      {device.priceEstimate}
                    </span>
                  </div>

                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>{device.clinicalCert}</span>
                  </div>

                  {device.seniorFriendlyNote && (
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-amber-50/60 dark:bg-amber-950/20 p-2 rounded-xl border border-amber-200/50 dark:border-amber-900/40">
                      <b>Wygoda dla seniora:</b> {device.seniorFriendlyNote}
                    </div>
                  )}

                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-1">
                    {device.keyFeatures.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Ceny w aptekach i sklepach medycznych
                  </span>
                  <a
                    href={getAffiliateUrl(device)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500 transition-colors shadow-xs shrink-0"
                  >
                    <span>Porównaj oferty</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-center text-xs text-slate-500 shrink-0">
          Wszystkie aparaty w zestawieniu to zweryfikowane wyroby medyczne z certyfikatem CE oraz kliniczną walidacją dokładności ESH/BHS.
        </div>
      </div>
    </div>
  );
};
