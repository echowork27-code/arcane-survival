import Phaser from 'phaser';
import { GAME_CONFIG, COLORS } from '../config.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, type);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.enemyType = type;
    const cfg = GAME_CONFIG.enemies[type] || GAME_CONFIG.enemies.wisp;
    this.health = cfg.health;
    this.maxHealth = cfg.health;
    this.speed = cfg.speed;
    this.damage = cfg.damage;
    this.scoreValue = cfg.score;

    this.setCircle(this.width / 2);
    this.setCollideWorldBounds(true);
    this.setBounce(0.5);
    this.setDepth(5);

    this.movementStyle = type === 'wisp' ? 'erratic' : type === 'wraith' ? 'fast' : 'direct';
    this.erraticTimer = 0;
    this.erraticDir = { x: 0, y: 0 };
    this.phaseTimer = 0;

    if (type === 'boss' || type === 'knight') {
      const bw = type === 'boss' ? 60 : 30;
      this.healthBarBg = scene.add.rectangle(0, 0, bw, 4, 0x333333).setDepth(6);
      this.healthBarFill = scene.add.rectangle(0, 0, bw, 4, 0xFF4444).setOrigin(0, 0.5).setDepth(7);
    }

    if (type === 'boss') {
      this.aura = scene.add.circle(x, y, 40, COLORS.gold, 0.1).setDepth(4);
      scene.tweens.add({ targets: this.aura, scale: { from: 1, to: 1.3 }, alpha: { from: 0.1, to: 0.05 }, duration: 1500, yoyo: true, repeat: -1 });
    }

    this.setScale(0).setAlpha(0);
    scene.tweens.add({ targets: this, scale: 1, alpha: 1, duration: 300, ease: 'Back.easeOut' });
  }

  chaseTarget(tx, ty) {
    if (!this.active) return;

    if (this.movementStyle === 'erratic') {
      this.erraticTimer += this.scene.game.loop.delta;
      if (this.erraticTimer > 500) {
        this.erraticTimer = 0;
        const base = Phaser.Math.Angle.Between(this.x, this.y, tx, ty);
        const a = base + Phaser.Math.FloatBetween(-0.8, 0.8);
        this.erraticDir.x = Math.cos(a); this.erraticDir.y = Math.sin(a);
      }
      this.setVelocity(this.erraticDir.x * this.speed, this.erraticDir.y * this.speed);
    } else if (this.movementStyle === 'fast') {
      this.phaseTimer += this.scene.game.loop.delta;
      if (this.phaseTimer > 2000) {
        this.phaseTimer = 0;
        this.setAlpha(0.4);
        const orig = this.speed;
        this.speed *= 1.5;
        this.scene.time.delayedCall(500, () => { if (this.active) { this.setAlpha(1); this.speed = orig; } });
      }
      const a = Phaser.Math.Angle.Between(this.x, this.y, tx, ty);
      this.setVelocity(Math.cos(a) * this.speed, Math.sin(a) * this.speed);
    } else {
      const a = Phaser.Math.Angle.Between(this.x, this.y, tx, ty);
      this.setVelocity(Math.cos(a) * this.speed, Math.sin(a) * this.speed);
    }

    if (this.healthBarBg) {
      const bw = this.enemyType === 'boss' ? 60 : 30;
      const oy = -this.height / 2 - 10;
      this.healthBarBg.x = this.x; this.healthBarBg.y = this.y + oy;
      this.healthBarFill.x = this.x - bw / 2; this.healthBarFill.y = this.y + oy;
      this.healthBarFill.width = bw * (this.health / this.maxHealth);
    }
    if (this.aura) { this.aura.x = this.x; this.aura.y = this.y; }
  }

  takeDamage(amount) {
    this.health -= amount;
    this.setTint(0xFFFFFF);
    this.scene.time.delayedCall(100, () => { if (this.active) this.clearTint(); });
    if (this.body) { this.body.velocity.x *= -0.5; this.body.velocity.y *= -0.5; }
    if (this.health <= 0) this.die();
  }

  die() {
    if (this.body) this.body.enable = false;
    this.scene.tweens.add({
      targets: this, scale: 0, alpha: 0, rotation: Math.PI * 2, duration: 300, ease: 'Power2',
      onComplete: () => this.destroy(),
    });
    this.healthBarBg?.destroy(); this.healthBarFill?.destroy(); this.aura?.destroy();
  }

  destroy() {
    this.healthBarBg?.destroy(); this.healthBarFill?.destroy(); this.aura?.destroy();
    super.destroy();
  }
}
