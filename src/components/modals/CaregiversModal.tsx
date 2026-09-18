import React, { useState } from 'react';
import { PatientProfile } from '../../types';
import { X, Phone, User, Heart, Shield, Check, PhoneCall, MessageSquare } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: PatientProfile;
  onUpdateProfile: (profile: PatientProfile) => void;
  lang?: string;
  latestReading?: any;
}

export const CaregiversModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  latestReading
}) => {
  const [emergencyName, setEmergencyName] = useState(profile.emergencyName || 'Córka Anna');
  const [emergencyPhone, setEmergencyPhone] = useState(profile.emergencyPhone || '+48 500 123 456');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      emergencyName: emergencyName.trim(),
      emergencyPhone: emergencyPhone.trim()
    });
    onClose();
  };

  const smsText = latestReading
    ? `Cześć! Mój ostatni pomiar ciśnienia w Pulsivio: ${latestReading.systolic}/${latestReading.diastolic} mmHg, puls ${latestReading.pulse} (${latestReading.date} ${latestReading.time}). Czuję się stabilnie.`
    : `Cześć! Przesyłam informację z mojego dziennika Pulsivio. Wszystko w porządku!`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 overflow-hidden my-auto animate-fade-in space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              <Heart className="h-5 w-5 fill-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Opiekun i kontakt alarmowy
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Szybkie połączenie jednym dotknięciem w Trybie Seniora
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

        <form onSubmit={handleSave} className="space-y-4">
          <div className="rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 p-3 text-xs text-blue-900 dark:text-blue-200">
            Główny opiekun jest natychmiast dostępny <b>jednym dotknięciem</b> w Trybie Seniora. W razie potrzeby senior może natychmiast zadzwonić lub wysłać SMS.
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Imię lub relacja opiekuna
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={emergencyName}
                  onChange={e => setEmergencyName(e.target.value)}
                  placeholder="np. Córka Kasia / Syn Paweł"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Numer telefonu
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                  placeholder="np. +48 600 000 000"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <a
              href={`tel:${emergencyPhone}`}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-blue-500 shadow-sm"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Przetestuj połączenie</span>
            </a>
            <a
              href={`sms:${emergencyPhone}?body=${encodeURIComponent(smsText)}`}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Przetestuj SMS</span>
            </a>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              Zapisz opiekuna
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
