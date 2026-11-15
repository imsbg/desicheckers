import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialBoard,
  countPieces,
  getLegalMoves,
  applyCheckersMove,
  evaluateGameOutcome,
  chooseBestAIMove,
  getMaxMovesForTier,
  isValidRoomCode,
  normalizeRoomCode,
  formatDuration,
  Board,
} from './checkers';

function emptyBoard(): Board {
  return Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));
}

test('initial board has 12 red and 12 ivory pieces on dark squares', () => {
  const board = createInitialBoard();
  const counts = countPieces(board);
  assert.equal(counts.red, 12);
  assert.equal(counts.ivory, 12);
  assert.equal(counts.redKings, 0);
  assert.equal(counts.ivoryKings, 0);

  // Red starts with 7 legal opening moves
  const redMoves = getLegalMoves(board, 'red');
  assert.equal(redMoves.length, 7);
});

test('forced capture rule requires capturing when a jump is available', () => {
  const board = emptyBoard();
  board[5][2] = { color: 'red', isKing: false };
  board[4][3] = { color: 'ivory', isKing: false };
  board[5][6] = { color: 'red', isKing: false };

  const legalForced = getLegalMoves(board, 'red', null, true);
  assert.equal(legalForced.length, 1);
  assert.deepEqual(legalForced[0].from, { row: 5, col: 2 });
  assert.deepEqual(legalForced[0].to, { row: 3, col: 4 });
  assert.deepEqual(legalForced[0].captured, { row: 4, col: 3 });

  const legalUnforced = getLegalMoves(board, 'red', null, false);
  assert.ok(legalUnforced.length > 1);
});

test('multi-jump chain locks piece and keeps turn until chain finishes', () => {
  const board = emptyBoard();
  board[6][1] = { color: 'red', isKing: false };
  board[5][2] = { color: 'ivory', isKing: false };
  board[3][4] = { color: 'ivory', isKing: false };

  const firstMove = getLegalMoves(board, 'red')[0];
  const res1 = applyCheckersMove(board, firstMove, 'red');
  assert.equal(res1.mustContinueJump, true);
  assert.equal(res1.nextTurn, 'red');
  assert.deepEqual(res1.lockedPiece, { row: 4, col: 3 });

  const secondMoves = getLegalMoves(res1.board, 'red', res1.lockedPiece);
  assert.equal(secondMoves.length, 1);
  assert.deepEqual(secondMoves[0].to, { row: 2, col: 5 });

  const res2 = applyCheckersMove(res1.board, secondMoves[0], 'red');
  assert.equal(res2.mustContinueJump, false);
  assert.equal(res2.nextTurn, 'ivory');
  assert.equal(countPieces(res2.board).ivory, 0);
});

test('man reaching back row promotes to King and ends turn even if capture exists', () => {
  const board = emptyBoard();
  board[2][1] = { color: 'red', isKing: false };
  board[1][2] = { color: 'ivory', isKing: false };
  board[1][4] = { color: 'ivory', isKing: false };

  const move = getLegalMoves(board, 'red')[0];
  const res = applyCheckersMove(board, move, 'red');
  assert.equal(res.promoted, true);
  assert.equal(res.board[0][3]?.isKing, true);
  assert.equal(res.mustContinueJump, false);
  assert.equal(res.nextTurn, 'ivory');
});

test('king can move and capture backwards', () => {
  const board = emptyBoard();
  board[1][2] = { color: 'red', isKing: true };
  board[2][3] = { color: 'ivory', isKing: false };

  const legal = getLegalMoves(board, 'red');
  assert.equal(legal.length, 1);
  assert.deepEqual(legal[0].to, { row: 3, col: 4 });
});

test('win condition triggers when opponent has no pieces or no legal moves', () => {
  const board = emptyBoard();
  board[3][2] = { color: 'red', isKing: false };
  const outcome = evaluateGameOutcome(board, 'ivory', 0);
  assert.equal(outcome.status, 'won');
  assert.equal(outcome.winner, 'red');

  // Blocked opponent
  const blocked = emptyBoard();
  blocked[0][1] = { color: 'ivory', isKing: false };
  blocked[1][0] = { color: 'red', isKing: true };
  blocked[1][2] = { color: 'red', isKing: true };
  blocked[2][3] = { color: 'red', isKing: true };
  const blockedOutcome = evaluateGameOutcome(blocked, 'ivory', 0);
  assert.equal(blockedOutcome.status, 'won');
  assert.equal(blockedOutcome.winner, 'red');
});

test('AI chooses winning capture on hard difficulty', () => {
  const board = emptyBoard();
  board[2][3] = { color: 'ivory', isKing: false };
  board[3][4] = { color: 'red', isKing: false };

  const aiMove = chooseBestAIMove(board, 'ivory', 'hard');
  assert.ok(aiMove);
  assert.deepEqual(aiMove.captured, { row: 3, col: 4 });
  assert.deepEqual(aiMove.to, { row: 4, col: 5 });
});

test('room code validation and duration formatting', () => {
  assert.equal(normalizeRoomCode(' sb 1234 '), 'SB1234');
  assert.equal(isValidRoomCode('SB4821'), true);
  assert.equal(isValidRoomCode('AB1234'), false);
  assert.equal(formatDuration(125), '02:05');
});

test('match tier move limits and tournament 40-move evaluation', () => {
  assert.equal(getMaxMovesForTier('casual'), null);
  assert.equal(getMaxMovesForTier('smart'), 50);
  assert.equal(getMaxMovesForTier('master'), 40);

  const board = emptyBoard();
  board[5][2] = { color: 'red', isKing: true }; // 2 pts
  board[2][3] = { color: 'ivory', isKing: false }; // 1 pt

  const ongoing = evaluateGameOutcome(board, 'ivory', 0, true, 39, 40);
  assert.equal(ongoing.status, 'playing');

  const finished = evaluateGameOutcome(board, 'ivory', 0, true, 40, 40);
  assert.equal(finished.status, 'won');
  assert.equal(finished.winner, 'red');
});

