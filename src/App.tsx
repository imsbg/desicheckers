/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { LogOut, Sparkles, WifiOff } from 'lucide-react';
import {
  Board,
  CheckersMove,
  Coord,
  GameMode,
  GameStatus,
  MatchTier,
  MoveRecord,
  PieceColor,
  RoundRecord,
  applyCheckersMove,
  chooseBestAIMove,
  cloneBoard,
  coordToNotation,
  createInitialBoard,
  evaluateGameOutcome,
  getLegalMoves,
  getMaxMovesForTier,
  tierToDifficulty,
} from './game/checkers';
import {
  OnlineGameState,
  UserRole,
  WebRTCCheckersRoom,
  createInitialOnlineState,
} from './network/webrtc';
import { RoomHeader } from './components/RoomHeader';
import { RoomLobby } from './components/RoomLobby';
import { CheckersBoard } from './components/CheckersBoard';
import { PromoBanner } from './components/PromoBanner';
import { FloatingReaction, ReactionFloater } from './components/ReactionFloater';
import {
  HowToPlayModal,
  JoinInviteModal,
  QrModal,
  SettingsModal,
  ShareFriendModal,
  TermsPage,
} from './components/Modals';
import { sounds } from './utils/sound';
import { Language, TRANSLATIONS } from './utils/translations';
import { AppPage, detectPageFromUrl, isGithubBlogView } from './utils/urlRoute';

