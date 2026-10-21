/**
 * BAGH-CHAL: MATCH TIMER & CLOCKS
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const C = window.BaghChal.Constants;
  const H = window.BaghChal.Helpers;
  const DOM = window.BaghChal.DOM;

  class GameTimer {
    constructor() {
      this.mode = 'none'; // 'none' | seconds (e.g. 180)
      this.tigerSeconds = 0;
      this.goatSeconds = 0;
      this.activeSide = C.SIDE.GOATS;
      this.interval = null;
      this.isRunning = false;
      this.onTimeout = null;
    }

    configure(timerMode, onTimeoutCallback) {
      this.stop();
      this.mode = timerMode;
      this.onTimeout = onTimeoutCallback;

      if (timerMode === 'none' || !timerMode) {
        this.tigerSeconds = 0;
        this.goatSeconds = 0;
      } else {
        const total = parseInt(timerMode, 10);
        this.tigerSeconds = total;
        this.goatSeconds = total;
      }
      this.updateDisplay();
    }

    start(currentTurn) {
      if (this.mode === 'none') {
        this.updateDisplay();
        return;
      }
      this.activeSide = currentTurn;
      if (this.isRunning) return;

      this.isRunning = true;
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        if (this.activeSide === C.SIDE.TIGERS) {
          this.tigerSeconds--;
          if (this.tigerSeconds <= 0) {
            this.tigerSeconds = 0;
            this.stop();
            if (this.onTimeout) this.onTimeout(C.SIDE.TIGERS);
          }
        } else {
          this.goatSeconds--;
          if (this.goatSeconds <= 0) {
            this.goatSeconds = 0;
            this.stop();
            if (this.onTimeout) this.onTimeout(C.SIDE.GOATS);
          }
        }
        this.updateDisplay();
      }, 1000);

      this.updateDisplay();
    }

    switchTurn(newTurn) {
      this.activeSide = newTurn;
      this.updateDisplay();
    }

    stop() {
      clearInterval(this.interval);
      this.interval = null;
      this.isRunning = false;
    }

    reset() {
      this.stop();
      if (this.mode !== 'none' && this.mode) {
        const total = parseInt(this.mode, 10);
        this.tigerSeconds = total;
        this.goatSeconds = total;
      } else {
        this.tigerSeconds = 0;
        this.goatSeconds = 0;
      }
      this.updateDisplay();
    }

    updateDisplay() {
      const tigerEl = DOM.byId('tigerClockDisplay');
      const goatEl = DOM.byId('goatClockDisplay');

      if (this.mode === 'none') {
        if (tigerEl) tigerEl.textContent = '∞';
        if (goatEl) goatEl.textContent = '∞';
        return;
      }

      if (tigerEl) tigerEl.textContent = H.formatTime(this.tigerSeconds);
      if (goatEl) goatEl.textContent = H.formatTime(this.goatSeconds);
    }
  }

  window.BaghChal.Timer = new GameTimer();
})(window);
