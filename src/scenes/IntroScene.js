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

    // Dark background with vignette feel
    this.add.rectangle(width/2, height/2, width, height, COLORS.darkBlue);
    this._addFog(width, height);

    // Gold decorative line top
    const lineG = this.add.graphics();
    lineG.lineStyle(1, COLORS.gold, 0.4);
    lineG.lineBetween(width * 0.15, 60, width * 0.85, 60);
    lineG.lineBetween(width * 0.15, height - 60, width * 0.85, height - 60);

    // Story text (center)
    this.storyText = this.add.text(width/2, height/2 - 20, '', {
      fontFamily: 'Crimson Text, Georgia, serif',
      fontSize: '20px',
      color: COLORS.textLight,
      align: 'center',
      wordWrap: { width: width * 0.7 },
      lineSpacing: 8,
    }).setOrigin(0.5).setAlpha(0);

    // "Tap to continue" hint
    this.hint = this.add.text(width/2, height - 85, '— tap to continue —', {
      fontFamily: 'Crimson Text, serif',
      fontSize: '13px',
      color: '#7A6E8A',
      fontStyle: 'italic',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: this.hint, alpha: 0.6, yoyo: true, repeat: -1, duration: 1200 });

    // Skip button top-right
    const skip = this.add.text(width - 25, 30, 'SKIP ›', {
      fontFamily: 'Cinzel, serif', fontSize: '13px', color: '#7A6E8A',
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    skip.on('pointerdown', () => this._finish());

    // Show first line
    this.time.delayedCall(400, () => this._showLine());

    // Tap to advance
    this.input.on('pointerdown', (p) => {
      // ignore skip-button area
      if (p.x > width - 70 && p.y < 60) return;
      this._advance();
    });
  }

  _showLine() {
    if (this.idx >= this.lines.length) { this._finish(); return; }
    this.busy = true;
    const text = this.lines[this.idx];
    this.storyText.setText(text);
    this.storyText.setAlpha(0);

    this.tweens.add({
      targets: this.storyText, alpha: 1, y: this.cameras.main.height/2 - 20,
      duration: 800, ease: 'Sine.easeOut',
      onComplete: () => { this.busy = false; },
    });
    this.hint.setAlpha(0);
    this.tweens.add({ targets: this.hint, alpha: 0.6, delay: 900, duration: 600 });
  }

  _advance() {
    if (this.busy) return;
    // Fade out current
    this.busy = true;
    this.tweens.add({
      targets: this.storyText, alpha: 0, y: this.cameras.main.height/2 - 40,
      duration: 400,
      onComplete: () => {
        this.idx++;
        this.storyText.y = this.cameras.main.height/2;
        this._showLine();
      },
    });
  }

  _finish() {
    window.gameState.hasSeenIntro = true;
    localStorage.setItem('msa_introSeen', '1');
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.time.delayedCall(650, () => this.scene.start('MenuScene'));
  }

  _addFog(w, h) {
    for (let i = 0; i < 18; i++) {
      const c = this.add.circle(
        Phaser.Math.Between(0, w), Phaser.Math.Between(0, h),
        Phaser.Math.Between(30, 80), COLORS.accent, 0.03,
      );
      this.tweens.add({
        targets: c, x: c.x + Phaser.Math.Between(-60, 60),
        alpha: 0, duration: Phaser.Math.Between(4000, 8000),
        yoyo: true, repeat: -1,
      });
    }
  }
}