interface LocalSnapshot {
  board: Board;
  currentTurn: PieceColor;
  lockedPiece: Coord | null;
  noProgressMoves: number;
  lastMove: { from: Coord; to: Coord } | null;
  moves: MoveRecord[];
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sb_checkers_theme') === 'dark';
    } catch {
      return false;
    }
  });

  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    try {
      return Boolean(document.fullscreenElement);
    } catch {
      return false;
    }
  });

  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang');
      if (urlLang === 'or' || urlLang === 'en') return urlLang;
      const saved = localStorage.getItem('sb_checkers_lang');
      return saved === 'or' ? 'or' : 'en';
    } catch {
      return 'en';
    }
  });

  const t = TRANSLATIONS[currentLanguage];

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sounds.isEnabled());

  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('sb_checkers_player_name') ||
        `Player-${Math.floor(100 + Math.random() * 900)}`
      );
    } catch {
      return 'Player 1';
    }
  });

  const [currentPage, setCurrentPage] = useState<AppPage>(() => {
    try {
      return detectPageFromUrl(window.location.pathname);
    } catch {
      return 'home';
    }
  });

  // Active Mode: null = Lobby, 'ai' = Solo vs AI, 'local-2p' = 2P One Phone, 'online' = Online Match
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [localMatchTier, setLocalMatchTier] = useState<MatchTier>('smart');
  const [forcedCapture, setForcedCapture] = useState<boolean>(true);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);

  // Local (AI & 2P) State
  const [localBoard, setLocalBoard] = useState<Board>(() => createInitialBoard());
  const [localTurn, setLocalTurn] = useState<PieceColor>('red');
  const [localLockedPiece, setLocalLockedPiece] = useState<Coord | null>(null);
  const [localStatus, setLocalStatus] = useState<GameStatus>('playing');
  const [localWinner, setLocalWinner] = useState<PieceColor | 'draw' | null>(null);
  const [localWinReason, setLocalWinReason] = useState<string>('');
  const [localRound, setLocalRound] = useState<number>(1);
  const [localScores, setLocalScores] = useState({ red: 0, ivory: 0, draws: 0 });
  const [localNoProgress, setLocalNoProgress] = useState<number>(0);
  const [localLastMove, setLocalLastMove] = useState<{ from: Coord; to: Coord } | null>(null);
  const [localMoves, setLocalMoves] = useState<MoveRecord[]>([]);
  const [localHistory, setLocalHistory] = useState<RoundRecord[]>([]);
  const [undoStack, setUndoStack] = useState<LocalSnapshot[]>([]);

  // Online Match State
  const roomRef = useRef<WebRTCCheckersRoom | null>(null);
  const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<UserRole>('host');
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'connecting' | 'disconnected'
  >('disconnected');
  const [onlineState, setOnlineState] = useState<OnlineGameState>(() =>
    createInitialOnlineState('host', 'Player 1', 'p1', true, true, 'casual')
  );
  const [hostLeftRoom, setHostLeftRoom] = useState<boolean>(false);
  const [inviteRoomCode, setInviteRoomCode] = useState<string | null>(null);

  // Timers
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState<number>(0);
  const [currentRoundSeconds, setCurrentRoundSeconds] = useState<number>(0);

  // Modals & Toasts
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);
  const [isShareFriendOpen, setIsShareFriendOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevOutcomeRoundRef = useRef<number>(0);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  const triggerReaction = useCallback((emoji: string, sender: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const leftPercent = 18 + Math.random() * 64;
    setReactions((prev) => [...prev, { id, emoji, sender, leftPercent }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1600);
  }, []);

  // Sync theme class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('sb_checkers_theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  // Sync AMOLED black html/body background when Dark Mode + Fullscreen are active
  useEffect(() => {
    const amoled = isDarkMode && isFullscreen;
    document.documentElement.dataset.fullscreen = isFullscreen ? 'true' : 'false';
    if (amoled) {
      document.documentElement.style.backgroundColor = '#000000';
      document.body.style.backgroundColor = '#000000';
    } else {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    }
  }, [isDarkMode, isFullscreen]);

  // Listen to native fullscreenchange events
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Persist language preference & html lang attribute
  useEffect(() => {
    document.documentElement.lang = currentLanguage === 'or' ? 'or' : 'en';
    try {
      localStorage.setItem('sb_checkers_lang', currentLanguage);
    } catch {
      // ignore
    }
  }, [currentLanguage]);

  // Sync body dataset state for testability
  useEffect(() => {
    if (
      isGithubBlogView(
        window.location.hostname,
        window.location.pathname,
        window.location.search
      )
    ) {
      document.body.dataset.state = 'blog';
      return;
    }
    if (!gameMode) {
      document.body.dataset.state = 'lobby';
      return;
    }
    const activeStatus = gameMode === 'online' ? onlineState.status : localStatus;
    document.body.dataset.state =
      activeStatus === 'won' || activeStatus === 'draw' ? 'gameover' : 'playing';
  }, [gameMode, localStatus, onlineState.status]);

  // Handle ?room=SBXXXX and ?autostart=1 on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const autostartParam = params.get('autostart');

    if (roomParam && /^SB\d{4}$/i.test(roomParam.trim())) {
      setInviteRoomCode(roomParam.trim().toUpperCase());
    } else if (autostartParam === '1') {
      startLocalGame('ai', 'smart', true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup connections & AI timers on unmount
  useEffect(() => {
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      roomRef.current?.destroy();
    };
  }, []);

  // Match & Round elapsed timers
  useEffect(() => {
    if (!gameMode) return;
    const interval = setInterval(() => {
      setTotalElapsedSeconds((tSec) => tSec + 1);
      const status = gameMode === 'online' ? onlineState.status : localStatus;
      if (status === 'playing') {
        setCurrentRoundSeconds((rSec) => rSec + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameMode, localStatus, onlineState.status]);

  // Trigger confetti & win sound once when round completes
  useEffect(() => {
    if (!gameMode) return;
    const status = gameMode === 'online' ? onlineState.status : localStatus;
    const round = gameMode === 'online' ? onlineState.round : localRound;
    const winner = gameMode === 'online' ? onlineState.winner : localWinner;

    if ((status === 'won' || status === 'draw') && prevOutcomeRoundRef.current !== round) {
      prevOutcomeRoundRef.current = round;
      if (status === 'won') {
        sounds.playWin();
        const myOnlineColor = myRole === 'host' ? 'red' : myRole === 'guest' ? 'ivory' : null;
        const shouldCelebrate =
          gameMode !== 'online' || winner === myOnlineColor || myRole === 'spectator';
        if (shouldCelebrate) {
          try {
            confetti({
              particleCount: 75,
              spread: 65,
              origin: { y: 0.65 },
            });
          } catch {
            // ignore in headless env
          }
        }
      }
    }
  }, [
    gameMode,
    localStatus,
    localRound,
    localWinner,
    onlineState.status,
    onlineState.round,
    onlineState.winner,
    myRole,
  ]);

  const handleToggleFullscreen = async () => {
    if (isFullscreen) {
      setIsFullscreen(false);
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch {
        // fallback already exited UI fullscreen state
      }
    } else {
      setIsFullscreen(true);
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        // restricted iframe or headless fallback keeps UI fullscreen active
      }
    }
  };

  const handleUpdatePlayerName = (name: string) => {
    setPlayerName(name);
    try {
      localStorage.setItem('sb_checkers_player_name', name);
    } catch {
      // ignore
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
  };

  const handleToggleLanguage = () => {
    setCurrentLanguage((prev) => (prev === 'en' ? 'or' : 'en'));
  };

  const startLocalGame = (mode: 'ai' | 'local-2p', tier: MatchTier, forced: boolean) => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    roomRef.current?.destroy();
    roomRef.current = null;
    setCurrentRoomCode(null);
    setHostLeftRoom(false);
    setLocalMatchTier(mode === 'local-2p' ? 'casual' : tier);
    setForcedCapture(forced);
    setGameMode(mode);
    setLocalBoard(createInitialBoard());
    setLocalTurn('red');
    setLocalLockedPiece(null);
    setLocalStatus('playing');
    setLocalWinner(null);
    setLocalWinReason('');
    setLocalRound(1);
    setLocalScores({ red: 0, ivory: 0, draws: 0 });
    setLocalNoProgress(0);
    setLocalLastMove(null);
    setLocalMoves([]);
    setLocalHistory([]);
    setUndoStack([]);
    setTotalElapsedSeconds(0);
    setCurrentRoundSeconds(0);
    setIsAIThinking(false);
    prevOutcomeRoundRef.current = 0;
  };

  const tierLabelText =
    localMatchTier === 'master'
      ? t.masterLabel
      : localMatchTier === 'smart'
      ? t.smartLabel
      : t.casualLabel;

  const localPlayerNames = {
    red:
      gameMode === 'local-2p'
        ? playerName.trim() || t.player1Default
        : playerName.trim() || t.youDefault,
    ivory:
      gameMode === 'ai' ? `${t.aiNamePrefix} · ${tierLabelText}` : t.player2Default,
  };

  const localMaxMoves = gameMode === 'ai' ? getMaxMovesForTier(localMatchTier) : null;

  const executeLocalMove = useCallback(
    (
      move: CheckersMove,
      snapshotBoard: Board,
      snapshotTurn: PieceColor,
      snapshotLocked: Coord | null,
      snapshotNoProgress: number,
      snapshotLastMove: { from: Coord; to: Coord } | null,
      snapshotMoves: MoveRecord[],
      saveUndo: boolean
    ) => {
      if (saveUndo) {
        setUndoStack((prev) => [
          ...prev,
          {
            board: cloneBoard(snapshotBoard),
            currentTurn: snapshotTurn,
            lockedPiece: snapshotLocked,
            noProgressMoves: snapshotNoProgress,
            lastMove: snapshotLastMove,
            moves: snapshotMoves,
          },
        ]);
      }

      const applied = applyCheckersMove(snapshotBoard, move, snapshotTurn);
      const nextNoProgress =
        move.captured || applied.promoted ? 0 : snapshotNoProgress + 1;

      if (applied.promoted) {
        sounds.playKing();
      } else if (move.captured) {
        sounds.playCapture();
      } else {
        sounds.playMove();
      }

      const moverName =
        snapshotTurn === 'red' ? localPlayerNames.red : localPlayerNames.ivory;
      const sep = move.captured ? '×' : '→';
      const moveRec: MoveRecord = {
        moveNumber: snapshotMoves.length + 1,
        player: snapshotTurn,
        playerName: moverName,
        notation: `${coordToNotation(move.from)}${sep}${coordToNotation(move.to)}`,
        wasCapture: Boolean(move.captured),
        wasPromotion: applied.promoted,
        timestamp: Date.now(),
      };
      const nextMoves = [...snapshotMoves, moveRec];

      setLocalBoard(applied.board);
      setLocalTurn(applied.nextTurn);
      setLocalLockedPiece(applied.lockedPiece);
      setLocalNoProgress(nextNoProgress);
      setLocalLastMove({ from: move.from, to: move.to });
      setLocalMoves(nextMoves);

      if (applied.mustContinueJump) {
        return;
      }

      const outcome = evaluateGameOutcome(
        applied.board,
        applied.nextTurn,
        nextNoProgress,
        forcedCapture,
        nextMoves.length,
        localMaxMoves
      );

      if (outcome.status === 'won' || outcome.status === 'draw') {
        setLocalStatus(outcome.status);
        setLocalWinner(outcome.winner);
        setLocalWinReason(outcome.reason);
        setLocalScores((prev) => ({
          red: prev.red + (outcome.winner === 'red' ? 1 : 0),
          ivory: prev.ivory + (outcome.winner === 'ivory' ? 1 : 0),
          draws: prev.draws + (outcome.winner === 'draw' ? 1 : 0),
        }));
        const winName =
          outcome.winner === 'red'
            ? localPlayerNames.red
            : outcome.winner === 'ivory'
            ? localPlayerNames.ivory
            : t.drawText;
        setLocalHistory((prev) => [
          ...prev,
          {
            round: localRound,
            winner: outcome.winner || 'draw',
            winnerName: winName,
            reason: outcome.reason,
            movesCount: nextMoves.length,
            durationSeconds: Math.max(1, currentRoundSeconds),
          },
        ]);
      }
    },
    [
      forcedCapture,
      localMaxMoves,
      localPlayerNames.red,
      localPlayerNames.ivory,
      localRound,
      currentRoundSeconds,
      t.drawText,
    ]
  );

  // Automatic AI Turn Scheduler
  useEffect(() => {
    if (gameMode !== 'ai' || localStatus !== 'playing' || localTurn !== 'ivory') {
      setIsAIThinking(false);
      return;
    }

    setIsAIThinking(true);
    const delay = localLockedPiece ? 380 : 540;
    const difficulty = tierToDifficulty(localMatchTier);

    aiTimerRef.current = setTimeout(() => {
      const aiMove = chooseBestAIMove(
        localBoard,
        'ivory',
        difficulty,
        localLockedPiece,
        forcedCapture
      );
      if (aiMove) {
        executeLocalMove(
          aiMove,
          localBoard,
          'ivory',
          localLockedPiece,
          localNoProgress,
          localLastMove,
          localMoves,
          false
        );
      }
      setIsAIThinking(false);
    }, delay);

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [
    gameMode,
    localStatus,
    localTurn,
    localBoard,
    localLockedPiece,
    localNoProgress,
    localLastMove,
    localMoves,
    localMatchTier,
    forcedCapture,
    executeLocalMove,
  ]);

  const handleLocalMove = (move: CheckersMove) => {
    if (localStatus !== 'playing') return;
    if (gameMode === 'ai' && localTurn !== 'red') return;
    const legal = getLegalMoves(localBoard, localTurn, localLockedPiece, forcedCapture);
    const isValid = legal.some(
      (m) =>
        m.from.row === move.from.row &&
        m.from.col === move.from.col &&
        m.to.row === move.to.row &&
        m.to.col === move.to.col
    );
    if (!isValid) return;

    executeLocalMove(
      move,
      localBoard,
      localTurn,
      localLockedPiece,
      localNoProgress,
      localLastMove,
      localMoves,
      true
    );
  };

  const handleLocalUndo = () => {
    if (undoStack.length === 0 || localStatus !== 'playing' || isAIThinking) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setLocalBoard(prev.board);
    setLocalTurn(prev.currentTurn);
    setLocalLockedPiece(prev.lockedPiece);
    setLocalNoProgress(prev.noProgressMoves);
    setLocalLastMove(prev.lastMove);
    setLocalMoves(prev.moves);
  };

  const handleLocalResign = () => {
    if (localStatus !== 'playing') return;
    const winner: PieceColor =
      gameMode === 'ai' ? 'ivory' : localTurn === 'red' ? 'ivory' : 'red';
    const loserName =
      gameMode === 'ai'
        ? localPlayerNames.red
        : localTurn === 'red'
        ? localPlayerNames.red
        : localPlayerNames.ivory;
    const winnerName = winner === 'red' ? localPlayerNames.red : localPlayerNames.ivory;
    const reason = `${loserName} · ${t.resign}`;

    setLocalStatus('won');
    setLocalWinner(winner);
    setLocalWinReason(reason);
    setLocalScores((prev) => ({
      ...prev,
      red: prev.red + (winner === 'red' ? 1 : 0),
      ivory: prev.ivory + (winner === 'ivory' ? 1 : 0),
    }));
    setLocalHistory((prev) => [
      ...prev,
      {
        round: localRound,
        winner,
        winnerName,
        reason,
        movesCount: localMoves.length,
        durationSeconds: Math.max(1, currentRoundSeconds),
      },
    ]);
  };

  const handleLocalNewRound = () => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    const nextRound = localRound + 1;
    setLocalBoard(createInitialBoard());
    setLocalTurn('red');
    setLocalLockedPiece(null);
    setLocalStatus('playing');
    setLocalWinner(null);
    setLocalWinReason('');
    setLocalRound(nextRound);
    setLocalNoProgress(0);
    setLocalLastMove(null);
    setLocalMoves([]);
    setUndoStack([]);
    setCurrentRoundSeconds(0);
    setIsAIThinking(false);
    prevOutcomeRoundRef.current = 0;
  };

  // Online Room Connect
  const connectOnlineRoom = (
    roomCode: string,
    role: UserRole,
    customName?: string,
    isPublicLive: boolean = true,
    forced: boolean = true,
    matchTier: MatchTier = 'casual'
  ) => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    roomRef.current?.destroy();

    const activeName = (customName ?? playerName).trim() || t.player1Default;
    setCurrentRoomCode(roomCode);
    setMyRole(role);
    setGameMode('online');
    setHostLeftRoom(false);
    setTotalElapsedSeconds(0);
    setCurrentRoundSeconds(0);
    prevOutcomeRoundRef.current = 0;

    const room = new WebRTCCheckersRoom(
      roomCode,
      role,
      activeName,
      {
        onStateChange: (nextState) => {
          setOnlineState((prev) => {
            if (nextState.round !== prev.round) {
              setCurrentRoundSeconds(0);
            }
            if (nextState.currentRoundMoves.length > prev.currentRoundMoves.length) {
              const latest =
                nextState.currentRoundMoves[nextState.currentRoundMoves.length - 1];
              if (latest.wasPromotion) sounds.playKing();
              else if (latest.wasCapture) sounds.playCapture();
              else sounds.playMove();
            }
            return nextState;
          });
        },
        onRoleChange: (newRole) => {
          setMyRole(newRole);
        },
        onConnectionStatusChange: (status) => {
          setConnectionStatus(status);
        },
        onReactionReceived: (emoji, sender) => {
          triggerReaction(emoji, sender);
        },
        onNotification: (msg) => {
          showToast(msg);
        },
        onHostLeft: () => {
          setHostLeftRoom(true);
        },
      },
      isPublicLive,
      forced,
      matchTier
    );

    roomRef.current = room;
    room.connect();
  };

  const handleLeaveGame = () => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    roomRef.current?.destroy();
    roomRef.current = null;
    setCurrentRoomCode(null);
    setConnectionStatus('disconnected');
    setGameMode(null);
    setHostLeftRoom(false);
    setIsLeaveConfirmOpen(false);
    if (window.location.search.includes('room=')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const onlinePlayerNames = {
    red: onlineState.players.red?.name || t.hostCrimson,
    ivory: onlineState.players.ivory?.name || t.waitingGuest,
  };

  const myOnlineColor: PieceColor | null =
    myRole === 'host' ? 'red' : myRole === 'guest' ? 'ivory' : null;

  const amoledDark = isDarkMode && isFullscreen;

  return (
    <div
      data-amoled={amoledDark ? 'true' : 'false'}
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        amoledDark
          ? 'bg-black text-slate-100'
          : isDarkMode
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/35 text-slate-100'
          : 'bg-gradient-to-br from-slate-50 via-teal-50/45 to-amber-50/45 text-slate-900'
      }`}
    >
      {/* Sticky Floating Glassmorphic Header */}
      <RoomHeader
        roomCode={currentRoomCode}
        connectionStatus={connectionStatus}
        isInGame={gameMode !== null}
        isDarkMode={isDarkMode}
        isFullscreen={isFullscreen}
        onToggleTheme={() => setIsDarkMode((d) => !d)}
        onToggleFullscreen={handleToggleFullscreen}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        currentLanguage={currentLanguage}
        onToggleLanguage={handleToggleLanguage}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenQr={() => setIsQrOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onOpenShareFriend={() => setIsShareFriendOpen(true)}
        onOpenTerms={() => setCurrentPage('terms')}
        onLogoClick={() => {
          if (gameMode) {
            setIsLeaveConfirmOpen(true);
          } else {
            setCurrentPage('home');
          }
        }}
        onLeaveGame={() => setIsLeaveConfirmOpen(true)}
        t={t}
      />

      {/* Main Content */}
      <main className="flex-1 w-full px-3 sm:px-6 pt-5 pb-24 sm:pb-28">
        {currentPage === 'terms' ? (
          <TermsPage
            isDarkMode={isDarkMode}
            isFullscreen={isFullscreen}
            onBack={() => setCurrentPage('home')}
            t={t}
          />
        ) : gameMode === null ? (
          <RoomLobby
            playerName={playerName}
            onUpdatePlayerName={handleUpdatePlayerName}
            onStartAI={(tier, forced) => startLocalGame('ai', tier, forced)}
            onStartLocal2P={(forced) => startLocalGame('local-2p', 'casual', forced)}
            onCreateRoom={(code, isPublic, forced, matchTier) =>
              connectOnlineRoom(code, 'host', playerName, isPublic, forced, matchTier)
            }
            onJoinRoom={(code, role) =>
              connectOnlineRoom(code, role, playerName, true, true, 'casual')
            }
            onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
            onOpenShareFriend={() => setIsShareFriendOpen(true)}
            initialRoomCode={inviteRoomCode || ''}
            isDarkMode={isDarkMode}
            isFullscreen={isFullscreen}
            t={t}
          />
        ) : hostLeftRoom ? (
          <div
            className={`max-w-md mx-auto mt-10 p-6 rounded-3xl border text-center space-y-4 shadow-xl ${
              amoledDark
                ? 'bg-black border-white/15'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
              <WifiOff className="w-6 h-6" />
            </div>
            <h2 className="font-display text-xl font-extrabold">{t.hostLeftTitle}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.hostLeftDesc}</p>
            <button
              type="button"
              onClick={handleLeaveGame}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm cursor-pointer"
            >
              {t.backToLobby}
            </button>
          </div>
        ) : gameMode === 'online' ? (
          <CheckersBoard
            mode="online"
            matchTier={onlineState.matchTier || 'casual'}
            maxMoves={onlineState.maxMoves ?? null}
            board={onlineState.board}
            currentTurn={onlineState.currentTurn}
            lockedPiece={onlineState.lockedPiece}
            status={onlineState.status}
            winner={onlineState.winner}
            winReason={onlineState.winReason}
            myColor={myOnlineColor}
            forcedCapture={onlineState.forcedCapture}
            lastMove={onlineState.lastMove}
            playerNames={onlinePlayerNames}
            scores={onlineState.scores}
            round={onlineState.round}
            roomCode={currentRoomCode}
            isSpectator={myRole === 'spectator'}
            rematchRequestedBy={onlineState.rematchRequestedBy}
            totalElapsedSeconds={totalElapsedSeconds}
            currentRoundSeconds={currentRoundSeconds}
            currentRoundMoves={onlineState.currentRoundMoves}
            roundHistory={onlineState.roundHistory}
            isDarkMode={isDarkMode}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            onMove={(move) => roomRef.current?.submitMove(move)}
            onResign={() => roomRef.current?.resign()}
            onNewRound={() => roomRef.current?.requestRematch()}
            onSendReaction={(emoji) => roomRef.current?.sendReaction(emoji)}
            t={t}
          />
        ) : (
          <CheckersBoard
            mode={gameMode}
            matchTier={localMatchTier}
            maxMoves={localMaxMoves}
            board={localBoard}
            currentTurn={localTurn}
            lockedPiece={localLockedPiece}
            status={localStatus}
            winner={localWinner}
            winReason={localWinReason}
            myColor="red"
            forcedCapture={forcedCapture}
            lastMove={localLastMove}
            playerNames={localPlayerNames}
            scores={localScores}
            round={localRound}
            isAIThinking={isAIThinking}
            canUndo={undoStack.length > 0}
            totalElapsedSeconds={totalElapsedSeconds}
            currentRoundSeconds={currentRoundSeconds}
            currentRoundMoves={localMoves}
            roundHistory={localHistory}
            isDarkMode={isDarkMode}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            onMove={handleLocalMove}
            onUndo={handleLocalUndo}
            onResign={handleLocalResign}
            onNewRound={handleLocalNewRound}
            t={t}
          />
        )}
      </main>

      {/* Sticky Bottom Sponsored App Card */}
      <PromoBanner
        isDarkMode={isDarkMode}
        isFullscreen={isFullscreen}
        isOdia={currentLanguage === 'or'}
        t={t}
      />

      {/* Floating Emoji Reactions */}
      <ReactionFloater reactions={reactions} />

      {/* Modals */}
      {inviteRoomCode && !gameMode && (
        <JoinInviteModal
          isOpen={true}
          roomCode={inviteRoomCode}
          defaultName={playerName}
          onJoin={(name, role) => {
            const code = inviteRoomCode;
            setInviteRoomCode(null);
            handleUpdatePlayerName(name);
            connectOnlineRoom(code, role, name, true, true, 'casual');
          }}
          onCancel={() => {
            setInviteRoomCode(null);
            window.history.replaceState({}, '', window.location.pathname);
          }}
          isDarkMode={isDarkMode}
          isFullscreen={isFullscreen}
          t={t}
        />
      )}

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        isDarkMode={isDarkMode}
        isFullscreen={isFullscreen}
        t={t}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        isFullscreen={isFullscreen}
        onToggleTheme={() => setIsDarkMode((d) => !d)}
        onToggleFullscreen={handleToggleFullscreen}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        currentLanguage={currentLanguage}
        onSelectLanguage={(lang) => setCurrentLanguage(lang)}
        playerName={playerName}
        onUpdatePlayerName={handleUpdatePlayerName}
        t={t}
      />

      {currentRoomCode && (
        <QrModal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          roomCode={currentRoomCode}
          isDarkMode={isDarkMode}
          isFullscreen={isFullscreen}
          t={t}
        />
      )}

      <ShareFriendModal
        isOpen={isShareFriendOpen}
        onClose={() => setIsShareFriendOpen(false)}
        roomCode={currentRoomCode}
        isDarkMode={isDarkMode}
        isFullscreen={isFullscreen}
        currentLanguage={currentLanguage}
        onCopiedToast={showToast}
        t={t}
      />

      {/* Leave Match Confirmation Modal */}
      {isLeaveConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
        >
          <div
            className={`w-full max-w-sm rounded-3xl border shadow-2xl p-6 text-center space-y-4 animate-pop-in ${
              amoledDark
                ? 'bg-black border-white/15 text-slate-100'
                : isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 id="leave-confirm-title" className="font-display text-lg font-extrabold">
                {t.leaveConfirmTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.leaveConfirmDesc}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsLeaveConfirmOpen(false);
                }}
                className={`py-2.5 px-4 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                  amoledDark
                    ? 'border-white/15 bg-neutral-950 text-slate-200 hover:bg-neutral-900'
                    : isDarkMode
                    ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                    : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t.stayBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  handleLeaveGame();
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.leave}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed top-16 right-4 sm:right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl border shadow-2xl text-xs font-semibold animate-pop-in ${
            amoledDark
              ? 'bg-black text-white border-white/20'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
