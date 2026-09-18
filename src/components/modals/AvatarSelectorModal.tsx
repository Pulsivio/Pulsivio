import React from 'react';
import { X, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSelectAvatar: (avatarPath: string) => void;
  lang?: string;
}

export const AvatarSelectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSelectAvatar,
}) => {
  if (!isOpen) return null;

  const avatars = [
    {
      id: 'official',
      path: '/avatars/pulsivio_official_brand.jpg',
      label: 'Oficjalne logo Pulsivio',
      subtitle: 'Nowoczesny gradient kardiologiczny z sercem',
    },
    {
      id: 'original',
      path: '/avatars/original_pulsify.png',
      label: 'Klasyczny motyw serca',
      subtitle: 'Oryginalna ikona pulsometru',
    },
    {
      id: 'senior_man',
      path: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
      label: 'Senior (Mężczyzna)',
      subtitle: 'Portret profilowy użytkownika',
    },
    {
      id: 'senior_woman',
      path: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150&auto=format&fit=crop&q=80',
      label: 'Seniorka (Kobieta)',
      subtitle: 'Portret profilowy użytkowniczki',
    },
    {
      id: 'active_cardio',
      path: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&auto=format&fit=crop&q=80',
      label: 'Aktywność i Zdrowie',
      subtitle: 'Styl sportowo-zdrowotny',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 overflow-hidden my-auto animate-fade-in space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Wybierz awatar aplikacji
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalizuj wygląd nagłówka i raportów
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {avatars.map(item => {
            const isSelected = currentAvatar === item.path;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectAvatar(item.path);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 dark:border-rose-600'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl overflow-hidden ring-1 ring-slate-300 dark:ring-slate-700 shrink-0 bg-slate-950">
                    <img
                      src={item.path}
                      alt={item.label}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
