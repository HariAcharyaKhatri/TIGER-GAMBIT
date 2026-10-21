/**
 * BAGH-CHAL: MOVE VALIDATOR
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const C = window.BaghChal.Constants;
  const H = window.BaghChal.Helpers;
  const Rules = window.BaghChal.RulesEngine;

  const MoveValidator = {
    // Validate if placing a goat at (r, c) is legal
    canPlaceGoat(state, r, c) {
      if (state.gameOver) return false;
      if (state.turn !== C.SIDE.GOATS) return false;
      if (state.phase !== C.PHASE.PLACEMENT) return false;
      if (state.goatsToPlace <= 0) return false;
      if (!H.isWithinBoard(r, c)) return false;
      return state.board[r][c] === C.PIECE.EMPTY;
    },

    // Validate if moving a goat from (fr, fc) to (tr, tc) is legal
    canMoveGoat(state, fr, fc, tr, tc) {
      if (state.gameOver) return false;
      if (state.turn !== C.SIDE.GOATS) return false;
      if (state.phase !== C.PHASE.MOVEMENT) return false;
      if (!H.isWithinBoard(fr, fc) || !H.isWithinBoard(tr, tc)) return false;
      if (state.board[fr][fc] !== C.PIECE.GOAT) return false;
      if (state.board[tr][tc] !== C.PIECE.EMPTY) return false;

      const validMoves = Rules.getValidGoatMoves(state.board, fr, fc);
      return validMoves.some(m => m.to.r === tr && m.to.c === tc);
    },

    // Validate if moving a tiger from (fr, fc) to (tr, tc) is legal
    canMoveTiger(state, fr, fc, tr, tc) {
      if (state.gameOver) return false;
      if (state.turn !== C.SIDE.TIGERS) return false;
      if (!H.isWithinBoard(fr, fc) || !H.isWithinBoard(tr, tc)) return false;
      if (state.board[fr][fc] !== C.PIECE.TIGER) return false;
      if (state.board[tr][tc] !== C.PIECE.EMPTY) return false;

      const validMoves = Rules.getValidTigerMoves(state.board, fr, fc);
      return validMoves.find(m => m.to.r === tr && m.to.c === tc) || null;
    },

    // Get all legal target destinations for a selected piece at (r, c)
    getLegalDestinations(state, r, c) {
      if (!H.isWithinBoard(r, c)) return [];
      const piece = state.board[r][c];

      if (state.turn === C.SIDE.TIGERS && piece === C.PIECE.TIGER) {
        return Rules.getValidTigerMoves(state.board, r, c);
      }

      if (state.turn === C.SIDE.GOATS && piece === C.PIECE.GOAT && state.phase === C.PHASE.MOVEMENT) {
        return Rules.getValidGoatMoves(state.board, r, c);
      }

      return [];
    }
  };

  window.BaghChal.MoveValidator = MoveValidator;
})(window);
