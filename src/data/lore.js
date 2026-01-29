// ══════════════════════════════════════════════════
//  LORE & STORY — The World of Arcane Survival
// ══════════════════════════════════════════════════

export const STORY = {
  intro: [
    "In an age forgotten by mortals, the Veil between worlds grew thin...",
    "Dark creatures, once sealed away, now pour through the cracks of reality.",
    "The ancient order of Spellwardens has fallen. Their towers lie in ruin.",
    "You are the last apprentice — untested, unproven, but not without power.",
    "The Arena of Trials awaits. Survive, and prove you are worthy of the light.",
  ],

  death: {
    dramatic: [
      "The shadows consume all...",
      "Darkness claims another soul...",
      "The void whispers your name...",
      "Even stars must fall...",
      "The last light flickers and fades...",
    ],
    encouraging: [
      "But legends never truly fall. Rise again.",
      "Yet the spark within you endures. Return.",
      "Death is but a door. Step through once more.",
      "The prophecy demands your return. Fight again.",
      "Your story is not yet written. Try once more.",
    ],
  },
};

export const MENTOR_DIALOGUE = {
  // Between waves
  waveComplete: {
    1: "Well done, young one. But do not grow complacent — darker forces stir.",
    2: "You show promise. The old masters would have been proud.",
    3: "Shadow Wraiths approach! They were once noble guards, corrupted by the Veil's darkness.",
    4: "Your magic grows stronger. But so does the darkness that hunts you.",
    5: "A Voidcaller has been sighted. These sorcerers tore the Veil open long ago...",
    6: "Few apprentices survive this long. You carry the light well.",
    7: "The creatures grow bolder. They sense the Veil weakening further.",
    8: "I sense an ancient presence stirring... a Keeper of the Deep.",
    9: "You fight like a true Spellwarden now. The order would welcome you.",
    10: "Beyond this wave lies a power few have ever witnessed. Steel yourself.",
  },
  // Generic for waves > 10
  generic: [
    "The darkness never rests. Neither must you.",
    "Each creature you fell mends a thread of the Veil.",
    "Your light burns bright. Let it guide your blade.",
    "The ancient ones watch. Do not disappoint them.",
    "Remember your training. Breathe. Focus. Strike.",
    "These beasts fear your growing power. Use that.",
    "The Veil grows thinner with each passing moment...",
  ],
  // Tips shown alongside dialogue
  tips: [
    "Collect shield runes — they absorb one deadly blow.",
    "Speed enchantments last five seconds. Use them wisely.",
    "Wraiths are fast but fragile. Prioritize them.",
    "Golems move slowly but hit devastatingly hard.",
    "Power runes double your damage briefly. Save them for bosses.",
    "Stay near the arena center — corners are death traps.",
    "Your attacks auto-aim at the nearest threat.",
    "Keep moving. A still mage is a dead mage.",
  ],
};

export const WAVE_LORE = {
  1: { name: "The Awakening", desc: "Corrupted spirits stir in the shadows, drawn to your light." },
  2: { name: "Gathering Storm", desc: "More creatures emerge from the Veil. They sense fresh prey." },
  3: { name: "Shadow Wraiths", desc: "Once noble Spellwarden guards, twisted by dark enchantments." },
  4: { name: "Growing Darkness", desc: "The Veil tears wider. Stronger beasts claw their way through." },
  5: { name: "The Voidcaller", desc: "A dark sorcerer who first tore the Veil. Defeat them or perish.", boss: true },
  6: { name: "Echoes of the Fallen", desc: "The souls of defeated Spellwardens, now slaves to darkness." },
  7: { name: "Crimson Tide", desc: "Blood magic corrupts the very ground beneath your feet." },
  8: { name: "The Deep Stirs", desc: "Ancient entities older than the Veil itself begin to notice you." },
  9: { name: "Spellwarden's Trial", desc: "The final test of the old order. Only the worthy survive." },
  10: { name: "Keeper of the Abyss", desc: "The source of corruption. End this — or be consumed forever.", boss: true },
};

