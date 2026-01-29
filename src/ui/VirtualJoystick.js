import Phaser from 'phaser';

export default class VirtualJoystick {
  constructor(scene, x, y) {
    this.scene = scene;
    this.baseX = x;
    this.baseY = y;
    this.isActive = false;
    this.forceX = 0;
    this.forceY = 0;
    this.radius = 50;
    this.enabled = true;

    this.base = scene.add.image(x, y, 'joystick_base');
    this.base.setAlpha(0.5).setDepth(1000).setScrollFactor(0);

    this.thumb = scene.add.image(x, y, 'joystick_thumb');
    this.thumb.setDepth(1001).setScrollFactor(0);

    this.zone = scene.add.zone(0, 0, scene.cameras.main.width / 2, scene.cameras.main.height);
    this.zone.setOrigin(0, 0).setInteractive().setDepth(999).setScrollFactor(0);

    this.zone.on('pointerdown', (pointer) => this.startDrag(pointer));
    scene.input.on('pointermove', (pointer) => this.onDrag(pointer));
    scene.input.on('pointerup', (pointer) => this.endDrag(pointer));
  }

  startDrag(pointer) {
    if (!this.enabled || pointer.x > this.scene.cameras.main.width / 2) return;
    this.isActive = true;
    this.activePointerId = pointer.id;
    this.base.x = pointer.x; this.base.y = pointer.y;
    this.thumb.x = pointer.x; this.thumb.y = pointer.y;
    this.base.setAlpha(0.7); this.thumb.setAlpha(1);
  }

  onDrag(pointer) {
    if (!this.isActive || !this.enabled || pointer.id !== this.activePointerId) return;
    const dx = pointer.x - this.base.x;
    const dy = pointer.y - this.base.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const clampedDistance = Math.min(distance, this.radius);
    this.thumb.x = this.base.x + Math.cos(angle) * clampedDistance;
    this.thumb.y = this.base.y + Math.sin(angle) * clampedDistance;
    this.forceX = distance < 10 ? 0 : (clampedDistance / this.radius) * Math.cos(angle);
    this.forceY = distance < 10 ? 0 : (clampedDistance / this.radius) * Math.sin(angle);
  }

  endDrag(pointer) {
    if (!this.isActive || pointer.id !== this.activePointerId) return;
    this.isActive = false; this.activePointerId = null;
    this.thumb.x = this.baseX; this.thumb.y = this.baseY;
    this.base.x = this.baseX; this.base.y = this.baseY;
    this.base.setAlpha(0.5); this.thumb.setAlpha(0.8);
    this.forceX = 0; this.forceY = 0;
  }

  disable() {
    this.enabled = false; this.base.setAlpha(0.2); this.thumb.setAlpha(0.2);
    this.forceX = 0; this.forceY = 0;
  }

  enable() {
    this.enabled = true; this.base.setAlpha(0.5); this.thumb.setAlpha(0.8);
  }

  destroy() { this.base.destroy(); this.thumb.destroy(); this.zone.destroy(); }
}
