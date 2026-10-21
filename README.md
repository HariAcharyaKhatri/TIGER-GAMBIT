# Bagh-Chal: Tiger's Gambit

A modern, premium, authentic web implementation of **Bagh-Chal** (बाघ चाल, *"Move of the Tigers"*), the traditional two-player asymmetric strategy board game of Nepal.

---

## 🌟 Key Features

- **Authentic Alquerque Board Topology**: Genuine 5×5 intersection network with accurate orthogonal lines and traditional parity diagonals.
- **Handcrafted Vector Pieces**: Custom SVG 2D tiger and goat medallions featuring brushed brass and ivory rims with tactile depth.
- **3-Column Grandmaster Layout**:
  - **Left**: Player status, active turn halo, unplaced goats tracker (20 slots), captured goats tracker (5 slots), tiger mobility status, match clocks.
  - **Center**: High-DPI canvas board with routed wood grain, brass rivets, coordinates, and last-move path lines.
  - **Right**: Move history notation table, live positional threat evaluation meter, and quick-action controls.
- **5-Tier AI Engine**: Asynchronous alpha-beta minimax search with move ordering (Beginner, Easy, Medium, Hard, and Expert).
- **Multiple Game Modes**:
  - Single Player vs AI (Play as Goats or Tigers)
  - Pass & Play (Local 2-Player on same screen)
  - Tactical Puzzles (6 curated endgame scenarios)
  - Interactive Tutorial & Rules Walkthrough
  - Online Multiplayer Simulation (Simulated matchmaking queue)
  - AI vs AI Spectator Duel
  - Practice Sandbox (Unlimited undos and hints)
- **Web Audio Sound Synthesizer**: Zero external audio dependencies; warm wooden thuds, piece sliding clicks, and tiger roar captures synthesized directly via Web Audio API.
- **Themes & Customization**:
  - Interface: *Midnight Forest*, *Obsidian Night*, and *Ancient Parchment* (Light Mode).
  - Board Material: *Royal Walnut*, *Golden Teak*, *Himalayan Slate*, and *Ancient Sandstone*.
- **Comprehensive Analytics**: Local storage dashboard tracking total games, win rates by side, and difficulty breakdown.

---

## 📁 Project Architecture

```text
bagh-chal/
│
├── index.html                   # Master application entry & SPA view orchestrator
├── README.md                    # Documentation & gameplay guide
├── .gitignore                   # Version control ignore definitions
│
├── pages/                       # Modular view templates
│   ├── home.html                # Hero banner & game mode cards
│   ├── game.html                # 3-column gameplay layout
│   ├── learn.html               # Rules, history, and strategic guide
│   ├── puzzles.html             # Tactical puzzles grid
│   ├── leaderboard.html         # Local rankings & match history
│   └── statistics.html          # Performance metrics & win rates
│
├── components/                  # Reusable UI component templates
│   ├── navbar.html              # Sticky navigation bar
│   ├── footer.html              # Brand footer & quick links
│   ├── game-card.html           # Mode selection card template
│   ├── modal.html               # Accessible modal dialog template
│   └── notification.html        # Toast notification container
│
├── css/                         # Design system & modular stylesheets
│   ├── design-system.css        # Color tokens, typography, radii, dark/light themes
│   ├── components.css           # Buttons, badges, modals, switches, and toasts
│   ├── main.css                 # Hero section, game mode cards, navbar, footer
│   ├── board.css                # 3-column gameplay grid, canvas frame, clocks, trackers
│   └── responsive.css           # Mobile, tablet, and desktop breakpoints
│
├── js/                          # Decoupled JavaScript modules
│   ├── utils/
│   │   ├── constants.js         # Board dimensions, game phases, piece constants
│   │   ├── helpers.js           # Coordinate conversions, deep clones, formatting
│   │   └── dom.js               # DOM querying, element creation, toast notifications
│   │
│   ├── storage/
│   │   ├── local-storage.js     # Storage manager for saves, history, stats, profile
│   │   └── data-migration.js    # Seamless migration for legacy TG PV5 browser data
│   │
│   ├── game/
│   │   ├── rules-engine.js      # Authentic 5x5 Alquerque graph topology & move generators
│   │   ├── move-validator.js    # Step, jump, and placement validation
│   │   ├── win-detection.js     # 5-goat capture, 4-tiger trap, and 3-fold repetition checks
│   │   ├── game-state.js        # Single source of truth state model & undo snapshots
│   │   ├── move-history.js      # Notation generator & replay table controller
│   │   ├── board-renderer.js    # High-DPI canvas board, piece rendering & animations
│   │   └── game-controller.js   # Game loop, turn coordinator, touch/keyboard input
│   │
│   ├── ai/
│   │   ├── evaluation.js        # Positional heuristics for Tigers and Goats
│   │   ├── difficulty.js        # 5 search depth & blunder configurations
│   │   └── ai-engine.js         # Minimax search with alpha-beta pruning
│   │
│   ├── features/
│   │   ├── sound.js             # Synthesized procedural Web Audio sound effects
│   │   ├── timer.js             # Match countdown clocks & blitz timers
│   │   ├── hints.js             # Best move recommendation & strategic advice
│   │   ├── puzzles.js           # 6 tactical endgame challenges
│   │   ├── tutorial.js          # Interactive 5-step rules guide
│   │   ├── statistics.js        # Analytics calculations & visual dashboard
│   │   └── leaderboard.js       # Player records & local ranking tables
│   │
│   ├── router.js                # Hash-based client router (#home, #game, #learn, etc.)
│   └── app.js                   # Application bootstrapper, modal & event bindings
│
└── assets/
    └── images/
        ├── logo.svg             # Custom emblem with Alquerque diamond backdrop
        ├── tiger.svg            # Handcrafted royal tiger token medallion
        └── goat.svg             # Handcrafted carved ivory mountain goat token
```

---

## 📜 Authentic Bagh-Chal Rules

1. **Board Structure**: 25 intersections connected orthogonally and diagonally at points where `(row + col) % 2 === 0`.
2. **Initial Setup**:
   - 4 Tigers occupy the four corners: `A1`, `E1`, `A5`, `E5`.
   - 20 Goats begin off-board in reserve.
3. **Turn Order**: Goats always move first.
4. **Placement Phase**:
   - Goats are placed one per turn on any vacant intersection.
   - Goats cannot move during this phase.
   - Tigers take normal turns (step or leap capture) after each goat placement.
5. **Movement Phase**:
   - Begins after all 20 goats have been deployed.
   - Goats can slide 1 step along any connected line to an adjacent empty intersection.
6. **Capturing (Tigers Only)**:
   - A tiger leaps over an adjacent goat into an empty space directly beyond along a straight line.
   - The jumped goat is removed permanently.
7. **Victory Conditions**:
   - **Tigers Win**: Capture **5 goats**.
   - **Goats Win**: Completely trap all **4 tigers** so no tiger has a legal step or leap.

---

## 🚀 Running Locally

No bundlers, node dependencies, or build tools are required.

### Option 1: Direct File
Simply open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server (Recommended)
Using Python:
```bash
python -m http.server 8000
```
Using Node.js:
```bash
npx serve .
```
Then visit `http://localhost:8000` in your browser.

---

## 🌐 Deployment to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, select **Deploy from a branch** and choose `main` / `master` (root folder).
4. Save. Your application will be live immediately with zero build errors!
