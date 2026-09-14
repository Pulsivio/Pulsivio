import React, { useState, useEffect } from 'react';
import {
  X,
  Crown,
  Check,
  Sparkles,
  ShieldCheck,
  HeartPulse,
  Users,
  FileSpreadsheet,
  BellRing,
  Cloud,
  CheckCircle2,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Language } from '../types';

interface PulsivioProModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  isPro?: boolean;
  onTogglePro?: (active: boolean, plan?: string) => void;
}

export const PulsivioProModal: React.FC<PulsivioProModalProps> = ({
  isOpen,
  onClose,
  lang,
  isPro = false,
  onTogglePro,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [localActivated, setLocalActivated] = useState<boolean>(isPro);

  useEffect(() => {
    setLocalActivated(isPro);
  }, [isPro]);

  if (!isOpen) return null;

  const isTrialActivated = localActivated || isPro;

  const handleActivateTrial = () => {
    setLocalActivated(true);
    if (onTogglePro) {
      onTogglePro(true, billingCycle);
    }
  };

  const handleDeactivate = () => {
    setLocalActivated(false);
    if (onTogglePro) {
      onTogglePro(false);
    }
  };

  const proFeatures = [
    {
      icon: <FileSpreadsheet className="h-5 w-5 text-amber-500 shrink-0" />,
      title: lang === 'pl' ? 'Kardiologiczny Raport PDF z kodem QR' : 'Cardiological PDF Report with QR',
      desc:
        lang === 'pl'
          ? 'Oficjalny raport diagnostyczny wg zaleceń PTNT / ESC z analizą ciśnienia tętna (PP) i MAP dla lekarza.'
          : 'Official diagnostic report following ESC guidelines with pulse pressure (PP) and MAP analysis for your doctor.',
    },
    {
      icon: <BellRing className="h-5 w-5 text-rose-500 shrink-0" />,
      title: lang === 'pl' ? 'Alerty SMS i E-mail dla Opiekuna (SOS)' : 'SMS & Email Caregiver Alerts (SOS)',
      desc:
        lang === 'pl'
          ? 'Automatyczne powiadomienie bliskiej osoby (syna, córki), gdy ciśnienie przekroczy bezpieczną normę (>160/100 mmHg).'
          : 'Automatic notifications to loved ones when readings exceed safety thresholds (>160/100 mmHg).',
    },
    {
      icon: <Sparkles className="h-5 w-5 text-sky-500 shrink-0" />,
      title: lang === 'pl' ? 'Inteligentny Asystent Kardiologiczny AI PRO' : 'Cardio AI Assistant PRO',
      desc:
        lang === 'pl'
          ? 'Wykrywanie zaburzeń rytmu serca, analiza spadków nocnych (dipping) i korelacja ze zmianami pogody.'
          : 'Heart rhythm irregularity detection, nocturnal dipping analysis, and weather correlation.',
    },
    {
      icon: <Users className="h-5 w-5 text-indigo-500 shrink-0" />,
      title: lang === 'pl' ? 'Wielu Pacjentów w 1 Aplikacji (Pakiet Rodzinny)' : 'Multiple Profiles in 1 App (Family)',
      desc:
        lang === 'pl'
          ? 'Prowadź osobne, w 100% odseparowane dzienniki ciśnienia dla Mamy, Taty i Dziadków jednym kliknięciem.'
          : 'Manage separate blood pressure diaries for parents and grandparents with a single tap.',
    },
    {
      icon: <Cloud className="h-5 w-5 text-teal-500 shrink-0" />,
      title: lang === 'pl' ? 'Nielimitowana Chmura i Bezpieczny Backup' : 'Unlimited Cloud & Secure Backup',
      desc:
        lang === 'pl'
          ? 'Twoje pomiary są bezpiecznie szyfrowane i synchronizowane – nigdy nie stracisz historii przy zmianie telefonu.'
          : 'Your data is securely encrypted and synced across all devices with automatic cloud backups.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2.5 sm:p-4 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl my-auto rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border-2 border-amber-300/80 dark:border-amber-600/60 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Ribbon - Pulsivio PRO */}
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-4 py-4 sm:px-6 sm:py-5 text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij"
            className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-xs">
              <Crown className="h-3.5 w-3.5 text-yellow-200" />
              {lang === 'pl' ? 'Wersja Beta • Oferta wczesnego dostępu' : 'Beta Version • Early Access'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            {lang === 'pl' ? 'Pulsivio PRO i Udogodnienia' : 'Pulsivio PRO & Premium Features'}
          </h2>
          <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-md">
            {lang === 'pl'
              ? 'Wszystko, czego potrzebujesz Ty i Twoja rodzina, by mieć serce i ciśnienie pod profesjonalną kontrolą.'
              : 'Everything you and your family need to keep cardiovascular health under professional care.'}
          </p>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Trial Activated Banner */}
          {isTrialActivated ? (
            <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 p-3.5 text-emerald-900 dark:text-emerald-200 flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black">
                  {lang === 'pl' ? '✓ Dostęp Beta PRO został pomyślnie aktywowany!' : '✓ Beta PRO Access successfully activated!'}
                </h4>
                <p className="text-xs mt-0.5 text-emerald-700 dark:text-emerald-300">
                  {lang === 'pl'
                    ? 'Jako wczesny tester wersji Beta masz bezpłatny dostęp do wszystkich udogodnień i zaawansowanych funkcji PRO.'
                    : 'As an early beta tester, you have full complimentary access to all PRO conveniences and features.'}
                </p>
              </div>
            </div>
          ) : (
            /* Billing Switcher */
            <div className="flex items-center justify-center">
              <div className="inline-flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  {lang === 'pl' ? 'Miesięcznie (14,99 zł)' : 'Monthly ($3.99)'}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`relative rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    billingCycle === 'yearly'
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  {lang === 'pl' ? 'Rocznie (79 zł / rok)' : 'Yearly ($24.99 / yr)'}
                  <span className="ml-1 rounded-md bg-white/30 px-1 py-0.5 text-[9px] font-bold text-white">
                    -55%
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* List of PRO Features */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {lang === 'pl' ? 'Pakiet zaawansowanych udogodnień:' : 'Included premium features:'}
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {proFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-3 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800"
                >
                  <div className="mt-0.5 p-2 rounded-xl bg-white dark:bg-slate-700 shadow-2xs">
                    {feat.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {feat.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Free vs PRO Quick Summary Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-800">
              <span>{lang === 'pl' ? 'Funkcjonalność' : 'Feature'}</span>
              <div className="flex items-center gap-6">
                <span>{lang === 'pl' ? 'Wersja Zwykła' : 'Standard'}</span>
                <span className="text-amber-600 dark:text-amber-400 font-extrabold">PRO</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span>{lang === 'pl' ? 'Cyfrowy Dziennik i Kafelki LCD' : 'Digital Diary & LCD Cards'}</span>
              <div className="flex items-center gap-8 pr-1 font-bold">
                <Check className="h-4 w-4 text-emerald-600" />
                <Check className="h-4 w-4 text-emerald-600" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span>{lang === 'pl' ? 'Tryb Seniora z lektorem głosowym' : 'Senior Mode with Voice'}</span>
              <div className="flex items-center gap-8 pr-1 font-bold">
                <Check className="h-4 w-4 text-emerald-600" />
                <Check className="h-4 w-4 text-emerald-600" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span>{lang === 'pl' ? 'Alerty SMS dla Opiekuna przy skokach' : 'SMS Caregiver Crisis Alerts'}</span>
              <div className="flex items-center gap-8 pr-1 font-bold">
                <span className="text-slate-400 text-xs">—</span>
                <Check className="h-4 w-4 text-emerald-600" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span>{lang === 'pl' ? 'Oficjalny Raport PDF dla Lekarza' : 'Official PDF Doctor Report'}</span>
              <div className="flex items-center gap-8 pr-1 font-bold">
                <span className="text-slate-400 text-xs">Podstawowy</span>
                <span className="text-amber-600 dark:text-amber-400 font-extrabold">Zaawansowany</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 py-1 bg-amber-50/50 dark:bg-amber-950/20 px-2 rounded-lg">
              <span className="font-bold text-amber-900 dark:text-amber-200">
                {lang === 'pl' ? 'Reklamy' : 'Ads'}
              </span>
              <div className="flex items-center gap-6 pr-1 font-bold">
                <span className="text-slate-400 text-[11px]">{lang === 'pl' ? 'Włączone' : 'Enabled'}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  {lang === 'pl' ? 'Wyłączone' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Reassurance note about history retention after PRO expires */}
          <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 p-3 flex items-start gap-2.5 text-blue-900 dark:text-blue-200">
            <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] sm:text-xs">
              <strong>{lang === 'pl' ? 'Gwarancja zachowania historii:' : 'Data Preservation Guarantee:'}</strong>{' '}
              {lang === 'pl'
                ? 'Nawet jeśli Twoja subskrypcja PRO wygaśnie lub z niej zrezygnujesz, wszystkie dotychczas wprowadzone pomiary, cała historia, wykresy i wygenerowane raporty pozostają w 100% nienaruszone i bezpłatnie dostępne w Twoim dzienniku na zawsze. Żadne dane zdrowotne nie zostaną skasowane ani zablokowane.'
                : 'Even if your PRO subscription expires or is cancelled, all your measurements, history, charts, and generated reports remain 100% intact and freely accessible in your diary forever. No health data is ever deleted or locked.'}
            </p>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-[11px] sm:text-xs">{lang === 'pl' ? 'Możliwość rezygnacji w każdej chwili' : 'Cancel anytime'}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isTrialActivated && (
              <button
                type="button"
                onClick={handleDeactivate}
                className="flex-1 sm:flex-none rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-900 px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 cursor-pointer text-center"
                title={lang === 'pl' ? 'Przetestuj wersję zwykłą z reklamami' : 'Test free ad-supported version'}
              >
                {lang === 'pl' ? 'Wyłącz PRO' : 'Deactivate'}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl border border-slate-300 bg-slate-100 dark:bg-slate-800 dark:border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer text-center"
            >
              {lang === 'pl' ? 'Zamknij' : 'Close'}
            </button>

            {!isTrialActivated ? (
              <button
                type="button"
                onClick={handleActivateTrial}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/25 hover:from-amber-400 hover:to-rose-400 cursor-pointer transition-all active:scale-95 text-center whitespace-nowrap"
              >
                <Zap className="h-3.5 w-3.5 shrink-0" />
                <span>{lang === 'pl' ? 'Aktywuj Pakiet PRO' : 'Activate PRO'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-500 cursor-pointer transition-all text-center whitespace-nowrap"
              >
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span>{lang === 'pl' ? 'PRO Aktywne' : 'PRO Active'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
