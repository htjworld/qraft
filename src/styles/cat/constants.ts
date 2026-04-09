import type { StyleConstants } from '../types';

export const BLOCK_SIZE = 0.0245;
export const MAX_GRID_SIZE = 41;
export const MAX_BLOCKS = MAX_GRID_SIZE * MAX_GRID_SIZE * 12;

export enum CatBlockType {
  Light = 0,
  Fur = 1,
  Nose = 2,
  Ear = 3,
  PawPad = 4,
}

export const CAT_CONSTANTS: StyleConstants = {
  blockSize: BLOCK_SIZE,
  maxBlocks: MAX_BLOCKS,
  isoAngleY: 0.78,
  isoAngleX: -0.55,
  flatAngleY: 0.0,
  flatAngleX: -Math.PI / 2,
  viewScale3D: 1.6,
  viewScale2D: 2.1,
  lerpSpeed: 4.0,
  yOffset3D: -0.22,
  xOffset3D:  0.0,
  yOffset2D:  0.08,
  xOffset2D:  0.015,
};
