import { cherryBlossomStyle } from './cherry-blossom';
import { springTreeStyle } from './spring-tree';
import { autumnTreeStyle } from './autumn-tree';
import { winterTreeStyle } from './winter-tree';
import type { QraftStyle } from './types';

const STYLES: QraftStyle[] = [
  springTreeStyle,
  cherryBlossomStyle,
  autumnTreeStyle,
  winterTreeStyle,
];

export function getInitialStyle(): QraftStyle {
  return STYLES[Math.floor(Math.random() * STYLES.length)];
}

export function getAllStyles(): QraftStyle[] {
  return STYLES;
}
