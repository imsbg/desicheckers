/**
 * WebRTC PeerJS + BroadcastChannel Networking Engine for SBXXXX Checkers Rooms
 */

import Peer, { DataConnection } from 'peerjs';
import {
  Board,
  CheckersMove,
  Coord,
  GameStatus,
  MatchTier,
  MoveRecord,
  PieceColor,
  RoundRecord,
  applyCheckersMove,
  coordToNotation,
  createInitialBoard,
  evaluateGameOutcome,
  getLegalMoves,
  getMaxMovesForTier,
  getOppositeColor,
} from '../game/checkers';
import { liveMatchRegistry } from './liveLobby';

export type UserRole = 'host' | 'guest' | 'spectator';

export interface PlayerInfo {
  name: string;
  role: UserRole;
  color: PieceColor | null;
  id: string;
}

export interface OnlineGameState {
  board: Board;
  currentTurn: PieceColor;
  startingTurn: PieceColor;
  lockedPiece: Coord | null;
  status: GameStatus;
  winner: PieceColor | 'draw' | null;
  winReason: string;
  round: number;
  scores: {
    red: number;
    ivory: number;
    draws: number;
  };
  players: {
    red: PlayerInfo | null;
    ivory: PlayerInfo | null;
  };
  spectators: Array<{ id: string; name: string }>;
  rematchRequestedBy: PieceColor | null;
  matchStartTime: number;
  roundStartTime: number;
  noProgressMoves: number;
  lastMove: { from: Coord; to: Coord } | null;
  currentRoundMoves: MoveRecord[];
  roundHistory: RoundRecord[];
  isPublicLive: boolean;
  forcedCapture: boolean;
  matchTier: MatchTier;
  maxMoves: number | null;
}

export type NetworkMessage =
  | { type: 'STATE_SYNC'; payload: OnlineGameState }
  | { type: 'JOIN_REQUEST'; role: 'guest' | 'spectator'; name: string; peerId: string }
  | {
      type: 'JOIN_ACCEPTED';
      role: UserRole;
      color: PieceColor | null;
      state: OnlineGameState;
      targetPeerId?: string;
    }
  | { type: 'MAKE_MOVE'; move: CheckersMove; player: PieceColor; round: number }
  | { type: 'RESIGN'; player: PieceColor; round: number }
  | { type: 'REMATCH_REQ'; player: PieceColor; round: number }
  | { type: 'REMATCH_ACCEPT'; round: number }
  | { type: 'REACTION'; emoji: string; sender: string }
  | { type: 'PLAYER_LEAVE'; peerId: string }
  | { type: 'HOST_LEFT'; roomCode: string }
  | { type: 'PING' };

export interface NetworkCallbacks {
  onStateChange: (state: OnlineGameState) => void;
  onRoleChange?: (role: UserRole) => void;
  onConnectionStatusChange: (
    status: 'connected' | 'connecting' | 'disconnected',
    error?: string
  ) => void;
  onReactionReceived: (emoji: string, sender: string) => void;
  onNotification?: (message: string) => void;
  onHostLeft?: () => void;
}

const PEER_PREFIX = 'desicheckers-sb-';

export function createInitialOnlineState(
  role: UserRole,
  myName: string,
  myId: string,
  isPublicLive: boolean = true,
  forcedCapture: boolean = true,
  matchTier: MatchTier = 'casual'
): OnlineGameState {
  const now = Date.now();
  return {
    board: createInitialBoard(),
    currentTurn: 'red',
    startingTurn: 'red',
    lockedPiece: null,
    status: 'waiting',
    winner: null,
    winReason: '',
    round: 1,
    scores: { red: 0, ivory: 0, draws: 0 },
    players: {
      red: role === 'host' ? { name: myName, role: 'host', color: 'red', id: myId } : null,
      ivory: role === 'guest' ? { name: myName, role: 'guest', color: 'ivory', id: myId } : null,
    },
    spectators: role === 'spectator' ? [{ id: myId, name: myName }] : [],
    rematchRequestedBy: null,
    matchStartTime: now,
    roundStartTime: now,
    noProgressMoves: 0,
    lastMove: null,
    currentRoundMoves: [],
    roundHistory: [],
    isPublicLive,
    forcedCapture,
    matchTier,
    maxMoves: getMaxMovesForTier(matchTier),
  };
}

