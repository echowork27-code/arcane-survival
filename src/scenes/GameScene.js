import Phaser from 'phaser';
import { COLORS, GAME_CONFIG, STORAGE_KEYS } from '../config.js';
import { getWave } from '../data/waves.js';
import { getRandomTip, DEATH_MESSAGES } from '../data/dialogue.js';
import { telegram } from '../utils/telegram.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import VirtualJoystick from '../ui/VirtualJoystick.js';
import AttackButton from '../ui/AttackButton.js';
import DialogBox from '../ui/DialogBox.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  init() {
    this.score = 0; this.wave = 1; this.kills = 0; this.combo = 0;
    this.comboTimer = null; this.isPaused = false; this.isGameOver = false;
    this.currentSpell = 'fire'; this.survivalTime = 0;
    this.spellCasts = { fire: 0, ice: 0, lightning: 0 };
    this.waveEnemiesRemaining = 0; this.waveInProgress = false;
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(300);
    this.createArena();

    this.spells = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.pickups = this.physics.add.group();

    this.player = new Player(this, width / 2, height / 2);
    this.joystick = new VirtualJoystick(this, 100, height - 80);
    this.attackButton = new AttackButton(this, width - 80, height - 80, () => this.castSpell());

    this.createUI();
    this.dialogBox = new DialogBox(this);

    this.physics.add.overlap(this.spells, this.enemies, (s, e) => this.handleSpellHit(s, e));
    this.physics.add.overlap(this.player, this.enemies, (p, e) => this.handleEnemyCollision(e));
    this.physics.add.overlap(this.player, this.pickups, (p, pk) => this.collectPickup(pk));

    this.time.delayedCall(1000, () => this.startWave());
    this.survivalTimer = this.time.addEvent({
      delay: 1000, callback: () => { if (!this.isPaused && !this.isGameOver) this.survivalTime++; }, loop: true,
    });
    this.createAmbientEffects();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.escKey.on('down', () => this.togglePause());
  }

  createArena() {
    const { width, height } = this.cameras.main;
    const pad = GAME_CONFIG.arena.padding;

    // Deep dark background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0A0A1E);

    // Subtle radial ambience
    const bgGlow = this.add.graphics();
    bgGlow.fillStyle(0x1A0A2E, 0.4);
    bgGlow.fillCircle(width / 2, height / 2, 280);
    bgGlow.fillStyle(0x2D1B4E, 0.1);
    bgGlow.fillCircle(width / 2, height / 2, 180);

    // Floor tiles
    const g = this.add.graphics();
    g.fillStyle(COLORS.deepPurple, 0.2);
    for (let x = pad; x < width - pad; x += 40) {
      for (let y = pad; y < height - pad; y += 40) {
        g.fillRect(x + 1, y + 1, 38, 38);
      }
    }
    // Faint grid lines
    g.lineStyle(1, COLORS.deepPurple, 0.12);
    for (let x = pad; x <= width - pad; x += 40) {
      g.beginPath(); g.moveTo(x, pad); g.lineTo(x, height - pad); g.strokePath();
    }
    for (let y = pad; y <= height - pad; y += 40) {
      g.beginPath(); g.moveTo(pad, y); g.lineTo(width - pad, y); g.strokePath();
    }

    // Arena border — double line with glow
    const border = this.add.graphics();
    // Outer glow
    border.lineStyle(6, COLORS.gold, 0.1);
    border.strokeRect(pad - 2, pad - 2, width - pad * 2 + 4, height - pad * 2 + 4);
    // Main border
    border.lineStyle(3, COLORS.gold, 0.7);
    border.strokeRect(pad, pad, width - pad * 2, height - pad * 2);
    // Inner border
    border.lineStyle(1, COLORS.gold, 0.25);
    border.strokeRect(pad + 4, pad + 4, width - pad * 2 - 8, height - pad * 2 - 8);

    // Center magic circles
    const centerG = this.add.graphics();
    centerG.lineStyle(1, COLORS.cyan, 0.15);
    centerG.strokeCircle(width / 2, height / 2, 150);
    centerG.lineStyle(1, COLORS.cyan, 0.1);
    centerG.strokeCircle(width / 2, height / 2, 100);
    centerG.lineStyle(1, COLORS.gold, 0.06);
    centerG.strokeCircle(width / 2, height / 2, 50);
    // Center cross
    centerG.lineStyle(1, COLORS.cyan, 0.06);
    centerG.beginPath(); centerG.moveTo(width / 2 - 20, height / 2); centerG.lineTo(width / 2 + 20, height / 2); centerG.strokePath();
    centerG.beginPath(); centerG.moveTo(width / 2, height / 2 - 20); centerG.lineTo(width / 2, height / 2 + 20); centerG.strokePath();

    // === TORCH EFFECTS IN CORNERS ===
    const torchPositions = [
      { x: pad + 20, y: pad + 20 },
      { x: width - pad - 20, y: pad + 20 },
      { x: pad + 20, y: height - pad - 20 },
      { x: width - pad - 20, y: height - pad - 20 },
    ];

    torchPositions.forEach(pos => {
      // Torch base glow (warm radial)
      const glow = this.add.circle(pos.x, pos.y, 35, 0xFF8844, 0.06).setDepth(0);
      this.tweens.add({
        targets: glow, alpha: { from: 0.04, to: 0.1 }, scale: { from: 0.9, to: 1.15 },
        duration: Phaser.Math.Between(800, 1200), yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });

      // Torch bright core
      const core = this.add.circle(pos.x, pos.y, 6, COLORS.gold, 0.6).setDepth(1);
      this.tweens.add({
        targets: core, alpha: { from: 0.4, to: 0.8 }, scale: { from: 0.8, to: 1.2 },
        duration: Phaser.Math.Between(400, 700), yoyo: true, repeat: -1,
      });

      // Flickering embers from torch
      for (let i = 0; i < 3; i++) {
        const ember = this.add.circle(pos.x, pos.y, 1, 0xFFAA44, 0.5).setDepth(1);
        this.tweens.add({
          targets: ember,
          x: pos.x + Phaser.Math.Between(-12, 12),
          y: pos.y - Phaser.Math.Between(10, 30),
          alpha: 0,
          duration: Phaser.Math.Between(600, 1200),
          delay: Phaser.Math.Between(0, 1000),
          repeat: -1,
          onRepeat: () => { ember.x = pos.x; ember.y = pos.y; ember.alpha = 0.5; },
        });
      }

      // Outer ring decoration
      border.lineStyle(1, COLORS.gold, 0.3);
      border.strokeCircle(pos.x, pos.y, 12);
    });

    // === WALL GLOW (subtle) ===
    const wallGlow = this.add.graphics().setDepth(0);
    // Top wall glow
    wallGlow.fillStyle(COLORS.gold, 0.03);
    wallGlow.fillRect(pad, pad, width - pad * 2, 15);
    // Bottom wall glow
    wallGlow.fillRect(pad, height - pad - 15, width - pad * 2, 15);
    // Left wall glow
    wallGlow.fillRect(pad, pad, 15, height - pad * 2);
    // Right wall glow
    wallGlow.fillRect(width - pad - 15, pad, 15, height - pad * 2);

    // === FOG ===
    for (let i = 0; i < 8; i++) {
      const fog = this.add.ellipse(
        Phaser.Math.Between(pad, width - pad),
        Phaser.Math.Between(pad, height - pad),
        Phaser.Math.Between(80, 200),
        Phaser.Math.Between(30, 80),
        i % 3 === 0 ? 0x4ECDC4 : COLORS.deepPurple,
        i % 3 === 0 ? 0.015 : 0.08
      ).setDepth(0);

      this.tweens.add({
        targets: fog,
        x: fog.x + Phaser.Math.Between(-60, 60),
        alpha: { from: fog.alpha, to: fog.alpha * Phaser.Math.FloatBetween(0.3, 1.5) },
        scaleX: Phaser.Math.FloatBetween(0.7, 1.4),
        duration: Phaser.Math.Between(5000, 10000),
        yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 3000),
      });
    }

    this.arenaBounds = { left: pad, right: width - pad, top: pad, bottom: height - pad };
  }

  createUI() {
    const { width } = this.cameras.main;

    // === ORNATE TOP BAR ===
    const topBar = this.add.graphics().setScrollFactor(0).setDepth(100);
    // Main bar background
    topBar.fillStyle(0x0A0A1E, 0.9);
    topBar.fillRect(0, 0, width, 38);
    // Bottom border — double line
    topBar.lineStyle(2, COLORS.gold, 0.6);
    topBar.beginPath(); topBar.moveTo(0, 38); topBar.lineTo(width, 38); topBar.strokePath();
    topBar.lineStyle(1, COLORS.gold, 0.2);
    topBar.beginPath(); topBar.moveTo(0, 36); topBar.lineTo(width, 36); topBar.strokePath();
    // Subtle inner glow line at top
    topBar.fillStyle(COLORS.deepPurple, 0.4);
    topBar.fillRect(0, 0, width, 3);

    // Decorative corner accents on bar
    topBar.fillStyle(COLORS.gold, 0.5);
    // Left diamond
    topBar.beginPath();
    topBar.moveTo(8, 19); topBar.lineTo(11, 16); topBar.lineTo(14, 19);
    topBar.lineTo(11, 22); topBar.closePath(); topBar.fillPath();
    // Right diamond
    topBar.beginPath();
    topBar.moveTo(width - 8, 19); topBar.lineTo(width - 5, 16); topBar.lineTo(width - 2, 19);
    topBar.lineTo(width - 5, 22); topBar.closePath(); topBar.fillPath();

    // Section dividers
    topBar.lineStyle(1, COLORS.gold, 0.2);
    topBar.beginPath(); topBar.moveTo(140, 6); topBar.lineTo(140, 32); topBar.strokePath();
    topBar.beginPath(); topBar.moveTo(width - 180, 6); topBar.lineTo(width - 180, 32); topBar.strokePath();

    // Wave text
    this.waveText = this.add.text(22, 10, 'Wave ' + this.wave, {
      fontFamily: 'Cinzel, serif', fontSize: '15px', color: '#4ECDC4',
      stroke: '#0A0A1E', strokeThickness: 2,
    }).setScrollFactor(0).setDepth(101);

    // Score text (centered)
    this.scoreText = this.add.text(width / 2, 10, 'Score: 0', {
      fontFamily: 'Cinzel, serif', fontSize: '17px', color: '#D4AF37',
      stroke: '#0A0A1E', strokeThickness: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101);

    // Combo text
    this.comboText = this.add.text(width / 2, 28, '', {
      fontFamily: 'Cinzel, serif', fontSize: '11px', color: '#FF6B35',
      stroke: '#0A0A1E', strokeThickness: 1,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101).setAlpha(0);

    // === HEALTH BAR (ornate) ===
    const hx = width - 170, hy = 19;
    const hbW = 100, hbH = 12;

    // Health bar frame
    const hbFrame = this.add.graphics().setScrollFactor(0).setDepth(101);
    // Outer glow
    hbFrame.fillStyle(COLORS.gold, 0.08);
    hbFrame.fillRoundedRect(hx - 3, hy - hbH / 2 - 3, hbW + 6, hbH + 6, 4);
    // Dark inner
    hbFrame.fillStyle(0x0D0D2B, 0.9);
    hbFrame.fillRoundedRect(hx, hy - hbH / 2, hbW, hbH, 3);
    // Gold border
    hbFrame.lineStyle(1.5, COLORS.gold, 0.7);
    hbFrame.strokeRoundedRect(hx, hy - hbH / 2, hbW, hbH, 3);

    // Health label
    this.add.text(hx - 8, hy, '♥', {
      fontSize: '12px', color: '#FF4444',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(101);

    this.healthBarBg = this.add.rectangle(hx + 2, hy, hbW - 4, hbH - 4, 0x222233).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    this.healthBar = this.add.rectangle(hx + 2, hy, hbW - 4, hbH - 4, 0x44FF44).setOrigin(0, 0.5).setScrollFactor(0).setDepth(102);

    // Health bar highlight line
    this.healthBarHighlight = this.add.rectangle(hx + 2, hy - hbH / 2 + 3, hbW - 4, 2, 0xFFFFFF, 0.15).setOrigin(0, 0.5).setScrollFactor(0).setDepth(103);

    // Spell indicator
    this.spellIndicator = this.add.text(width - 16, 10, this.getSpellName(), {
      fontFamily: 'Cinzel, serif', fontSize: '13px', color: this.getSpellColor(),
      stroke: '#0A0A1E', strokeThickness: 2,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);

    // Pause button
    const pauseBtn = this.add.text(width - 20, this.cameras.main.height - 20, '⏸', {
      fontSize: '22px', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(1, 1).setScrollFactor(0).setDepth(101).setInteractive();
    pauseBtn.on('pointerdown', () => this.togglePause());
  }

  updateHealthBar() {
    const pct = this.player.health / GAME_CONFIG.player.health;
    const barW = 96 * Math.max(0, pct);
    this.healthBar.width = barW;
    this.healthBarHighlight.width = barW;
    this.healthBar.fillColor = pct > 0.6 ? 0x44FF44 : pct > 0.3 ? 0xFFFF44 : 0xFF4444;
  }

  handleSpellHit(spell, enemy) {
    const dmg = GAME_CONFIG.spells[spell.spellType]?.damage || 20;
    enemy.takeDamage(dmg);
    this.createHitEffect(enemy.x, enemy.y, spell.spellType);
    this.cameras.main.shake(50, 0.003);
    telegram.hapticFeedback('light');
    spell.destroy();
    if (enemy.health <= 0) this.enemyKilled(enemy);
  }

  handleEnemyCollision(enemy) {
    if (this.player.isInvincible || this.isGameOver) return;
    const dmg = GAME_CONFIG.enemies[enemy.enemyType]?.damage || 10;
    this.player.takeDamage(dmg);
    this.updateHealthBar();
    this.cameras.main.shake(100, 0.01);
    telegram.hapticFeedback('heavy');
    this.cameras.main.flash(200, 255, 0, 0);
    if (this.player.health <= 30 && this.player.health > 0) {
      this.dialogBox.showQuick(getRandomTip('lowHealth') || 'Careful!');
    }
    if (this.player.health <= 0) this.gameOver();
  }

  enemyKilled(enemy) {
    const sv = GAME_CONFIG.enemies[enemy.enemyType]?.score || 10;
    this.combo++;
    const mult = Math.min(this.combo, GAME_CONFIG.scoring.comboMultiplierMax);
    this.score += sv * mult;
    this.kills++;
    this.waveEnemiesRemaining--;
    this.scoreText.setText('Score: ' + this.score);
    if (this.combo > 1) {
      this.comboText.setText('x' + this.combo + ' Combo!'); this.comboText.setAlpha(1);
      this.tweens.add({ targets: this.comboText, scale: { from: 1.3, to: 1 }, duration: 150 });
    }
    if (this.comboTimer) this.comboTimer.remove();
    this.comboTimer = this.time.delayedCall(GAME_CONFIG.scoring.comboDecay, () => {
      this.combo = 0; this.comboText.setAlpha(0);
    });
    if (Math.random() < 0.15) this.spawnPickup(enemy.x, enemy.y);
    this.createDeathEffect(enemy.x, enemy.y, enemy.enemyType);
    if (this.waveEnemiesRemaining <= 0 && this.waveInProgress) this.waveComplete();
  }

  castSpell() {
    if (this.isPaused || this.isGameOver || !this.player.canAttack()) return;
    this.player.attack();
    this.spellCasts[this.currentSpell]++;

    const spell = this.spells.create(this.player.x, this.player.y, 'spell_' + this.currentSpell);
    spell.spellType = this.currentSpell;
    const cfg = GAME_CONFIG.spells[this.currentSpell];

    let vx, vy;
    const nearest = this.findNearestEnemy();
    if (nearest) {
      const a = Phaser.Math.Angle.Between(this.player.x, this.player.y, nearest.x, nearest.y);
      vx = Math.cos(a) * cfg.speed; vy = Math.sin(a) * cfg.speed;
    } else {
      const fx = this.player.facingX || 0;
      const fy = this.player.facingY || -1;
      const len = Math.sqrt(fx * fx + fy * fy) || 1;
      vx = (fx / len) * cfg.speed; vy = (fy / len) * cfg.speed;
    }
    spell.setVelocity(vx, vy);
    spell.setTint(cfg.color);
    spell.setScale(1.2);
    this.tweens.add({ targets: spell, scale: 0.8, duration: 500, yoyo: true, repeat: -1 });
    this.time.delayedCall(2000, () => { if (spell.active) spell.destroy(); });

    const flash = this.add.circle(this.player.x, this.player.y, 15, cfg.color, 0.6);
    this.tweens.add({ targets: flash, scale: 0.5, alpha: 0, duration: 150, onComplete: () => flash.destroy() });
    telegram.hapticFeedback('light');
  }

  findNearestEnemy() {
    let best = null, bestDist = Infinity;
    this.enemies.children.iterate(e => {
      if (!e || !e.active) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
      if (d < bestDist) { bestDist = d; best = e; }
    });
    return best;
  }

  spawnPickup(x, y) {
    const types = ['fire', 'ice', 'lightning'];
    const type = Phaser.Utils.Array.GetRandom(types);
    const pk = this.pickups.create(x, y, 'spell_pickup');
    pk.pickupType = type;
    pk.setTint(GAME_CONFIG.spells[type].color);
    this.tweens.add({ targets: pk, y: y - 10, duration: 1000, yoyo: true, repeat: -1 });
    this.time.delayedCall(10000, () => {
      if (pk.active) this.tweens.add({ targets: pk, alpha: 0, duration: 500, onComplete: () => pk.destroy() });
    });
  }

  collectPickup(pickup) {
    this.currentSpell = pickup.pickupType;
    this.spellIndicator.setText(this.getSpellName());
    this.spellIndicator.setColor(this.getSpellColor());
    this.dialogBox.showQuick(GAME_CONFIG.spells[this.currentSpell].name + '!');
    telegram.hapticFeedback('success');
    pickup.destroy();
  }

  getSpellName() { return GAME_CONFIG.spells[this.currentSpell]?.name || 'Unknown'; }
  getSpellColor() {
    const c = GAME_CONFIG.spells[this.currentSpell]?.color || 0xFFFFFF;
    return '#' + c.toString(16).padStart(6, '0');
  }

  startWave() {
    this.waveInProgress = true;
    const wd = getWave(this.wave);
    this.waveEnemiesRemaining = wd.enemies.reduce((s, e) => s + e.count, 0);
    this.dialogBox.show(wd.intro, !!wd.isBoss);
    this.waveText.setText('Wave ' + this.wave);
    this.time.delayedCall(2000, () => this.spawnWaveEnemies(wd));
  }

  spawnWaveEnemies(wd) {
    wd.enemies.forEach(eg => {
      for (let i = 0; i < eg.count; i++) {
        this.time.delayedCall(i * wd.spawnInterval + eg.delay, () => {
          if (!this.isGameOver) this.spawnEnemy(eg.type);
        });
      }
    });
  }

  spawnEnemy(type) {
    const { width, height } = this.cameras.main;
    const pad = GAME_CONFIG.arena.padding + 20;
    let x, y;
    const side = Phaser.Math.Between(0, 3);
    if (side === 0) { x = Phaser.Math.Between(pad, width - pad); y = pad; }
    else if (side === 1) { x = width - pad; y = Phaser.Math.Between(pad, height - pad); }
    else if (side === 2) { x = Phaser.Math.Between(pad, width - pad); y = height - pad; }
    else { x = pad; y = Phaser.Math.Between(pad, height - pad); }

    const enemy = new Enemy(this, x, y, type);
    this.enemies.add(enemy);

    // Spawn portal effect
    const portalOuter = this.add.circle(x, y, 3, COLORS.deepPurple, 0.9);
    const portalGlow = this.add.circle(x, y, 3, COLORS.cyan, 0.3);
    this.tweens.add({ targets: portalOuter, scale: 4, alpha: 0, duration: 600, onComplete: () => portalOuter.destroy() });
    this.tweens.add({ targets: portalGlow, scale: 6, alpha: 0, duration: 700, onComplete: () => portalGlow.destroy() });
  }

  waveComplete() {
    this.waveInProgress = false;
    this.enemies.clear(true, true);
    this.wave++;
    this.dialogBox.show(getRandomTip('waveComplete') || 'Well done!');
    telegram.hapticFeedback('success');
    this.time.delayedCall(3000, () => { if (!this.isGameOver) this.startWave(); });
  }

  createHitEffect(x, y, spellType) {
    const color = GAME_CONFIG.spells[spellType]?.color || COLORS.white;
    for (let i = 0; i < 8; i++) {
      const p = this.add.circle(x, y, 4, color);
      const a = (i / 8) * Math.PI * 2;
      const d = Phaser.Math.Between(20, 40);
      this.tweens.add({ targets: p, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, alpha: 0, scale: 0.5, duration: 300, onComplete: () => p.destroy() });
    }
  }

  createDeathEffect(x, y, type) {
    const color = GAME_CONFIG.enemies[type]?.color || COLORS.deepPurple;
    for (let i = 0; i < 12; i++) {
      const p = this.add.circle(x, y, Phaser.Math.Between(3, 6), color, 0.8);
      const a = (i / 12) * Math.PI * 2;
      const d = Phaser.Math.Between(30, 60);
      this.tweens.add({ targets: p, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, alpha: 0, scale: 0.3, duration: 400, ease: 'Power2', onComplete: () => p.destroy() });
    }
    const flash = this.add.circle(x, y, 20, color, 0.5);
    this.tweens.add({ targets: flash, scale: 2, alpha: 0, duration: 200, onComplete: () => flash.destroy() });
  }

  createAmbientEffects() {
    const { width, height } = this.cameras.main;

    // Floating magical motes
    for (let i = 0; i < 10; i++) {
      const mx = Phaser.Math.Between(60, width - 60);
      const my = Phaser.Math.Between(60, height - 60);
      const color = i % 3 === 0 ? COLORS.gold : COLORS.cyan;
      const m = this.add.circle(mx, my, Phaser.Math.Between(1, 3), color, 0.15).setDepth(0);
      this.tweens.add({
        targets: m,
        x: mx + Phaser.Math.Between(-50, 50),
        y: my + Phaser.Math.Between(-30, 30),
        alpha: { from: 0.1, to: 0.3 },
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1, yoyo: true,
        delay: Phaser.Math.Between(0, 2000),
        ease: 'Sine.easeInOut',
      });
    }

    // Slow twinkling stars in background
    for (let i = 0; i < 6; i++) {
      const s = this.add.circle(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(50, height - 50),
        1, COLORS.gold, 0).setDepth(0);
      this.tweens.add({
        targets: s,
        alpha: { from: 0, to: Phaser.Math.FloatBetween(0.2, 0.5) },
        duration: Phaser.Math.Between(600, 1500),
        yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 4000),
        repeatDelay: Phaser.Math.Between(1500, 4000),
      });
    }
  }

  togglePause() {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;
    const { width, height } = this.cameras.main;
    if (this.isPaused) {
      this.physics.pause();
      this.pauseOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75).setScrollFactor(0).setDepth(200);

      // Ornate pause panel
      const panelW = 250, panelH = 160;
      this.pausePanel = this.add.graphics().setScrollFactor(0).setDepth(201);
      this.pausePanel.fillStyle(0x0A0A1E, 0.95);
      this.pausePanel.fillRoundedRect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 10);
      this.pausePanel.lineStyle(2, COLORS.gold, 0.7);
      this.pausePanel.strokeRoundedRect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 10);
      this.pausePanel.lineStyle(1, COLORS.gold, 0.2);
      this.pausePanel.strokeRoundedRect(width / 2 - panelW / 2 + 4, height / 2 - panelH / 2 + 4, panelW - 8, panelH - 8, 7);

      this.pauseTitle = this.add.text(width / 2, height / 2 - 45, 'PAUSED', {
        fontFamily: 'Cinzel, serif', fontSize: '28px', color: '#D4AF37',
        stroke: '#0A0A1E', strokeThickness: 3,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(202);

      this.resumeBtn = this.add.text(width / 2, height / 2 + 5, 'Continue', {
        fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#4ECDC4',
        stroke: '#0A0A1E', strokeThickness: 2,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(202).setInteractive();
      this.resumeBtn.on('pointerover', () => this.resumeBtn.setColor('#6FFFEE'));
      this.resumeBtn.on('pointerout', () => this.resumeBtn.setColor('#4ECDC4'));
      this.resumeBtn.on('pointerdown', () => this.togglePause());

      this.quitBtn = this.add.text(width / 2, height / 2 + 42, 'Abandon', {
        fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#FF6B35',
        stroke: '#0A0A1E', strokeThickness: 2,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(202).setInteractive();
      this.quitBtn.on('pointerover', () => this.quitBtn.setColor('#FF9955'));
      this.quitBtn.on('pointerout', () => this.quitBtn.setColor('#FF6B35'));
      this.quitBtn.on('pointerdown', () => {
        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
      });
    } else {
      this.physics.resume();
      this.pauseOverlay?.destroy();
      this.pausePanel?.destroy();
      this.pauseTitle?.destroy();
      this.resumeBtn?.destroy();
      this.quitBtn?.destroy();
    }
    telegram.hapticFeedback('impact');
  }

  gameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    telegram.hapticFeedback('error');
    this.physics.pause();
    this.joystick.disable();
    this.attackButton.disable();
    this.saveStats();
    this.dialogBox.show(DEATH_MESSAGES.primary, true);
    this.time.delayedCall(2000, () => {
      this.dialogBox.show(DEATH_MESSAGES.secondary + '\n' + DEATH_MESSAGES.tertiary);
      this.time.delayedCall(2000, () => {
        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('GameOverScene', { score: this.score, wave: this.wave, kills: this.kills, survivalTime: this.survivalTime });
        });
      });
    });
  }

  saveStats() {
    const ch = parseInt(localStorage.getItem(STORAGE_KEYS.highScore) || '0');
    if (this.score > ch) localStorage.setItem(STORAGE_KEYS.highScore, this.score.toString());
    const cmw = parseInt(localStorage.getItem(STORAGE_KEYS.maxWave) || '0');
    if (this.wave > cmw) localStorage.setItem(STORAGE_KEYS.maxWave, this.wave.toString());
    const ck = parseInt(localStorage.getItem(STORAGE_KEYS.totalKills) || '0');
    localStorage.setItem(STORAGE_KEYS.totalKills, (ck + this.kills).toString());
  }

  update() {
    if (this.isPaused || this.isGameOver) return;
    let mx = this.joystick.forceX, my = this.joystick.forceY;
    if (this.cursors.left.isDown || this.wasd.A.isDown) mx = -1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) mx = 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) my = -1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) my = 1;
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.castSpell();

    this.player.move(mx, my);
    this.player.x = Phaser.Math.Clamp(this.player.x, this.arenaBounds.left + 20, this.arenaBounds.right - 20);
    this.player.y = Phaser.Math.Clamp(this.player.y, this.arenaBounds.top + 20, this.arenaBounds.bottom - 20);

    this.enemies.children.iterate(e => { if (e && e.active) e.chaseTarget(this.player.x, this.player.y); });
  }
}
