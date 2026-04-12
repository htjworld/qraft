import { uniformsStruct } from './common';

export interface VertexConstants {
  blockSize: number;
  isoAngleY: number;
  isoAngleX: number;
  flatAngleY: number;
  flatAngleX: number;
  viewScale3D: number;
  viewScale2D: number;
  yOffset3D: number;
  xOffset3D: number;
  yOffset2D: number;
  xOffset2D: number;
}

/**
 * swayCode: optional WGSL snippet injected after `lp` is computed.
 * Can read: col, row, bY, h, typeP, uniforms.time — and modify lp.x / lp.z.
 */
export function makeVertexShader(c: VertexConstants, swayCode = ''): string {
  return /* wgsl */`
${uniformsStruct}

@group(0) @binding(0) var<uniform> uniforms:       Uniforms;
@group(0) @binding(1) var<storage, read> blockTypes:     array<u32>;
@group(0) @binding(2) var<storage, read> blockPositions: array<vec4f>;
@group(0) @binding(3) var<storage, read> blockHeights:   array<f32>;
@group(0) @binding(4) var<storage, read> blockBaseY:     array<f32>;

struct VertOut {
  @builtin(position) pos:      vec4f,
  @location(0) col:            f32,
  @location(1) row:            f32,
  @location(2) layer:          f32,
  @location(3) faceNx:         f32,
  @location(4) faceNy:         f32,
  @location(5) faceNz:         f32,
  @location(6) blockType:      f32,
  @location(7) uv:             vec2f,
  @location(8) distFromCenter: f32,
}

const BLOCK_SIZE:    f32 = ${c.blockSize.toFixed(6)};
const ISO_ANGLE_Y:   f32 = ${c.isoAngleY.toFixed(6)};
const ISO_ANGLE_X:   f32 = ${c.isoAngleX.toFixed(6)};
const FLAT_ANGLE_Y:  f32 = ${c.flatAngleY.toFixed(6)};
const FLAT_ANGLE_X:  f32 = ${c.flatAngleX.toFixed(6)};
const VIEW_SCALE_3D: f32 = ${c.viewScale3D.toFixed(6)};
const VIEW_SCALE_2D: f32 = ${c.viewScale2D.toFixed(6)};
const Y_OFFSET_3D:   f32 = ${c.yOffset3D.toFixed(6)};
const X_OFFSET_3D:   f32 = ${c.xOffset3D.toFixed(6)};
const Y_OFFSET_2D:   f32 = ${c.yOffset2D.toFixed(6)};
const X_OFFSET_2D:   f32 = ${c.xOffset2D.toFixed(6)};

fn faceNormal(faceIdx: u32) -> vec3f {
  if (faceIdx == 0u) { return vec3f( 0.0,  1.0,  0.0); }
  if (faceIdx == 1u) { return vec3f( 0.0, -1.0,  0.0); }
  if (faceIdx == 2u) { return vec3f( 0.0,  0.0,  1.0); }
  if (faceIdx == 3u) { return vec3f( 0.0,  0.0, -1.0); }
  if (faceIdx == 4u) { return vec3f( 1.0,  0.0,  0.0); }
  return               vec3f(-1.0,  0.0,  0.0);
}

fn quadVert(i: u32) -> vec2f {
  let t = array<vec2f, 6>(
    vec2f(0.0,0.0), vec2f(1.0,0.0), vec2f(0.0,1.0),
    vec2f(0.0,1.0), vec2f(1.0,0.0), vec2f(1.0,1.0)
  );
  return t[i];
}

@vertex
fn main(@builtin(vertex_index) vi: u32) -> VertOut {
  let blockIdx     = vi / 36u;
  let localVi      = vi % 36u;
  let faceIdx      = localVi / 6u;
  let localVertIdx = localVi % 6u;
  let qv           = quadVert(localVertIdx);

  let posData = blockPositions[blockIdx];
  let col     = posData.x;
  let row     = posData.y;
  let h       = blockHeights[blockIdx];
  let bY      = blockBaseY[blockIdx];
  let typeP   = blockTypes[blockIdx];

  let halfG = uniforms.gridSize * 0.5;
  let wx    = (col - halfG + 0.5) * BLOCK_SIZE;
  let wz    = (row - halfG + 0.5) * BLOCK_SIZE;

  let N = faceNormal(faceIdx);
  var lp: vec3f;

  if      (faceIdx == 0u) { lp = vec3f(wx+(qv.x-0.5)*BLOCK_SIZE, bY+h,       wz+(qv.y-0.5)*BLOCK_SIZE); }
  else if (faceIdx == 1u) { lp = vec3f(wx+(qv.x-0.5)*BLOCK_SIZE, bY,         wz+(qv.y-0.5)*BLOCK_SIZE); }
  else if (faceIdx == 2u) { lp = vec3f(wx+(qv.x-0.5)*BLOCK_SIZE, bY+qv.y*h, wz+BLOCK_SIZE*0.5);         }
  else if (faceIdx == 3u) { lp = vec3f(wx+(qv.x-0.5)*BLOCK_SIZE, bY+qv.y*h, wz-BLOCK_SIZE*0.5);         }
  else if (faceIdx == 4u) { lp = vec3f(wx+BLOCK_SIZE*0.5,         bY+qv.y*h, wz+(qv.x-0.5)*BLOCK_SIZE); }
  else                    { lp = vec3f(wx-BLOCK_SIZE*0.5,         bY+qv.y*h, wz+(qv.x-0.5)*BLOCK_SIZE); }

${swayCode}

  let isoY = mix(ISO_ANGLE_Y, FLAT_ANGLE_Y, uniforms.progress);
  let isoX = mix(ISO_ANGLE_X, FLAT_ANGLE_X, uniforms.progress);
  let cY = cos(isoY); let sY = sin(isoY);
  let cX = cos(isoX); let sX = sin(isoX);

  let ry_x = lp.x*cY - lp.z*sY;
  let ry_z = lp.x*sY + lp.z*cY;
  let rx_y = lp.y*cX - ry_z*sX;
  let rx_z = lp.y*sX + ry_z*cX;

  let viewScale = mix(VIEW_SCALE_3D, VIEW_SCALE_2D, uniforms.progress);
  let sizeScale = 29.0 / uniforms.gridSize;
  let fp        = vec3f(ry_x, rx_y, rx_z) * viewScale;

  let xOff = mix(X_OFFSET_3D, X_OFFSET_2D, uniforms.progress);
  let yOff = mix(Y_OFFSET_3D, Y_OFFSET_2D, uniforms.progress);
  let distFromCenter = length(vec2f(col - uniforms.gridSize*0.5, row - uniforms.gridSize*0.5));

  var out: VertOut;
  out.pos            = vec4f((fp.x*sizeScale+xOff)/uniforms.aspectRatio, fp.y*sizeScale+yOff, fp.z*sizeScale*0.5+0.5, 1.0);
  out.col            = col;
  out.row            = row;
  out.layer          = bY / BLOCK_SIZE;
  out.faceNx         = N.x;
  out.faceNy         = N.y;
  out.faceNz         = N.z;
  out.blockType      = f32(typeP);
  out.uv             = qv;
  out.distFromCenter = distFromCenter;
  return out;
}
`;
}
