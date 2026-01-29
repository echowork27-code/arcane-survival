// FishingScene — Fishing minigame
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { ITEMS } from '../data/items.js';
import { hapticFeedback } from '../utils/telegram.js';

export default class FishingScene extends Phaser.Scene {
  constructor() {
    super('FishingScene');
  }

  init(data) {
    this.save = data.save;
  }

  create() {
    const w = GAME_W, h = GAME_H;

    // Background — lake scene
    const bg = this.add.graphics();
    bg.fillStyle(0x1a3a5a);
    bg.fillRect(0, 0, w, h);

    // Sky gradient
    bg.fillStyle(0x2a4a6a);
    bg.fillRect(0, 0, w, h * 0.4);

    // Water
    bg.fillStyle(COLORS.water);
    bg.fillRect(0, h * 0.4, w, h * 0.6);

    // Water shimmer
    for (let i = 0; i < 20; i++) {
      bg.fillStyle(COLORS.waterLight, 0.2);
      bg.fillRect(
        Phaser.Math.Between(0, w),
        Phaser.Math.Between(h * 0.4, h),
        Phaser.Math.Between(20, 60),
        2
      );
    }

    // Stars
    for (let i = 0; i < 20; i++) {
      bg.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.2, 0.7));
      bg.fillCircle(Phaser.Math.Between(0, w), Phaser.Math.Between(0, h * 0.35), 1);
    }

    // Moon reflection
    bg.fillStyle(0xffe8cc, 0.3);
    bg.fillCircle(w * 0.7, h * 0.55, 15);

    // Title
    this.add.text(w/2, 30, '🎣 Fishing', {
      fontSize: '22px', fontFamily: 'Georgia, serif', color: '#f0c040',
    }).setOrigin(0.5);

    // Instructions
    this.instructText = this.add.text(w/2, 70, 'Tap when the marker is in the green zone!', {
      fontSize: '13px', fontFamily: 'Arial', color: '#aaddff',
    }).setOrigin(0.5);

    // Fishing bar
    this.barX = w / 2;
    this.barY = h * 0.45;
    this.barW = 300;
    this.barH = 30;

    // Bar background
    const barBg = this.add.graphics();
    barBg.fillStyle(0x1a1a3e, 0.8);
    barBg.fillRoundedRect(this.barX - this.barW/2, this.barY - this.barH/2, this.barW, this.barH, 8);
    barBg.lineStyle(2, 0x4488aa);
    barBg.strokeRoundedRect(this.barX - this.barW/2, this.barY - this.barH/2, this.barW, this.barH, 8);

    // Green zone (target)
    this.zoneWidth = Phaser.Math.Between(40, 80);
    this.zonePos = Phaser.Math.Between(20, this.barW - this.zoneWidth - 20);

    this.zoneGraphics = this.add.graphics();
    this.zoneGraphics.fillStyle(0x44cc66, 0.5);
    this.zoneGraphics.fillRoundedRect(
      this.barX - this.barW/2 + this.zonePos,
      this.barY - this.barH/2 + 2,
      this.zoneWidth,
      this.barH - 4,
      4
    );

    // Moving marker
    this.markerX = 0;
    this.markerSpeed = Phaser.Math.Between(180, 280);
    this.markerDir = 1;

    this.marker = this.add.graphics();
    this.updateMarker();

    // Fish preview (swimming)
    this.fishSprite = this.add.image(w * 0.3, h * 0.7, 'fish_sprite')
      .setScale(2).setAlpha(0.6);
    this.tweens.add({
      targets: this.fishSprite,
      x: w * 0.7,
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: this.fishSprite,
      y: h * 0.7 + 15,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Attempts
    this.attempts = 3;
    this.caught = [];

    this.attemptsText = this.add.text(w/2, h * 0.85, `Casts: ${this.attempts}`, {
      fontSize: '16px', fontFamily: 'Arial', color: '#ffffff',
    }).setOrigin(0.5);

    // Catch button
    const catchBtn = this.add.graphics();
    catchBtn.fillStyle(0x44aa66);
    catchBtn.fillRoundedRect(w/2 - 70, h * 0.55 - 22, 140, 44, 22);
    catchBtn.lineStyle(2, 0x66cc88);
    catchBtn.strokeRoundedRect(w/2 - 70, h * 0.55 - 22, 140, 44, 22);

    this.add.text(w/2, h * 0.55, '🎣 Cast!', {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: '#ffffff',
    }).setOrigin(0.5);

    const catchZone = this.add.zone(w/2, h * 0.55, 140, 44).setInteractive();
    catchZone.on('pointerdown', () => this.tryCatch());

    // Exit button
    const exitBtn = this.add.text(60, 30, '← Back', {
      fontSize: '14px', fontFamily: 'Arial', color: '#ff8888',
      backgroundColor: '#2d1b4ecc',
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setInteractive();
    exitBtn.on('pointerdown', () => this.exitFishing());

    // Result text
    this.resultText = this.add.text(w/2, h * 0.35, '', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#44ff44',
    }).setOrigin(0.5).setAlpha(0);

    this.gameOver = false;
  }

  update(time, delta) {
    if (this.gameOver) return;

    // Move marker
    this.markerX += this.markerSpeed * (delta / 1000) * this.markerDir;
    if (this.markerX >= this.barW - 6) {
      this.markerX = this.barW - 6;
      this.markerDir = -1;
    }
    if (this.markerX <= 0) {
      this.markerX = 0;
      this.markerDir = 1;
    }

    this.updateMarker();
  }

  updateMarker() {
    this.marker.clear();
    this.marker.fillStyle(0xff4444);
    this.marker.fillRoundedRect(
      this.barX - this.barW/2 + this.markerX,
      this.barY - this.barH/2 - 2,
      6,
      this.barH + 4,
      2
    );
  }

  tryCatch() {
    if (this.gameOver || this.attempts <= 0) return;

    hapticFeedback('medium');
    this.attempts--;
    this.attemptsText.setText(`Casts: ${this.attempts}`);

    // Check if marker is in zone
    const inZone = this.markerX >= this.zonePos &&
                   this.markerX <= this.zonePos + this.zoneWidth;

    if (inZone) {
      // Caught a fish!
      const fishTypes = [
        { id: 'fish_common', weight: 50 },
        { id: 'fish_bass', weight: 30 },
        { id: 'fish_golden', weight: 15 },
        { id: 'fish_rainbow', weight: 4 },
        { id: 'fish_shimmer', weight: 1 },
      ];

      const totalWeight = fishTypes.reduce((s, f) => s + f.weight, 0);
      let roll = Math.random() * totalWeight;
      let fishId = 'fish_common';
      for (const ft of fishTypes) {
        roll -= ft.weight;
        if (roll <= 0) { fishId = ft.id; break; }
      }

      this.caught.push(fishId);
      const fishData = ITEMS[fishId];

      hapticFeedback('success');
      this.resultText.setText(`🐟 Caught: ${fishData?.name || fishId}!`);
      this.resultText.setAlpha(1);
      this.tweens.add({
        targets: this.resultText,
        alpha: 0,
        duration: 2000,
        delay: 1000,
      });

      // Flash green
      this.cameras.main.flash(300, 50, 200, 50);

      // New zone position
      this.zoneWidth = Phaser.Math.Between(30, 70);
      this.zonePos = Phaser.Math.Between(20, this.barW - this.zoneWidth - 20);
      this.markerSpeed += 20; // Gets harder

      this.zoneGraphics.clear();
      this.zoneGraphics.fillStyle(0x44cc66, 0.5);
      this.zoneGraphics.fillRoundedRect(
        this.barX - this.barW/2 + this.zonePos,
        this.barY - this.barH/2 + 2,
        this.zoneWidth,
        this.barH - 4,
        4
      );
    } else {
      // Miss
      hapticFeedback('error');
      this.resultText.setText('Miss! 💨');
      this.resultText.setStyle({ color: '#ff6666' });
      this.resultText.setAlpha(1);
      this.tweens.add({
        targets: this.resultText,
        alpha: 0,
        duration: 1500,
      });
      this.cameras.main.shake(200, 0.01);
    }

    if (this.attempts <= 0) {
      this.gameOver = true;
      this.time.delayedCall(1500, () => this.showResults());
    }
  }

  showResults() {
    const w = GAME_W, h = GAME_H;

    const panel = this.add.graphics();
    panel.fillStyle(0x2d1b4e, 0.95);
    panel.fillRoundedRect(w/2 - 150, h/2 - 100, 300, 200, 16);
    panel.lineStyle(2, 0x8b6daa);
    panel.strokeRoundedRect(w/2 - 150, h/2 - 100, 300, 200, 16);

    this.add.text(w/2, h/2 - 75, '🎣 Fishing Results', {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: '#f0c040',
    }).setOrigin(0.5);

    if (this.caught.length === 0) {
      this.add.text(w/2, h/2 - 20, 'No fish today... 😔', {
        fontSize: '14px', color: '#aabbcc',
      }).setOrigin(0.5);
    } else {
      let yOff = h/2 - 30;
      const fishCounts = {};
      for (const f of this.caught) {
        fishCounts[f] = (fishCounts[f] || 0) + 1;
      }
      for (const [fishId, count] of Object.entries(fishCounts)) {
        const fishData = ITEMS[fishId];
        this.add.text(w/2, yOff, `🐟 ${fishData?.name || fishId} x${count}`, {
          fontSize: '13px', color: '#88ffaa',
        }).setOrigin(0.5);
        yOff += 22;
      }
    }

    // XP
    const xpGain = this.caught.length * 3;
    this.add.text(w/2, h/2 + 50, `+${xpGain} XP`, {
      fontSize: '14px', color: '#aaddff',
    }).setOrigin(0.5);

    // Done button
    const doneBtn = this.add.text(w/2, h/2 + 80, '  Done  ', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#ffffff',
      backgroundColor: '#44aa66',
      padding: { x: 20, y: 8 },
    }).setOrigin(0.5).setInteractive();
    doneBtn.on('pointerdown', () => this.exitFishing());
  }

  exitFishing() {
    hapticFeedback('light');
    // Pass results back
    const worldScene = this.scene.get('WorldScene');
    const returnData = {
      fish: null,
      coins: 0,
      xp: this.caught.length * 3,
      ores: [],
    };
    // Add all caught fish
    for (const fishId of this.caught) {
      worldScene.save.inventory[fishId] = (worldScene.save.inventory[fishId] || 0) + 1;
      worldScene.save.stats.fishCaught++;
      worldScene.updateQuestProgress('fish', fishId);
    }
    worldScene.save.xp += returnData.xp;
    worldScene.updateHUD();
    worldScene.doSave();

    this.scene.stop();
    this.scene.resume('WorldScene');
  }
}
