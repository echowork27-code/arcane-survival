import Phaser from 'phaser';
import { COLORS, GAME_CONFIG } from '../config.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    const { width, height } = this.cameras.main;

    // Deep dark background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0A0A1E);

    // Vignette overlay
    const vig = this.add.graphics();
    for (let i = 0; i < 6; i++) {
      vig.fillStyle(0x000000, 0.12 - i * 0.015);
      vig.fillRect(0, 0, width, 30 - i * 4);
      vig.fillRect(0, height - (30 - i * 4), width, 30 - i * 4);
      vig.fillRect(0, 0, 30 - i * 4, height);
      vig.fillRect(width - (30 - i * 4), 0, 30 - i * 4, height);
    }
    vig.setDepth(20);

    // Animated rune circle in center
    this.runeCircle = this.add.graphics();
    this._drawRuneCircle(this.runeCircle, width / 2, height / 2, 120);
    this.runeCircle.setAlpha(0.3);
    this.tweens.add({ targets: this.runeCircle, angle: 360, duration: 20000, repeat: -1 });
    this.tweens.add({ targets: this.runeCircle, alpha: 0.5, duration: 2000, yoyo: true, repeat: -1 });

    // Inner rune circle (counter-rotating)
    this.innerRune = this.add.graphics();
    this._drawRuneCircle(this.innerRune, width / 2, height / 2, 70, 6, COLORS.cyan);
    this.innerRune.setAlpha(0.2);
    this.tweens.add({ targets: this.innerRune, angle: -360, duration: 15000, repeat: -1 });
    this.tweens.add({ targets: this.innerRune, alpha: 0.35, duration: 1500, yoyo: true, repeat: -1, delay: 500 });

    // Title text
    this.add.text(width / 2, height / 2 - 70, 'Channeling Magic...', {
      fontFamily: 'Cinzel, serif', fontSize: '26px', color: '#D4AF37',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10);

    // Subtitle
    const sub = this.add.text(width / 2, height / 2 - 42, 'Preparing the arcane wards', {
      fontFamily: 'Crimson Text, serif', fontSize: '13px', fontStyle: 'italic', color: '#7A6E8A',
    }).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: sub, alpha: 0.4, duration: 1500, yoyo: true, repeat: -1 });

    // Loading bar
    const fw = 260, fh = 12;
    const barBg = this.add.graphics();
    barBg.fillStyle(0x1A0A2E, 0.8);
    barBg.fillRoundedRect(width / 2 - fw / 2 - 4, height / 2 + 20 - fh / 2 - 4, fw + 8, fh + 8, 6);
    barBg.lineStyle(1, COLORS.gold, 0.5);
    barBg.strokeRoundedRect(width / 2 - fw / 2 - 4, height / 2 + 20 - fh / 2 - 4, fw + 8, fh + 8, 6);
    barBg.setDepth(10);

    const barInner = this.add.graphics();
    barInner.fillStyle(0x0D0D2B, 0.9);
    barInner.fillRoundedRect(width / 2 - fw / 2, height / 2 + 20 - fh / 2, fw, fh, 4);
    barInner.setDepth(10);

    this.loadBar = this.add.graphics().setDepth(11);
    this.loadBarX = width / 2 - fw / 2 + 2;
    this.loadBarY = height / 2 + 20 - fh / 2 + 2;
    this.loadBarW = fw - 4;
    this.loadBarH = fh - 4;

    // Progress listener
    this.load.on('progress', (v) => {
      this.loadBar.clear();
      // Gold fill with gradient effect
      this.loadBar.fillStyle(COLORS.gold, 0.9);
      this.loadBar.fillRoundedRect(this.loadBarX, this.loadBarY, this.loadBarW * v, this.loadBarH, 3);
      // Bright highlight line on top
      this.loadBar.fillStyle(0xFFE066, 0.5);
      this.loadBar.fillRect(this.loadBarX, this.loadBarY, this.loadBarW * v, 2);
    });

    // Floating rune sigils around the screen
    const runeSymbols = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ'];
    for (let i = 0; i < 16; i++) {
      const rx = Phaser.Math.Between(40, width - 40);
      const ry = Phaser.Math.Between(40, height - 40);
      const rune = this.add.text(rx, ry, Phaser.Utils.Array.GetRandom(runeSymbols), {
        fontFamily: 'serif', fontSize: Phaser.Math.Between(14, 24) + 'px',
        color: i % 3 === 0 ? '#4ECDC4' : '#D4AF37',
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: rune,
        alpha: { from: 0, to: Phaser.Math.FloatBetween(0.1, 0.35) },
        y: ry - Phaser.Math.Between(20, 50),
        duration: Phaser.Math.Between(2000, 4000),
        delay: Phaser.Math.Between(0, 3000),
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut',
      });
    }

    // Ambient particles (sparkles)
    for (let i = 0; i < 20; i++) {
      const px = Phaser.Math.Between(0, width);
      const py = Phaser.Math.Between(0, height);
      const p = this.add.circle(px, py, Phaser.Math.Between(1, 2),
        i % 2 === 0 ? COLORS.gold : COLORS.cyan, 0);
      this.tweens.add({
        targets: p,
        alpha: { from: 0, to: Phaser.Math.FloatBetween(0.2, 0.6) },
        y: py - Phaser.Math.Between(30, 80),
        duration: Phaser.Math.Between(2000, 5000),
        delay: Phaser.Math.Between(0, 2000),
        repeat: -1,
        onRepeat: () => {
          p.x = Phaser.Math.Between(0, width);
          p.y = Phaser.Math.Between(height * 0.3, height);
        },
      });
    }

    this.generateAssets();
  }

  _drawRuneCircle(g, cx, cy, radius, segments = 12, color = COLORS.gold) {
    g.lineStyle(1, color, 0.6);
    g.strokeCircle(cx, cy, radius);
    g.lineStyle(1, color, 0.3);
    g.strokeCircle(cx, cy, radius * 0.8);

    // Dots at intervals
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      const x = cx + Math.cos(a) * radius;
      const y = cy + Math.sin(a) * radius;
      g.fillStyle(color, 0.7);
      g.fillCircle(x, y, 3);

      // Connect every other dot to center with faint lines
      if (i % 2 === 0) {
        g.lineStyle(1, color, 0.15);
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(x, y);
        g.strokePath();
      }
    }

    // Small inner decorations
    for (let i = 0; i < segments / 2; i++) {
      const a = (i / (segments / 2)) * Math.PI * 2 + Math.PI / segments;
      const x = cx + Math.cos(a) * radius * 0.55;
      const y = cy + Math.sin(a) * radius * 0.55;
      g.fillStyle(color, 0.4);
      g.fillCircle(x, y, 2);
    }
  }

  generateAssets() {
    let g;
    // Player
    const ps = GAME_CONFIG.player.size * 2;
    g = this.make.graphics({ add: false });
    g.fillStyle(COLORS.deepPurple); g.fillCircle(ps / 2, ps / 2, ps / 2 - 2);
    g.fillStyle(COLORS.cyan, 0.5); g.fillCircle(ps / 2, ps / 2, ps / 3);
    g.lineStyle(2, COLORS.gold); g.strokeCircle(ps / 2, ps / 2, ps / 2 - 2);
    g.fillStyle(COLORS.gold); g.fillRect(ps / 2 - 2, 2, 4, ps / 3);
    g.generateTexture('player', ps, ps); g.destroy();

    // Enemies
    const enemyDefs = [
      { name: 'wisp', size: 24, color: GAME_CONFIG.enemies.wisp.color },
      { name: 'knight', size: 36, color: GAME_CONFIG.enemies.knight.color },
      { name: 'wraith', size: 28, color: GAME_CONFIG.enemies.wraith.color },
      { name: 'boss', size: 60, color: GAME_CONFIG.enemies.boss.color },
    ];

    enemyDefs.forEach(({ name, size, color }) => {
      g = this.make.graphics({ add: false });
      if (name === 'wisp') {
        g.fillStyle(color, 0.3); g.fillCircle(size / 2, size / 2, size / 2);
        g.fillStyle(color, 0.7); g.fillCircle(size / 2, size / 2, size / 3);
        g.fillStyle(0xFFFFFF, 0.9); g.fillCircle(size / 2, size / 2, size / 6);
      } else if (name === 'knight') {
        g.fillStyle(color); g.fillRect(size * 0.2, size * 0.1, size * 0.6, size * 0.8);
        g.fillStyle(0x222244); g.fillRect(size * 0.3, size * 0.2, size * 0.4, size * 0.3);
        g.fillStyle(0xFF4444); g.fillCircle(size * 0.35, size * 0.35, 3); g.fillCircle(size * 0.65, size * 0.35, 3);
      } else if (name === 'wraith') {
        g.fillStyle(color, 0.5);
        g.beginPath(); g.moveTo(size / 2, 2); g.lineTo(size - 2, size * 0.4); g.lineTo(size - 4, size - 2); g.lineTo(size / 2, size * 0.7); g.lineTo(4, size - 2); g.lineTo(2, size * 0.4); g.closePath(); g.fillPath();
        g.fillStyle(0xFFFFFF, 0.8); g.fillCircle(size / 2, size * 0.4, 4);
      } else if (name === 'boss') {
        g.fillStyle(color); g.fillCircle(size / 2, size / 2, size / 2 - 4);
        g.fillStyle(0x000000, 0.7); g.fillCircle(size / 2, size / 2, size / 3);
        g.fillStyle(COLORS.gold);
        g.fillTriangle(size * 0.3, size * 0.15, size * 0.4, 0, size * 0.5, size * 0.15);
        g.fillTriangle(size * 0.5, size * 0.15, size * 0.6, 0, size * 0.7, size * 0.15);
        g.fillStyle(0xFF0000); g.fillCircle(size * 0.35, size * 0.45, 5); g.fillCircle(size * 0.65, size * 0.45, 5);
        g.lineStyle(3, COLORS.gold, 0.5); g.strokeCircle(size / 2, size / 2, size / 2 - 2);
      }
      g.generateTexture(name, size, size); g.destroy();
    });

    // Spells
    [
      { name: 'fire', color: GAME_CONFIG.spells.fire.color, size: 16 },
      { name: 'ice', color: GAME_CONFIG.spells.ice.color, size: 14 },
      { name: 'lightning', color: GAME_CONFIG.spells.lightning.color, size: 18 },
    ].forEach(({ name, color, size }) => {
      g = this.make.graphics({ add: false });
      g.fillStyle(color, 0.3); g.fillCircle(size / 2, size / 2, size / 2);
      g.fillStyle(color, 0.9); g.fillCircle(size / 2, size / 2, size / 3);
      g.fillStyle(0xFFFFFF); g.fillCircle(size / 2, size / 2, size / 6);
      g.generateTexture('spell_' + name, size, size); g.destroy();
    });

    // Joystick base
    g = this.make.graphics({ add: false });
    g.fillStyle(COLORS.deepPurple, 0.4); g.fillCircle(60, 60, 60);
    g.lineStyle(2, COLORS.gold, 0.6); g.strokeCircle(60, 60, 60);
    g.lineStyle(1, COLORS.cyan, 0.3); g.strokeCircle(60, 60, 40);
    g.generateTexture('joystick_base', 120, 120); g.destroy();

    // Joystick thumb
    g = this.make.graphics({ add: false });
    g.fillStyle(COLORS.gold, 0.7); g.fillCircle(25, 25, 25);
    g.fillStyle(COLORS.cyan, 0.5); g.fillCircle(25, 25, 16);
    g.generateTexture('joystick_thumb', 50, 50); g.destroy();

    // Attack button
    g = this.make.graphics({ add: false });
    g.fillStyle(COLORS.deepPurple, 0.6); g.fillCircle(40, 40, 40);
    g.lineStyle(3, COLORS.gold, 0.8); g.strokeCircle(40, 40, 38);
    g.lineStyle(2, COLORS.cyan, 0.6); g.strokeCircle(40, 40, 26);
    g.fillStyle(COLORS.cyan, 0.8);
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 12 : 6;
      const angle = (i * Math.PI / 5) - Math.PI / 2;
      const px = 40 + Math.cos(angle) * r;
      const py = 40 + Math.sin(angle) * r;
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath();
    g.fillPath();
    g.generateTexture('attack_button', 80, 80); g.destroy();

    // Spell pickup
    g = this.make.graphics({ add: false });
    g.fillStyle(COLORS.gold, 0.5); g.fillCircle(12, 12, 12);
    g.lineStyle(2, COLORS.gold); g.strokeCircle(12, 12, 10);
    g.generateTexture('spell_pickup', 24, 24); g.destroy();
  }

  create() {
    this.time.delayedCall(500, () => {
      const seen = localStorage.getItem('arcane_intro_seen');
      this.scene.start(seen ? 'MenuScene' : 'IntroScene');
    });
  }
}
