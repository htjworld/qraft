import type { StyleConstants } from '../types';

// Lighting palette for winter (cold pale sun, blue-tinted sky, cold bounce)
export const WINTER_PALETTE = {
  sun:     { r: 0.95, g: 0.98, b: 1.10 },
  skyFill: { r: 0.78, g: 0.84, b: 0.95 },
  bounce:  { r: 0.55, g: 0.62, b: 0.72 },
} as const;

export const WINTER_CONSTANTS: StyleConstants = {
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
