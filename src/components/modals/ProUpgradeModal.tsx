import React, { useState } from 'react';
import { X, Sparkles, Check, ShieldCheck, Heart, Zap, Coffee, ArrowRight, Lock, Key } from 'lucide-react';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isProUser: boolean;
  onActivatePro: (code?: string) => boolean;
  onOpenBuyCoffee: () => void;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  isProUser,
  onActivatePro,
  onOpenBuyCoffee
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const clean = promoCode.trim().toUpperCase();
    if (!clean) return;

    const valid = onActivatePro(clean);
    if (valid) {
      setSuccessMsg('Konto Pulsivio PRO zostało pomyślnie aktywowane!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setErrorMsg('Nieprawidłowy kod licencji. Wprowadź kod otrzymany po zakupie subskrypcji.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in my-auto relative">
        
        {/* Glow Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 px-6 py-5 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/15 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs border border-white/30">
              <Sparkles className="w-6 h-6 text-amber-100 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xl tracking-tight">Pulsivio PRO</h3>
                <span className="bg-white text-orange-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                  Premium
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium">
                Kompletny pakiet kardiologiczny bez reklam i ograniczeń
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij okno wersji PRO"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/20 active:scale-95 cursor-pointer transition-all relative z-10 touch-manipulation"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {isProUser ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
              <div className="inline-flex p-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white text-base">
                Twoja wersja Pulsivio PRO jest aktywna!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Korzystasz ze wszystkich zaawansowanych funkcji, automatycznej synchronizacji w chmurze i zerowej liczby reklam.
              </p>
            </div>
          ) : (
            <>
              {/* Feature list */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Co zyskujesz w wersji PRO:
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">100% Bez Reklam</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Wyłączone wszystkie banery Google Ads</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Chmura Google</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Automatyczny zapis na każdym urządzeniu</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Wskaźniki PP & MAP</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Zaawansowana ocena sztywności naczyń</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Raporty A4 dla Lekarza</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Profesjonalny PDF z uśrednieniem ESH</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Way 1: Support project (BuyCoffee) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-850 dark:to-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
                <div className="flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span className="font-black text-sm text-slate-900 dark:text-white">
                    Sposób 1: Postaw symboliczną kawę ☕
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Wpłać dowolną kwotę (np. 10 zł przez BLIK), aby wesprzeć niezależny rozwój medyczny aplikacji i odblokować PRO.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBuyCoffee();
                  }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  <Coffee className="w-4 h-4" />
                  <span>Przejdź do wsparcia BLIK / Karta</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Way 2: Promo Code / License Key */}
              <form onSubmit={handleApplyCode} className="space-y-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-500" />
                    <span>Posiadasz kod licencji z zakupu subskrypcji?</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Wpisz kod licencji PRO"
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase outline-hidden focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                  >
                    Aktywuj PRO
                  </button>
                </div>

                {errorMsg && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1">{errorMsg}</p>
                )}
                {successMsg && (
                  <p className="text-[11px] font-bold text-emerald-500 mt-1">{successMsg}</p>
                )}
              </form>
            </>
          )}

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
