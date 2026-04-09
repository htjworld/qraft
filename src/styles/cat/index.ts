import type { QraftStyle } from '../types';
import { generateCatBlocks } from './blocks';
import { CAT_CONSTANTS } from './constants';
import { catVertexShader } from './shaders/vertex';
import { catFragmentShader } from './shaders/fragment';
import { catSkyVertex, catSkyFragment } from './shaders/sky';
import { catShadowVertex, catShadowFragment } from './shaders/shadow';

export const catStyle: QraftStyle = {
  id: 'cat',
  label: '고양이',
  emoji: '🐱',
  generateBlocks: generateCatBlocks,
  vertexShader: catVertexShader,
  fragmentShader: catFragmentShader,
  skyVertexShader: catSkyVertex,
  skyFragmentShader: catSkyFragment,
  shadowVertexShader: catShadowVertex,
  shadowFragmentShader: catShadowFragment,
  constants: CAT_CONSTANTS,
};
