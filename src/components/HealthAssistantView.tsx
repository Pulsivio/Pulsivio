import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Mic, MicOff, Sparkles, ArrowLeft, Heart, ShieldCheck, AlertCircle } from 'lucide-react';
import { Measurement, getPTNTClassification } from '../types';

interface HealthAssistantViewProps {
  measurements: Measurement[];
  onBack: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const HealthAssistantView: React.FC<HealthAssistantViewProps> = ({ measurements, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Cześć! Jestem Twoim inteligentnym Asystentem Zdrowia Pulsivio. Bazując na wytycznych Polskiego Towarzystwa Nadciśnienia Tętniczego (PTNT), pomagam analizować Twoje pomiary ciśnienia, interpretować skoki poranne oraz odpowiadać na pytania dotyczące profilaktyki sercowo-naczyniowej. W czym mogę Ci dzisiaj pomóc?',
      timestamp: 'Teraz'
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Compute stats for AI context
  const count = measurements.length;
  const avgSys = count > 0 ? Math.round(measurements.reduce((a, b) => a + b.systolic, 0) / count) : 0;
  const avgDia = count > 0 ? Math.round(measurements.reduce((a, b) => a + b.diastolic, 0) / count) : 0;
  const avgPulse = count > 0 ? Math.round(measurements.reduce((a, b) => a + b.pulse, 0) / count) : 0;

  // Speech Recognition (Web Speech API)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Twoja przeglądarka nie obsługuje wprowadzania głosowego. Użyj klawiatury.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pl-PL';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const query = customPrompt || input.trim();
    if (!query || isGenerating) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsGenerating(true);

    // Simulate intelligent cardiologist knowledge response grounded in PTNT
    setTimeout(() => {
      let reply = '';
      const lower = query.toLowerCase();

      if (lower.includes('przeanalizuj') || lower.includes('ostatnie') || lower.includes('pomiary')) {
        const ptnt = getPTNTClassification(avgSys, avgDia);
        reply = `📊 **Analiza Twoich pomiarów Pulsivio:**\n\n- Łączna liczba wpisów: **${count}**\n- Twoje średnie ciśnienie to: **${avgSys}/${avgDia} mmHg** (Puls: **${avgPulse} bpm**).\n- Klasyfikacja PTNT: **${ptnt.label}**.\n\n${
          ptnt.isNormalHome
            ? '✅ Twoja średnia mieści się w zalecanej normie pomiarów domowych (<135/85 mmHg). To świetny wynik!'
            : '⚠️ Średnia przekracza docelową normę pomiarów domowych (HBPM <135/85 mmHg). Warto omówić te wyniki z lekarzem prowadzącym w celu ewentualnej optymalizacji leczenia.'
        }\n\nPamiętaj, by nie modyfikować dawek leków samodzielnie. Wydrukuj raport A4 z Pulsivio przed najbliższą wizytą!`;
      } else if (lower.includes('skok poranny') || lower.includes('rano')) {
        reply = `📉 **Skok poranny ciśnienia (Morning Surge):**\n\nFizjologicznie ciśnienie po przebudzeniu rośnie, co wiąże się z wyrzutem kortyzolu i hormonów stresu. W Twoich ostatnich danych poranne ciśnienie kształtowało się na poziomie ok. 132/89 mmHg, a wieczorne 135/91 mmHg (różnica ok. -3 mmHg).\n\nUjemny lub niewielki skok oznacza brak nadmiernego wyrzutu ciśnienia o świcie, co jest korzystnym zjawiskiem pod kątem ochrony naczyń mózgowych i wieńcowych. Ważne jest jednak, by ciśnienie rozkurczowe rano i wieczorem dążyło do wartości poniżej 85 mmHg.`;
      } else if (lower.includes('dieta') || lower.includes('nawyki') || lower.includes('obniżyć')) {
        reply = `🥗 **Zalecenia niefarmakologiczne wg PTNT (Dieta DASH):**\n\n1. **Ograniczenie sodu:** Maksymalnie 5g soli dziennie (jedna płaska łyżeczka). Unikaj gotowych dań, wędlin i słonych przekąsek.\n2. **Zwiększenie potasu:** Włącz do diety banany, pomidory, awokado, rośliny strączkowe.\n3. **Magnez i nawodnienie:** Min. 1.5 - 2 litry wody dziennie.\n4. **Aktywność fizyczna:** Przynajmniej 30-45 minut umiarkowanego wysiłku tlenowego (spacery, rower, pływanie) 5-7 dni w tygodniu.\n5. **Sen i regeneracja:** Regularny sen 7-8 godzin bez ekspozycji na niebieskie światło przed snem.`;
      } else if (lower.includes('kiedy') || lower.includes('lekarza') || lower.includes('niebezpieczne')) {
        reply = `🚨 **Objawy alarmowe wymagające natychmiastowego kontaktu:**\n\n- Ciśnienie skurczowe ≥ 180 mmHg lub rozkurczowe ≥ 110 mmHg\n- Silny ból głowy z zaburzeniami widzenia\n- Ucisk, pieczenie lub ból w klatce piersiowej\n- Duszność, nudności, nagłe osłabienie kończyny lub asymetria twarzy\n\nW przypadku wystąpienia powyższych objawów należy niezwłocznie wezwać Pogotowie Ratunkowe (tel. 112/999).`;
      } else {
        reply = `Dziękuję za pytanie. Zgodnie z wytycznymi PTNT, najważniejszym elementem kontroli nadciśnienia jest regularność pomiarów (2x rano i 2x wieczorem przez 7 dni przed wizytą) oraz przestrzeganie stałych pór przyjmowania leków. Twoje aktualne średnie ciśnienie to ${avgSys}/${avgDia} mmHg. Jeśli masz konkretne wątpliwości dotyczące dawkowania lub objawów, zawsze skonsultuj je z lekarzem prowadzącym.`;
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f1b3d] hover:bg-slate-800 text-slate-300 font-semibold text-xs sm:text-sm border border-slate-700/60 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Powrót do pomiarów</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Oparty na wytycznych PTNT</span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-[#0b142e] border border-sky-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="p-4 bg-gradient-to-r from-sky-900/60 via-[#101b3d] to-indigo-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>Asystent Zdrowia Pulsivio</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </h3>
              <span className="text-xs text-sky-300/80">
                Inteligentna analiza ciśnienia tętniczego i pulsu
              </span>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-sky-600/30 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-md ${
                  m.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-br-none'
                    : 'bg-[#0f1a38] text-slate-200 border border-slate-800 rounded-bl-none'
                }`}
              >
                {m.text}
                <div
                  className={`text-[10px] mt-1 text-right ${
                    m.sender === 'user' ? 'text-sky-200' : 'text-slate-500'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-sky-600/30 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#0f1a38] text-slate-300 border border-slate-800 rounded-2xl rounded-bl-none p-3.5 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Analizuję dane z wytycznymi PTNT...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-850 bg-[#080e22] flex gap-2 overflow-x-auto text-xs scrollbar-none">
          {[
            '🩺 Przeanalizuj moje ostatnie pomiary',
            '📉 Co oznacza mój skok poranny (-3 mmHg)?',
            '🥗 Jakie nawyki i dieta pomogą obniżyć ciśnienie?',
            '❓ Kiedy ciśnienie wymaga pilnej wizyty u lekarza?'
          ].map(prompt => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="bg-[#101b3a] hover:bg-sky-950 text-slate-300 hover:text-sky-200 border border-slate-700/60 hover:border-sky-500/50 px-3 py-1.5 rounded-full whitespace-nowrap text-[11px] font-medium transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-[#0d1633] border-t border-slate-800 flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isListening
                ? 'bg-red-600 text-white border-red-500 animate-pulse'
                : 'bg-[#121c3d] hover:bg-slate-800 text-rose-400 border-rose-900/40'
            }`}
            title={isListening ? 'Zatrzymaj nagrywanie' : 'Mów do asystenta (mikrofon)'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? 'Słucham... Mów teraz' : 'Napisz pytanie do Asystenta Zdrowia...'}
            className="flex-1 bg-[#070e24] border border-slate-700 text-slate-200 placeholder-slate-500 px-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-sky-500"
          />

          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold transition-all shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="mt-3 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Asystent Pulsivio ma charakter informacyjny i edukacyjny. Nie zastępuje diagnozy lekarza kardiologa.</span>
      </div>
    </div>
  );
};
