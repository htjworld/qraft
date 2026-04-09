import type { BlockData } from '../../shared/types';
import { BLOCK_SIZE, MAX_BLOCKS, DogVoxelType } from './constants';

function isEyeZone(col: number, row: number, gridSize: number): boolean {
  const eyeY      = gridSize * 0.38;
  const leftEyeX  = gridSize * 0.34;
  const rightEyeX = gridSize * 0.66;
  const eyeRadius = gridSize * 0.09;
  const dL = Math.sqrt((col - leftEyeX) ** 2 + (row - eyeY) ** 2);
  const dR = Math.sqrt((col - rightEyeX) ** 2 + (row - eyeY) ** 2);
  return dL < eyeRadius || dR < eyeRadius;
}

function isMuzzleZone(col: number, row: number, gridSize: number): boolean {
  const top   = gridSize * 0.48;
  const bot   = gridSize * 0.70;
  const left  = gridSize * 0.30;
  const right = gridSize * 0.70;
  return row > top && row < bot && col > left && col < right;
}

function isCollarZone(row: number, gridSize: number): boolean {
  return row > gridSize * 0.83 && row < gridSize * 0.93;
}

export function generateDogBlocks(qrMatrix: boolean[][]): BlockData {
  const gridSize = qrMatrix.length;
  const cubeH    = BLOCK_SIZE;

  const positions: number[] = [];
  const heights:   number[] = [];
  const baseY:     number[] = [];
  const types:     number[] = [];

  function addBlock(col: number, row: number, bY: number, h: number, type: DogVoxelType) {
    if ((positions.length / 4) >= MAX_BLOCKS) return;
    positions.push(col, row, 0, 0);
    heights.push(h);
    baseY.push(bY);
    types.push(type);
  }

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const isDark   = qrMatrix[row][col];
      const inEye    = isEyeZone(col, row, gridSize);
      const inMuzzle = isMuzzleZone(col, row, gridSize);
      const inCollar = isCollarZone(row, gridSize);

      if (!isDark) {
        if (inEye) {
          // Light QR cells inside eye zone → white sclera, raised for 3D depth
          addBlock(col, row, 0,      cubeH, DogVoxelType.EyeWhite);
          addBlock(col, row, cubeH,  cubeH, DogVoxelType.EyeWhite);
        } else {
          addBlock(col, row, 0, cubeH, DogVoxelType.Light);
        }
        continue;
      }

      // Dark QR modules
      if (inEye) {
        // Dark cells inside eye zone → iris / pupil ring, tallest feature
        addBlock(col, row, 0,          cubeH, DogVoxelType.EyeRing);
        addBlock(col, row, cubeH,      cubeH, DogVoxelType.EyeRing);
        addBlock(col, row, cubeH * 2,  cubeH, DogVoxelType.EyeRing);
      } else if (inCollar) {
        addBlock(col, row, 0, cubeH, DogVoxelType.Collar);
      } else if (inMuzzle) {
        addBlock(col, row, 0,     cubeH, DogVoxelType.Brown);
        addBlock(col, row, cubeH, cubeH, DogVoxelType.Brown);
      } else {
        addBlock(col, row, 0,     cubeH, DogVoxelType.DarkFur);
        addBlock(col, row, cubeH, cubeH, DogVoxelType.DarkFur);
      }
    }
  }

  const numBlocks = positions.length / 4;
  return { positions, heights, baseY, types, gridSize, numBlocks };
}
