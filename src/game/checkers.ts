/**
 * Pure Checkers (American Draughts) Rules Engine & Minimax AI
 * Decoupled from React/DOM for deterministic unit testing.
 */

export type PieceColor = 'red' | 'ivory';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type MatchTier = 'casual' | 'smart' | 'master';
export type GameMode = 'ai' | 'local-2p' | 'online';
export type GameStatus = 'waiting' | 'playing' | 'won' | 'draw';

export function getMaxMovesForTier(tier: MatchTier): number | null {
  if (tier === 'smart') return 50;
  if (tier === 'master') return 40;
  return null;
}

export function tierToDifficulty(tier: MatchTier): AIDifficulty {
  if (tier === 'casual') return 'easy';
  if (tier === 'smart') return 'medium';
  return 'hard';
}

export interface Piece {
  color: PieceColor;
  isKing: boolean;
}

export type Board = (Piece | null)[][];

export interface Coord {
  row: number;
  col: number;
}

export interface CheckersMove {
  from: Coord;
  to: Coord;
  captured: Coord | null;
  promoted: boolean;
}

export interface MoveRecord {
  moveNumber: number;
  player: PieceColor;
  playerName: string;
  notation: string;
  wasCapture: boolean;
  wasPromotion: boolean;
  timestamp: number;
}

export interface RoundRecord {
  round: number;
  winner: PieceColor | 'draw';
  winnerName: string;
  reason: string;
  movesCount: number;
  durationSeconds: number;
}

export const BOARD_SIZE = 8;
export const NO_PROGRESS_DRAW_LIMIT = 40;

export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 3) {
          board[row][col] = { color: 'ivory', isKing: false };
        } else if (row > 4) {
          board[row][col] = { color: 'red', isKing: false };
        }
      }
    }
  }

  return board;
}

export function cloneBoard(board: Board): Board {
  const copy: Board = new Array(BOARD_SIZE);
  for (let r = 0; r < BOARD_SIZE; r++) {
    const srcRow = board[r];
    const dstRow: (Piece | null)[] = new Array(BOARD_SIZE);
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = srcRow[c];
      dstRow[c] = cell ? { color: cell.color, isKing: cell.isKing } : null;
    }
    copy[r] = dstRow;
  }
  return copy;
}

export function isInsideBoard(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function isDarkSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 1;
}

export function coordToNotation(coord: Coord): string {
  const file = String.fromCharCode(65 + coord.col); // A-H
  const rank = BOARD_SIZE - coord.row; // 8 down to 1
  return `${file}${rank}`;
}

export function getForwardRowDelta(color: PieceColor): number {
  // Red starts at rows 5-7 and moves UP toward row 0 (-1)
  // Ivory starts at rows 0-2 and moves DOWN toward row 7 (+1)
  return color === 'red' ? -1 : 1;
}

function getMoveRowDeltas(piece: Piece): number[] {
  if (piece.isKing) return [-1, 1];
  return [getForwardRowDelta(piece.color)];
}

export function getCaptureMovesForPiece(board: Board, row: number, col: number): CheckersMove[] {
  const piece = board[row]?.[col];
  if (!piece) return [];

  const rowDeltas = getMoveRowDeltas(piece);
  const captures: CheckersMove[] = [];

  for (const dr of rowDeltas) {
    for (const dc of [-1, 1]) {
      const midR = row + dr;
      const midC = col + dc;
      const landR = row + dr * 2;
      const landC = col + dc * 2;

      if (!isInsideBoard(landR, landC)) continue;

      const midPiece = board[midR][midC];
      const landCell = board[landR][landC];

      if (midPiece && midPiece.color !== piece.color && landCell === null) {
        const promoted =
          !piece.isKing &&
          ((piece.color === 'red' && landR === 0) ||
            (piece.color === 'ivory' && landR === BOARD_SIZE - 1));

        captures.push({
          from: { row, col },
          to: { row: landR, col: landC },
          captured: { row: midR, col: midC },
          promoted,
        });
      }
    }
  }

  return captures;
}

