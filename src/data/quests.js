// Quest Definitions
export const QUESTS = {
  // Main story quests
  main_welcome: {
    id: 'main_welcome',
    type: 'main',
    title: 'Welcome to the Valley',
    description: 'Talk to Luna to learn about the valley.',
    objectives: [
      { type: 'talk', target: 'luna', count: 1, text: 'Talk to Luna' }
    ],
    rewards: { coins: 50, items: { seed_wheat: 5 } },
    next: 'main_first_crop'
  },
  main_first_crop: {
    id: 'main_first_crop',
    type: 'main',
    title: 'Green Thumb',
    description: 'Plant and harvest your first crop.',
    objectives: [
      { type: 'harvest', target: 'any', count: 1, text: 'Harvest a crop' }
    ],
    rewards: { coins: 100, items: { seed_carrot: 5 } },
    next: 'main_meet_all'
  },
  main_meet_all: {
    id: 'main_meet_all',
    type: 'main',
    title: 'Meet the Neighbors',
    description: 'Introduce yourself to all valley residents.',
    objectives: [
      { type: 'talk', target: 'bramble', count: 1, text: 'Talk to Bramble' },
      { type: 'talk', target: 'ember', count: 1, text: 'Talk to Ember' },
      { type: 'talk', target: 'coral', count: 1, text: 'Talk to Coral' },
      { type: 'talk', target: 'flint', count: 1, text: 'Talk to Flint' },
      { type: 'talk', target: 'sage', count: 1, text: 'Talk to Sage' },
    ],
    rewards: { coins: 200, items: { wood: 20, stone: 15 } },
    next: 'main_first_building'
  },
  main_first_building: {
    id: 'main_first_building',
    type: 'main',
    title: 'Home Sweet Home',
    description: 'Build your first cottage in the village.',
    objectives: [
      { type: 'build', target: 'cottage', count: 1, text: 'Build a Cottage' }
    ],
    rewards: { coins: 300, items: { iron: 10 } },
    next: 'main_fishing'
  },
  main_fishing: {
    id: 'main_fishing',
    type: 'main',
    title: 'Gone Fishing',
    description: 'Visit Coral at the lake and catch your first fish.',
    objectives: [
      { type: 'talk', target: 'coral', count: 1, text: 'Talk to Coral' },
      { type: 'fish', target: 'any', count: 1, text: 'Catch a fish' },
    ],
    rewards: { coins: 150, items: { seed_starberry: 3 } },
    next: 'main_mining'
  },
  main_mining: {
    id: 'main_mining',
    type: 'main',
    title: 'Dig Deep',
    description: 'Visit Flint at the mine and gather some ore.',
    objectives: [
      { type: 'talk', target: 'flint', count: 1, text: 'Talk to Flint' },
      { type: 'mine', target: 'any', count: 3, text: 'Mine 3 rocks' },
    ],
    rewards: { coins: 200, items: { crystal: 3 } },
    next: null
  },

  // Character quests
  char_bramble_garden: {
    id: 'char_bramble_garden',
    type: 'character',
    character: 'bramble',
    friendshipReq: 3,
    title: 'Bramble\'s Garden Challenge',
    description: 'Bramble wants you to prove your farming skills.',
    objectives: [
      { type: 'harvest', target: 'wheat', count: 5, text: 'Harvest 5 wheat' },
      { type: 'harvest', target: 'carrot', count: 3, text: 'Harvest 3 carrots' },
    ],
    rewards: { coins: 200, items: { seed_pumpkin: 5 }, friendship: { bramble: 2 } },
  },
  char_ember_bake: {
    id: 'char_ember_bake',
    type: 'character',
    character: 'ember',
    friendshipReq: 3,
    title: 'Ember\'s Special Order',
    description: 'Ember needs ingredients for a new recipe!',
    objectives: [
      { type: 'collect', target: 'wheat', count: 10, text: 'Gather 10 wheat' },
      { type: 'collect', target: 'starberry', count: 3, text: 'Gather 3 starberries' },
    ],
    rewards: { coins: 350, items: { food_pie: 3 }, friendship: { ember: 2 } },
  },
  char_coral_fish: {
    id: 'char_coral_fish',
    type: 'character',
    character: 'coral',
    friendshipReq: 3,
    title: 'Coral\'s Fish Collection',
    description: 'Coral wants to study different fish species.',
    objectives: [
      { type: 'fish', target: 'any', count: 5, text: 'Catch 5 fish' },
    ],
    rewards: { coins: 250, items: { crystal: 5 }, friendship: { coral: 2 } },
  },
  char_flint_ore: {
    id: 'char_flint_ore',
    type: 'character',
    character: 'flint',
    friendshipReq: 3,
    title: 'Flint\'s Iron Rush',
    description: 'Flint needs iron for an important project.',
    objectives: [
      { type: 'mine', target: 'any', count: 10, text: 'Mine 10 rocks' },
    ],
    rewards: { coins: 300, items: { iron: 15, amethyst: 2 }, friendship: { flint: 2 } },
  },
};

// Daily tasks template - generated fresh each day
export const DAILY_TASKS = [
  { type: 'harvest', target: 'any', count: 5, text: 'Harvest 5 crops', reward: { coins: 50 } },
  { type: 'fish', target: 'any', count: 2, text: 'Catch 2 fish', reward: { coins: 40 } },
  { type: 'talk', target: 'any', count: 3, text: 'Talk to 3 NPCs', reward: { coins: 30 } },
  { type: 'mine', target: 'any', count: 3, text: 'Mine 3 rocks', reward: { coins: 40 } },
  { type: 'build', target: 'any', count: 1, text: 'Place a building', reward: { coins: 60 } },
];
