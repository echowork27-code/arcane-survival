import Phaser from 'phaser';
import { COLORS } from './config.js';
import { telegram } from './utils/telegram.js';

import BootScene from './scenes/BootScene.js';
import IntroScene from './scenes/IntroScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import CodexScene from './scenes/CodexScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: COLORS.darkBlue,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 450,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [BootScene, IntroScene, MenuScene, GameScene, GameOverScene, CodexScene],
  input: { activePointers: 3 },
  render: { pixelArt: false, antialias: true },
};

window.gameState = {
  playerName: telegram.getUserName(),
  highScore: parseInt(localStorage.getItem('arcane_highscore') || '0'),
  codexUnlocked: JSON.parse(localStorage.getItem('arcane_lore') || '[]'),
  hasSeenIntro: !!localStorage.getItem('arcane_intro_seen'),
};

const game = new Phaser.Game(config);
game.telegram = telegram;

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.scene.scenes.forEach(scene => {
      if (scene.scene.isActive() && scene.scene.key === 'GameScene') {
        scene.togglePause?.();
      }
    });
  }
});

window.addEventListener('contextmenu', e => e.preventDefault());
