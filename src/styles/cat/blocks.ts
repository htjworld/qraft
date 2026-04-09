import type { BlockData } from '../../shared/types';
import { BLOCK_SIZE, MAX_BLOCKS, CatBlockType } from './constants';

function isEarCorner(col: number, row: number, gridSize: number): boolean {
  const isTop = row < gridSize * 0.3;
  const isLeft = col < gridSize * 0.3;
  const isRight = col > gridSize * 0.7;
  if (isTop && isLeft) return (col + row) < gridSize * 0.35;
  if (isTop && isRight) return ((gridSize - col) + row) < gridSize * 0.35;
  return false;
}

function isPawCorner(col: number, row: number, gridSize: number): boolean {
  const pawRadius = gridSize * 0.08;
  const pawCenters = [
    { x: gridSize * 0.2, y: gridSize * 0.85 },
    { x: gridSize * 0.8, y: gridSize * 0.85 },
  ];
  return pawCenters.some(c => {
    const d = Math.sqrt((col - c.x) ** 2 + (row - c.y) ** 2);
    return d < pawRadius;
  });
}

export function generateCatBlocks(qrMatrix: boolean[][]): BlockData {
  const gridSize = qrMatrix.length;
  const cx = gridSize / 2;
  const cy = gridSize / 2;
  const noseRadius = 1.5;
  const cubeH = BLOCK_SIZE;

  const positions: number[] = [];
  const heights: number[] = [];
  const baseY: number[] = [];
  const types: number[] = [];

  function addBlock(col: number, row: number, bY: number, h: number, type: CatBlockType) {
    if ((positions.length / 4) >= MAX_BLOCKS) return;
    positions.push(col, row, 0, 0);
    heights.push(h);
    baseY.push(bY);
    types.push(type);
  }

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const dx = col - cx;
      const dy = row - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isDark = qrMatrix[row][col];

      if (!isDark) {
        addBlock(col, row, 0, cubeH, CatBlockType.Light);
        continue;
      }

      let type: CatBlockType;
      if (dist < noseRadius) {
        type = CatBlockType.Nose;
      } else if (isEarCorner(col, row, gridSize)) {
        type = CatBlockType.Ear;
      } else if (isPawCorner(col, row, gridSize)) {
        type = CatBlockType.PawPad;
      } else {
        type = CatBlockType.Fur;
      }

      addBlock(col, row, 0, cubeH, type);

      // Height stacking based on type
      let extraLayers = 0;
      if (type === CatBlockType.Nose) {
        extraLayers = 2;
      } else if (type === CatBlockType.Ear) {
        // Ears get taller toward corners
        const distToCornerL = Math.sqrt(col ** 2 + row ** 2);
        const distToCornerR = Math.sqrt((gridSize - col) ** 2 + row ** 2);
        const minDist = Math.min(distToCornerL, distToCornerR);
        extraLayers = Math.max(0, Math.round(8 * (1 - minDist / (gridSize * 0.35))));
      } else if (type === CatBlockType.PawPad) {
        extraLayers = 1;
      } else if (type === CatBlockType.Fur) {
        extraLayers = 1;
      }

      for (let layer = 1; layer <= extraLayers; layer++) {
        addBlock(col, row, layer * cubeH, cubeH, type);
      }
    }
  }

  const numBlocks = positions.length / 4;
  return {
    positions,
    heights,
    baseY,
    types,
    gridSize,
    numBlocks,
  };
}
