import React, { useState, useMemo } from 'react';
import {
  Crown,
  RotateCcw,
  RefreshCw,
  Flag,
  FlipVertical2,
  Bot,
  Smartphone,
  Wifi,
  Trophy,
  Copy,
  Check,
  Eye,
  Swords,
  Maximize2,
  Minimize2,
  ArrowRight,
} from 'lucide-react';
import {
  BOARD_SIZE,
  Board,
  CheckersMove,
  Coord,
  GameMode,
  GameStatus,
  MatchTier,
  MoveRecord,
  PieceColor,
  RoundRecord,
  coordToNotation,
  countPieces,
  getLegalMoves,
  isDarkSquare,
} from '../game/checkers';
import { GameDataFooter } from './GameDataFooter';
import { sounds } from '../utils/sound';
import { Translations } from '../utils/translations';

interface CheckersBoardProps {
  mode: GameMode;
  matchTier: MatchTier;
  maxMoves: number | null;
  board: Board;
  currentTurn: PieceColor;
  lockedPiece: Coord | null;
  status: GameStatus;
  winner: PieceColor | 'draw' | null;
  winReason: string;
  myColor: PieceColor | null;
  forcedCapture: boolean;
  lastMove: { from: Coord; to: Coord } | null;
  playerNames: { red: string; ivory: string };
  scores: { red: number; ivory: number; draws: number };
  round: number;
  roomCode?: string | null;
  isSpectator?: boolean;
  isAIThinking?: boolean;
  canUndo?: boolean;
  rematchRequestedBy?: PieceColor | null;
  totalElapsedSeconds: number;
  currentRoundSeconds: number;
  currentRoundMoves: MoveRecord[];
  roundHistory: RoundRecord[];
  isDarkMode: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onMove: (move: CheckersMove) => void;
  onUndo?: () => void;
  onResign?: () => void;
  onNewRound: () => void;
  onSendReaction?: (emoji: string) => void;
  t: Translations;
}

const REACTION_EMOJIS = ['👏', '🔥', '😎', '🤝', '👑', '😮'];

