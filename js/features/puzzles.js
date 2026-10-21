/**
 * BAGH-CHAL: TACTICAL PUZZLE SYSTEM
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const C = window.BaghChal.Constants;

  const PUZZLES = [
    {
      id: 'puzzle_1',
      title: 'The Final Pounce',
      difficulty: 'Beginner',
      side: C.SIDE.TIGERS,
      instructions: 'Tigers to play and capture their 5th goat to claim victory!',
      goatsCaptured: 4,
      goatsToPlace: 0,
      phase: C.PHASE.MOVEMENT,
      board: [
        ['T', 'G', null, 'G', 'T'],
        ['G', 'G', null, 'G', 'G'],
        [null, null, 'G', null, null],
        ['G', 'G', null, 'G', 'G'],
        ['T', null, null, null, 'T']
      ],
      solution: { from: { r: 0, c: 0 }, to: { r: 0, c: 2 } }, // Jump over goat at (0,1) to (0,2)
      hint: 'The tiger at A1 sees an unprotected goat right along the top row.'
    },
    {
      id: 'puzzle_2',
      title: 'The Iron Cage',
      difficulty: 'Intermediate',
      side: C.SIDE.GOATS,
      instructions: 'Three tigers are trapped. Move one goat to trap the final tiger at C3!',
      goatsCaptured: 2,
      goatsToPlace: 0,
      phase: C.PHASE.MOVEMENT,
      board: [
        ['T', 'G', 'G', 'G', 'T'],
        ['G', 'G', 'G', 'G', 'G'],
        ['G', 'G', 'T', null, 'G'],
        ['G', 'G', 'G', 'G', 'G'],
        ['T', 'G', 'G', 'G', 'T']
      ],
      solution: { from: { r: 1, c: 3 }, to: { r: 2, c: 3 } }, // Move goat from (1,3) to (2,3) to seal C3
      hint: 'Look at the only empty neighbor next to the center tiger.'
    },
    {
      id: 'puzzle_3',
      title: 'Center Breakout',
      difficulty: 'Advanced',
      side: C.SIDE.TIGERS,
      instructions: 'Find the only safe path to jump out and prevent a complete lockdown.',
      goatsCaptured: 3,
      goatsToPlace: 0,
      phase: C.PHASE.MOVEMENT,
      board: [
        ['T', 'G', null, null, 'T'],
        ['G', null, null, 'G', null],
        ['G', 'G', 'T', null, 'G'],
        [null, 'G', 'G', 'G', null],
        ['T', null, 'G', null, 'T']
      ],
      solution: { from: { r: 2, c: 2 }, to: { r: 0, c: 2 } }, // Tiger at (2,2) jumps goat at (1,2) or (0,2)
      hint: 'Look for an empty landing space on the vertical axis.'
    },
    {
      id: 'puzzle_4',
      title: 'Corner Squeeze',
      difficulty: 'Intermediate',
      side: C.SIDE.GOATS,
      instructions: 'Place a goat to cut off the top-right tiger from reaching the center.',
      goatsCaptured: 1,
      goatsToPlace: 6,
      phase: C.PHASE.PLACEMENT,
      board: [
        ['T', null, 'G', null, 'T'],
        [null, 'G', null, null, null],
        ['G', null, 'G', null, null],
        [null, null, null, 'G', null],
        ['T', null, null, null, 'T']
      ],
      solution: { to: { r: 1, c: 3 } }, // Place at (1,3)
      hint: 'The diagonal connecting (0,4) to (2,2) needs to be occupied at D2.'
    }
  ];

  const Puzzles = {
    getAll() {
      return PUZZLES;
    },

    getById(id) {
      return PUZZLES.find(p => p.id === id) || PUZZLES[0];
    },

    verifyMove(puzzle, move) {
      if (puzzle.phase === C.PHASE.PLACEMENT) {
        return move.to.r === puzzle.solution.to.r && move.to.c === puzzle.solution.to.c;
      } else {
        return (
          move.from &&
          move.from.r === puzzle.solution.from.r &&
          move.from.c === puzzle.solution.from.c &&
          move.to.r === puzzle.solution.to.r &&
          move.to.c === puzzle.solution.to.c
        );
      }
    }
  };

  window.BaghChal.Puzzles = Puzzles;
})(window);
