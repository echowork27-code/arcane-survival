import Phaser from 'phaser';
import { COLORS, GAME_CONFIG } from '../config.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    const { width, height } = this.cameras.main;
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.darkBlue);

    const fw = 300, fh = 40;
    this.add.rectangle(width / 2, height / 2, fw + 10, fh + 10, COLORS.gold, 0.3);
    const bg = this.add.rectangle(width / 2, height / 2, fw, fh, COLORS.deepPurple);
    bg.setStrokeStyle(2, COLORS.gold);
    const bar = this.add.rectangle(width / 2 - fw / 2 + 5, height / 2, 0, fh - 10, COLORS.gold);
    bar.setOrigin(0, 0.5);

    this.add.text(width / 2, height / 2 - 50, 'Channeling Magic...', {
      fontFamily: 'Cinzel, serif', fontSize: '24px', color: '#D4AF37',
    }).setOrigin(0.5);

    this.load.on('progress', (v) => { bar.width = (fw - 10) * v; });

    for (let i = 0; i < 8; i++) {
      const s = this.add.circle(width / 2 + Phaser.Math.Between(-150, 150), height / 2 + Phaser.Math.Between(-30, 30), Phaser.Math.Between(2, 4), COLORS.gold, 0.6);
      this.tweens.add({ targets: s, y: s.y - 20, alpha: 0, duration: 1500, delay: i * 200, repeat: -1, yoyo: true });
    }

    this.generateAssets();
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
    g.fillStyle(COLORS.cyan, 0.8); g.fillStar(40, 40, 5, 12, 6);
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
