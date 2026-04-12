import type { QraftStyle } from '../types';
import { generateCherryBlocks } from '../cherry-blossom/blocks';
import { cherryVertexShader } from '../cherry-blossom/shaders/vertex';
import { cherrySkyVertex, cherrySkyFragment } from '../cherry-blossom/shaders/sky';
import { cherryShadowVertex, cherryShadowFragment } from '../cherry-blossom/shaders/shadow';
import { springFragmentShader } from './shaders/fragment';
import { SPRING_CONSTANTS } from './constants';

export const springTreeStyle: QraftStyle = {
  id: 'spring-tree',
  label: '봄나무',
  emoji: '🌿',
  generateBlocks: generateCherryBlocks,
  vertexShader: cherryVertexShader,
  fragmentShader: springFragmentShader,
  skyVertexShader: cherrySkyVertex,
  skyFragmentShader: cherrySkyFragment,
  shadowVertexShader: cherryShadowVertex,
  shadowFragmentShader: cherryShadowFragment,
  constants: SPRING_CONSTANTS,
};
