/**
 * BAGH-CHAL: PREMIUM CANVAS BOARD RENDERER
 * High-DPI, vector SVG piece rendering with procedural fallbacks, custom board textures,
 * last-move paths, legal move indicators, and capture animations.
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const C = window.BaghChal.Constants;
  const H = window.BaghChal.Helpers;
  const Rules = window.BaghChal.RulesEngine;

  class BoardRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.size = 500;
      this.dpr = window.devicePixelRatio || 1;
      this.margin = 55;
      this.spacing = (this.size - 2 * this.margin) / (C.BOARD_SIZE - 1);
      this.intersections = [];
      this.imagesLoaded = false;
      this.boardTheme = 'walnut';
      this.showCoordinates = true;
      this.showLegalMoves = true;
      this.showLastMove = true;
      this.hintMove = null;

      // Animations
      this.animating = false;
      this.pulsePhase = 0;
      this.captureFlash = null; // { r, c, startTime }

      this._loadAssets();
      this._computeIntersections();
    }

    _loadAssets() {
      this.tigerImg = new Image();
      this.tigerImg.src = 'assets/images/tiger.svg';

      this.goatImg = new Image();
      this.goatImg.src = 'assets/images/goat.svg';

      let loadedCount = 0;
      const onLoad = () => {
        loadedCount++;
        if (loadedCount >= 2) {
          this.imagesLoaded = true;
        }
      };

      this.tigerImg.onload = onLoad;
      this.goatImg.onload = onLoad;
    }

    resize(containerWidth) {
      // Calculate responsive board dimension (clamped between 320 and 580)
      const targetSize = H.clamp(containerWidth - 32, 320, 560);
      this.size = targetSize;
      this.margin = Math.round(targetSize * 0.11);
      this.spacing = (this.size - 2 * this.margin) / (C.BOARD_SIZE - 1);

      this.dpr = window.devicePixelRatio || 1;
      this.canvas.width = this.size * this.dpr;
      this.canvas.height = this.size * this.dpr;
      this.canvas.style.width = `${this.size}px`;
      this.canvas.style.height = `${this.size}px`;

      this.ctx.scale(this.dpr, this.dpr);
      this._computeIntersections();
    }

    _computeIntersections() {
      this.intersections = [];
      for (let r = 0; r < C.BOARD_SIZE; r++) {
        this.intersections[r] = [];
        for (let c = 0; c < C.BOARD_SIZE; c++) {
          this.intersections[r][c] = {
            x: this.margin + c * this.spacing,
            y: this.margin + r * this.spacing
          };
        }
      }
    }

    getIntersectionAt(pixelX, pixelY, hitRadius = null) {
      const radius = hitRadius || this.spacing * 0.44;
      let closest = null;
      let minDistance = Infinity;

      for (let r = 0; r < C.BOARD_SIZE; r++) {
        for (let c = 0; c < C.BOARD_SIZE; c++) {
          const pt = this.intersections[r][c];
          const dist = Math.hypot(pt.x - pixelX, pt.y - pixelY);
          if (dist < radius && dist < minDistance) {
            minDistance = dist;
            closest = { r, c, dist };
          }
        }
      }
      return closest ? { r: closest.r, c: closest.c } : null;
    }

    triggerCaptureAnimation(r, c) {
      this.captureFlash = { r, c, startTime: performance.now() };
    }

    render(gameState) {
      if (!this.ctx || !gameState) return;
      const ctx = this.ctx;
      ctx.save();

      // 1. Draw Board Texture & Background
      this._drawBoardBackground(ctx);

      // 2. Draw Grid Lines & Diagonal Connections
      this._drawGridLines(ctx);

      // 3. Draw Coordinates if enabled
      if (this.showCoordinates) {
        this._drawCoordinates(ctx);
      }

      // 4. Draw Last Move Highlight
      if (this.showLastMove && gameState.lastMove) {
        this._drawLastMoveHighlight(ctx, gameState.lastMove);
      }

      // 5. Draw Capture Flash Animation
      if (this.captureFlash) {
        this._drawCaptureFlash(ctx);
      }

      // 6. Draw Hint Highlight
      if (this.hintMove) {
        this._drawHint(ctx, this.hintMove);
      }

      // 7. Draw Legal Move Destinations
      if (this.showLegalMoves && gameState.validDestinations && gameState.validDestinations.length > 0) {
        this._drawLegalDestinations(ctx, gameState.validDestinations);
      }

      // 8. Draw Intersection Rivets / Points
      this._drawIntersectionRivets(ctx);

      // 9. Draw Pieces (Tigers and Goats)
      this._drawPieces(ctx, gameState);

      // 10. Draw Selection Ring around selected piece
      if (gameState.selectedPos) {
        this._drawSelectionRing(ctx, gameState.selectedPos);
      }

      ctx.restore();
    }

    _drawBoardBackground(ctx) {
      const s = this.size;

      // Theme-based board wood gradients
      let bgGrad;
      if (this.boardTheme === 'teak') {
        bgGrad = ctx.createRadialGradient(s / 2, s / 2, s * 0.1, s / 2, s / 2, s * 0.75);
        bgGrad.addColorStop(0, '#dfae70');
        bgGrad.addColorStop(0.6, '#b88544');
        bgGrad.addColorStop(1, '#83541c');
      } else if (this.boardTheme === 'slate') {
        bgGrad = ctx.createRadialGradient(s / 2, s / 2, s * 0.1, s / 2, s / 2, s * 0.75);
        bgGrad.addColorStop(0, '#354341');
        bgGrad.addColorStop(0.6, '#242e2c');
        bgGrad.addColorStop(1, '#151c1b');
      } else if (this.boardTheme === 'sandstone') {
        bgGrad = ctx.createRadialGradient(s / 2, s / 2, s * 0.1, s / 2, s / 2, s * 0.75);
        bgGrad.addColorStop(0, '#f2e8d5');
        bgGrad.addColorStop(0.6, '#dfcfb2');
        bgGrad.addColorStop(1, '#baa382');
      } else {
        // Default: Royal Walnut
        bgGrad = ctx.createRadialGradient(s / 2, s / 2, s * 0.1, s / 2, s / 2, s * 0.75);
        bgGrad.addColorStop(0, '#d1b48c');
        bgGrad.addColorStop(0.5, '#ad8757');
        bgGrad.addColorStop(0.85, '#78532b');
        bgGrad.addColorStop(1, '#4e3115');
      }

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, s, s);

      // Subtle procedural wood grain streaks
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.lineWidth = 1;
      for (let i = 15; i < s; i += 12) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.bezierCurveTo(s * 0.3, i - 4, s * 0.7, i + 4, s, i);
        ctx.stroke();
      }
      ctx.restore();

      // Outer border inlay groove
      ctx.strokeStyle = 'rgba(212, 163, 89, 0.28)';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.margin * 0.4, this.margin * 0.4, s - this.margin * 0.8, s - this.margin * 0.8);
    }

    _drawGridLines(ctx) {
      const drawn = new Set();
      const lineCol = this.boardTheme === 'slate' ? '#111716' : '#2b1607';

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Under-shadow for engraved routed groove look
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = Math.max(2, this.size * 0.007);
      this._strokeAllLines(ctx, drawn, 1, 1);

      // Main routed dark groove line
      ctx.strokeStyle = lineCol;
      ctx.lineWidth = Math.max(2.2, this.size * 0.0075);
      drawn.clear();
      this._strokeAllLines(ctx, drawn, 0, 0);

      ctx.restore();
    }

    _strokeAllLines(ctx, drawnSet, offsetX = 0, offsetY = 0) {
      for (let r = 0; r < C.BOARD_SIZE; r++) {
        for (let c = 0; c < C.BOARD_SIZE; c++) {
          const neighbors = Rules.getAdjacent(r, c);
          const p1 = this.intersections[r][c];

          for (const nb of neighbors) {
            const edgeKey = [H.posKey(r, c), H.posKey(nb.r, nb.c)].sort().join('|');
            if (!drawnSet.has(edgeKey)) {
              drawnSet.add(edgeKey);
              const p2 = this.intersections[nb.r][nb.c];

              ctx.beginPath();
              ctx.moveTo(p1.x + offsetX, p1.y + offsetY);
              ctx.lineTo(p2.x + offsetX, p2.y + offsetY);
              ctx.stroke();
            }
          }
        }
      }
    }

    _drawIntersectionRivets(ctx) {
      const radius = Math.max(2.5, this.size * 0.008);
      for (let r = 0; r < C.BOARD_SIZE; r++) {
        for (let c = 0; c < C.BOARD_SIZE; c++) {
          const pt = this.intersections[r][c];
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = '#42240b';
          ctx.fill();

          // Brass rivet center dot
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = '#d4a359';
          ctx.fill();
        }
      }
    }

    _drawCoordinates(ctx) {
      ctx.save();
      ctx.font = `600 ${Math.max(10, Math.round(this.size * 0.024))}px var(--font-sans)`;
      ctx.fillStyle = this.boardTheme === 'slate' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(40, 20, 5, 0.6)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Column letters A-E (top and bottom)
      for (let c = 0; c < C.BOARD_SIZE; c++) {
        const x = this.margin + c * this.spacing;
        const colName = C.COL_LABELS[c];
        ctx.fillText(colName, x, this.margin * 0.4);
        ctx.fillText(colName, x, this.size - this.margin * 0.4);
      }

      // Row numbers 1-5 (left and right)
      for (let r = 0; r < C.BOARD_SIZE; r++) {
        const y = this.margin + r * this.spacing;
        const rowName = C.ROW_LABELS[r];
        ctx.fillText(rowName, this.margin * 0.35, y);
        ctx.fillText(rowName, this.size - this.margin * 0.35, y);
      }
      ctx.restore();
    }

    _drawLastMoveHighlight(ctx, lastMove) {
      ctx.save();
      const fromPt = lastMove.from ? this.intersections[lastMove.from.r][lastMove.from.c] : null;
      const toPt = this.intersections[lastMove.to.r][lastMove.to.c];
      const haloR = this.spacing * 0.38;

      // Connecting dash line
      if (fromPt) {
        ctx.beginPath();
        ctx.moveTo(fromPt.x, fromPt.y);
        ctx.lineTo(toPt.x, toPt.y);
        ctx.strokeStyle = 'rgba(212, 163, 89, 0.6)';
        ctx.lineWidth = Math.max(2, this.size * 0.006);
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Origin ring
        ctx.beginPath();
        ctx.arc(fromPt.x, fromPt.y, haloR * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(212, 163, 89, 0.45)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Destination highlight
      ctx.beginPath();
      ctx.arc(toPt.x, toPt.y, haloR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(212, 163, 89, 0.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 163, 89, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    }

    _drawSelectionRing(ctx, pos) {
      const pt = this.intersections[pos.r][pos.c];
      const radius = this.spacing * 0.42;

      ctx.save();
      // Outer pulsating aura
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius * 1.15, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(244, 191, 59, 0.4)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Sharp gold selection ring
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#f4bf3b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.restore();
    }

    _drawLegalDestinations(ctx, destinations) {
      ctx.save();
      for (const dest of destinations) {
        const pt = this.intersections[dest.to.r][dest.to.c];
        const isCap = !!dest.isCapture;
        const dotRadius = this.spacing * 0.16;

        if (isCap) {
          // Dangerous capture target: pulsing crimson ring
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, this.spacing * 0.36, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(229, 62, 62, 0.25)';
          ctx.fill();
          ctx.strokeStyle = '#e53e3e';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        } else {
          // Regular legal step destination: translucent emerald circle
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 161, 105, 0.75)';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    _drawCaptureFlash(ctx) {
      const flash = this.captureFlash;
      const elapsed = performance.now() - flash.startTime;
      if (elapsed > 450) {
        this.captureFlash = null;
        return;
      }

      const progress = elapsed / 450;
      const pt = this.intersections[flash.r][flash.c];
      const maxR = this.spacing * 0.6;
      const curR = maxR * progress;

      ctx.save();
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, curR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(229, 62, 62, ${1 - progress})`;
      ctx.lineWidth = 4 * (1 - progress);
      ctx.stroke();
      ctx.restore();
    }

    _drawHint(ctx, hint) {
      ctx.save();
      const targetPos = hint.type === 'placement' ? hint.to : hint.to;
      const pt = this.intersections[targetPos.r][targetPos.c];

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, this.spacing * 0.35, 0, Math.PI * 2);
      ctx.strokeStyle = '#3182ce';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    _drawPieces(ctx, state) {
      const pieceSize = this.spacing * 0.8;
      const offset = pieceSize / 2;

      for (let r = 0; r < C.BOARD_SIZE; r++) {
        for (let c = 0; c < C.BOARD_SIZE; c++) {
          const piece = state.board[r][c];
          if (!piece) continue;

          const pt = this.intersections[r][c];

          if (piece === C.PIECE.TIGER) {
            if (this.imagesLoaded && this.tigerImg.complete) {
              ctx.drawImage(this.tigerImg, pt.x - offset, pt.y - offset, pieceSize, pieceSize);
            } else {
              this._drawFallbackTiger(ctx, pt.x, pt.y, pieceSize * 0.45);
            }
          } else if (piece === C.PIECE.GOAT) {
            if (this.imagesLoaded && this.goatImg.complete) {
              ctx.drawImage(this.goatImg, pt.x - offset, pt.y - offset, pieceSize, pieceSize);
            } else {
              this._drawFallbackGoat(ctx, pt.x, pt.y, pieceSize * 0.42);
            }
          }
        }
      }
    }

    // High quality vector procedural fallbacks if SVG images are loading
    _drawFallbackTiger(ctx, x, y, r) {
      ctx.save();
      // Outer drop shadow
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;

      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      grad.addColorStop(0, '#ff9e3b');
      grad.addColorStop(0.6, '#e0660a');
      grad.addColorStop(1, '#782600');

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#ffd79e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tiger crown stripes
      ctx.fillStyle = '#210b01';
      ctx.beginPath();
      ctx.arc(x, y + r * 0.1, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    _drawFallbackGoat(ctx, x, y, r) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;

      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.6, '#f3ebdd');
      grad.addColorStop(1, '#b8a68d');

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#5a4632';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Goat horn sweep
      ctx.strokeStyle = '#735b43';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.3, Math.PI, Math.PI * 1.8);
      ctx.arc(x + r * 0.3, y - r * 0.3, r * 0.3, Math.PI * 1.2, 0);
      ctx.stroke();
      ctx.restore();
    }
  }

  window.BaghChal.BoardRenderer = BoardRenderer;
})(window);
