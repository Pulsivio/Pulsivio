import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Download, Share2, Heart, Check, Copy } from 'lucide-react';
import { Measurement, getPTNTClassification } from '../../types';

interface SocialCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  measurements: Measurement[];
}

export const SocialCardModal: React.FC<SocialCardModalProps> = ({
  isOpen,
  onClose,
  measurements
}) => {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const count = measurements.length;
  const avgSys = count > 0 ? Math.round(measurements.reduce((a, b) => a + b.systolic, 0) / count) : 132;
  const avgDia = count > 0 ? Math.round(measurements.reduce((a, b) => a + b.diastolic, 0) / count) : 87;
  const avgPulse = count > 0 ? Math.round(measurements.reduce((a, b) => a + b.pulse, 0) / count) : 90;

  const normalHomeCount = measurements.filter(m => m.systolic < 135 && m.diastolic < 85).length;
  const normalPercent = count > 0 ? Math.round((normalHomeCount / count) * 100) : 29;

  const ptnt = getPTNTClassification(avgSys, avgDia);

  const handleCopySummary = () => {
    const text = `📊 Mój raport z aplikacji Pulsivio:\nŚrednie ciśnienie: ${avgSys}/${avgDia} mmHg\nŚredni puls: ${avgPulse} bpm\nW normie domowej PTNT (<135/85): ${normalPercent}%\nZapisanych pomiarów: ${count}\n#Pulsivio #Nadcisnienie #Zdrowie #Kardiologia`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#0b142f] border border-sky-800/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="bg-gradient-to-r from-pink-600 to-rose-700 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-pink-200" />
            <span className="font-bold">Generator Grafiki na Grupę FB</span>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-300">
            Estetyczna karta z Twoimi wynikami do udostępnienia na grupach wsparcia dla osób z nadciśnieniem (np. Facebook):
          </p>

          {/* Aesthetic Card to Share */}
          <div
            ref={cardRef}
            className="rounded-2xl p-5 bg-gradient-to-br from-[#0c163b] via-[#121c45] to-[#1a1133] border-2 border-rose-500/40 shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3 border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
                <span className="font-extrabold text-white text-base tracking-tight">Pulsivio</span>
              </div>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/40 font-mono font-bold">
                RAPORT ZDROWIA
              </span>
            </div>

            <div className="text-center py-2">
              <span className="text-xs text-slate-400 font-semibold block mb-1 uppercase tracking-wider">
                Średnie ciśnienie z ostatnich pomiarów:
              </span>
              <div className="text-4xl font-black text-white tracking-tight">
                {avgSys}/{avgDia} <span className="text-sm font-normal text-sky-400">mmHg</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-xs font-semibold text-rose-300 bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-800/40 flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-rose-500" />
                  {avgPulse} bpm
                </span>
                <span className="text-xs font-semibold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
                  {normalPercent}% w normie domowej
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Liczba pomiarów: <strong>{count}</strong></span>
              <span className={`font-bold ${ptnt.colorClass}`}>{ptnt.label}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleCopySummary}
              className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Skopiowano tekst posta!' : 'Kopiuj gotowy tekst posta'}</span>
            </button>
            <button
              onClick={() => alert('Możesz zrobić zrzut ekranu powyższej karty lub skopiować tekst do schowka, aby wkleić na Facebooku!')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
