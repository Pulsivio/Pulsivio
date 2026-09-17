import { KICK_CONFIG } from '../config';

export interface KickSender {
  id?: number;
  username: string;
  slug?: string;
  identity?: {
    color?: string;
  };
}

export interface TopChatter {
  username: string;
  count: number;
  color?: string;
  percentage?: number;
}

export interface RecentChatMessage {
  id: string;
  username: string;
  color: string;
  content: string;
  timeFormatted: string;
  timestamp: number;
}

export interface KickStatsSnapshot {
  channelSlug: string;
  connectionState: 'connecting' | 'connected' | 'reconnecting' | 'error' | 'disconnected';
  isStreamLive: boolean;
  streamViewerCount?: number;
  sessionStartTime: number | null;
  sessionDurationSeconds: number;
  
  // Główne metryki
  totalMessages: number;
  totalWords: number;
  totalEmotes: number;
  activeChattersSession: number;
  messagesPerMinute: number;
  peakMessagesPerMinute: number;
  
  // Dodatkowe bogatsze statystyki
  avgWordsPerMessage: number;
  streamerMentionsCount: number;
  linksSharedCount: number;
  
  // Top czatujących widzów
  topChatters: TopChatter[];
  
  // Ostatnie wiadomości od widzów (zwiększony limit)
  recentMessages: RecentChatMessage[];

  // Historia tempa wiadomości na minutę (ostatnie próbki do wykresu sparkline)
  tempoHistory: number[];
  
  // Cel wiadomości (Live Goal Bar)
  messageGoal: number;
  goalMessagesCount: number;
  
  lastMessageTime?: number;
  isTestMode?: boolean;
}

export type StatsListener = (stats: KickStatsSnapshot) => void;

// Baza znanych ID czatów (błyskawiczny start dla pisicel)
const KNOWN_CHATROOM_IDS: Record<string, number> = {
  pisicel: 7435478,
  pisicelarp: 7435478,
};

// Lista znanych botów czatu na Kicku do odfiltrowywania ze statystyk
const KNOWN_KICK_BOTS = new Set([
  'botrix',
  'streamelements',
  'nightbot',
  'streamlabs',
  'kickbot',
  'commanderroot',
  'moobot',
  'wizebot',
  'fossabot',
  'stay_hydrated_bot',
  'kofistreambot',
  'soundalerts',
  'kick',
  'kickbotapp',
  'bot',
  'chatcensor',
  'livebot',
  'streamstickers',
  'creatorsbot',
  'kick_bot',
  'kick_alerts',
  'botrix_official',
  'botrixofficial',
  'botrix_alerts',
  'streamelementsbot',
  'streamlabsbot',
  'casterlabs',
  'casterlab',
  'kickcommunity',
  'kickcommunitybot',
  'live_alerts',
  'kickalerts',
  'chatbot',
  'kbot',
  'kickbot_app',
  'kick_botrix',
  'botrix_kick',
  'donationalerts',
  'tipeeestream',
  'tipeeebot',
  'streambot',
  'ankhbot',
  'deepbot',
  'giveawaybot',
  'subbot',
  'clipbot',
  'roulettebot',
  'roulette',
  'loterbot',
  'songrequest',
  'songrequestbot',
  'musicbot',
  'kicktools',
  'kickmoderator',
  'moderatorbot',
  'automod',
  'kickautomod',
  'kickmod',
  'modbot',
  'tip4stream',
  'streamerbot',
  'kicksystem'
]);

