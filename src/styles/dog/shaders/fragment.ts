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
    // ── Light (QR background) — near-white warm ──────────────
    albedo = vec3f(1.00, 0.98, 0.95) * (0.97 + (n2 - 0.5) * 0.04);
    if (!isTop) { albedo *= 0.85; }

  } else if (bt == 1u) {
    // ── DarkFur — warm golden-orange (shiba / golden retriever)
    // Body outer: deep warm orange. Inner (low dist): brighter golden.
    // Top face darkened for QR scannability.
    let furOuter = vec3f(0.42, 0.18, 0.04);  // deep warm orange — renders ~#C05800
    let furInner = vec3f(0.55, 0.28, 0.07);  // bright golden    — renders ~#DC8000
    let normalizedDist = input.distFromCenter / (uniforms.gridSize * 0.5);
    var baseFur = mix(furInner, furOuter, smoothstep(0.2, 0.8, normalizedDist));
    baseFur *= (0.92 + n2 * 0.14);

    if (isTop) {
      albedo = baseFur * 0.60;  // darkened for QR contrast
    } else {
      albedo = baseFur;
    }

  } else if (bt == 2u) {
    // ── Brown — muzzle / inner face, warm tan-brown ───────────
    // Lighter than main fur but still dark enough for QR (top face).
    let muzzleBase = vec3f(0.50, 0.26, 0.08);  // warm tan-brown
    var muzzle = muzzleBase * (0.90 + n1 * 0.16);
    if (isTop) {
      albedo = muzzle * 0.62;
    } else {
      albedo = muzzle;
    }

  } else if (bt == 3u) {
    // ── EyeRing — dark iris / pupil, near-black ──────────────
    let eyeDark = vec3f(0.06, 0.04, 0.02);
    if (isTop) {
      // Tiny wet-eye specular highlight
      let hl = smoothstep(0.55, 0.72, 1.0 - length(input.uv - vec2f(0.28, 0.26)));
      albedo = eyeDark + vec3f(0.20, 0.16, 0.12) * hl;
    } else {
      albedo = eyeDark * 0.75;
    }

  } else if (bt == 4u) {
    // ── EyeWhite — white sclera inside eye zone ───────────────
    albedo = vec3f(0.96, 0.94, 0.90) * (0.97 + (n2 - 0.5) * 0.04);
    if (!isTop) { albedo *= 0.80; }

  } else {
    // ── Collar — warm red bandana ────────────────────────────
    let collarBase = vec3f(0.52, 0.07, 0.05);  // deep red — renders ~#C01800
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
