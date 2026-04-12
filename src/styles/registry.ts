import { cherryBlossomStyle } from './cherry-blossom';
import { springTreeStyle } from './spring-tree';
import { autumnTreeStyle } from './autumn-tree';
import { winterTreeStyle } from './winter-tree';
import type { QraftStyle } from './types';

const STYLES: QraftStyle[] = [
  cherryBlossomStyle,
  springTreeStyle,
  autumnTreeStyle,
  winterTreeStyle,
];

export function getInitialStyle(): QraftStyle {
  return STYLES[0];
}

export function getStyleById(id: string): QraftStyle {
  return STYLES.find(s => s.id === id) ?? STYLES[0];
}

export function getAllStyles(): QraftStyle[] {
  return STYLES;
}
