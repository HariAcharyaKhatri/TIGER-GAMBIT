/**
 * BAGH-CHAL: HINT & STRATEGIC COACHING SYSTEM
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const C = window.BaghChal.Constants;
  const H = window.BaghChal.Helpers;
  const AIEngine = window.BaghChal.AIEngine;
  const Sound = window.BaghChal.Sound;
  const DOM = window.BaghChal.DOM;

  const Hints = {
    async getHint(gameState) {
      if (gameState.gameOver) return null;

      Sound.playHint();
      // Compute best move using depth 3/4
      const bestMove = await AIEngine.chooseMove(gameState, C.DIFFICULTY.HARD);
      if (!bestMove) return null;

      let adviceText = '';
      if (gameState.turn === C.SIDE.GOATS) {
        if (bestMove.type === 'placement') {
          const coord = H.toCoordString(bestMove.to.r, bestMove.to.c);
          if (bestMove.to.r === 2 && bestMove.to.c === 2) {
            adviceText = `Place goat at ${coord}: Controlling the sacred center severely restricts all four tigers!`;
          } else {
            adviceText = `Place goat at ${coord}: Fortifies your formation and covers tiger jump corridors.`;
          }
        } else {
          const from = H.toCoordString(bestMove.from.r, bestMove.from.c);
          const to = H.toCoordString(bestMove.to.r, bestMove.to.c);
          adviceText = `Advance Goat from ${from} to ${to}: Tightens the trap around the nearest tiger.`;
        }
      } else {
        const from = H.toCoordString(bestMove.from.r, bestMove.from.c);
        const to = H.toCoordString(bestMove.to.r, bestMove.to.c);
        if (bestMove.isCapture) {
          const cap = H.toCoordString(bestMove.capturedGoat.r, bestMove.capturedGoat.c);
          adviceText = `Strike from ${from} to ${to}: Pounce over and capture the goat at ${cap}!`;
        } else {
          adviceText = `Maneuver Tiger from ${from} to ${to}: Preserves tiger mobility and avoids corner traps.`;
        }
      }

      DOM.showToast(adviceText, 'gold', 4500);
      return bestMove;
    }
  };

  window.BaghChal.Hints = Hints;
})(window);
