import React, { useState } from 'react';
import { X, UserPlus, Phone, MessageSquare, Trash2, Heart, ShieldAlert, Star, Check } from 'lucide-react';
import { Caregiver, Language, Measurement, UserProfile } from '../types';
import { translations } from '../i18n';

interface CaregiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  lang: Language;
  latestReading?: Measurement | null;
}

export const CaregiverModal: React.FC<CaregiverModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  lang,
  latestReading,
}) => {
  if (!isOpen) return null;

  const t = translations[lang] || translations.pl;
  const caregivers = profile.caregivers || [];

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Córka');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isPrimary, setIsPrimary] = useState(caregivers.length === 0);
  const [notifyOnHighBP, setNotifyOnHighBP] = useState(true);

  const handleAddCaregiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newCaregiver: Caregiver = {
      id: `cg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: name.trim(),
      relation: relation.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      isPrimary: isPrimary,
      notifyOnHighBP: notifyOnHighBP,
    };

    let updatedList = [...caregivers];
    if (isPrimary) {
      // Unset previous primary
      updatedList = updatedList.map((c) => ({ ...c, isPrimary: false }));
    }
    updatedList.push(newCaregiver);

    onUpdateProfile({
      ...profile,
      emergencyPhone: isPrimary ? newCaregiver.phone : (profile.emergencyPhone || newCaregiver.phone),
      emergencyName: isPrimary ? `${newCaregiver.relation} ${newCaregiver.name}` : (profile.emergencyName || `${newCaregiver.relation} ${newCaregiver.name}`),
      caregivers: updatedList,
    });

    // Reset form
    setName('');
    setPhone('');
    setEmail('');
    setIsAdding(false);
  };

  const handleDeleteCaregiver = (id: string) => {
    const updated = caregivers.filter((c) => c.id !== id);
    onUpdateProfile({
      ...profile,
      caregivers: updated,
    });
  };

  const handleSetPrimary = (id: string) => {
    const target = caregivers.find((c) => c.id === id);
    if (!target) return;
    const updated = caregivers.map((c) => ({
      ...c,
      isPrimary: c.id === id,
    }));
    onUpdateProfile({
      ...profile,
      emergencyPhone: target.phone,
      emergencyName: `${target.relation} ${target.name}`,
      caregivers: updated,
    });
  };

  // Generate SMS link with latest blood pressure
  const getSmsLink = (caregiverPhone: string) => {
    let msg = `Witaj! Moje ostatnie ciśnienie to: `;
    if (latestReading) {
      msg += `${latestReading.systolic}/${latestReading.diastolic} mmHg, tętno: ${latestReading.pulse || '--'} bpm (${latestReading.date} ${latestReading.time}).`;
    } else {
      msg += `Wszystko w porządku. Dziennik Pulsivio.`;
    }
    return `sms:${caregiverPhone}?body=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-3.5 bg-gradient-to-r from-blue-50/70 via-white to-amber-50/70 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {lang === 'pl' ? 'Opiekunowie i kontakty SOS' : (lang === 'it' ? 'Caregiver e contatti SOS' : 'Caregivers & SOS Contacts')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'pl' ? 'Szybkie wybieranie, SMS z pomiarem i powiadomienia' : 'Quick dial, SMS with reading & alerts'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Zamknij"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4 text-slate-800 dark:text-slate-200">
          
          {/* Info pill */}
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="leading-tight">
              {lang === 'pl'
                ? 'Główny opiekun jest natychmiast dostępny jednym dotknięciem w Trybie Seniora oraz w menu nagłym.'
                : 'The primary caregiver is available with a single tap in Senior Mode and emergency quick actions.'}
            </p>
          </div>

          {/* List of caregivers */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {lang === 'pl' ? 'Zapisani opiekunowie' : 'Saved Caregivers'} ({caregivers.length})
              </h3>
              {!isAdding && (
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{lang === 'pl' ? '+ Dodaj opiekuna' : '+ Add caregiver'}</span>
                </button>
              )}
            </div>

            {caregivers.length === 0 && !isAdding && (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center bg-slate-50 dark:bg-slate-800/50">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {lang === 'pl' ? 'Brak dodanych opiekunów' : 'No caregivers added yet'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
                  {lang === 'pl' ? 'Dodaj numer do córki, syna lub lekarza dla szybkiego kontaktu' : 'Add phone of daughter, son, or doctor for quick contact'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700 cursor-pointer transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{lang === 'pl' ? 'Dodaj pierwszego opiekuna' : 'Add first caregiver'}</span>
                </button>
              </div>
            )}

            {caregivers.map((cg) => (
              <div
                key={cg.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                  cg.isPrimary
                    ? 'border-blue-300 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800/80'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {cg.name}
                    </span>
                    <span className="rounded-md bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-700 dark:text-slate-200">
                      {cg.relation}
                    </span>
                    {cg.isPrimary && (
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-blue-600 text-white px-1.5 py-0.5 text-[10px] font-black">
                        <Star className="h-2.5 w-2.5 fill-white" />
                        {lang === 'pl' ? 'GŁÓWNY SOS' : 'PRIMARY'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                    📞 {cg.phone}
                    {cg.email && <span className="opacity-75 font-normal ml-2">✉️ {cg.email}</span>}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {/* Call Button */}
                  <a
                    href={`tel:${cg.phone}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition-all active:scale-95"
                    title={lang === 'pl' ? 'Zadzwoń teraz' : 'Call now'}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{lang === 'pl' ? 'Zadzwoń' : 'Call'}</span>
                  </a>

                  {/* SMS Button */}
                  <a
                    href={getSmsLink(cg.phone)}
                    className="inline-flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition-all active:scale-95"
                    title={lang === 'pl' ? 'Wyślij SMS z ostatnim pomiarem' : 'Send SMS with latest reading'}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>SMS</span>
                  </a>

                  {/* Set Primary */}
                  {!cg.isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(cg.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      title={lang === 'pl' ? 'Ustaw jako główny kontakt' : 'Set as primary contact'}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteCaregiver(cg.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                    title={lang === 'pl' ? 'Usuń opiekuna' : 'Delete'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Caregiver Form */}
          {isAdding && (
            <form onSubmit={handleAddCaregiver} className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <UserPlus className="h-4 w-4 text-blue-600" />
                {lang === 'pl' ? 'Nowy opiekun lub kontakt medyczny' : 'New Caregiver / Contact'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                    {lang === 'pl' ? 'Imię i nazwisko' : 'Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="np. Anna Kowalska"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                    {lang === 'pl' ? 'Relacja / Kto to jest' : 'Relationship'} *
                  </label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Córka">{lang === 'pl' ? 'Córka' : 'Daughter'}</option>
                    <option value="Syn">{lang === 'pl' ? 'Syn' : 'Son'}</option>
                    <option value="Partner/Małżonek">{lang === 'pl' ? 'Partner / Małżonek' : 'Partner / Spouse'}</option>
                    <option value="Opiekun">{lang === 'pl' ? 'Opiekun medyczny' : 'Caregiver'}</option>
                    <option value="Lekarz">{lang === 'pl' ? 'Lekarz rodzinny' : 'Doctor'}</option>
                    <option value="Sąsiad">{lang === 'pl' ? 'Sąsiad / Przyjaciel' : 'Neighbor / Friend'}</option>
                    <option value="Inny">{lang === 'pl' ? 'Inny' : 'Other'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                    {lang === 'pl' ? 'Numer telefonu' : 'Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="np. 500 100 200"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                    {lang === 'pl' ? 'E-mail (opcjonalny)' : 'Email (optional)'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="anna@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="primary-contact-checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="primary-contact-checkbox" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  {lang === 'pl' ? 'Ustaw jako główny kontakt alarmowy (SOS)' : 'Set as primary emergency contact (SOS)'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                >
                  {lang === 'pl' ? 'Anuluj' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {lang === 'pl' ? 'Zapisz opiekuna' : 'Save Caregiver'}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-3 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xs cursor-pointer transition-all active:scale-95"
          >
            {lang === 'pl' ? 'Gotowe' : 'Done'}
          </button>
        </div>

      </div>
    </div>
  );
};
