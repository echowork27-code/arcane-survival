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
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.darkBlue);

    const g = this.add.graphics();
    g.fillStyle(COLORS.deepPurple, 0.3);
    for (let x = pad; x < width - pad; x += 40) {
      for (let y = pad; y < height - pad; y += 40) { g.fillRect(x + 1, y + 1, 38, 38); }
    }
    g.lineStyle(4, COLORS.gold, 0.8);
    g.strokeRect(pad, pad, width - pad * 2, height - pad * 2);
    g.lineStyle(2, COLORS.cyan, 0.3);
    g.strokeCircle(width / 2, height / 2, 150);
    g.strokeCircle(width / 2, height / 2, 100);

    [{ x: pad + 30, y: pad + 30 }, { x: width - pad - 30, y: pad + 30 },
     { x: pad + 30, y: height - pad - 30 }, { x: width - pad - 30, y: height - pad - 30 }].forEach(pos => {
      g.fillStyle(COLORS.gold, 0.5); g.fillCircle(pos.x, pos.y, 8);
      g.lineStyle(1, COLORS.gold, 0.3); g.strokeCircle(pos.x, pos.y, 15);
    });

    for (let i = 0; i < 5; i++) {
      const fog = this.add.ellipse(
        Phaser.Math.Between(pad, width - pad), Phaser.Math.Between(pad, height - pad),
        Phaser.Math.Between(100, 200), Phaser.Math.Between(50, 100), COLORS.deepPurple, 0.15
      );
      this.tweens.add({ targets: fog, x: fog.x + Phaser.Math.Between(-50, 50), alpha: Phaser.Math.FloatBetween(0.1, 0.2), duration: Phaser.Math.Between(4000, 8000), yoyo: true, repeat: -1 });
    }
    this.arenaBounds = { left: pad, right: width - pad, top: pad, bottom: height - pad };
  }

  createUI() {
    const { width, height } = this.cameras.main;
    const topBar = this.add.graphics();
    topBar.fillStyle(COLORS.darkBlue, 0.8); topBar.fillRect(0, 0, width, 35);
    topBar.lineStyle(1, COLORS.gold, 0.5); topBar.moveTo(0, 35); topBar.lineTo(width, 35); topBar.strokePath();
    topBar.setScrollFactor(0).setDepth(100);

    this.waveText = this.add.text(20, 8, 'Wave ' + this.wave, {
      fontFamily: 'Cinzel, serif', fontSize: '16px', color: '#4ECDC4',
    }).setScrollFactor(0).setDepth(100);

    this.scoreText = this.add.text(width / 2, 8, 'Score: 0', {
      fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#D4AF37',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    this.comboText = this.add.text(width / 2, 26, '', {
      fontFamily: 'Cinzel, serif', fontSize: '12px', color: '#FF6B35',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100).setAlpha(0);

    const hx = width - 130, hy = 22;
    this.healthBarBg = this.add.rectangle(hx, hy, 100, 10, 0x333333).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    this.healthBar = this.add.rectangle(hx, hy, 100, 10, 0x44FF44).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    const hb = this.add.graphics();
    hb.lineStyle(1, COLORS.gold, 0.8); hb.strokeRect(hx - 1, hy - 6, 102, 12);
    hb.setScrollFactor(0).setDepth(100);

    this.spellIndicator = this.add.text(width - 20, 8, this.getSpellName(), {
      fontFamily: 'Cinzel, serif', fontSize: '14px', color: this.getSpellColor(),
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    const pauseBtn = this.add.text(width - 20, height - 20, '\u23F8', { fontSize: '24px' })
      .setOrigin(1, 1).setScrollFactor(0).setDepth(100).setInteractive();
    pauseBtn.on('pointerdown', () => this.togglePause());
  }

  updateHealthBar() {
    const pct = this.player.health / GAME_CONFIG.player.health;
    this.healthBar.width = 100 * Math.max(0, pct);
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

    const portal = this.add.circle(x, y, 5, COLORS.deepPurple, 0.8);
    this.tweens.add({ targets: portal, scale: 3, alpha: 0, duration: 500, onComplete: () => portal.destroy() });
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
    for (let i = 0; i < 8; i++) {
      const m = this.add.circle(Phaser.Math.Between(50, width - 50), Phaser.Math.Between(50, height - 50), Phaser.Math.Between(2, 4), COLORS.cyan, 0.2).setDepth(0);
      this.tweens.add({ targets: m, x: m.x + Phaser.Math.Between(-50, 50), y: m.y + Phaser.Math.Between(-30, 30), alpha: 0, duration: Phaser.Math.Between(3000, 5000), repeat: -1, yoyo: true, delay: Phaser.Math.Between(0, 2000) });
    }
  }

  togglePause() {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;
    const { width, height } = this.cameras.main;
    if (this.isPaused) {
      this.physics.pause();
      this.pauseOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setScrollFactor(0).setDepth(200);
      this.pauseTitle = this.add.text(width / 2, height / 2 - 40, 'PAUSED', { fontFamily: 'Cinzel, serif', fontSize: '32px', color: '#D4AF37' }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
      this.resumeBtn = this.add.text(width / 2, height / 2 + 10, 'Continue', { fontFamily: 'Cinzel, serif', fontSize: '20px', color: '#4ECDC4' }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive();
      this.resumeBtn.on('pointerdown', () => this.togglePause());
      this.quitBtn = this.add.text(width / 2, height / 2 + 50, 'Abandon', { fontFamily: 'Cinzel, serif', fontSize: '16px', color: '#FF6B35' }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive();
      this.quitBtn.on('pointerdown', () => {
        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
      });
    } else {
      this.physics.resume();
      this.pauseOverlay?.destroy(); this.pauseTitle?.destroy(); this.resumeBtn?.destroy(); this.quitBtn?.destroy();
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
