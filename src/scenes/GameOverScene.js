import Phaser from 'phaser';
import { COLORS, STORAGE_KEYS } from '../config.js';
import { UI_TEXT } from '../data/dialogue.js';
import { telegram } from '../utils/telegram.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOverScene' }); }

  init(data) {
    this.finalScore = data.score || 0;
    this.finalWave = data.wave || 1;
    this.finalKills = data.kills || 0;
    this.survivalTime = data.survivalTime || 0;
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(500, 26, 27, 62);
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.darkBlue);

    for (let i = 0; i < 15; i++) {
      const p = this.add.circle(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), Phaser.Math.Between(2, 5), COLORS.deepPurple, Phaser.Math.FloatBetween(0.2, 0.5));
      this.tweens.add({ targets: p, y: p.y - Phaser.Math.Between(50, 100), alpha: 0, duration: Phaser.Math.Between(3000, 5000), repeat: -1, delay: Phaser.Math.Between(0, 2000),
        onRepeat: () => { p.x = Phaser.Math.Between(0, width); p.y = height + 20; p.alpha = Phaser.Math.FloatBetween(0.2, 0.5); },
      });
    }

    const highScore = parseInt(localStorage.getItem(STORAGE_KEYS.highScore) || '0');
    const isNewHigh = this.finalScore >= highScore && this.finalScore > 0;

    const titleY = 60;
    this.add.text(width / 2, titleY, UI_TEXT.gameOver.title, {
      fontFamily: 'Cinzel, serif', fontSize: '36px', fontStyle: 'bold', color: '#D4AF37',
    }).setOrigin(0.5);

    if (isNewHigh) {
      const nh = this.add.text(width / 2, titleY + 35, UI_TEXT.gameOver.newHigh, {
        fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#4ECDC4',
      }).setOrigin(0.5);
      this.tweens.add({ targets: nh, scale: { from: 1, to: 1.1 }, alpha: { from: 1, to: 0.8 }, duration: 500, yoyo: true, repeat: -1 });
    }

    const sy = isNewHigh ? 140 : 120;
    const mins = Math.floor(this.survivalTime / 60);
    const secs = this.survivalTime % 60;
    const stats = [
      { label: UI_TEXT.gameOver.score, value: '' + this.finalScore, big: true },
      { label: UI_TEXT.gameOver.wave, value: '' + this.finalWave },
      { label: UI_TEXT.gameOver.kills, value: '' + this.finalKills },
      { label: 'Time Survived', value: mins + ':' + String(secs).padStart(2, '0') },
    ];
    stats.forEach((s, i) => {
      const y = sy + i * 45;
      this.add.text(width / 2 - 10, y, s.label + ':', {
        fontFamily: 'Cinzel, serif', fontSize: s.big ? '18px' : '14px', color: '#888899',
      }).setOrigin(1, 0.5);
      const vt = this.add.text(width / 2 + 10, y, s.value, {
        fontFamily: 'Cinzel, serif', fontSize: s.big ? '24px' : '18px', color: '#D4AF37',
      }).setOrigin(0, 0.5);
      vt.setScale(0);
      this.tweens.add({ targets: vt, scale: 1, duration: 300, ease: 'Back.easeOut', delay: 200 + i * 100 });
    });

    const g = this.add.graphics();
    g.lineStyle(1, COLORS.gold, 0.4); g.moveTo(width * 0.2, 95); g.lineTo(width * 0.8, 95); g.strokePath();
    g.fillStyle(COLORS.gold, 0.6); g.fillCircle(width / 2, 95, 4);

    const bY = height - 70;
    this.createButton(width / 2 - 80, bY, UI_TEXT.gameOver.retry, true, () => {
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameScene'));
    });
    this.createButton(width / 2 + 80, bY, UI_TEXT.gameOver.menu, false, () => {
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
    });
  }

  createButton(x, y, text, isPrimary, callback) {
    const bw = 120, bh = 40;
    const c = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(isPrimary ? COLORS.deepPurple : COLORS.darkBlue, isPrimary ? 0.8 : 0.6);
    bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 6);
    bg.lineStyle(2, COLORS.gold, isPrimary ? 1 : 0.6);
    bg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 6);
    const t = this.add.text(0, 0, text, {
      fontFamily: 'Cinzel, serif', fontSize: '16px', color: '#D4AF37',
    }).setOrigin(0.5);
    c.add([bg, t]);
    const hit = new Phaser.Geom.Rectangle(-bw / 2, -bh / 2, bw, bh);
    c.setInteractive(hit, Phaser.Geom.Rectangle.Contains);
    c.on('pointerdown', () => { telegram.hapticFeedback('light'); this.tweens.add({ targets: c, scale: 0.95, duration: 50 }); });
    c.on('pointerup', () => { telegram.hapticFeedback('impact'); this.tweens.add({ targets: c, scale: 1, duration: 100, onComplete: callback }); });
    c.setScale(0);
    this.tweens.add({ targets: c, scale: 1, duration: 300, ease: 'Back.easeOut', delay: isPrimary ? 600 : 700 });
    return c;
  }
}
