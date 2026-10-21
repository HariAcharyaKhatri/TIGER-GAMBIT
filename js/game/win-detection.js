/**
 * BAGH-CHAL: WIN DETECTION & STALEMATE LOGIC
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const C = window.BaghChal.Constants;
  const Rules = window.BaghChal.RulesEngine;

  const WinDetection = {
    computeStateHash(state) {
      const boardStr = state.board.map(row => row.map(cell => cell || '-').join('')).join('|');
      return `${boardStr}:${state.turn}:${state.phase}:${state.goatsCaptured}:${state.goatsToPlace}`;
    },

    checkRepetition(state) {
      if (!state.repetitionHashes) return false;
      const currentHash = this.computeStateHash(state);
      const occurrences = state.repetitionHashes.filter(h => h === currentHash).length;
      return occurrences >= 3;
    },

    evaluateGameState(state) {
      // 1. Check Tigers Win: 5 Goats Captured
      if (state.goatsCaptured >= C.GOATS_TO_WIN) {
        return {
          gameOver: true,
          winner: C.SIDE.TIGERS,
          reason: C.WIN_REASON.TIGERS_CAPTURED_5
        };
      }

      // 2. Check Goats Win: All 4 Tigers Trapped
      const trappedTigers = Rules.countTrappedTigers(state.board);
      if (trappedTigers === C.TOTAL_TIGERS) {
        return {
          gameOver: true,
          winner: C.SIDE.GOATS,
          reason: C.WIN_REASON.GOATS_TRAPPED_ALL
        };
      }

      // 3. Check Threefold Repetition
      if (this.checkRepetition(state)) {
        return {
          gameOver: true,
          winner: 'draw',
          reason: C.WIN_REASON.DRAW_REPETITION
        };
      }

      // 4. In movement phase, if goats cannot move at all
      if (state.phase === C.PHASE.MOVEMENT && state.turn === C.SIDE.GOATS) {
        if (!Rules.canAnyGoatMove(state.board)) {
          return {
            gameOver: true,
            winner: C.SIDE.TIGERS,
            reason: 'Goats have no legal moves remaining'
          };
        }
      }

      // 5. Game continues
      return {
        gameOver: false,
        winner: null,
        reason: null
      };
    }
  };

  window.BaghChal.WinDetection = WinDetection;
})(window);
