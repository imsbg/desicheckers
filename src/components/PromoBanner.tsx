import React, { useState } from 'react';
import { Download, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';
import { sounds } from '../utils/sound';
import { Translations } from '../utils/translations';

export const SPONSORED_APP = {
  appName: 'Odia Bhasa App',
  appNameOr: 'ଓଡ଼ିଆ ଭାଷା ଆପ୍',
  appLogoUrl: 'https://imsbg.github.io/odiabhasa/images/app.png',
  downloadButtonUrl: 'https://play.google.com/store/apps/details?id=in.sandeep.odiabhasa',
};

interface PromoBannerProps {
  isDarkMode: boolean;
  isFullscreen?: boolean;
  isOdia?: boolean;
  t: Translations;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
  isDarkMode,
  isFullscreen = false,
  isOdia = false,
  t,
}) => {
  const [imageError, setImageError] = useState(false);
  const amoledDark = isDarkMode && isFullscreen;

  return (
    <aside
      aria-label="Sponsored Application"
      className={`fixed bottom-2 left-2 right-2 sm:bottom-3 sm:left-4 sm:right-4 max-w-3xl mx-auto z-40 rounded-2xl border shadow-md md:shadow-xl p-2 sm:p-3 ${
        amoledDark
          ? 'bg-black border-white/15 text-slate-100'
          : isDarkMode
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      <div className="flex items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative shrink-0">
            {SPONSORED_APP.appLogoUrl && !imageError ? (
              <img
                src={SPONSORED_APP.appLogoUrl}
                alt={`${SPONSORED_APP.appName} logo`}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl object-cover border border-teal-500/20 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-teal-600 to-amber-500 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}
            <span
              className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
              title="Verified App"
            >
              <ShieldCheck className="h-2 w-2 text-white" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shrink-0">
                {t.sponsoredBadge}
              </span>
              <h4 className="font-bold text-xs sm:text-sm truncate">
                {isOdia ? SPONSORED_APP.appNameOr : SPONSORED_APP.appName}
              </h4>
            </div>
            <p
              className={`text-[11px] sm:text-xs truncate max-w-[200px] xs:max-w-xs sm:max-w-md ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {t.sponsoredDesc}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <a
            href={SPONSORED_APP.downloadButtonUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sounds.playClick()}
            className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-md shadow-teal-600/25 active:scale-95 transition-all whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.downloadNow}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-75 hidden sm:inline" />
          </a>
        </div>
      </div>
    </aside>
  );
};