// Codex entries unlocked by milestones
export const CODEX_ENTRIES = [
  {
    id: "origin",
    title: "Chapter I: The Last Apprentice",
    requirement: { type: "waves", value: 3 },
    text: "You were found as a child at the gates of the Spellwarden Tower, wrapped in cloth woven with protective sigils. The masters took you in, sensing an unusual resonance with the arcane. But before your training was complete, the Veil shattered. The masters fell. You alone remained.",
  },
  {
    id: "veil",
    title: "Chapter II: The Shattered Veil",
    requirement: { type: "waves", value: 5 },
    text: "The Veil was a great barrier between the mortal realm and the Void — a prison for ancient horrors. Three centuries ago, a cabal of dark sorcerers called the Voidcallers attempted to harness its power. They failed, and in failing, cracked it open. Now those cracks have become chasms.",
  },
  {
    id: "wraiths",
    title: "Chapter III: The Fallen Guards",
    requirement: { type: "kills", value: 50 },
    text: "The Shadow Wraiths were once the elite guard of the Spellwarden Order — warriors of impeccable honor. When the Veil shattered, the dark energy twisted their minds and bodies. They now serve the very darkness they once swore to destroy. Some say on quiet nights, you can still hear them weeping.",
  },
  {
    id: "golems",
    title: "Chapter IV: Stone and Sorrow",
    requirement: { type: "kills", value: 100 },
    text: "Void Golems are not truly alive. They are vessels — empty suits of enchanted stone animated by trapped souls. Each one destroyed releases a spirit back to peace. In a way, every golem you shatter is a mercy. Remember that when their fists crash down around you.",
  },
  {
    id: "arena",
    title: "Chapter V: The Arena of Trials",
    requirement: { type: "waves", value: 8 },
    text: "The Arena of Trials was the final test for every Spellwarden apprentice. Those who survived earned their cloak and staff. Those who fell were honored in the Hall of Echoes. The arena itself is alive — ancient magic courses through its stones, amplifying both light and darkness within its bounds.",
  },
  {
    id: "prophecy",
    title: "Chapter VI: The Prophecy",
    requirement: { type: "waves", value: 10 },
    text: "An ancient prophecy speaks of the Last Light — a mage who would stand alone against the darkness when all others had fallen. 'When the Veil is torn and the towers crumble, one shall rise from the ashes. Not the strongest, not the wisest, but the one who refuses to yield.' Perhaps that is you.",
  },
  {
    id: "beyond",
    title: "Chapter VII: Beyond the Abyss",
    requirement: { type: "score", value: 2000 },
    text: "Beyond the Keeper of the Abyss lies something even the Voidcallers feared to name. It is patient. It is watching. And with each creature that falls in the arena, it grows curious about the mortal who dares resist. Your survival is no longer just a test — it is a beacon. And beacons attract attention from the deep...",
  },
];

export const ENEMY_NAMES = {
  basic: [
    "Shade Crawler", "Veil Wisp", "Corrupted Spirit",
    "Dark Remnant", "Shadow Tendril", "Gloom Stalker",
  ],
  fast: [
    "Shadow Wraith", "Phantom Striker", "Spectral Assassin",
    "Veil Dancer", "Night Whisper", "Ghost Fang",
  ],
  tank: [
    "Void Golem", "Stone Guardian", "Abyssal Sentinel",
    "Dark Colossus", "Runed Monolith", "Dread Warden",
  ],
  boss: [
    "Malachar the Voidcaller",
    "Seraphel the Fallen",
    "Keeper of the Abyss",
    "The Hollow King",
    "Thornweaver",
  ],
};

export default {
  STORY,
  MENTOR_DIALOGUE,
  WAVE_LORE,
  CODEX_ENTRIES,
  ENEMY_NAMES,
};
