import React, { useState, useEffect, useRef } from 'react';
import { Measurement, Period } from '../../types';
import { Mic, MicOff, Send, X, Bot, Volume2, Sparkles, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddMeasurement: (data: Omit<Measurement, 'id' | 'createdAt'>) => void;
  recentReadings: Measurement[];
  lang?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  detectedData?: any;
}

export const VoiceAssistantModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddMeasurement,
  recentReadings,
  lang = 'pl'
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Dzień dobry! Jestem asystentem głosowym Pulsivio. Możesz podyktować swój pomiar (np. „120 na 80 puls 70”) lub zadać pytanie o ciśnienie tętnicze.',
      timestamp: 'Teraz'
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeechAvailable, setIsSpeechAvailable] = useState(true);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isProcessing]);

  // Speech Recognition setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechAvailable(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pl-PL';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0]?.transcript || '';
        if (transcript) {
          setInput(transcript);
          handleSend(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition init error:', err);
      setIsSpeechAvailable(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Wprowadzanie głosowe nie jest wspierane w tej przeglądarce. Wpisz tekst ręcznie.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pl-PL';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Client-side quick regex parser for readings
  const parseMeasurementLocally = (str: string) => {
    const reg = /(?:ciśnienie|zmierzyłem|wynik)?\s*(\d{2,3})\s*(?:na|\/|-)\s*(\d{2,3})(?:\s*(?:puls|tętno|serce|bpm)?\s*(\d{2,3}))?/i;
    const match = str.match(reg);
    if (match) {
      const sys = parseInt(match[1], 10);
      const dia = parseInt(match[2], 10);
      const pulse = match[3] ? parseInt(match[3], 10) : 72;
      if (sys >= 60 && sys <= 250 && dia >= 35 && dia <= 150) {
        return { systolic: sys, diastolic: dia, pulse };
      }
    }
    return null;
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText !== undefined ? customText : input).trim();
    if (!textToSend || isProcessing) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const timeStr = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: timeStr
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    const localReading = parseMeasurementLocally(textToSend);
    const isQuestion = /\?|czy|jakie|co oznacza|co to|ile to|dlaczego|kiedy|wyjaśnij/i.test(textToSend);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          language: lang,
          recentReadings: recentReadings.slice(0, 5)
        })
      });

      const data = await res.json();
      const detected = data.detectedMeasurement || (localReading ? {
        systolic: localReading.systolic,
        diastolic: localReading.diastolic,
        pulse: localReading.pulse,
        date: new Date().toISOString().split('T')[0],
        time: timeStr,
        period: (new Date().getHours() < 12 ? 'rano' : new Date().getHours() < 18 ? 'poludnie' : 'wieczor') as Period,
        arm: 'lewa',
        tags: ['Głosowo'],
        notes: 'Podyktowano asystentowi'
      } : null);

      let reply = data.replyText || 'Dziękuję za wiadomość.';

      if (detected && !isQuestion) {
        onAddMeasurement({
          systolic: detected.systolic,
          diastolic: detected.diastolic,
          pulse: detected.pulse || 72,
          arm: (detected.arm || 'lewa') as any,
          date: detected.date || new Date().toISOString().split('T')[0],
          time: detected.time || timeStr,
          period: (detected.period || 'rano') as Period,
          tags: ['Głosowo'],
          notes: detected.notes || 'Podyktowano asystentowi głosowemu',
          feeling: 'normal'
        });

        const speakConfirmation = `Zapisano pomiar: ${detected.systolic} na ${detected.diastolic}${detected.pulse ? `, puls ${detected.pulse}` : ''}.`;
        reply = `✅ **${speakConfirmation}**\n\nTwój pomiar został pomyślnie dodany do dziennika Pulsivio.`;
        speakText(speakConfirmation);
      } else {
        // Read out brief answer if spoken or short
        if (reply.length < 180) {
          speakText(reply);
        }
      }

      setMessages(prev => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
          detectedData: detected
        }
      ]);
    } catch (err) {
      console.error('Error contacting /api/assistant:', err);
      // Fallback locally
      let reply = 'Przepraszam, wystąpił chwilowy problem z połączeniem. Spróbuj ponownie za chwilę.';
      if (localReading && !isQuestion) {
        onAddMeasurement({
          systolic: localReading.systolic,
          diastolic: localReading.diastolic,
          pulse: localReading.pulse,
          arm: 'lewa',
          date: new Date().toISOString().split('T')[0],
          time: timeStr,
          period: 'rano',
          tags: ['Głosowo'],
          notes: 'Zapisano lokalnie przez asystenta',
          feeling: 'normal'
        });
        const spoken = `Zapisano pomiar: ${localReading.systolic} na ${localReading.diastolic}, puls ${localReading.pulse}.`;
        reply = `✅ **${spoken}**`;
        speakText(spoken);
      }

      setMessages(prev => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-fade-in flex flex-col h-[85vh] max-h-[720px]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-white shadow-inner">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Mów do Asystenta Pulsivio
              </h3>
              <p className="text-xs text-rose-100">
                Podyktuj pomiar głosem lub zadaj pytanie o normy PTNT
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-rose-100 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/50 dark:bg-slate-950/30">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="h-8 w-8 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-lg rounded-2xl p-3.5 text-xs sm:text-sm whitespace-pre-line leading-relaxed shadow-2xs ${
                  m.sender === 'user'
                    ? 'bg-rose-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs'
                }`}
              >
                {m.text}
                <div
                  className={`text-[10px] mt-1 text-right font-medium ${
                    m.sender === 'user' ? 'text-rose-200' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 p-2">
              <Sparkles className="h-4 w-4 animate-spin text-rose-500" />
              <span>Przetwarzam Twoją wiadomość...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Dictation Suggestions */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Przykłady:</span>
          {[
            '120 na 80 puls 70',
            '135/85 75',
            'Jakie są normy ciśnienia u seniora?',
            'Jak prawidłowo mierzyć ciśnienie?'
          ].map(sample => (
            <button
              key={sample}
              type="button"
              onClick={() => handleSend(sample)}
              className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 whitespace-nowrap transition-colors cursor-pointer"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-500/30'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 border border-rose-500/30'
              }`}
              title={isListening ? 'Zatrzymaj mikrofon' : 'Kliknij i podyktuj głosem'}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={isListening ? 'Słucham... mów teraz swój pomiar' : 'Podyktuj lub wpisz: np. 120 na 80 puls 70...'}
              className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white outline-hidden focus:border-rose-500 transition-all"
            />

            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold transition-all shadow-md cursor-pointer shrink-0"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
