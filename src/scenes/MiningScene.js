// MiningScene — Mining minigame
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { ITEMS } from '../data/items.js';
import { hapticFeedback } from '../utils/telegram.js';

export default class MiningScene extends Phaser.Scene {
  constructor() {
    super('MiningScene');
  }

  init(data) {
    this.save = data.save;
  }

  create() {
    const w = GAME_W, h = GAME_H;

    // Background — cave
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1420);
    bg.fillRect(0, 0, w, h);

    // Cave walls
    bg.fillStyle(0x2a2030);
    for (let i = 0; i < 15; i++) {
      bg.fillCircle(
        Phaser.Math.Between(0, w),
        Phaser.Math.Between(0, h),
        Phaser.Math.Between(30, 80)
      );
    }

    // Glowing crystals in background
    for (let i = 0; i < 8; i++) {
      const cx = Phaser.Math.Between(20, w - 20);
      const cy = Phaser.Math.Between(20, h - 20);
      bg.fillStyle(0xaaddff, Phaser.Math.FloatBetween(0.1, 0.3));
      bg.fillCircle(cx, cy, Phaser.Math.Between(3, 8));
    }

    // Title
    this.add.text(w/2, 30, '⛏️ Crystal Mine', {
      fontSize: '22px', fontFamily: 'Georgia, serif', color: '#f0c040',
    }).setOrigin(0.5);

    this.add.text(w/2, 55, 'Tap rocks to break them! Find ores & gems!', {
      fontSize: '13px', fontFamily: 'Arial', color: '#aabbcc',
    }).setOrigin(0.5);

    // Create rocks to mine
    this.rocks = [];
    this.oresCollected = [];
    this.hitsRemaining = 15;

    this.hitsText = this.add.text(w/2, 80, `Energy: ${this.hitsRemaining}`, {
      fontSize: '14px', fontFamily: 'Arial', color: '#ffcc44',
    }).setOrigin(0.5);

    this.createRocks();

