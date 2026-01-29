import Phaser from 'phaser';
import { COLORS, STORAGE_KEYS } from '../config.js';
import { UI_TEXT } from '../data/dialogue.js';
import { telegram } from '../utils/telegram.js';

export default class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(600, 10, 10, 30);

    // === DEEP DARK BACKGROUND ===
    this.add.rectangle(width / 2, height / 2, width, height, 0x0A0A1E);

    // Subtle radial gradient feel using layered circles
    const bgGlow = this.add.graphics();
    bgGlow.fillStyle(0x1A0A2E, 0.4); bgGlow.fillCircle(width / 2, height / 2, 350);
    bgGlow.fillStyle(0x2D1B4E, 0.15); bgGlow.fillCircle(width / 2, height / 2, 250);
    bgGlow.fillStyle(0x3D2B5E, 0.08); bgGlow.fillCircle(width / 2, height / 2 - 50, 180);

    // === ANIMATED FOG LAYERS ===
    this._createFogLayers(width, height);

    // === RUNE CIRCLE (DETAILED) ===
    this._createRuneCircle(width, height);

    // === CORNER ORNAMENTS ===
    this._drawCornerOrnaments(width, height);

    // === VIGNETTE OVERLAY ===
    const vig = this.add.graphics();
    vig.setDepth(50);
    // Top & bottom gradient bands
    for (let i = 0; i < 8; i++) {
      const a = 0.25 - i * 0.028;
      if (a <= 0) continue;
      vig.fillStyle(0x000000, a);
      vig.fillRect(0, i * 8, width, 8);
      vig.fillRect(0, height - (i + 1) * 8, width, 8);
    }
    // Side vignettes
    for (let i = 0; i < 6; i++) {
      const a = 0.18 - i * 0.028;
      if (a <= 0) continue;
      vig.fillStyle(0x000000, a);
      vig.fillRect(i * 6, 0, 6, height);
      vig.fillRect(width - (i + 1) * 6, 0, 6, height);
    }

    // === ANIMATED PARTICLES (embers, sparkles, dust) ===
    this._createParticles(width, height);

    // === TITLE with glow/shimmer ===
    const titleY = 75;

    // Outer glow layer
    const titleGlow = this.add.text(width / 2, titleY, UI_TEXT.menu.title, {
      fontFamily: 'Cinzel, serif', fontSize: '44px', fontStyle: 'bold', color: '#D4AF37',
      stroke: '#D4AF37', strokeThickness: 8,
    }).setOrigin(0.5).setAlpha(0.15).setScale(1.02).setDepth(10);
    this.tweens.add({
      targets: titleGlow, alpha: 0.25, scale: 1.05,
      duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Mid glow layer
    const titleMidGlow = this.add.text(width / 2, titleY, UI_TEXT.menu.title, {
      fontFamily: 'Cinzel, serif', fontSize: '44px', fontStyle: 'bold', color: '#D4AF37',
      stroke: '#8B6914', strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0.3).setDepth(11);
    this.tweens.add({
      targets: titleMidGlow, alpha: 0.45,
      duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 300,
    });

    // Main title
    this.add.text(width / 2, titleY, UI_TEXT.menu.title, {
      fontFamily: 'Cinzel, serif', fontSize: '44px', fontStyle: 'bold', color: '#D4AF37',
      stroke: '#0A0A1E', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(12);

    // Subtitle
    this.add.text(width / 2, titleY + 42, UI_TEXT.menu.subtitle, {
      fontFamily: 'Crimson Text, serif', fontSize: '16px', fontStyle: 'italic', color: '#4ECDC4',
      stroke: '#0A0A1E', strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0.9).setDepth(12);

    // === DECORATIVE DIVIDER ===
    const divY = titleY + 62;
    const divG = this.add.graphics().setDepth(12);
    // Main line
    divG.lineStyle(2, COLORS.gold, 0.7);
    divG.beginPath(); divG.moveTo(width / 2 - 120, divY); divG.lineTo(width / 2 + 120, divY); divG.strokePath();
    // Thin outer lines
    divG.lineStyle(1, COLORS.gold, 0.3);
    divG.beginPath(); divG.moveTo(width / 2 - 100, divY - 4); divG.lineTo(width / 2 + 100, divY - 4); divG.strokePath();
    divG.beginPath(); divG.moveTo(width / 2 - 100, divY + 4); divG.lineTo(width / 2 + 100, divY + 4); divG.strokePath();
    // Center diamond
    divG.fillStyle(COLORS.gold, 0.9);
    divG.beginPath();
    divG.moveTo(width / 2, divY - 6);
    divG.lineTo(width / 2 + 6, divY);
    divG.lineTo(width / 2, divY + 6);
    divG.lineTo(width / 2 - 6, divY);
    divG.closePath(); divG.fillPath();
    // End dots
    divG.fillStyle(COLORS.gold, 0.7);
    divG.fillCircle(width / 2 - 120, divY, 3);
    divG.fillCircle(width / 2 + 120, divY, 3);
    // Small diamonds at ±60
    [width / 2 - 60, width / 2 + 60].forEach(dx => {
      divG.fillStyle(COLORS.gold, 0.5);
      divG.beginPath();
      divG.moveTo(dx, divY - 3); divG.lineTo(dx + 3, divY);
      divG.lineTo(dx, divY + 3); divG.lineTo(dx - 3, divY);
      divG.closePath(); divG.fillPath();
    });

    // === BUTTONS ===
    const btnY = height / 2 + 30;
    this._createOrnateButton(width / 2, btnY, UI_TEXT.menu.play, 200, 54, true, () => {
      this.cameras.main.fadeOut(500, 10, 10, 30);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameScene'));
    });
    this._createOrnateButton(width / 2 - 110, btnY + 72, UI_TEXT.menu.codex, 140, 42, false, () => {
      this.cameras.main.fadeOut(300, 10, 10, 30);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('CodexScene'));
    });
    this._createOrnateButton(width / 2 + 110, btnY + 72, UI_TEXT.menu.settings, 140, 42, false, () => {
      telegram.hapticFeedback('warning');
    });

    // === HIGH SCORE ===
    const hs = localStorage.getItem(STORAGE_KEYS.highScore) || 0;
    const mw = localStorage.getItem(STORAGE_KEYS.maxWave) || 0;
    if (hs > 0) {
      this.add.text(width / 2, height - 55, UI_TEXT.menu.highScore + ': ' + hs, {
        fontFamily: 'Cinzel, serif', fontSize: '15px', color: '#D4AF37',
        stroke: '#0A0A1E', strokeThickness: 2,
      }).setOrigin(0.5).setAlpha(0.8).setDepth(12);
      this.add.text(width / 2, height - 36, 'Wave ' + mw, {
        fontFamily: 'Crimson Text, serif', fontSize: '13px', color: '#4ECDC4',
        stroke: '#0A0A1E', strokeThickness: 2,
      }).setOrigin(0.5).setAlpha(0.6).setDepth(12);
    }

    // === WELCOME TEXT ===
    if (telegram.userName && telegram.userName !== 'Apprentice') {
      this.add.text(width - 16, 16, 'Welcome, ' + telegram.userName, {
        fontFamily: 'Crimson Text, serif', fontSize: '13px', color: '#4ECDC4',
        stroke: '#0A0A1E', strokeThickness: 2,
      }).setOrigin(1, 0).setAlpha(0.7).setDepth(12);
    }
  }

  // === FOG LAYERS ===
  _createFogLayers(w, h) {
    // Multiple fog ellipses at different depths
    for (let layer = 0; layer < 3; layer++) {
      for (let i = 0; i < 6; i++) {
        const fog = this.add.ellipse(
          Phaser.Math.Between(-50, w + 50),
          Phaser.Math.Between(h * 0.3, h),
          Phaser.Math.Between(150, 350),
          Phaser.Math.Between(40, 100),
          layer === 0 ? 0x2D1B4E : layer === 1 ? 0x1A0A2E : 0x4ECDC4,
          layer === 2 ? 0.015 : 0.06
        ).setDepth(layer);

        this.tweens.add({
          targets: fog,
          x: fog.x + Phaser.Math.Between(-80, 80),
          alpha: { from: fog.alpha, to: fog.alpha * Phaser.Math.FloatBetween(0.3, 1.5) },
          scaleX: Phaser.Math.FloatBetween(0.8, 1.3),
          duration: Phaser.Math.Between(6000, 14000),
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
          delay: Phaser.Math.Between(0, 3000),
        });
      }
    }
  }

  // === RUNE CIRCLE ===
  _createRuneCircle(w, h) {
    const cx = w / 2, cy = h + 30;

    // Outer circle
    const outer = this.add.graphics().setDepth(1);
    outer.lineStyle(1.5, COLORS.gold, 0.2);
    outer.strokeCircle(cx, cy, 320);
    outer.lineStyle(1, COLORS.gold, 0.12);
    outer.strokeCircle(cx, cy, 310);
    outer.strokeCircle(cx, cy, 290);
    // Dot ring
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      outer.fillStyle(COLORS.gold, 0.25);
      outer.fillCircle(cx + Math.cos(a) * 320, cy + Math.sin(a) * 320, 2);
    }
    this.tweens.add({ targets: outer, angle: 360, duration: 90000, repeat: -1 });

    // Middle ring with rune nodes
    const mid = this.add.graphics().setDepth(1);
    mid.lineStyle(1, COLORS.cyan, 0.15);
    mid.strokeCircle(cx, cy, 260);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const nx = cx + Math.cos(a) * 260;
      const ny = cy + Math.sin(a) * 260;
      mid.fillStyle(COLORS.cyan, 0.3);
      mid.fillCircle(nx, ny, 4);
      // Small connecting lines to center
      mid.lineStyle(1, COLORS.cyan, 0.07);
      mid.beginPath(); mid.moveTo(cx, cy); mid.lineTo(nx, ny); mid.strokePath();
      mid.lineStyle(1, COLORS.cyan, 0.15);
    }
    this.tweens.add({ targets: mid, angle: -360, duration: 70000, repeat: -1 });

    // Inner circle
    const inner = this.add.graphics().setDepth(1);
    inner.lineStyle(1, COLORS.gold, 0.18);
    inner.strokeCircle(cx, cy, 200);
    // Hexagonal pattern inside
    for (let i = 0; i < 6; i++) {
      const a1 = (i / 6) * Math.PI * 2;
      const a2 = ((i + 1) / 6) * Math.PI * 2;
      inner.lineStyle(1, COLORS.gold, 0.1);
      inner.beginPath();
      inner.moveTo(cx + Math.cos(a1) * 200, cy + Math.sin(a1) * 200);
      inner.lineTo(cx + Math.cos(a2) * 200, cy + Math.sin(a2) * 200);
      inner.strokePath();
      // Inner hex
      inner.beginPath();
      inner.moveTo(cx + Math.cos(a1) * 140, cy + Math.sin(a1) * 140);
      inner.lineTo(cx + Math.cos(a2) * 140, cy + Math.sin(a2) * 140);
      inner.strokePath();
      // Radial connectors
      inner.beginPath();
      inner.moveTo(cx + Math.cos(a1) * 200, cy + Math.sin(a1) * 200);
      inner.lineTo(cx + Math.cos(a1) * 140, cy + Math.sin(a1) * 140);
      inner.strokePath();
    }
    this.tweens.add({ targets: inner, angle: 360, duration: 50000, repeat: -1 });

    // Pulsing center glow
    const centerGlow = this.add.circle(cx, cy, 30, COLORS.gold, 0.08).setDepth(1);
    this.tweens.add({
      targets: centerGlow, scale: 3, alpha: 0.02,
      duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  // === CORNER ORNAMENTS ===
  _drawCornerOrnaments(w, h) {
    const g = this.add.graphics().setDepth(12);
    const ornamentSize = 40;
    const margin = 10;

    const corners = [
      { x: margin, y: margin, sx: 1, sy: 1 },
      { x: w - margin, y: margin, sx: -1, sy: 1 },
      { x: margin, y: h - margin, sx: 1, sy: -1 },
      { x: w - margin, y: h - margin, sx: -1, sy: -1 },
    ];

    corners.forEach(({ x, y, sx, sy }) => {
      // L-shaped bracket
      g.lineStyle(2, COLORS.gold, 0.5);
      g.beginPath();
      g.moveTo(x, y + sy * ornamentSize);
      g.lineTo(x, y);
      g.lineTo(x + sx * ornamentSize, y);
      g.strokePath();

      // Inner L
      g.lineStyle(1, COLORS.gold, 0.25);
      g.beginPath();
      g.moveTo(x + sx * 4, y + sy * (ornamentSize - 8));
      g.lineTo(x + sx * 4, y + sy * 4);
      g.lineTo(x + sx * (ornamentSize - 8), y + sy * 4);
      g.strokePath();

      // Corner dot
      g.fillStyle(COLORS.gold, 0.6);
      g.fillCircle(x + sx * 3, y + sy * 3, 2);

      // Tiny diamond accent
      const dx = x + sx * 18, dy = y + sy * 18;
      g.fillStyle(COLORS.gold, 0.35);
      g.beginPath();
      g.moveTo(dx, dy - 3); g.lineTo(dx + 3, dy);
      g.lineTo(dx, dy + 3); g.lineTo(dx - 3, dy);
      g.closePath(); g.fillPath();
    });
  }

  // === PARTICLES ===
  _createParticles(w, h) {
    // Embers (rising, warm gold/orange)
    for (let i = 0; i < 20; i++) {
      const px = Phaser.Math.Between(0, w);
      const py = Phaser.Math.Between(h * 0.4, h);
      const size = Phaser.Math.Between(1, 3);
      const color = Phaser.Utils.Array.GetRandom([COLORS.gold, 0xFF8844, 0xFFAA44]);
      const ember = this.add.circle(px, py, size, color,
        Phaser.Math.FloatBetween(0.15, 0.5)).setDepth(5);

      this.tweens.add({
        targets: ember,
        y: py - Phaser.Math.Between(60, 160),
        x: px + Phaser.Math.Between(-30, 30),
        alpha: 0,
        scale: Phaser.Math.FloatBetween(0.3, 0.8),
        duration: Phaser.Math.Between(3000, 7000),
        delay: Phaser.Math.Between(0, 4000),
        repeat: -1,
        onRepeat: () => {
          ember.x = Phaser.Math.Between(0, w);
          ember.y = Phaser.Math.Between(h * 0.5, h);
          ember.alpha = Phaser.Math.FloatBetween(0.15, 0.5);
          ember.setScale(1);
        },
      });
    }

    // Sparkles (quick twinkling)
    for (let i = 0; i < 12; i++) {
      const sx = Phaser.Math.Between(40, w - 40);
      const sy = Phaser.Math.Between(40, h - 40);
      const sparkle = this.add.circle(sx, sy, 1, COLORS.cyan,
        Phaser.Math.FloatBetween(0, 0.2)).setDepth(5);

      this.tweens.add({
        targets: sparkle,
        alpha: { from: 0, to: Phaser.Math.FloatBetween(0.4, 0.9) },
        scale: { from: 0.5, to: Phaser.Math.FloatBetween(1.2, 2) },
        duration: Phaser.Math.Between(400, 1000),
        yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 5000),
        repeatDelay: Phaser.Math.Between(2000, 6000),
        ease: 'Sine.easeInOut',
      });
    }

    // Dust motes (slow floating)
    for (let i = 0; i < 10; i++) {
      const dx = Phaser.Math.Between(0, w);
      const dy = Phaser.Math.Between(0, h);
      const dust = this.add.circle(dx, dy, Phaser.Math.Between(1, 2),
        0xE8D5B5, Phaser.Math.FloatBetween(0.05, 0.15)).setDepth(3);

      this.tweens.add({
        targets: dust,
        x: dx + Phaser.Math.Between(-60, 60),
        y: dy + Phaser.Math.Between(-40, 40),
        alpha: { from: dust.alpha, to: dust.alpha * 0.3 },
        duration: Phaser.Math.Between(5000, 10000),
        yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 3000),
      });
    }
  }

  // === ORNATE BUTTON ===
  _createOrnateButton(x, y, text, bw, bh, isPrimary, callback) {
    const c = this.add.container(x, y).setDepth(15);

    // Button background with inner glow
    const bg = this.add.graphics();

    // Outer glow (when primary)
    if (isPrimary) {
      bg.fillStyle(COLORS.gold, 0.08);
      bg.fillRoundedRect(-bw / 2 - 6, -bh / 2 - 6, bw + 12, bh + 12, 12);
    }

    // Main bg
    bg.fillStyle(isPrimary ? 0x2D1B4E : 0x151530, isPrimary ? 0.9 : 0.7);
    bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 8);

    // Inner subtle gradient feel
    bg.fillStyle(isPrimary ? 0x3D2B5E : 0x1A1A3E, 0.4);
    bg.fillRoundedRect(-bw / 2 + 2, -bh / 2 + 2, bw - 4, bh / 2 - 2, 6);

    // Border
    bg.lineStyle(isPrimary ? 2 : 1.5, COLORS.gold, isPrimary ? 0.9 : 0.5);
    bg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 8);

    // Inner border line (double-border effect)
    bg.lineStyle(1, COLORS.gold, isPrimary ? 0.2 : 0.1);
    bg.strokeRoundedRect(-bw / 2 + 3, -bh / 2 + 3, bw - 6, bh - 6, 5);

    // Corner accents for primary
    if (isPrimary) {
      const hx = bw / 2, hy = bh / 2;
      bg.fillStyle(COLORS.gold, 0.7);
      // Small diamonds at corners
      [[-hx, -hy], [hx, -hy], [-hx, hy], [hx, hy]].forEach(([cx, cy]) => {
        bg.beginPath();
        bg.moveTo(cx, cy - 3); bg.lineTo(cx + 3, cy);
        bg.lineTo(cx, cy + 3); bg.lineTo(cx - 3, cy);
        bg.closePath(); bg.fillPath();
      });
    }

    // Text
    const t = this.add.text(0, 0, text, {
      fontFamily: 'Cinzel, serif',
      fontSize: isPrimary ? '20px' : '15px',
      color: '#D4AF37',
      stroke: '#0A0A1E',
      strokeThickness: isPrimary ? 2 : 1,
    }).setOrigin(0.5);

    c.add([bg, t]);

    // Interactivity
    const hit = new Phaser.Geom.Rectangle(-bw / 2, -bh / 2, bw, bh);
    c.setInteractive(hit, Phaser.Geom.Rectangle.Contains);

    // Hover glow graphics (redrawn on hover)
    const hoverGlow = this.add.graphics().setAlpha(0);
    hoverGlow.fillStyle(COLORS.gold, 0.12);
    hoverGlow.fillRoundedRect(-bw / 2 - 4, -bh / 2 - 4, bw + 8, bh + 8, 10);
    c.add(hoverGlow);
    c.sendToBack(hoverGlow);

    c.on('pointerover', () => {
      this.tweens.add({ targets: hoverGlow, alpha: 1, duration: 200 });
      this.tweens.add({ targets: t, scale: 1.05, duration: 150 });
    });
    c.on('pointerout', () => {
      this.tweens.add({ targets: hoverGlow, alpha: 0, duration: 200 });
      this.tweens.add({ targets: t, scale: 1, duration: 150 });
    });

    c.on('pointerdown', () => {
      telegram.hapticFeedback('light');
      this.tweens.add({ targets: c, scale: 0.93, duration: 60 });
    });
    c.on('pointerup', () => {
      telegram.hapticFeedback('impact');
      this.tweens.add({ targets: c, scale: 1, duration: 120, ease: 'Back.easeOut', onComplete: callback });
    });

    // Entrance animation
    c.setScale(0);
    this.tweens.add({
      targets: c, scale: 1, duration: 400, ease: 'Back.easeOut',
      delay: isPrimary ? 200 : 450,
    });

    return c;
  }
}
