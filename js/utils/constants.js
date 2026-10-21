/**
 * BAGH-CHAL: GAME CONSTANTS
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};

  const Constants = {
    BOARD_SIZE: 5,
    TOTAL_POINTS: 25,
    TOTAL_GOATS: 20,
    TOTAL_TIGERS: 4,
    GOATS_TO_WIN: 5,

    PIECE: {
      TIGER: 'T',
      GOAT: 'G',
      EMPTY: null
    },

    SIDE: {
      TIGERS: 'tigers',
      GOATS: 'goats'
    },

    PHASE: {
      PLACEMENT: 'placement',
      MOVEMENT: 'movement'
    },

    INITIAL_TIGER_POSITIONS: [
      { r: 0, c: 0 },
      { r: 0, c: 4 },
      { r: 4, c: 0 },
      { r: 4, c: 4 }
    ],

    DIFFICULTY: {
      BEGINNER: 'beginner',
      EASY: 'easy',
      MEDIUM: 'medium',
      HARD: 'hard',
      EXPERT: 'expert'
    },

    MODE: {
      AI: 'ai',
      FRIEND: 'friend',
      PRACTICE: 'practice',
      PUZZLE: 'puzzle',
      TUTORIAL: 'tutorial',
      AI_VS_AI: 'ai_vs_ai',
      ONLINE: 'online'
    },

    WIN_REASON: {
      TIGERS_CAPTURED_5: 'Tigers captured 5 goats!',
      GOATS_TRAPPED_ALL: 'All 4 tigers are completely trapped!',
      RESIGNATION: 'Opponent resigned',
      DRAW_REPETITION: 'Draw by threefold repetition',
      DRAW_AGREED: 'Draw agreed by both players',
      TIMEOUT: 'Player ran out of time'
    },

    COL_LABELS: ['A', 'B', 'C', 'D', 'E'],
    ROW_LABELS: ['1', '2', '3', '4', '5'],

    STORAGE_KEYS: {
      SAVE: 'baghchal_save_v2',
      SETTINGS: 'baghchal_settings_v2',
      STATS: 'baghchal_stats_v2',
      HISTORY: 'baghchal_match_history_v2',
      LEADERBOARD: 'baghchal_leaderboard_v2',
      PROFILE: 'baghchal_profile_v2'
    }
  };

  window.BaghChal.Constants = Constants;
})(window);
