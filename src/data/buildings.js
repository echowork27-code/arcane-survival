// Building Definitions
export const BUILDINGS = {
  cottage: {
    id: 'cottage',
    name: 'Cottage',
    category: 'house',
    description: 'A cozy home for valley residents.',
    tileW: 3, tileH: 3,
    levels: [
      { cost: { coins: 100, wood: 10, stone: 5 }, bonus: 'Attracts visitors' },
      { cost: { coins: 300, wood: 20, stone: 15, iron: 5 }, bonus: 'Daily coin income +5' },
      { cost: { coins: 800, wood: 40, stone: 30, crystal: 5 }, bonus: 'Daily coin income +15' },
    ]
  },
  bakery: {
    id: 'bakery',
    name: 'Bakery',
    category: 'shop',
    description: 'Ember\'s bakery. Bake goods from crops!',
    tileW: 3, tileH: 3,
    levels: [
      { cost: { coins: 200, wood: 15, stone: 10 }, bonus: 'Unlock baking recipes' },
      { cost: { coins: 500, wood: 30, stone: 20, iron: 10 }, bonus: 'Faster baking' },
      { cost: { coins: 1200, wood: 50, stone: 40, crystal: 10 }, bonus: 'Rare recipes unlocked' },
    ]
  },
  library: {
    id: 'library',
    name: 'Library',
    category: 'shop',
    description: 'Sage\'s library. Knowledge awaits!',
    tileW: 3, tileH: 3,
    levels: [
      { cost: { coins: 250, wood: 20, stone: 15 }, bonus: 'Unlock enchantments' },
      { cost: { coins: 600, wood: 35, stone: 30, crystal: 5 }, bonus: 'XP boost +10%' },
      { cost: { coins: 1500, wood: 60, stone: 50, crystal: 15 }, bonus: 'XP boost +25%' },
    ]
  },
  blacksmith: {
    id: 'blacksmith',
    name: 'Blacksmith',
    category: 'shop',
    description: 'Forge tools and process ores.',
    tileW: 3, tileH: 2,
    levels: [
      { cost: { coins: 300, wood: 10, stone: 20, iron: 10 }, bonus: 'Unlock crafting' },
      { cost: { coins: 700, wood: 20, stone: 40, iron: 25 }, bonus: 'Better tools' },
      { cost: { coins: 1800, wood: 40, stone: 60, iron: 50, crystal: 10 }, bonus: 'Master crafting' },
    ]
  },
  garden_arch: {
    id: 'garden_arch',
    name: 'Garden Arch',
    category: 'decoration',
    description: 'A beautiful archway covered in flowers.',
    tileW: 2, tileH: 1,
    levels: [
      { cost: { coins: 50, wood: 5 }, bonus: 'Beauty +2' },
      { cost: { coins: 150, wood: 10, iron: 3 }, bonus: 'Beauty +5' },
      { cost: { coins: 400, wood: 20, crystal: 3 }, bonus: 'Beauty +10' },
    ]
  },
  fountain: {
    id: 'fountain',
    name: 'Fountain',
    category: 'decoration',
    description: 'A sparkling magical fountain.',
    tileW: 2, tileH: 2,
    levels: [
      { cost: { coins: 150, stone: 15 }, bonus: 'Beauty +5' },
      { cost: { coins: 400, stone: 30, iron: 10 }, bonus: 'Beauty +10, daily gems' },
      { cost: { coins: 1000, stone: 50, crystal: 10 }, bonus: 'Beauty +20, wish coins' },
    ]
  },
  lamp_post: {
    id: 'lamp_post',
    name: 'Lamp Post',
    category: 'decoration',
    description: 'Lights the valley at night.',
    tileW: 1, tileH: 1,
    levels: [
      { cost: { coins: 30, iron: 3 }, bonus: 'Light radius 3' },
      { cost: { coins: 80, iron: 8, crystal: 1 }, bonus: 'Light radius 5' },
      { cost: { coins: 200, iron: 15, crystal: 5 }, bonus: 'Light radius 8, sparkles' },
    ]
  },
  flower_bed: {
    id: 'flower_bed',
    name: 'Flower Bed',
    category: 'decoration',
    description: 'A colorful patch of flowers.',
    tileW: 2, tileH: 1,
    levels: [
      { cost: { coins: 25, wood: 3 }, bonus: 'Beauty +1' },
      { cost: { coins: 60, wood: 6 }, bonus: 'Beauty +3' },
      { cost: { coins: 150, wood: 12, crystal: 2 }, bonus: 'Beauty +6, butterflies' },
    ]
  },
  fence: {
    id: 'fence',
    name: 'Fence',
    category: 'decoration',
    description: 'A rustic wooden fence.',
    tileW: 1, tileH: 1,
    levels: [
      { cost: { coins: 10, wood: 2 }, bonus: '' },
      { cost: { coins: 30, wood: 5, iron: 1 }, bonus: 'Sturdier look' },
      { cost: { coins: 80, wood: 10, iron: 5 }, bonus: 'Ornamental' },
    ]
  },
  well: {
    id: 'well',
    name: 'Wishing Well',
    category: 'decoration',
    description: 'Toss a coin and make a wish!',
    tileW: 1, tileH: 1,
    levels: [
      { cost: { coins: 100, stone: 10 }, bonus: 'Daily wish' },
      { cost: { coins: 300, stone: 25, iron: 5 }, bonus: 'Better wishes' },
      { cost: { coins: 800, stone: 50, crystal: 10 }, bonus: 'Legendary wishes' },
    ]
  }
};

export const BUILDING_CATEGORIES = {
  house: { name: 'Houses', icon: '🏠' },
  shop: { name: 'Shops', icon: '🏪' },
  decoration: { name: 'Decorations', icon: '🌸' },
};
