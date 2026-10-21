/**
 * BAGH-CHAL: RULES ENGINE & TOPOLOGY
 * Implements traditional Alquerque / Bagh-Chal 5x5 graph connections and legal move generators.
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const C = window.BaghChal.Constants;
  const H = window.BaghChal.Helpers;

  // Build Adjacency Graph according to standard Bagh-Chal topology
  function buildBoardAdjacency() {
    const adj = {};
    for (let r = 0; r < C.BOARD_SIZE; r++) {
      for (let c = 0; c < C.BOARD_SIZE; c++) {
        const key = H.posKey(r, c);
        adj[key] = [];

        // 1. Orthogonal connections (every node connects up, down, left, right)
        if (r > 0) adj[key].push({ r: r - 1, c, dr: -1, dc: 0, dir: 'up' });
        if (r < 4) adj[key].push({ r: r + 1, c, dr: 1, dc: 0, dir: 'down' });
        if (c > 0) adj[key].push({ r, c: c - 1, dr: 0, dc: -1, dir: 'left' });
        if (c < 4) adj[key].push({ r, c: c + 1, dr: 0, dc: 1, dir: 'right' });

        // 2. Diagonal connections (only at intersections with even parity: (r + c) % 2 === 0)
        if ((r + c) % 2 === 0) {
          const diagDirs = [
            { dr: -1, dc: -1, dir: 'up-left' },
            { dr: -1, dc: 1, dir: 'up-right' },
            { dr: 1, dc: -1, dir: 'down-left' },
            { dr: 1, dc: 1, dir: 'down-right' }
          ];

          for (const d of diagDirs) {
            const nr = r + d.dr;
            const nc = c + d.dc;
            if (H.isWithinBoard(nr, nc)) {
              adj[key].push({ r: nr, c: nc, dr: d.dr, dc: d.dc, dir: d.dir });
            }
          }
        }
      }
    }
    return adj;
  }

  const ADJACENCY = buildBoardAdjacency();

  const RulesEngine = {
    ADJACENCY,

    getAdjacent(r, c) {
      return ADJACENCY[H.posKey(r, c)] || [];
    },

    isConnected(r1, c1, r2, c2) {
      const neighbors = this.getAdjacent(r1, c1);
      return neighbors.some(nb => nb.r === r2 && nb.c === c2);
    },

    // Get all valid moves for a tiger at (r, c) on a given board
    getValidTigerMoves(board, r, c) {
      const moves = [];
      const neighbors = this.getAdjacent(r, c);

      for (const nb of neighbors) {
        const nr = nb.r;
        const nc = nb.c;

        // Simple step to adjacent empty intersection
        if (board[nr][nc] === C.PIECE.EMPTY) {
          moves.push({
            type: 'step',
            piece: C.PIECE.TIGER,
            from: { r, c },
            to: { r: nr, c: nc },
            isCapture: false
          });
        }
        // Jump capture over adjacent goat
        else if (board[nr][nc] === C.PIECE.GOAT) {
          const dr = nr - r;
          const dc = nc - c;
          const landR = nr + dr;
          const landC = nc + dc;

          if (H.isWithinBoard(landR, landC) && board[landR][landC] === C.PIECE.EMPTY) {
            // Verify straight line connection from goat to landing spot
            if (this.isConnected(nr, nc, landR, landC)) {
              moves.push({
                type: 'jump',
                piece: C.PIECE.TIGER,
                from: { r, c },
                to: { r: landR, c: landC },
                isCapture: true,
                capturedGoat: { r: nr, c: nc }
              });
            }
          }
        }
      }
      return moves;
    },

    // Get all valid moves for a goat at (r, c) on a given board
    getValidGoatMoves(board, r, c) {
      const moves = [];
      const neighbors = this.getAdjacent(r, c);

      for (const nb of neighbors) {
        if (board[nb.r][nb.c] === C.PIECE.EMPTY) {
          moves.push({
            type: 'step',
            piece: C.PIECE.GOAT,
            from: { r, c },
            to: { r: nb.r, c: nb.c },
            isCapture: false
          });
        }
      }
      return moves;
    },

    // Get all empty spots on board (for goat placement)
    getAllEmptySpots(board) {
      const spots = [];
      for (let r = 0; r < C.BOARD_SIZE; r++) {
        for (let c = 0; c < C.BOARD_SIZE; c++) {
          if (board[r][c] === C.PIECE.EMPTY) {
            spots.push({ r, c });
          }
        }
      }
      return spots;
    },

    // Collect all legal moves for Tigers across the whole board
    getAllTigerMoves(board) {
      const moves = [];
      for (let r = 0; r < C.BOARD_SIZE; r++) {
        for (let c = 0; c < C.BOARD_SIZE; c++) {
          if (board[r][c] === C.PIECE.TIGER) {
            moves.push(...this.getValidTigerMoves(board, r, c));
          }
        }
      }
      return moves;
    },

    // Collect all legal moves for Goats across the whole board (movement phase)
    getAllGoatMoves(board) {
      const moves = [];
      for (let r = 0; r < C.BOARD_SIZE; r++) {
        for (let c = 0; c < C.BOARD_SIZE; c++) {
          if (board[r][c] === C.PIECE.GOAT) {
            moves.push(...this.getValidGoatMoves(board, r, c));
          }
        }
      }
      return moves;
    },

    // Count how many tigers have zero legal moves
    countTrappedTigers(board) {
      let trappedCount = 0;
      for (let r = 0; r < C.BOARD_SIZE; r++) {
        for (let c = 0; c < C.BOARD_SIZE; c++) {
          if (board[r][c] === C.PIECE.TIGER) {
            const tigerMoves = this.getValidTigerMoves(board, r, c);
            if (tigerMoves.length === 0) {
              trappedCount++;
            }
          }
        }
      }
      return trappedCount;
    },

    // Check if any tiger can move
    canAnyTigerMove(board) {
      for (let r = 0; r < C.BOARD_SIZE; r++) {
        for (let c = 0; c < C.BOARD_SIZE; c++) {
          if (board[r][c] === C.PIECE.TIGER) {
            const tigerMoves = this.getValidTigerMoves(board, r, c);
            if (tigerMoves.length > 0) return true;
          }
        }
      }
      return false;
    },

    // Check if any goat can move
    canAnyGoatMove(board) {
      for (let r = 0; r < C.BOARD_SIZE; r++) {
        for (let c = 0; c < C.BOARD_SIZE; c++) {
          if (board[r][c] === C.PIECE.GOAT) {
            const goatMoves = this.getValidGoatMoves(board, r, c);
            if (goatMoves.length > 0) return true;
          }
        }
      }
      return false;
    }
  };

  window.BaghChal.RulesEngine = RulesEngine;
})(window);
