/**
 * BAGH-CHAL: INTERACTIVE TUTORIAL & LESSON SYSTEM
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};

  const LESSONS = [
    {
      step: 1,
      title: 'The Sacred Board & Lines',
      badge: 'Basics',
      summary: 'Bagh-Chal is played on a 5×5 intersection grid containing 25 points.',
      content: `
        The board is based on the ancient <em>Alquerque</em> design. Pieces rest on the intersections, not inside squares.
        <ul>
          <li><strong>Orthogonal Lines:</strong> Every intersection connects directly up, down, left, and right.</li>
          <li><strong>Diagonal Lines:</strong> Only points where row + col is even share diagonal lines (including the main X diagonals and the central diamond).</li>
        </ul>
      `
    },
    {
      step: 2,
      title: 'The Four Prowling Tigers',
      badge: 'The Predators',
      summary: 'Four tigers start at the four corners of the board.',
      content: `
        Tigers are powerful hunters. Their primary objective is to capture <strong>5 goats</strong>.
        <ul>
          <li>Tigers can move 1 step along any connected line to an adjacent empty spot.</li>
          <li>They must preserve their mobility — if all 4 tigers get blocked, the tigers lose!</li>
        </ul>
      `
    },
    {
      step: 3,
      title: 'Placing the Twenty Goats',
      badge: 'Placement Phase',
      summary: 'The game begins with the Placement Phase. Goats always take the first turn.',
      content: `
        One by one, the goats are placed on any vacant intersection.
        <ul>
          <li>During this phase, goats <em>cannot move</em>, only be placed.</li>
          <li>Tigers take turns moving or jumping after each goat placement.</li>
          <li>Once all 20 goats have entered the board, the <strong>Movement Phase</strong> begins and goats may move 1 step along connected lines.</li>
        </ul>
      `
    },
    {
      step: 4,
      title: 'The Pounce: Tiger Captures',
      badge: 'Combat',
      summary: 'Tigers capture goats by leaping over them in a straight line.',
      content: `
        Similar to checkers, a tiger jumps over an adjacent goat into an immediately empty landing intersection along the same line.
        <ul>
          <li>The jumped goat is removed from the board permanently.</li>
          <li>Tigers can jump along orthogonal lines or connected diagonal lines.</li>
          <li>Goats cannot jump or capture tigers!</li>
        </ul>
      `
    },
    {
      step: 5,
      title: 'The Iron Net: Trapping Tigers',
      badge: 'Goat Strategy',
      summary: 'Goats win when all four tigers are completely surrounded and immobilized.',
      content: `
        Tigers are mighty, but goats have overwhelming numerical superiority (20 vs 4).
        <ul>
          <li>Place goats in pairs or dense triangles so tigers cannot jump over them.</li>
          <li>Drive tigers into the corners and outer edges where their movement is most restricted.</li>
          <li>If a tiger has no legal steps or jumps, it is <strong>trapped</strong>. Trap all four to win!</li>
        </ul>
      `
    }
  ];

  const Tutorial = {
    getAllLessons() {
      return LESSONS;
    },

    getLesson(stepNumber) {
      return LESSONS.find(l => l.step === stepNumber) || LESSONS[0];
    }
  };

  window.BaghChal.Tutorial = Tutorial;
})(window);
