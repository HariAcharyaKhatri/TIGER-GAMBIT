/**
 * BAGH-CHAL: MOVE HISTORY & REPLAY CONTROLLER
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const DOM = window.BaghChal.DOM;

  const MoveHistory = {
    render(moveLog, containerId = 'moveLogContainer') {
      const container = DOM.byId(containerId);
      if (!container) return;

      if (!moveLog || moveLog.length === 0) {
        container.innerHTML = `
          <div style="padding: 24px 12px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
            No moves played yet. Start by placing a goat!
          </div>
        `;
        return;
      }

      // Group moves into pairs (Turn: 1. Goat Tiger, 2. Goat Tiger, ...)
      let html = '';
      let turnIndex = 1;
      for (let i = 0; i < moveLog.length; i += 2) {
        const goatMove = moveLog[i];
        const tigerMove = moveLog[i + 1];

        const goatClass = goatMove && goatMove.isCapture ? 'move-capture' : 'move-goat';
        const tigerClass = tigerMove && tigerMove.isCapture ? 'move-capture' : 'move-tiger';

        html += `
          <div class="move-row">
            <span class="move-num">${turnIndex}.</span>
            <span class="${goatClass}">${goatMove ? goatMove.notation : ''}</span>
            <span class="${tigerClass}">${tigerMove ? tigerMove.notation : ''}</span>
          </div>
        `;
        turnIndex++;
      }

      container.innerHTML = html;
      // Scroll to bottom
      container.scrollTop = container.scrollHeight;
    },

    exportPGN(state) {
      if (!state || !state.moveLog) return '';
      let text = `[Event "Bagh-Chal Match"]\n[Date "${new Date().toLocaleDateString()}"]\n[Rules "Traditional Nepali Bagh-Chal"]\n\n`;
      let turn = 1;
      for (let i = 0; i < state.moveLog.length; i += 2) {
        text += `${turn}. ${state.moveLog[i].notation} `;
        if (state.moveLog[i + 1]) {
          text += `${state.moveLog[i + 1].notation} `;
        }
        text += '\n';
        turn++;
      }
      if (state.gameOver) {
        text += `\n{ Result: ${state.winner ? state.winner.toUpperCase() : 'DRAW'} - ${state.winReason} }`;
      }
      return text;
    }
  };

  window.BaghChal.MoveHistory = MoveHistory;
})(window);
