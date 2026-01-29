// WorldScene — Main game world
import { TILE_SIZE, MAP_COLS, MAP_ROWS, WORLD_W, WORLD_H, GAME_W, GAME_H, COLORS, ZONES, PLAYER_START, PLAYER_SPEED, DAY_DURATION } from '../config.js';
import { CHARACTERS, getDialogue } from '../data/characters.js';
import { BUILDINGS } from '../data/buildings.js';
import { ITEMS } from '../data/items.js';
import { QUESTS, DAILY_TASKS } from '../data/quests.js';
import { GridManager } from '../utils/GridManager.js';
import { loadGame, saveGame, addItem, removeItem, hasItem, addCoins, spendCoins } from '../utils/SaveManager.js';
import { hapticFeedback, getUserName } from '../utils/telegram.js';

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  create() {
    this.save = loadGame();
    this.gridMgr = new GridManager();
    this.dayTime = this.save.dayTime || 0;
    this.buildMode = false;
    this.selectedBuilding = null;

    // Generate map
    this.generateMap();

    // Create layers
    this.groundLayer = this.add.group();
    this.objectLayer = this.add.group();
    this.entityLayer = this.add.group();
    this.uiLayer = this.add.group();

    // Render map
    this.renderMap();

    // Create player
    this.createPlayer();

    // Create NPCs
    this.npcs = {};
    this.createNPCs();

    // Restore buildings
    this.buildings = [];
    this.restoreBuildings();

    // Restore crops
    this.crops = [];
    this.restoreCrops();

    // Place interactable objects
    this.createInteractables();

    // Camera
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);

    // Day/night overlay
    this.dayOverlay = this.add.rectangle(WORLD_W/2, WORLD_H/2, WORLD_W, WORLD_H, 0x000033, 0)
      .setScrollFactor(0.01)
      .setDepth(900);

    // Input
    this.setupInput();

    // HUD
    this.createHUD();

    // Particles
    this.createParticles();

    // Check daily tasks
    this.checkDailyTasks();

    // Auto-save timer
    this.time.addEvent({
      delay: 30000,
      callback: () => this.doSave(),
      loop: true
    });

    // Fade in
    this.cameras.main.fadeIn(500);

    // Start initial quest dialog if new game
    if (this.save.questsActive.includes('main_welcome') && !this.save.questsCompleted.includes('main_welcome')) {
      this.time.delayedCall(1000, () => {
        this.showNotification('Welcome to Dreamlight Valley! 🌿\nTalk to Luna to begin!');
      });
    }
  }

  // ═══════════════════════════════════════
  // MAP GENERATION
  // ═══════════════════════════════════════

  generateMap() {
    this.mapData = [];
    for (let y = 0; y < MAP_ROWS; y++) {
      this.mapData[y] = [];
      for (let x = 0; x < MAP_COLS; x++) {
        this.mapData[y][x] = this.getTileType(x, y);
      }
    }
  }

  getTileType(x, y) {
    // Water — lake area
    const lz = ZONES.lake;
    if (x >= lz.x && x < lz.x + lz.w && y >= lz.y && y < lz.y + lz.h) {
      // Organic lake shape using distance from center
      const cx = lz.x + lz.w / 2, cy = lz.y + lz.h / 2;
      const dx = (x - cx) / (lz.w / 2), dy = (y - cy) / (lz.h / 2);
      const dist = dx * dx + dy * dy;
      if (dist < 0.7) {
        this.gridMgr.setTile(x, y, 4);
        return 'water';
      }
      if (dist < 0.85) return 'sand';
    }

    // Mine area — stone
    const mz = ZONES.mine;
    if (x >= mz.x && x < mz.x + mz.w && y >= mz.y && y < mz.y + mz.h) {
      if ((x + y) % 7 === 0 || (x * y + x) % 11 === 0) {
        this.gridMgr.setTile(x, y, 1);
        return 'stone_obj';
      }
      return 'stone';
    }

    // Farm area — dirt
    const fz = ZONES.farm;
    if (x >= fz.x && x < fz.x + fz.w && y >= fz.y && y < fz.y + fz.h) {
      return 'dirt';
    }

    // Forest area — grass with trees
    const forz = ZONES.forest;
    if (x >= forz.x && x < forz.x + forz.w && y >= forz.y && y < forz.y + forz.h) {
      if ((x * 7 + y * 13) % 5 === 0) {
        this.gridMgr.setTile(x, y, 1);
        return 'tree';
      }
      if ((x * 3 + y * 11) % 9 === 0) {
        return 'bush_tile';
      }
      return 'grass';
    }

    // Village center — paths
    const vz = ZONES.village;
    if (x >= vz.x && x < vz.x + vz.w && y >= vz.y && y < vz.y + vz.h) {
      // Main paths through village
      if (x === vz.x + Math.floor(vz.w / 2) || y === vz.y + Math.floor(vz.h / 2)) {
        this.gridMgr.setTile(x, y, 5);
        return 'path';
      }
      // Plaza area (center)
      if (Math.abs(x - (vz.x + vz.w / 2)) <= 2 && Math.abs(y - (vz.y + vz.h / 2)) <= 2) {
        this.gridMgr.setTile(x, y, 5);
        return 'path';
      }
      return 'grass';
    }

    // Connecting paths
    if (y === 20 && x >= 16 && x < 35) {
      this.gridMgr.setTile(x, y, 5);
      return 'path';
    }
    if (x === 25 && y >= 12 && y < 32) {
      this.gridMgr.setTile(x, y, 5);
      return 'path';
    }
    // Path to mine
    if (x === 16 && y >= 4 && y < 20) {
      this.gridMgr.setTile(x, y, 5);
      return 'path';
    }
    // Path to forest
    if (y === 12 && x >= 25 && x < 35) {
      this.gridMgr.setTile(x, y, 5);
      return 'path';
    }

    // Edges: border grass
    return 'grass';
  }

  renderMap() {
    for (let y = 0; y < MAP_ROWS; y++) {
      for (let x = 0; x < MAP_COLS; x++) {
        const type = this.mapData[y][x];
        const wx = x * TILE_SIZE + TILE_SIZE / 2;
        const wy = y * TILE_SIZE + TILE_SIZE / 2;

        let tileKey = 'tile_grass1';
        switch (type) {
          case 'grass':
            tileKey = ['tile_grass1', 'tile_grass2', 'tile_grass3'][(x + y) % 3];
            break;
          case 'path': tileKey = 'tile_path'; break;
          case 'dirt': tileKey = 'tile_dirt'; break;
          case 'water': tileKey = 'tile_water'; break;
          case 'stone': tileKey = 'tile_stone'; break;
          case 'sand': tileKey = 'tile_sand'; break;
          case 'stone_obj': tileKey = 'tile_stone'; break;
          case 'tree': tileKey = ['tile_grass1', 'tile_grass2'][(x + y) % 2]; break;
          case 'bush_tile': tileKey = ['tile_grass1', 'tile_grass3'][(x + y) % 2]; break;
        }

        const tile = this.add.image(wx, wy, tileKey).setDepth(0);
        this.groundLayer.add(tile);

        // Add nature objects on top
        if (type === 'tree') {
          const tree = this.add.image(wx, wy - 16, ['tree1', 'tree2', 'tree3'][(x * y) % 3])
            .setDepth(wy);
          this.objectLayer.add(tree);
        }
        if (type === 'bush_tile') {
          const bush = this.add.image(wx, wy, ['bush1', 'bush2'][(x + y) % 2])
            .setDepth(wy);
          this.objectLayer.add(bush);
        }
        if (type === 'stone_obj') {
          const rock = this.add.image(wx, wy, ['rock1', 'rock2'][(x + y) % 2])
            .setDepth(wy);
          this.objectLayer.add(rock);
        }

        // Random flowers on grass
        if (type === 'grass' && (x * 17 + y * 31) % 23 === 0) {
          const flowerKeys = ['flower_pink', 'flower_yellow', 'flower_purple', 'flower_blue'];
          const f = this.add.image(wx + Phaser.Math.Between(-8, 8), wy + Phaser.Math.Between(-4, 4),
            flowerKeys[(x + y) % flowerKeys.length])
            .setDepth(1)
            .setScale(0.8);
          this.objectLayer.add(f);
        }
      }
    }
  }

  // ═══════════════════════════════════════
  // PLAYER
  // ═══════════════════════════════════════

  createPlayer() {
    const pos = this.gridMgr.tileToWorld(PLAYER_START.x, PLAYER_START.y);
    this.player = this.add.image(pos.x, pos.y, 'player')
      .setDepth(1000)
      .setScale(1.2);
    this.playerTarget = null;
    this.playerMoving = false;
  }

  movePlayerTo(worldX, worldY) {
    // Clamp to world bounds
    worldX = Phaser.Math.Clamp(worldX, TILE_SIZE, WORLD_W - TILE_SIZE);
    worldY = Phaser.Math.Clamp(worldY, TILE_SIZE, WORLD_H - TILE_SIZE);

    const tile = this.gridMgr.worldToTile(worldX, worldY);
    if (!this.gridMgr.isWalkable(tile.x, tile.y)) {
      // Try to find nearest walkable tile
      for (let r = 1; r <= 3; r++) {
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (this.gridMgr.isWalkable(tile.x + dx, tile.y + dy)) {
              const p = this.gridMgr.tileToWorld(tile.x + dx, tile.y + dy);
              worldX = p.x;
              worldY = p.y;
              dy = r + 1; dx = r + 1; r = 4;
              break;
            }
          }
        }
      }
    }

    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, worldX, worldY);
    const duration = (dist / PLAYER_SPEED) * 1000;

    this.playerMoving = true;
    this.playerTarget = { x: worldX, y: worldY };

    // Flip sprite based on direction
    if (worldX < this.player.x) this.player.setFlipX(true);
    else if (worldX > this.player.x) this.player.setFlipX(false);

    // Walking bounce
    if (this.walkTween) this.walkTween.stop();
    this.walkTween = this.tweens.add({
      targets: this.player,
      scaleY: { from: 1.2, to: 1.1 },
      duration: 150,
      yoyo: true,
      repeat: Math.floor(duration / 300),
    });

    if (this.moveTween) this.moveTween.stop();
    this.moveTween = this.tweens.add({
      targets: this.player,
      x: worldX,
      y: worldY,
      duration: Math.max(200, duration),
      ease: 'Power1',
      onUpdate: () => {
        this.player.setDepth(this.player.y + 16);
      },
      onComplete: () => {
        this.playerMoving = false;
        this.player.setScale(1.2);
        this.checkPlayerInteraction();
      }
    });
  }

  checkPlayerInteraction() {
    const pTile = this.gridMgr.worldToTile(this.player.x, this.player.y);

    // Check NPC proximity
    for (const [id, npc] of Object.entries(this.npcs)) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.sprite.x, npc.sprite.y);
      if (dist < 50) {
        this.showInteractionPrompt(npc);
        return;
      }
    }

    // Check crop interaction
    for (const crop of this.crops) {
      if (crop.tileX === pTile.x && crop.tileY === pTile.y) {
        if (crop.stage >= 3) {
          this.harvestCrop(crop);
          return;
        } else if (!crop.watered) {
          this.waterCrop(crop);
          return;
        }
      }
    }

    // Check farm area — can plant
    if (this.isInZone(pTile.x, pTile.y, 'farm')) {
      const hasCrop = this.crops.some(c => c.tileX === pTile.x && c.tileY === pTile.y);
      if (!hasCrop && this.mapData[pTile.y]?.[pTile.x] === 'dirt') {
        this.showPlantPrompt(pTile.x, pTile.y);
      }
    }

    // Check lake area — fishing
    if (this.isNearZone(pTile.x, pTile.y, 'lake', 2)) {
      this.showFishingPrompt();
    }

    // Check mine area — mining
    if (this.isInZone(pTile.x, pTile.y, 'mine')) {
      this.showMiningPrompt();
    }

    // Check forest — foraging
    if (this.isInZone(pTile.x, pTile.y, 'forest')) {
      if (Math.random() < 0.3) {
        this.forage();
      }
    }
  }

  isInZone(tx, ty, zoneName) {
    const z = ZONES[zoneName];
    return tx >= z.x && tx < z.x + z.w && ty >= z.y && ty < z.y + z.h;
  }

  isNearZone(tx, ty, zoneName, range) {
    const z = ZONES[zoneName];
    return tx >= z.x - range && tx < z.x + z.w + range &&
           ty >= z.y - range && ty < z.y + z.h + range;
  }

  // ═══════════════════════════════════════
  // NPCs
  // ═══════════════════════════════════════

  createNPCs() {
    for (const [id, char] of Object.entries(CHARACTERS)) {
      const pos = this.gridMgr.tileToWorld(char.tileX, char.tileY);
      const sprite = this.add.image(pos.x, pos.y, `npc_${id}`)
        .setDepth(pos.y + 16)
        .setScale(1.2);

      // Name tag
      const nameTag = this.add.text(pos.x, pos.y - 28, char.name, {
        fontSize: '10px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        backgroundColor: '#00000066',
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5).setDepth(pos.y + 17);

      // Friendship hearts
      const hearts = this.add.text(pos.x, pos.y - 40, '', {
        fontSize: '8px',
      }).setOrigin(0.5).setDepth(pos.y + 17);
      this.updateNPCHearts(id, hearts);

      // Idle animation
      this.tweens.add({
        targets: [sprite],
        y: pos.y - 3,
        duration: 2000 + Phaser.Math.Between(-300, 300),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Mark tile as blocked
      this.gridMgr.setTile(char.tileX, char.tileY, 1);

      this.npcs[id] = { sprite, nameTag, hearts, data: char };
    }
  }

  updateNPCHearts(npcId, heartsText) {
    const level = this.save.friendship[npcId] || 0;
    let str = '';
    for (let i = 0; i < 10; i++) {
      str += i < level ? '❤️' : '🤍';
    }
    heartsText.setText(str.substring(0, 20)); // Show first 10 hearts
  }

  showInteractionPrompt(npc) {
    if (this.dialogActive) return;

    const charId = npc.data.id;
    const friendship = this.save.friendship[charId] || 0;
    const dialogue = getDialogue(charId, friendship);

    // Track for quests
    if (!this.save.talkedToday) this.save.talkedToday = [];
    if (!this.save.talkedToday.includes(charId)) {
      this.save.talkedToday.push(charId);
      // First talk of day gives friendship
      if (friendship < 10) {
        this.save.friendship[charId] = Math.min(10, friendship + 1);
        this.updateNPCHearts(charId, npc.hearts);
      }
    }

    this.updateQuestProgress('talk', charId);
    this.save.stats.npcsTalkedTo++;

    this.showDialog(npc.data.name, npc.data.title, dialogue, charId);
  }

  // ═══════════════════════════════════════
  // FARMING
  // ═══════════════════════════════════════

  showPlantPrompt(tileX, tileY) {
    if (this.dialogActive) return;

    // Find seeds in inventory
    const seeds = Object.keys(this.save.inventory).filter(k => k.startsWith('seed_'));
    if (seeds.length === 0) {
      this.showNotification('No seeds! Buy some at the shop 🌱');
      return;
    }

    // Show seed selection
    this.showSeedMenu(seeds, tileX, tileY);
  }

  plantCrop(tileX, tileY, seedId) {
    if (!removeItem(this.save, seedId)) return;

    const itemData = ITEMS[seedId];
    const pos = this.gridMgr.tileToWorld(tileX, tileY);

    // Farm plot background
    const plot = this.add.image(pos.x, pos.y, 'farm_plot').setDepth(1);

    const cropType = itemData.crop;
    const crop = {
      tileX, tileY,
      type: cropType,
      stage: 0,
      watered: false,
      plantTime: Date.now(),
      growTime: itemData.growTime,
      sprite: this.add.image(pos.x, pos.y, `crop_${cropType}_0`).setDepth(pos.y + 1),
      plot,
    };

    this.crops.push(crop);
    this.gridMgr.placeCrop(tileX, tileY);

    // Start growth timer
    this.startCropGrowth(crop);

    hapticFeedback('light');
    this.showNotification(`Planted ${ITEMS[cropType]?.name || cropType}! 🌱`);

    this.saveCrops();
  }

  startCropGrowth(crop) {
    const stageTime = crop.growTime / 3;
    const growStage = () => {
      if (crop.stage < 3) {
        crop.stage++;
        crop.watered = false;
        if (crop.sprite && crop.sprite.active) {
          crop.sprite.setTexture(`crop_${crop.type}_${crop.stage}`);
        }
        if (crop.stage >= 3) {
          // Ready to harvest — add sparkle
          if (crop.sprite && crop.sprite.active) {
            this.tweens.add({
              targets: crop.sprite,
              scaleX: { from: 1, to: 1.1 },
              scaleY: { from: 1, to: 1.1 },
              duration: 500,
              yoyo: true,
              repeat: -1,
            });
          }
        } else {
          crop.timer = this.time.delayedCall(stageTime, growStage);
        }
      }
    };
    crop.timer = this.time.delayedCall(stageTime, growStage);
  }

  waterCrop(crop) {
    if (crop.watered) return;
    crop.watered = true;
    hapticFeedback('light');
    this.showNotification('Watered! 💧');

    // Visual feedback
    const pos = this.gridMgr.tileToWorld(crop.tileX, crop.tileY);
    for (let i = 0; i < 5; i++) {
      const drop = this.add.image(
        pos.x + Phaser.Math.Between(-10, 10),
        pos.y - 10,
        'particle_water'
      ).setDepth(2000).setAlpha(0.8);
      this.tweens.add({
        targets: drop,
        y: pos.y + 10,
        alpha: 0,
        duration: 500,
        delay: i * 100,
        onComplete: () => drop.destroy(),
      });
    }
  }

  harvestCrop(crop) {
    hapticFeedback('success');

    const cropItem = ITEMS[crop.type];
    const amount = Phaser.Math.Between(1, 3);
    addItem(this.save, crop.type, amount);
    this.save.stats.cropsHarvested += amount;

    // Update quest progress
    this.updateQuestProgress('harvest', crop.type);

    // Visual feedback
    const pos = this.gridMgr.tileToWorld(crop.tileX, crop.tileY);
    this.showFloatingText(pos.x, pos.y - 20, `+${amount} ${cropItem?.name || crop.type}`, '#44ff44');

    // XP
    this.save.xp += 5;

    // Remove crop
    if (crop.sprite) crop.sprite.destroy();
    if (crop.plot) crop.plot.destroy();
    if (crop.timer) crop.timer.remove();
    this.gridMgr.removeCrop(crop.tileX, crop.tileY);
    this.crops = this.crops.filter(c => c !== crop);

    this.showNotification(`Harvested ${amount}x ${cropItem?.name || crop.type}! 🌾`);
    this.updateHUD();
    this.saveCrops();
  }

  saveCrops() {
    this.save.crops = this.crops.map(c => ({
      tileX: c.tileX, tileY: c.tileY,
      type: c.type, stage: c.stage,
      watered: c.watered,
      plantTime: c.plantTime,
      growTime: c.growTime,
    }));
    this.doSave();
  }

  restoreCrops() {
    if (!this.save.crops) return;
    for (const data of this.save.crops) {
      const pos = this.gridMgr.tileToWorld(data.tileX, data.tileY);
      const plot = this.add.image(pos.x, pos.y, 'farm_plot').setDepth(1);
      const crop = {
        ...data,
        sprite: this.add.image(pos.x, pos.y, `crop_${data.type}_${data.stage}`).setDepth(pos.y + 1),
        plot,
      };
      this.crops.push(crop);
      this.gridMgr.placeCrop(data.tileX, data.tileY);
      if (crop.stage < 3) {
        this.startCropGrowth(crop);
      } else {
        this.tweens.add({
          targets: crop.sprite,
          scaleX: { from: 1, to: 1.1 },
          scaleY: { from: 1, to: 1.1 },
          duration: 500,
          yoyo: true,
          repeat: -1,
        });
      }
    }
  }

  // ═══════════════════════════════════════
  // BUILDINGS
  // ═══════════════════════════════════════

  enterBuildMode() {
    this.buildMode = true;
    this.showBuildMenu();
  }

  exitBuildMode() {
    this.buildMode = false;
    if (this.buildGhost) {
      this.buildGhost.destroy();
      this.buildGhost = null;
    }
    if (this.buildGrid) {
      this.buildGrid.destroy();
      this.buildGrid = null;
    }
    this.closeBuildMenu();
  }

  placeBuilding(buildingId, tileX, tileY) {
    const def = BUILDINGS[buildingId];
    if (!def) return;

    const level = 0;
    const cost = def.levels[level].cost;

    // Check cost
    if (!spendCoins(this.save, cost.coins || 0)) {
      this.showNotification('Not enough coins! 💰');
      hapticFeedback('error');
      return;
    }
    for (const [mat, count] of Object.entries(cost)) {
      if (mat === 'coins') continue;
      if (!hasItem(this.save, mat, count)) {
        addCoins(this.save, cost.coins || 0); // Refund coins
        this.showNotification(`Need ${count} ${ITEMS[mat]?.name || mat}!`);
        hapticFeedback('error');
        return;
      }
    }
    // Deduct materials
    for (const [mat, count] of Object.entries(cost)) {
      if (mat === 'coins') continue;
      removeItem(this.save, mat, count);
    }

    // Check placement
    if (!this.gridMgr.canPlace(tileX, tileY, def.tileW, def.tileH)) {
      addCoins(this.save, cost.coins || 0);
      this.showNotification('Can\'t build here! ❌');
      hapticFeedback('error');
      return;
    }

    this.gridMgr.placeBuilding(tileX, tileY, def.tileW, def.tileH);

    const pos = this.gridMgr.tileToWorld(
      tileX + Math.floor(def.tileW / 2),
      tileY + Math.floor(def.tileH / 2)
    );

    const textureKey = this.getBuildingTexture(buildingId);
    const sprite = this.add.image(pos.x, pos.y, textureKey)
      .setDepth(pos.y + 16);

    // Place animation
    sprite.setScale(0);
    this.tweens.add({
      targets: sprite,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // Sparkle effect
    for (let i = 0; i < 8; i++) {
      const spark = this.add.image(
        pos.x + Phaser.Math.Between(-30, 30),
        pos.y + Phaser.Math.Between(-30, 30),
        'particle_sparkle'
      ).setDepth(2000).setAlpha(0);
      this.tweens.add({
        targets: spark,
        alpha: 1,
        y: spark.y - 20,
        duration: 600,
        delay: i * 80,
        yoyo: true,
        onComplete: () => spark.destroy(),
      });
    }

    const building = {
      id: buildingId,
      tileX, tileY,
      level: 1,
      sprite,
    };
    this.buildings.push(building);
    this.save.buildings.push({
      id: buildingId, tileX, tileY, level: 1,
    });

    this.save.stats.buildingsPlaced++;
    this.updateQuestProgress('build', buildingId);

    hapticFeedback('success');
    this.showNotification(`Built ${def.name}! 🏠`);
    this.updateHUD();
    this.doSave();
  }

  getBuildingTexture(id) {
    const map = {
      cottage: 'building_cottage',
      bakery: 'building_bakery',
      library: 'building_library',
      blacksmith: 'building_blacksmith',
      garden_arch: 'building_arch',
      fountain: 'building_fountain',
      lamp_post: 'building_lamp',
      flower_bed: 'building_flowerbed',
      fence: 'building_fence',
      well: 'building_well',
    };
    return map[id] || 'building_cottage';
  }

  restoreBuildings() {
    if (!this.save.buildings) return;
    for (const data of this.save.buildings) {
      const def = BUILDINGS[data.id];
      if (!def) continue;
      const pos = this.gridMgr.tileToWorld(
        data.tileX + Math.floor(def.tileW / 2),
        data.tileY + Math.floor(def.tileH / 2)
      );
      const textureKey = this.getBuildingTexture(data.id);
      const sprite = this.add.image(pos.x, pos.y, textureKey)
        .setDepth(pos.y + 16);
      this.gridMgr.placeBuilding(data.tileX, data.tileY, def.tileW, def.tileH);
      this.buildings.push({
        id: data.id,
        tileX: data.tileX,
        tileY: data.tileY,
        level: data.level,
        sprite,
      });
    }
  }

  // ═══════════════════════════════════════
  // ACTIVITIES
  // ═══════════════════════════════════════

  showFishingPrompt() {
    if (this.dialogActive) return;
    this.showConfirmDialog('🎣 Go Fishing?', 'Cast your line into Moonlight Lake!', () => {
      this.scene.launch('FishingScene', { save: this.save });
      this.scene.pause();
    });
  }

  showMiningPrompt() {
    if (this.dialogActive) return;
    this.showConfirmDialog('⛏️ Enter the Mine?', 'Mine rocks for ores and gems!', () => {
      this.scene.launch('MiningScene', { save: this.save });
      this.scene.pause();
    });
  }

  forage() {
    const finds = [
      { id: 'mushroom', chance: 0.4 },
      { id: 'herb', chance: 0.3 },
      { id: 'berry', chance: 0.3 },
      { id: 'wood', chance: 0.5 },
    ];

    const found = finds.filter(() => Math.random() < 0.3);
    if (found.length === 0) return;

    const item = found[Math.floor(Math.random() * found.length)];
    addItem(this.save, item.id);
    const itemData = ITEMS[item.id];
    this.showFloatingText(this.player.x, this.player.y - 30, `Found ${itemData?.name || item.id}!`, '#88ff88');
    hapticFeedback('light');
    this.updateHUD();
  }

  // ═══════════════════════════════════════
  // QUEST SYSTEM
  // ═══════════════════════════════════════

  updateQuestProgress(type, target) {
    for (const questId of this.save.questsActive) {
      const quest = QUESTS[questId];
      if (!quest) continue;

      if (!this.save.questProgress[questId]) {
        this.save.questProgress[questId] = {};
      }

      for (let i = 0; i < quest.objectives.length; i++) {
        const obj = quest.objectives[i];
        if (obj.type !== type) continue;
        if (obj.target !== 'any' && obj.target !== target) continue;

        const key = `obj_${i}`;
        if (!this.save.questProgress[questId][key]) {
          this.save.questProgress[questId][key] = 0;
        }
        this.save.questProgress[questId][key]++;

        // Check if objective complete
        if (this.save.questProgress[questId][key] >= obj.count) {
          // Check if all objectives complete
          const allDone = quest.objectives.every((o, idx) => {
            const k = `obj_${idx}`;
            return (this.save.questProgress[questId][k] || 0) >= o.count;
          });

          if (allDone) {
            this.completeQuest(questId);
          }
        }
      }
    }

    // Also check daily tasks
    this.checkDailyTaskProgress(type, target);
  }

  completeQuest(questId) {
    const quest = QUESTS[questId];
    if (!quest) return;

    // Remove from active
    this.save.questsActive = this.save.questsActive.filter(q => q !== questId);
    this.save.questsCompleted.push(questId);
    delete this.save.questProgress[questId];

    // Give rewards
    if (quest.rewards.coins) addCoins(this.save, quest.rewards.coins);
    if (quest.rewards.items) {
      for (const [itemId, count] of Object.entries(quest.rewards.items)) {
        addItem(this.save, itemId, count);
      }
    }
    if (quest.rewards.friendship) {
      for (const [npcId, amount] of Object.entries(quest.rewards.friendship)) {
        this.save.friendship[npcId] = Math.min(10, (this.save.friendship[npcId] || 0) + amount);
      }
    }

    // Activate next quest
    if (quest.next && QUESTS[quest.next]) {
      this.save.questsActive.push(quest.next);
    }

    this.save.stats.questsCompleted++;

    hapticFeedback('success');
    this.showNotification(`✅ Quest Complete: ${quest.title}!`);
    this.updateHUD();
    this.doSave();
  }

  checkDailyTasks() {
    const today = new Date().toDateString();
    if (this.save.dailyDate !== today) {
      this.save.dailyDate = today;
      this.save.talkedToday = [];
      // Generate 3 random daily tasks
      const shuffled = [...DAILY_TASKS].sort(() => Math.random() - 0.5);
      this.save.dailyTasks = shuffled.slice(0, 3).map((t, i) => ({
        ...t,
        id: `daily_${i}`,
        progress: 0,
        completed: false,
      }));
    }
  }

  checkDailyTaskProgress(type, target) {
    if (!this.save.dailyTasks) return;
    for (const task of this.save.dailyTasks) {
      if (task.completed) continue;
      if (task.type !== type) continue;
      if (task.target !== 'any' && task.target !== target) continue;
      task.progress++;
      if (task.progress >= task.count) {
        task.completed = true;
        if (task.reward.coins) addCoins(this.save, task.reward.coins);
        hapticFeedback('success');
        this.showNotification(`📋 Daily Task: ${task.text} ✅`);
        this.updateHUD();
      }
    }
  }

  // ═══════════════════════════════════════
  // INPUT
  // ═══════════════════════════════════════

  setupInput() {
    this.input.on('pointerdown', (pointer) => {
      if (this.dialogActive || this.menuOpen) return;

      const worldX = pointer.worldX;
      const worldY = pointer.worldY;

      if (this.buildMode && this.selectedBuilding) {
        const tile = this.gridMgr.worldToTile(worldX, worldY);
        this.placeBuilding(this.selectedBuilding, tile.x, tile.y);
        return;
      }

      this.movePlayerTo(worldX, worldY);
    });

    // Keyboard support
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,I,B,Q,ESC');
  }

  update(time, delta) {
    // Keyboard movement
    let dx = 0, dy = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) dx = -1;
    if (this.cursors.right.isDown || this.keys.D.isDown) dx = 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) dy = -1;
    if (this.cursors.down.isDown || this.keys.S.isDown) dy = 1;

    if ((dx !== 0 || dy !== 0) && !this.dialogActive) {
      if (this.moveTween) this.moveTween.stop();
      this.playerMoving = false;

      const speed = PLAYER_SPEED * (delta / 1000);
      const newX = this.player.x + dx * speed;
      const newY = this.player.y + dy * speed;
      const tile = this.gridMgr.worldToTile(newX, newY);

      if (this.gridMgr.isWalkable(tile.x, tile.y)) {
        this.player.x = newX;
        this.player.y = newY;
        this.player.setDepth(this.player.y + 16);
        if (dx < 0) this.player.setFlipX(true);
        else if (dx > 0) this.player.setFlipX(false);
      }
    }

    // Hotkeys
    if (Phaser.Input.Keyboard.JustDown(this.keys.I)) this.toggleInventory();
    if (Phaser.Input.Keyboard.JustDown(this.keys.B)) this.toggleBuildMode();
    if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) this.toggleQuestLog();
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) this.closeAllMenus();

    // Day/night cycle
    this.dayTime += delta;
    if (this.dayTime >= DAY_DURATION) this.dayTime = 0;
    this.updateDayNight();
  }

  // ═══════════════════════════════════════
  // DAY/NIGHT CYCLE
  // ═══════════════════════════════════════

  updateDayNight() {
    const progress = this.dayTime / DAY_DURATION; // 0 to 1
    let alpha = 0;
    let color = 0x000033;

    if (progress < 0.25) {
      // Dawn
      alpha = 0.15 * (1 - progress / 0.25);
      color = 0x332200;
    } else if (progress < 0.5) {
      // Day
      alpha = 0;
    } else if (progress < 0.75) {
      // Dusk
      const t = (progress - 0.5) / 0.25;
      alpha = t * 0.3;
      // Lerp from warm dusk to cool night
      const r = Math.round(51 * (1 - t));
      const g = Math.round(34 * (1 - t));
      const b = Math.round(51 * t);
      color = (r << 16) | (g << 8) | b;
    } else {
      // Night
      alpha = 0.3;
      color = 0x000033;
    }

    this.dayOverlay.setFillStyle(color, alpha);
    this.save.dayTime = this.dayTime;
  }

  // ═══════════════════════════════════════
  // HUD
  // ═══════════════════════════════════════

  createHUD() {
    const cam = this.cameras.main;

    // Top bar
    const hudBgGfx = this.add.graphics().setScrollFactor(0).setDepth(1000);
    hudBgGfx.fillStyle(0x000000, 0.5);
    hudBgGfx.fillRoundedRect(10, 2, GAME_W - 20, 36, 8);
    this.hudBg = hudBgGfx;

    // Coins
    this.hudCoin = this.add.image(30, 20, 'icon_coin')
      .setScrollFactor(0).setDepth(1001);
    this.hudCoinText = this.add.text(46, 20, `${this.save.coins}`, {
      fontSize: '14px', fontFamily: 'Arial', color: '#f0c040', fontStyle: 'bold'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(1001);

    // XP / Level
    this.hudLevel = this.add.text(GAME_W / 2, 20, `Lv.${this.save.level}  XP: ${this.save.xp}`, {
      fontSize: '12px', fontFamily: 'Arial', color: '#aaddaa',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    // Zone name
    this.hudZone = this.add.text(GAME_W - 20, 20, '', {
      fontSize: '11px', fontFamily: 'Arial', color: '#ccbbdd',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(1001);

    // Bottom nav bar
    this.createNavBar();

    // Update zone display on move
    this.time.addEvent({
      delay: 500,
      callback: () => this.updateZoneDisplay(),
      loop: true,
    });
  }

  createNavBar() {
    const barY = GAME_H - 30;
    const barH = 56;

    // Background
    this.add.rectangle(GAME_W / 2, barY + 4, GAME_W, barH, 0x1a0a2e, 0.9)
      .setScrollFactor(0).setDepth(1000);

    const buttons = [
      { icon: '🎒', label: 'Items', action: () => this.toggleInventory() },
      { icon: '🔨', label: 'Build', action: () => this.toggleBuildMode() },
      { icon: '📜', label: 'Quests', action: () => this.toggleQuestLog() },
      { icon: '🏪', label: 'Shop', action: () => this.toggleShop() },
      { icon: '⚙️', label: 'Menu', action: () => this.toggleSettings() },
    ];

    const spacing = GAME_W / buttons.length;
    buttons.forEach((btn, i) => {
      const x = spacing / 2 + i * spacing;

      const icon = this.add.text(x, barY - 4, btn.icon, {
        fontSize: '22px',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);

      const label = this.add.text(x, barY + 16, btn.label, {
        fontSize: '9px', fontFamily: 'Arial', color: '#aabbcc',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);

      const zone = this.add.zone(x, barY + 4, spacing - 4, barH)
        .setScrollFactor(0).setDepth(1003).setInteractive();

      zone.on('pointerdown', () => {
        hapticFeedback('select');
        btn.action();
      });
    });
  }

  updateHUD() {
    if (this.hudCoinText) this.hudCoinText.setText(`${this.save.coins}`);
    if (this.hudLevel) this.hudLevel.setText(`Lv.${this.save.level}  XP: ${this.save.xp}`);
  }

  updateZoneDisplay() {
    const tile = this.gridMgr.worldToTile(this.player.x, this.player.y);
    let zoneName = 'The Valley';
    for (const [key, zone] of Object.entries(ZONES)) {
      if (tile.x >= zone.x && tile.x < zone.x + zone.w &&
          tile.y >= zone.y && tile.y < zone.y + zone.h) {
        zoneName = zone.name;
        break;
      }
    }
    if (this.hudZone) this.hudZone.setText(zoneName);
  }

  // ═══════════════════════════════════════
  // DIALOG SYSTEM
  // ═══════════════════════════════════════

  showDialog(name, title, text, charId) {
    this.dialogActive = true;

    const cam = this.cameras.main;
    const dw = GAME_W - 40;
    const dh = 140;
    const dx = GAME_W / 2;
    const dy = GAME_H - 105;

    // Background panel
    this.dialogBg = this.add.graphics().setScrollFactor(0).setDepth(2000);
    this.dialogBg.fillStyle(0x2d1b4e, 0.95);
    this.dialogBg.fillRoundedRect(dx - dw/2, dy - dh/2, dw, dh, 12);
    this.dialogBg.lineStyle(2, 0x8b6daa, 0.8);
    this.dialogBg.strokeRoundedRect(dx - dw/2, dy - dh/2, dw, dh, 12);

    // Name
    this.dialogName = this.add.text(dx - dw/2 + 16, dy - dh/2 + 10, `${name}`, {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#f0c040', fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(2001);

    // Title
    this.dialogTitle = this.add.text(dx - dw/2 + 16, dy - dh/2 + 28, title, {
      fontSize: '10px', fontFamily: 'Arial', color: '#aabbcc',
    }).setScrollFactor(0).setDepth(2001);

    // Text
    this.dialogText = this.add.text(dx - dw/2 + 16, dy - dh/2 + 48, text, {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: '#e8e0f0',
      wordWrap: { width: dw - 32 },
      lineSpacing: 4,
    }).setScrollFactor(0).setDepth(2001);

    // Buttons
    const btnY2 = dy + dh/2 - 24;

    // Gift button (if NPC)
    if (charId) {
      this.createDialogBtn(dx - 60, btnY2, '🎁 Gift', () => {
        this.closeDialog();
        this.showGiftMenu(charId);
      });
    }

    // Close button
    this.createDialogBtn(dx + 60, btnY2, '✓ Close', () => {
      this.closeDialog();
    });

    // Tap anywhere to close
    this.dialogCloser = this.add.zone(GAME_W/2, GAME_H/2, GAME_W, GAME_H)
      .setScrollFactor(0).setDepth(1999).setInteractive();
    this.dialogCloser.on('pointerdown', () => this.closeDialog());
  }

  createDialogBtn(x, y, label, callback) {
    const btn = this.add.graphics().setScrollFactor(0).setDepth(2001);
    btn.fillStyle(0x5a3d7a);
    btn.fillRoundedRect(x - 50, y - 14, 100, 28, 8);
    const txt = this.add.text(x, y, label, {
      fontSize: '12px', fontFamily: 'Arial', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2002);

    const zone = this.add.zone(x, y, 100, 28)
      .setScrollFactor(0).setDepth(2003).setInteractive();
    zone.on('pointerdown', (p) => {
      p.event?.stopPropagation?.();
      hapticFeedback('light');
      callback();
    });

    if (!this.dialogElements) this.dialogElements = [];
    this.dialogElements.push(btn, txt, zone);
  }

  closeDialog() {
    this.dialogActive = false;
    if (this.dialogBg) this.dialogBg.destroy();
    if (this.dialogName) this.dialogName.destroy();
    if (this.dialogTitle) this.dialogTitle.destroy();
    if (this.dialogText) this.dialogText.destroy();
    if (this.dialogCloser) this.dialogCloser.destroy();
    if (this.dialogElements) {
      this.dialogElements.forEach(e => e.destroy());
      this.dialogElements = [];
    }
  }

  showConfirmDialog(title, text, onConfirm) {
    this.dialogActive = true;

    const dw = 300, dh = 130;
    const dx = GAME_W / 2, dy = GAME_H / 2;

    this.dialogBg = this.add.graphics().setScrollFactor(0).setDepth(2000);
    this.dialogBg.fillStyle(0x2d1b4e, 0.95);
    this.dialogBg.fillRoundedRect(dx - dw/2, dy - dh/2, dw, dh, 12);
    this.dialogBg.lineStyle(2, 0x8b6daa);
    this.dialogBg.strokeRoundedRect(dx - dw/2, dy - dh/2, dw, dh, 12);

    this.dialogName = this.add.text(dx, dy - 40, title, {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#f0c040', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);

    this.dialogText = this.add.text(dx, dy - 10, text, {
      fontSize: '12px', fontFamily: 'Arial', color: '#ccbbdd',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);

    this.dialogElements = [];

    this.createDialogBtn(dx - 60, dy + 35, '✓ Yes!', () => {
      this.closeDialog();
      onConfirm();
    });
    this.createDialogBtn(dx + 60, dy + 35, '✗ No', () => {
      this.closeDialog();
    });
  }

  // ═══════════════════════════════════════
  // MENUS (Inventory, Build, Quests, Shop)
  // ═══════════════════════════════════════

  toggleInventory() {
    if (this.menuOpen === 'inventory') {
      this.closeAllMenus();
      return;
    }
    this.closeAllMenus();
    this.menuOpen = 'inventory';
    this.showInventoryMenu();
  }

  toggleBuildMode() {
    if (this.menuOpen === 'build') {
      this.closeAllMenus();
      this.exitBuildMode();
      return;
    }
    this.closeAllMenus();
    this.menuOpen = 'build';
    this.enterBuildMode();
  }

  toggleQuestLog() {
    if (this.menuOpen === 'quests') {
      this.closeAllMenus();
      return;
    }
    this.closeAllMenus();
    this.menuOpen = 'quests';
    this.showQuestMenu();
  }

  toggleShop() {
    if (this.menuOpen === 'shop') {
      this.closeAllMenus();
      return;
    }
    this.closeAllMenus();
    this.menuOpen = 'shop';
    this.showShopMenu();
  }

  toggleSettings() {
    if (this.menuOpen === 'settings') {
      this.closeAllMenus();
      return;
    }
    this.closeAllMenus();
    this.menuOpen = 'settings';
    this.showSettingsMenu();
  }

  closeAllMenus() {
    this.menuOpen = null;
    if (this.menuContainer) {
      this.menuContainer.forEach(e => e.destroy());
      this.menuContainer = [];
    }
    if (this.buildMode) this.exitBuildMode();
  }

  // Generic menu panel
  createMenuPanel(title, contentCallback) {
    this.menuContainer = [];
    const pw = GAME_W - 60;
    const ph = GAME_H - 120;
    const px = GAME_W / 2;
    const py = GAME_H / 2 - 10;

    // Backdrop
    const backdrop = this.add.rectangle(GAME_W/2, GAME_H/2, GAME_W, GAME_H, 0x000000, 0.5)
      .setScrollFactor(0).setDepth(1500).setInteractive();
    backdrop.on('pointerdown', () => this.closeAllMenus());
    this.menuContainer.push(backdrop);

    // Panel
    const panel = this.add.graphics().setScrollFactor(0).setDepth(1501);
    panel.fillStyle(0x2d1b4e, 0.97);
    panel.fillRoundedRect(px - pw/2, py - ph/2, pw, ph, 16);
    panel.lineStyle(2, 0x8b6daa, 0.8);
    panel.strokeRoundedRect(px - pw/2, py - ph/2, pw, ph, 16);
    this.menuContainer.push(panel);

    // Title
    const titleText = this.add.text(px, py - ph/2 + 24, title, {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: '#f0c040', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1502);
    this.menuContainer.push(titleText);

    // Close button
    const closeBtn = this.add.text(px + pw/2 - 20, py - ph/2 + 14, '✕', {
      fontSize: '18px', color: '#ff6666',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1502).setInteractive();
    closeBtn.on('pointerdown', () => {
      hapticFeedback('light');
      this.closeAllMenus();
    });
    this.menuContainer.push(closeBtn);

    // Content area bounds
    const contentBounds = {
      x: px - pw/2 + 16,
      y: py - ph/2 + 48,
      w: pw - 32,
      h: ph - 64,
    };

    contentCallback(contentBounds);
  }

  // ── INVENTORY MENU ──
  showInventoryMenu() {
    this.createMenuPanel('🎒 Inventory', (bounds) => {
      const items = Object.entries(this.save.inventory).filter(([k, v]) => v > 0);
      if (items.length === 0) {
        const t = this.add.text(bounds.x + bounds.w/2, bounds.y + 40, 'Your bag is empty!', {
          fontSize: '14px', color: '#aabbcc',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1502);
        this.menuContainer.push(t);
        return;
      }

      const cols = 5;
      const cellW = 60;
      const cellH = 65;
      items.forEach(([itemId, count], idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const cx = bounds.x + 20 + col * (cellW + 8);
        const cy = bounds.y + 10 + row * (cellH + 4);

        if (cy > bounds.y + bounds.h - 20) return;

        const itemData = ITEMS[itemId];
        const bg = this.add.graphics().setScrollFactor(0).setDepth(1502);
        bg.fillStyle(0x3d2b5e, 0.8);
        bg.fillRoundedRect(cx, cy, cellW, cellH, 6);
        this.menuContainer.push(bg);

        // Item color circle
        const iconColor = itemData?.icon || 0xcccccc;
        const icon = this.add.graphics().setScrollFactor(0).setDepth(1503);
        icon.fillStyle(iconColor);
        icon.fillCircle(cx + cellW/2, cy + 22, 12);
        this.menuContainer.push(icon);

        // Count
        const countText = this.add.text(cx + cellW - 6, cy + 38, `${count}`, {
          fontSize: '11px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold',
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(1503);
        this.menuContainer.push(countText);

        // Name
        const name = this.add.text(cx + cellW/2, cy + cellH - 6, itemData?.name || itemId, {
          fontSize: '8px', fontFamily: 'Arial', color: '#ccbbdd',
        }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(1503);
        this.menuContainer.push(name);
      });
    });
  }

  // ── BUILD MENU ──
  showBuildMenu() {
    this.createMenuPanel('🔨 Build', (bounds) => {
      const buildingList = Object.values(BUILDINGS);
      const cellW = bounds.w - 10;
      const cellH = 50;

      buildingList.forEach((bld, idx) => {
        const cy = bounds.y + idx * (cellH + 6);
        if (cy > bounds.y + bounds.h - 30) return;

        const cost = bld.levels[0].cost;
        const costStr = Object.entries(cost).map(([k, v]) => `${v} ${k}`).join(', ');
        const canAfford = this.canAffordBuilding(bld.id);

        const bg = this.add.graphics().setScrollFactor(0).setDepth(1502);
        bg.fillStyle(canAfford ? 0x3d6b3e : 0x5a3d3d, 0.7);
        bg.fillRoundedRect(bounds.x, cy, cellW, cellH, 6);
        this.menuContainer.push(bg);

        const nameText = this.add.text(bounds.x + 10, cy + 8, bld.name, {
          fontSize: '13px', fontFamily: 'Georgia, serif', color: '#ffffff', fontStyle: 'bold',
        }).setScrollFactor(0).setDepth(1503);
        this.menuContainer.push(nameText);

        const costText = this.add.text(bounds.x + 10, cy + 28, costStr, {
          fontSize: '10px', fontFamily: 'Arial', color: canAfford ? '#aaddaa' : '#dd8888',
        }).setScrollFactor(0).setDepth(1503);
        this.menuContainer.push(costText);

        // Build button
        if (canAfford) {
          const btn = this.add.text(bounds.x + cellW - 50, cy + cellH/2, '🔨 Build', {
            fontSize: '11px', fontFamily: 'Arial', color: '#ffffff',
            backgroundColor: '#44aa66',
            padding: { x: 6, y: 4 },
          }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(1503).setInteractive();
          btn.on('pointerdown', () => {
            hapticFeedback('medium');
            this.selectedBuilding = bld.id;
            this.closeAllMenus();
            this.buildMode = true;
            this.showNotification(`Tap to place ${bld.name}! 🏗️`);
          });
          this.menuContainer.push(btn);
        }
      });
    });
  }

  closeBuildMenu() {
    // handled by closeAllMenus
  }

  canAffordBuilding(buildingId) {
    const def = BUILDINGS[buildingId];
    if (!def) return false;
    const cost = def.levels[0].cost;
    if (this.save.coins < (cost.coins || 0)) return false;
    for (const [mat, count] of Object.entries(cost)) {
      if (mat === 'coins') continue;
      if (!hasItem(this.save, mat, count)) return false;
    }
    return true;
  }

  // ── QUEST MENU ──
  showQuestMenu() {
    this.createMenuPanel('📜 Quests', (bounds) => {
      let yOff = 0;

      // Active quests
      const activeLabel = this.add.text(bounds.x, bounds.y + yOff, 'Active Quests:', {
        fontSize: '14px', fontFamily: 'Georgia, serif', color: '#f0c040',
      }).setScrollFactor(0).setDepth(1502);
      this.menuContainer.push(activeLabel);
      yOff += 24;

      if (this.save.questsActive.length === 0) {
        const t = this.add.text(bounds.x + 10, bounds.y + yOff, 'No active quests', {
          fontSize: '12px', color: '#888899',
        }).setScrollFactor(0).setDepth(1502);
        this.menuContainer.push(t);
        yOff += 20;
      }

      for (const qid of this.save.questsActive) {
        const quest = QUESTS[qid];
        if (!quest || bounds.y + yOff > bounds.y + bounds.h - 40) continue;

        const bg = this.add.graphics().setScrollFactor(0).setDepth(1502);
        bg.fillStyle(0x3d2b5e, 0.5);
        bg.fillRoundedRect(bounds.x, bounds.y + yOff, bounds.w - 10, 60, 6);
        this.menuContainer.push(bg);

        const qName = this.add.text(bounds.x + 10, bounds.y + yOff + 6, quest.title, {
          fontSize: '12px', fontFamily: 'Georgia, serif', color: '#ffffff', fontStyle: 'bold',
        }).setScrollFactor(0).setDepth(1503);
        this.menuContainer.push(qName);

        // Objectives
        let objStr = quest.objectives.map((obj, i) => {
          const progress = this.save.questProgress[qid]?.[`obj_${i}`] || 0;
          const done = progress >= obj.count;
          return `${done ? '✅' : '⬜'} ${obj.text} (${Math.min(progress, obj.count)}/${obj.count})`;
        }).join('  |  ');

        const objText = this.add.text(bounds.x + 10, bounds.y + yOff + 24, objStr, {
          fontSize: '10px', color: '#aabbcc', wordWrap: { width: bounds.w - 30 },
        }).setScrollFactor(0).setDepth(1503);
        this.menuContainer.push(objText);

        yOff += 66;
      }

      // Daily tasks
      yOff += 10;
      const dailyLabel = this.add.text(bounds.x, bounds.y + yOff, 'Daily Tasks:', {
        fontSize: '14px', fontFamily: 'Georgia, serif', color: '#88ccff',
      }).setScrollFactor(0).setDepth(1502);
      this.menuContainer.push(dailyLabel);
      yOff += 22;

      if (this.save.dailyTasks) {
        for (const task of this.save.dailyTasks) {
          if (bounds.y + yOff > bounds.y + bounds.h - 20) break;
          const icon = task.completed ? '✅' : '📋';
          const t = this.add.text(bounds.x + 10, bounds.y + yOff,
            `${icon} ${task.text} (${Math.min(task.progress, task.count)}/${task.count})`, {
            fontSize: '11px', color: task.completed ? '#66cc66' : '#ccbbdd',
          }).setScrollFactor(0).setDepth(1502);
          this.menuContainer.push(t);
          yOff += 18;
        }
      }
    });
  }

  // ── SHOP MENU ──
  showShopMenu() {
    this.createMenuPanel('🏪 Shop', (bounds) => {
      const shopList = [
        { itemId: 'seed_wheat', price: 10 },
        { itemId: 'seed_carrot', price: 15 },
        { itemId: 'seed_pumpkin', price: 30 },
        { itemId: 'seed_starberry', price: 50 },
        { itemId: 'seed_moonflower', price: 80 },
        { itemId: 'wood', price: 5 },
        { itemId: 'stone', price: 5 },
      ];

      // Buy section
      const buyLabel = this.add.text(bounds.x, bounds.y, 'Buy:', {
        fontSize: '14px', fontFamily: 'Georgia, serif', color: '#f0c040',
      }).setScrollFactor(0).setDepth(1502);
      this.menuContainer.push(buyLabel);

      shopList.forEach((item, idx) => {
        const cy = bounds.y + 24 + idx * 34;
        if (cy > bounds.y + bounds.h - 80) return;

        const itemData = ITEMS[item.itemId];
        const canBuy = this.save.coins >= item.price;

        const bg = this.add.graphics().setScrollFactor(0).setDepth(1502);
        bg.fillStyle(0x3d2b5e, 0.5);
        bg.fillRoundedRect(bounds.x, cy, bounds.w - 10, 30, 4);
        this.menuContainer.push(bg);

        const nameT = this.add.text(bounds.x + 10, cy + 7, itemData?.name || item.itemId, {
          fontSize: '12px', color: '#ffffff',
        }).setScrollFactor(0).setDepth(1503);
        this.menuContainer.push(nameT);

        const priceT = this.add.text(bounds.x + bounds.w - 120, cy + 7, `💰 ${item.price}`, {
          fontSize: '12px', color: canBuy ? '#f0c040' : '#dd6666',
        }).setScrollFactor(0).setDepth(1503);
        this.menuContainer.push(priceT);

        if (canBuy) {
          const buyBtn = this.add.text(bounds.x + bounds.w - 50, cy + 7, '  Buy  ', {
            fontSize: '11px', color: '#ffffff', backgroundColor: '#44aa66',
            padding: { x: 4, y: 2 },
          }).setScrollFactor(0).setDepth(1503).setInteractive();
          buyBtn.on('pointerdown', () => {
            if (spendCoins(this.save, item.price)) {
              addItem(this.save, item.itemId);
              hapticFeedback('success');
              this.showFloatingText(GAME_W/2, GAME_H/2 - 60, `Bought ${itemData?.name}!`, '#44ff44');
              this.updateHUD();
              this.closeAllMenus();
              this.showShopMenu();
              this.menuOpen = 'shop';
            }
          });
          this.menuContainer.push(buyBtn);
        }
      });

      // Sell section
      const sellY = bounds.y + bounds.h - 50;
      const sellLabel = this.add.text(bounds.x, sellY, 'Tap items in inventory to sell (half value)', {
        fontSize: '10px', color: '#aabbcc',
      }).setScrollFactor(0).setDepth(1502);
      this.menuContainer.push(sellLabel);
    });
  }

  // ── SETTINGS MENU ──
  showSettingsMenu() {
    this.createMenuPanel('⚙️ Settings', (bounds) => {
      const options = [
        { label: '💾 Save Game', action: () => { this.doSave(); this.showNotification('Game saved! ✅'); } },
        { label: '🗑️ Reset Game', action: () => {
          this.showConfirmDialog('Reset Game?', 'All progress will be lost!', () => {
            localStorage.removeItem('dreamlight_valley_save');
            window.location.reload();
          });
        }},
        { label: '🏠 Return to Title', action: () => {
          this.doSave();
          this.scene.start('TitleScene');
        }},
      ];

      options.forEach((opt, idx) => {
        const cy = bounds.y + idx * 48;
        const btn = this.add.text(bounds.x + bounds.w/2, cy + 20, opt.label, {
          fontSize: '16px', fontFamily: 'Georgia, serif', color: '#ffffff',
          backgroundColor: '#5a3d7a',
          padding: { x: 20, y: 8 },
        }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(1503).setInteractive();
        btn.on('pointerdown', () => {
          hapticFeedback('medium');
          this.closeAllMenus();
          opt.action();
        });
        this.menuContainer.push(btn);
      });

      // Stats
      const statY = bounds.y + 180;
      const stats = [
        `Crops Harvested: ${this.save.stats.cropsHarvested}`,
        `Fish Caught: ${this.save.stats.fishCaught}`,
        `Rocks Mined: ${this.save.stats.rocksSmashed}`,
        `Buildings Placed: ${this.save.stats.buildingsPlaced}`,
        `Quests Completed: ${this.save.stats.questsCompleted}`,
      ];
      stats.forEach((s, i) => {
        const t = this.add.text(bounds.x + 10, statY + i * 18, s, {
          fontSize: '11px', color: '#aabbcc',
        }).setScrollFactor(0).setDepth(1502);
        this.menuContainer.push(t);
      });
    });
  }

  // ── SEED SELECTION ──
  showSeedMenu(seeds, tileX, tileY) {
    this.dialogActive = true;
    this.dialogElements = [];

    const dw = 280, dh = 40 + seeds.length * 36;
    const dx = GAME_W / 2, dy = GAME_H / 2;

    this.dialogBg = this.add.graphics().setScrollFactor(0).setDepth(2000);
    this.dialogBg.fillStyle(0x2d1b4e, 0.95);
    this.dialogBg.fillRoundedRect(dx - dw/2, dy - dh/2, dw, dh, 12);
    this.dialogBg.lineStyle(2, 0x8b6daa);
    this.dialogBg.strokeRoundedRect(dx - dw/2, dy - dh/2, dw, dh, 12);

    this.dialogName = this.add.text(dx, dy - dh/2 + 14, '🌱 Plant Seeds', {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);

    seeds.forEach((seedId, i) => {
      const seedData = ITEMS[seedId];
      const count = this.save.inventory[seedId] || 0;
      const sy = dy - dh/2 + 38 + i * 36;

      const btn = this.add.text(dx, sy, `${seedData?.name || seedId} (x${count})`, {
        fontSize: '13px', fontFamily: 'Arial', color: '#ffffff',
        backgroundColor: '#3d6b3e',
        padding: { x: 12, y: 6 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(2002).setInteractive();
      btn.on('pointerdown', () => {
        this.closeDialog();
        this.plantCrop(tileX, tileY, seedId);
      });
      this.dialogElements.push(btn);
    });

    this.dialogCloser = this.add.zone(GAME_W/2, GAME_H/2, GAME_W, GAME_H)
      .setScrollFactor(0).setDepth(1999).setInteractive();
    this.dialogCloser.on('pointerdown', () => this.closeDialog());
  }

  // ── GIFT MENU ──
  showGiftMenu(charId) {
    const giftable = Object.entries(this.save.inventory)
      .filter(([k, v]) => v > 0 && !k.startsWith('seed_'))
      .slice(0, 8);

    if (giftable.length === 0) {
      this.showNotification('Nothing to give! Find items first.');
      return;
    }

    this.dialogActive = true;
    this.dialogElements = [];

    const dw = 300, dh = 50 + giftable.length * 32;
    const dx = GAME_W / 2, dy = GAME_H / 2;

    this.dialogBg = this.add.graphics().setScrollFactor(0).setDepth(2000);
    this.dialogBg.fillStyle(0x2d1b4e, 0.95);
    this.dialogBg.fillRoundedRect(dx - dw/2, dy - dh/2, dw, dh, 12);

    this.dialogName = this.add.text(dx, dy - dh/2 + 14, `🎁 Gift to ${CHARACTERS[charId].name}`, {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#f0c040',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);

    const favorites = CHARACTERS[charId].gifts || [];

    giftable.forEach(([itemId, count], i) => {
      const itemData = ITEMS[itemId];
      const isFav = favorites.includes(itemId);
      const sy = dy - dh/2 + 40 + i * 32;

      const btn = this.add.text(dx, sy, `${isFav ? '⭐' : ''} ${itemData?.name || itemId} (x${count})`, {
        fontSize: '12px', fontFamily: 'Arial', color: '#ffffff',
        backgroundColor: isFav ? '#6b4d8a' : '#3d2b5e',
        padding: { x: 10, y: 4 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(2002).setInteractive();

      btn.on('pointerdown', () => {
        removeItem(this.save, itemId);
        const friendshipGain = isFav ? 2 : 1;
        this.save.friendship[charId] = Math.min(10, (this.save.friendship[charId] || 0) + friendshipGain);
        this.save.stats.giftsGiven++;

        if (this.npcs[charId]) {
          this.updateNPCHearts(charId, this.npcs[charId].hearts);
        }

        hapticFeedback('success');
        this.closeDialog();
        this.showNotification(
          isFav
            ? `${CHARACTERS[charId].name} LOVES it! 💕 +${friendshipGain} friendship!`
            : `${CHARACTERS[charId].name} says thanks! ❤️ +${friendshipGain} friendship!`
        );
        this.updateHUD();
        this.doSave();
      });
      this.dialogElements.push(btn);
    });

    this.dialogCloser = this.add.zone(GAME_W/2, GAME_H/2, GAME_W, GAME_H)
      .setScrollFactor(0).setDepth(1999).setInteractive();
    this.dialogCloser.on('pointerdown', () => this.closeDialog());
  }

  // ═══════════════════════════════════════
  // EFFECTS & HELPERS
  // ═══════════════════════════════════════

  showNotification(text) {
    const notif = this.add.text(GAME_W / 2, 60, text, {
      fontSize: '13px',
      fontFamily: 'Georgia, serif',
      color: '#ffffff',
      backgroundColor: '#2d1b4eee',
      padding: { x: 16, y: 8 },
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);

    this.tweens.add({
      targets: notif,
      alpha: 0,
      y: 40,
      duration: 3000,
      delay: 2000,
      onComplete: () => notif.destroy(),
    });
  }

  showFloatingText(x, y, text, color = '#ffffff') {
    const ft = this.add.text(x, y, text, {
      fontSize: '14px', fontFamily: 'Arial', color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(2000);

    this.tweens.add({
      targets: ft,
      y: y - 40,
      alpha: 0,
      duration: 1500,
      onComplete: () => ft.destroy(),
    });
  }

  createParticles() {
    // Fireflies in forest at night
    for (let i = 0; i < 20; i++) {
      const fz = ZONES.forest;
      const fx = (fz.x + Phaser.Math.Between(0, fz.w)) * TILE_SIZE;
      const fy = (fz.y + Phaser.Math.Between(0, fz.h)) * TILE_SIZE;
      const ff = this.add.image(fx, fy, 'particle_firefly')
        .setAlpha(0).setDepth(800);

      this.tweens.add({
        targets: ff,
        x: fx + Phaser.Math.Between(-60, 60),
        y: fy + Phaser.Math.Between(-60, 60),
        alpha: { from: 0, to: 0.7 },
        duration: Phaser.Math.Between(3000, 6000),
        delay: Phaser.Math.Between(0, 5000),
        yoyo: true,
        repeat: -1,
      });
    }

    // Water sparkles on lake
    const lz = ZONES.lake;
    for (let i = 0; i < 12; i++) {
      const wx2 = (lz.x + Phaser.Math.Between(2, lz.w - 2)) * TILE_SIZE;
      const wy2 = (lz.y + Phaser.Math.Between(2, lz.h - 2)) * TILE_SIZE;
      const ws = this.add.image(wx2, wy2, 'particle_water')
        .setAlpha(0).setDepth(50);

      this.tweens.add({
        targets: ws,
        alpha: { from: 0, to: 0.5 },
        scaleX: { from: 0.5, to: 1.2 },
        scaleY: { from: 0.5, to: 1.2 },
        duration: Phaser.Math.Between(2000, 4000),
        delay: Phaser.Math.Between(0, 3000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  createInteractables() {
    // Add zone labels
    for (const [key, zone] of Object.entries(ZONES)) {
      const cx = (zone.x + zone.w / 2) * TILE_SIZE;
      const cy = zone.y * TILE_SIZE - 8;
      this.add.text(cx, cy, zone.name, {
        fontSize: '12px', fontFamily: 'Georgia, serif', color: '#ffffff',
        backgroundColor: '#00000066', padding: { x: 6, y: 3 },
      }).setOrigin(0.5).setDepth(100);
    }
  }

  doSave() {
    saveGame(this.save);
  }

  // Handle returning from minigames
  handleMinigameReturn(data) {
    if (data) {
      if (data.fish) {
        addItem(this.save, data.fish);
        this.save.stats.fishCaught++;
        this.updateQuestProgress('fish', data.fish);
      }
      if (data.ores) {
        for (const ore of data.ores) {
          addItem(this.save, ore);
        }
        this.save.stats.rocksSmashed += data.ores.length;
        this.updateQuestProgress('mine', 'any');
      }
      if (data.coins) addCoins(this.save, data.coins);
      if (data.xp) this.save.xp += data.xp;
      this.updateHUD();
      this.doSave();
    }
  }
}
