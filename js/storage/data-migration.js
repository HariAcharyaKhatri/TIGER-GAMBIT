/**
 * BAGH-CHAL: DATA MIGRATION
 * Safely migrates legacy data from TG PV5 into current format without loss.
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const C = window.BaghChal.Constants;
  const Storage = window.BaghChal.Storage;

  const DataMigration = {
    runMigration() {
      try {
        // Migrate legacy username
        const oldUser = localStorage.getItem('baghchal_user');
        if (oldUser && !localStorage.getItem(C.STORAGE_KEYS.PROFILE)) {
          Storage.saveProfile({
            username: oldUser,
            title: 'Veteran Hunter',
            avatar: 'tiger',
            level: 2,
            xp: 150
          });
        }

        // Migrate legacy stats
        const oldStatsRaw = localStorage.getItem('baghchal_stats');
        if (oldStatsRaw && !localStorage.getItem(C.STORAGE_KEYS.STATS)) {
          try {
            const oldStats = JSON.parse(oldStatsRaw);
            const newStats = Storage.getStats();
            newStats.wins = oldStats.wins || 0;
            newStats.losses = oldStats.losses || 0;
            newStats.draws = oldStats.draws || 0;
            newStats.totalMatches = newStats.wins + newStats.losses + newStats.draws;
            localStorage.setItem(C.STORAGE_KEYS.STATS, JSON.stringify(newStats));
          } catch (e) {}
        }

        // Migrate legacy leaderboard
        const oldLBRaw = localStorage.getItem('baghchal_leaderboard');
        if (oldLBRaw && !localStorage.getItem(C.STORAGE_KEYS.LEADERBOARD)) {
          try {
            const oldLB = JSON.parse(oldLBRaw);
            if (Array.isArray(oldLB) && oldLB.length > 0) {
              localStorage.setItem(C.STORAGE_KEYS.LEADERBOARD, JSON.stringify(oldLB));
            }
          } catch (e) {}
        }
      } catch (err) {
        console.warn('[DataMigration] Migration check error:', err);
      }
    }
  };

  window.BaghChal.DataMigration = DataMigration;
})(window);
