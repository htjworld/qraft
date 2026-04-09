import type { StyleConstants } from '../types';

export const BLOCK_SIZE = 0.0245;
export const MAX_GRID_SIZE = 41;
export const MAX_BLOCKS = MAX_GRID_SIZE * MAX_GRID_SIZE * 10;

// Zone-based voxel dog block types
export enum DogVoxelType {
  Light    = 0,  // QR light modules — white background
  DarkFur  = 1,  // Near-black body / head
  Brown    = 2,  // Tan markings: muzzle, eyebrows, paws
  EyeRing  = 3,  // Dark QR cells inside eye zone (dark outline/pupil)
  EyeWhite = 4,  // Light QR cells inside eye zone (white of the eye)
  Collar   = 5,  // Red collar band
}

export const DOG_CONSTANTS: StyleConstants = {
  blockSize:   BLOCK_SIZE,
  maxBlocks:   MAX_BLOCKS,
  isoAngleY:   0.78,
  isoAngleX:  -0.55,
  flatAngleY:  0.0,
  flatAngleX: -1.5708,
  viewScale3D: 1.6,
  viewScale2D: 2.1,
  lerpSpeed:   4.0,
  yOffset3D:  -0.22,
  xOffset3D:   0.0,
  yOffset2D:   0.08,
  xOffset2D:   0.015,
};