export const CheckersBoard: React.FC<CheckersBoardProps> = ({
  mode,
  matchTier,
  maxMoves,
  board,
  currentTurn,
  lockedPiece,
  status,
  winner,
  winReason,
  myColor,
  forcedCapture,
  lastMove,
  playerNames,
  scores,
  round,
  roomCode,
  isSpectator = false,
  isAIThinking = false,
  canUndo = false,
  rematchRequestedBy = null,
  totalElapsedSeconds,
  currentRoundSeconds,
  currentRoundMoves,
  roundHistory,
  isDarkMode,
  isFullscreen,
  onToggleFullscreen,
  onMove,
  onUndo,
  onResign,
  onNewRound,
  onSendReaction,
  t,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Coord | null>(null);
  const [manualFlip, setManualFlip] = useState<boolean>(false);
  const [autoFlip2P, setAutoFlip2P] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const counts = useMemo(() => countPieces(board), [board]);

  const canInteract = useMemo(() => {
    if (status !== 'playing') return false;
    if (isSpectator) return false;
    if (mode === 'ai') return currentTurn === 'red' && !isAIThinking;
    if (mode === 'local-2p') return true;
    if (mode === 'online') return myColor !== null && currentTurn === myColor;
    return false;
  }, [status, isSpectator, mode, currentTurn, isAIThinking, myColor]);

  const legalMoves = useMemo(() => {
    if (status !== 'playing') return [];
    return getLegalMoves(board, currentTurn, lockedPiece, forcedCapture);
  }, [board, currentTurn, lockedPiece, forcedCapture, status]);

  const effectiveSelected = lockedPiece ?? selectedSquare;

  const movesForSelected = useMemo(() => {
    if (!effectiveSelected) return [];
    return legalMoves.filter(
      (m) => m.from.row === effectiveSelected.row && m.from.col === effectiveSelected.col
    );
  }, [effectiveSelected, legalMoves]);

  const mandatoryJumpOrigins = useMemo(() => {
    const hasCapture = legalMoves.some((m) => m.captured !== null);
    if (!hasCapture || !forcedCapture) return new Set<string>();
    return new Set(legalMoves.map((m) => `${m.from.row}-${m.from.col}`));
  }, [legalMoves, forcedCapture]);

  const isBoardFlipped = useMemo(() => {
    if (mode === 'online' && myColor === 'ivory') return !manualFlip;
    if (mode === 'local-2p' && autoFlip2P && currentTurn === 'ivory') return !manualFlip;
    return manualFlip;
  }, [mode, myColor, manualFlip, autoFlip2P, currentTurn]);

  const rowsOrder = useMemo(
    () => (isBoardFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]),
    [isBoardFlipped]
  );
  const colsOrder = useMemo(
    () => (isBoardFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]),
    [isBoardFlipped]
  );

  const handleSquareClick = (row: number, col: number) => {
    if (!canInteract) return;

    const matchingMove = movesForSelected.find(
      (m) => m.to.row === row && m.to.col === col
    );
    if (matchingMove) {
      setSelectedSquare(null);
      onMove(matchingMove);
      return;
    }

    if (lockedPiece) {
      sounds.playError();
      return;
    }

    const piece = board[row][col];
    if (piece && piece.color === currentTurn) {
      const pieceMoves = legalMoves.filter(
        (m) => m.from.row === row && m.from.col === col
      );
      if (pieceMoves.length > 0) {
        sounds.playClick();
        setSelectedSquare({ row, col });
      } else {
        sounds.playError();
        setSelectedSquare(null);
      }
      return;
    }

    setSelectedSquare(null);
  };

  const handleCopyInvite = () => {
    if (!roomCode) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        sounds.playClick();
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      })
      .catch(() => {});
  };

  const activeTurnLabel = (() => {
    if (status === 'waiting') return t.waitingForOpponent;
    if (status === 'won') {
      const wName = winner === 'red' ? playerNames.red : playerNames.ivory;
      return `${wName} ${t.winsRound} ${round}!`;
    }
    if (status === 'draw') return `${t.roundLabel} ${round} · ${t.roundDraw}`;
    if (isAIThinking) return `${playerNames.ivory} ${t.aiThinking}`;
    if (lockedPiece) return t.multiJumpNotice;
    const turnName = currentTurn === 'red' ? playerNames.red : playerNames.ivory;
    if (mode === 'online' && myColor === currentTurn) return `${t.yourTurn} (${turnName})`;
    return `${turnName}${t.turnSuffix}`;
  })();

  const modeBadge =
    mode === 'ai' ? (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-300">
        <Bot className="w-3.5 h-3.5" />
        {t.soloVsAi}
      </span>
    ) : mode === 'local-2p' ? (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
        <Smartphone className="w-3.5 h-3.5" />
        {t.twoPOnePhone}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
        <Wifi className="w-3.5 h-3.5" />
        {t.onlineMatchBadge}
      </span>
    );

  const tierName =
    matchTier === 'casual'
      ? t.casualLabel
      : matchTier === 'smart'
      ? t.smartLabel
      : t.masterLabel;

  const lastMoveRecord =
    currentRoundMoves.length > 0 ? currentRoundMoves[currentRoundMoves.length - 1] : null;
  const lastMoveFromLabel = lastMove ? coordToNotation(lastMove.from) : null;
  const lastMoveToLabel = lastMove ? coordToNotation(lastMove.to) : null;

  const amoledDark = isDarkMode && isFullscreen;
  const cardSurface = amoledDark
    ? 'bg-black border-white/15 shadow-none'
    : isDarkMode
    ? 'bg-slate-900/80 border-slate-800 shadow-lg'
    : 'bg-white/95 border-slate-200/90 shadow-lg shadow-teal-900/5';

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-x-6 lg:gap-y-4 items-start animate-fade-in">
      {/* Left Column on Desktop (Order 2 on mobile): 8x8 Board + Controls + Reactions */}
      <div className="order-2 lg:order-none lg:col-start-1 lg:col-span-7 lg:row-start-1 lg:row-span-2 flex flex-col items-center space-y-3">
        <div
          className={`w-full max-w-[520px] aspect-square p-2 sm:p-2.5 rounded-3xl border shadow-2xl transition-all ${
            amoledDark
              ? 'bg-black border-white/20 shadow-black'
              : isDarkMode
              ? 'bg-slate-900 border-slate-700/80 shadow-black/60'
              : 'bg-white border-slate-200 shadow-teal-950/10'
          }`}
        >
          <div
            role="grid"
            aria-label="8 by 8 Checkers Board"
            data-testid="checkers-board"
            className="w-full h-full grid grid-cols-8 grid-rows-8 rounded-2xl overflow-hidden border-2 border-teal-900/80 dark:border-teal-700/70"
          >
            {rowsOrder.map((row) =>
              colsOrder.map((col) => {
                const dark = isDarkSquare(row, col);
                const piece = board[row][col];
                const coordKey = `${row}-${col}`;
                const notation = coordToNotation({ row, col });
                const isSelected =
                  effectiveSelected?.row === row && effectiveSelected?.col === col;
                const targetMove = movesForSelected.find(
                  (m) => m.to.row === row && m.to.col === col
                );
                const isMandatoryJumpPiece =
                  canInteract && mandatoryJumpOrigins.has(coordKey);
                const isLastMoveFrom =
                  lastMove?.from.row === row && lastMove?.from.col === col;
                const isLastMoveTo =
                  lastMove?.to.row === row && lastMove?.to.col === col;

                const squareBg = dark
                  ? isLastMoveTo
                    ? 'bg-teal-600'
                    : isLastMoveFrom
                    ? 'bg-teal-700'
                    : 'bg-teal-800'
                  : 'bg-amber-50';

                const pieceLabel = piece
                  ? `${piece.color === 'red' ? 'Crimson' : 'Ivory'} ${
                      piece.isKing ? 'King' : 'piece'
                    }`
                  : 'empty';

                const moveHintLabel = targetMove
                  ? targetMove.captured
                    ? ', capture jump available'
                    : ', valid move'
                  : '';

                return (
                  <button
                    key={coordKey}
                    type="button"
                    data-testid={`square-${row}-${col}`}
                    data-notation={notation}
                    aria-label={`Square ${notation}, ${pieceLabel}${moveHintLabel}`}
                    onClick={() => handleSquareClick(row, col)}
                    className={`relative w-full h-full flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:z-10 transition-colors ${squareBg} ${
                      targetMove || (canInteract && piece?.color === currentTurn)
                        ? 'cursor-pointer'
                        : 'cursor-default'
                    }`}
                  >
                    {col === colsOrder[0] && (
                      <span
                        aria-hidden="true"
                        className={`absolute top-0.5 left-1 text-[9px] font-mono font-bold pointer-events-none select-none ${
                          dark ? 'text-teal-200/50' : 'text-teal-900/45'
                        }`}
                      >
                        {BOARD_SIZE - row}
                      </span>
                    )}
                    {row === rowsOrder[7] && (
                      <span
                        aria-hidden="true"
                        className={`absolute bottom-0.5 right-1 text-[9px] font-mono font-bold pointer-events-none select-none ${
                          dark ? 'text-teal-200/50' : 'text-teal-900/45'
                        }`}
                      >
                        {String.fromCharCode(65 + col)}
                      </span>
                    )}

                    {/* Last Move Origin Dot Marker */}
                    {isLastMoveFrom && !piece && (
                      <span
                        aria-hidden="true"
                        className="w-3 h-3 rounded-full border-2 border-dashed border-amber-300/80 bg-amber-300/20 pointer-events-none"
                      />
                    )}

                    {/* Last Move Destination Subtle Frame */}
                    {isLastMoveTo && !isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0.5 rounded-lg ring-1 ring-amber-300/60 pointer-events-none"
                      />
                    )}

                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0.5 rounded-lg ring-2 ring-amber-400 bg-amber-400/20 pointer-events-none"
                      />
                    )}

                    {targetMove && (
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none transition-transform ${
                          targetMove.captured
                            ? 'w-4/5 h-4/5 rounded-full border-4 border-amber-400 bg-amber-400/20 animate-pulse'
                            : 'w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-300/85 ring-4 ring-emerald-400/30 shadow'
                        }`}
                      />
                    )}

                    {piece && (
                      <div
                        className={`relative w-[76%] h-[76%] rounded-full transition-transform duration-150 flex items-center justify-center shadow-[0_4px_8px_rgba(0,0,0,0.42),inset_0_2px_3px_rgba(255,255,255,0.35)] ${
                          piece.color === 'red'
                            ? 'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-800 border-2 border-rose-200/85'
                            : 'bg-gradient-to-br from-white via-slate-100 to-slate-300 border-2 border-slate-500/85'
                        } ${isSelected ? 'scale-110 -translate-y-0.5' : ''} ${
                          isMandatoryJumpPiece ? 'animate-piece-pulse' : ''
                        }`}
                      >
                        <div
                          className={`w-[72%] h-[72%] rounded-full border flex items-center justify-center ${
                            piece.color === 'red'
                              ? 'border-rose-300/45 bg-rose-700/25'
                              : 'border-slate-400/50 bg-slate-200/40'
                          }`}
                        >
                          {piece.isKing && (
                            <Crown
                              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                piece.color === 'red'
                                  ? 'text-amber-300 drop-shadow'
                                  : 'text-amber-500 drop-shadow-sm'
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Controls Bar Below Board */}
        <div
          className={`w-full max-w-[520px] p-2.5 sm:p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-2 ${
            amoledDark
              ? 'bg-black border-white/15 text-slate-200'
              : isDarkMode
              ? 'bg-slate-900/75 border-slate-800 text-slate-200'
              : 'bg-white/90 border-slate-200 text-slate-700 shadow-sm'
          }`}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {mode !== 'online' && onUndo && (
              <button
                type="button"
                disabled={!canUndo || status !== 'playing'}
                onClick={() => {
                  sounds.playClick();
                  onUndo();
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  amoledDark
                    ? 'border-white/20 bg-neutral-950 hover:bg-neutral-900'
                    : isDarkMode
                    ? 'border-slate-700 bg-slate-800 hover:bg-slate-700'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.undo}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setManualFlip((f) => !f);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                amoledDark
                  ? 'border-white/20 bg-neutral-950 hover:bg-neutral-900'
                  : isDarkMode
                  ? 'border-slate-700 bg-slate-800 hover:bg-slate-700'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <FlipVertical2 className="w-3.5 h-3.5" />
              <span>{t.flip}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onToggleFullscreen();
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isFullscreen
                  ? 'border-teal-500 bg-teal-500/15 text-teal-400'
                  : isDarkMode
                  ? 'border-slate-700 bg-slate-800 hover:bg-slate-700'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
              <span>{isFullscreen ? t.fullscreenExit : t.fullscreenEnter}</span>
            </button>

            {mode === 'local-2p' && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setAutoFlip2P((v) => !v);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  autoFlip2P
                    ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-300'
                    : amoledDark
                    ? 'border-white/20 bg-neutral-950 text-slate-300'
                    : isDarkMode
                    ? 'border-slate-700 bg-slate-800 text-slate-300'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                <span>
                  {t.autoFlip}: {autoFlip2P ? t.onLabel : t.offLabel}
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {status === 'playing' && !isSpectator && onResign && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onResign();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{t.resign}</span>
              </button>
            )}

            {mode !== 'online' && (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onNewRound();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t.restart}</span>
              </button>
            )}
          </div>
        </div>

        {/* Online Emoji Reaction Strip */}
        {mode === 'online' && onSendReaction && (
          <div
            className={`w-full max-w-[520px] p-2 rounded-2xl border flex items-center justify-between gap-1 ${
              amoledDark
                ? 'bg-black border-white/15'
                : isDarkMode
                ? 'bg-slate-900/75 border-slate-800'
                : 'bg-white/90 border-slate-200 shadow-sm'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2">
              {t.reactLabel}
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onSendReaction(emoji);
                  }}
                  aria-label={`Send reaction ${emoji}`}
                  className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition-transform hover:scale-115 active:scale-90 cursor-pointer ${
                    isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Top on Desktop (Order 1 on mobile): Scoreboard + Last Move + Outcome */}
      <div className="order-1 lg:order-none lg:col-start-8 lg:col-span-5 lg:row-start-1 space-y-3.5">
        <div className={`rounded-3xl border p-3.5 sm:p-4 transition-all ${cardSurface}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              {modeBadge}
              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                ·
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                {t.roundLabel} {round}
              </span>
              {mode !== 'local-2p' && (
                <>
                  <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {tierName}
                    {matchTier === 'master' ? ` · ${t.tournamentBadge}` : ''}
                  </span>
                </>
              )}
              {isSpectator && (
                <>
                  <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Eye className="w-3.5 h-3.5" />
                    {t.spectating}
                  </span>
                </>
              )}
            </div>

            <div
              data-testid="turn-status"
              className={`text-xs sm:text-sm font-extrabold ${
                status === 'won'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : currentTurn === 'red'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-teal-700 dark:text-teal-300'
              }`}
            >
              {activeTurnLabel}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Crimson Player */}
            <div
              className={`flex items-center justify-between gap-2 p-2.5 rounded-2xl border transition-all ${
                status === 'playing' && currentTurn === 'red'
                  ? isDarkMode
                    ? 'bg-rose-500/15 border-rose-500/60 shadow-sm'
                    : 'bg-rose-50 border-rose-300 shadow-sm'
                  : amoledDark
                  ? 'bg-neutral-950 border-white/15'
                  : isDarkMode
                  ? 'bg-slate-800/50 border-slate-700/70'
                  : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 border-2 border-rose-200 shadow-sm shrink-0 flex items-center justify-center">
                  {status === 'playing' && currentTurn === 'red' && (
                    <span className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold truncate">{playerNames.red}</div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                    {counts.red} ({counts.redKings}K)
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[9px] font-semibold text-slate-400 uppercase">
                  {t.winsLabel}
                </div>
                <div className="text-base font-mono font-black tabular-nums text-rose-600 dark:text-rose-400">
                  {scores.red}
                </div>
              </div>
            </div>

            {/* Ivory Player */}
            <div
              className={`flex items-center justify-between gap-2 p-2.5 rounded-2xl border transition-all ${
                status === 'playing' && currentTurn === 'ivory'
                  ? isDarkMode
                    ? 'bg-teal-500/15 border-teal-400/60 shadow-sm'
                    : 'bg-teal-50 border-teal-400 shadow-sm'
                  : amoledDark
                  ? 'bg-neutral-950 border-white/15'
                  : isDarkMode
                  ? 'bg-slate-800/50 border-slate-700/70'
                  : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-50 to-slate-200 border-2 border-slate-500 shadow-sm shrink-0 flex items-center justify-center">
                  {status === 'playing' && currentTurn === 'ivory' && (
                    <span className="w-2 h-2 rounded-full bg-teal-700" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold truncate">{playerNames.ivory}</div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                    {counts.ivory} ({counts.ivoryKings}K)
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[9px] font-semibold text-slate-400 uppercase">
                  {t.winsLabel}
                </div>
                <div className="text-base font-mono font-black tabular-nums text-teal-600 dark:text-teal-400">
                  {scores.ivory}
                </div>
              </div>
            </div>
          </div>

          {/* Total Moves Limit & Last Move Readout Bar */}
          <div
            className={`mt-3 pt-2.5 border-t flex items-center justify-between gap-2 text-xs ${
              isDarkMode ? 'border-slate-800' : 'border-slate-200/70'
            }`}
          >
            <div
              data-testid="last-move-display"
              className="flex items-center gap-1.5 min-w-0 font-semibold"
            >
              <span className="text-slate-500 dark:text-slate-400 shrink-0">
                {t.lastMoveLabel}:
              </span>
              {lastMoveFromLabel && lastMoveToLabel ? (
                <span className="inline-flex items-center gap-1 font-mono font-extrabold text-amber-600 dark:text-amber-400 truncate">
                  <span>{lastMoveFromLabel}</span>
                  <ArrowRight className="w-3 h-3 shrink-0" />
                  <span>{lastMoveToLabel}</span>
                  {lastMoveRecord?.wasCapture && (
                    <span className="text-rose-500 text-[11px]">×</span>
                  )}
                </span>
              ) : (
                <span className="text-slate-400">{t.noMovesYet}</span>
              )}
            </div>

            <div
              data-testid="moves-limit-display"
              className="font-mono font-bold tabular-nums text-teal-700 dark:text-teal-300 shrink-0"
            >
              {t.movesLabel}: {currentRoundMoves.length} / {maxMoves ?? '∞'}
            </div>
          </div>
        </div>

        {/* Waiting for Opponent Banner */}
        {status === 'waiting' && roomCode && (
          <div
            className={`rounded-2xl border p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 ${
              isDarkMode
                ? 'bg-teal-950/50 border-teal-500/30 text-teal-100'
                : 'bg-teal-50 border-teal-200 text-teal-900'
            }`}
          >
            <div className="text-center sm:text-left min-w-0">
              <div className="text-xs font-extrabold">
                {roomCode} · {t.roomReadyTitle}
              </div>
              <p className="text-[11px] opacity-80">{t.roomReadyDesc}</p>
            </div>
            <button
              type="button"
              onClick={handleCopyInvite}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? t.copiedLink : t.copyInviteLink}</span>
            </button>
          </div>
        )}

        {/* Victory / Draw Outcome Banner */}
        {(status === 'won' || status === 'draw') && (
          <div
            role="status"
            data-testid="game-over-banner"
            className={`p-4 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-pop-in ${
              amoledDark
                ? 'bg-black border-amber-500/50 text-slate-100'
                : isDarkMode
                ? 'bg-slate-900 border-amber-500/40 text-slate-100'
                : 'bg-white border-amber-300 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-extrabold">
                  {status === 'draw'
                    ? t.matchDrawn
                    : `${winner === 'red' ? playerNames.red : playerNames.ivory} ${t.winsHeadline}`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{winReason}</p>
              </div>
            </div>

            {!isSpectator && (
              <button
                type="button"
                data-start="true"
                onClick={() => {
                  sounds.playClick();
                  onNewRound();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-teal-600/25 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>
                  {mode === 'online'
                    ? rematchRequestedBy === myColor
                      ? t.waitingShort
                      : rematchRequestedBy
                      ? t.acceptRematch
                      : t.rematch
                    : t.playAgain}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Bottom on Desktop (Order 3 on mobile): Match Analytics & Move Log */}
      <div className="order-3 lg:order-none lg:col-start-8 lg:col-span-5 lg:row-start-2">
        <GameDataFooter
          board={board}
          totalElapsedSeconds={totalElapsedSeconds}
          currentRoundSeconds={currentRoundSeconds}
          currentRoundMoves={currentRoundMoves}
          roundHistory={roundHistory}
          playerNames={playerNames}
          isDarkMode={isDarkMode}
          isFullscreen={isFullscreen}
          t={t}
        />
      </div>
    </div>
  );
};
