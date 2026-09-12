import React from 'react';
import { CalendarRange, PlusCircle, TrendingUp, FileCheck2, Sparkles } from 'lucide-react';
import { ActiveTab, Language } from '../types';
import { translations } from '../i18n';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  lang: Language;
  unreadCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  lang,
}) => {
  const t = translations[lang] || translations.pl;

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'diary', label: t.navDiary, icon: <CalendarRange className="h-4 w-4 shrink-0" /> },
    { id: 'add', label: t.navAdd, icon: <PlusCircle className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" /> },
    { id: 'trends', label: t.navTrends, icon: <TrendingUp className="h-4 w-4 shrink-0" /> },
    { id: 'report', label: t.navReport, icon: <FileCheck2 className="h-4 w-4 shrink-0" /> },
    { id: 'assistant', label: t.navAssistant, icon: <Sparkles className="h-4 w-4 shrink-0 text-amber-500" /> },
  ];

  return (
    <>
      {/* Top Desktop & Tablet Navigation (Hidden on mobile phones to avoid double nav) */}
      <nav className="no-print hidden sm:block mx-auto max-w-7xl px-3 sm:px-6 pt-3 pb-1">
        <div className="grid grid-cols-5 gap-1.5 rounded-2xl bg-slate-100/90 p-1.5 dark:bg-slate-800/80">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                id={`nav-tab-${tab.id}`}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-sky-600 shadow-xs dark:bg-slate-700 dark:text-sky-400 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700/50'
                }`}
              >
                {tab.icon}
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Sticky Mobile Bottom Bar (Thumb-accessible for smartphones) */}
      <div className="no-print sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-1.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
        <div className="grid grid-cols-5 gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={`mobile-${tab.id}`}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                id={`mobile-nav-${tab.id}`}
                className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-sky-600 dark:text-sky-400 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-sky-50 dark:bg-sky-950/80 shadow-2xs' : ''}`}>
                  {tab.icon}
                </div>
                <span className="text-[10px] tracking-tight truncate max-w-full text-center">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
