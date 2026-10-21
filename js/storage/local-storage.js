/**
 * BAGH-CHAL: LOCAL STORAGE MANAGER
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const C = window.BaghChal.Constants;

  const Storage = {
    _safeGet(key, fallback = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      } catch (err) {
        console.warn(`[Storage] Failed to read ${key}:`, err);
        return fallback;
      }
    },

    _safeSet(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (err) {
        console.warn(`[Storage] Failed to write ${key}:`, err);
        return false;
      }
    },

    // Save & Load In-Progress Game
    saveGame(gameState) {
      return this._safeSet(C.STORAGE_KEYS.SAVE, {
        savedAt: Date.now(),
        state: gameState
      });
    },

    loadGame() {
      const data = this._safeGet(C.STORAGE_KEYS.SAVE);
      return data ? data.state : null;
    },

    hasSavedGame() {
      return !!this._safeGet(C.STORAGE_KEYS.SAVE);
    },

    clearSavedGame() {
      try {
        localStorage.removeItem(C.STORAGE_KEYS.SAVE);
      } catch (e) {}
    },

    // Settings
    getSettings() {
      const defaultSettings = {
        theme: 'midnight',
        boardTheme: 'walnut',
        pieceStyle: 'medallion',
        showCoordinates: true,
        showLegalMoves: true,
        showLastMove: true,
        soundEnabled: true,
        soundVolume: 0.7,
        timerMode: 'none', // 'none', 60, 180, 300, 600
        preferredSide: 'goats',
        defaultDifficulty: 'medium',
        confirmRestart: true
      };
      return Object.assign(defaultSettings, this._safeGet(C.STORAGE_KEYS.SETTINGS, {}));
    },

    saveSettings(settings) {
      return this._safeSet(C.STORAGE_KEYS.SETTINGS, settings);
    },

    // Stats
    getStats() {
      const defaultStats = {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        asGoats: { wins: 0, losses: 0 },
        asTigers: { wins: 0, losses: 0 },
        byDifficulty: {
          beginner: { wins: 0, losses: 0 },
          easy: { wins: 0, losses: 0 },
          medium: { wins: 0, losses: 0 },
          hard: { wins: 0, losses: 0 },
          expert: { wins: 0, losses: 0 }
        },
        goatsTrappedTigers: 0,
        tigersCapturedFive: 0,
        totalGoatsCaptured: 0
      };
      return Object.assign(defaultStats, this._safeGet(C.STORAGE_KEYS.STATS, {}));
    },

    recordMatchResult(match) {
      const stats = this.getStats();
      stats.totalMatches++;

      if (match.isDraw) {
        stats.draws++;
      } else if (match.playerWon) {
        stats.wins++;
      } else {
        stats.losses++;
      }

      if (match.playerSide === C.SIDE.GOATS) {
        if (match.playerWon) stats.asGoats.wins++;
        else if (!match.isDraw) stats.asGoats.losses++;
      } else if (match.playerSide === C.SIDE.TIGERS) {
        if (match.playerWon) stats.asTigers.wins++;
        else if (!match.isDraw) stats.asTigers.losses++;
      }

      if (match.mode === C.MODE.AI && match.difficulty && stats.byDifficulty[match.difficulty]) {
        if (match.playerWon) stats.byDifficulty[match.difficulty].wins++;
        else if (!match.isDraw) stats.byDifficulty[match.difficulty].losses++;
      }

      if (match.goatsCaptured != null) {
        stats.totalGoatsCaptured += match.goatsCaptured;
      }

      this._safeSet(C.STORAGE_KEYS.STATS, stats);

      // Record to history list (keep latest 30)
      const history = this.getMatchHistory();
      history.unshift({
        id: 'match_' + Date.now(),
        date: new Date().toISOString(),
        mode: match.mode,
        difficulty: match.difficulty,
        playerSide: match.playerSide,
        winner: match.winner,
        playerWon: match.playerWon,
        goatsCaptured: match.goatsCaptured,
        movesCount: match.movesCount,
        durationSeconds: match.durationSeconds,
        movesLog: match.movesLog || []
      });
      if (history.length > 30) history.pop();
      this._safeSet(C.STORAGE_KEYS.HISTORY, history);

      // Record to leaderboard
      this.addLeaderboardEntry({
        date: Date.now(),
        player: this.getProfile().username || 'Player',
        mode: match.mode,
        difficulty: match.difficulty || 'local',
        side: match.playerSide,
        result: match.isDraw ? 'draw' : match.playerWon ? 'win' : 'loss',
        moves: match.movesCount || 0
      });

      return stats;
    },

    getMatchHistory() {
      return this._safeGet(C.STORAGE_KEYS.HISTORY, []);
    },

    getLeaderboard() {
      const defaultLB = [
        { player: 'HimalayanMaster', wins: 28, winRate: 85, rank: 1, date: Date.now() - 86400000 * 3 },
        { player: 'GorkhaTactician', wins: 22, winRate: 78, rank: 2, date: Date.now() - 86400000 * 5 },
        { player: 'AnnapurnaHunter', wins: 17, winRate: 71, rank: 3, date: Date.now() - 86400000 * 7 }
      ];
      return this._safeGet(C.STORAGE_KEYS.LEADERBOARD, defaultLB);
    },

    addLeaderboardEntry(entry) {
      const lb = this.getLeaderboard();
      lb.push(entry);
      // Sort and keep top 25
      this._safeSet(C.STORAGE_KEYS.LEADERBOARD, lb.slice(0, 25));
    },

    getProfile() {
      const defaultProfile = {
        username: 'SherpaStrategist',
        title: 'Bagh-Chal Scholar',
        avatar: 'tiger',
        level: 1,
        xp: 0
      };
      return Object.assign(defaultProfile, this._safeGet(C.STORAGE_KEYS.PROFILE, {}));
    },

    saveProfile(profile) {
      return this._safeSet(C.STORAGE_KEYS.PROFILE, profile);
    }
  };

  window.BaghChal.Storage = Storage;
})(window);