export function getSimpleMovesForPiece(board: Board, row: number, col: number): CheckersMove[] {
  const piece = board[row]?.[col];
  if (!piece) return [];

  const rowDeltas = getMoveRowDeltas(piece);
  const moves: CheckersMove[] = [];

  for (const dr of rowDeltas) {
    for (const dc of [-1, 1]) {
      const nr = row + dr;
      const nc = col + dc;
      if (!isInsideBoard(nr, nc)) continue;
      if (board[nr][nc] === null) {
        const promoted =
          !piece.isKing &&
          ((piece.color === 'red' && nr === 0) ||
            (piece.color === 'ivory' && nr === BOARD_SIZE - 1));

        moves.push({
          from: { row, col },
          to: { row: nr, col: nc },
          captured: null,
          promoted,
        });
      }
    }
  }

  return moves;
}

/**
 * Returns all legal single-step moves for `color`.
 * If `lockedPiece` is set (mid-multi-jump chain), only capture moves from that piece are returned.
 * If `forcedCapture` is true (standard rules), if any capture exists for `color`, only captures are legal.
 */
export function getLegalMoves(
  board: Board,
  color: PieceColor,
  lockedPiece: Coord | null = null,
  forcedCapture: boolean = true
): CheckersMove[] {
  if (lockedPiece) {
    const piece = board[lockedPiece.row]?.[lockedPiece.col];
    if (!piece || piece.color !== color) return [];
    return getCaptureMovesForPiece(board, lockedPiece.row, lockedPiece.col);
  }

  const allCaptures: CheckersMove[] = [];
  const allSimple: CheckersMove[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== color) continue;
      allCaptures.push(...getCaptureMovesForPiece(board, r, c));
      allSimple.push(...getSimpleMovesForPiece(board, r, c));
    }
  }

  if (forcedCapture && allCaptures.length > 0) {
    return allCaptures;
  }

  return [...allCaptures, ...allSimple];
}

export interface AppliedMoveResult {
  board: Board;
  nextTurn: PieceColor;
  lockedPiece: Coord | null;
  mustContinueJump: boolean;
  promoted: boolean;
  captured: Coord | null;
}

/**
 * Applies a validated move and determines whether a multi-jump chain continues.
 * Standard rule: if a man promotes to King upon landing on the back row, the turn ends immediately.
 */
export function applyCheckersMove(
  board: Board,
  move: CheckersMove,
  currentTurn: PieceColor
): AppliedMoveResult {
  const nextBoard = cloneBoard(board);
  const movingPiece = nextBoard[move.from.row][move.from.col];
  if (!movingPiece) {
    throw new Error('No piece at source square');
  }

  nextBoard[move.from.row][move.from.col] = null;
  if (move.captured) {
    nextBoard[move.captured.row][move.captured.col] = null;
  }

  const becomesKing =
    !movingPiece.isKing &&
    ((movingPiece.color === 'red' && move.to.row === 0) ||
      (movingPiece.color === 'ivory' && move.to.row === BOARD_SIZE - 1));

  nextBoard[move.to.row][move.to.col] = {
    color: movingPiece.color,
    isKing: movingPiece.isKing || becomesKing,
  };

  // Check for chain capture if this move was a capture and the piece did NOT just promote
  if (move.captured && !becomesKing) {
    const furtherCaptures = getCaptureMovesForPiece(nextBoard, move.to.row, move.to.col);
    if (furtherCaptures.length > 0) {
      return {
        board: nextBoard,
        nextTurn: currentTurn,
        lockedPiece: { row: move.to.row, col: move.to.col },
        mustContinueJump: true,
        promoted: false,
        captured: move.captured,
      };
    }
  }

  return {
    board: nextBoard,
    nextTurn: currentTurn === 'red' ? 'ivory' : 'red',
    lockedPiece: null,
    mustContinueJump: false,
    promoted: becomesKing,
    captured: move.captured,
  };
}

