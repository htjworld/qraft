import type { StyleConstants } from '../types';

export const BLOCK_SIZE = 0.0245;
export const TRUNK_RADIUS = 2.5;
export const TRUNK_LAYERS = 12;
export const MAX_CANOPY_LAYERS = 12;
export const CANOPY_OUTER_RADIUS_FACTOR = 0.46;
export const MAX_GRID_SIZE = 41;
export const MAX_BLOCKS = MAX_GRID_SIZE * MAX_GRID_SIZE * 18;

export enum CherryBlockType {
  Dirt = 0,
  CherryBlossom = 1,
  Trunk = 2,
  Grass = 3,
  FallenPetals = 4,
}

// Lighting palette (injected into WGSL as constants)
export const PALETTE = {
  skyZenith:  { r: 0.82, g: 0.88, b: 0.92 },
  skyHorizon: { r: 0.91, g: 0.93, b: 0.91 },
  sun:        { r: 1.15, g: 1.05, b: 0.95 },
  skyFill:    { r: 0.85, g: 0.90, b: 0.95 },
  bounce:     { r: 0.50, g: 0.65, b: 0.42 },
} as const;

export const CHERRY_CONSTANTS: StyleConstants = {
  blockSize:   BLOCK_SIZE,
  maxBlocks:   MAX_BLOCKS,
  isoAngleY:   0.78,
  isoAngleX:  -0.55,
  flatAngleY:  0.0,
  flatAngleX: -1.5708,
  viewScale3D: 1.6,
  viewScale2D: 2.1,
  lerpSpeed:   4.0,
  yOffset3D:  -0.22,   // shift scene down in 3D so tree canopy center ≈ canvas center
  xOffset3D:   0.0,
  yOffset2D:   0.08,
  xOffset2D:   0.015,
};
