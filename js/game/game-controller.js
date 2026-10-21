/**
 * BAGH-CHAL: GAME CONTROLLER
 * Glues GameState, Canvas Renderer, User Input, AI, Sound, and UI Panels into a seamless loop.
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const C = window.BaghChal.Constants;
  const H = window.BaghChal.Helpers;
  const DOM = window.BaghChal.DOM;
  const State = window.BaghChal.GameState;
  const Rules = window.BaghChal.RulesEngine;
  const Validator = window.BaghChal.MoveValidator;
  const Renderer = window.BaghChal.BoardRenderer;
  const AI = window.BaghChal.AIEngine;
  const Sound = window.BaghChal.Sound;
  const Timer = window.BaghChal.Timer;
  const MoveHistory = window.BaghChal.MoveHistory;
  const Hints = window.BaghChal.Hints;
  const Storage = window.BaghChal.Storage;
  const Eval = window.BaghChal.Evaluation;

  class GameController {
    constructor() {
      this.state = null;
      this.renderer = null;
      this.mode = C.MODE.AI;
      this.playerSide = C.SIDE.GOATS;
      this.difficulty = C.DIFFICULTY.MEDIUM;
      this.isAIThinking = false;
      this.gameStartTime = null;

      // Keyboard cursor pos
      this.cursor = { r: 2, c: 2 };
    }

    init(canvas) {
      this.canvas = canvas;
      this.renderer = new Renderer(canvas);

      this._bindCanvasEvents();
      this._bindKeyboardEvents();
    }

    startNewGame(options = {}) {
      this.mode = options.mode || C.MODE.AI;
      this.playerSide = options.side || C.SIDE.GOATS;
      this.difficulty = options.difficulty || C.DIFFICULTY.MEDIUM;
      this.timerMode = options.timer || 'none';

      this.state = State.createInitialState();
      this.isAIThinking = false;
      this.gameStartTime = Date.now();

      // Configure Board Themes & Coordinates from settings
      const settings = Storage.getSettings();
      this.renderer.boardTheme = settings.boardTheme || 'walnut';
      this.renderer.showCoordinates = settings.showCoordinates !== false;
      this.renderer.showLegalMoves = settings.showLegalMoves !== false;
      this.renderer.showLastMove = settings.showLastMove !== false;
      this.renderer.hintMove = null;

      // Initialize Timer
      Timer.configure(this.timerMode, (timedOutSide) => {
        this.handleTimeout(timedOutSide);
      });
      Timer.start(this.state.turn);

      this.updateUI();
      this.render();

      DOM.showToast(`Match started! ${this.mode === C.MODE.AI ? 'Playing against ' + this.difficulty.toUpperCase() + ' AI' : 'Local 2-Player Pass & Play'}`, 'gold', 2500);

      // Check if AI needs to move first (e.g. if player chose Tigers and Goats start first!)
      this._checkAITurn();
    }

    loadSavedGame() {
      const saved = Storage.loadGame();
      if (!saved) {
        DOM.showToast('No saved match found', 'danger');
        return false;
      }

      this.state = saved;
      this.isAIThinking = false;
      this.updateUI();
      this.render();
      DOM.showToast('Match resumed successfully!', 'gold');
      this._checkAITurn();
      return true;
    }

    saveCurrentGame() {
      if (!this.state || this.state.gameOver) {
        DOM.showToast('Cannot save a finished match', 'warning');
        return;
      }
      Storage.saveGame(this.state);
      DOM.showToast('Game saved to browser storage', 'gold');
    }

    // =========================================================================
    // CANVAS INTERACTION & HIT TESTING
    // =========================================================================
    _bindCanvasEvents() {
      const handleClickOrTouch = (clientX, clientY) => {
        if (!this.state || this.state.gameOver || this.isAIThinking) return;
        if (this._isAIsTurn()) return;

        const rect = this.canvas.getBoundingClientRect();
        const px = clientX - rect.left;
        const py = clientY - rect.top;

        const hit = this.renderer.getIntersectionAt(px, py);
        if (!hit) return;

        this.handleIntersectionSelect(hit.r, hit.c);
      };

      this.canvas.addEventListener('click', (e) => {
        handleClickOrTouch(e.clientX, e.clientY);
      });

      this.canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          e.preventDefault();
          handleClickOrTouch(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: false });
    }

    _bindKeyboardEvents() {
      window.addEventListener('keydown', (e) => {
        // Only react if Game view is active
        const gameSec = DOM.byId('section-game');
        if (!gameSec || !gameSec.classList.contains('active')) return;
        if (this.state.gameOver || this.isAIThinking) return;

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
          e.preventDefault();
        }

        if (e.key === 'ArrowUp' && this.cursor.r > 0) this.cursor.r--;
        else if (e.key === 'ArrowDown' && this.cursor.r < 4) this.cursor.r++;
        else if (e.key === 'ArrowLeft' && this.cursor.c > 0) this.cursor.c--;
        else if (e.key === 'ArrowRight' && this.cursor.c < 4) this.cursor.c++;
        else if (e.key === 'Enter' || e.key === ' ') {
          this.handleIntersectionSelect(this.cursor.r, this.cursor.c);
        }
      });
    }

    // Handle user clicking an intersection
    handleIntersectionSelect(r, c) {
      this.renderer.hintMove = null;
      const currentTurn = this.state.turn;

      // 1. Placement Phase (Goats placing)
      if (this.state.phase === C.PHASE.PLACEMENT && currentTurn === C.SIDE.GOATS) {
        if (Validator.canPlaceGoat(this.state, r, c)) {
          this.executeMove({
            type: 'placement',
            piece: C.PIECE.GOAT,
            to: { r, c }
          });
          Sound.playPlace();
        } else {
          Sound.playError();
          DOM.showToast('Invalid placement! Spot is occupied.', 'danger', 1800);
        }
        return;
      }

      // 2. Movement Phase (or Tiger's turn during placement phase)
      const selected = this.state.selectedPos;

      // If no piece is currently selected:
      if (!selected) {
        const pieceAtSpot = this.state.board[r][c];

        // Ensure clicking player's own active piece
        const isValidPieceSelection =
          (currentTurn === C.SIDE.TIGERS && pieceAtSpot === C.PIECE.TIGER) ||
          (currentTurn === C.SIDE.GOATS && pieceAtSpot === C.PIECE.GOAT && this.state.phase === C.PHASE.MOVEMENT);

        if (isValidPieceSelection) {
          const destinations = Validator.getLegalDestinations(this.state, r, c);
          if (destinations.length > 0) {
            this.state.selectedPos = { r, c };
            this.state.validDestinations = destinations;
            Sound.playMove();
            this.render();
          } else {
            Sound.playError();
            DOM.showToast('This piece has no legal moves available!', 'warning', 1800);
          }
        }
        return;
      }

      // If a piece IS already selected:
      // Clicking the same piece again -> Deselect
      if (selected.r === r && selected.c === c) {
        this.state.selectedPos = null;
        this.state.validDestinations = [];
        this.render();
        return;
      }

      // Clicking another of own piece -> Switch selection
      const pieceAtSpot = this.state.board[r][c];
      const isSwitchingOwn =
        (currentTurn === C.SIDE.TIGERS && pieceAtSpot === C.PIECE.TIGER) ||
        (currentTurn === C.SIDE.GOATS && pieceAtSpot === C.PIECE.GOAT);

      if (isSwitchingOwn) {
        const destinations = Validator.getLegalDestinations(this.state, r, c);
        this.state.selectedPos = { r, c };
        this.state.validDestinations = destinations;
        Sound.playMove();
        this.render();
        return;
      }

      // Attempting to move selected piece to (r, c)
      const matchedMove = this.state.validDestinations.find(d => d.to.r === r && d.to.c === c);
      if (matchedMove) {
        if (matchedMove.isCapture) {
          this.renderer.triggerCaptureAnimation(matchedMove.capturedGoat.r, matchedMove.capturedGoat.c);
          Sound.playCapture();
        } else {
          Sound.playMove();
        }
        this.executeMove(matchedMove);
      } else {
        Sound.playError();
        DOM.showToast('Illegal destination!', 'danger', 1800);
      }
    }

    // Execute Move and trigger state transitions
    executeMove(move) {
      State.applyMove(this.state, move);
      Timer.switchTurn(this.state.turn);

      this.updateUI();
      this.render();

      // Check for Game Over
      if (this.state.gameOver) {
        this.handleGameOver();
        return;
      }

      // Trigger AI turn if needed
      this._checkAITurn();
    }

    _isAIsTurn() {
      if (this.mode !== C.MODE.AI) return false;
      return this.state.turn !== this.playerSide;
    }

    async _checkAITurn() {
      if (this.state.gameOver) return;
      if (!this._isAIsTurn()) return;

      this.isAIThinking = true;
      this.updateUI();

      try {
        const aiMove = await AI.chooseMove(this.state, this.difficulty);
        this.isAIThinking = false;

        if (aiMove) {
          if (aiMove.isCapture) {
            this.renderer.triggerCaptureAnimation(aiMove.capturedGoat.r, aiMove.capturedGoat.c);
            Sound.playCapture();
          } else if (aiMove.type === 'placement') {
            Sound.playPlace();
          } else {
            Sound.playMove();
          }
          this.executeMove(aiMove);
        } else {
          // AI has no legal moves -> loss
          this.state.gameOver = true;
          this.state.winner = this.playerSide;
          this.state.winReason = 'AI has no moves available';
          this.handleGameOver();
        }
      } catch (err) {
        console.error('AI execution error:', err);
        this.isAIThinking = false;
      }
    }

    // =========================================================================
    // GAME OVER & RESIGNATION
    // =========================================================================
    handleGameOver() {
      Timer.stop();

      const isDraw = this.state.winner === 'draw';
      const playerWon = (this.mode === C.MODE.FRIEND) ? true : (this.state.winner === this.playerSide);

      if (isDraw) {
        Sound.playVictory();
      } else if (playerWon) {
        Sound.playVictory();
      } else {
        Sound.playError();
      }

      // Record match to stats and history
      Storage.recordMatchResult({
        mode: this.mode,
        difficulty: this.difficulty,
        playerSide: this.playerSide,
        winner: this.state.winner,
        playerWon,
        isDraw,
        goatsCaptured: this.state.goatsCaptured,
        movesCount: this.state.moveLog.length,
        durationSeconds: Math.round((Date.now() - this.gameStartTime) / 1000),
        movesLog: this.state.moveLog
      });

      // Show Game Over Modal
      this._showGameOverModal();
    }

    _showGameOverModal() {
      const modal = DOM.byId('modal-game-over');
      const title = DOM.byId('gameOverTitle');
      const subtitle = DOM.byId('gameOverSubtitle');
      const icon = DOM.byId('gameOverIcon');

      if (!modal) return;

      if (this.state.winner === 'draw') {
        if (title) title.textContent = 'Peace in the Valleys — Draw!';
        if (subtitle) subtitle.textContent = this.state.winReason || 'Position repeated three times.';
        if (icon) icon.textContent = '🤝';
      } else if (this.state.winner === C.SIDE.GOATS) {
        if (title) title.textContent = 'The Goats Triumph!';
        if (subtitle) subtitle.textContent = this.state.winReason || 'All 4 tigers are completely locked and immobilized.';
        if (icon) icon.innerHTML = '<img src="assets/images/goat.svg" style="width:72px;height:72px;margin:0 auto;">';
      } else {
        if (title) title.textContent = 'The Tigers Prowl Victorious!';
        if (subtitle) subtitle.textContent = this.state.winReason || '5 goats were captured. The hunt is complete!';
        if (icon) icon.innerHTML = '<img src="assets/images/tiger.svg" style="width:72px;height:72px;margin:0 auto;">';
      }

      modal.classList.add('active');
    }

    handleTimeout(timedOutSide) {
      this.state.gameOver = true;
      this.state.winner = (timedOutSide === C.SIDE.TIGERS) ? C.SIDE.GOATS : C.SIDE.TIGERS;
      this.state.winReason = C.WIN_REASON.TIMEOUT;
      this.handleGameOver();
    }

    resign() {
      if (!this.state || this.state.gameOver) return;
      const winner = (this.state.turn === C.SIDE.GOATS) ? C.SIDE.TIGERS : C.SIDE.GOATS;
      this.state.gameOver = true;
      this.state.winner = winner;
      this.state.winReason = C.WIN_REASON.RESIGNATION;
      this.handleGameOver();
    }

    undo() {
      if (!this.state || this.state.gameOver || this.isAIThinking) return;

      if (this.mode === C.MODE.AI) {
        // Undo 2 half-moves so the player is back on their turn
        State.undo(this.state);
        State.undo(this.state);
      } else {
        State.undo(this.state);
      }

      Timer.switchTurn(this.state.turn);
      this.updateUI();
      this.render();
      DOM.showToast('Move undone', 'gold', 1500);
    }

    async showHint() {
      if (!this.state || this.state.gameOver || this.isAIThinking) return;
      const bestMove = await Hints.getHint(this.state);
      if (bestMove) {
        this.renderer.hintMove = bestMove;
        this.render();
      }
    }

    // =========================================================================
    // UI UPDATES
    // =========================================================================
    updateUI() {
      if (!this.state) return;

      // 1. Active Turn Indicators
      const tigerCard = DOM.byId('tigerPlayerCard');
      const goatCard = DOM.byId('goatPlayerCard');
      const turnBanner = DOM.byId('turnAlertBanner');
      const turnText = DOM.byId('turnInstructionText');
      const phasePill = DOM.byId('phasePill');

      if (tigerCard && goatCard) {
        DOM.toggleClass(tigerCard, 'active-turn', this.state.turn === C.SIDE.TIGERS);
        DOM.toggleClass(goatCard, 'active-turn', this.state.turn === C.SIDE.GOATS);
      }

      if (turnBanner && turnText) {
        DOM.toggleClass(turnBanner, 'tigers-turn', this.state.turn === C.SIDE.TIGERS);
        DOM.toggleClass(turnBanner, 'goats-turn', this.state.turn === C.SIDE.GOATS);

        if (this.isAIThinking) {
          turnText.textContent = 'Opponent is thinking...';
        } else if (this.state.turn === C.SIDE.GOATS) {
          if (this.state.phase === C.PHASE.PLACEMENT) {
            turnText.textContent = `Goats' Turn — Place goat on an empty intersection (${this.state.goatsToPlace} remaining)`;
          } else {
            turnText.textContent = "Goats' Turn — Move a goat along a connected line";
          }
        } else {
          turnText.textContent = "Tigers' Turn — Move or jump over a goat to capture";
        }
      }

      if (phasePill) {
        phasePill.textContent = this.state.phase === C.PHASE.PLACEMENT ? 'Placement Phase' : 'Movement Phase';
      }

      // 2. Goats Remaining to Place Slots
      const goatsToPlaceContainer = DOM.byId('goatsToPlaceSlots');
      if (goatsToPlaceContainer) {
        let slotsHtml = '';
        for (let i = 0; i < C.TOTAL_GOATS; i++) {
          const isFilled = i < this.state.goatsToPlace;
          slotsHtml += `<span class="goat-slot ${isFilled ? 'filled' : ''}"></span>`;
        }
        goatsToPlaceContainer.innerHTML = slotsHtml;
      }

      // 3. Captured Goats Slots
      const capturedSlots = DOM.byId('capturedGoatsSlots');
      if (capturedSlots) {
        let capsHtml = '';
        for (let i = 0; i < C.GOATS_TO_WIN; i++) {
          const isCap = i < this.state.goatsCaptured;
          capsHtml += `<span class="goat-slot ${isCap ? 'captured' : ''}" style="width:18px;height:18px;"></span>`;
        }
        capturedSlots.innerHTML = capsHtml;
      }

      // 4. Tiger Trapped Slots
      const tigerTrapsContainer = DOM.byId('tigerTrapsContainer');
      if (tigerTrapsContainer) {
        const trappedCount = Rules.countTrappedTigers(this.state.board);
        let tigerSlotsHtml = '';
        for (let i = 0; i < C.TOTAL_TIGERS; i++) {
          const isTrapped = i < trappedCount;
          tigerSlotsHtml += `
            <div class="tiger-status-slot ${isTrapped ? 'trapped' : 'free'}">
              Tiger ${i + 1}: ${isTrapped ? 'Trapped' : 'Free'}
            </div>
          `;
        }
        tigerTrapsContainer.innerHTML = tigerSlotsHtml;
      }

      // 5. Threat Evaluation Meter
      const threatFill = DOM.byId('threatMeterFill');
      if (threatFill) {
        const balance = Eval.getGameBalance(this.state.board, this.state.goatsCaptured, this.state.goatsToPlace);
        threatFill.style.width = `${balance}%`;
      }

      // 6. Move History Log
      MoveHistory.render(this.state.moveLog);
    }

    render() {
      if (this.renderer && this.state) {
        this.renderer.render(this.state);
      }
    }
  }

  window.BaghChal.GameController = new GameController();
})(window);
