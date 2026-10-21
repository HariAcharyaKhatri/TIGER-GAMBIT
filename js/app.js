/**
 * BAGH-CHAL: MASTER APPLICATION BOOTSTRAP
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const C = window.BaghChal.Constants;
  const DOM = window.BaghChal.DOM;
  const Storage = window.BaghChal.Storage;
  const Migration = window.BaghChal.DataMigration;
  const Controller = window.BaghChal.GameController;
  const Router = window.BaghChal.Router;
  const Sound = window.BaghChal.Sound;
  const Puzzles = window.BaghChal.Puzzles;

  const App = {
    init() {
      // 1. Run Legacy Data Migration
      Migration.runMigration();

      // 2. Apply Theme & Settings
      this.applySavedTheme();

      // 3. Initialize Router
      Router.init();

      // 4. Initialize Game Controller & Canvas
      const canvas = DOM.byId('gameCanvas');
      if (canvas) {
        Controller.init(canvas);
        this.handleResize();
      }

      // 5. Check if saved game exists to show Resume button
      this.updateResumeGameButton();

      // 6. Bind All Global & Modal Event Listeners
      this.bindEvents();

      // 7. Render Puzzles Grid
      this.renderPuzzlesList();

      console.log('🐯 Bagh-Chal: Tiger\'s Gambit initialized successfully.');
    },

    applySavedTheme() {
      const settings = Storage.getSettings();
      document.documentElement.setAttribute('data-theme', settings.theme || 'midnight');
    },

    updateResumeGameButton() {
      const resumeBtn = DOM.byId('btnResumeGame');
      if (resumeBtn) {
        if (Storage.hasSavedGame()) {
          DOM.show(resumeBtn);
        } else {
          DOM.hide(resumeBtn);
        }
      }
    },

    handleResize() {
      const container = DOM.byId('boardContainer');
      if (container && Controller.renderer) {
        Controller.renderer.resize(container.clientWidth);
        Controller.render();
      }
    },

    bindEvents() {
      // Window Resize Listener
      window.addEventListener('resize', () => {
        this.handleResize();
      });

      // Mobile Navbar Toggle
      const mobileBtn = DOM.byId('mobileMenuBtn');
      const navLinks = DOM.byId('navLinks');
      if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
          navLinks.classList.toggle('mobile-open');
        });
      }

      // Navbar links
      DOM.$$('.nav-link[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const target = link.getAttribute('data-nav');
          Router.navigate(target);
        });
      });

      // Home Play Buttons
      const btnPlayHero = DOM.byId('btnPlayHero');
      if (btnPlayHero) {
        btnPlayHero.addEventListener('click', () => {
          this.openNewGameModal();
        });
      }

      const btnResumeGame = DOM.byId('btnResumeGame');
      if (btnResumeGame) {
        btnResumeGame.addEventListener('click', () => {
          Router.navigate('game');
          Controller.loadSavedGame();
        });
      }

      // Game Action Buttons
      const btnUndo = DOM.byId('btnUndo');
      if (btnUndo) btnUndo.addEventListener('click', () => Controller.undo());

      const btnHint = DOM.byId('btnHint');
      if (btnHint) btnHint.addEventListener('click', () => Controller.showHint());

      const btnRestart = DOM.byId('btnRestart');
      if (btnRestart) {
        btnRestart.addEventListener('click', () => {
          const settings = Storage.getSettings();
          if (settings.confirmRestart && !Controller.state.gameOver) {
            if (confirm('Are you sure you want to restart this match?')) {
              Controller.startNewGame({
                mode: Controller.mode,
                side: Controller.playerSide,
                difficulty: Controller.difficulty,
                timer: Controller.timerMode
              });
            }
          } else {
            Controller.startNewGame({
              mode: Controller.mode,
              side: Controller.playerSide,
              difficulty: Controller.difficulty,
              timer: Controller.timerMode
            });
          }
        });
      }

      const btnResign = DOM.byId('btnResign');
      if (btnResign) {
        btnResign.addEventListener('click', () => {
          if (confirm('Forfeit the match?')) {
            Controller.resign();
          }
        });
      }

      const btnSaveGame = DOM.byId('btnSaveGame');
      if (btnSaveGame) {
        btnSaveGame.addEventListener('click', () => {
          Controller.saveCurrentGame();
          this.updateResumeGameButton();
        });
      }

      const btnExportPGN = DOM.byId('btnExportPGN');
      if (btnExportPGN) {
        btnExportPGN.addEventListener('click', () => {
          const pgn = window.BaghChal.MoveHistory.exportPGN(Controller.state);
          navigator.clipboard.writeText(pgn).then(() => {
            DOM.showToast('Match notation copied to clipboard!', 'gold');
          }).catch(() => {
            prompt('Copy match notation:', pgn);
          });
        });
      }

      // Floating board buttons
      const btnToggleCoords = DOM.byId('btnToggleCoords');
      if (btnToggleCoords) {
        btnToggleCoords.addEventListener('click', () => {
          Controller.renderer.showCoordinates = !Controller.renderer.showCoordinates;
          Controller.render();
          DOM.showToast(`Coordinates ${Controller.renderer.showCoordinates ? 'Enabled' : 'Disabled'}`, 'gold', 1500);
        });
      }

      const btnToggleSound = DOM.byId('btnToggleSound');
      if (btnToggleSound) {
        btnToggleSound.addEventListener('click', () => {
          Sound.enabled = !Sound.enabled;
          const settings = Storage.getSettings();
          settings.soundEnabled = Sound.enabled;
          Storage.saveSettings(settings);
          btnToggleSound.textContent = Sound.enabled ? '🔊' : '🔇';
          DOM.showToast(`Sound ${Sound.enabled ? 'On' : 'Muted'}`, 'gold', 1500);
        });
      }

      // Modals
      this.bindModals();
    },

    bindModals() {
      // Close modal triggers
      DOM.$$('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) {
            backdrop.classList.remove('active');
          }
        });
      });

      DOM.$$('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
          const modal = btn.closest('.modal-backdrop');
          if (modal) modal.classList.remove('active');
        });
      });

      // Settings Modal
      const btnOpenSettings = DOM.byId('btnOpenSettings');
      if (btnOpenSettings) {
        btnOpenSettings.addEventListener('click', () => {
          this.openSettingsModal();
        });
      }

      const btnSaveSettings = DOM.byId('btnSaveSettings');
      if (btnSaveSettings) {
        btnSaveSettings.addEventListener('click', () => {
          this.saveSettingsFromModal();
        });
      }

      // New Game Modal Start Button
      const btnStartGameFromModal = DOM.byId('btnStartGameFromModal');
      if (btnStartGameFromModal) {
        btnStartGameFromModal.addEventListener('click', () => {
          this.startNewGameFromModal();
        });
      }

      // Play Again Button in Game Over Modal
      const btnGameOverPlayAgain = DOM.byId('btnGameOverPlayAgain');
      if (btnGameOverPlayAgain) {
        btnGameOverPlayAgain.addEventListener('click', () => {
          const modal = DOM.byId('modal-game-over');
          if (modal) modal.classList.remove('active');
          Controller.startNewGame({
            mode: Controller.mode,
            side: Controller.playerSide,
            difficulty: Controller.difficulty,
            timer: Controller.timerMode
          });
        });
      }

      // Matchmaking Modal Cancel
      const btnCancelMatchmaking = DOM.byId('btnCancelMatchmaking');
      if (btnCancelMatchmaking) {
        btnCancelMatchmaking.addEventListener('click', () => {
          const modal = DOM.byId('modal-matchmaking');
          if (modal) modal.classList.remove('active');
          if (this.matchmakingTimer) clearInterval(this.matchmakingTimer);
        });
      }
    },

    openNewGameModal(defaultMode = 'ai') {
      const modal = DOM.byId('modal-new-game');
      if (!modal) return;

      const modeSelect = DOM.byId('newGameMode');
      if (modeSelect) modeSelect.value = defaultMode;
      this.updateNewGameModalFields();

      modal.classList.add('active');
    },

    updateNewGameModalFields() {
      const modeSelect = DOM.byId('newGameMode');
      const diffGroup = DOM.byId('aiDifficultyGroup');
      if (modeSelect && diffGroup) {
        if (modeSelect.value === 'ai') {
          DOM.show(diffGroup);
        } else {
          DOM.hide(diffGroup);
        }
      }
    },

    startNewGameFromModal() {
      const modal = DOM.byId('modal-new-game');
      const mode = DOM.byId('newGameMode').value;
      const side = DOM.byId('newGameSide').value;
      const difficulty = DOM.byId('newGameDifficulty').value;
      const timer = DOM.byId('newGameTimer').value;

      // Handle Online Mode Simulation
      if (mode === 'online') {
        if (modal) modal.classList.remove('active');
        this.startOnlineMatchmaking(side, timer);
        return;
      }

      if (modal) modal.classList.remove('active');
      Router.navigate('game');

      let chosenSide = side;
      if (side === 'random') {
        chosenSide = Math.random() < 0.5 ? C.SIDE.GOATS : C.SIDE.TIGERS;
      }

      Controller.startNewGame({
        mode,
        side: chosenSide,
        difficulty,
        timer
      });
    },

    startOnlineMatchmaking(side, timer) {
      const modal = DOM.byId('modal-matchmaking');
      const timerText = DOM.byId('matchmakingCountdown');
      if (!modal) return;

      modal.classList.add('active');
      let secsLeft = 3;
      if (timerText) timerText.textContent = `Finding player... (${secsLeft}s)`;

      this.matchmakingTimer = setInterval(() => {
        secsLeft--;
        if (timerText) timerText.textContent = `Finding player... (${secsLeft}s)`;
        if (secsLeft <= 0) {
          clearInterval(this.matchmakingTimer);
          modal.classList.remove('active');

          Router.navigate('game');
          const opponentNames = ['HimalayanWolf', 'SherpaKing', 'KathmanduMaster', 'EverestFox'];
          const randOpponent = opponentNames[Math.floor(Math.random() * opponentNames.length)];

          DOM.showToast(`Matched with ${randOpponent}! (Simulated Room)`, 'gold', 3000);

          let chosenSide = side === 'random' ? (Math.random() < 0.5 ? C.SIDE.GOATS : C.SIDE.TIGERS) : side;
          Controller.startNewGame({
            mode: C.MODE.AI,
            side: chosenSide,
            difficulty: C.DIFFICULTY.HARD,
            timer: timer || 180
          });
        }
      }, 1000);
    },

    openSettingsModal() {
      const modal = DOM.byId('modal-settings');
      if (!modal) return;

      const settings = Storage.getSettings();
      const themeSelect = DOM.byId('settingTheme');
      const boardSelect = DOM.byId('settingBoard');
      const coordsSwitch = DOM.byId('settingCoords');
      const legalSwitch = DOM.byId('settingLegalMoves');
      const lastMoveSwitch = DOM.byId('settingLastMove');
      const soundSwitch = DOM.byId('settingSound');

      if (themeSelect) themeSelect.value = settings.theme || 'midnight';
      if (boardSelect) boardSelect.value = settings.boardTheme || 'walnut';
      if (coordsSwitch) coordsSwitch.checked = settings.showCoordinates !== false;
      if (legalSwitch) legalSwitch.checked = settings.showLegalMoves !== false;
      if (lastMoveSwitch) lastMoveSwitch.checked = settings.showLastMove !== false;
      if (soundSwitch) soundSwitch.checked = settings.soundEnabled !== false;

      modal.classList.add('active');
    },

    saveSettingsFromModal() {
      const modal = DOM.byId('modal-settings');
      const settings = Storage.getSettings();

      const theme = DOM.byId('settingTheme').value;
      const boardTheme = DOM.byId('settingBoard').value;
      const showCoordinates = DOM.byId('settingCoords').checked;
      const showLegalMoves = DOM.byId('settingLegalMoves').checked;
      const showLastMove = DOM.byId('settingLastMove').checked;
      const soundEnabled = DOM.byId('settingSound').checked;

      settings.theme = theme;
      settings.boardTheme = boardTheme;
      settings.showCoordinates = showCoordinates;
      settings.showLegalMoves = showLegalMoves;
      settings.showLastMove = showLastMove;
      settings.soundEnabled = soundEnabled;

      Storage.saveSettings(settings);

      // Apply changes
      document.documentElement.setAttribute('data-theme', theme);
      if (Controller.renderer) {
        Controller.renderer.boardTheme = boardTheme;
        Controller.renderer.showCoordinates = showCoordinates;
        Controller.renderer.showLegalMoves = showLegalMoves;
        Controller.renderer.showLastMove = showLastMove;
        Controller.render();
      }
      Sound.enabled = soundEnabled;

      if (modal) modal.classList.remove('active');
      DOM.showToast('Settings saved successfully', 'gold');
    },

    renderPuzzlesList() {
      const container = DOM.byId('puzzlesGrid');
      if (!container) return;

      const puzzles = Puzzles.getAll();
      let html = '';
      puzzles.forEach(p => {
        const sidePill = p.side === C.SIDE.TIGERS ?
          '<span class="badge badge-tiger">🐅 Play as Tiger</span>' :
          '<span class="badge badge-goat">🐐 Play as Goat</span>';

        html += `
          <div class="card card-interactive" onclick="window.BaghChal.App.startPuzzle('${p.id}')">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span class="badge badge-gold">${p.difficulty}</span>
              ${sidePill}
            </div>
            <h3 class="title-serif" style="font-size: 1.25rem; margin-bottom: 8px; color: var(--color-gold-300);">${p.title}</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 16px;">${p.instructions}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--color-gold-400); font-weight: 600;">
              <span>Solve Position</span>
              <span>→</span>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    },

    startPuzzle(puzzleId) {
      const puzzle = Puzzles.getById(puzzleId);
      if (!puzzle) return;

      Router.navigate('game');

      Controller.state = {
        board: JSON.parse(JSON.stringify(puzzle.board)),
        turn: puzzle.side,
        phase: puzzle.phase,
        goatsPlaced: 20 - puzzle.goatsToPlace,
        goatsToPlace: puzzle.goatsToPlace,
        goatsCaptured: puzzle.goatsCaptured,
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

      Controller.mode = C.MODE.PUZZLE;
      Controller.playerSide = puzzle.side;
      Controller.updateUI();
      Controller.render();

      DOM.showToast(`Puzzle: ${puzzle.title} — ${puzzle.instructions}`, 'gold', 4000);
    }
  };

  window.BaghChal.App = App;

  // Boot on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
})(window);
