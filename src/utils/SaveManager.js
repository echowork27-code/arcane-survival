// Save/Load Manager using localStorage
const SAVE_KEY = 'dreamlight_valley_save';

export function getDefaultSave() {
  return {
    version: 1,
    coins: 200,
    xp: 0,
    level: 1,
    inventory: {
      seed_wheat: 10,
      seed_carrot: 5,
      wood: 20,
      stone: 15,
    },
    buildings: [],
    crops: [],
    friendship: {
      luna: 0,
      bramble: 0,
      ember: 0,
      coral: 0,
      flint: 0,
      sage: 0,
      willow: 0,
      pip: 0,
    },
    questsCompleted: [],
    questsActive: ['main_welcome'],
    questProgress: {},
    talkedToday: [],
    dailyTasks: [],
    dailyDate: null,
    dayTime: 0,
    totalPlayTime: 0,
    lastSaveTime: Date.now(),
    stats: {
      cropsHarvested: 0,
      fishCaught: 0,
      rocksSmashed: 0,
      buildingsPlaced: 0,
      questsCompleted: 0,
      giftsGiven: 0,
      npcsTalkedTo: 0,
    }
  };
}

export function saveGame(data) {
  try {
    data.lastSaveTime = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Save failed:', e);
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return getDefaultSave();
    const data = JSON.parse(raw);
    // Merge with defaults to handle new fields
    const defaults = getDefaultSave();
    return deepMerge(defaults, data);
  } catch (e) {
    console.error('Load failed:', e);
    return getDefaultSave();
  }
}

export function resetGame() {
  localStorage.removeItem(SAVE_KEY);
  return getDefaultSave();
}

function deepMerge(target, source) {
  const output = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

// Helper: add item to inventory
export function addItem(save, itemId, count = 1) {
  if (!save.inventory[itemId]) save.inventory[itemId] = 0;
  save.inventory[itemId] += count;
}

// Helper: remove item from inventory
export function removeItem(save, itemId, count = 1) {
  if (!save.inventory[itemId]) return false;
  if (save.inventory[itemId] < count) return false;
  save.inventory[itemId] -= count;
  if (save.inventory[itemId] <= 0) delete save.inventory[itemId];
  return true;
}

// Helper: check if has items
export function hasItem(save, itemId, count = 1) {
  return (save.inventory[itemId] || 0) >= count;
}

// Helper: add coins
export function addCoins(save, amount) {
  save.coins += amount;
}

// Helper: spend coins
export function spendCoins(save, amount) {
  if (save.coins < amount) return false;
  save.coins -= amount;
  return true;
}
