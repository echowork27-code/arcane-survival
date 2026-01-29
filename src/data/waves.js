export const WAVES = [
  { wave: 1, intro: "Shadow Wisps emerge from the void...", enemies: [{ type: 'wisp', count: 5, delay: 1000 }], spawnInterval: 2000 },
  { wave: 2, intro: "More shadows gather. Stay vigilant.", enemies: [{ type: 'wisp', count: 8, delay: 800 }], spawnInterval: 1500 },
  { wave: 3, intro: "Corrupted Knights rise \u2014 once protectors, now cursed", enemies: [{ type: 'wisp', count: 4, delay: 1000 }, { type: 'knight', count: 2, delay: 2000 }], spawnInterval: 1800 },
  { wave: 4, intro: "The corruption spreads. Dark forces converge.", enemies: [{ type: 'wisp', count: 6, delay: 800 }, { type: 'knight', count: 3, delay: 1500 }], spawnInterval: 1500 },
  { wave: 5, intro: "The Wraith Lord sends his hunters...", enemies: [{ type: 'wisp', count: 4, delay: 1000 }, { type: 'knight', count: 2, delay: 1500 }, { type: 'wraith', count: 3, delay: 2000 }], spawnInterval: 1400 },
  { wave: 6, intro: "An ancient evil stirs. Prepare yourself!", enemies: [{ type: 'wisp', count: 8, delay: 600 }, { type: 'wraith', count: 4, delay: 1000 }], spawnInterval: 1200 },
  { wave: 7, intro: "The wards weaken further. Hold fast!", enemies: [{ type: 'knight', count: 5, delay: 1200 }, { type: 'wraith', count: 5, delay: 1000 }], spawnInterval: 1100 },
  { wave: 8, intro: "Shadows multiply. The void hungers.", enemies: [{ type: 'wisp', count: 10, delay: 500 }, { type: 'knight', count: 3, delay: 1500 }, { type: 'wraith', count: 4, delay: 1200 }], spawnInterval: 1000 },
  { wave: 9, intro: "Something powerful approaches...", enemies: [{ type: 'wisp', count: 6, delay: 800 }, { type: 'knight', count: 4, delay: 1200 }, { type: 'wraith', count: 6, delay: 1000 }], spawnInterval: 900 },
  { wave: 10, intro: "THE SHADOW SOVEREIGN AWAKENS!", isBoss: true, bossName: "Shadow Sovereign", bossLore: "Once the High Protector, corrupted by forbidden magic.", enemies: [{ type: 'boss', count: 1, delay: 0 }, { type: 'wisp', count: 4, delay: 3000 }], spawnInterval: 2000 },
];

export function generateEndlessWave(waveNumber) {
  const difficulty = Math.floor((waveNumber - 10) / 5) + 1;
  const baseEnemies = 5 + difficulty * 2;
  const enemies = [
    { type: 'wisp', count: baseEnemies, delay: 500 },
    { type: 'knight', count: Math.floor(baseEnemies * 0.4), delay: 1000 },
    { type: 'wraith', count: Math.floor(baseEnemies * 0.3), delay: 800 },
  ];
  if (waveNumber % 5 === 0) enemies.push({ type: 'boss', count: 1, delay: 0 });
  return {
    wave: waveNumber,
    intro: "Wave " + waveNumber + ": The darkness intensifies...",
    enemies,
    spawnInterval: Math.max(600, 1000 - difficulty * 50),
    isBoss: waveNumber % 5 === 0,
  };
}

export function getWave(waveNumber) {
  if (waveNumber <= WAVES.length) return WAVES[waveNumber - 1];
  return generateEndlessWave(waveNumber);
}
