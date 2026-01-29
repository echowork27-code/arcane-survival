import Phaser from 'phaser';
import { COLORS } from '../config.js';

export default class AttackButton {
  constructor(scene, x, y, callback) {
    this.scene = scene;
    this.x = x; this.y = y;
    this.callback = callback;
    this.enabled = true;
    this.isPressed = false;

    this.button = scene.add.image(x, y, 'attack_button');
    this.button.setDepth(1000).setScrollFactor(0).setInteractive();

    this.glow = scene.add.circle(x, y, 45, COLORS.cyan, 0.2);
    this.glow.setDepth(999).setScrollFactor(0);

    scene.tweens.add({
      targets: this.glow,
      scale: { from: 1, to: 1.2 }, alpha: { from: 0.2, to: 0.1 },
      duration: 1000, yoyo: true, repeat: -1,
    });

    this.button.on('pointerdown', () => this.onPress());
    this.button.on('pointerup', () => this.onRelease());
    this.button.on('pointerout', () => this.onRelease());

    this.hitZone = scene.add.circle(x, y, 60, 0x000000, 0);
    this.hitZone.setDepth(998).setScrollFactor(0).setInteractive();
    this.hitZone.on('pointerdown', () => this.onPress());
    this.hitZone.on('pointerup', () => this.onRelease());
    this.hitZone.on('pointerout', () => this.onRelease());
  }

  onPress() {
    if (!this.enabled || this.isPressed) return;
    this.isPressed = true;
    this.scene.tweens.add({ targets: this.button, scale: 0.85, duration: 50 });
    this.glow.setFillStyle(COLORS.gold, 0.4);
    if (this.callback) this.callback();
  }

  onRelease() {
    if (!this.isPressed) return;
    this.isPressed = false;
    this.scene.tweens.add({ targets: this.button, scale: 1, duration: 100 });
    this.glow.setFillStyle(COLORS.cyan, 0.2);
  }

  disable() {
    this.enabled = false; this.button.setAlpha(0.3); this.glow.setAlpha(0.1);
  }

  enable() {
    this.enabled = true; this.button.setAlpha(1); this.glow.setAlpha(1);
  }

  destroy() { this.button.destroy(); this.glow.destroy(); this.hitZone.destroy(); }
}
