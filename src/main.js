// Dreamlight Valley — Main Entry
import Phaser from 'phaser';
import { GAME_W, GAME_H } from './config.js';
import { initTelegram } from './utils/telegram.js';

import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import WorldScene from './scenes/WorldScene.js';
import FishingScene from './scenes/FishingScene.js';
import MiningScene from './scenes/MiningScene.js';

// Initialize Telegram
initTelegram();

const config = {
  type: Phaser.AUTO,
  width: GAME_W,
  height: GAME_H,
  parent: 'game-container',
  backgroundColor: '#1a1a3e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, TitleScene, WorldScene, FishingScene, MiningScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: true,
  },
  input: {
    activePointers: 2,
  },
};

const game = new Phaser.Game(config);

// Handle visibility
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.scene.scenes.forEach(s => {
      if (s.scene.isActive() && s.doSave) s.doSave();
    });
  }
});

// Prevent context menu on mobile
window.addEventListener('contextmenu', e => e.preventDefault());
