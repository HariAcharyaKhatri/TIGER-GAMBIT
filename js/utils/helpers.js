/**
 * BAGH-CHAL: UTILITY HELPERS
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const C = window.BaghChal.Constants;

  const Helpers = {
    posKey(r, c) {
      return `${r},${c}`;
    },

    parseKey(key) {
      const parts = key.split(',');
      return { r: parseInt(parts[0], 10), c: parseInt(parts[1], 10) };
    },

    isWithinBoard(r, c) {
      return r >= 0 && r < C.BOARD_SIZE && c >= 0 && c < C.BOARD_SIZE;
    },

    toCoordString(r, c) {
      if (!this.isWithinBoard(r, c)) return '??';
      const col = C.COL_LABELS[c];
      const row = C.ROW_LABELS[r];
      return `${col}${row}`;
    },

    deepCloneBoard(board) {
      return board.map(row => row.slice());
    },

    formatTime(totalSeconds) {
      if (totalSeconds == null || totalSeconds < 0) return '--:--';
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    escapeHTML(str) {
      if (!str) return '';
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    },

    clamp(val, min, max) {
      return Math.max(min, Math.min(max, val));
    },

    debounce(fn, waitMs) {
      let timeout = null;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), waitMs);
      };
    },

    generateId() {
      return 'bg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    },

    formatNotation(move) {
      if (!move) return '';
      if (move.type === 'placement') {
        return `G@${this.toCoordString(move.to.r, move.to.c)}`;
      }
      const p = move.piece === C.PIECE.TIGER ? 'T' : 'G';
      const fromStr = this.toCoordString(move.from.r, move.from.c);
      const toStr = this.toCoordString(move.to.r, move.to.c);
      if (move.isCapture) {
        return `${p}:${fromStr}x${toStr}`;
      }
      return `${p}:${fromStr}-${toStr}`;
    }
  };

  window.BaghChal.Helpers = Helpers;
})(window);