export class WebRTCCheckersRoom {
  public roomCode: string;
  public myRole: UserRole;
  public myName: string;
  public myId: string;
  public isPublicLive: boolean;
  public forcedCapture: boolean;
  public matchTier: MatchTier;
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private callbacks: NetworkCallbacks;
  private state: OnlineGameState;
  private isDestroyed = false;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    roomCode: string,
    role: UserRole,
    myName: string,
    callbacks: NetworkCallbacks,
    isPublicLive: boolean = true,
    forcedCapture: boolean = true,
    matchTier: MatchTier = 'casual'
  ) {
    this.roomCode = roomCode.toUpperCase();
    this.myRole = role;
    this.myName = myName.trim() || (role === 'host' ? 'Host' : 'Guest');
    this.myId = `${role}-${Math.random().toString(36).slice(2, 9)}`;
    this.isPublicLive = isPublicLive;
    this.forcedCapture = forcedCapture;
    this.matchTier = matchTier;
    this.callbacks = callbacks;
    this.state = createInitialOnlineState(
      role,
      this.myName,
      this.myId,
      isPublicLive,
      forcedCapture,
      matchTier
    );
  }

  public connect(): void {
    this.callbacks.onConnectionStatusChange('connecting');
    this.setupBroadcastChannel();
    this.setupPeerJS();

    if (this.myRole === 'host') {
      this.publishPublicListing();
      this.callbacks.onStateChange(this.state);
    }
  }

  private setupBroadcastChannel(): void {
    if (typeof BroadcastChannel === 'undefined') return;
    try {
      this.broadcastChannel = new BroadcastChannel(`desicheckers-room-${this.roomCode}`);
      this.broadcastChannel.onmessage = (event) => {
        if (this.isDestroyed) return;
        const msg = event.data as NetworkMessage;
        this.handleMessage(msg, 'broadcast');
      };

      if (this.myRole !== 'host') {
        this.broadcastChannel.postMessage({
          type: 'JOIN_REQUEST',
          role: this.myRole === 'spectator' ? 'spectator' : 'guest',
          name: this.myName,
          peerId: this.myId,
        } satisfies NetworkMessage);
      }
    } catch {
      this.broadcastChannel = null;
    }
  }

  private setupPeerJS(): void {
    const hostPeerId = `${PEER_PREFIX}${this.roomCode}`;
    const myPeerId = this.myRole === 'host' ? hostPeerId : `${hostPeerId}-${this.myId}`;

    try {
      const peer = new Peer(myPeerId, {
        debug: 0,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });
      this.peer = peer;

      peer.on('open', () => {
        if (this.isDestroyed) return;
        if (this.myRole === 'host') {
          this.callbacks.onConnectionStatusChange('connected');
        } else {
          this.connectToHostPeer(hostPeerId);
        }
      });

      peer.on('connection', (conn) => {
        if (this.isDestroyed) return;
        this.registerConnection(conn);
      });

      peer.on('error', (err) => {
        if (this.isDestroyed) return;
        if (this.myRole === 'host') {
          // Room still works locally or on same browser via BroadcastChannel
          this.callbacks.onConnectionStatusChange('connected');
        } else if (err.type === 'peer-unavailable') {
          this.callbacks.onConnectionStatusChange('connecting', 'Waiting for host...');
          if (this.retryTimer) clearTimeout(this.retryTimer);
          this.retryTimer = setTimeout(() => {
            if (!this.isDestroyed && this.connections.size === 0) {
              this.connectToHostPeer(hostPeerId);
            }
          }, 2500);
        }
      });
    } catch {
      if (this.myRole === 'host') {
        this.callbacks.onConnectionStatusChange('connected');
      }
    }
  }

  private connectToHostPeer(hostPeerId: string): void {
    if (!this.peer || this.isDestroyed) return;
    try {
      const conn = this.peer.connect(hostPeerId, { reliable: true });
      this.registerConnection(conn);
    } catch {
      // ignore
    }
  }

  private registerConnection(conn: DataConnection): void {
    conn.on('open', () => {
      if (this.isDestroyed) return;
      this.connections.set(conn.peer, conn);
      this.callbacks.onConnectionStatusChange('connected');

      if (this.myRole !== 'host') {
        conn.send({
          type: 'JOIN_REQUEST',
          role: this.myRole === 'spectator' ? 'spectator' : 'guest',
          name: this.myName,
          peerId: this.myId,
        } satisfies NetworkMessage);
      }
    });

    conn.on('data', (raw) => {
      if (this.isDestroyed) return;
      this.handleMessage(raw as NetworkMessage, conn.peer);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      if (this.myRole !== 'host' && this.connections.size === 0) {
        this.callbacks.onConnectionStatusChange('disconnected');
      }
    });
  }

  private broadcast(msg: NetworkMessage): void {
    for (const conn of this.connections.values()) {
      if (conn.open) {
        try {
          conn.send(msg);
        } catch {
          // ignore
        }
      }
    }
    try {
      this.broadcastChannel?.postMessage(msg);
    } catch {
      // ignore
    }
  }

  private publishPublicListing(): void {
    if (this.myRole !== 'host' || !this.state.isPublicLive) return;
    liveMatchRegistry.upsertMatch({
      roomCode: this.roomCode,
      hostName: this.state.players.red?.name || this.myName,
      guestName: this.state.players.ivory?.name || null,
      status: this.state.status,
      spectatorCount: this.state.spectators.length,
      forcedCapture: this.state.forcedCapture,
      matchTier: this.state.matchTier,
      updatedAt: Date.now(),
    });
  }

  private handleMessage(msg: NetworkMessage, senderPeer: string): void {
    if (!msg || typeof msg !== 'object') return;

    switch (msg.type) {
      case 'JOIN_REQUEST': {
        if (this.myRole !== 'host') return;
        let assignedRole: UserRole = msg.role === 'spectator' ? 'spectator' : 'guest';
        let assignedColor: PieceColor | null = null;

        if (assignedRole === 'guest' && !this.state.players.ivory) {
          this.state = {
            ...this.state,
            status: this.state.status === 'waiting' ? 'playing' : this.state.status,
            players: {
              ...this.state.players,
              ivory: { name: msg.name, role: 'guest', color: 'ivory', id: msg.peerId },
            },
          };
          assignedColor = 'ivory';
          this.callbacks.onNotification?.(`${msg.name} joined the match!`);
        } else if (
          assignedRole === 'guest' &&
          this.state.players.ivory &&
          this.state.players.ivory.id === msg.peerId
        ) {
          assignedColor = 'ivory';
        } else {
          assignedRole = 'spectator';
          const exists = this.state.spectators.some((s) => s.id === msg.peerId);
          if (!exists) {
            this.state = {
              ...this.state,
              spectators: [...this.state.spectators, { id: msg.peerId, name: msg.name }],
            };
            this.callbacks.onNotification?.(`${msg.name} is watching live`);
          }
        }

        const acceptedMsg: NetworkMessage = {
          type: 'JOIN_ACCEPTED',
          role: assignedRole,
          color: assignedColor,
          state: this.state,
          targetPeerId: msg.peerId,
        };

        const directConn = this.connections.get(senderPeer);
        if (directConn && directConn.open) {
          directConn.send(acceptedMsg);
        }
        this.broadcastChannel?.postMessage(acceptedMsg);
        this.syncHostState();
        break;
      }

      case 'JOIN_ACCEPTED': {
        if (this.myRole === 'host') return;
        if (msg.targetPeerId && msg.targetPeerId !== this.myId) return;
        if (msg.role !== this.myRole) {
          this.myRole = msg.role;
          this.callbacks.onRoleChange?.(msg.role);
        }
        this.state = msg.state;
        this.callbacks.onConnectionStatusChange('connected');
        this.callbacks.onStateChange(this.state);
        break;
      }

      case 'STATE_SYNC': {
        if (this.myRole === 'host') return;
        this.state = msg.payload;
        this.callbacks.onStateChange(this.state);
        break;
      }

      case 'MAKE_MOVE': {
        if (this.myRole !== 'host') return;
        if (msg.round !== this.state.round) return;
        this.executeHostMove(msg.move, msg.player);
        break;
      }

      case 'RESIGN': {
        if (this.myRole !== 'host') return;
        if (msg.round !== this.state.round) return;
        this.executeHostResign(msg.player);
        break;
      }

      case 'REMATCH_REQ': {
        if (this.myRole !== 'host') return;
        if (msg.round !== this.state.round) return;
        this.handleHostRematchRequest(msg.player);
        break;
      }

      case 'REMATCH_ACCEPT': {
        if (this.myRole !== 'host') return;
        if (msg.round !== this.state.round) return;
        this.startNewHostRound();
        break;
      }

      case 'REACTION': {
        this.callbacks.onReactionReceived(msg.emoji, msg.sender);
        if (this.myRole === 'host' && senderPeer !== 'self') {
          // Relay reactions to other peers
          for (const [pid, conn] of this.connections.entries()) {
            if (pid !== senderPeer && conn.open) {
              conn.send(msg);
            }
          }
        }
        break;
      }

      case 'HOST_LEFT': {
        if (this.myRole !== 'host') {
          this.callbacks.onHostLeft?.();
        }
        break;
      }
    }
  }

  private syncHostState(): void {
    this.callbacks.onStateChange(this.state);
    this.broadcast({ type: 'STATE_SYNC', payload: this.state });
    this.publishPublicListing();
  }

  public submitMove(move: CheckersMove): void {
    const myColor: PieceColor | null =
      this.myRole === 'host' ? 'red' : this.myRole === 'guest' ? 'ivory' : null;
    if (!myColor) return;

    if (this.myRole === 'host') {
      this.executeHostMove(move, myColor);
    } else {
      this.broadcast({
        type: 'MAKE_MOVE',
        move,
        player: myColor,
        round: this.state.round,
      });
    }
  }

  private executeHostMove(move: CheckersMove, player: PieceColor): void {
    if (this.state.status !== 'playing') return;
    if (this.state.currentTurn !== player) return;

    const legal = getLegalMoves(
      this.state.board,
      player,
      this.state.lockedPiece,
      this.state.forcedCapture
    );
    const matched = legal.find(
      (m) =>
        m.from.row === move.from.row &&
        m.from.col === move.from.col &&
        m.to.row === move.to.row &&
        m.to.col === move.to.col
    );
    if (!matched) return;

    const applied = applyCheckersMove(this.state.board, matched, player);
    const noProgress =
      matched.captured || applied.promoted ? 0 : this.state.noProgressMoves + 1;

    const playerName =
      player === 'red'
        ? this.state.players.red?.name || 'Crimson'
        : this.state.players.ivory?.name || 'Ivory';

    const sep = matched.captured ? '×' : '→';
    const moveRecord: MoveRecord = {
      moveNumber: this.state.currentRoundMoves.length + 1,
      player,
      playerName,
      notation: `${coordToNotation(matched.from)}${sep}${coordToNotation(matched.to)}`,
      wasCapture: Boolean(matched.captured),
      wasPromotion: applied.promoted,
      timestamp: Date.now(),
    };

    const nextMoves = [...this.state.currentRoundMoves, moveRecord];

    if (applied.mustContinueJump) {
      this.state = {
        ...this.state,
        board: applied.board,
        currentTurn: applied.nextTurn,
        lockedPiece: applied.lockedPiece,
        noProgressMoves: noProgress,
        lastMove: { from: matched.from, to: matched.to },
        currentRoundMoves: nextMoves,
      };
      this.syncHostState();
      return;
    }

    const outcome = evaluateGameOutcome(
      applied.board,
      applied.nextTurn,
      noProgress,
      this.state.forcedCapture,
      nextMoves.length,
      this.state.maxMoves
    );

    if (outcome.status === 'won' || outcome.status === 'draw') {
      const nextScores = { ...this.state.scores };
      let winnerName = 'Draw';
      if (outcome.winner === 'red') {
        nextScores.red += 1;
        winnerName = this.state.players.red?.name || 'Crimson';
      } else if (outcome.winner === 'ivory') {
        nextScores.ivory += 1;
        winnerName = this.state.players.ivory?.name || 'Ivory';
      } else {
        nextScores.draws += 1;
      }

      const roundRecord: RoundRecord = {
        round: this.state.round,
        winner: outcome.winner || 'draw',
        winnerName,
        reason: outcome.reason,
        movesCount: nextMoves.length,
        durationSeconds: Math.max(
          1,
          Math.floor((Date.now() - this.state.roundStartTime) / 1000)
        ),
      };

      this.state = {
        ...this.state,
        board: applied.board,
        currentTurn: applied.nextTurn,
        lockedPiece: null,
        status: outcome.status,
        winner: outcome.winner,
        winReason: outcome.reason,
        scores: nextScores,
        noProgressMoves: noProgress,
        lastMove: { from: matched.from, to: matched.to },
        currentRoundMoves: nextMoves,
        roundHistory: [...this.state.roundHistory, roundRecord],
      };
    } else {
      this.state = {
        ...this.state,
        board: applied.board,
        currentTurn: applied.nextTurn,
        lockedPiece: null,
        noProgressMoves: noProgress,
        lastMove: { from: matched.from, to: matched.to },
        currentRoundMoves: nextMoves,
      };
    }

    this.syncHostState();
  }

  public resign(): void {
    const myColor: PieceColor | null =
      this.myRole === 'host' ? 'red' : this.myRole === 'guest' ? 'ivory' : null;
    if (!myColor) return;
    if (this.myRole === 'host') {
      this.executeHostResign(myColor);
    } else {
      this.broadcast({ type: 'RESIGN', player: myColor, round: this.state.round });
    }
  }

  private executeHostResign(resigner: PieceColor): void {
    if (this.state.status !== 'playing') return;
    const winner: PieceColor = resigner === 'red' ? 'ivory' : 'red';
    const nextScores = { ...this.state.scores };
    if (winner === 'red') nextScores.red += 1;
    else nextScores.ivory += 1;

    const winnerName =
      winner === 'red'
        ? this.state.players.red?.name || 'Crimson'
        : this.state.players.ivory?.name || 'Ivory';
    const loserName =
      resigner === 'red'
        ? this.state.players.red?.name || 'Crimson'
        : this.state.players.ivory?.name || 'Ivory';

    const reason = `${loserName} resigned`;
    const roundRecord: RoundRecord = {
      round: this.state.round,
      winner,
      winnerName,
      reason,
      movesCount: this.state.currentRoundMoves.length,
      durationSeconds: Math.max(
        1,
        Math.floor((Date.now() - this.state.roundStartTime) / 1000)
      ),
    };

    this.state = {
      ...this.state,
      status: 'won',
      winner,
      winReason: reason,
      scores: nextScores,
      roundHistory: [...this.state.roundHistory, roundRecord],
    };
    this.syncHostState();
  }

  public requestRematch(): void {
    const myColor: PieceColor | null =
      this.myRole === 'host' ? 'red' : this.myRole === 'guest' ? 'ivory' : null;
    if (!myColor) return;

    if (this.myRole === 'host') {
      this.handleHostRematchRequest(myColor);
    } else {
      this.broadcast({
        type: 'REMATCH_REQ',
        player: myColor,
        round: this.state.round,
      });
    }
  }

  private handleHostRematchRequest(player: PieceColor): void {
    if (this.state.rematchRequestedBy && this.state.rematchRequestedBy !== player) {
      this.startNewHostRound();
    } else {
      this.state = { ...this.state, rematchRequestedBy: player };
      this.syncHostState();
    }
  }

  private startNewHostRound(): void {
    const nextRound = this.state.round + 1;
    const nextStarter = getOppositeColor(this.state.startingTurn || 'red');
    this.state = {
      ...this.state,
      board: createInitialBoard(),
      currentTurn: nextStarter,
      startingTurn: nextStarter,
      lockedPiece: null,
      status: this.state.players.ivory ? 'playing' : 'waiting',
      winner: null,
      winReason: '',
      round: nextRound,
      rematchRequestedBy: null,
      roundStartTime: Date.now(),
      noProgressMoves: 0,
      lastMove: null,
      currentRoundMoves: [],
    };
    this.syncHostState();
  }

  public sendReaction(emoji: string): void {
    this.callbacks.onReactionReceived(emoji, this.myName);
    this.broadcast({ type: 'REACTION', emoji, sender: this.myName });
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    if (this.retryTimer) clearTimeout(this.retryTimer);

    if (this.myRole === 'host') {
      this.broadcast({ type: 'HOST_LEFT', roomCode: this.roomCode });
      liveMatchRegistry.removeMatch(this.roomCode);
    }

    for (const conn of this.connections.values()) {
      try {
        conn.close();
      } catch {
        // ignore
      }
    }
    this.connections.clear();

    try {
      this.peer?.destroy();
    } catch {
      // ignore
    }
    try {
      this.broadcastChannel?.close();
    } catch {
      // ignore
    }
  }
}