export function countPieces(board: Board): {
  red: number;
  ivory: number;
  redKings: number;
  ivoryKings: number;
} {
  let red = 0;
  let ivory = 0;
  let redKings = 0;
  let ivoryKings = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (!p) continue;
      if (p.color === 'red') {
        red++;
        if (p.isKing) redKings++;
      } else {
        ivory++;
        if (p.isKing) ivoryKings++;
      }
    }
  }

  return { red, ivory, redKings, ivoryKings };
}

export function evaluateGameOutcome(
  board: Board,
  nextTurn: PieceColor,
  noProgressMoves: number,
  forcedCapture: boolean = true,
  totalMovesCount: number = 0,
  maxMoves: number | null = null
): { status: GameStatus; winner: PieceColor | 'draw' | null; reason: string } {
  const counts = countPieces(board);
  if (counts.red === 0) {
    return { status: 'won', winner: 'ivory', reason: 'All Crimson pieces captured' };
  }
  if (counts.ivory === 0) {
    return { status: 'won', winner: 'red', reason: 'All Ivory pieces captured' };
  }

  const legal = getLegalMoves(board, nextTurn, null, forcedCapture);
  if (legal.length === 0) {
    const winner: PieceColor = nextTurn === 'red' ? 'ivory' : 'red';
    return {
      status: 'won',
      winner,
      reason: nextTurn === 'red' ? 'Crimson has no legal moves' : 'Ivory has no legal moves',
    };
  }

  if (maxMoves !== null && totalMovesCount >= maxMoves) {
    const redPoints = counts.red + counts.redKings;
    const ivoryPoints = counts.ivory + counts.ivoryKings;
    if (redPoints > ivoryPoints) {
      return {
        status: 'won',
        winner: 'red',
        reason: `${maxMoves}-move limit reached (${redPoints} vs ${ivoryPoints} pts)`,
      };
    }
    if (ivoryPoints > redPoints) {
      return {
        status: 'won',
        winner: 'ivory',
        reason: `${maxMoves}-move limit reached (${ivoryPoints} vs ${redPoints} pts)`,
      };
    }
    return {
      status: 'draw',
      winner: 'draw',
      reason: `${maxMoves}-move limit reached · Equal pieces`,
    };
  }

  if (noProgressMoves >= NO_PROGRESS_DRAW_LIMIT) {
    return {
      status: 'draw',
      winner: 'draw',
      reason: '40 moves without capture or promotion',
    };
  }

  return { status: 'playing', winner: null, reason: '' };
}

/**
 * Generates complete turn sequences (handling multi-jump chains as atomic turns for AI search)
 */
interface FullTurnSequence {
  steps: CheckersMove[];
  resultingBoard: Board;
}

function hasAnyLegalMove(board: Board, color: PieceColor): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== color) continue;
      const rowDeltas = piece.isKing ? [-1, 1] : [getForwardRowDelta(piece.color)];
      for (const dr of rowDeltas) {
        for (const dc of [-1, 1]) {
          const nr = r + dr;
          const nc = c + dc;
          if (!isInsideBoard(nr, nc)) continue;
          const adj = board[nr][nc];
          if (adj === null) return true;
          if (adj.color !== color) {
            const jr = r + dr * 2;
            const jc = c + dc * 2;
            if (isInsideBoard(jr, jc) && board[jr][jc] === null) {
              return true;
            }
          }
        }
      }
    }
  }
  return false;
}

function getTurnSequencesForColor(
  board: Board,
  color: PieceColor,
  forcedCapture: boolean = true
): FullTurnSequence[] {
  const initialMoves = getLegalMoves(board, color, null, forcedCapture);
  const captureSeqs: FullTurnSequence[] = [];
  const quietSeqs: FullTurnSequence[] = [];

  for (const move of initialMoves) {
    const res = applyCheckersMove(board, move, color);
    if (!res.mustContinueJump || !res.lockedPiece) {
      if (move.captured) {
        captureSeqs.push({ steps: [move], resultingBoard: res.board });
      } else {
        quietSeqs.push({ steps: [move], resultingBoard: res.board });
      }
    } else {
      expandChain(res.board, color, res.lockedPiece, [move], captureSeqs);
    }
  }

  return captureSeqs.length > 0 && quietSeqs.length > 0
    ? [...captureSeqs, ...quietSeqs]
    : captureSeqs.length > 0
    ? captureSeqs
    : quietSeqs;
}

