export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface BlockData {
  positions: number[];  // [col, row, 0, 0] × N (vec4f 정렬)
  heights: number[];    // 블록 높이 × N
  baseY: number[];      // 블록 바닥 Y 좌표 × N
  types: number[];      // 블록 타입 enum × N
  gridSize: number;
  numBlocks: number;
}
