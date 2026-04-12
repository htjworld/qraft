import type { QraftStyle } from '../types';
import { generateCherryBlocks } from '../cherry-blossom/blocks';
import { cherryVertexShader } from '../cherry-blossom/shaders/vertex';
import { cherrySkyVertex, cherrySkyFragment } from '../cherry-blossom/shaders/sky';
import { cherryShadowVertex, cherryShadowFragment } from '../cherry-blossom/shaders/shadow';
import { winterFragmentShader } from './shaders/fragment';
import { WINTER_CONSTANTS } from './constants';

export const winterTreeStyle: QraftStyle = {
  id: 'winter-tree',
  label: '겨울나무',
  emoji: '❄️',
  generateBlocks: generateCherryBlocks,
  vertexShader: cherryVertexShader,
  fragmentShader: winterFragmentShader,
  skyVertexShader: cherrySkyVertex,
  skyFragmentShader: cherrySkyFragment,
  shadowVertexShader: cherryShadowVertex,
  shadowFragmentShader: cherryShadowFragment,
  constants: WINTER_CONSTANTS,
};
