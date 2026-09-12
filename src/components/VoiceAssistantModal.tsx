import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, X, Bot, Sparkles, Check, ArrowRight, ShieldAlert } from 'lucide-react';
import { Language, Measurement } from '../types';
import { translations } from '../i18n';
import { speakText, extractBPFromText, isSpeechRecognitionSupported } from '../utils/speech';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  recentReadings: Measurement[];
  onAddMeasurement: (m: Omit<Measurement, 'id' | 'timestamp'>) => void;
  onDeleteMeasurement?: (id: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  detectedMeasurement?: {
    systolic: number;
    diastolic: number;
    pulse?: number;
    notes?: string;
  };
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  lang,
  recentReadings,
  onAddMeasurement,
}) => {
  const t = translations[lang] || translations.pl;

  const [inputVal, setInputVal] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [savedMeasurementId, setSavedMeasurementId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: lang === 'pl'
            ? 'Dzień dobry! Jestem Twoim Asystentem Zdrowia. Możesz podyktować swój pomiar (np. "120 na 80 puls 68") albo zapytać o normy ciśnienia i przygotowanie do badania. W czym mogę pomóc?'
            : lang === 'it'
            ? 'Buongiorno! Sono il tuo Assistente della Salute. Puoi dettare la tua misurazione della pressione (es. "120 su 80 battiti 70") o porre qualsiasi domanda.'
            : lang === 'de'
            ? 'Guten Tag! Ich bin Ihr Gesundheitsassistent. Sie können Ihren Blutdruckwert diktieren (z. B. "120 zu 80 Puls 70") oder Fragen stellen.'
            : lang === 'es'
            ? '¡Hola! Soy tu Asistente de Salud. Puedes dictar tu medición (ej: "120 sobre 80 pulso 70") o hacer cualquier pregunta.'
            : 'Hello! I am your Health Assistant. You can dictate your blood pressure reading (e.g., "120 over 80 pulse 70") or ask health questions.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen, lang, messages.length]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechClass) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognizer = new SpeechClass();
      recognizer.continuous = false;
      recognizer.interimResults = true;

      const langMap: Record<Language, string> = {
        pl: 'pl-PL',
        en: 'en-US',
        de: 'de-DE',
        es: 'es-ES',
        fr: 'fr-FR',
        it: 'it-IT',
        pt: 'pt-PT',
        ru: 'ru-RU',
      };
      recognizer.lang = langMap[lang] || 'pl-PL';

      recognizer.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputVal(transcript);
      };

      recognizer.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognizer;
    } catch (e) {
      console.warn('Failed to init speech recognition:', e);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [lang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Rozpoznawanie mowy nie jest w pełni wspierane w tej przeglądarce. Możesz wpisać wiadomość w polu poniżej.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputVal('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSaveDetected = (detected: NonNullable<ChatMessage['detectedMeasurement']>, msgId: string, silentSpeak: boolean = false) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentHour = now.getHours();
    const period: 'morning' | 'noon' | 'evening' =
      currentHour < 12 ? 'morning' : currentHour < 18 ? 'noon' : 'evening';

    onAddMeasurement({
      systolic: detected.systolic,
      diastolic: detected.diastolic,
      pulse: detected.pulse || 72,
      arm: 'left',
      date: dateStr,
      time: timeStr,
      period: period,
      tags: ['Głosowo'],
      notes: detected.notes || 'Podyktowano asystentowi',
      feeling: 'normal',
    });

    setSavedMeasurementId(msgId);
    if (!silentSpeak) {
      speakText(`Zapisano pomiar: ${detected.systolic} na ${detected.diastolic}${detected.pulse ? `, puls ${detected.pulse}` : ''}.`, lang);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: lang,
          recentReadings: recentReadings.slice(0, 5),
        }),
      });

      const data = await response.json();
      const detected = data.detectedMeasurement || extractBPFromText(query);
      const isQuestion = /\?|czy |jakie |co oznacza|co to |ile to|dlaczego|kiedy|wyjaśnij/i.test(query);

      const msgId = `assistant-${Date.now()}`;
      let reply = data.replyText || 'Dziękuję za wiadomość.';

      // If user dictated a reading without asking a theoretical question, automatically save it right away
      if (detected && !isQuestion) {
        handleSaveDetected(detected, msgId, true);
        const noteInfo = detected.notes && detected.notes !== 'Wprowadzone głosowo' ? ` (${detected.notes})` : '';
        reply = `Rozpoznałem i zapisałem Twój pomiar w dzienniku: ${detected.systolic}/${detected.diastolic} mmHg${detected.pulse ? `, puls ${detected.pulse} bpm` : ''}${noteInfo}.`;
        speakText(`Zapisano pomiar: ${detected.systolic} na ${detected.diastolic}${detected.pulse ? `, puls ${detected.pulse}` : ''}.`, lang);
      }

      const assistantMsg: ChatMessage = {
        id: msgId,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detectedMeasurement: detected || undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Failed to talk to assistant:', err);
      // Fallback local regex parsing
      const detected = extractBPFromText(query);
      const isQuestion = /\?|czy |jakie |co oznacza|co to |ile to|dlaczego|kiedy|wyjaśnij/i.test(query);
      const msgId = `assistant-${Date.now()}`;

      let fallbackText = 'Pamiętaj: jako asystent cyfrowy nie udzielam porad medycznych. Pomiary zapisuj regularnie, a wszelkie wątpliwości konsultuj z lekarzem.';

      if (detected) {
        const noteInfo = detected.notes ? ` (${detected.notes})` : '';
        if (!isQuestion) {
          handleSaveDetected(detected, msgId, true);
          fallbackText = `Zapisano pomiar w Twoim dzienniku: ${detected.systolic}/${detected.diastolic} mmHg${detected.pulse ? `, puls: ${detected.pulse}` : ''}${noteInfo}.`;
          speakText(`Zapisano pomiar: ${detected.systolic} na ${detected.diastolic}.`, lang);
        } else {
          fallbackText = `Rozpoznałem ciśnienie ${detected.systolic}/${detected.diastolic} mmHg${detected.pulse ? `, puls: ${detected.pulse}` : ''}${noteInfo}. Możesz zapisać je poniższym przyciskiem.`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: msgId,
          sender: 'assistant',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          detectedMeasurement: detected || undefined,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4">
      <div className="flex h-full max-h-[640px] w-full max-w-xl flex-col rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {t.assistantTitle}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Dyktuj pomiary i pytaj o zdrowie
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Medical & Legal Disclaimer Banner */}
        <div className="bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200/70 dark:border-amber-900/60 px-3.5 py-1.5 flex items-center gap-2 text-[10px] sm:text-[11px] text-amber-900 dark:text-amber-200 shrink-0">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="leading-tight">
            <strong>Informacja prawna:</strong> Asystent AI pełni wyłącznie funkcję pomocniczo-edukacyjną i nie zastępuje porady lekarskiej ani diagnozy. W nagłych wypadkach dzwoń pod <strong>112 / 999</strong>.
          </p>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isThisSaved = savedMeasurementId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-rose-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* If assistant detected measurement, show convenient 1-tap save card */}
                  {msg.detectedMeasurement && (
                    <div className="mt-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 p-2.5 border border-rose-200 dark:border-rose-900 text-slate-900 dark:text-white">
                      <div className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                        Rozpoznano wartości:
                      </div>
                      <div className="text-base font-black">
                        {msg.detectedMeasurement.systolic} / {msg.detectedMeasurement.diastolic} mmHg
                        {msg.detectedMeasurement.pulse && ` • ❤️ ${msg.detectedMeasurement.pulse} bpm`}
                      </div>

                      {isThisSaved ? (
                        <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-950/60 p-2 border border-emerald-200 dark:border-emerald-800/80">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Zapisano do dziennika pomiarów</span>
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSaveDetected(msg.detectedMeasurement!, msg.id)}
                          className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-3 text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 active:scale-98 shadow-xs transition-all cursor-pointer"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                          <span>Zatwierdź i zapisz pomiar</span>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-1 flex items-center justify-between gap-3 text-[10px] opacity-70">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.text, lang)}
                        className="hover:opacity-100 flex items-center gap-0.5 cursor-pointer"
                        title={t.assistantReadOut}
                      >
                        <Volume2 className="h-3 w-3" />
                        <span>Czytaj</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Bot className="h-4 w-4 animate-bounce text-rose-500" />
              <span>Asystent przygotowuje odpowiedź...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Sample Questions (Wrapped smoothly for mobile) */}
        <div className="border-t border-slate-100 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-800/30">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            {t.quickQuestionsTitle}
          </div>
          <div className="flex flex-wrap gap-1">
            {[t.qq1, t.qq2, t.qq3, t.qq4].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 truncate max-w-full"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Listening Indicator / Mic Status */}
        {isListening && (
          <div className="flex items-center justify-center gap-2 bg-rose-500 text-white py-2 px-4 text-xs font-bold animate-pulse">
            <Mic className="h-4 w-4" />
            <span>{t.assistantListening}</span>
          </div>
        )}

        {/* Input Bar */}
        <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all shadow-xs cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white ring-4 ring-rose-300 animate-pulse'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/70 dark:text-rose-300'
              }`}
              title={isListening ? t.assistantStopListen : t.assistantStartListen}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              placeholder={isListening ? 'Słucham...' : t.assistantInputPlaceholder}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputVal.trim() || isLoading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white disabled:opacity-40 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-500 transition-colors cursor-pointer"
              title={t.assistantSend}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-2 text-[10px] text-center text-slate-400 dark:text-slate-500">
            {t.assistantDisclaimer}
          </p>
        </div>

      </div>
    </div>
  );
};
