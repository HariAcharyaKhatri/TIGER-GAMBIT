/**
 * BAGH-CHAL: AI DIFFICULTY CONFIGURATIONS
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const C = window.BaghChal.Constants;

  const Difficulty = {
    configs: {
      [C.DIFFICULTY.BEGINNER]: {
        name: 'Beginner',
        searchDepth: 1,
        blunderChance: 0.45,
        randomnessWeight: 40,
        delayMs: 350,
        description: 'Makes casual moves, occasionally misses captures, easy to trap.'
      },
      [C.DIFFICULTY.EASY]: {
        name: 'Easy',
        searchDepth: 1,
        blunderChance: 0.20,
        randomnessWeight: 20,
        delayMs: 400,
        description: 'Basic tactical awareness; seizes easy captures but makes positional mistakes.'
      },
      [C.DIFFICULTY.MEDIUM]: {
        name: 'Medium',
        searchDepth: 2,
        blunderChance: 0.04,
        randomnessWeight: 8,
        delayMs: 500,
        description: 'Solid intermediate opponent. Avoids blunders and coordinates pieces.'
      },
      [C.DIFFICULTY.HARD]: {
        name: 'Hard',
        searchDepth: 3,
        blunderChance: 0.0,
        randomnessWeight: 2,
        delayMs: 600,
        description: 'Advanced strategist with 3-ply minimax search and tactical move ordering.'
      },
      [C.DIFFICULTY.EXPERT]: {
        name: 'Expert',
        searchDepth: 4,
        blunderChance: 0.0,
        randomnessWeight: 0,
        delayMs: 700,
        description: 'Master level. Deep 4-ply alpha-beta pruning with aggressive tactical calculation.'
      }
    },

    getConfig(difficultyKey) {
      return this.configs[difficultyKey] || this.configs[C.DIFFICULTY.MEDIUM];
    }
  };

  window.BaghChal.Difficulty = Difficulty;
})(window);
