import Phaser from 'phaser';
import { COLORS } from '../config.js';

export default class DialogBox {
  constructor(scene) {
    this.scene = scene;
    this.isVisible = false;
    this.container = null;
    this.hideTimer = null;
  }

  show(text, isImportant = false) {
    this.hide();
    const { width, height } = this.scene.cameras.main;

    this.container = this.scene.add.container(width / 2, height / 2 - 100);
    this.container.setDepth(500).setScrollFactor(0);

    const tempText = this.scene.add.text(0, 0, text, {
      fontFamily: 'Crimson Text, serif', fontSize: isImportant ? '18px' : '14px',
      wordWrap: { width: 500 },
    });
    const boxW = Math.min(tempText.width + 60, 550);
    const boxH = tempText.height + 30;
    tempText.destroy();

    const bg = this.scene.add.graphics();
    bg.fillStyle(COLORS.darkBlue, 0.9);
    bg.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
    bg.lineStyle(2, isImportant ? COLORS.gold : COLORS.cyan, isImportant ? 1 : 0.6);
    bg.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
    if (isImportant) {
      bg.lineStyle(1, COLORS.gold, 0.3);
      bg.strokeRoundedRect(-boxW / 2 + 5, -boxH / 2 + 5, boxW - 10, boxH - 10, 6);
    }

    const dialogText = this.scene.add.text(0, 0, text, {
      fontFamily: 'Crimson Text, serif', fontSize: isImportant ? '18px' : '14px',
      color: isImportant ? '#D4AF37' : '#CCCCDD', align: 'center', wordWrap: { width: 480 },
    }).setOrigin(0.5);

    this.container.add([bg, dialogText]);
    this.container.setScale(0.8).setAlpha(0);
    this.scene.tweens.add({ targets: this.container, scale: 1, alpha: 1, duration: 200, ease: 'Power2' });
    this.isVisible = true;

    const duration = Math.max(2000, text.length * 50);
    this.hideTimer = this.scene.time.delayedCall(duration, () => this.hide());
  }

  showQuick(text) {
    this.hide();
    const { width } = this.scene.cameras.main;

    this.container = this.scene.add.container(width / 2, 70);
    this.container.setDepth(500).setScrollFactor(0);

    const bg = this.scene.add.graphics();
    const boxW = Math.min(text.length * 10 + 40, 300);
    bg.fillStyle(COLORS.deepPurple, 0.8);
    bg.fillRoundedRect(-boxW / 2, -15, boxW, 30, 15);
    bg.lineStyle(1, COLORS.gold, 0.5);
    bg.strokeRoundedRect(-boxW / 2, -15, boxW, 30, 15);

    const quickText = this.scene.add.text(0, 0, text, {
      fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#D4AF37',
    }).setOrigin(0.5);

    this.container.add([bg, quickText]);
    this.container.setY(50).setAlpha(0);
    this.scene.tweens.add({ targets: this.container, y: 70, alpha: 1, duration: 150 });
    this.isVisible = true;
    this.hideTimer = this.scene.time.delayedCall(1500, () => this.hide());
  }

  hide() {
    if (this.hideTimer) { this.hideTimer.remove(); this.hideTimer = null; }
    if (this.container) {
      this.scene.tweens.add({
        targets: this.container, alpha: 0, y: this.container.y - 20, duration: 150,
        onComplete: () => { if (this.container) { this.container.destroy(); this.container = null; } },
      });
    }
    this.isVisible = false;
  }

  destroy() { this.hide(); }
}