// Baza popularnych emotek 7TV, BTTV i Twitch (uzupełniana dynamicznie w tle bez pobierania obrazków)
const KNOWN_THIRD_PARTY_EMOTES = new Set([
  'KEKW', 'OMEGALUL', 'Pog', 'PogU', 'PogChamp', 'PepeLaugh', 'catJAM', 'monkaS', 
  'monkaW', 'monkaGIGA', 'monkaOMEGA', 'widepeepoHappy', 'widepeepoSad', 'LUL', 
  'LULW', 'Sadge', 'AYAYA', '5Head', 'Pepega', 'EZ', 'Clueless', 'GIGACHAD', 
  'HUH', 'ICANT', 'Aware', 'Smoge', 'Bedge', 'BatChest', 'copium', 'Susge', 
  'PauseChamp', 'FeelsStrongMan', 'FeelsWeirdMan', 'FeelsGoodMan', 'FeelsBadMan', 
  'BibleThump', 'Kappa', 'Kreygasm', 'TriHard', 'cmonBruh', 'WutFace', 'DansGame', 
  'NODDERS', 'NOPERS', 'COCKA', 'pepeW', 'pepeD', 'pepeJAM', 'modCheck', 'Prayge', 
  'YEP', 'BOOBA', 'D:', 'xdd', 'WAYTOODANK', 'ratJAM', 'pepeMeltdown', 'gachiHYPER', 
  'gachiBASS', 'gachiGASM', 'pepeClap', 'POGGERS', 'Clap', 'monkaSHAKE', 'pepeKMS', 
  'OMEGA', 'VibeCat', 'Dance', 'PepeHands', 'Jammies', 'peepoHappy', 'peepoSad', 
  'peepoRiot', 'peepoLeave', 'peepoArrive', 'peepoClap', 'KEKWait', 'pepePoint', 
  'PepeSpit', 'pepeSmoke', 'pepeRun', 'pepeGun', 'pepeBusiness', 'GIGA', 'Chad', 
  'Madge', 'Despair', 'Gasp', 'PopCat', 'WICKED', 'PoroSad', 'pepePains', 'ppPoof', 
  'pepeSteer', 'pepeBass', 'pepeDS', 'pepeL', 'pepeJAMJAM', 'pepeJAMMIN', 'catKISS', 
  'catPls', 'RainbowPls', 'Doge', 'AlienPls', 'Salty', 'Kapp', 'pepeS', 'pepeEZ', 
  'pepeSalute', 'Salute', 'KEKL', 'Smugpepe', 'PepeHype', 'monkaHmm', 'pepeJAM', 
  'Giggle', 'LMAO', 'ROFL', 'OMEGA', 'HUHH', 'DankG', 'pepega'
]);

// Asynchroniczne, nieblokujące pobranie listy nazw globalnych emotek 7TV i BTTV (bez żadnych obrazków!)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    // 7TV global emotes names
    fetch('https://7tv.io/v3/emote-sets/global')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.emotes && Array.isArray(data.emotes)) {
          for (const e of data.emotes) {
            if (e.name) KNOWN_THIRD_PARTY_EMOTES.add(e.name);
          }
        }
      })
      .catch(() => {});

    // BTTV global emotes names
    fetch('https://api.betterttv.net/3/cached/emotes/global')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          for (const e of data) {
            if (e.code) KNOWN_THIRD_PARTY_EMOTES.add(e.code);
          }
        }
      })
      .catch(() => {});
  }, 1000);
}

export function isBotUser(username: string): boolean {
  if (!username) return false;
  const lower = username.toLowerCase().trim();
  if (KNOWN_KICK_BOTS.has(lower)) return true;
  if (lower.endsWith('bot') && lower.length >= 4) return true;
  if (lower.endsWith('_bot') || lower.endsWith('-bot')) return true;
  if (lower.startsWith('bot_') || lower.startsWith('bot-') || lower.startsWith('bot.')) return true;
  if (lower.includes('_bot_') || lower.includes('-bot-') || lower.includes('.bot')) return true;
  if (
    lower.includes('botrix') || 
    lower.includes('streamelement') || 
    lower.includes('nightbot') || 
    lower.includes('streamlab') || 
    lower.includes('casterlab') ||
    lower.includes('kickbot') ||
    lower.includes('chatcensor') ||
    lower.includes('commanderroot') ||
    lower.includes('wizebot') ||
    lower.includes('fossabot') ||
    lower.includes('soundalert') ||
    lower.includes('donationalert') ||
    lower.includes('tipeee') ||
    lower.includes('giveaway') ||
    lower.includes('automod') ||
    lower.includes('kickalert') ||
    lower.includes('streamstickers') ||
    lower.includes('songrequest')
  ) {
    return true;
  }
  return false;
}

const PUSHER_APP_KEY = '32cbd69e4b950bf97679';
const PUSHER_WS_URL = `wss://ws-us2.pusher.com/app/${PUSHER_APP_KEY}?protocol=7&client=js&version=8.4.0-rc2&flash=false`;
const STORAGE_KEY_PREFIX = 'kick_stat_session_';
const PERSISTED_CHANNEL_KEY = 'kick_stat_active_channel_slug';

function safeStorageGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {}
  return null;
}

function safeStorageSet(key: string, val: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
    }
  } catch (e) {}
}

function safeStorageRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {}
}

class RobustKickChatService {
  private currentSlug: string = KICK_CONFIG.DEFAULT_CHANNEL;
  private customStreamerNick: string = '';
  private chatroomId: number | null = KNOWN_CHATROOM_IDS[KICK_CONFIG.DEFAULT_CHANNEL.toLowerCase()] || 7435478;
  private ws: WebSocket | null = null;
  private reconnectTimer: any = null;
  private pingTimer: any = null;
  private throttledEmitTimer: any = null;
  private saveStorageTimer: any = null;
  private liveCheckTimer: any = null;
  private testSimulationTimer: any = null;
  private shouldReconnect: boolean = true;
  
  private isStreamLive: boolean = false;
  private streamViewerCount: number = 0;
  private isTestMode: boolean = false;

