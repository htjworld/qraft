import type { QraftStyle } from '../types';
import { generateDogBlocks } from './blocks';
import { DOG_CONSTANTS } from './constants';
import { dogVertexShader } from './shaders/vertex';
import { dogFragmentShader } from './shaders/fragment';
import { dogSkyVertex, dogSkyFragment } from './shaders/sky';
import { dogShadowVertex, dogShadowFragment } from './shaders/shadow';

export const dogStyle: QraftStyle = {
  id: 'dog',
  label: '강아지',
  emoji: '🐶',
  generateBlocks: generateDogBlocks,
  vertexShader: dogVertexShader,
  fragmentShader: dogFragmentShader,
  skyVertexShader: dogSkyVertex,
  skyFragmentShader: dogSkyFragment,
  shadowVertexShader: dogShadowVertex,
  shadowFragmentShader: dogShadowFragment,
  constants: DOG_CONSTANTS,
};
