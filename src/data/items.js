// Item Catalog
export const ITEMS = {
  // Seeds
  seed_wheat: { id: 'seed_wheat', name: 'Wheat Seeds', category: 'seed', value: 5, growTime: 30000, crop: 'wheat', icon: 0xddcc44 },
  seed_carrot: { id: 'seed_carrot', name: 'Carrot Seeds', category: 'seed', value: 8, growTime: 45000, crop: 'carrot', icon: 0xff8822 },
  seed_pumpkin: { id: 'seed_pumpkin', name: 'Pumpkin Seeds', category: 'seed', value: 15, growTime: 60000, crop: 'pumpkin', icon: 0xff8833 },
  seed_starberry: { id: 'seed_starberry', name: 'Starberry Seeds', category: 'seed', value: 25, growTime: 90000, crop: 'starberry', icon: 0xff66aa },
  seed_moonflower: { id: 'seed_moonflower', name: 'Moonflower Seeds', category: 'seed', value: 40, growTime: 120000, crop: 'moonflower', icon: 0xaa66ff },

  // Crops
  wheat: { id: 'wheat', name: 'Wheat', category: 'crop', value: 12, icon: 0xddcc44 },
  carrot: { id: 'carrot', name: 'Carrot', category: 'crop', value: 18, icon: 0xff8822 },
  pumpkin: { id: 'pumpkin', name: 'Pumpkin', category: 'crop', value: 30, icon: 0xff8833 },
  starberry: { id: 'starberry', name: 'Starberry', category: 'crop', value: 50, icon: 0xff66aa },
  moonflower: { id: 'moonflower', name: 'Moonflower', category: 'crop', value: 80, icon: 0xaa66ff },

  // Fish
  fish_common: { id: 'fish_common', name: 'Silverscale', category: 'fish', value: 15, icon: 0xccccdd },
  fish_bass: { id: 'fish_bass', name: 'Valley Bass', category: 'fish', value: 25, icon: 0x88aa66 },
  fish_golden: { id: 'fish_golden', name: 'Golden Koi', category: 'fish', value: 60, icon: 0xffcc44 },
  fish_rainbow: { id: 'fish_rainbow', name: 'Rainbow Trout', category: 'fish', value: 100, icon: 0xff88cc },
  fish_shimmer: { id: 'fish_shimmer', name: 'Shimmer-Fin', category: 'fish', value: 250, icon: 0xaaddff },

  // Ores & Gems
  stone: { id: 'stone', name: 'Stone', category: 'ore', value: 3, icon: 0x8a8a8a },
  iron: { id: 'iron', name: 'Iron Ore', category: 'ore', value: 10, icon: 0xaa8866 },
  crystal: { id: 'crystal', name: 'Crystal', category: 'gem', value: 50, icon: 0xaaddff },
  amethyst: { id: 'amethyst', name: 'Amethyst', category: 'gem', value: 80, icon: 0xaa66dd },
  ruby: { id: 'ruby', name: 'Ruby', category: 'gem', value: 120, icon: 0xff4444 },

  // Materials
  wood: { id: 'wood', name: 'Wood', category: 'material', value: 3, icon: 0xc49a6c },

  // Foraged
  mushroom: { id: 'mushroom', name: 'Forest Mushroom', category: 'material', value: 8, icon: 0xcc8855 },
  herb: { id: 'herb', name: 'Healing Herb', category: 'material', value: 12, icon: 0x66cc66 },
  berry: { id: 'berry', name: 'Wild Berry', category: 'material', value: 6, icon: 0xcc4466 },

  // Cooked / Crafted
  food_bread: { id: 'food_bread', name: 'Fresh Bread', category: 'food', value: 20, icon: 0xddbb66 },
  food_pie: { id: 'food_pie', name: 'Berry Pie', category: 'food', value: 45, icon: 0xcc6688 },
  food_stew: { id: 'food_stew', name: 'Hearty Stew', category: 'food', value: 55, icon: 0xbb8844 },
  potion_heal: { id: 'potion_heal', name: 'Healing Potion', category: 'food', value: 35, icon: 0xff6666 },

  // Special
  book: { id: 'book', name: 'Ancient Tome', category: 'gift', value: 100, icon: 0x8866aa },
  dreamlight: { id: 'dreamlight', name: 'Dreamlight Shard', category: 'gem', value: 200, icon: 0xffddaa },
};

// Shop inventory (what can be bought)
export const SHOP_ITEMS = [
  { itemId: 'seed_wheat', price: 10, stock: 99 },
  { itemId: 'seed_carrot', price: 15, stock: 99 },
  { itemId: 'seed_pumpkin', price: 30, stock: 99 },
  { itemId: 'seed_starberry', price: 50, stock: 10 },
  { itemId: 'seed_moonflower', price: 80, stock: 5 },
  { itemId: 'wood', price: 5, stock: 99 },
  { itemId: 'stone', price: 5, stock: 99 },
];
