import { cherryBlossomStyle } from './cherry-blossom';
import { catStyle } from './cat';
import { dogStyle } from './dog';
import type { QraftStyle } from './types';

const STYLES: QraftStyle[] = [
  cherryBlossomStyle,
  catStyle,
  dogStyle,
];

export function getInitialStyle(): QraftStyle {
  const index = Math.floor(Date.now() / 1000) % STYLES.length;
  return STYLES[index];
}

export function getStyleById(id: string): QraftStyle {
  return STYLES.find(s => s.id === id) ?? STYLES[0];
}

export function getAllStyles(): QraftStyle[] {
  return STYLES;
}
