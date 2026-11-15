import React from 'react';
import { Clock, History, Trophy, Shield, Crown, Swords } from 'lucide-react';
import {
  Board,
  MoveRecord,
  RoundRecord,
  countPieces,
  formatDuration,
} from '../game/checkers';
import { Translations } from '../utils/translations';

interface GameDataFooterProps {
  board: Board;
  totalElapsedSeconds: number;
  currentRoundSeconds: number;
  currentRoundMoves: MoveRecord[];
  roundHistory: RoundRecord[];
  playerNames: { red: string; ivory: string };
  isDarkMode: boolean;
  isFullscreen?: boolean;
  t: Translations;
}

export const GameDataFooter: React.FC<GameDataFooterProps> = ({
  board,
  totalElapsedSeconds,
  currentRoundSeconds,
  currentRoundMoves,
  roundHistory,
  playerNames,
  isDarkMode,
  isFullscreen = false,
  t,
}) => {
  const counts = countPieces(board);
  const redCapturedByIvory = 12 - counts.red;
  const ivoryCapturedByRed = 12 - counts.ivory;
  const amoledDark = isDarkMode && isFullscreen;

  const cardSurface = amoledDark
    ? 'bg-black border-white/15 text-slate-100'
    : isDarkMode
    ? 'bg-slate-900/75 border-slate-800 text-slate-100'
    : 'bg-white/90 border-slate-200/90 text-slate-900 shadow-lg shadow-teal-900/5';

  const tileSurface = amoledDark
    ? 'bg-neutral-950 border-white/10'
    : isDarkMode
    ? 'bg-slate-800/60 border-slate-700/70'
    : 'bg-slate-50 border-slate-200/80';

  const innerSurface = amoledDark
    ? 'bg-black border-white/10'
    : isDarkMode
    ? 'bg-slate-950/50 border-slate-800'
    : 'bg-slate-50/80 border-slate-200/80';

  const itemSurface = amoledDark
    ? 'bg-neutral-950 border border-white/10'
    : isDarkMode
    ? 'bg-slate-900/80'
    : 'bg-white border border-slate-200/70';

  return (
    <section
      aria-label="Match Analytics and Move Log"
      className={`w-full rounded-3xl border p-3.5 sm:p-4 space-y-3 transition-all ${cardSurface}`}
    >
      {/* Top 4 Stat Tiles */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`p-2.5 rounded-2xl border ${tileSurface}`}>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{t.matchTime}</span>
          </div>
          <div className="mt-0.5 text-sm sm:text-base font-mono font-extrabold tabular-nums">
            {formatDuration(totalElapsedSeconds)}
          </div>
        </div>

        <div className={`p-2.5 rounded-2xl border ${tileSurface}`}>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <Swords className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.roundTime}</span>
          </div>
          <div className="mt-0.5 text-sm sm:text-base font-mono font-extrabold tabular-nums">
            {formatDuration(currentRoundSeconds)}
          </div>
        </div>

        <div className={`p-2.5 rounded-2xl border ${tileSurface}`}>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 truncate">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {playerNames.red} · {t.capturesSuffix}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-sm sm:text-base font-mono font-extrabold tabular-nums">
            <span>{ivoryCapturedByRed}</span>
            <span className="text-[11px] font-sans font-semibold text-slate-500 dark:text-slate-400 inline-flex items-center gap-0.5">
              <Crown className="w-3 h-3 text-amber-500" />
              {counts.redKings}K
            </span>
          </div>
        </div>

        <div className={`p-2.5 rounded-2xl border ${tileSurface}`}>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-700 dark:text-teal-300 truncate">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {playerNames.ivory} · {t.capturesSuffix}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-sm sm:text-base font-mono font-extrabold tabular-nums">
            <span>{redCapturedByIvory}</span>
            <span className="text-[11px] font-sans font-semibold text-slate-500 dark:text-slate-400 inline-flex items-center gap-0.5">
              <Crown className="w-3 h-3 text-amber-500" />
              {counts.ivoryKings}K
            </span>
          </div>
        </div>
      </div>

      {/* Move Log */}
      <div className={`p-3 rounded-2xl border ${innerSurface}`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            {t.moveLog}
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-500 tabular-nums">
            {currentRoundMoves.length} {t.movesCountSuffix}
          </span>
        </div>

        {currentRoundMoves.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-1">{t.makeOpeningMove}</p>
        ) : (
          <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
            {[...currentRoundMoves].reverse().map((m) => (
              <div
                key={`${m.moveNumber}-${m.timestamp}`}
                className={`flex items-center justify-between text-xs px-2.5 py-1 rounded-lg ${itemSurface}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                    #{m.moveNumber}
                  </span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      m.player === 'red'
                        ? 'bg-rose-600'
                        : 'bg-slate-100 border border-slate-500'
                    }`}
                  />
                  <span className="font-semibold truncate">{m.playerName}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono font-bold text-[11px] shrink-0">
                  <span>{m.notation}</span>
                  {m.wasPromotion && (
                    <span className="text-amber-500" title="King">
                      👑
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Round History */}
      {roundHistory.length > 0 && (
        <div className={`p-3 rounded-2xl border ${innerSurface}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              {t.roundHistory}
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-500 tabular-nums">
              {roundHistory.length} {t.completedSuffix}
            </span>
          </div>

          <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
            {[...roundHistory].reverse().map((r) => (
              <div
                key={r.round}
                className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg ${itemSurface}`}
              >
                <div className="min-w-0">
                  <span className="font-bold">
                    {t.roundLabel} {r.round} ·{' '}
                  </span>
                  <span
                    className={
                      r.winner === 'red'
                        ? 'font-bold text-rose-500'
                        : r.winner === 'ivory'
                        ? 'font-bold text-teal-600 dark:text-teal-300'
                        : 'font-bold text-amber-500'
                    }
                  >
                    {r.winner === 'draw' ? t.drawText : `${r.winnerName} ${t.wonRoundText}`}
                  </span>
                  <span className="block text-[10px] text-slate-500 truncate">{r.reason}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-500 tabular-nums shrink-0">
                  {formatDuration(r.durationSeconds)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
