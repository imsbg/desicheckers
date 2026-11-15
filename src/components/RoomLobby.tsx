import React, { useState, useEffect } from 'react';
import {
  Bot,
  Users,
  Plus,
  LogIn,
  Eye,
  Share2,
  HelpCircle,
  Play,
  Globe,
  Lock,
  Smartphone,
  ShieldAlert,
  Radio,
  Trophy,
} from 'lucide-react';
import {
  MatchTier,
  generateRoomCode,
  isValidRoomCode,
  normalizeRoomCode,
} from '../game/checkers';
import { liveMatchRegistry, LiveMatchListing } from '../network/liveLobby';
import { sounds } from '../utils/sound';
import { Translations } from '../utils/translations';

interface RoomLobbyProps {
  playerName: string;
  onUpdatePlayerName: (name: string) => void;
  onStartAI: (tier: MatchTier, forcedCapture: boolean) => void;
  onStartLocal2P: (forcedCapture: boolean) => void;
  onCreateRoom: (
    roomCode: string,
    isPublicLive: boolean,
    forcedCapture: boolean,
    matchTier: MatchTier
  ) => void;
  onJoinRoom: (roomCode: string, role: 'guest' | 'spectator') => void;
  onOpenHowToPlay: () => void;
  onOpenShareFriend: () => void;
  initialRoomCode?: string;
  isDarkMode: boolean;
  isFullscreen?: boolean;
  t: Translations;
}

const TIER_OPTIONS: Array<{ tier: MatchTier; limitLabel: string }> = [
  { tier: 'casual', limitLabel: '∞' },
  { tier: 'smart', limitLabel: '50' },
  { tier: 'master', limitLabel: '40' },
];

