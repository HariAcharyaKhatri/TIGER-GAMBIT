/**
 * BAGH-CHAL: SYNTHESIZED WEB AUDIO SOUND ENGINE
 * Zero external audio files required. Rich, dynamic procedural board game sounds.
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const Storage = window.BaghChal.Storage;

  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.volume = 0.7;
      this._initSettings();
    }

    _initSettings() {
      const settings = Storage.getSettings();
      this.enabled = settings.soundEnabled !== false;
      this.volume = settings.soundVolume != null ? settings.soundVolume : 0.7;
    }

    _ensureAudioContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    // Warm wooden thud when a goat is placed on an intersection
    playPlace() {
      if (!this.enabled) return;
      this._ensureAudioContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.12);

      gain.gain.setValueAtTime(this.volume * 0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.12);
    }

    // Crisp wooden piece slide / step
    playMove() {
      if (!this.enabled) return;
      this._ensureAudioContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.08);
    }

    // Deep resonant tiger jump & capture
    playCapture() {
      if (!this.enabled) return;
      this._ensureAudioContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;

      // Heavy bass strike
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(160, t);
      osc1.frequency.exponentialRampToValueAtTime(45, t + 0.35);
      gain1.gain.setValueAtTime(this.volume * 0.9, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);

      // Upper strike transient
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(420, t);
      osc2.frequency.exponentialRampToValueAtTime(80, t + 0.2);
      gain2.gain.setValueAtTime(this.volume * 0.7, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc1.start(t);
      osc1.stop(t + 0.35);
      osc2.start(t);
      osc2.stop(t + 0.2);
    }

    // Ascending melodic victory fanfare
    playVictory() {
      if (!this.enabled) return;
      this._ensureAudioContext();
      if (!this.ctx) return;

      const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
      notes.forEach((freq, idx) => {
        const t = this.ctx.currentTime + idx * 0.11;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(this.volume * 0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.35);
      });
    }

    // Gentle crystal hint chime
    playHint() {
      if (!this.enabled) return;
      this._ensureAudioContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, t); // E5
      osc.frequency.setValueAtTime(880.00, t + 0.1); // A5

      gain.gain.setValueAtTime(this.volume * 0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.4);
    }

    // Invalid move soft bump
    playError() {
      if (!this.enabled) return;
      this._ensureAudioContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);

      gain.gain.setValueAtTime(this.volume * 0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.12);
    }
  }

  window.BaghChal.Sound = new SoundEngine();
})(window);
