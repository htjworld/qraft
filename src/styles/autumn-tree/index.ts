import type { QraftStyle } from '../types';
import { generateCherryBlocks } from '../cherry-blossom/blocks';
import { cherryVertexShader } from '../cherry-blossom/shaders/vertex';
import { cherrySkyVertex, cherrySkyFragment } from '../cherry-blossom/shaders/sky';
import { cherryShadowVertex, cherryShadowFragment } from '../cherry-blossom/shaders/shadow';
import { autumnFragmentShader } from './shaders/fragment';
import { AUTUMN_CONSTANTS } from './constants';

export const autumnTreeStyle: QraftStyle = {
  id: 'autumn-tree',
  label: '가을나무',
  emoji: '🍂',
  generateBlocks: generateCherryBlocks,
  vertexShader: cherryVertexShader,
  fragmentShader: autumnFragmentShader,
  skyVertexShader: cherrySkyVertex,
  skyFragmentShader: cherrySkyFragment,
  shadowVertexShader: cherryShadowVertex,
  shadowFragmentShader: cherryShadowFragment,
  constants: AUTUMN_CONSTANTS,
};
