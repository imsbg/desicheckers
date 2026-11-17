import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Settings,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  QrCode,
  Copy,
  Check,
  Share2,
  LogIn,
  Eye,
  ShieldCheck,
  ArrowLeft,
  Globe,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { buildFriendSharePayload } from '../utils/urlRoute';
import { Language, Translations } from '../utils/translations';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  isFullscreen?: boolean;
  t: Translations;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  isFullscreen = false,
  t,
}) => {
  if (!isOpen) return null;
  const amoledDark = isDarkMode && isFullscreen;

  const modalCard = amoledDark
    ? 'bg-black border-white/15 text-slate-100'
    : isDarkMode
    ? 'bg-slate-900 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';

  const ruleBox = amoledDark
    ? 'bg-neutral-950 border-white/10'
    : isDarkMode
    ? 'bg-slate-800/60 border-slate-700'
    : 'bg-slate-50 border-slate-200';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-to-play-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in"
    >
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-xl p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-pop-in ${modalCard}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 id="how-to-play-title" className="font-display text-lg font-extrabold">
              {t.howToPlayTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.gotIt}
            className="p-2 rounded-xl hover:bg-slate-500/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <div className={`p-3.5 rounded-2xl border ${ruleBox}`}>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">{t.rule1Title}</h3>
            <p>{t.rule1Desc}</p>
          </div>

          <div className={`p-3.5 rounded-2xl border ${ruleBox}`}>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">{t.rule2Title}</h3>
            <p>{t.rule2Desc}</p>
          </div>

          <div className={`p-3.5 rounded-2xl border ${ruleBox}`}>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">{t.rule3Title}</h3>
            <p>{t.rule3Desc}</p>
          </div>

          <div className={`p-3.5 rounded-2xl border ${ruleBox}`}>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">{t.rule4Title}</h3>
            <p>{t.rule4Desc}</p>
          </div>

          <div className={`p-3.5 rounded-2xl border ${ruleBox}`}>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{t.ruleModesTitle}</h3>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <span className="font-mono font-extrabold text-teal-600 dark:text-teal-400 shrink-0 min-w-[2.2rem]">
                  ∞
                </span>
                <span>{t.ruleCasualDesc}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono font-extrabold text-sky-600 dark:text-sky-400 shrink-0 min-w-[2.2rem]">
                  50
                </span>
                <span>{t.ruleSmartDesc}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400 shrink-0 min-w-[2.2rem]">
                  40
                </span>
                <span>{t.ruleMasterDesc}</span>
              </li>
            </ul>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm cursor-pointer"
        >
          {t.gotIt}
        </button>
      </div>
    </div>
  );
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  isFullscreen: boolean;
  onToggleTheme: () => void;
  onToggleFullscreen: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  playerName: string;
  onUpdatePlayerName: (name: string) => void;
  t: Translations;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  isFullscreen,
  onToggleTheme,
  onToggleFullscreen,
  soundEnabled,
  onToggleSound,
  currentLanguage,
  onSelectLanguage,
  playerName,
  onUpdatePlayerName,
  t,
}) => {
  if (!isOpen) return null;
  const amoledDark = isDarkMode && isFullscreen;

  const modalCard = amoledDark
    ? 'bg-black border-white/15 text-slate-100'
    : isDarkMode
    ? 'bg-slate-900 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';

  const rowBtn = amoledDark
    ? 'bg-neutral-950 border-white/15 text-slate-100'
    : isDarkMode
    ? 'bg-slate-800/70 border-slate-700 text-slate-100'
    : 'bg-slate-50 border-slate-200 text-slate-800';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in"
    >
      <div className={`w-full max-w-md rounded-3xl border shadow-xl p-6 space-y-4 animate-pop-in ${modalCard}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <h2 id="settings-modal-title" className="font-display text-lg font-extrabold">
              {t.settingsTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.done}
            className="p-2 rounded-xl hover:bg-slate-500/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="settings-player-name"
              className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1"
            >
              {t.yourName}
            </label>
            <input
              id="settings-player-name"
              type="text"
              value={playerName}
              maxLength={20}
              onChange={(e) => onUpdatePlayerName(e.target.value)}
              placeholder={t.namePlaceholder}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
                amoledDark
                  ? 'bg-neutral-950 border-white/15 text-white'
                  : isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          {/* Language Picker */}
          <div className={`p-3 rounded-2xl border ${rowBtn}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2.5 text-sm font-bold">
                <Globe className="w-4 h-4 text-teal-500" />
                <span>{t.languageLabel}</span>
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onSelectLanguage('en');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    currentLanguage === 'en'
                      ? 'bg-teal-600 border-teal-500 text-white'
                      : isDarkMode
                      ? 'border-slate-700 text-slate-300'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onSelectLanguage('or');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    currentLanguage === 'or'
                      ? 'bg-teal-600 border-teal-500 text-white'
                      : isDarkMode
                      ? 'border-slate-700 text-slate-300'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  ଓଡ଼ିଆ
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onToggleTheme();
            }}
            className={`w-full flex items-center justify-between p-3 rounded-2xl border text-sm font-bold cursor-pointer ${rowBtn}`}
          >
            <span className="flex items-center gap-2.5">
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-teal-600" />
              )}
              <span>{t.appearanceTheme}</span>
            </span>
            <span className="text-xs text-teal-600 dark:text-teal-400">
              {isDarkMode ? t.darkMode : t.lightMode}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onToggleFullscreen();
            }}
            className={`w-full flex items-center justify-between p-3 rounded-2xl border text-sm font-bold cursor-pointer ${rowBtn}`}
          >
            <span className="flex items-center gap-2.5">
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-amber-500" />
              ) : (
                <Maximize2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              )}
              <span>{isFullscreen ? t.fullscreenExit : t.fullscreenEnter}</span>
            </span>
            <span className="text-xs text-teal-600 dark:text-teal-400">
              {isFullscreen ? t.onLabel : t.offLabel}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleSound();
              sounds.playClick();
            }}
            className={`w-full flex items-center justify-between p-3 rounded-2xl border text-sm font-bold cursor-pointer ${rowBtn}`}
          >
            <span className="flex items-center gap-2.5">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-rose-500" />
              )}
              <span>{t.soundEffects}</span>
            </span>
            <span className="text-xs text-teal-600 dark:text-teal-400">
              {soundEnabled ? t.soundOn : t.soundOff}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm cursor-pointer"
        >
          {t.done}
        </button>
      </div>
    </div>
  );
};

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  isDarkMode: boolean;
  isFullscreen?: boolean;
  t: Translations;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  isDarkMode,
  isFullscreen = false,
  t,
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;
  const amoledDark = isDarkMode && isFullscreen;

  const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    inviteUrl
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in"
    >
      <div
        className={`w-full max-w-sm rounded-3xl border shadow-xl p-6 text-center space-y-4 animate-pop-in ${
          amoledDark
            ? 'bg-black border-white/15 text-slate-100'
            : isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-teal-500" />
            <h2 id="qr-modal-title" className="font-display text-lg font-extrabold">
              {t.inviteQrTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.done}
            className="p-2 rounded-xl hover:bg-slate-500/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-white inline-block border border-slate-200 shadow-sm">
          <img
            src={qrUrl}
            alt={`QR code for room ${roomCode}`}
            referrerPolicy="no-referrer"
            className="w-44 h-44 mx-auto"
          />
        </div>

        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{t.roomCodeLabel}</div>
          <div className="text-2xl font-mono font-black tracking-widest text-teal-600 dark:text-teal-400">
            {roomCode}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(inviteUrl).catch(() => {});
            sounds.playClick();
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? t.copiedLink : t.copyInviteLink}</span>
        </button>
      </div>
    </div>
  );
};

interface ShareFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string | null;
  isDarkMode: boolean;
  isFullscreen?: boolean;
  currentLanguage: Language;
  onCopiedToast: (msg: string) => void;
  t: Translations;
}

export const ShareFriendModal: React.FC<ShareFriendModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  isDarkMode,
  isFullscreen = false,
  currentLanguage,
  onCopiedToast,
  t,
}) => {
  if (!isOpen) return null;
  const amoledDark = isDarkMode && isFullscreen;

  const payload = buildFriendSharePayload(roomCode, currentLanguage);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(payload.fullMessage)
      .then(() => {
        sounds.playClick();
        onCopiedToast(t.copiedToast);
        onClose();
      })
      .catch(() => {});
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: payload.title,
          text: payload.text,
          url: payload.url,
        });
        onClose();
        return;
      } catch {
        // fallback to copy
      }
    }
    handleCopy();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in"
    >
      <div
        className={`w-full max-w-md rounded-3xl border shadow-xl p-6 space-y-4 animate-pop-in ${
          amoledDark
            ? 'bg-black border-white/15 text-slate-100'
            : isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-500" />
            <h2 id="share-modal-title" className="font-display text-lg font-extrabold">
              {t.shareModalTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.done}
            className="p-2 rounded-xl hover:bg-slate-500/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className={`p-3.5 rounded-2xl border text-xs leading-relaxed font-mono break-all ${
            amoledDark
              ? 'bg-neutral-950 border-white/15'
              : isDarkMode
              ? 'bg-slate-800 border-slate-700'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          {payload.fullMessage}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
              amoledDark
                ? 'border-white/15 bg-neutral-950 hover:bg-neutral-900'
                : isDarkMode
                ? 'border-slate-700 bg-slate-800 hover:bg-slate-700'
                : 'border-slate-200 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{t.copyMessage}</span>
          </button>

          <button
            type="button"
            onClick={handleNativeShare}
            className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t.shareNow}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface JoinInviteModalProps {
  isOpen: boolean;
  roomCode: string;
  defaultName: string;
  onJoin: (name: string, role: 'guest' | 'spectator') => void;
  onCancel: () => void;
  isDarkMode: boolean;
  isFullscreen?: boolean;
  t: Translations;
}

export const JoinInviteModal: React.FC<JoinInviteModalProps> = ({
  isOpen,
  roomCode,
  defaultName,
  onJoin,
  onCancel,
  isDarkMode,
  isFullscreen = false,
  t,
}) => {
  const [name, setName] = useState(defaultName);
  if (!isOpen) return null;
  const amoledDark = isDarkMode && isFullscreen;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-invite-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in"
    >
      <div
        className={`w-full max-w-sm rounded-3xl border shadow-xl p-6 space-y-4 animate-pop-in ${
          amoledDark
            ? 'bg-black border-white/15 text-slate-100'
            : isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="text-center space-y-1">
          <div className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            {t.roomInviteBadge}
          </div>
          <h2 id="join-invite-title" className="font-display text-2xl font-black font-mono">
            {roomCode}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.roomInviteDesc}</p>
        </div>

        <div>
          <label htmlFor="invite-player-name" className="sr-only">
            {t.yourName}
          </label>
          <input
            id="invite-player-name"
            type="text"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold outline-none ${
              amoledDark
                ? 'bg-neutral-950 border-white/15 text-white'
                : isDarkMode
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onJoin(name, 'guest')}
            className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{t.joinGame}</span>
          </button>

          <button
            type="button"
            onClick={() => onJoin(name, 'spectator')}
            className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
              amoledDark
                ? 'border-white/15 bg-neutral-950 text-slate-200'
                : isDarkMode
                ? 'border-slate-700 bg-slate-800 text-slate-200'
                : 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t.watchLive}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
        >
          {t.cancel}
        </button>
      </div>
    </div>
  );
};

interface TermsPageProps {
  isDarkMode: boolean;
  isFullscreen?: boolean;
  onBack: () => void;
  t: Translations;
}

export const TermsPage: React.FC<TermsPageProps> = ({
  isDarkMode,
  isFullscreen = false,
  onBack,
  t,
}) => {
  const amoledDark = isDarkMode && isFullscreen;
  return (
    <div
      className={`w-full max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl border space-y-4 animate-fade-in ${
        amoledDark
          ? 'bg-black border-white/15 text-slate-200'
          : isDarkMode
          ? 'bg-slate-900/80 border-slate-800 text-slate-200'
          : 'bg-white border-slate-200 text-slate-800 shadow-lg'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h1 className="font-display text-xl font-extrabold">{t.termsPrivacy}</h1>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.backToGame}</span>
        </button>
      </div>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.termsBody1}</p>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.termsBody2}</p>
    </div>
  );
};
