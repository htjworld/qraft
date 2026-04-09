import type { BlockData } from '../../shared/types';
import {
  BLOCK_SIZE,
  TRUNK_RADIUS,
  TRUNK_LAYERS,
  MAX_CANOPY_LAYERS,
  CANOPY_OUTER_RADIUS_FACTOR,
  MAX_BLOCKS,
  CherryBlockType,
} from './constants';

function pseudoRandom(col: number, row: number, seed: number = 0): number {
  const s = Math.sin(col * 127.1 + row * 311.7 + seed * 43.7) * 43758.5;
  return s - Math.floor(s);
}

export function generateCherryBlocks(qrMatrix: boolean[][]): BlockData {
  const gridSize = qrMatrix.length;
  const cx = gridSize / 2;
  const cy = gridSize / 2;
  const canopyOuterRadius = gridSize * CANOPY_OUTER_RADIUS_FACTOR;
  const cubeH = BLOCK_SIZE;

  const positions: number[] = [];
  const heights: number[] = [];
  const baseY: number[] = [];
  const types: number[] = [];

  function addBlock(col: number, row: number, bY: number, h: number, type: CherryBlockType) {
    positions.push(col, row, 0, 0);
    heights.push(h);
    baseY.push(bY);
    types.push(type);
  }

  // Pass 1: Ground layer for all cells
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const dx = col - cx;
      const dy = row - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isDark = qrMatrix[row][col];

      let type: CherryBlockType;
      if (!isDark) {
        type = CherryBlockType.Dirt;
      } else if (dist < TRUNK_RADIUS) {
        type = CherryBlockType.Trunk;
      } else if (dist >= canopyOuterRadius) {
        type = CherryBlockType.Grass;
      } else {
        type = CherryBlockType.FallenPetals;
      }
      addBlock(col, row, 0, cubeH, type);
    }
  }

  // Pass 2: Trunk vertical stack
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const dx = col - cx;
      const dy = row - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (!qrMatrix[row][col] || dist >= TRUNK_RADIUS) continue;

      for (let layer = 1; layer < TRUNK_LAYERS; layer++) {
        addBlock(col, row, layer * cubeH, cubeH, CherryBlockType.Trunk);
      }
    }
  }

  // Pass 3: Canopy dome
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const dx = col - cx;
      const dy = row - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (!qrMatrix[row][col] || dist >= canopyOuterRadius || dist < TRUNK_RADIUS) continue;

      const t = 1 - dist / canopyOuterRadius;
      const layersHere = Math.max(3, Math.round(MAX_CANOPY_LAYERS * (0.25 + 0.75 * t * t)));
      const domeOffset = Math.floor(t * 3) * cubeH;
      const startY = TRUNK_LAYERS * cubeH + domeOffset;

      for (let layer = 0; layer < layersHere; layer++) {
        addBlock(col, row, startY + layer * cubeH, cubeH, CherryBlockType.CherryBlossom);
      }

      // Extra random blocks for organic shape
      const extraCount = Math.floor(pseudoRandom(col, row, 500) * 4);
      for (let e = 0; e < extraCount; e++) {
        addBlock(col, row, startY + layersHere * cubeH + e * cubeH, cubeH, CherryBlockType.CherryBlossom);
      }
    }
  }

  const numBlocks = Math.min(positions.length / 4, MAX_BLOCKS);

  return {
    positions: positions.slice(0, numBlocks * 4),
    heights: heights.slice(0, numBlocks),
    baseY: baseY.slice(0, numBlocks),
    types: types.slice(0, numBlocks),
    gridSize,
    numBlocks,
  };
}
