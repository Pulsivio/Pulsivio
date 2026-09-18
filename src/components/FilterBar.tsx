import React from 'react';
import { Search, CalendarDays, List, Plus } from 'lucide-react';
import { Period } from '../types';

interface FilterBarProps {
  selectedPeriod: Period | 'all';
  setSelectedPeriod: (period: Period | 'all') => void;
  viewMode: 'dni' | 'lista';
  setViewMode: (mode: 'dni' | 'lista') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAddModal: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedPeriod,
  setSelectedPeriod,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  onOpenAddModal
}) => {
  return (
    <div className="flex flex-col gap-3 mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Period Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setSelectedPeriod('all')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              selectedPeriod === 'all'
                ? 'bg-slate-700 text-white shadow-sm border border-slate-600'
                : 'bg-[#101835] text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Wszystkie
          </button>

          <button
            onClick={() => setSelectedPeriod('rano')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              selectedPeriod === 'rano'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50'
                : 'bg-[#101835] text-slate-400 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <span>☀️</span>
            <span>Rano</span>
          </button>

          <button
            onClick={() => setSelectedPeriod('poludnie')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              selectedPeriod === 'poludnie'
                ? 'bg-sky-600/30 text-sky-300 border border-sky-500/50'
                : 'bg-[#101835] text-slate-400 hover:text-sky-300 border border-slate-800'
            }`}
          >
            <span>🌤️</span>
            <span>Południe</span>
          </button>

          <button
            onClick={() => setSelectedPeriod('wieczor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              selectedPeriod === 'wieczor'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                : 'bg-[#101835] text-slate-400 hover:text-indigo-300 border border-slate-800'
            }`}
          >
            <span>🌙</span>
            <span>Wieczór</span>
          </button>

          <button
            onClick={() => onOpenAddModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#101835] hover:bg-purple-900/30 text-purple-300 border border-purple-800/40 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span>Dodatkowy</span>
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-[#0d1530] border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('dni')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'dni'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Dni</span>
          </button>
          <button
            onClick={() => setViewMode('lista')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'lista'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Lista</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Szukaj w notatkach, lekach lub objawach..."
          className="w-full bg-[#0d1530] border border-slate-800/90 text-slate-200 placeholder-slate-500 pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-sky-500 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs px-1"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