  // Inteligentne liczenie czasu sesji powiązane ściśle ze stanem LIVE:
  // Czas liczy się WYŁĄCZNIE gdy streamer nadaje na żywo. Podczas stanu offline zegar absolutnie nie nalicza czasu!
  private sessionLiveStartTime: number | null = null;
  private accumulatedLiveSeconds: number = 0;
  private sessionStartTime: number | null = null;

  private totalMessages: number = 0;
  private goalBaselineMessages: number = 0;
  private totalWords: number = 0;
  private totalEmotes: number = 0;
  private streamerMentionsCount: number = 0;
  private linksSharedCount: number = 0;

  private recentMessages: RecentChatMessage[] = [];
  private userMessageCounts = new Map<string, { count: number; color?: string }>();
  private uniqueChatters = new Set<string>();
  private messageTimestamps: number[] = [];
  private peakMessagesPerMinute: number = 0;
  private tempoHistory: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  private lastTempoHistorySample: number = 0;
  private messageGoal: number = 0;
  private processedMessageIds = new Set<string>();
  
  private connectionState: 'connecting' | 'connected' | 'reconnecting' | 'error' | 'disconnected' = 'disconnected';
  private lastMessageTime?: number;
  private listeners: Set<StatsListener> = new Set();

  constructor() {
    // 1. Bezpieczne wczytanie zapamiętanego kanału z localStorage
    const savedSlug = safeStorageGet(PERSISTED_CHANNEL_KEY);
    if (savedSlug && savedSlug.trim()) {
      this.currentSlug = savedSlug.trim().toLowerCase();
    }

    if (KNOWN_CHATROOM_IDS[this.currentSlug]) {
      this.chatroomId = KNOWN_CHATROOM_IDS[this.currentSlug];
    }

    this.loadPersistedState(this.currentSlug);

    // Automatycznie nawiąż połączenie na starcie aplikacji
    setTimeout(() => {
      this.connectChannel(this.currentSlug, false);
    }, 50);

    // Regularna emisja stanu co 500ms
    this.throttledEmitTimer = setInterval(() => {
      this.pruneOldTimestamps();
      this.emitStats();
    }, 500);

    // Cykliczne sprawdzanie czy kanał jest LIVE (co 12s dla natychmiastowej reakcji)
    this.checkChannelLiveStatus();
    this.liveCheckTimer = setInterval(() => {
      this.checkChannelLiveStatus();
    }, 12000);
  }

  public getInitialSlug(): string {
    return this.currentSlug;
  }

  // Wczytanie zapamiętanych danych z localStorage
  private loadPersistedState(slug: string) {
    try {
      const saved = safeStorageGet(`${STORAGE_KEY_PREFIX}${slug.toLowerCase()}`);
      if (saved) {
        const data = JSON.parse(saved);
        this.totalMessages = data.totalMessages || 0;
        this.totalWords = data.totalWords || 0;
        this.totalEmotes = data.totalEmotes || 0;
        this.streamerMentionsCount = data.streamerMentionsCount || data.questionsCount || 0;
        this.linksSharedCount = data.linksSharedCount || 0;
        this.accumulatedLiveSeconds = data.accumulatedLiveSeconds || 0;
        this.sessionStartTime = data.sessionStartTime || null;
        this.peakMessagesPerMinute = data.peakMessagesPerMinute || 0;
        this.messageGoal = typeof data.messageGoal === 'number' && data.messageGoal >= 0 ? data.messageGoal : 0;
        
        if (Array.isArray(data.chatters)) {
          this.userMessageCounts.clear();
          this.uniqueChatters.clear();
          for (const u of data.chatters) {
            this.userMessageCounts.set(u.username, { count: u.count, color: u.color });
            this.uniqueChatters.add(u.username);
          }
        }
      }
    } catch (e) {
      console.warn('Błąd wczytywania sesji z localStorage:', e);
    }
  }

