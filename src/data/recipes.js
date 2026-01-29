// Crafting Recipes
export const RECIPES = {
  food_bread: {
    id: 'food_bread',
    name: 'Fresh Bread',
    station: 'bakery',
    ingredients: { wheat: 3 },
    result: { id: 'food_bread', count: 1 },
    unlockFriendship: { ember: 0 },
  },
  food_pie: {
    id: 'food_pie',
    name: 'Berry Pie',
    station: 'bakery',
    ingredients: { wheat: 2, berry: 3 },
    result: { id: 'food_pie', count: 1 },
    unlockFriendship: { ember: 3 },
  },
  food_stew: {
    id: 'food_stew',
    name: 'Hearty Stew',
    station: 'bakery',
    ingredients: { carrot: 2, mushroom: 2, herb: 1 },
    result: { id: 'food_stew', count: 1 },
    unlockFriendship: { ember: 6 },
  },
  potion_heal: {
    id: 'potion_heal',
    name: 'Healing Potion',
    station: 'blacksmith',
    ingredients: { herb: 3, moonflower: 1 },
    result: { id: 'potion_heal', count: 1 },
    unlockFriendship: { luna: 3 },
  },
  iron_refined: {
    id: 'iron_refined',
    name: 'Refined Iron',
    station: 'blacksmith',
    ingredients: { iron: 3, stone: 2 },
    result: { id: 'iron', count: 5 },
    unlockFriendship: { flint: 0 },
  },
};