function expandChain(
  board: Board,
  color: PieceColor,
  locked: Coord,
  prefix: CheckersMove[],
  out: FullTurnSequence[]
) {
  const nextCaptures = getCaptureMovesForPiece(board, locked.row, locked.col);
  if (nextCaptures.length === 0) {
    out.push({ steps: prefix, resultingBoard: board });
    return;
  }

  for (const cap of nextCaptures) {
    const res = applyCheckersMove(board, cap, color);
    const nextSteps = [...prefix, cap];
    if (!res.mustContinueJump || !res.lockedPiece) {
      out.push({ steps: nextSteps, resultingBoard: res.board });
    } else {
      expandChain(res.board, color, res.lockedPiece, nextSteps, out);
    }
  }
}

function evaluateBoardHeuristic(board: Board, aiColor: PieceColor): number {
  let score = 0;
  const oppColor: PieceColor = aiColor === 'red' ? 'ivory' : 'red';
  let aiCount = 0;
  let oppCount = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (!p) continue;

      let value = p.isKing ? 185 : 100;

      // Center control bonus
      if (r >= 2 && r <= 5 && c >= 2 && c <= 5) {
        value += 14;
      }

      // Edge safety bonus for non-kings
      if (!p.isKing && (c === 0 || c === BOARD_SIZE - 1)) {
        value += 7;
      }

      // Advancement bonus for men
      if (!p.isKing) {
        const advancement = p.color === 'red' ? BOARD_SIZE - 1 - r : r;
        value += advancement * 6;
        // Back-row defense bonus
        if ((p.color === 'red' && r === 7) || (p.color === 'ivory' && r === 0)) {
          value += 12;
        }
      }

      if (p.color === aiColor) {
        score += value;
        aiCount++;
      } else {
        score -= value;
        oppCount++;
      }
    }
  }

  if (oppCount === 0) return 10000;
  if (aiCount === 0) return -10000;

  return score;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizingColor: PieceColor,
  currentColor: PieceColor,
  forcedCapture: boolean
): number {
  if (depth === 0) {
    if (!hasAnyLegalMove(board, currentColor)) {
      return currentColor === maximizingColor ? -9500 : 9500;
    }
    return evaluateBoardHeuristic(board, maximizingColor);
  }

  const sequences = getTurnSequencesForColor(board, currentColor, forcedCapture);

  if (sequences.length === 0) {
    return currentColor === maximizingColor ? -9500 - depth : 9500 + depth;
  }

  const isMax = currentColor === maximizingColor;
  const nextColor: PieceColor = currentColor === 'red' ? 'ivory' : 'red';

  if (isMax) {
    let best = -Infinity;
    for (const seq of sequences) {
      const val = minimax(
        seq.resultingBoard,
        depth - 1,
        alpha,
        beta,
        maximizingColor,
        nextColor,
        forcedCapture
      );
      if (val > best) best = val;
      if (best > alpha) alpha = best;
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const seq of sequences) {
      const val = minimax(
        seq.resultingBoard,
        depth - 1,
        alpha,
        beta,
        maximizingColor,
        nextColor,
        forcedCapture
      );
      if (val < best) best = val;
      if (best < beta) beta = best;
      if (beta <= alpha) break;
    }
    return best;
  }
}

/**
 * Selects the next single step for the AI (respecting lockedPiece during multi-jump chains).
 */
