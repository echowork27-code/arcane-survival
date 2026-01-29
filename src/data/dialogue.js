export const INTRO_NARRATIVE = {
  lines: [
    "You are the last apprentice of the Arcane Order.",
    "Dark creatures have breached the ancient wards.",
    "The elders have fallen. Only you remain.",
    "Survive. Grow stronger. Reclaim what was lost.",
  ],
  typingSpeed: 50,
  linePause: 1500,
};

export const MENTOR_TIPS = {
  waveComplete: [
    "Well done, apprentice. But do not grow complacent...",
    "The darkness tests you. Stand firm.",
    "I sense powerful magic within you. Unleash it!",
    "You fight with growing skill. The Order would be proud.",
    "Rest while you can. Greater challenges await.",
    "Your enemies grow stronger. So must you.",
    "The wards flicker with each wave. Time is against us.",
    "Remember your training. Center yourself.",
    "The Void fears your potential. Show it why.",
    "Every shadow you banish brings hope to this world.",
  ],
  newSpell: {
    fire: "Ignis! The flames answer your call. Use them wisely.",
    ice: "Glacius awakens within you. Let it slow your foes.",
    lightning: "Fulmen! Few can wield such power. You are chosen.",
  },
  lowHealth: [
    "Careful, apprentice! Your life force wanes.",
    "The shadows sense your weakness. Stay alert!",
    "Retreat and recover. There is no shame in caution.",
  ],
  bossAppearing: [
    "I sense a great evil approaching...",
    "Steel yourself! A champion of darkness comes!",
    "This creature... I remember when it was one of us...",
  ],
  bossDefeated: [
    "Magnificent! You have struck a blow against the Void!",
    "The shadow lord falls! But more will come...",
    "Victory! But savor it briefly\u2014darkness never rests.",
  ],
};

export const DEATH_MESSAGES = {
  primary: "The shadows consume you...",
  secondary: "But true mages never fall forever.",
  tertiary: "Rise again.",
};

export const WAVE_INTROS = {
  1: "Shadow Wisps emerge from the void...",
  2: "More shadows gather. Stay vigilant, apprentice.",
  3: "Corrupted Knights rise \u2014 once protectors, now cursed",
  4: "The corruption spreads. Dark forces converge.",
  5: "The Wraith Lord sends his hunters...",
  6: "An ancient evil stirs. Prepare yourself!",
  7: "The wards weaken further. Hold fast!",
  8: "Shadows multiply. The void hungers.",
  9: "Something powerful approaches...",
  10: "THE SHADOW SOVEREIGN AWAKENS!",
};

export const UI_TEXT = {
  menu: {
    title: "ARCANE SURVIVAL",
    subtitle: "Last Stand of the Order",
    play: "Begin Trial",
    codex: "Codex",
    settings: "Settings",
    highScore: "Highest Score",
  },
  game: {
    wave: "Wave", score: "Score", health: "Life",
    combo: "Combo", pause: "Paused", resume: "Continue", quit: "Abandon",
  },
  gameOver: {
    title: "FALLEN",
    score: "Final Score",
    wave: "Wave Reached",
    kills: "Enemies Vanquished",
    newHigh: "NEW RECORD!",
    retry: "Rise Again",
    menu: "Return",
  },
  codex: {
    title: "CODEX",
    locked: "???",
    lockedHint: "Continue your journey to unlock",
    back: "Return",
    empty: "No entries yet. Survive to uncover secrets.",
  },
};

export function getRandomTip(category) {
  const tips = MENTOR_TIPS[category];
  if (!tips || tips.length === 0) return null;
  return tips[Math.floor(Math.random() * tips.length)];
}

export function getWaveIntro(wave) {
  return WAVE_INTROS[wave] || "Wave " + wave + ": The darkness intensifies...";
}
