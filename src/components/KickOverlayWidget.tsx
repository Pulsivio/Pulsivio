import { useState, useEffect } from 'react';
import { KickStatsSnapshot, kickChatService } from '../services/kickChatService';
import { KICK_CONFIG } from '../config';
import { Zap, Trophy, Target, FileText, Smile } from 'lucide-react';

interface KickOverlayWidgetProps {
  channelSlug?: string;
}

export function KickOverlayWidget({
  channelSlug = KICK_CONFIG.DEFAULT_CHANNEL,
}: KickOverlayWidgetProps) {
  const [stats, setStats] = useState<KickStatsSnapshot>(() => kickChatService.getSnapshot());

  useEffect(() => {
    const unsub = kickChatService.subscribe((s) => setStats(s));
    kickChatService.connectChannel(channelSlug, false);
    return () => unsub();
  }, [channelSlug]);

  const currentGoal = stats.messageGoal || 0;
  const goalCount = stats.goalMessagesCount !== undefined ? stats.goalMessagesCount : stats.totalMessages;
  const progress = currentGoal > 0 ? Math.min(100, (goalCount / currentGoal) * 100) : 0;
  const isGoalReached = currentGoal > 0 && goalCount >= currentGoal;

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      className="obs-dock-container p-2 w-full max-w-full font-sans select-none animate-in fade-in duration-300"
    >
      <div className="rounded-xl bg-[#0b0e14]/95 backdrop-blur-md border border-slate-800 p-3.5 shadow-2xl w-full max-w-[420px] text-white">
        {/* Górny wiersz: kanał i tempo */}
        <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 min-w-0">
            {stats.isStreamLive ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" title="Status: Online" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,1)] animate-pulse" title="Status: Offline" />
            )}
            <svg 
              className="w-3.5 h-3.5 text-[#53fc18] shrink-0" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M4 3h5v6h2V3h5v8h-3v2h3v8h-5v-6h-2v6H4V3z" />
            </svg>
            <span className="text-xs font-normal text-slate-300 truncate">
              kick.com/<span className="text-[#53fc18] font-bold">@{stats.channelSlug}</span>
            </span>
          </div>

          <span className="text-xs font-semibold text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/25 shrink-0 tabular-nums">
            <Zap className="w-3 h-3 text-amber-400" />
            {stats.messagesPerMinute} /min
          </span>
        </div>

        {/* Duży licznik wiadomości - czyste zero, brak uppercase */}
        <div className="text-center py-1">
          <span className="text-[11px] font-medium text-slate-400 block">Wszystkie wiadomości</span>
          <div className="text-4xl sm:text-5xl font-bold tracking-tight text-white my-0.5 tabular-nums">
            {stats.totalMessages.toLocaleString()}
          </div>
        </div>

        {/* Cel wiadomości - jeśli ustawiony przez streamera */}
        {currentGoal > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-[11px] mb-1 font-medium text-slate-400">
              <span className="text-cyan-300 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cel: {goalCount.toLocaleString()} / {currentGoal.toLocaleString()}</span>
              </span>
              <span className={isGoalReached ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                {progress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-black/80 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  isGoalReached 
                    ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]' 
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* 2 statystyki: Słowa oraz Emotki (BEZ czatujących widzów) */}
        <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-slate-800/80 text-center">
          <div className="bg-[#121620] border border-slate-800/70 rounded-lg p-1.5">
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-medium">
              <FileText className="w-3 h-3 text-sky-400" />
              <span>Słowa</span>
            </span>
            <strong className="text-sm text-sky-300 font-bold block mt-0.5 tabular-nums">{stats.totalWords.toLocaleString()}</strong>
          </div>
          <div className="bg-[#121620] border border-slate-800/70 rounded-lg p-1.5">
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-medium">
              <Smile className="w-3 h-3 text-amber-400" />
              <span>Emotki (Kick/7TV/BTTV)</span>
            </span>
            <strong className="text-sm text-amber-300 font-bold block mt-0.5 tabular-nums">{stats.totalEmotes.toLocaleString()}</strong>
          </div>
        </div>

        {/* Lider czatu */}
        {stats.topChatters && stats.topChatters[0] && (
          <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-amber-400 flex items-center gap-1 font-semibold">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>Lider czatu:</span>
            </span>
            <span className="font-semibold text-slate-200 truncate max-w-[150px] tabular-nums">
              {stats.topChatters[0].username} ({stats.topChatters[0].count} wiad.)
            </span>
          </div>
        )}

        <div className="text-[9.5px] text-slate-500 text-center mt-2 pt-1 border-t border-slate-800/80">
          KickStats Pro Live • by <span className="text-slate-300 font-medium">GodShaker</span>
        </div>
      </div>
    </div>
  );
}