export function chooseBestAIMove(
  board: Board,
  aiColor: PieceColor,
  difficulty: AIDifficulty,
  lockedPiece: Coord | null = null,
  forcedCapture: boolean = true
): CheckersMove | null {
  if (lockedPiece) {
    const chainMoves = getCaptureMovesForPiece(board, lockedPiece.row, lockedPiece.col);
    if (chainMoves.length === 0) return null;
    if (difficulty === 'easy') {
      return chainMoves[Math.floor(Math.random() * chainMoves.length)];
    }
    // Evaluate each branch using minimax
    let bestMove = chainMoves[0];
    let bestVal = -Infinity;
    for (const m of chainMoves) {
      const res = applyCheckersMove(board, m, aiColor);
      const nextColor = res.nextTurn;
      const val =
        res.mustContinueJump && res.lockedPiece
          ? minimax(res.board, 2, -Infinity, Infinity, aiColor, aiColor, forcedCapture)
          : minimax(res.board, 2, -Infinity, Infinity, aiColor, nextColor, forcedCapture);
      if (val > bestVal) {
        bestVal = val;
        bestMove = m;
      }
    }
    return bestMove;
  }

  const sequences = getTurnSequencesForColor(board, aiColor, forcedCapture);
  if (sequences.length === 0) return null;

  if (difficulty === 'easy') {
    const captures = sequences.filter((s) => s.steps[0].captured !== null);
    const pool = captures.length > 0 ? captures : sequences;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    return chosen.steps[0];
  }

  const searchDepth = difficulty === 'hard' ? 4 : 2;
  const oppColor: PieceColor = aiColor === 'red' ? 'ivory' : 'red';

  let bestScore = -Infinity;
  let bestFirstSteps: CheckersMove[] = [];

  for (const seq of sequences) {
    const score = minimax(
      seq.resultingBoard,
      searchDepth - 1,
      -Infinity,
      Infinity,
      aiColor,
      oppColor,
      forcedCapture
    );
    if (score > bestScore) {
      bestScore = score;
      bestFirstSteps = [seq.steps[0]];
    } else if (score === bestScore) {
      bestFirstSteps.push(seq.steps[0]);
    }
  }

  if (bestFirstSteps.length === 0) return sequences[0].steps[0];
  return bestFirstSteps[Math.floor(Math.random() * bestFirstSteps.length)];
}

export function generateRoomCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `SB${digits}`;
}

export function normalizeRoomCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidRoomCode(code: string): boolean {
  return /^SB\d{4}$/.test(normalizeRoomCode(code));
}

export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function getOppositeColor(color: PieceColor): PieceColor {
  return color === 'red' ? 'ivory' : 'red';
}

/**
 * After a round ends (won or drawn), the opponent starts the next round.
 * Mid-game restarts preserve the current round's starting player.
 */
export function getNextRoundStarter(
  currentStarter: PieceColor,
  roundStatus: GameStatus
): PieceColor {
  if (roundStatus === 'won' || roundStatus === 'draw') {
    return getOppositeColor(currentStarter);
  }
  return currentStarter;
}

export interface KeyValueStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const AI_NEXT_STARTER_STORAGE_KEY = 'sb_checkers_ai_next_starter';

/**
 * Reads who should start a newly opened Solo vs AI session ('red' on 1st play,
 * then 'ivory' on the next room open, alternating across room close/reopen).
 */
export function consumePersistedAISessionStarter(
  storage: KeyValueStorageLike | null | undefined
): PieceColor {
  let starter: PieceColor = 'red';
  if (!storage) return starter;
  try {
    const saved = storage.getItem(AI_NEXT_STARTER_STORAGE_KEY);
    starter = saved === 'ivory' ? 'ivory' : 'red';
    storage.setItem(AI_NEXT_STARTER_STORAGE_KEY, getOppositeColor(starter));
  } catch {
    // ignore storage errors
  }
  return starter;
}

/**
 * Keeps the persisted next-session AI starter aligned when rounds advance in-session.
 */
export function syncPersistedAISessionStarter(
  currentStarter: PieceColor,
  storage: KeyValueStorageLike | null | undefined
): void {
  if (!storage) return;
  try {
    storage.setItem(AI_NEXT_STARTER_STORAGE_KEY, getOppositeColor(currentStarter));
  } catch {
    // ignore storage errors
  }
}
