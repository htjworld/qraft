import type { BlockData } from '../shared/types';

export interface StyleConstants {
  blockSize: number;
  maxBlocks: number;
  isoAngleY: number;
  isoAngleX: number;
  flatAngleY: number;
  flatAngleX: number;
  viewScale3D: number;
  viewScale2D: number;
  lerpSpeed: number;
  yOffset3D: number;
  xOffset3D: number;
  yOffset2D: number;
  xOffset2D: number;
}

export interface QraftStyle {
  id: string;
  label: string;
  emoji: string;

  generateBlocks(qrMatrix: boolean[][]): BlockData;

  vertexShader: string;
  fragmentShader: string;
  skyVertexShader: string;
  skyFragmentShader: string;
  shadowVertexShader: string;
  shadowFragmentShader: string;

  constants: StyleConstants;
}
