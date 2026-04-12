import type { StyleConstants } from '../types';

// Lighting palette for autumn (golden warm sun, orange bounce)
export const AUTUMN_PALETTE = {
  sun:     { r: 1.25, g: 1.05, b: 0.80 },
  skyFill: { r: 0.90, g: 0.88, b: 0.80 },
  bounce:  { r: 0.55, g: 0.38, b: 0.15 },
} as const;

export const AUTUMN_CONSTANTS: StyleConstants = {
  blockSize:   0.0245,
  maxBlocks:   177 * 177 * 18,
  isoAngleY:   0.78,
  isoAngleX:  -0.55,
  flatAngleY:  0.0,
  flatAngleX: -1.5708,
  viewScale3D: 1.6,
  viewScale2D: 2.1,
  lerpSpeed:   4.0,
  yOffset3D:  -0.25,
  xOffset3D:   0.0,
  yOffset2D:   0.08,
  xOffset2D:   0.015,
};
