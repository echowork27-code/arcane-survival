// Virtual Joystick for mobile movement
import { COLORS } from '../config.js';

export default class Joystick {
  constructor(scene) {
    this.scene = scene;
    this.baseX = 80;
    this.baseY = 0; // set dynamically
    this.radius = 40;
    this.forceX = 0;
    this.forceY = 0;
    this.isActive = false;
    this.activePointerId = null;

    // Will be positioned in updatePosition()
    this.base = scene.add.circle(0, 0, this.radius, COLORS.uiBg, 0.45)
      .setScrollFactor(0).setDepth(1500).setStrokeStyle(2, COLORS.uiAccent, 0.5);

    this.thumb = scene.add.circle(0, 0, 18, COLORS.uiAccent, 0.6)
      .setScrollFactor(0).setDepth(1501);

    // Inner dot
    this.dot = scene.add.circle(0, 0, 5, COLORS.uiAccent, 0.9)
      .setScrollFactor(0).setDepth(1502);

    // Touch zone (left third of screen)
    this.zone = scene.add.zone(0, 0, 0, 0)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(1499).setInteractive();

    this.zone.on('pointerdown', (pointer) => this.onDown(pointer));
    scene.input.on('pointermove', (pointer) => this.onMove(pointer));
    scene.input.on('pointerup', (pointer) => this.onUp(pointer));

    this.updatePosition();

    // Handle resize
    scene.scale.on('resize', () => this.updatePosition());
  }

  updatePosition() {
    const h = this.scene.scale.height || 720;
    const w = this.scene.scale.width || 400;
    this.baseY = h - 130;

    this.base.setPosition(this.baseX, this.baseY);
    this.thumb.setPosition(this.baseX, this.baseY);
    this.dot.setPosition(this.baseX, this.baseY);

    // Touch zone covers left half, bottom portion
    this.zone.setPosition(0, h * 0.4);
    this.zone.setSize(w * 0.45, h * 0.5);
  }

  onDown(pointer) {
    if (this.isActive) return;
    this.isActive = true;
    this.activePointerId = pointer.id;

    // Move base to where finger touched
    this.base.setPosition(pointer.x, pointer.y);
    this.thumb.setPosition(pointer.x, pointer.y);
    this.dot.setPosition(pointer.x, pointer.y);
    this.baseX = pointer.x;
    this.baseY = pointer.y;

    this.base.setAlpha(0.6);
    this.thumb.setAlpha(0.8);
  }

  onMove(pointer) {
    if (!this.isActive || pointer.id !== this.activePointerId) return;

    const dx = pointer.x - this.baseX;
    const dy = pointer.y - this.baseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const clamped = Math.min(dist, this.radius);

    this.thumb.x = this.baseX + Math.cos(angle) * clamped;
    this.thumb.y = this.baseY + Math.sin(angle) * clamped;
    this.dot.x = this.thumb.x;
    this.dot.y = this.thumb.y;

    if (dist < 8) {
      this.forceX = 0;
      this.forceY = 0;
    } else {
      const force = clamped / this.radius;
      this.forceX = Math.cos(angle) * force;
      this.forceY = Math.sin(angle) * force;
    }
  }

  onUp(pointer) {
    if (!this.isActive || pointer.id !== this.activePointerId) return;
    this.isActive = false;
    this.activePointerId = null;
    this.forceX = 0;
    this.forceY = 0;

    // Reset position
    const h = this.scene.scale.height || 720;
    this.baseX = 80;
    this.baseY = h - 130;

    this.base.setPosition(this.baseX, this.baseY);
    this.thumb.setPosition(this.baseX, this.baseY);
    this.dot.setPosition(this.baseX, this.baseY);

    this.base.setAlpha(0.45);
    this.thumb.setAlpha(0.6);
  }

  destroy() {
    this.base.destroy();
    this.thumb.destroy();
    this.dot.destroy();
    this.zone.destroy();
  }
}
