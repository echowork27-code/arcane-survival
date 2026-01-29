// Grid-based placement logic
import { TILE_SIZE, MAP_COLS, MAP_ROWS } from '../config.js';

export class GridManager {
  constructor() {
    // 0 = empty, 1 = blocked (natural), 2 = building, 3 = crop, 4 = water, 5 = path
    this.grid = [];
    for (let y = 0; y < MAP_ROWS; y++) {
      this.grid[y] = new Array(MAP_COLS).fill(0);
    }
  }

  setTile(x, y, val) {
    if (this.inBounds(x, y)) this.grid[y][x] = val;
  }

  getTile(x, y) {
    if (!this.inBounds(x, y)) return 1; // out of bounds = blocked
    return this.grid[y][x];
  }

  inBounds(x, y) {
    return x >= 0 && x < MAP_COLS && y >= 0 && y < MAP_ROWS;
  }

  isWalkable(x, y) {
    const t = this.getTile(x, y);
    return t === 0 || t === 3 || t === 5; // empty, crop, path
  }

  canPlace(x, y, w, h) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const t = this.getTile(x + dx, y + dy);
        if (t !== 0 && t !== 5) return false; // can only place on empty or path
      }
    }
    return true;
  }

  placeBuilding(x, y, w, h) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        this.setTile(x + dx, y + dy, 2);
      }
    }
  }

  removeBuilding(x, y, w, h) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        this.setTile(x + dx, y + dy, 0);
      }
    }
  }

  placeCrop(x, y) {
    this.setTile(x, y, 3);
  }

  removeCrop(x, y) {
    this.setTile(x, y, 0);
  }

  tileToWorld(tileX, tileY) {
    return {
      x: tileX * TILE_SIZE + TILE_SIZE / 2,
      y: tileY * TILE_SIZE + TILE_SIZE / 2,
    };
  }

  worldToTile(worldX, worldY) {
    return {
      x: Math.floor(worldX / TILE_SIZE),
      y: Math.floor(worldY / TILE_SIZE),
    };
  }
}
