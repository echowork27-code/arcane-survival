export const COLORS = {
  deepPurple: 0x2D1B4E,
  darkBlue: 0x1A1A3E,
  gold: 0xD4AF37,
  cyan: 0x4ECDC4,
  white: 0xFFFFFF,
  black: 0x000000,
  red: 0xFF4444,
  orange: 0xFF8844,
  blue: 0x4488FF,
  accent: 0x4ECDC4,
  textLight: '#E8D5B5',
  panelBg: 0x1A0A2E,
  hex: {
    deepPurple: "#2D1B4E",
    darkBlue: "#1A1A3E",
    gold: "#D4AF37",
    cyan: "#4ECDC4",
  }
};

export const GAME_CONFIG = {
  width: 800,
  height: 450,
  player: {
    speed: 180,
    health: 100,
    attackCooldown: 300,
    invincibilityTime: 1000,
    size: 20,
  },
  spells: {
    fire: { damage: 25, speed: 400, color: 0xFF6B35, name: "Ignis" },
    ice: { damage: 20, speed: 350, color: 0x4ECDC4, name: "Glacius" },
    lightning: { damage: 35, speed: 500, color: 0xFFE66D, name: "Fulmen" },
  },
  enemies: {
    wisp: { health: 30, speed: 80, damage: 10, score: 10, color: 0x8844FF },
    knight: { health: 80, speed: 60, damage: 25, score: 25, color: 0x444466 },
    wraith: { health: 50, speed: 120, damage: 15, score: 20, color: 0x22AA88 },
    boss: { health: 300, speed: 40, damage: 40, score: 100, color: 0xFF2244 },
  },
  arena: { padding: 40, fogDensity: 0.3 },
  scoring: { killMultiplier: 1, timeBonus: 1, comboDecay: 2000, comboMultiplierMax: 5 },
};

export const STORAGE_KEYS = {
  highScore: "arcane_highscore",
  unlockedLore: "arcane_lore",
  unlockedSkins: "arcane_skins",
  totalKills: "arcane_kills",
  maxWave: "arcane_maxwave",
  settings: "arcane_settings",
};
