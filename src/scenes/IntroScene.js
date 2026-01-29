// IntroScene — Cinematic story intro on first play
import { COLORS } from '../config.js';
import { STORY } from '../data/lore.js';
import { telegram } from '../utils/telegram.js';

export default class IntroScene extends Phaser.Scene {
  constructor() { super({ key: 'IntroScene' }); }

  create() {
    const { width, height } = this.cameras.main;
    this.idx = 0;
    this.lines = STORY.intro;
    this.busy = false;

    // === DEEP DARK BACKGROUND ===
    this.add.rectangle(width / 2, height / 2, width, height, 0x0A0A1E);

    // Subtle background texture — layered circles for depth
    const bgTexture = this.add.graphics();
    bgTexture.fillStyle(0x1A0A2E, 0.3);
    bgTexture.fillCircle(width / 2, height / 2, 300);
    bgTexture.fillStyle(0x2D1B4E, 0.1);
    bgTexture.fillCircle(width * 0.3, height * 0.6, 200);
    bgTexture.fillCircle(width * 0.7, height * 0.4, 180);

    // === ATMOSPHERIC PARTICLES ===
    this._addParticles(width, height);

    // === FOG ===
    this._addFog(width, height);

    // === CINEMATIC LETTERBOX BARS ===
    const barHeight = 45;
    this.topBar = this.add.rectangle(width / 2, barHeight / 2, width, barHeight, 0x000000).setDepth(20);
    this.bottomBar = this.add.rectangle(width / 2, height - barHeight / 2, width, barHeight, 0x000000).setDepth(20);
    // Subtle gold line on the inner edge
    const barLines = this.add.graphics().setDepth(21);
    barLines.lineStyle(1, COLORS.gold, 0.2);
    barLines.beginPath(); barLines.moveTo(0, barHeight); barLines.lineTo(width, barHeight); barLines.strokePath();
    barLines.beginPath(); barLines.moveTo(0, height - barHeight); barLines.lineTo(width, height - barHeight); barLines.strokePath();

    // === PARCHMENT TEXT BACKGROUND ===
    const parchW = width * 0.75;
    const parchH = 120;
    const parchX = width / 2 - parchW / 2;
    const parchY = height / 2 - parchH / 2 - 10;
    const parch = this.add.graphics().setDepth(5);
    // Semi-transparent dark parchment
    parch.fillStyle(0x1A0A2E, 0.5);
    parch.fillRoundedRect(parchX, parchY, parchW, parchH, 6);
    // Border
    parch.lineStyle(1, COLORS.gold, 0.2);
    parch.strokeRoundedRect(parchX, parchY, parchW, parchH, 6);
    // Inner border
    parch.lineStyle(1, COLORS.gold, 0.08);
    parch.strokeRoundedRect(parchX + 4, parchY + 4, parchW - 8, parchH - 8, 4);
    // Corner dots
    parch.fillStyle(COLORS.gold, 0.3);
    parch.fillCircle(parchX + 8, parchY + 8, 2);
    parch.fillCircle(parchX + parchW - 8, parchY + 8, 2);
    parch.fillCircle(parchX + 8, parchY + parchH - 8, 2);
    parch.fillCircle(parchX + parchW - 8, parchY + parchH - 8, 2);

    // === GOLD DECORATIVE LINES ===
    const lineG = this.add.graphics().setDepth(6);
    // Top decorative line with diamond center
    const lineTopY = barHeight + 15;
    lineG.lineStyle(1, COLORS.gold, 0.35);
    lineG.beginPath();
    lineG.moveTo(width * 0.2, lineTopY);
    lineG.lineTo(width * 0.8, lineTopY);
    lineG.strokePath();
    // Center diamond
    lineG.fillStyle(COLORS.gold, 0.4);
    lineG.beginPath();
    lineG.moveTo(width / 2, lineTopY - 4);
    lineG.lineTo(width / 2 + 4, lineTopY);
    lineG.lineTo(width / 2, lineTopY + 4);
    lineG.lineTo(width / 2 - 4, lineTopY);
    lineG.closePath(); lineG.fillPath();

    // Bottom decorative
    const lineBottomY = height - barHeight - 15;
    lineG.lineStyle(1, COLORS.gold, 0.35);
    lineG.beginPath();
    lineG.moveTo(width * 0.2, lineBottomY);
    lineG.lineTo(width * 0.8, lineBottomY);
    lineG.strokePath();
    lineG.fillStyle(COLORS.gold, 0.4);
    lineG.beginPath();
    lineG.moveTo(width / 2, lineBottomY - 4);
    lineG.lineTo(width / 2 + 4, lineBottomY);
    lineG.lineTo(width / 2, lineBottomY + 4);
    lineG.lineTo(width / 2 - 4, lineBottomY);
    lineG.closePath(); lineG.fillPath();

    // === STORY TEXT ===
    this.storyText = this.add.text(width / 2, height / 2 - 10, '', {
      fontFamily: 'Crimson Text, Georgia, serif',
      fontSize: '20px',
      color: COLORS.textLight,
      align: 'center',
      wordWrap: { width: width * 0.65 },
      lineSpacing: 10,
      stroke: '#0A0A1E',
      strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0).setDepth(10);

    // === TAP HINT ===
    this.hint = this.add.text(width / 2, height - barHeight - 30, '— tap to continue —', {
      fontFamily: 'Crimson Text, serif',
      fontSize: '12px',
      color: '#7A6E8A',
      fontStyle: 'italic',
      stroke: '#0A0A1E',
      strokeThickness: 1,
    }).setOrigin(0.5).setAlpha(0).setDepth(22);

    this.tweens.add({ targets: this.hint, alpha: 0.55, yoyo: true, repeat: -1, duration: 1400, ease: 'Sine.easeInOut' });

    // === SKIP BUTTON ===
    const skip = this.add.text(width - 20, barHeight + 8, 'SKIP ›', {
      fontFamily: 'Cinzel, serif', fontSize: '12px', color: '#7A6E8A',
      stroke: '#0A0A1E', strokeThickness: 1,
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(22);
    skip.on('pointerover', () => skip.setColor('#D4AF37'));
    skip.on('pointerout', () => skip.setColor('#7A6E8A'));
    skip.on('pointerdown', () => this._finish());

    // Show first line after intro delay
    this.cameras.main.fadeIn(800, 0, 0, 0);
    this.time.delayedCall(900, () => this._showLine());

    // Tap to advance
    this.input.on('pointerdown', (p) => {
      if (p.x > width - 80 && p.y < barHeight + 30) return;
      this._advance();
    });
  }

  _showLine() {
    if (this.idx >= this.lines.length) { this._finish(); return; }
    this.busy = true;
    const text = this.lines[this.idx];
    this.storyText.setText(text);
    this.storyText.setAlpha(0);
    this.storyText.y = this.cameras.main.height / 2;

    this.tweens.add({
      targets: this.storyText,
      alpha: 1,
      y: this.cameras.main.height / 2 - 10,
      duration: 1000,
      ease: 'Sine.easeOut',
      onComplete: () => { this.busy = false; },
    });
    this.hint.setAlpha(0);
    this.tweens.add({ targets: this.hint, alpha: 0.55, delay: 1200, duration: 800 });
  }

  _advance() {
    if (this.busy) return;
    this.busy = true;
    telegram.hapticFeedback('light');
    this.tweens.add({
      targets: this.storyText,
      alpha: 0,
      y: this.cameras.main.height / 2 - 40,
      duration: 500,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.idx++;
        this.storyText.y = this.cameras.main.height / 2 + 15;
        this._showLine();
      },
    });
  }

  _finish() {
    window.gameState.hasSeenIntro = true;
    localStorage.setItem('msa_introSeen', '1');
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.time.delayedCall(850, () => this.scene.start('MenuScene'));
  }

  _addFog(w, h) {
    for (let i = 0; i < 12; i++) {
      const fog = this.add.ellipse(
        Phaser.Math.Between(-30, w + 30),
        Phaser.Math.Between(h * 0.2, h * 0.8),
        Phaser.Math.Between(100, 250),
        Phaser.Math.Between(30, 80),
        i % 3 === 0 ? COLORS.cyan : COLORS.deepPurple,
        i % 3 === 0 ? 0.015 : 0.05
      ).setDepth(2);
      this.tweens.add({
        targets: fog,
        x: fog.x + Phaser.Math.Between(-70, 70),
        alpha: { from: fog.alpha, to: fog.alpha * 0.4 },
        scaleX: Phaser.Math.FloatBetween(0.8, 1.3),
        duration: Phaser.Math.Between(5000, 12000),
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 3000),
      });
    }
  }

  _addParticles(w, h) {
    // Floating embers
    for (let i = 0; i < 15; i++) {
      const px = Phaser.Math.Between(0, w);
      const py = Phaser.Math.Between(h * 0.3, h);
      const p = this.add.circle(px, py, Phaser.Math.Between(1, 2),
        i % 3 === 0 ? COLORS.cyan : COLORS.gold,
        Phaser.Math.FloatBetween(0.1, 0.35)).setDepth(4);

      this.tweens.add({
        targets: p,
        y: py - Phaser.Math.Between(50, 130),
        x: px + Phaser.Math.Between(-20, 20),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 7000),
        delay: Phaser.Math.Between(0, 4000),
        repeat: -1,
        onRepeat: () => {
          p.x = Phaser.Math.Between(0, w);
          p.y = Phaser.Math.Between(h * 0.5, h);
          p.alpha = Phaser.Math.FloatBetween(0.1, 0.35);
        },
      });
    }

    // Twinkling sparkles
    for (let i = 0; i < 8; i++) {
      const s = this.add.circle(
        Phaser.Math.Between(50, w - 50),
        Phaser.Math.Between(80, h - 80),
        1, COLORS.gold, 0).setDepth(4);
      this.tweens.add({
        targets: s,
        alpha: { from: 0, to: Phaser.Math.FloatBetween(0.3, 0.7) },
        scale: { from: 0.5, to: 1.5 },
        duration: Phaser.Math.Between(500, 1200),
        yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 5000),
        repeatDelay: Phaser.Math.Between(2000, 5000),
      });
    }
  }
}
