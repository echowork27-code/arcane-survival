import Phaser from 'phaser';
import { COLORS, STORAGE_KEYS } from '../config.js';
import { UI_TEXT } from '../data/dialogue.js';
import { telegram } from '../utils/telegram.js';

export default class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(500, 26, 27, 62);

    this.add.rectangle(width / 2, height / 2, width, height, COLORS.darkBlue);
    const bg = this.add.graphics();
    bg.lineStyle(1, COLORS.deepPurple, 0.3);
    bg.strokeCircle(width / 2, height + 100, 400);
    bg.strokeCircle(width / 2, height + 100, 350);

    const rune = this.add.graphics();
    rune.lineStyle(1, COLORS.gold, 0.2); rune.strokeCircle(0, 0, 200);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      rune.fillStyle(COLORS.gold, 0.3); rune.fillCircle(Math.cos(a) * 200, Math.sin(a) * 200, 5);
    }
    rune.setPosition(width / 2, height + 50);
    this.tweens.add({ targets: rune, angle: 360, duration: 60000, repeat: -1 });

    const vig = this.add.graphics();
    vig.fillStyle(0x000000, 0.4); vig.fillRect(0, 0, width, 50); vig.fillRect(0, height - 50, width, 50);

    const glow = this.add.text(width / 2, 80, UI_TEXT.menu.title, {
      fontFamily: 'Cinzel, serif', fontSize: '42px', fontStyle: 'bold', color: '#D4AF37',
    }).setOrigin(0.5).setAlpha(0.3).setScale(1.05);
    this.tweens.add({ targets: glow, alpha: 0.5, scale: 1.08, duration: 2000, yoyo: true, repeat: -1 });

    this.add.text(width / 2, 80, UI_TEXT.menu.title, {
      fontFamily: 'Cinzel, serif', fontSize: '42px', fontStyle: 'bold', color: '#D4AF37',
    }).setOrigin(0.5);

    this.add.text(width / 2, 120, UI_TEXT.menu.subtitle, {
      fontFamily: 'Crimson Text, serif', fontSize: '16px', fontStyle: 'italic', color: '#4ECDC4',
    }).setOrigin(0.5).setAlpha(0.9);

    const line = this.add.graphics();
    line.lineStyle(2, COLORS.gold, 0.6); line.moveTo(width / 2 - 100, 140); line.lineTo(width / 2 + 100, 140); line.strokePath();
    line.fillStyle(COLORS.gold, 0.8);
    line.fillCircle(width / 2 - 100, 140, 4); line.fillCircle(width / 2 + 100, 140, 4); line.fillCircle(width / 2, 140, 6);

    const btnY = height / 2 + 20;
    this.createButton(width / 2, btnY, UI_TEXT.menu.play, 180, 50, true, () => {
      this.cameras.main.fadeOut(500, 26, 27, 62);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameScene'));
    });
    this.createButton(width / 2 - 100, btnY + 70, UI_TEXT.menu.codex, 130, 40, false, () => {
      this.cameras.main.fadeOut(300, 26, 27, 62);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('CodexScene'));
    });
    this.createButton(width / 2 + 100, btnY + 70, UI_TEXT.menu.settings, 130, 40, false, () => {
      telegram.hapticFeedback('warning');
    });

    const hs = localStorage.getItem(STORAGE_KEYS.highScore) || 0;
    const mw = localStorage.getItem(STORAGE_KEYS.maxWave) || 0;
    if (hs > 0) {
      this.add.text(width / 2, height - 60, UI_TEXT.menu.highScore + ': ' + hs, {
        fontFamily: 'Cinzel, serif', fontSize: '16px', color: '#D4AF37',
      }).setOrigin(0.5).setAlpha(0.8);
      this.add.text(width / 2, height - 40, 'Wave ' + mw, {
        fontFamily: 'Crimson Text, serif', fontSize: '14px', color: '#4ECDC4',
      }).setOrigin(0.5).setAlpha(0.6);
    }

    if (telegram.userName && telegram.userName !== 'Apprentice') {
      this.add.text(width - 20, 20, 'Welcome, ' + telegram.userName, {
        fontFamily: 'Crimson Text, serif', fontSize: '14px', color: '#4ECDC4',
      }).setOrigin(1, 0).setAlpha(0.8);
    }

    for (let i = 0; i < 15; i++) {
      const p = this.add.circle(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), Phaser.Math.Between(1, 3), COLORS.gold, Phaser.Math.FloatBetween(0.2, 0.5));
      this.tweens.add({ targets: p, y: p.y - Phaser.Math.Between(30, 80), alpha: 0, duration: Phaser.Math.Between(2000, 4000), repeat: -1, delay: Phaser.Math.Between(0, 2000),
        onRepeat: () => { p.x = Phaser.Math.Between(0, width); p.y = Phaser.Math.Between(height / 2, height); p.alpha = Phaser.Math.FloatBetween(0.2, 0.5); },
      });
    }
  }

  createButton(x, y, text, bw, bh, isPrimary, callback) {
    const c = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(isPrimary ? COLORS.deepPurple : COLORS.darkBlue, isPrimary ? 0.8 : 0.6);
    bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 8);
    bg.lineStyle(2, COLORS.gold, isPrimary ? 1 : 0.6);
    bg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 8);
    const t = this.add.text(0, 0, text, {
      fontFamily: 'Cinzel, serif', fontSize: isPrimary ? '20px' : '16px', color: '#D4AF37',
    }).setOrigin(0.5);
    c.add([bg, t]);
    const hit = new Phaser.Geom.Rectangle(-bw / 2, -bh / 2, bw, bh);
    c.setInteractive(hit, Phaser.Geom.Rectangle.Contains);
    c.on('pointerdown', () => { telegram.hapticFeedback('light'); this.tweens.add({ targets: c, scale: 0.95, duration: 50 }); });
    c.on('pointerup', () => { telegram.hapticFeedback('impact'); this.tweens.add({ targets: c, scale: 1, duration: 100, onComplete: callback }); });
    c.setScale(0);
    this.tweens.add({ targets: c, scale: 1, duration: 300, ease: 'Back.easeOut', delay: isPrimary ? 200 : 400 });
    return c;
  }
}
