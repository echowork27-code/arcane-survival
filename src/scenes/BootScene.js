// BootScene — Loading screen + procedural texture generation
import { COLORS, TILE_SIZE } from '../config.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Show loading bar
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.add.rectangle(w/2, h/2, w, h, 0x1a1a3e);

    const title = this.add.text(w/2, h/2 - 60, '✨ Dreamlight Valley ✨', {
      fontSize: '28px', fontFamily: 'Georgia, serif', color: '#f0c040',
    }).setOrigin(0.5);

    const loadText = this.add.text(w/2, h/2 + 10, 'Building your valley...', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#ccbbdd',
    }).setOrigin(0.5);

    const barBg = this.add.rectangle(w/2, h/2 + 50, 300, 20, 0x3d2b5e).setOrigin(0.5);
    const bar = this.add.rectangle(w/2 - 148, h/2 + 50, 0, 16, 0xf0c040).setOrigin(0, 0.5);

    this.load.on('progress', (v) => { bar.width = 296 * v; });
  }

  create() {
    this.generateAllTextures();
    this.scene.start('TitleScene');
  }

  generateAllTextures() {
    const T = TILE_SIZE;

    // === TILES ===
    this.makeGrassTile('tile_grass1', COLORS.grass1);
    this.makeGrassTile('tile_grass2', COLORS.grass2);
    this.makeGrassTile('tile_grass3', COLORS.grass3);
    this.makeSimpleTile('tile_path', COLORS.path, COLORS.pathDark);
    this.makeSimpleTile('tile_dirt', COLORS.dirt, COLORS.dirtLight);
    this.makeWaterTile('tile_water');
    this.makeSimpleTile('tile_stone', COLORS.stone, COLORS.stoneDark);
    this.makeSimpleTile('tile_sand', COLORS.sand, 0xd8c890);

    // === NATURE ===
    this.makeTree('tree1', COLORS.treeLeaf1, COLORS.treeTrunk);
    this.makeTree('tree2', COLORS.treeLeaf2, COLORS.treeTrunk);
    this.makeTree('tree3', COLORS.treeLeaf3, 0x5a3020);
    this.makeBush('bush1', COLORS.bush);
    this.makeBush('bush2', 0x2d7a2d);
    this.makeRock('rock1', COLORS.stone);
    this.makeRock('rock2', COLORS.stoneDark);
    this.makeFlower('flower_pink', COLORS.flowerPink);
    this.makeFlower('flower_yellow', COLORS.flowerYellow);
    this.makeFlower('flower_purple', COLORS.flowerPurple);
    this.makeFlower('flower_blue', COLORS.flowerBlue);

    // === PLAYER ===
    this.makeCharSprite('player', COLORS.skinLight, COLORS.clothBlue, COLORS.hairBrown);

    // === NPCs ===
    const C = (id, c) => this.makeCharSprite(`npc_${id}`, c.skin, c.cloth, c.accent);
    C('luna', { skin: 0xffe8f0, cloth: 0x8888dd, accent: 0xaabbff });
    C('bramble', { skin: 0xe0c8a0, cloth: 0x558844, accent: 0x88aa55 });
    C('ember', { skin: 0xffcc88, cloth: 0xdd4411, accent: 0xff6622 });
    C('coral', { skin: 0xc8e8ff, cloth: 0x2288aa, accent: 0x44bbdd });
    C('flint', { skin: 0xd0b088, cloth: 0x888899, accent: 0x885533 });
    C('sage', { skin: 0xf0e8d8, cloth: 0x6655aa, accent: 0xe8e8f0 });
    C('willow', { skin: 0xf0ddc0, cloth: 0x446633, accent: 0x558844 });
    C('pip', { skin: 0xf8e8d0, cloth: 0xdd8855, accent: 0xcc6644 });

    // === BUILDINGS ===
    this.makeCottage();
    this.makeBakery();
    this.makeLibrary();
    this.makeBlacksmith();
    this.makeDecoration('building_fountain', 'fountain');
    this.makeDecoration('building_lamp', 'lamp');
    this.makeDecoration('building_arch', 'arch');
    this.makeDecoration('building_flowerbed', 'flowerbed');
    this.makeDecoration('building_fence', 'fence');
    this.makeDecoration('building_well', 'well');

    // === CROPS ===
    this.makeCropStages('crop_wheat', COLORS.wheatYoung, COLORS.wheatRipe);
    this.makeCropStages('crop_carrot', COLORS.carrotGreen, COLORS.carrotOrange);
    this.makeCropStages('crop_pumpkin', COLORS.pumpkinGreen, COLORS.pumpkinOrange);
    this.makeCropStages('crop_starberry', 0x88cc88, COLORS.starberryPink);
    this.makeCropStages('crop_moonflower', 0x8888cc, COLORS.moonflowerPurple);
    this.makeSimpleTile('farm_plot', 0x6b4a2a, 0x7b5a3a);

    // === UI ===
    this.makeUIPanel();
    this.makeUIButton();
    this.makeHeart(true);
    this.makeHeart(false);
    this.makeItemIcons();
    this.makeCoinIcon();

    // === Particles ===
    this.makeParticle('particle_sparkle', 0xffdd88, 6);
    this.makeParticle('particle_leaf', 0x44aa44, 8);
    this.makeParticle('particle_firefly', 0xffff88, 4);
    this.makeParticle('particle_water', 0x88ccff, 5);

    // Fish for minigame
    this.makeFish('fish_sprite', 0xccccdd);
    // Mining rock
    this.makeMineRock('mine_rock');
  }

  // ── Tile Generators ──

  makeGrassTile(key, baseColor) {
    const g = this.add.graphics();
    const T = TILE_SIZE;
    g.fillStyle(baseColor);
    g.fillRect(0, 0, T, T);
    // Add subtle variation
    for (let i = 0; i < 5; i++) {
      const shade = Phaser.Display.Color.IntegerToColor(baseColor);
      const r = Phaser.Math.Clamp(shade.red + Phaser.Math.Between(-15, 15), 0, 255);
      const gr = Phaser.Math.Clamp(shade.green + Phaser.Math.Between(-15, 15), 0, 255);
      const b = Phaser.Math.Clamp(shade.blue + Phaser.Math.Between(-15, 15), 0, 255);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b));
      g.fillRect(
        Phaser.Math.Between(0, T - 4),
        Phaser.Math.Between(0, T - 4),
        Phaser.Math.Between(2, 6),
        Phaser.Math.Between(2, 6)
      );
    }
    g.generateTexture(key, T, T);
    g.destroy();
  }

  makeSimpleTile(key, color1, color2) {
    const g = this.add.graphics();
    const T = TILE_SIZE;
    g.fillStyle(color1);
    g.fillRect(0, 0, T, T);
    g.fillStyle(color2, 0.3);
    for (let i = 0; i < 3; i++) {
      g.fillRect(Phaser.Math.Between(0, T-5), Phaser.Math.Between(0, T-5), 5, 5);
    }
    g.generateTexture(key, T, T);
    g.destroy();
  }

  makeWaterTile(key) {
    const g = this.add.graphics();
    const T = TILE_SIZE;
    g.fillStyle(COLORS.water);
    g.fillRect(0, 0, T, T);
    g.fillStyle(COLORS.waterLight, 0.3);
    g.fillRect(2, 8, 12, 2);
    g.fillRect(16, 4, 10, 2);
    g.fillRect(6, 20, 14, 2);
    g.generateTexture(key, T, T);
    g.destroy();
  }

  // ── Nature ──

  makeTree(key, leafColor, trunkColor) {
    const g = this.add.graphics();
    const w = 48, h = 64;
    // Trunk
    g.fillStyle(trunkColor);
    g.fillRect(19, 36, 10, 28);
    // Leaves (layered circles)
    g.fillStyle(leafColor);
    g.fillCircle(24, 28, 18);
    g.fillCircle(16, 22, 12);
    g.fillCircle(32, 22, 12);
    g.fillCircle(24, 16, 10);
    // Highlight
    const lighter = Phaser.Display.Color.IntegerToColor(leafColor);
    g.fillStyle(Phaser.Display.Color.GetColor(
      Math.min(255, lighter.red + 30),
      Math.min(255, lighter.green + 30),
      lighter.blue
    ), 0.5);
    g.fillCircle(20, 20, 6);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  makeBush(key, color) {
    const g = this.add.graphics();
    g.fillStyle(color);
    g.fillCircle(16, 18, 12);
    g.fillCircle(10, 20, 8);
    g.fillCircle(22, 20, 8);
    g.fillStyle(0xffffff, 0.15);
    g.fillCircle(14, 14, 4);
    g.generateTexture(key, 32, 28);
    g.destroy();
  }

  makeRock(key, color) {
    const g = this.add.graphics();
    g.fillStyle(color);
    // Irregular rock shape using overlapping ellipses
    g.fillCircle(14, 14, 10);
    g.fillCircle(20, 16, 8);
    g.fillCircle(10, 18, 7);
    g.fillStyle(0xffffff, 0.15);
    g.fillCircle(12, 10, 4);
    g.generateTexture(key, 28, 26);
    g.destroy();
  }

  makeFlower(key, color) {
    const g = this.add.graphics();
    // Stem
    g.fillStyle(0x44aa44);
    g.fillRect(7, 10, 2, 8);
    // Petals
    g.fillStyle(color);
    g.fillCircle(8, 8, 4);
    g.fillCircle(5, 6, 3);
    g.fillCircle(11, 6, 3);
    g.fillCircle(8, 4, 3);
    // Center
    g.fillStyle(0xffee44);
    g.fillCircle(8, 7, 2);
    g.generateTexture(key, 16, 18);
    g.destroy();
  }

  // ── Characters ──

  makeCharSprite(key, skinColor, clothColor, hairColor) {
    const g = this.add.graphics();
    const w = 24, h = 32;
    // Body (cloth)
    g.fillStyle(clothColor);
    g.fillRoundedRect(6, 14, 12, 14, 3);
    // Head
    g.fillStyle(skinColor);
    g.fillCircle(12, 10, 7);
    // Hair
    g.fillStyle(hairColor);
    g.fillCircle(12, 7, 6);
    g.fillRect(6, 4, 12, 4);
    // Eyes
    g.fillStyle(0x2a2a3a);
    g.fillCircle(9, 10, 1.5);
    g.fillCircle(15, 10, 1.5);
    // Feet
    g.fillStyle(clothColor === 0x888899 ? 0x666677 : 0x6b4226);
    g.fillRect(7, 27, 4, 4);
    g.fillRect(13, 27, 4, 4);

    g.generateTexture(key, w, h);
    g.destroy();
  }

  // ── Buildings ──

  makeCottage() {
    const g = this.add.graphics();
    const w = 96, h = 96;
    // Base/walls
    g.fillStyle(COLORS.woodWall);
    g.fillRoundedRect(8, 32, 80, 56, 4);
    // Roof
    g.fillStyle(COLORS.roofRed);
    g.fillTriangle(48, 8, 4, 40, 92, 40);
    // Door
    g.fillStyle(COLORS.door);
    g.fillRoundedRect(38, 56, 20, 32, { tl: 8, tr: 8, bl: 0, br: 0 });
    // Windows
    g.fillStyle(COLORS.window);
    g.fillRoundedRect(14, 48, 16, 14, 3);
    g.fillRoundedRect(66, 48, 16, 14, 3);
    // Window detail
    g.lineStyle(1, 0x8899aa);
    g.strokeRect(14, 48, 16, 14);
    g.strokeRect(66, 48, 16, 14);
    // Chimney
    g.fillStyle(COLORS.stoneDark);
    g.fillRect(72, 12, 10, 24);

    g.generateTexture('building_cottage', w, h);
    g.destroy();
  }

  makeBakery() {
    const g = this.add.graphics();
    const w = 96, h = 96;
    // Walls
    g.fillStyle(0xf5e6d0);
    g.fillRoundedRect(8, 32, 80, 56, 4);
    // Roof
    g.fillStyle(COLORS.roofPurple);
    g.fillTriangle(48, 8, 4, 40, 92, 40);
    // Door
    g.fillStyle(COLORS.door);
    g.fillRoundedRect(38, 56, 20, 32, { tl: 8, tr: 8, bl: 0, br: 0 });
    // Windows
    g.fillStyle(COLORS.window);
    g.fillRoundedRect(14, 48, 16, 14, 3);
    g.fillRoundedRect(66, 48, 16, 14, 3);
    // Sign (bread icon)
    g.fillStyle(0xddbb66);
    g.fillCircle(48, 44, 6);
    // Chimney with smoke
    g.fillStyle(COLORS.stoneDark);
    g.fillRect(72, 12, 10, 24);
    g.fillStyle(0xcccccc, 0.5);
    g.fillCircle(77, 8, 4);
    g.fillCircle(79, 3, 3);

    g.generateTexture('building_bakery', w, h);
    g.destroy();
  }

  makeLibrary() {
    const g = this.add.graphics();
    const w = 96, h = 96;
    // Walls
    g.fillStyle(0xd0c8e0);
    g.fillRoundedRect(8, 32, 80, 56, 4);
    // Roof
    g.fillStyle(COLORS.roofBlue);
    g.fillTriangle(48, 8, 4, 40, 92, 40);
    // Big arched door
    g.fillStyle(COLORS.door);
    g.fillRoundedRect(32, 48, 32, 40, { tl: 12, tr: 12, bl: 0, br: 0 });
    // Windows - circular
    g.fillStyle(COLORS.window);
    g.fillCircle(18, 52, 8);
    g.fillCircle(78, 52, 8);
    // Book symbol
    g.fillStyle(0x8866aa);
    g.fillRect(42, 54, 12, 8);

    g.generateTexture('building_library', w, h);
    g.destroy();
  }

  makeBlacksmith() {
    const g = this.add.graphics();
    const w = 96, h = 64;
    // Walls
    g.fillStyle(0x8a7a6a);
    g.fillRoundedRect(4, 16, 88, 44, 4);
    // Roof
    g.fillStyle(0x5a4a3a);
    g.fillRect(0, 12, 96, 10);
    // Opening (no door - open forge)
    g.fillStyle(0x332211);
    g.fillRect(34, 28, 28, 32);
    // Forge glow
    g.fillStyle(0xff6622, 0.5);
    g.fillCircle(48, 44, 10);
    // Anvil
    g.fillStyle(0x555555);
    g.fillRect(14, 44, 14, 8);
    g.fillRect(12, 48, 18, 6);

    g.generateTexture('building_blacksmith', w, h);
    g.destroy();
  }

  makeDecoration(key, type) {
    const g = this.add.graphics();
    switch (type) {
      case 'fountain': {
        g.fillStyle(COLORS.stoneLight);
        g.fillCircle(32, 32, 20);
        g.fillStyle(COLORS.water);
        g.fillCircle(32, 32, 14);
        g.fillStyle(COLORS.waterLight, 0.5);
        g.fillCircle(32, 28, 4);
        // Center pillar
        g.fillStyle(COLORS.stoneLight);
        g.fillRect(28, 20, 8, 16);
        g.generateTexture(key, 64, 64);
        break;
      }
      case 'lamp': {
        g.fillStyle(0x555555);
        g.fillRect(14, 8, 4, 24);
        g.fillStyle(0xffdd66);
        g.fillCircle(16, 6, 5);
        g.fillStyle(0xffff88, 0.4);
        g.fillCircle(16, 6, 8);
        g.generateTexture(key, 32, 32);
        break;
      }
      case 'arch': {
        g.fillStyle(COLORS.woodWall);
        g.fillRect(2, 8, 6, 40);
        g.fillRect(56, 8, 6, 40);
        g.lineStyle(4, COLORS.woodWall);
        g.beginPath();
        g.arc(32, 12, 28, Math.PI, 0, false);
        g.strokePath();
        // Flowers on arch
        g.fillStyle(COLORS.flowerPink);
        g.fillCircle(16, 6, 3);
        g.fillCircle(32, 2, 3);
        g.fillCircle(48, 6, 3);
        g.generateTexture(key, 64, 48);
        break;
      }
      case 'flowerbed': {
        g.fillStyle(COLORS.dirt);
        g.fillRoundedRect(0, 12, 64, 16, 4);
        g.fillStyle(COLORS.flowerPink);
        g.fillCircle(10, 10, 4);
        g.fillCircle(32, 8, 4);
        g.fillCircle(54, 10, 4);
        g.fillStyle(COLORS.flowerYellow);
        g.fillCircle(20, 12, 3);
        g.fillCircle(44, 12, 3);
        g.generateTexture(key, 64, 28);
        break;
      }
      case 'fence': {
        g.fillStyle(COLORS.woodWall);
        g.fillRect(2, 8, 4, 22);
        g.fillRect(26, 8, 4, 22);
        g.fillRect(0, 12, 32, 4);
        g.fillRect(0, 22, 32, 4);
        g.generateTexture(key, 32, 32);
        break;
      }
      case 'well': {
        g.fillStyle(COLORS.stone);
        g.fillCircle(16, 18, 12);
        g.fillStyle(COLORS.waterDeep);
        g.fillCircle(16, 18, 8);
        g.fillStyle(COLORS.woodWall);
        g.fillRect(4, 4, 3, 20);
        g.fillRect(25, 4, 3, 20);
        g.fillRect(3, 4, 26, 3);
        g.generateTexture(key, 32, 32);
        break;
      }
    }
    g.destroy();
  }

  // ── Crops ──

  makeCropStages(prefix, youngColor, ripeColor) {
    for (let stage = 0; stage < 4; stage++) {
      const g = this.add.graphics();
      const T = TILE_SIZE;
      const progress = stage / 3;
      const yc = Phaser.Display.Color.IntegerToColor(youngColor);
      const rc = Phaser.Display.Color.IntegerToColor(ripeColor);
      const cr = Math.round(yc.red + (rc.red - yc.red) * progress);
      const cg = Math.round(yc.green + (rc.green - yc.green) * progress);
      const cb = Math.round(yc.blue + (rc.blue - yc.blue) * progress);
      const c = Phaser.Display.Color.GetColor(cr, cg, cb);

      if (stage === 0) {
        // Seedling
        g.fillStyle(c);
        g.fillRect(14, 22, 4, 10);
        g.fillCircle(16, 20, 3);
      } else if (stage === 1) {
        // Small plant
        g.fillStyle(c);
        g.fillRect(14, 16, 4, 16);
        g.fillCircle(12, 14, 4);
        g.fillCircle(20, 14, 4);
      } else if (stage === 2) {
        // Medium plant
        g.fillStyle(c);
        g.fillRect(14, 10, 4, 22);
        g.fillCircle(10, 10, 5);
        g.fillCircle(22, 10, 5);
        g.fillCircle(16, 6, 4);
      } else {
        // Fully grown with fruit
        g.fillStyle(c);
        g.fillRect(14, 6, 4, 26);
        g.fillCircle(10, 8, 6);
        g.fillCircle(22, 8, 6);
        g.fillCircle(16, 4, 5);
        // Sparkle (ready to harvest)
        g.fillStyle(0xffffff, 0.7);
        g.fillCircle(8, 4, 2);
        g.fillCircle(24, 4, 2);
      }
      g.generateTexture(`${prefix}_${stage}`, T, T);
      g.destroy();
    }
  }

  // ── UI Elements ──

  makeUIPanel() {
    const g = this.add.graphics();
    g.fillStyle(COLORS.uiPanel, 0.95);
    g.fillRoundedRect(0, 0, 200, 200, 12);
    g.lineStyle(2, COLORS.uiBorder, 0.8);
    g.strokeRoundedRect(0, 0, 200, 200, 12);
    g.generateTexture('ui_panel', 200, 200);
    g.destroy();
  }

  makeUIButton() {
    const g = this.add.graphics();
    g.fillStyle(COLORS.uiButton);
    g.fillRoundedRect(0, 0, 120, 40, 8);
    g.lineStyle(1, COLORS.uiBorder, 0.5);
    g.strokeRoundedRect(0, 0, 120, 40, 8);
    g.generateTexture('ui_button', 120, 40);
    g.destroy();
  }

  makeHeart(full) {
    const g = this.add.graphics();
    g.fillStyle(full ? 0xff4466 : 0x555555);
    // Heart shape using circles + triangle
    g.fillCircle(6, 5, 5);
    g.fillCircle(14, 5, 5);
    g.fillTriangle(1, 7, 19, 7, 10, 18);
    g.generateTexture(full ? 'heart_full' : 'heart_empty', 20, 20);
    g.destroy();
  }

  makeItemIcons() {
    // Generic item icon
    const g = this.add.graphics();
    g.fillStyle(0xdddddd);
    g.fillRoundedRect(2, 2, 28, 28, 4);
    g.generateTexture('item_generic', 32, 32);
    g.destroy();

    // Coin
    const gc = this.add.graphics();
    gc.fillStyle(0xf0c040);
    gc.fillCircle(10, 10, 9);
    gc.fillStyle(0xd4a030);
    gc.fillCircle(10, 10, 6);
    gc.fillStyle(0xf0c040);
    gc.fillCircle(10, 10, 4);
    gc.generateTexture('icon_coin', 20, 20);
    gc.destroy();
  }

  makeCoinIcon() {
    // Already done in makeItemIcons
  }

  makeParticle(key, color, size) {
    const g = this.add.graphics();
    g.fillStyle(color);
    g.fillCircle(size/2, size/2, size/2);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  makeFish(key, color) {
    const g = this.add.graphics();
    g.fillStyle(color);
    // Fish body
    g.fillCircle(20, 12, 8);
    g.fillCircle(14, 12, 7);
    // Tail
    g.fillTriangle(6, 12, 0, 4, 0, 20);
    // Eye
    g.fillStyle(0x222222);
    g.fillCircle(24, 10, 2);
    // Fin
    g.fillStyle(color, 0.7);
    g.fillTriangle(16, 12, 12, 4, 20, 4);
    g.generateTexture(key, 30, 24);
    g.destroy();
  }

  makeMineRock(key) {
    const g = this.add.graphics();
    // Large rock
    g.fillStyle(0x7a7a8a);
    g.fillCircle(24, 24, 18);
    g.fillCircle(16, 20, 14);
    g.fillCircle(32, 22, 12);
    // Cracks
    g.lineStyle(1, 0x5a5a6a);
    g.beginPath();
    g.moveTo(20, 14);
    g.lineTo(24, 22);
    g.lineTo(28, 18);
    g.strokePath();
    // Gem sparkle
    g.fillStyle(0xaaddff, 0.6);
    g.fillCircle(28, 16, 3);
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(30, 14, 1.5);
    g.generateTexture(key, 48, 42);
    g.destroy();
  }
}
