import { cherryBlossomStyle } from './cherry-blossom';
import type { QraftStyle } from './types';

const STYLES: QraftStyle[] = [
  cherryBlossomStyle,
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
