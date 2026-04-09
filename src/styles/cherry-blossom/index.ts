import type { QraftStyle } from '../types';
import { generateCherryBlocks } from './blocks';
import { CHERRY_CONSTANTS } from './constants';
import { cherryVertexShader } from './shaders/vertex';
import { cherryFragmentShader } from './shaders/fragment';
import { cherrySkyVertex, cherrySkyFragment } from './shaders/sky';
import { cherryShadowVertex, cherryShadowFragment } from './shaders/shadow';

export const cherryBlossomStyle: QraftStyle = {
  id: 'cherry-blossom',
  label: '벚꽃나무',
  emoji: '🌸',
  generateBlocks: generateCherryBlocks,
  vertexShader: cherryVertexShader,
  fragmentShader: cherryFragmentShader,
  skyVertexShader: cherrySkyVertex,
  skyFragmentShader: cherrySkyFragment,
  shadowVertexShader: cherryShadowVertex,
  shadowFragmentShader: cherryShadowFragment,
  constants: CHERRY_CONSTANTS,
};