export const RoomLobby: React.FC<RoomLobbyProps> = ({
  playerName,
  onUpdatePlayerName,
  onStartAI,
  onStartLocal2P,
  onCreateRoom,
  onJoinRoom,
  onOpenHowToPlay,
  onOpenShareFriend,
  initialRoomCode = '',
  isDarkMode,
  isFullscreen = false,
  t,
}) => {
  const [aiTier, setAiTier] = useState<MatchTier>('smart');
  const [onlineTier, setOnlineTier] = useState<MatchTier>('casual');
  const [forcedCapture, setForcedCapture] = useState<boolean>(true);
  const [isPublicLive, setIsPublicLive] = useState<boolean>(true);
  const [inputCode, setInputCode] = useState<string>(initialRoomCode.toUpperCase());
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [liveMatches, setLiveMatches] = useState<LiveMatchListing[]>([]);

  useEffect(() => {
    if (initialRoomCode) {
      setInputCode(initialRoomCode.toUpperCase());
    }
  }, [initialRoomCode]);

  useEffect(() => {
    const unsubscribe = liveMatchRegistry.subscribe((matches) => {
      setLiveMatches(matches);
    });
    const timer = setInterval(() => {
      setLiveMatches(liveMatchRegistry.getLiveMatches());
    }, 2500);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const getTierName = (tier: MatchTier) => {
    if (tier === 'casual') return t.casualLabel;
    if (tier === 'smart') return t.smartLabel;
    return t.masterLabel;
  };

  const handleCreateNewRoom = () => {
    sounds.playClick();
    const newCode = generateRoomCode();
    const effectiveForced = onlineTier === 'master' ? true : forcedCapture;
    onCreateRoom(newCode, isPublicLive, effectiveForced, onlineTier);
  };

  const handleJoin = (role: 'guest' | 'spectator') => {
    sounds.playClick();
    const clean = normalizeRoomCode(inputCode);
    if (!isValidRoomCode(clean)) {
      sounds.playError();
      setErrorMsg(t.invalidCodeError);
      return;
    }
    setErrorMsg('');
    onJoinRoom(clean, role);
  };

  const amoledDark = isDarkMode && isFullscreen;
  const cardSurface = amoledDark
    ? 'bg-black border-white/15 shadow-none'
    : isDarkMode
    ? 'bg-slate-900/80 border-slate-800 shadow-xl shadow-teal-950/25'
    : 'bg-white border-slate-200/90 shadow-xl shadow-teal-900/5';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        {/* Left Side: Hero, Name, Play vs AI, 2-Player One Phone */}
        <div className="lg:col-span-6 flex flex-col">
          <div
            className={`p-5 sm:p-7 rounded-3xl border space-y-4 transition-all duration-300 h-full flex flex-col justify-between ${cardSurface}`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-bold tracking-wide ${
                    isDarkMode ? 'text-teal-400' : 'text-teal-700'
                  }`}
                >
                  {t.heroKicker}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onOpenHowToPlay();
                  }}
                  className={`text-xs font-bold hover:underline inline-flex items-center gap-1 cursor-pointer ${
                    isDarkMode ? 'text-amber-400' : 'text-amber-600'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{t.rulesBtn}</span>
                </button>
              </div>

              <div>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-balance">
                  {t.heroHeading}
                </h1>
                <p
                  className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {t.heroDesc}
                </p>
              </div>

              {/* Player Name Input */}
              <div className="pt-1">
                <label
                  htmlFor="lobby-player-name"
                  className={`block text-xs font-semibold mb-1.5 ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {t.yourName}
                </label>
                <input
                  id="lobby-player-name"
                  type="text"
                  value={playerName}
                  onChange={(e) => onUpdatePlayerName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  maxLength={20}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold outline-none transition-all ${
                    amoledDark
                      ? 'bg-neutral-950 border-white/20 text-slate-100 focus:border-teal-500'
                      : isDarkMode
                      ? 'bg-slate-800/80 border-slate-700 text-slate-100 focus:border-teal-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-600 focus:bg-white'
                  }`}
                />
              </div>

              {/* Forced Capture Rule Toggle */}
              <label
                className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-colors ${
                  forcedCapture
                    ? isDarkMode
                      ? 'bg-teal-500/12 border-teal-500/35'
                      : 'bg-teal-50/80 border-teal-200'
                    : amoledDark
                    ? 'bg-neutral-950 border-white/15'
                    : isDarkMode
                    ? 'bg-slate-800/50 border-slate-700/70'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  id="forced-capture-toggle"
                  type="checkbox"
                  checked={forcedCapture}
                  onChange={(e) => {
                    sounds.playClick();
                    setForcedCapture(e.target.checked);
                  }}
                  className="mt-0.5 h-4 w-4 rounded accent-teal-600"
                />
                <div className="text-left">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <ShieldAlert
                      className={`w-3.5 h-3.5 ${
                        forcedCapture ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'
                      }`}
                    />
                    {t.mandatoryJumpTitle}
                  </span>
                  <span
                    className={`text-[11px] block leading-snug mt-0.5 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {t.mandatoryJumpDesc}
                  </span>
                </div>
              </label>
            </div>

            {/* Solo & Local Play Actions */}
            <div className="space-y-3 pt-2">
              {/* AI Level & Total Moves Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {t.aiLevelLabel}
                  </span>
                  {aiTier === 'master' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      <Trophy className="w-3 h-3" />
                      {t.tournamentBadge}
                    </span>
                  )}
                </div>
                <div
                  className={`grid grid-cols-3 gap-1 p-1 rounded-xl border ${
                    amoledDark
                      ? 'bg-neutral-950 border-white/15'
                      : isDarkMode
                      ? 'bg-slate-800/80 border-slate-700'
                      : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  {TIER_OPTIONS.map(({ tier, limitLabel }) => (
                    <button
                      key={tier}
                      type="button"
                      data-testid={`ai-tier-${tier}`}
                      onClick={() => {
                        sounds.playClick();
                        setAiTier(tier);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1 ${
                        aiTier === tier
                          ? 'bg-teal-600 text-white shadow-sm'
                          : isDarkMode
                          ? 'text-slate-300 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>{getTierName(tier)}</span>
                      <span className="font-mono text-[11px] opacity-90">· {limitLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Play vs AI Button */}
              <button
                type="button"
                data-start="true"
                onClick={() => {
                  sounds.playClick();
                  onStartAI(aiTier, aiTier === 'master' ? true : forcedCapture);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-between gap-3 cursor-pointer ${
                  amoledDark
                    ? 'bg-neutral-950 border-white/20 hover:border-teal-500'
                    : isDarkMode
                    ? 'bg-slate-800/80 border-slate-700 hover:border-teal-500'
                    : 'bg-gradient-to-r from-teal-50 via-emerald-50/70 to-amber-50/60 border-teal-200 hover:border-teal-500 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-teal-600/25">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-sm truncate">{t.playVsAi}</div>
                    <p
                      className={`text-xs truncate ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {t.playVsAiDesc}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold shrink-0 flex items-center gap-1">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.playBtn}</span>
                </div>
              </button>

              {/* 2 Player in One Phone Button */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onStartLocal2P(forcedCapture);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-between gap-3 cursor-pointer ${
                  amoledDark
                    ? 'bg-neutral-950 border-white/20 hover:border-amber-500'
                    : isDarkMode
                    ? 'bg-slate-800/80 border-slate-700 hover:border-amber-500'
                    : 'bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-rose-50/60 border-amber-200 hover:border-amber-500 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/25">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-sm truncate">{t.twoPlayersPhone}</div>
                    <p
                      className={`text-xs truncate ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {t.twoPlayersPhoneDesc}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold shrink-0 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{t.twoPBadge}</span>
                </div>
              </button>

              {/* Share with Friend */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onOpenShareFriend();
                }}
                className={`w-full py-2.5 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                  isDarkMode
                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/20'
                    : 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>{t.shareWithFriend}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Online Multiplayer */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          {/* Create Online Room */}
          <div className={`p-5 sm:p-6 rounded-3xl border space-y-3.5 transition-all ${cardSurface}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-extrabold leading-tight">
                  {t.onlineMatchTitle}
                </h2>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t.onlineMatchDesc}
                </p>
              </div>
            </div>

            {/* Online Match 3 Modes: Casual ∞, Smart 50, Master 40 Tournament */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {t.onlineModeLabel}
                </span>
                {onlineTier === 'master' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    <Trophy className="w-3 h-3" />
                    {t.tournamentBadge}
                  </span>
                )}
              </div>
              <div
                className={`grid grid-cols-3 gap-1 p-1 rounded-xl border ${
                  amoledDark
                    ? 'bg-neutral-950 border-white/15'
                    : isDarkMode
                    ? 'bg-slate-800/80 border-slate-700'
                    : 'bg-slate-100 border-slate-200'
                }`}
              >
                {TIER_OPTIONS.map(({ tier, limitLabel }) => (
                  <button
                    key={tier}
                    type="button"
                    data-testid={`online-tier-${tier}`}
                    onClick={() => {
                      sounds.playClick();
                      setOnlineTier(tier);
                    }}
                    className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1 ${
                      onlineTier === tier
                        ? 'bg-teal-600 text-white shadow-sm'
                        : isDarkMode
                        ? 'text-slate-300 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{getTierName(tier)}</span>
                    <span className="font-mono text-[11px] opacity-90">· {limitLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Public vs Private Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsPublicLive(true);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isPublicLive
                    ? 'border-teal-500 bg-teal-500/12 text-teal-700 dark:text-teal-300'
                    : amoledDark
                    ? 'border-white/15 bg-neutral-950 text-slate-400'
                    : isDarkMode
                    ? 'border-slate-700 bg-slate-800/50 text-slate-400'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{t.publicLobby}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsPublicLive(false);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  !isPublicLive
                    ? 'border-amber-500 bg-amber-500/12 text-amber-700 dark:text-amber-300'
                    : amoledDark
                    ? 'border-white/15 bg-neutral-950 text-slate-400'
                    : isDarkMode
                    ? 'border-slate-700 bg-slate-800/50 text-slate-400'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t.privateInvite}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCreateNewRoom}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-teal-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.createOnlineRoom}</span>
            </button>
          </div>

          {/* Join Online Room */}
          <div className={`p-5 sm:p-6 rounded-3xl border space-y-3 transition-all ${cardSurface}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-extrabold leading-tight">
                  {t.joinExistingRoom}
                </h2>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t.joinExistingRoomDesc}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="join-room-code-input" className="sr-only">
                {t.roomCodeLabel}
              </label>
              <input
                id="join-room-code-input"
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value.toUpperCase());
                  if (errorMsg) setErrorMsg('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleJoin('guest');
                }}
                placeholder="SB1234"
                maxLength={8}
                className={`w-full px-4 py-2.5 rounded-xl border font-mono font-bold text-sm tracking-widest uppercase outline-none transition-all ${
                  amoledDark
                    ? 'bg-neutral-950 border-white/20 text-slate-100 focus:border-teal-500'
                    : isDarkMode
                    ? 'bg-slate-800/80 border-slate-700 text-slate-100 focus:border-teal-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-600 focus:bg-white'
                }`}
              />
              {errorMsg && (
                <p role="alert" className="mt-1.5 text-xs font-semibold text-rose-500">
                  {errorMsg}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleJoin('guest')}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.joinAsPlayer}</span>
              </button>

              <button
                type="button"
                onClick={() => handleJoin('spectator')}
                className={`py-2.5 px-3 rounded-xl border font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  amoledDark
                    ? 'border-white/20 bg-neutral-950 text-slate-200 hover:bg-neutral-900'
                    : isDarkMode
                    ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                    : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{t.watchLive}</span>
              </button>
            </div>
          </div>

          {/* Live Public Rooms Discovery */}
          <div className={`p-4 sm:p-5 rounded-3xl border space-y-2.5 transition-all ${cardSurface}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-500" />
                {t.liveOpenRooms}
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-500 tabular-nums">
                {liveMatches.length} {t.activeCount}
              </span>
            </div>

            {liveMatches.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-1">{t.noLiveRooms}</p>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {liveMatches.map((m) => (
                  <div
                    key={m.roomCode}
                    className={`flex items-center justify-between gap-2 p-2.5 rounded-2xl border text-xs ${
                      amoledDark
                        ? 'bg-neutral-950 border-white/15'
                        : isDarkMode
                        ? 'bg-slate-800/70 border-slate-700'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-teal-600 dark:text-teal-400">
                          {m.roomCode}
                        </span>
                        <span className="font-bold truncate">{m.hostName}</span>
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          {getTierName(m.matchTier || 'casual')} ·{' '}
                          {m.matchTier === 'master' ? '40' : m.matchTier === 'smart' ? '50' : '∞'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {m.guestName
                          ? `${m.guestName} · ${t.inProgressShort}`
                          : t.waitingOpponentShort}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!m.guestName && (
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            onJoinRoom(m.roomCode, 'guest');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] cursor-pointer"
                        >
                          {t.joinShort}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          onJoinRoom(m.roomCode, 'spectator');
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border font-bold text-[11px] cursor-pointer ${
                          isDarkMode
                            ? 'border-slate-600 text-slate-200 hover:bg-slate-700'
                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {t.watchShort}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
