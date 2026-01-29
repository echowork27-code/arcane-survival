import Phaser from 'phaser';
import { GAME_CONFIG, COLORS } from '../config.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.health = GAME_CONFIG.player.health;
    this.speed = GAME_CONFIG.player.speed;
    this.attackCooldown = GAME_CONFIG.player.attackCooldown;
    this.lastAttackTime = 0;
    this.isInvincible = false;
    this.facingX = 0;
    this.facingY = -1;

    this.setCircle(GAME_CONFIG.player.size / 2);
    this.setCollideWorldBounds(true);
    this.setDepth(10);

    this.glow = scene.add.circle(x, y, GAME_CONFIG.player.size + 5, COLORS.cyan, 0.2);
    this.glow.setDepth(9);
    scene.tweens.add({
      targets: this.glow,
      scale: { from: 1, to: 1.2 }, alpha: { from: 0.2, to: 0.1 },
      duration: 1000, yoyo: true, repeat: -1,
    });

    this.lastTrailTime = 0;
  }

  move(forceX, forceY) {
    this.setVelocity(forceX * this.speed, forceY * this.speed);
    if (Math.abs(forceX) > 0.1 || Math.abs(forceY) > 0.1) {
      this.facingX = forceX;
      this.facingY = forceY;
    }
    this.glow.x = this.x;
    this.glow.y = this.y;

    const now = this.scene.time.now;
    if (now - this.lastTrailTime > 100 && this.body.velocity.length() > 50) {
      this.lastTrailTime = now;
      const p = this.scene.add.circle(this.x, this.y, 4, COLORS.cyan, 0.4).setDepth(8);
      this.scene.tweens.add({ targets: p, alpha: 0, scale: 0.3, duration: 300, onComplete: () => p.destroy() });
    }
  }

  canAttack() {
    return this.scene.time.now - this.lastAttackTime >= this.attackCooldown;
  }

  attack() {
    this.lastAttackTime = this.scene.time.now;
    this.scene.tweens.add({ targets: this, alpha: { from: 1, to: 0.7 }, duration: 50, yoyo: true });
  }

  takeDamage(amount) {
    if (this.isInvincible) return;
    this.health = Math.max(0, this.health - amount);
    this.isInvincible = true;

    this.scene.tweens.add({
      targets: this, alpha: { from: 1, to: 0.3 }, duration: 100, yoyo: true, repeat: 5,
      onComplete: () => { this.alpha = 1; },
    });

    this.setTint(0xFF4444);
    this.scene.time.delayedCall(200, () => this.clearTint());
    this.scene.time.delayedCall(GAME_CONFIG.player.invincibilityTime, () => { this.isInvincible = false; });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.glow) { this.glow.x = this.x; this.glow.y = this.y; }
  }

  destroy() {
    if (this.glow) this.glow.destroy();
    super.destroy();
  }
}
