import React, { useState, useEffect } from 'react';
import {
  Home,
  Copy,
  Check,
  QrCode,
  Share2,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Settings,
  Wifi,
  WifiOff,
  LogOut,
  Menu,
  X,
  HelpCircle,
  ShieldCheck,
  Globe,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { Language, Translations } from '../utils/translations';

interface RoomHeaderProps {
  roomCode: string | null;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  isInGame: boolean;
  isDarkMode: boolean;
  isFullscreen: boolean;
  onToggleTheme: () => void;
  onToggleFullscreen: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentLanguage: Language;
  onToggleLanguage: () => void;
  onOpenSettings: () => void;
  onOpenQr: () => void;
  onOpenHowToPlay: () => void;
  onOpenShareFriend: () => void;
  onOpenTerms: () => void;
  onLogoClick: () => void;
  onLeaveGame?: () => void;
  t: Translations;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  roomCode,
  connectionStatus,
  isInGame,
  isDarkMode,
  isFullscreen,
  onToggleTheme,
  onToggleFullscreen,
  soundEnabled,
  onToggleSound,
  currentLanguage,
  onToggleLanguage,
  onOpenSettings,
  onOpenQr,
  onOpenHowToPlay,
  onOpenShareFriend,
  onOpenTerms,
  onLogoClick,
  onLeaveGame,
  t,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine !== false : true
  );

  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const wifiState: 'connected' | 'connecting' | 'disconnected' = roomCode
    ? connectionStatus
    : isBrowserOnline
    ? 'connected'
    : 'disconnected';

  const wifiLabel =
    wifiState === 'connected'
      ? t.connected
      : wifiState === 'connecting'
      ? t.connecting
      : t.offline;

  const wifiColorClasses =
    wifiState === 'connected'
      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
      : wifiState === 'connecting'
      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';

  const handleCopyInviteLink = () => {
    if (!roomCode) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        sounds.playClick();
        setTimeout(() => setCopied(false), 2200);
      })
      .catch(() => {});
  };

  const amoledDark = isDarkMode && isFullscreen;

  return (
    <header className="w-full sticky top-2.5 sm:top-3.5 z-30 px-2.5 sm:px-6 pt-2">
      <div
        className={`w-full max-w-6xl mx-auto flex items-center justify-between gap-2 py-2 sm:py-2.5 px-3 sm:px-5 rounded-2xl sm:rounded-3xl border md:backdrop-blur-md transition-colors duration-200 ${
          amoledDark
            ? 'border-white/15 bg-black shadow-md'
            : isDarkMode
            ? 'border-slate-800 bg-slate-900/95 shadow-md'
            : 'border-slate-200/90 bg-white/95 shadow-sm md:shadow-md'
        }`}
      >
        {/* Left: Home link + Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <a
            href="https://imsbg.github.io/desigames/"
            onClick={() => sounds.playClick()}
            title={t.homeTitle}
            aria-label={t.homeTitle}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 whitespace-nowrap shrink-0 ${
              isDarkMode
                ? 'bg-teal-500/15 border-teal-500/30 text-teal-300 hover:bg-teal-500/25'
                : 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100'
            }`}
          >
            <Home className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline sm:inline">{t.home}</span>
          </a>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onLogoClick();
            }}
            className="flex items-center gap-2 sm:gap-2.5 min-w-0 text-left group focus:outline-none cursor-pointer"
          >
            <img
              src="./logo.svg"
              alt=""
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-md shadow-teal-900/20 shrink-0 group-hover:scale-105 transition-transform"
            />

            <div className="min-w-0 overflow-hidden">
              <span className="block font-display text-sm sm:text-lg font-extrabold leading-tight truncate tracking-tight">
                {t.appTitle}
              </span>
              <span
                className={`${
                  roomCode ? 'hidden md:block' : 'hidden sm:block'
                } text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight truncate`}
              >
                {t.appSubtitle}
              </span>
            </div>
          </button>

          {roomCode && (
            <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl border bg-teal-500/10 border-teal-500/25 text-teal-700 dark:text-teal-300 text-[11px] sm:text-xs font-mono font-bold tracking-wider shrink-0">
              <span>{roomCode}</span>
              <button
                type="button"
                onClick={handleCopyInviteLink}
                title={t.copyInviteLink}
                aria-label={t.copyInviteLink}
                className="p-0.5 hover:text-teal-500 transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onOpenQr();
                }}
                title={t.inviteQrTitle}
                aria-label={t.inviteQrTitle}
                className="p-0.5 hover:text-teal-500 transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold whitespace-nowrap ${wifiColorClasses}`}
          >
            {wifiState === 'disconnected' ? (
              <WifiOff className="w-3 h-3" />
            ) : (
              <Wifi className="w-3 h-3" />
            )}
            <span>{wifiLabel}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onToggleLanguage();
              }}
              aria-label="Switch Language"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                amoledDark
                  ? 'border-white/20 bg-black text-teal-300 hover:bg-neutral-900'
                  : isDarkMode
                  ? 'border-slate-700 bg-slate-800/70 text-teal-300 hover:bg-slate-800'
                  : 'border-slate-200 bg-white/80 text-teal-700 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currentLanguage === 'or' ? 'ଓଡ଼ିଆ' : 'EN'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onOpenHowToPlay();
              }}
              title={t.howToPlay}
              aria-label={t.howToPlay}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                amoledDark
                  ? 'border-white/20 bg-black text-slate-200 hover:bg-neutral-900'
                  : isDarkMode
                  ? 'border-slate-700 bg-slate-800/70 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onOpenShareFriend();
              }}
              title={t.shareWithFriend}
              aria-label={t.shareWithFriend}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                amoledDark
                  ? 'border-white/20 bg-black text-slate-200 hover:bg-neutral-900'
                  : isDarkMode
                  ? 'border-slate-700 bg-slate-800/70 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Share2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                onToggleSound();
                sounds.playClick();
              }}
              title={soundEnabled ? t.soundOn : t.soundOff}
              aria-label={soundEnabled ? t.soundOn : t.soundOff}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                amoledDark
                  ? 'border-white/20 bg-black text-slate-200 hover:bg-neutral-900'
                  : isDarkMode
                  ? 'border-slate-700 bg-slate-800/70 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-rose-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onToggleTheme();
              }}
              title={isDarkMode ? t.lightMode : t.darkMode}
              aria-label={isDarkMode ? t.lightMode : t.darkMode}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                amoledDark
                  ? 'border-white/20 bg-black text-amber-400 hover:bg-neutral-900'
                  : isDarkMode
                  ? 'border-slate-700 bg-slate-800/70 text-amber-400 hover:bg-slate-800'
                  : 'border-slate-200 bg-white/80 text-teal-700 hover:bg-slate-100'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onToggleFullscreen();
              }}
              title={isFullscreen ? t.fullscreenExit : t.fullscreenEnter}
              aria-label={isFullscreen ? t.fullscreenExit : t.fullscreenEnter}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isFullscreen
                  ? 'border-teal-500 bg-teal-500/15 text-teal-400'
                  : isDarkMode
                  ? 'border-slate-700 bg-slate-800/70 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onOpenSettings();
              }}
              title={t.settings}
              aria-label={t.settings}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                amoledDark
                  ? 'border-white/20 bg-black text-slate-200 hover:bg-neutral-900'
                  : isDarkMode
                  ? 'border-slate-700 bg-slate-800/70 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>

            {isInGame && onLeaveGame && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onLeaveGame();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.leave}</span>
              </button>
            )}
          </div>

          {/* Mobile Quick Actions */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onToggleLanguage();
              }}
              aria-label="Switch Language"
              className={`px-2 py-1.5 rounded-xl border text-[11px] font-bold ${
                amoledDark
                  ? 'border-white/20 bg-black text-teal-300'
                  : isDarkMode
                  ? 'border-slate-700 bg-slate-800/70 text-teal-300'
                  : 'border-slate-200 bg-white/80 text-teal-700'
              }`}
            >
              {currentLanguage === 'or' ? 'ଓଡ଼ିଆ' : 'EN'}
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onToggleFullscreen();
              }}
              aria-label={isFullscreen ? t.fullscreenExit : t.fullscreenEnter}
              className={`p-2 rounded-xl border transition-colors ${
                isFullscreen
                  ? 'border-teal-500 bg-teal-500/15 text-teal-400'
                  : isDarkMode
                  ? 'border-slate-700 bg-slate-800/70 text-slate-200'
                  : 'border-slate-200 bg-white/80 text-slate-700'
              }`}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              aria-expanded={isMobileMenuOpen}
              aria-label="Open menu"
              className={`p-2 rounded-xl border transition-colors ${
                amoledDark
                  ? 'border-white/20 bg-black text-slate-200'
                  : isDarkMode
                  ? 'border-slate-700 bg-slate-800/70 text-slate-200'
                  : 'border-slate-200 bg-white/80 text-slate-700'
              }`}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div
          role="menu"
          className={`md:hidden mt-2 max-w-6xl mx-auto p-3 rounded-2xl border shadow-lg space-y-2 animate-fade-in ${
            amoledDark
              ? 'bg-black border-white/15 text-slate-100'
              : isDarkMode
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://imsbg.github.io/desigames/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                isDarkMode
                  ? 'border-teal-500/30 bg-teal-500/10 text-teal-300'
                  : 'border-teal-200 bg-teal-50 text-teal-700'
              }`}
            >
              <Home className="w-4 h-4 shrink-0" />
              <span className="truncate">{t.home}</span>
            </a>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                sounds.playClick();
                setIsMobileMenuOpen(false);
                onOpenHowToPlay();
              }}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                isDarkMode
                  ? 'border-slate-800 bg-slate-800/60 text-slate-200'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-teal-500 shrink-0" />
              <span className="truncate">{t.howToPlay}</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                sounds.playClick();
                setIsMobileMenuOpen(false);
                onToggleTheme();
              }}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                isDarkMode
                  ? 'border-slate-800 bg-slate-800/60 text-amber-400'
                  : 'border-slate-200 bg-slate-50 text-teal-700'
              }`}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 shrink-0" />
              )}
              <span className="truncate">{isDarkMode ? t.lightMode : t.darkMode}</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onToggleSound();
                sounds.playClick();
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                soundEnabled
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : isDarkMode
                  ? 'border-slate-800 bg-slate-800/60 text-slate-400'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 shrink-0" />
              ) : (
                <VolumeX className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span className="truncate">{soundEnabled ? t.soundOn : t.soundOff}</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                sounds.playClick();
                setIsMobileMenuOpen(false);
                onOpenShareFriend();
              }}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                isDarkMode
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                  : 'border-amber-200 bg-amber-50 text-amber-700'
              }`}
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span className="truncate">{t.shareWithFriend}</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                sounds.playClick();
                setIsMobileMenuOpen(false);
                onOpenSettings();
              }}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                isDarkMode
                  ? 'border-slate-800 bg-slate-800/60 text-slate-200'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <Settings className="w-4 h-4 text-teal-500 shrink-0" />
              <span className="truncate">{t.settings}</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                sounds.playClick();
                setIsMobileMenuOpen(false);
                onOpenTerms();
              }}
              className={`col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                isDarkMode
                  ? 'border-slate-800 bg-slate-800/60 text-slate-200'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="truncate">{t.termsPrivacy}</span>
            </button>
          </div>

          {isInGame && onLeaveGame && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                sounds.playClick();
                setIsMobileMenuOpen(false);
                onLeaveGame();
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.leaveMatch}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
