import { uniformsStruct, acesTonemapping, blockNoise } from '../../../shared/shaders/common';

export const dogFragmentShader = /* wgsl */`
${uniformsStruct}
${acesTonemapping}
${blockNoise}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct FragIn {
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

const SUN_COL:  vec3f = vec3f(1.15, 1.05, 0.95);
const SKY_FILL: vec3f = vec3f(0.85, 0.90, 0.95);
const BOUNCE:   vec3f = vec3f(0.50, 0.60, 0.42);
const AMBIENT:  vec3f = vec3f(0.35, 0.38, 0.45);

fn computeLighting(albedo: vec3f, N: vec3f) -> vec3f {
  let sunDir  = normalize(vec3f(-0.5, 0.8, -0.5));
  let NdSun   = max(dot(N, sunDir), 0.0);
  let NdUp    = max(dot(N, vec3f(0.0, 1.0, 0.0)), 0.0);
  let diffuse = albedo * (AMBIENT + SUN_COL*NdSun*0.65 + SKY_FILL*NdUp*0.25 + BOUNCE*0.2);
  var hdr     = acesFilm(diffuse * 1.05);
  return pow(hdr, vec3f(1.0 / 2.2));
}

@fragment
fn main(input: FragIn) -> @location(0) vec4f {
  let bt    = u32(input.blockType + 0.5);
  let noise = blockNoise3(input.col, input.row, input.layer);
  let n1    = noise.x;
  let n2    = noise.y;
  let N     = normalize(vec3f(input.faceNx, input.faceNy, input.faceNz));
  let isTop = input.faceNy > 0.5;

  var albedo: vec3f;

  if (bt == 0u) {
    // ── Light (QR background) — near-white ───────────────────
    albedo = vec3f(1.00, 0.98, 0.95) * (0.97 + (n2 - 0.5) * 0.04);
    if (!isTop) { albedo *= 0.85; }

  } else if (bt == 1u) {
    // ── Wolf body — cool medium-dark gray ────────────────────
    // Minecraft wolf: gray body with subtle cool tone variation.
    let wolfDark  = vec3f(0.24, 0.24, 0.26);  // deep cool gray
    let wolfMid   = vec3f(0.30, 0.30, 0.33);  // medium gray
    let wolfLight = vec3f(0.36, 0.36, 0.39);  // lighter fringe
    var baseFur: vec3f;
    if (n1 < 0.4) {
      baseFur = mix(wolfDark, wolfMid, n1 / 0.4);
    } else {
      baseFur = mix(wolfMid, wolfLight, (n1 - 0.4) / 0.6);
    }
    baseFur *= (0.90 + n2 * 0.18);

    if (isTop) {
      albedo = baseFur * 0.58;  // darkened for QR scannability
    } else {
      albedo = baseFur;
    }

  } else if (bt == 2u) {
    // ── Wolf muzzle — lighter warm-gray marking ───────────────
    // Minecraft wolf has a distinct lighter area around the muzzle.
    let muzzleBase = vec3f(0.52, 0.50, 0.46);  // light warm-gray
    var muzzle = muzzleBase * (0.88 + n1 * 0.18);
    if (isTop) {
      albedo = muzzle * 0.38;  // keep dark for QR contrast
    } else {
      albedo = muzzle;
    }

  } else if (bt == 3u) {
    // ── EyeRing — dark iris / pupil, near-black ──────────────
    let eyeDark = vec3f(0.06, 0.05, 0.04);
    if (isTop) {
      let hl = smoothstep(0.55, 0.72, 1.0 - length(input.uv - vec2f(0.28, 0.26)));
      albedo = eyeDark + vec3f(0.18, 0.14, 0.10) * hl;
    } else {
      albedo = eyeDark * 0.75;
    }

  } else if (bt == 4u) {
    // ── EyeWhite — white sclera ───────────────────────────────
    albedo = vec3f(0.96, 0.94, 0.90) * (0.97 + (n2 - 0.5) * 0.04);
    if (!isTop) { albedo *= 0.80; }

  } else {
    // ── Collar — deep red (tamed wolf collar) ─────────────────
    let collarBase = vec3f(0.52, 0.07, 0.05);
    albedo = collarBase * (0.92 + n1 * 0.12);
    if (!isTop) { albedo *= 0.72; }
  }

  // Edge darkening in 3D (fades out as we go to 2D)
  let edgeDist   = min(min(input.uv.x, 1.0-input.uv.x), min(input.uv.y, 1.0-input.uv.y));
  let edgeDarken = mix(0.72, 1.0, smoothstep(0.0, 0.10, edgeDist));
  albedo *= mix(edgeDarken, 1.0, uniforms.progress);

  return vec4f(computeLighting(albedo, N), 1.0);
}
`;
