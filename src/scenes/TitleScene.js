// TitleScene — Main Menu
import { COLORS, GAME_W, GAME_H } from '../config.js';
import { getUserName } from '../utils/telegram.js';
import { hapticFeedback } from '../utils/telegram.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    const w = GAME_W, h = GAME_H;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillStyle(0x1a2a1a);
    bg.fillRect(0, 0, w, h);

    // Rolling hills
    bg.fillStyle(COLORS.grass2, 0.4);
    for (let i = 0; i < 5; i++) {
      const y = h - 120 + i * 25;
      bg.fillCircle(w * 0.2 + i * 100, y, 200 + i * 30);
    }

    // Stars
    for (let i = 0; i < 40; i++) {
      const sx = Phaser.Math.Between(0, w);
      const sy = Phaser.Math.Between(0, h * 0.5);
      const sr = Phaser.Math.FloatBetween(0.5, 2);
      bg.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 0.8));
      bg.fillCircle(sx, sy, sr);
    }

    // Moon
    bg.fillStyle(0xffe8cc, 0.9);
    bg.fillCircle(w * 0.75, h * 0.2, 40);
    bg.fillStyle(0x1a2a1a);
    bg.fillCircle(w * 0.75 + 12, h * 0.2 - 8, 35);

    // Title
    this.add.text(w/2, h * 0.22, '✨', {
      fontSize: '48px',
    }).setOrigin(0.5);

    this.add.text(w/2, h * 0.35, 'Dreamlight\nValley', {
      fontSize: '42px',
      fontFamily: 'Georgia, serif',
      color: '#f0c040',
      align: 'center',
      lineSpacing: 8,
      stroke: '#2d1b4e',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(w/2, h * 0.50, 'A Cozy Fantasy Village Builder', {
      fontSize: '14px',
      fontFamily: 'Georgia, serif',
      color: '#ccbbdd',
    }).setOrigin(0.5);

    // Player name
    const name = getUserName();
    this.add.text(w/2, h * 0.57, `Welcome, ${name}!`, {
      fontSize: '16px',
      fontFamily: 'Georgia, serif',
      color: '#aaddaa',
    }).setOrigin(0.5);

    // Play button
    const btnY = h * 0.70;
    const btn = this.add.graphics();
    btn.fillStyle(0x44aa66);
    btn.fillRoundedRect(w/2 - 90, btnY - 24, 180, 48, 24);
    btn.lineStyle(2, 0x66cc88);
    btn.strokeRoundedRect(w/2 - 90, btnY - 24, 180, 48, 24);

    const btnText = this.add.text(w/2, btnY, '🌿  Start Adventure  🌿', {
      fontSize: '16px',
      fontFamily: 'Georgia, serif',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Make button interactive
    const btnZone = this.add.zone(w/2, btnY, 180, 48).setInteractive();
    btnZone.on('pointerdown', () => {
      hapticFeedback('medium');
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('WorldScene');
      });
    });
    btnZone.on('pointerover', () => {
      btn.clear();
      btn.fillStyle(0x55bb77);
      btn.fillRoundedRect(w/2 - 90, btnY - 24, 180, 48, 24);
      btn.lineStyle(2, 0x77ddaa);
      btn.strokeRoundedRect(w/2 - 90, btnY - 24, 180, 48, 24);
    });
    btnZone.on('pointerout', () => {
      btn.clear();
      btn.fillStyle(0x44aa66);
      btn.fillRoundedRect(w/2 - 90, btnY - 24, 180, 48, 24);
      btn.lineStyle(2, 0x66cc88);
      btn.strokeRoundedRect(w/2 - 90, btnY - 24, 180, 48, 24);
    });

    // Floating particles
    for (let i = 0; i < 15; i++) {
      const px = Phaser.Math.Between(50, w - 50);
      const py = Phaser.Math.Between(100, h - 100);
      const p = this.add.image(px, py, 'particle_sparkle').setAlpha(0);
      this.tweens.add({
        targets: p,
        alpha: { from: 0, to: 0.6 },
        y: py - 40,
        duration: Phaser.Math.Between(2000, 4000),
        delay: Phaser.Math.Between(0, 3000),
        repeat: -1,
        yoyo: true,
      });
    }

    // Version
    this.add.text(w/2, h - 20, 'v1.0 • Telegram Mini App', {
      fontSize: '10px',
      color: '#666688',
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(800, 0, 0, 0);
  }
}
