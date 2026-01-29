// CodexScene — Lore Journal (Unlockable Chapters)
import { COLORS } from '../config.js';
import { CODEX_ENTRIES } from '../data/lore.js';
import { telegram } from '../utils/telegram.js';

export default class CodexScene extends Phaser.Scene {
  constructor() { super({ key: 'CodexScene' }); }

  create() {
    const W = this.cameras.main.width, H = this.cameras.main.height;
    this.add.rectangle(W/2, H/2, W, H, COLORS.deepPurple);
    this._addFog(W, H);

    const unlocked = window.gameState.codexUnlocked || [];
    this.page = 0;
    this.entries = CODEX_ENTRIES;

    // Title
    this.add.text(W/2, 34, '📖  THE CODEX  📖', {
      fontFamily: 'Cinzel, serif', fontSize: '22px', fontStyle: '700',
      color: '#D4AF37', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);

    // Stats
    this.add.text(W/2, 58, `${unlocked.length} / ${this.entries.length} chapters discovered`, {
      fontFamily: 'Crimson Text, serif', fontSize: '12px', color: '#7A6E8A', fontStyle: 'italic',
    }).setOrigin(0.5);

    // ── Entry list (left panel) ──
    const listX = 30;
    const listW = 200;
    this.entryButtons = [];

    this.entries.forEach((entry, i) => {
      const y = 88 + i * 36;
      const isUnlocked = unlocked.includes(entry.id);
      const c = this.add.container(listX + listW/2, y);

      const bg = this.add.graphics();
      bg.fillStyle(isUnlocked ? COLORS.panelBg : 0x0A0A18, 0.8);
      bg.fillRoundedRect(-listW/2, -14, listW, 28, 4);
      if (isUnlocked) {
        bg.lineStyle(1, COLORS.gold, 0.3);
        bg.strokeRoundedRect(-listW/2, -14, listW, 28, 4);
      }

      const icon = isUnlocked ? '📜' : '🔒';
      const label = isUnlocked ? entry.title : this._requirementHint(entry);
      const color = isUnlocked ? COLORS.textLight : '#4A3E5A';

      const txt = this.add.text(0, 0, `${icon}  ${label}`, {
        fontFamily: 'Crimson Text, serif', fontSize: '11px', color,
        wordWrap: { width: listW - 20 },
      }).setOrigin(0.5);

      c.add([bg, txt]).setSize(listW, 28);

      if (isUnlocked) {
        c.setInteractive({ useHandCursor: true });
        c.on('pointerdown', () => {
          telegram.hapticSelect();
          this._showEntry(entry);
          // Highlight selected
          this.entryButtons.forEach((b, j) => {
            b.setAlpha(j === i ? 1 : 0.6);
          });
          c.setAlpha(1);
        });
      }

      this.entryButtons.push(c);
    });

    // ── Reading panel (right) ──
    const panelX = listX + listW + 20;
    const panelW = W - panelX - 20;

    const panelBg = this.add.graphics();
    panelBg.fillStyle(COLORS.panelBg, 0.7);
    panelBg.fillRoundedRect(panelX, 78, panelW, H - 140, 8);
    panelBg.lineStyle(1, COLORS.gold, 0.2);
    panelBg.strokeRoundedRect(panelX, 78, panelW, H - 140, 8);

    this.readTitle = this.add.text(panelX + panelW/2, 98, 'Select a chapter...', {
      fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#D4AF37',
    }).setOrigin(0.5);

    this.readBody = this.add.text(panelX + 16, 125, 'Unlock chapters by surviving waves,\nslaying creatures, and earning high scores.\n\nEach milestone reveals another piece\nof the world\'s hidden history.', {
      fontFamily: 'Crimson Text, serif', fontSize: '13px', color: '#7A6E8A',
      fontStyle: 'italic',
      wordWrap: { width: panelW - 32 },
      lineSpacing: 5,
    });

    // Back
    this._btn(W/2, H - 30, '← RETURN', 110, () => {
      telegram.hapticSelect();
      this.scene.start('MenuScene');
    });
    telegram.showBackButton(() => this.scene.start('MenuScene'));

    // Auto-show first unlocked
    const firstUnlocked = this.entries.find(e => unlocked.includes(e.id));
    if (firstUnlocked) this._showEntry(firstUnlocked);
  }

  _showEntry(entry) {
    this.readTitle.setText(entry.title);
    this.readBody.setText(entry.text);
    this.readBody.setColor(COLORS.textLight);
    this.readBody.setFontStyle('normal');
  }

  _requirementHint(entry) {
    const r = entry.requirement;
    if (r.type === 'waves') return `Survive ${r.value} waves to unlock`;
    if (r.type === 'kills') return `Slay ${r.value} creatures to unlock`;
    if (r.type === 'score') return `Score ${r.value}+ to unlock`;
    return 'Unknown requirement';
  }

  _btn(x, y, label, w, cb) {
    const h = 30;
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(COLORS.panelBg, 0.8);
    g.fillRoundedRect(-w/2, -h/2, w, h, 5);
    g.lineStyle(1, COLORS.gold, 0.35);
    g.strokeRoundedRect(-w/2, -h/2, w, h, 5);
    const t = this.add.text(0, 0, label, { fontFamily: 'Cinzel, serif', fontSize: '11px', color: COLORS.textLight }).setOrigin(0.5);
    c.add([g, t]).setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerdown', cb);
  }

  _addFog(W, H) {
    for (let i = 0; i < 6; i++) {
      const f = this.add.circle(Phaser.Math.Between(0,W), Phaser.Math.Between(0,H), Phaser.Math.Between(40,90), COLORS.accent, 0.02);
      this.tweens.add({ targets: f, x: f.x + Phaser.Math.Between(-60,60), alpha: 0, duration: Phaser.Math.Between(5000,8000), yoyo: true, repeat: -1 });
    }
  }
}
