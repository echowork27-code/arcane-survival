// ─── Game Configuration ───
export const TILE_SIZE = 32;
export const MAP_COLS = 50;
export const MAP_ROWS = 40;
export const WORLD_W = MAP_COLS * TILE_SIZE; // 1600
export const WORLD_H = MAP_ROWS * TILE_SIZE; // 1280
export const GAME_W = 400;
export const GAME_H = 720;

// Day/night cycle duration in ms (5 minutes = 1 full day)
export const DAY_DURATION = 300000;

// Colors
export const COLORS = {
  // UI
  uiBg: 0x2d1b4e,
  uiPanel: 0x3d2b5e,
  uiPanelLight: 0x5a3d7a,
  uiButton: 0x6b4d8a,
  uiButtonHover: 0x8b6daa,
  uiAccent: 0xf0c040,
  uiAccentSoft: 0xf5d070,
  uiText: 0xffffff,
  uiTextDark: 0x2d1b4e,
  uiBorder: 0x8b6daa,
  uiRed: 0xe74c3c,
  uiGreen: 0x2ecc71,

  // World
  grass1: 0x5db55d,
  grass2: 0x4da54d,
  grass3: 0x6dc56d,
  grassDark: 0x3d8b3d,
  path: 0xc9b88a,
  pathDark: 0xb0a070,
  dirt: 0x8b6b3d,
  dirtLight: 0xa07b4d,
  water: 0x4a90d9,
  waterLight: 0x6ab0f0,
  waterDeep: 0x2a60a0,
  sand: 0xe8d8a0,
  stone: 0x8a8a8a,
  stoneDark: 0x6a6a6a,
  stoneLight: 0xaaaaaa,
  snow: 0xeef4ff,

  // Nature
  treeTrunk: 0x6b4226,
  treeLeaf1: 0x2d8c2d,
  treeLeaf2: 0x3da53d,
  treeLeaf3: 0x1d6b1d,
  bush: 0x3d9b3d,
  flowerPink: 0xff88aa,
  flowerYellow: 0xffdd44,
  flowerPurple: 0xbb66ee,
  flowerBlue: 0x6699ff,
  flowerWhite: 0xf0f0ff,

  // Buildings
  woodWall: 0xc49a6c,
  woodDark: 0x8b6b3d,
  roofRed: 0xcc4444,
  roofBlue: 0x4466cc,
  roofPurple: 0x8844aa,
  roofGreen: 0x44aa66,
  stoneWall: 0x9a9a9a,
  window: 0xaaddff,
  door: 0x6b4226,

  // Characters
  skinLight: 0xffe0bd,
  skinMedium: 0xe0b88a,
  hairBrown: 0x5a3825,
  hairBlonde: 0xe8c840,
  hairBlack: 0x2a2a2a,
  hairRed: 0xc04020,
  hairWhite: 0xe8e8f0,
  hairGreen: 0x40a060,
  hairPurple: 0x8844bb,
  clothBlue: 0x4466aa,
  clothRed: 0xaa4444,
  clothGreen: 0x44aa66,
  clothPurple: 0x8844aa,

  // NPC specific
  lunaGlow: 0xccccff,
  lunaWing: 0xaabbff,
  emberGlow: 0xff6622,
  coralBlue: 0x44bbdd,
  flintArmor: 0x888899,
  sageCloth: 0x6655aa,
  willowGreen: 0x558844,
  pipCap: 0xcc6644,

  // Sky
  skyDay: 0x87ceeb,
  skyDusk: 0xff8855,
  skyNight: 0x1a1a3e,
  skyDawn: 0xffaa77,

  // Crops
  wheatYoung: 0x88cc44,
  wheatRipe: 0xddcc44,
  carrotGreen: 0x44aa44,
  carrotOrange: 0xff8822,
  pumpkinGreen: 0x44aa44,
  pumpkinOrange: 0xff8833,
  starberryPink: 0xff66aa,
  moonflowerPurple: 0xaa66ff,
};

// Zone definitions (in tile coords)
export const ZONES = {
  village: { x: 18, y: 14, w: 14, h: 12, name: 'Village Center' },
  farm: { x: 2, y: 14, w: 14, h: 14, name: 'Farm' },
  forest: { x: 33, y: 2, w: 15, h: 18, name: 'Enchanted Forest' },
  mine: { x: 2, y: 2, w: 14, h: 10, name: 'Crystal Mine' },
  lake: { x: 14, y: 30, w: 22, h: 9, name: 'Moonlight Lake' },
};

// Player start position (tile coords)
export const PLAYER_START = { x: 25, y: 20 };
export const PLAYER_SPEED = 120;

// Item categories
export const ITEM_CATEGORIES = {
  SEED: 'seed',
  CROP: 'crop',
  FISH: 'fish',
  ORE: 'ore',
  GEM: 'gem',
  MATERIAL: 'material',
  FOOD: 'food',
  GIFT: 'gift',
  TOOL: 'tool',
};