  private scheduleSave() {
    if (this.saveStorageTimer) return;
    this.saveStorageTimer = setTimeout(() => {
      this.saveStorageTimer = null;
      try {
        const topList = Array.from(this.userMessageCounts.entries())
          .map(([username, val]) => ({ username, count: val.count, color: val.color }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 50);

        const payload = {
          totalMessages: this.totalMessages,
          totalWords: this.totalWords,
          totalEmotes: this.totalEmotes,
          streamerMentionsCount: this.streamerMentionsCount,
          linksSharedCount: this.linksSharedCount,
          accumulatedLiveSeconds: this.accumulatedLiveSeconds,
          sessionStartTime: this.sessionStartTime,
          peakMessagesPerMinute: this.peakMessagesPerMinute,
          messageGoal: this.messageGoal,
          chatters: topList
        };
        safeStorageSet(`${STORAGE_KEY_PREFIX}${this.currentSlug.toLowerCase()}`, JSON.stringify(payload));
        safeStorageSet(PERSISTED_CHANNEL_KEY, this.currentSlug.toLowerCase());
      } catch (e) {}
    }, 1200);
  }

  // Precyzyjne zarządzanie stanem transmisji i zegarem sesji
  public updateLiveStatus(isLive: boolean, viewerCount?: number) {
    const wasLive = this.isStreamLive || this.isTestMode;
    this.isStreamLive = isLive;
    if (viewerCount !== undefined) {
      this.streamViewerCount = viewerCount;
    }

    const nowLive = this.isStreamLive || this.isTestMode;

    if (nowLive && !wasLive) {
      // Transmisja właśnie wystartowała (OFFLINE -> LIVE)
      // Zegar zaczyna liczyć dopiero od momentu, gdy streamer faktycznie odpalił stream!
      const now = Date.now();
      this.sessionLiveStartTime = now;
      if (!this.sessionStartTime) {
        this.sessionStartTime = now;
      }
    } else if (!nowLive && wasLive) {
      // Transmisja zakończona lub streamer przeszedł w stan offline (LIVE -> OFFLINE)
      // Wstrzymujemy licznik i zapisujemy dotychczasowy czas live; w offline zegar NIE nalicza czasu!
      if (this.sessionLiveStartTime) {
        const elapsed = Math.max(0, Math.floor((Date.now() - this.sessionLiveStartTime) / 1000));
        this.accumulatedLiveSeconds += elapsed;
        this.sessionLiveStartTime = null;
      }
    }
  }

  public setGoal(newGoal: number) {
    if (newGoal >= 0 && Number.isFinite(newGoal)) {
      this.messageGoal = Math.floor(newGoal);
      this.scheduleSave();
      this.emitStats();
    }
  }

  public setMessageGoal(newGoal: number) {
    this.setGoal(newGoal);
  }

  // Neonowa pigułka: zerowanie wyłącznie postępu celu (Cel wiadomości = 0) bez ruszania reszty statystyk
  public resetGoalProgress() {
    this.goalBaselineMessages = this.totalMessages;
    this.scheduleSave();
    this.emitStats();
  }

  public setCustomStreamerNick(nick: string) {
    this.customStreamerNick = nick.trim().toLowerCase();
  }

  public getSnapshot(): KickStatsSnapshot {
    const now = Date.now();
    const mpm = this.calculateMessagesPerMinute(now);
    if (mpm > this.peakMessagesPerMinute) {
      this.peakMessagesPerMinute = mpm;
    }

    if (!this.lastTempoHistorySample || now - this.lastTempoHistorySample >= 4000) {
      this.lastTempoHistorySample = now;
      this.tempoHistory.push(mpm);
      if (this.tempoHistory.length > 15) {
        this.tempoHistory.shift();
      }
    }

    // Inteligentne liczenie czasu sesji:
    // Podczas stanu offline zegar absolutnie nie nalicza czasu!
    let sessionDurationSeconds = this.accumulatedLiveSeconds;
    const isLiveNow = this.isStreamLive || this.isTestMode;
    if (isLiveNow && this.sessionLiveStartTime) {
      const currentLiveSpan = Math.max(0, Math.floor((now - this.sessionLiveStartTime) / 1000));
      sessionDurationSeconds += currentLiveSpan;
    }

    const avgWords = this.totalMessages > 0 ? Number((this.totalWords / this.totalMessages).toFixed(1)) : 0;
    const goalMessagesCount = Math.max(0, this.totalMessages - this.goalBaselineMessages);

    // Wykluczenie streamera i botów z rankingu top chatters
    const slugLower = this.currentSlug.toLowerCase();
    const streamerLower = this.customStreamerNick ? this.customStreamerNick.toLowerCase() : slugLower;

    // Zwiększony limit aktywnych widzów (Top 10 zamiast 5)
    const topChatters: TopChatter[] = Array.from(this.userMessageCounts.entries())
      .filter(([username]) => {
        const u = username.toLowerCase();
        return u !== slugLower && u !== streamerLower && !isBotUser(u);
      })
      .map(([username, data]) => ({
        username,
        count: data.count,
        color: data.color,
        percentage: this.totalMessages > 0 ? Number(((data.count / this.totalMessages) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      channelSlug: this.currentSlug,
      connectionState: this.connectionState,
      isStreamLive: this.isStreamLive,
      streamViewerCount: this.streamViewerCount,
      sessionStartTime: this.sessionStartTime,
      sessionDurationSeconds,
      totalMessages: this.totalMessages,
      totalWords: this.totalWords,
      totalEmotes: this.totalEmotes,
      activeChattersSession: this.uniqueChatters.size,
      messagesPerMinute: mpm,
      peakMessagesPerMinute: this.peakMessagesPerMinute,
      tempoHistory: [...this.tempoHistory],
      avgWordsPerMessage: avgWords,
      streamerMentionsCount: this.streamerMentionsCount,
      linksSharedCount: this.linksSharedCount,
      topChatters,
      recentMessages: this.recentMessages.slice(-100),
      messageGoal: this.messageGoal,
      goalMessagesCount,
      lastMessageTime: this.lastMessageTime,
      isTestMode: this.isTestMode,
    };
  }

  public subscribe(listener: StatsListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitStats() {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (err) {}
    }
  }

  // Pełny reset wszystkich statystyk do 0
  public resetCounters() {
    this.accumulatedLiveSeconds = 0;
    const isLiveNow = this.isStreamLive || this.isTestMode;
    const now = Date.now();
    this.sessionLiveStartTime = isLiveNow ? now : null;
    this.sessionStartTime = isLiveNow ? now : null;

    this.totalMessages = 0;
    this.goalBaselineMessages = 0;
    this.totalWords = 0;
    this.totalEmotes = 0;
    this.streamerMentionsCount = 0;
    this.linksSharedCount = 0;
    this.recentMessages = [];
    this.userMessageCounts.clear();
    this.uniqueChatters.clear();
    this.messageTimestamps = [];
    this.peakMessagesPerMinute = 0;
    this.tempoHistory = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.lastTempoHistorySample = 0;
    this.lastMessageTime = undefined;
    this.processedMessageIds.clear();
    
    if (this.testSimulationTimer) {
      clearInterval(this.testSimulationTimer);
      this.testSimulationTimer = null;
      this.isTestMode = false;
    }

    safeStorageRemove(`${STORAGE_KEY_PREFIX}${this.currentSlug.toLowerCase()}`);
    this.emitStats();
  }

  // Po zmianie kanału licznik i statystyki całkowicie się resetują do 0
  public async connectChannel(slug: string, forceReset: boolean = true) {
    const cleanSlug = slug.trim().toLowerCase().replace(/^https?:\/\/kick\.com\//, '').replace(/\//g, '');
    if (!cleanSlug) return;

    const isDifferentChannel = cleanSlug !== this.currentSlug;
    this.currentSlug = cleanSlug;

    safeStorageSet(PERSISTED_CHANNEL_KEY, cleanSlug);

    // Jeśli zmieniono kanał lub wymuszono reset -> zerujemy statystyki, aby liczyć czysto od odpalenia streama
    if (isDifferentChannel || forceReset) {
      this.resetCounters();
    }

    this.connectionState = 'connecting';
    this.emitStats();

    // Jeśli znamy ID kanału od razu, podłącz
    if (KNOWN_CHATROOM_IDS[cleanSlug]) {
      this.chatroomId = KNOWN_CHATROOM_IDS[cleanSlug];
    } else {
      await this.fetchChatroomId(cleanSlug);
    }

    this.initPusherWebSocket();
    this.checkChannelLiveStatus();
  }

  public async checkChannelLiveStatus() {
    if (!this.currentSlug) return;
    try {
      // 1. Sprawdź przez dedykowany serwerowy resolver ID czatu oraz statusu live
      const resolverRes = await fetch(`/api/kick-chatroom/${encodeURIComponent(this.currentSlug)}`).catch(() => null);
      if (resolverRes && resolverRes.ok) {
        const json = await resolverRes.json();
        if (json.isLive !== undefined) {
          this.updateLiveStatus(Boolean(json.isLive), json.viewerCount || 0);
          this.emitStats();
          return;
        }
      }
    } catch (e) {}

    try {
      // 2. Sprawdź przez serwer proxy (/api/kick-channel/v2/channels/:slug)
      const res = await fetch(`/api/kick-channel/v2/channels/${encodeURIComponent(this.currentSlug)}`).catch(() => null);
      if (res && res.ok) {
        const json = await res.json();
        const livestream = json?.livestream;
        if (livestream && livestream.is_live !== false && (livestream.id || livestream.session_title)) {
          this.updateLiveStatus(true, livestream.viewer_count || 0);
          this.emitStats();
          return;
        } else if (livestream === null || livestream?.is_live === false) {
          this.updateLiveStatus(false, 0);
          this.emitStats();
          return;
        }
      }
    } catch (e) {}

    // 3. Fallback: bezpośredni call jeśli proxy niedostępne
    try {
      const direct = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(this.currentSlug)}`).catch(() => null);
      if (direct && direct.ok) {
        const json = await direct.json();
        const livestream = json?.livestream;
        if (livestream && livestream.is_live) {
          this.updateLiveStatus(true, livestream.viewer_count || 0);
          this.emitStats();
          return;
        } else {
          this.updateLiveStatus(false, 0);
          this.emitStats();
          return;
        }
      }
    } catch (e) {}

    // Jeśli brak danych o streamie na żywo -> stan offline, zegar NIE nalicza czasu
    this.updateLiveStatus(false, 0);
    this.emitStats();
  }

  private async fetchChatroomId(slug: string) {
    // 1. Dedykowany serwerowy resolver ID czatu oraz statusu live (omija CORS i Cloudflare)
    try {
      const resolverRes = await fetch(`/api/kick-chatroom/${encodeURIComponent(slug)}`).catch(() => null);
      if (resolverRes && resolverRes.ok) {
        const json = await resolverRes.json();
        if (json?.chatroomId) {
          this.chatroomId = json.chatroomId;
          KNOWN_CHATROOM_IDS[slug.toLowerCase()] = json.chatroomId;
          if (json.isLive !== undefined) {
            this.updateLiveStatus(Boolean(json.isLive), json.viewerCount || 0);
          }
          return;
        }
      }
    } catch (e) {}

    // 2. Fallback przez standardowy proxy kanału
    try {
      const prox = await fetch(`/api/kick-channel/v2/channels/${encodeURIComponent(slug)}`).catch(() => null);
      if (prox && prox.ok) {
        const json = await prox.json();
        const foundId = json?.chatroom?.id || json?.id;
        if (foundId) {
          this.chatroomId = foundId;
          KNOWN_CHATROOM_IDS[slug.toLowerCase()] = foundId;
          return;
        }
      }
    } catch (e) {}

    // 3. Bezpośrednio z kick.com
    try {
      const direct = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(slug)}/chatroom`).catch(() => null);
      if (direct && direct.ok) {
        const json = await direct.json();
        if (json?.id) {
          this.chatroomId = json.id;
          KNOWN_CHATROOM_IDS[slug.toLowerCase()] = json.id;
          return;
        }
      }
    } catch (e) {}

    try {
      const directChan = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(slug)}`).catch(() => null);
      if (directChan && directChan.ok) {
        const json = await directChan.json();
        const foundId = json?.chatroom?.id || json?.id;
        if (foundId) {
          this.chatroomId = foundId;
          KNOWN_CHATROOM_IDS[slug.toLowerCase()] = foundId;
          return;
        }
      }
    } catch (e) {}

    if (!this.chatroomId) {
      this.connectionState = 'error';
      this.emitStats();
    }
  }

  private initPusherWebSocket() {
    this.disconnectWebSocket();
    if (!this.chatroomId) {
      this.connectionState = 'error';
      this.emitStats();
      return;
    }

    try {
      const ws = new WebSocket(PUSHER_WS_URL);
      this.ws = ws;

      ws.onopen = () => {
        if (this.pingTimer) clearInterval(this.pingTimer);
        this.pingTimer = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({ event: 'pusher:ping', data: {} }));
            } catch (e) {}
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const evt = parsed.event;

          // Obsługa protokołu Pusher: serwerowy ping -> odpowiedź pong
          if (evt === 'pusher:ping') {
            try {
              ws.send(JSON.stringify({ event: 'pusher:pong', data: {} }));
            } catch (e) {}
            return;
          }

          if (evt === 'pusher:connection_established') {
            // Subskrybuj kanał czatu v2 oraz v1
            const channelNameV2 = `chatrooms.${this.chatroomId}.v2`;
            const channelNameV1 = `chatrooms.${this.chatroomId}`;
            ws.send(JSON.stringify({
              event: 'pusher:subscribe',
              data: { auth: '', channel: channelNameV2 },
            }));
            ws.send(JSON.stringify({
              event: 'pusher:subscribe',
              data: { auth: '', channel: channelNameV1 },
            }));
            return;
          }

          if (evt === 'pusher_internal:subscription_succeeded') {
            this.connectionState = 'connected';
            this.emitStats();
            return;
          }

          // Odporne dopasowanie zdarzenia wiadomości Kick Pusher
          const isChatMsg = evt === 'App\\Events\\ChatMessageEvent' || 
                            evt === 'ChatMessageEvent' || 
                            (typeof evt === 'string' && (evt.includes('ChatMessage') || evt.includes('MessageEvent')));

          if (isChatMsg) {
            const rawMsg = typeof parsed.data === 'string' ? JSON.parse(parsed.data) : parsed.data;
            this.processIncomingMessage(rawMsg);
          }
        } catch (e) {}
      };

      ws.onerror = () => {
        this.connectionState = 'error';
        this.emitStats();
      };

      ws.onclose = () => {
        if (this.connectionState !== 'disconnected') {
          this.connectionState = 'reconnecting';
          this.emitStats();
        }
        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      };
    } catch (e: any) {
      this.connectionState = 'error';
      this.emitStats();
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      if (this.shouldReconnect) {
        this.initPusherWebSocket();
      }
    }, 2500);
  }

  public processIncomingMessage(raw: any) {
    if (!raw) return;

    // Deduplikacja wiadomości po ID
    const msgId = raw.id || raw.message_id;
    if (msgId) {
      if (this.processedMessageIds.has(msgId)) return;
      this.processedMessageIds.add(msgId);
      if (this.processedMessageIds.size > 800) {
        const first = this.processedMessageIds.values().next().value;
        if (first) this.processedMessageIds.delete(first);
      }
    }

    const now = Date.now();
    this.lastMessageTime = now;

    const content = String(raw.content || raw.message || '');
    const username = raw.sender?.username || raw.user?.username || raw.username || 'Widz';
    const userColor = raw.sender?.identity?.color || '#53fc18';

    // 1. BEZWZGLĘDNE USUNIĘCIE BOTÓW ZE STATYSTYK
    // Boty nie są wliczane do wiadomości, słów, emotek ani rankingu
    if (isBotUser(username)) {
      return;
    }

    // Bezpieczna sanitacja koloru użytkownika
    const safeColor = (typeof userColor === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(userColor.trim()))
      ? userColor.trim()
      : '#38bdf8';

    // Formatowanie czasu dla strumienia wiadomości od widzów
    const timeFormatted = new Date(now).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Zapisz do strumienia ostatnich wiadomości od widzów
    this.recentMessages.push({
      id: msgId || `${username}_${now}_${Math.random()}`,
      username,
      color: safeColor,
      content,
      timeFormatted,
      timestamp: now,
    });
    if (this.recentMessages.length > 150) {
      this.recentMessages.shift();
    }

    // Błyskawiczne zliczanie emotek z Kick, 7TV, BTTV oraz Unicode Emoji (wyłącznie cyfra sumaryczna)
    const kickEmoteMatches = content.match(/\[emote:\d+:[^\]]+\]/g);
    const kickEmotesCount = kickEmoteMatches ? kickEmoteMatches.length : 0;

    const unicodeEmojiMatches = content.match(/(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu);
    const unicodeEmojiCount = unicodeEmojiMatches ? unicodeEmojiMatches.length : 0;

    // Usunięcie znaczników [emote:...] przed analizą słów 7TV/BTTV
    const textWithoutKickEmotes = content.replace(/\[emote:\d+:[^\]]+\]/g, ' ');
    const rawWords = textWithoutKickEmotes.trim().split(/\s+/).filter((w) => w.length > 0);
    const wordsCount = rawWords.length;

    let thirdPartyEmoteCount = 0;
    for (let i = 0; i < rawWords.length; i++) {
      const w = rawWords[i];
      const stripped = w.replace(/^[.,!?:;()\-]+|[.,!?:;()\-]+$/g, '');
      if (KNOWN_THIRD_PARTY_EMOTES.has(w) || (stripped && KNOWN_THIRD_PARTY_EMOTES.has(stripped))) {
        thirdPartyEmoteCount++;
      }
    }

    const emoteCountInMsg = kickEmotesCount + unicodeEmojiCount + thirdPartyEmoteCount;

    // Dodatkowe statystyki: ścisłe wykrywanie oznaczeń streamera (@) oraz linków
    const contentLower = content.toLowerCase();
    const slugLower = this.currentSlug.toLowerCase();
    const customNickLower = this.customStreamerNick ? this.customStreamerNick.toLowerCase() : '';
    
    // Zliczamy wyłącznie wywołanie streamera (np. @nazwakanalu lub wywołanie nicku w tekście),
    // a nie przypadkowe wzmianki o innych widzach
    const isStreamerMention = 
      contentLower.includes(`@${slugLower}`) || 
      (customNickLower && contentLower.includes(`@${customNickLower}`)) ||
      (slugLower.length >= 3 && new RegExp(`(?:^|\\s)@?${slugLower}(?:\\b|\\s|$)`, 'i').test(contentLower)) ||
      (customNickLower && customNickLower.length >= 3 && new RegExp(`(?:^|\\s)@?${customNickLower}(?:\\b|\\s|$)`, 'i').test(contentLower));

    if (isStreamerMention) {
      this.streamerMentionsCount += 1;
    }
    if (/https?:\/\/|www\./i.test(content)) {
      this.linksSharedCount += 1;
    }

    // Zliczana jest każda realna wiadomość z czatu
    this.totalMessages += 1;
    this.totalWords += wordsCount;
    this.totalEmotes += emoteCountInMsg;
    this.lastMessageTime = now;

    this.messageTimestamps.push(now);

    // 2. FILTROWANIE WŁASNEGO NICKU (Streamer nie może być liczony w rankingu najaktywniejszych)
    const usernameLower = username.toLowerCase().trim();
    const streamerLower = this.customStreamerNick ? this.customStreamerNick.toLowerCase().trim() : slugLower;
    const isStreamer = usernameLower === slugLower || usernameLower === streamerLower;

    if (!isStreamer) {
      this.uniqueChatters.add(username);

      const prevUser = this.userMessageCounts.get(username) || { count: 0, color: safeColor };
      this.userMessageCounts.set(username, {
        count: prevUser.count + 1,
        color: safeColor,
      });
    }

    this.scheduleSave();
  }

  // Symulator wiadomości testowych (działa DOKŁADNIE tak jak pełny stream LIVE, ale offline!)
  public toggleTestSimulation(enable?: boolean): boolean {
    const newState = enable !== undefined ? enable : !this.isTestMode;
    this.isTestMode = newState;

    if (this.testSimulationTimer) {
      clearInterval(this.testSimulationTimer);
      this.testSimulationTimer = null;
    }

    if (newState) {
      // W trybie testowym symulujemy pełny stan LIVE i aktywujemy zegar sesji
      this.updateLiveStatus(true, Math.floor(Math.random() * 50) + 160);
      this.connectionState = 'connected';

      const mockUsers = [
        { name: 'Kocur99', color: '#10b981' },
        { name: 'StreamEnjoyer', color: '#06b6d4' },
        { name: 'PisiFan', color: '#38bdf8' },
        { name: 'Widz_Kick', color: '#f59e0b' },
        { name: 'Cziter_Pl', color: '#14b8a6' },
        { name: 'Viewer_XYZ', color: '#94a3b8' },
        { name: 'SuperFan99', color: '#ec4899' },
        { name: 'StreamKing', color: '#a855f7' }
      ];
      const activeTag = `@${this.currentSlug}`;
      const mockPhrases = [
        `siemano mordeczko! ${activeTag} KEKW [emote:123:pepe]`,
        `${activeTag} co teraz gramy na streamie? 🔥 OMEGALUL`,
        'co on zrobil 😂 [emote:456:kekw] catJAM',
        'ogladam od rana pozdro z Krakowa! GIGACHAD',
        `siema ${activeTag} kozacki licznik czatu! PogU`,
        'cel 20k wbijamy dzisiaj! 🚀🚀',
        `sprawdz link https://kick.com/${this.currentSlug}`,
        'co za runda! [emote:789:pog] widepeepoHappy',
        'LUL co za akcja nie wierze 😂 [emote:555:lul]',
        'lecimy z tematem dalej pozdro! 🔥🔥',
        `${activeTag} ile dzisiaj streamujesz mordo?`
      ];

      // Regularny napływ wiadomości z naturalnym tempem
      this.testSimulationTimer = setInterval(() => {
        const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const randomPhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
        
        // Lekka fluktuacja liczby widzów jak na prawdziwym streamie
        if (Math.random() > 0.6) {
          const delta = Math.floor(Math.random() * 5) - 2;
          this.streamViewerCount = Math.max(50, this.streamViewerCount + delta);
        }

        this.processIncomingMessage({
          content: randomPhrase,
          sender: {
            username: randomUser.name,
            identity: { color: randomUser.color }
          }
        });
        this.emitStats();
      }, 550);
    } else {
      // Przy wyłączeniu testu przywracamy rzeczywisty stan z Kick API
      this.checkChannelLiveStatus();
    }

    this.emitStats();
    return this.isTestMode;
  }

  // Wstrzyknij pojedynczą wiadomość testową
  public sendTestMessage(username: string = 'Widz_Testowy', content: string = 'Testowa wiadomość w OBS! 🚀 [emote:123:pog]') {
    this.processIncomingMessage({
      content,
      sender: {
        username,
        identity: { color: '#06b6d4' }
      }
    });
    this.emitStats();
  }

  private calculateMessagesPerMinute(now: number): number {
    const oneMinuteAgo = now - 60 * 1000;
    let count = 0;
    for (let i = this.messageTimestamps.length - 1; i >= 0; i--) {
      if (this.messageTimestamps[i] >= oneMinuteAgo) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  private pruneOldTimestamps() {
    const now = Date.now();
    const twoMinutesAgo = now - 120 * 1000;
    while (this.messageTimestamps.length > 0 && this.messageTimestamps[0] < twoMinutesAgo) {
      this.messageTimestamps.shift();
    }
  }

  private disconnectWebSocket() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }
  }

  public destroy() {
    this.shouldReconnect = false;
    if (this.throttledEmitTimer) clearInterval(this.throttledEmitTimer);
    if (this.saveStorageTimer) clearTimeout(this.saveStorageTimer);
    if (this.liveCheckTimer) clearInterval(this.liveCheckTimer);
    if (this.testSimulationTimer) clearInterval(this.testSimulationTimer);
    this.disconnectWebSocket();
    this.listeners.clear();
  }
}

export const kickChatService = new RobustKickChatService();
