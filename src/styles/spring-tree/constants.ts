import type { StyleConstants } from '../types';

// Lighting palette for spring (fresh green, warm sun, green bounce)
export const SPRING_PALETTE = {
  sun:     { r: 1.10, g: 1.05, b: 0.90 },
  skyFill: { r: 0.80, g: 0.92, b: 0.85 },
  bounce:  { r: 0.30, g: 0.60, b: 0.25 },
} as const;

export const SPRING_CONSTANTS: StyleConstants = {
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
