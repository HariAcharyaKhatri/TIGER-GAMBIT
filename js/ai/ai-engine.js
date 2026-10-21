/**
 * BAGH-CHAL: ASYNCHRONOUS AI ENGINE
 * Alpha-Beta Minimax search with move ordering, tactical evaluation, and asynchronous dispatch.
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const C = window.BaghChal.Constants;
  const H = window.BaghChal.Helpers;
  const Rules = window.BaghChal.RulesEngine;
  const Eval = window.BaghChal.Evaluation;
  const Difficulty = window.BaghChal.Difficulty;

  const AIEngine = {
    // Choose move asynchronously so the browser UI never freezes
    chooseMove(gameState, difficultyKey = C.DIFFICULTY.MEDIUM) {
      const config = Difficulty.getConfig(difficultyKey);

      return new Promise((resolve) => {
        setTimeout(() => {
          let chosenMove = null;

          if (gameState.turn === C.SIDE.TIGERS) {
            chosenMove = this._selectTigerMove(gameState, config);
          } else {
            chosenMove = this._selectGoatMove(gameState, config);
          }

          resolve(chosenMove);
        }, config.delayMs);
      });
    },

    // =========================================================================
    // TIGER AI DECISION MAKING
    // =========================================================================
    _selectTigerMove(gameState, config) {
      const allMoves = Rules.getAllTigerMoves(gameState.board);
      if (allMoves.length === 0) return null;

      // 1. Check for intentional blunder at lower difficulties
      if (Math.random() < config.blunderChance && allMoves.length > 1) {
        // Pick a non-capturing move if available
        const nonCaptures = allMoves.filter(m => !m.isCapture);
        const pool = nonCaptures.length > 0 ? nonCaptures : allMoves;
        return pool[Math.floor(Math.random() * pool.length)];
      }

      // 2. Capture opportunities (Tigers should immediately seize captures in most difficulties)
      const captures = allMoves.filter(m => m.isCapture);
      if (config.searchDepth === 1 && captures.length > 0) {
        return captures[Math.floor(Math.random() * captures.length)];
      }

      // 3. Move Ordering: Sort captures first
      allMoves.sort((a, b) => (b.isCapture ? 1 : 0) - (a.isCapture ? 1 : 0));

      let bestMove = allMoves[0];
      let bestScore = -Infinity;

      for (const move of allMoves) {
        // Simulate move
        const simBoard = H.deepCloneBoard(gameState.board);
        simBoard[move.from.r][move.from.c] = C.PIECE.EMPTY;
        simBoard[move.to.r][move.to.c] = C.PIECE.TIGER;
        let capCount = gameState.goatsCaptured;
        if (move.isCapture && move.capturedGoat) {
          simBoard[move.capturedGoat.r][move.capturedGoat.c] = C.PIECE.EMPTY;
          capCount++;
        }

        // Minimax evaluation from Goats perspective (minimizing tigers)
        let score = this._minimax(
          simBoard,
          config.searchDepth - 1,
          -Infinity,
          Infinity,
          false, // next is minimizing (Goats turn)
          capCount,
          gameState.goatsToPlace,
          gameState.phase
        );

        if (config.randomnessWeight > 0) {
          score += (Math.random() - 0.5) * config.randomnessWeight;
        }

        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }

      return bestMove;
    },

    // =========================================================================
    // GOAT AI DECISION MAKING
    // =========================================================================
    _selectGoatMove(gameState, config) {
      if (gameState.phase === C.PHASE.PLACEMENT) {
        return this._selectGoatPlacement(gameState, config);
      } else {
        return this._selectGoatMovement(gameState, config);
      }
    },

    _selectGoatPlacement(gameState, config) {
      const emptySpots = Rules.getAllEmptySpots(gameState.board);
      if (emptySpots.length === 0) return null;

      // Filter and order candidate spots (focus search on promising intersections)
      emptySpots.sort((a, b) => {
        return Eval.POSITION_WEIGHTS[b.r][b.c] - Eval.POSITION_WEIGHTS[a.r][a.c];
      });

      // Limit search width to top candidates for speed
      const candidateSpots = emptySpots.slice(0, Math.min(emptySpots.length, 12));
      let bestSpot = candidateSpots[0];
      let bestScore = -Infinity;

      for (const spot of candidateSpots) {
        const simBoard = H.deepCloneBoard(gameState.board);
        simBoard[spot.r][spot.c] = C.PIECE.GOAT;

        let score = Eval.evaluateForGoats(simBoard, gameState.goatsCaptured, gameState.goatsToPlace - 1);

        // Deduct penalty if this placement immediately gifts a tiger capture!
        const tigerResponses = Rules.getAllTigerMoves(simBoard);
        const dangerousCaptures = tigerResponses.filter(m => m.isCapture);
        score -= dangerousCaptures.length * 180;

        if (config.randomnessWeight > 0) {
          score += (Math.random() - 0.5) * config.randomnessWeight;
        }

        if (score > bestScore) {
          bestScore = score;
          bestSpot = spot;
        }
      }

      return {
        type: 'placement',
        piece: C.PIECE.GOAT,
        to: { r: bestSpot.r, c: bestSpot.c }
      };
    },

    _selectGoatMovement(gameState, config) {
      const allMoves = Rules.getAllGoatMoves(gameState.board);
      if (allMoves.length === 0) return null;

      if (Math.random() < config.blunderChance && allMoves.length > 1) {
        return allMoves[Math.floor(Math.random() * allMoves.length)];
      }

      let bestMove = allMoves[0];
      let bestScore = -Infinity;

      for (const move of allMoves) {
        const simBoard = H.deepCloneBoard(gameState.board);
        simBoard[move.from.r][move.from.c] = C.PIECE.EMPTY;
        simBoard[move.to.r][move.to.c] = C.PIECE.GOAT;

        // Minimax evaluation from Tigers perspective
        let score = this._minimax(
          simBoard,
          config.searchDepth - 1,
          -Infinity,
          Infinity,
          true, // next is Tigers turn
          gameState.goatsCaptured,
          0,
          C.PHASE.MOVEMENT
        );

        // Goats want to minimize Tiger advantage (invert score)
        score = -score;

        if (config.randomnessWeight > 0) {
          score += (Math.random() - 0.5) * config.randomnessWeight;
        }

        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }

      return bestMove;
    },

    // =========================================================================
    // ALPHA-BETA MINIMAX SEARCH
    // =========================================================================
    _minimax(board, depth, alpha, beta, maximizingForTigers, goatsCaptured, goatsToPlace, phase) {
      // Terminal states
      if (goatsCaptured >= C.GOATS_TO_WIN) return 9999;
      if (Rules.countTrappedTigers(board) === C.TOTAL_TIGERS) return -9999;
      if (depth <= 0) {
        return Eval.evaluateForTigers(board, goatsCaptured) - Eval.evaluateForGoats(board, goatsCaptured, goatsToPlace);
      }

      if (maximizingForTigers) {
        let maxEval = -Infinity;
        const tigerMoves = Rules.getAllTigerMoves(board);
        if (tigerMoves.length === 0) return -9999; // Trapped!

        // Order captures first
        tigerMoves.sort((a, b) => (b.isCapture ? 1 : 0) - (a.isCapture ? 1 : 0));

        for (const m of tigerMoves) {
          const simB = H.deepCloneBoard(board);
          simB[m.from.r][m.from.c] = C.PIECE.EMPTY;
          simB[m.to.r][m.to.c] = C.PIECE.TIGER;
          let capCount = goatsCaptured;
          if (m.isCapture && m.capturedGoat) {
            simB[m.capturedGoat.r][m.capturedGoat.c] = C.PIECE.EMPTY;
            capCount++;
          }

          const evaluation = this._minimax(simB, depth - 1, alpha, beta, false, capCount, goatsToPlace, phase);
          maxEval = Math.max(maxEval, evaluation);
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) break; // Beta cutoff
        }
        return maxEval;
      } else {
        let minEval = Infinity;
        if (phase === C.PHASE.PLACEMENT && goatsToPlace > 0) {
          const emptySpots = Rules.getAllEmptySpots(board).slice(0, 8);
          for (const sp of emptySpots) {
            const simB = H.deepCloneBoard(board);
            simB[sp.r][sp.c] = C.PIECE.GOAT;
            const nextPhase = goatsToPlace - 1 === 0 ? C.PHASE.MOVEMENT : C.PHASE.PLACEMENT;

            const evaluation = this._minimax(simB, depth - 1, alpha, beta, true, goatsCaptured, goatsToPlace - 1, nextPhase);
            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) break; // Alpha cutoff
          }
        } else {
          const goatMoves = Rules.getAllGoatMoves(board).slice(0, 15);
          if (goatMoves.length === 0) return 9999; // Goats have no moves

          for (const m of goatMoves) {
            const simB = H.deepCloneBoard(board);
            simB[m.from.r][m.from.c] = C.PIECE.EMPTY;
            simB[m.to.r][m.to.c] = C.PIECE.GOAT;

            const evaluation = this._minimax(simB, depth - 1, alpha, beta, true, goatsCaptured, 0, C.PHASE.MOVEMENT);
            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) break;
          }
        }
        return minEval;
      }
    }
  };

  window.BaghChal.AIEngine = AIEngine;
})(window);
