import React from 'react';
import { X, Sparkles, Check, Heart, Shield } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
}

export const NamingIdeasModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const ideas = [
    {
      name: 'KardioOpieka (lub CardioCare)',
      desc: 'Słowo „Opieka” natychmiast budzi poczucie bezpieczeństwa, troski, spokoju i opieki medycznej. Doskonale przemawia zarówno do seniorów, jak i do ich dzieci czy wnuków, którzy dbają o zdrowie bliskich.',
      advantage: 'Najwyższy poziom zaufania i poczucia bezpieczeństwa dla każdego wieku.',
      selected: true,
    },
    {
      name: 'Serce w Normie',
      desc: 'Bardzo prosta, uspokajająca i bezstresowa nazwa. Każdy człowiek mierzy ciśnienie po to, by mieć pewność, że jego parametry życiowe są w normie.',
      advantage: 'Kojąca, zwięzła i natychmiast zrozumiała bez żargonu.',
    },
    {
      name: 'Puls i Spokój',
      desc: 'Akcentuje spokój ducha, redukcję stresu oraz codzienną regularność. Pomaga walczyć z syndromem „białego fartucha” i lękiem przed pomiarem.',
      advantage: 'Ciepła, relaksująca i nowoczesna.',
    },
    {
      name: 'Moje Zdrowe Serce',
      desc: 'Bardzo osobista, życzliwa nazwa, która nie onieśmiela skomplikowaną technologią i zachęca do codziennego nawyku dbania o układ krążenia.',
      advantage: 'Niezwykle przyjazna dla seniorów i osób starszych.',
    },
    {
      name: 'KardioDziennik',
      desc: 'Klasyczna, profesjonalna nazwa o medycznym charakterze, nawiązująca do tradycyjnego zeszytu pomiarów ciśnienia polecanego przez lekarzy kardiologów.',
      advantage: 'Sprawdzona, poważna i budząca autorytet lekarski.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 overflow-hidden my-auto animate-fade-in space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Pomysły na nazwę dla aplikacji
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Warianty brandingowe budujące zaufanie seniorów i opiekunów
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {ideas.map((idea, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-4 transition-all ${
                idea.selected
                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-700/60'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Heart className={`h-4 w-4 ${idea.selected ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
                  {idea.name}
                </h4>
                {idea.selected && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white">
                    Główny faworyt
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                {idea.desc}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 shrink-0" />
                <span>Zaleta: {idea.advantage}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-slate-900 dark:bg-slate-800 text-white font-bold py-2.5 text-xs hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
