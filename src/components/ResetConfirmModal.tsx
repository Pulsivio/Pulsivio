import { useEffect } from 'react';
import { AlertTriangle, RotateCcw, X, MessageSquare, FileText, Smile, Trophy, Clock } from 'lucide-react';

interface ResetConfirmModalProps {
  channelSlug: string;
  totalMessages: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResetConfirmModal({
  channelSlug,
  totalMessages,
  onConfirm,
  onCancel
}: ResetConfirmModalProps) {
  // Obsługa klawiszy Escape (anuluj) oraz Enter (potwierdź)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, onConfirm]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-[#121620] border border-rose-500/50 rounded-2xl max-w-md w-full p-4 sm:p-5 text-xs text-slate-200 shadow-[0_0_40px_rgba(244,63,94,0.2)] space-y-4 max-h-[95vh] overflow-y-auto box-border">
        
        {/* Nagłówek modalu */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Zresetować wszystkie statystyki?
              </h3>
              <p className="text-[11px] text-slate-400">
                Kanał: <span className="text-[#53fc18] font-semibold">kick.com/{channelSlug}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0 cursor-pointer"
            title="Zamknij (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informacja tekstowa */}
        <p className="text-slate-300 text-xs leading-relaxed">
          Ta operacja wyzeruje bieżącą sesję zliczania dla Twojego streama. Wszystkie poniższe statystyki zaczną zliczać od zera:
        </p>

        {/* Podsumowanie co zostanie wyzerowane */}
        <div className="bg-[#0b0e14] border border-slate-800/90 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-2 text-sky-300">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Wszystkie wiadomości:</span>
            </span>
            <span className="font-semibold text-white font-mono">{totalMessages.toLocaleString()} → 0</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-2 text-sky-400">
              <FileText className="w-3.5 h-3.5" />
              <span>Łączna ilość słów:</span>
            </span>
            <span className="font-semibold text-slate-400 font-mono">zerowanie do 0</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-2 text-amber-300">
              <Smile className="w-3.5 h-3.5" />
              <span>Licznik emotek (Kick/7TV/BTTV):</span>
            </span>
            <span className="font-semibold text-slate-400 font-mono">zerowanie do 0</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-2 text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
              <span>Ranking TOP 5 czatujących:</span>
            </span>
            <span className="font-semibold text-slate-400 font-mono">wyczyszczenie listy</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-2 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Czas trwania sesji i tempo:</span>
            </span>
            <span className="font-semibold text-slate-400 font-mono">start od 00:00</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/25 text-[11px] text-rose-300/90 leading-normal">
          Wskazówka: Jeśli chcesz wyzerować wyłącznie sam cel wiadomości, możesz użyć przycisku <strong className="text-cyan-300">Zeruj cel</strong> w sekcji celu bez resetowania wiadomości i rankingu.
        </div>

        {/* Przyciski akcji */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition active:scale-95 cursor-pointer"
          >
            Anuluj (zostaw)
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(225,29,72,0.4)] transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tak, zresetuj wszystko</span>
          </button>
        </div>

      </div>
    </div>
  );
}
