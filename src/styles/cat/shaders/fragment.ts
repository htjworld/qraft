import { uniformsStruct, acesTonemapping, blockNoise } from '../../../shared/shaders/common';

export const catFragmentShader = /* wgsl */`
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
    // ── Light (QR light modules) — very bright cream ──────────
    // Must stay near-white so dark modules contrast clearly
    let lightBase = vec3f(1.00, 0.98, 0.96);
    albedo = lightBase * (0.97 + (n2 - 0.5) * 0.04);
    if (!isTop) { albedo *= 0.85; }

  } else if (bt == 1u) {
    // ── Fur — dark orange-brown (NO cream blending, keeps contrast) ──
    // Range: deep brown-orange to medium orange — all clearly darker than Light
    let furDeep   = vec3f(0.48, 0.22, 0.06);  // deep burnt orange
    let furMid    = vec3f(0.62, 0.32, 0.10);  // medium orange-brown
    let furWarm   = vec3f(0.74, 0.42, 0.16);  // warm orange (still dark vs light bg)
    var furColor: vec3f;
    if (n1 < 0.45) {
      furColor = mix(furDeep, furMid, n1 / 0.45);
    } else {
      furColor = mix(furMid, furWarm, (n1 - 0.45) / 0.55);
    }
    albedo = furColor * (0.92 + n2 * 0.14);
    if (!isTop) { albedo *= 0.72; }

  } else if (bt == 2u) {
    // ── Nose — dark rose-pink ────────────────────────────────
    let noseDark = vec3f(0.55, 0.18, 0.28);
    let noseMid  = vec3f(0.68, 0.24, 0.36);
    albedo = mix(noseDark, noseMid, n1) * (0.95 + n2 * 0.10);
    // Specular hint on top face
    if (isTop) {
      let hl = smoothstep(0.4, 0.6, 1.0 - length(input.uv - vec2f(0.4, 0.35)));
      albedo += vec3f(0.08) * hl;
    } else {
      albedo *= 0.70;
    }

  } else if (bt == 3u) {
    // ── Ear — dark fur outer / dark rose inner ───────────────
    let earOuter = vec3f(0.48, 0.22, 0.07);  // dark orange-brown (matches fur)
    let earInner = vec3f(0.62, 0.25, 0.40);  // dark rose (inner ear)
    let innerT   = smoothstep(0.25, 0.72, input.uv.y);
    albedo = mix(earOuter, earInner, innerT * 0.65) * (0.92 + n2 * 0.10);
    if (!isTop) { albedo *= 0.68; }

  } else {
    // ── PawPad — dark pink ───────────────────────────────────
    let pawDark = vec3f(0.55, 0.22, 0.35);
    let pawMid  = vec3f(0.65, 0.28, 0.42);
    let padShape = smoothstep(0.12, 0.32,
      min(min(input.uv.x, 1.0 - input.uv.x), min(input.uv.y, 1.0 - input.uv.y))
    );
    albedo = mix(pawDark * 0.85, mix(pawDark, pawMid, padShape), padShape);
    if (!isTop) { albedo *= 0.72; }
  }

  // Edge darkening in 3D
  let edgeDist   = min(min(input.uv.x, 1.0-input.uv.x), min(input.uv.y, 1.0-input.uv.y));
  let edgeDarken = mix(0.72, 1.0, smoothstep(0.0, 0.10, edgeDist));
  albedo *= mix(edgeDarken, 1.0, uniforms.progress);

  return vec4f(computeLighting(albedo, N), 1.0);
}
`;