    // Exit button
    const exitBtn = this.add.text(60, 30, '← Back', {
      fontSize: '14px', fontFamily: 'Arial', color: '#ff8888',
      backgroundColor: '#2d1b4ecc',
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setInteractive();
    exitBtn.on('pointerdown', () => this.exitMining());

    // Results area
    this.resultText = this.add.text(w/2, h - 60, '', {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#88ffaa',
    }).setOrigin(0.5);
  }

  createRocks() {
    const w = GAME_W, h = GAME_H;
    const positions = [
      { x: w * 0.2, y: h * 0.35 },
      { x: w * 0.5, y: h * 0.3 },
      { x: w * 0.8, y: h * 0.35 },
      { x: w * 0.15, y: h * 0.55 },
      { x: w * 0.4, y: h * 0.5 },
      { x: w * 0.65, y: h * 0.55 },
      { x: w * 0.85, y: h * 0.5 },
      { x: w * 0.3, y: h * 0.72 },
      { x: w * 0.55, y: h * 0.7 },
      { x: w * 0.75, y: h * 0.72 },
    ];

    positions.forEach((pos, i) => {
      const hp = Phaser.Math.Between(2, 4);
      const sprite = this.add.image(pos.x, pos.y, 'mine_rock')
        .setScale(1.5 + Math.random() * 0.5)
        .setInteractive();

      // HP text
      const hpText = this.add.text(pos.x, pos.y + 30, `${hp}`, {
        fontSize: '12px', fontFamily: 'Arial', color: '#ffffff',
        backgroundColor: '#00000066',
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5);

      const rock = {
        sprite,
        hpText,
        hp,
        maxHp: hp,
        contents: this.generateRockContents(),
      };

      sprite.on('pointerdown', () => this.hitRock(rock));
      this.rocks.push(rock);
    });
  }

  generateRockContents() {
    const loot = [
      { id: 'stone', weight: 50 },
      { id: 'iron', weight: 30 },
      { id: 'crystal', weight: 10 },
      { id: 'amethyst', weight: 7 },
      { id: 'ruby', weight: 3 },
    ];

    const totalWeight = loot.reduce((s, l) => s + l.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const l of loot) {
      roll -= l.weight;
      if (roll <= 0) return l.id;
    }
    return 'stone';
  }

  hitRock(rock) {
    if (this.hitsRemaining <= 0 || rock.hp <= 0) return;

    hapticFeedback('medium');
    this.hitsRemaining--;
    this.hitsText.setText(`Energy: ${this.hitsRemaining}`);

    rock.hp--;
    rock.hpText.setText(`${rock.hp}`);

    // Shake rock
    this.tweens.add({
      targets: rock.sprite,
      x: rock.sprite.x + Phaser.Math.Between(-5, 5),
      duration: 50,
      yoyo: true,
      repeat: 2,
    });

    // Sparks
    for (let i = 0; i < 3; i++) {
      const spark = this.add.image(
        rock.sprite.x + Phaser.Math.Between(-15, 15),
        rock.sprite.y + Phaser.Math.Between(-15, 15),
        'particle_sparkle'
      ).setAlpha(0.8);
      this.tweens.add({
        targets: spark,
        y: spark.y - 20,
        alpha: 0,
        duration: 400,
        onComplete: () => spark.destroy(),
      });
    }

    if (rock.hp <= 0) {
      // Rock destroyed — collect loot
      hapticFeedback('success');
      this.oresCollected.push(rock.contents);

      const itemData = ITEMS[rock.contents];
      const oreText = this.add.text(rock.sprite.x, rock.sprite.y - 20,
        `+1 ${itemData?.name || rock.contents}!`, {
        fontSize: '13px', color: '#ffdd44', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5);

      this.tweens.add({
        targets: oreText,
        y: oreText.y - 40,
        alpha: 0,
        duration: 1500,
        onComplete: () => oreText.destroy(),
      });

      // Break animation
      rock.sprite.setTint(0x666666);
      this.tweens.add({
        targets: [rock.sprite, rock.hpText],
        alpha: 0,
        scale: 0.3,
        duration: 500,
        onComplete: () => {
          rock.sprite.destroy();
          rock.hpText.destroy();
        },
      });

      this.updateResultText();

      // Respawn after delay
      this.time.delayedCall(3000, () => {
        if (this.hitsRemaining > 0) {
          const newRock = {
            sprite: this.add.image(
              Phaser.Math.Between(80, GAME_W - 80),
              Phaser.Math.Between(120, GAME_H - 100),
              'mine_rock'
            ).setScale(1.5 + Math.random() * 0.5).setInteractive(),
            hp: Phaser.Math.Between(2, 4),
            maxHp: 3,
            contents: this.generateRockContents(),
          };
          newRock.hpText = this.add.text(newRock.sprite.x, newRock.sprite.y + 30, `${newRock.hp}`, {
            fontSize: '12px', fontFamily: 'Arial', color: '#ffffff',
            backgroundColor: '#00000066', padding: { x: 4, y: 2 },
          }).setOrigin(0.5);
          newRock.sprite.setAlpha(0);
          this.tweens.add({ targets: newRock.sprite, alpha: 1, duration: 500 });
          newRock.sprite.on('pointerdown', () => this.hitRock(newRock));
          this.rocks.push(newRock);
        }
      });
    }

    if (this.hitsRemaining <= 0) {
      this.time.delayedCall(1000, () => this.showResults());
    }
  }

  updateResultText() {
    const counts = {};
    for (const ore of this.oresCollected) {
      counts[ore] = (counts[ore] || 0) + 1;
    }
    const str = Object.entries(counts)
      .map(([id, c]) => `${ITEMS[id]?.name || id}: ${c}`)
      .join(' | ');
    this.resultText.setText(`Found: ${str}`);
  }

  showResults() {
    const w = GAME_W, h = GAME_H;

    const panel = this.add.graphics();
    panel.fillStyle(0x2d1b4e, 0.95);
    panel.fillRoundedRect(w/2 - 160, h/2 - 110, 320, 220, 16);
    panel.lineStyle(2, 0x8b6daa);
    panel.strokeRoundedRect(w/2 - 160, h/2 - 110, 320, 220, 16);

    this.add.text(w/2, h/2 - 85, '⛏️ Mining Results', {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: '#f0c040',
    }).setOrigin(0.5);

    if (this.oresCollected.length === 0) {
      this.add.text(w/2, h/2, 'Nothing found this time... 😔', {
        fontSize: '14px', color: '#aabbcc',
      }).setOrigin(0.5);
    } else {
      const counts = {};
      for (const ore of this.oresCollected) {
        counts[ore] = (counts[ore] || 0) + 1;
      }
      let yOff = h/2 - 40;
      for (const [oreId, count] of Object.entries(counts)) {
        const oreData = ITEMS[oreId];
        this.add.text(w/2, yOff, `💎 ${oreData?.name || oreId} x${count}`, {
          fontSize: '13px', color: '#88ffaa',
        }).setOrigin(0.5);
        yOff += 22;
      }
    }

    const xpGain = this.oresCollected.length * 4;
    this.add.text(w/2, h/2 + 55, `+${xpGain} XP`, {
      fontSize: '14px', color: '#aaddff',
    }).setOrigin(0.5);

    const doneBtn = this.add.text(w/2, h/2 + 85, '  Done  ', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#ffffff',
      backgroundColor: '#44aa66',
      padding: { x: 20, y: 8 },
    }).setOrigin(0.5).setInteractive();
    doneBtn.on('pointerdown', () => this.exitMining());
  }

  exitMining() {
    hapticFeedback('light');
    const worldScene = this.scene.get('WorldScene');

    // Add ores to inventory
    for (const oreId of this.oresCollected) {
      worldScene.save.inventory[oreId] = (worldScene.save.inventory[oreId] || 0) + 1;
      worldScene.save.stats.rocksSmashed++;
    }
    // Update quest progress for each ore mined
    for (let i = 0; i < this.oresCollected.length; i++) {
      worldScene.updateQuestProgress('mine', 'any');
    }

    worldScene.save.xp += this.oresCollected.length * 4;
    worldScene.updateHUD();
    worldScene.doSave();

    this.scene.stop();
    this.scene.resume('WorldScene');
  }
}
