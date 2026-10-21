/**
 * BAGH-CHAL: GAME STATE MODEL
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const C = window.BaghChal.Constants;
  const H = window.BaghChal.Helpers;
  const WinDetection = window.BaghChal.WinDetection;

  const GameState = {
    createInitialState() {
      // 5x5 empty board
      const board = [];
      for (let r = 0; r < C.BOARD_SIZE; r++) {
        board[r] = [];
        for (let c = 0; c < C.BOARD_SIZE; c++) {
          board[r][c] = C.PIECE.EMPTY;
        }
      }

      // Place 4 tigers at the 4 corners: (0,0), (0,4), (4,0), (4,4)
      for (const pos of C.INITIAL_TIGER_POSITIONS) {
        board[pos.r][pos.c] = C.PIECE.TIGER;
      }

      return {
        board,
        turn: C.SIDE.GOATS, // Goats always make the first move in Bagh-Chal
        phase: C.PHASE.PLACEMENT,
        goatsPlaced: 0,
        goatsToPlace: C.TOTAL_GOATS,
        goatsCaptured: 0,
        selectedPos: null,
        validDestinations: [],
        lastMove: null,
        gameOver: false,
        winner: null,
        winReason: null,
        moveNumber: 1,
        repetitionHashes: [],
        moveLog: [],
        historyStack: []
      };
    },

    cloneState(state) {
      return {
        board: H.deepCloneBoard(state.board),
        turn: state.turn,
        phase: state.phase,
        goatsPlaced: state.goatsPlaced,
        goatsToPlace: state.goatsToPlace,
        goatsCaptured: state.goatsCaptured,
        selectedPos: state.selectedPos ? { ...state.selectedPos } : null,
        validDestinations: state.validDestinations ? state.validDestinations.map(d => ({ ...d })) : [],
        lastMove: state.lastMove ? JSON.parse(JSON.stringify(state.lastMove)) : null,
        gameOver: state.gameOver,
        winner: state.winner,
        winReason: state.winReason,
        moveNumber: state.moveNumber,
        repetitionHashes: [...state.repetitionHashes],
        moveLog: [...state.moveLog]
      };
    },

    applyMove(state, move) {
      // Save current state snapshot onto historyStack before applying move
      const snapshot = this.cloneState(state);
      state.historyStack.push(snapshot);

      // Handle Goat Placement
      if (move.type === 'placement') {
        const { r, c } = move.to;
        state.board[r][c] = C.PIECE.GOAT;
        state.goatsPlaced++;
        state.goatsToPlace--;

        // If all 20 goats placed, transition to movement phase
        if (state.goatsToPlace === 0) {
          state.phase = C.PHASE.MOVEMENT;
        }

        state.turn = C.SIDE.TIGERS;
      }
      // Handle Piece Movement (Tiger or Goat)
      else {
        const { from, to } = move;
        const piece = state.board[from.r][from.c];
        state.board[from.r][from.c] = C.PIECE.EMPTY;
        state.board[to.r][to.c] = piece;

        // Handle Jump Capture by Tiger
        if (move.isCapture && move.capturedGoat) {
          const capR = move.capturedGoat.r;
          const capC = move.capturedGoat.c;
          state.board[capR][capC] = C.PIECE.EMPTY;
          state.goatsCaptured++;
        }

        // Switch Turn
        state.turn = (state.turn === C.SIDE.GOATS) ? C.SIDE.TIGERS : C.SIDE.GOATS;
      }

      state.lastMove = move;
      state.selectedPos = null;
      state.validDestinations = [];
      state.moveNumber++;

      // Record state hash for 3-fold repetition detection
      const hash = WinDetection.computeStateHash(state);
      state.repetitionHashes.push(hash);

      // Record move notation
      state.moveLog.push({
        moveNumber: state.historyStack.length,
        turn: move.piece === C.PIECE.TIGER ? C.SIDE.TIGERS : C.SIDE.GOATS,
        notation: H.formatNotation(move),
        isCapture: !!move.isCapture
      });

      // Check win/draw conditions
      const winCheck = WinDetection.evaluateGameState(state);
      if (winCheck.gameOver) {
        state.gameOver = true;
        state.winner = winCheck.winner;
        state.winReason = winCheck.reason;
      }

      return state;
    },

    undo(state) {
      if (!state.historyStack || state.historyStack.length === 0) return false;
      const prevSnapshot = state.historyStack.pop();

      state.board = prevSnapshot.board;
      state.turn = prevSnapshot.turn;
      state.phase = prevSnapshot.phase;
      state.goatsPlaced = prevSnapshot.goatsPlaced;
      state.goatsToPlace = prevSnapshot.goatsToPlace;
      state.goatsCaptured = prevSnapshot.goatsCaptured;
      state.selectedPos = null;
      state.validDestinations = [];
      state.lastMove = prevSnapshot.lastMove;
      state.gameOver = false;
      state.winner = null;
      state.winReason = null;
      state.moveNumber = prevSnapshot.moveNumber;
      state.repetitionHashes = prevSnapshot.repetitionHashes;
      state.moveLog = prevSnapshot.moveLog;

      return true;
    }
  };

  window.BaghChal.GameState = GameState;
})(window);
