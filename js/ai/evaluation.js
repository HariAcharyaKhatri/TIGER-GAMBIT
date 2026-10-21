/**
 * BAGH-CHAL: AI EVALUATION ENGINE
 * Strategic position evaluation heuristics for Tigers and Goats.
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const C = window.BaghChal.Constants;
  const Rules = window.BaghChal.RulesEngine;

  const Evaluation = {
    // Strategic weights for board positions (Center (2,2) and inner diamond are highly strategic)
    POSITION_WEIGHTS: [
      [2, 1, 3, 1, 2],
      [1, 4, 3, 4, 1],
      [3, 3, 6, 3, 3],
      [1, 4, 3, 4, 1],
      [2, 1, 3, 1, 2]
    ],

    evaluateForTigers(board, goatsCaptured) {
      // 1. Captured Goats Value
      let score = goatsCaptured * 240;

      // 2. Tiger Mobility & Trapping Penalty
      let totalMoves = 0;
      let trappedCount = 0;

      for (let r = 0; r < C.BOARD_SIZE; r++) {
        for (let c = 0; c < C.BOARD_SIZE; c++) {
          if (board[r][c] === C.PIECE.TIGER) {
            const moves = Rules.getValidTigerMoves(board, r, c);
            totalMoves += moves.length;
            if (moves.length === 0) {
              trappedCount++;
            }
            // Reward occupying central / high-connectivity points
            score += this.POSITION_WEIGHTS[r][c] * 8;
            // Immediate capture threat bonus
            const captures = moves.filter(m => m.isCapture);
            score += captures.length * 45;
          }
        }
      }

      score += totalMoves * 16;
      score -= trappedCount * 280;

      return score;
    },

    evaluateForGoats(board, goatsCaptured, goatsToPlace) {
      // 1. Tigers Trapped Value
      const trappedTigers = Rules.countTrappedTigers(board);
      let score = trappedTigers * 320;

      // 2. Penalty for lost goats
      score -= goatsCaptured * 220;

      // 3. Constrict Tiger Mobility
      const allTigerMoves = Rules.getAllTigerMoves(board);
      score -= allTigerMoves.length * 15;

      // Immediate threat penalty: if a tiger can jump a goat on next move
      const immediateCaptures = allTigerMoves.filter(m => m.isCapture);
      score -= immediateCaptures.length * 60;

      // 4. Strategic placement & Goat clustering (Goats supporting each other)
      let goatCount = 0;
      for (let r = 0; r < C.BOARD_SIZE; r++) {
        for (let c = 0; c < C.BOARD_SIZE; c++) {
          if (board[r][c] === C.PIECE.GOAT) {
            goatCount++;
            // Value central and diamond coverage
            score += this.POSITION_WEIGHTS[r][c] * 6;

            // Defensive safety: check if adjacent to another goat
            const neighbors = Rules.getAdjacent(r, c);
            let friendlyNeighbors = 0;
            for (const nb of neighbors) {
              if (board[nb.r][nb.c] === C.PIECE.GOAT) {
                friendlyNeighbors++;
              }
            }
            score += friendlyNeighbors * 5;
          }
        }
      }

      return score;
    },

    // Threat meter: returns positional balance between 0 (complete Tiger dominance) and 100 (complete Goat dominance)
    getGameBalance(board, goatsCaptured, goatsToPlace) {
      const tigerScore = this.evaluateForTigers(board, goatsCaptured);
      const goatScore = this.evaluateForGoats(board, goatsCaptured, goatsToPlace);
      const diff = goatScore - tigerScore;

      // Normalize diff (-800 to +800) into 0 to 100 range
      const normalized = Math.max(5, Math.min(95, 50 + diff / 18));
      return Math.round(normalized);
    }
  };

  window.BaghChal.Evaluation = Evaluation;
})(window);
