import { uniformsStruct } from '../../../shared/shaders/common';
import { BLOCK_SIZE, CAT_CONSTANTS } from '../constants';

export const catVertexShader = /* wgsl */`
${uniformsStruct}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read> blockTypes: array<u32>;
@group(0) @binding(2) var<storage, read> blockPositions: array<vec4f>;
@group(0) @binding(3) var<storage, read> blockHeights: array<f32>;
@group(0) @binding(4) var<storage, read> blockBaseY: array<f32>;

struct VertOut {
  @builtin(position) pos: vec4f,
  @location(0) col: f32,
  @location(1) row: f32,
  @location(2) layer: f32,
  @location(3) faceNx: f32,
  @location(4) faceNy: f32,
  @location(5) faceNz: f32,
  @location(6) blockType: f32,
  @location(7) uv: vec2f,
  @location(8) distFromCenter: f32,
}

const BLOCK_SIZE: f32 = ${BLOCK_SIZE.toFixed(6)};
const ISO_ANGLE_Y: f32 = ${CAT_CONSTANTS.isoAngleY.toFixed(6)};
const ISO_ANGLE_X: f32 = ${CAT_CONSTANTS.isoAngleX.toFixed(6)};
const FLAT_ANGLE_Y: f32 = ${CAT_CONSTANTS.flatAngleY.toFixed(6)};
const FLAT_ANGLE_X: f32 = ${CAT_CONSTANTS.flatAngleX.toFixed(6)};
const VIEW_SCALE_3D: f32 = ${CAT_CONSTANTS.viewScale3D.toFixed(6)};
const VIEW_SCALE_2D: f32 = ${CAT_CONSTANTS.viewScale2D.toFixed(6)};
const Y_OFFSET_3D:   f32 = ${CAT_CONSTANTS.yOffset3D.toFixed(6)};
const X_OFFSET_3D:   f32 = ${CAT_CONSTANTS.xOffset3D.toFixed(6)};
const Y_OFFSET_2D:   f32 = ${CAT_CONSTANTS.yOffset2D.toFixed(6)};
const X_OFFSET_2D:   f32 = ${CAT_CONSTANTS.xOffset2D.toFixed(6)};

fn faceNormal(faceIdx: u32) -> vec3f {
  if (faceIdx == 0u) { return vec3f(0.0,  1.0, 0.0); }
  if (faceIdx == 1u) { return vec3f(0.0, -1.0, 0.0); }
  if (faceIdx == 2u) { return vec3f(0.0,  0.0, 1.0); }
  if (faceIdx == 3u) { return vec3f(0.0,  0.0,-1.0); }
  if (faceIdx == 4u) { return vec3f(1.0,  0.0, 0.0); }
  return vec3f(-1.0, 0.0, 0.0);
}

fn quadVert(localVertIdx: u32) -> vec2f {
  let uvTable = array<vec2f, 6>(
    vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(0.0, 1.0),
    vec2f(0.0, 1.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0)
  );
  return uvTable[localVertIdx];
}

@vertex
fn main(@builtin(vertex_index) vi: u32) -> VertOut {
  let blockIdx = vi / 36u;
  let localVi = vi % 36u;
  let faceIdx = localVi / 6u;
  let localVertIdx = localVi % 6u;
  let qv = quadVert(localVertIdx);

  let posData = blockPositions[blockIdx];
  let col = posData.x;
  let row = posData.y;
  let h = blockHeights[blockIdx];
  let bY = blockBaseY[blockIdx];
  let typePacked = blockTypes[blockIdx];

  let halfG = uniforms.gridSize * 0.5;
  let wx = (col - halfG + 0.5) * BLOCK_SIZE;
  let wz = (row - halfG + 0.5) * BLOCK_SIZE;

  var localPos: vec3f;
  let N = faceNormal(faceIdx);

  if (faceIdx == 0u) {
    localPos = vec3f(wx + (qv.x - 0.5)*BLOCK_SIZE, bY + h, wz + (qv.y - 0.5)*BLOCK_SIZE);
  } else if (faceIdx == 1u) {
    localPos = vec3f(wx + (qv.x - 0.5)*BLOCK_SIZE, bY,     wz + (qv.y - 0.5)*BLOCK_SIZE);
  } else if (faceIdx == 2u) {
    localPos = vec3f(wx + (qv.x - 0.5)*BLOCK_SIZE, bY + qv.y*h, wz + BLOCK_SIZE*0.5);
  } else if (faceIdx == 3u) {
    localPos = vec3f(wx + (qv.x - 0.5)*BLOCK_SIZE, bY + qv.y*h, wz - BLOCK_SIZE*0.5);
  } else if (faceIdx == 4u) {
    localPos = vec3f(wx + BLOCK_SIZE*0.5, bY + qv.y*h, wz + (qv.x - 0.5)*BLOCK_SIZE);
  } else {
    localPos = vec3f(wx - BLOCK_SIZE*0.5, bY + qv.y*h, wz + (qv.x - 0.5)*BLOCK_SIZE);
  }

  // Ear tip convergence (type 3)
  if (typePacked == 3u && faceIdx >= 2u) {
    let gridSize = uniforms.gridSize;
    let isLeftEar = col < gridSize * 0.5;
    let earTipX = select(gridSize * 0.85, gridSize * 0.15, isLeftEar);
    let earTipZ = gridSize * 0.1;
    let pullStrength = qv.y * 0.25;
    let tipDx = (earTipX - col) * pullStrength * BLOCK_SIZE * 0.1;
    let tipDz = (earTipZ - row) * pullStrength * BLOCK_SIZE * 0.1;
    localPos.x += tipDx;
    localPos.z += tipDz;
  }

  let isoY = mix(ISO_ANGLE_Y, FLAT_ANGLE_Y, uniforms.progress);
  let isoX = mix(ISO_ANGLE_X, FLAT_ANGLE_X, uniforms.progress);

  let cy2 = cos(isoY); let sy2 = sin(isoY);
  let cx2 = cos(isoX); let sx2 = sin(isoX);

  let ry_x = localPos.x * cy2 - localPos.z * sy2;
  let ry_z = localPos.x * sy2 + localPos.z * cy2;
  let rx_y = localPos.y * cx2 - ry_z * sx2;
  let rx_z = localPos.y * sx2 + ry_z * cx2;

  let viewScale = mix(VIEW_SCALE_3D, VIEW_SCALE_2D, uniforms.progress);
  let finalPos = vec3f(ry_x, rx_y, rx_z) * viewScale;

  let distFromCenter = length(vec2f(col - uniforms.gridSize * 0.5, row - uniforms.gridSize * 0.5));

  var out: VertOut;
  let xOff = mix(X_OFFSET_3D, X_OFFSET_2D, uniforms.progress);
  let yOff = mix(Y_OFFSET_3D, Y_OFFSET_2D, uniforms.progress);
  out.pos = vec4f((finalPos.x + xOff) / uniforms.aspectRatio, finalPos.y + yOff, finalPos.z * 0.5 + 0.5, 1.0);
  out.col = col;
  out.row = row;
  out.layer = bY / BLOCK_SIZE;
  out.faceNx = N.x;
  out.faceNy = N.y;
  out.faceNz = N.z;
  out.blockType = f32(typePacked);
  out.uv = qv;
  out.distFromCenter = distFromCenter;
  return out;
}
`;
