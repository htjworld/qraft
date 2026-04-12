import { uniformsStruct, acesTonemapping, blockNoise } from '../../../shared/shaders/common';
import { WINTER_PALETTE } from '../constants';

const p = WINTER_PALETTE;

export const winterFragmentShader = /* wgsl */`
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
}

const SUN_COL:  vec3f = vec3f(${p.sun.r}, ${p.sun.g}, ${p.sun.b});
const SKY_FILL: vec3f = vec3f(${p.skyFill.r}, ${p.skyFill.g}, ${p.skyFill.b});
const BOUNCE:   vec3f = vec3f(${p.bounce.r}, ${p.bounce.g}, ${p.bounce.b});
const AMBIENT:  vec3f = vec3f(0.32, 0.35, 0.45);

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
  let bt     = u32(input.blockType + 0.5);
  let noise  = blockNoise3(input.col, input.row, input.layer);
  let n1     = noise.x;
  let n2     = noise.y;
  let n3     = noise.z;
  let N      = normalize(vec3f(input.faceNx, input.faceNy, input.faceNz));
  let isTop  = input.faceNy > 0.5;
  let isSide = !isTop && input.faceNy > -0.5;

  var albedo: vec3f;

  if (bt == 0u) {
    // ── Snow / Dirt (QR light modules) ───────────────────────
    // Icy white with slight blue tint
    let snowLight = vec3f(0.97, 0.98, 1.00);
    let snowMid   = vec3f(0.93, 0.95, 0.98);
    let snowDark  = vec3f(0.88, 0.91, 0.96);
    if (n1 < 0.4) {
      albedo = mix(snowLight, snowMid, n1 / 0.4);
    } else {
      albedo = mix(snowMid, snowDark, (n1 - 0.4) / 0.6);
    }
    if (isSide) { albedo *= 0.85; }

  } else if (bt == 1u) {
    // ── Winter Branches (QR dark modules / canopy) ───────────
    // Dark charcoal-blue bare branches; top face has subtle snow.
    // All values kept dark enough for QR scan contrast.
    let branchDark = vec3f(0.14, 0.16, 0.22);
    let branchMid  = vec3f(0.10, 0.12, 0.18);
    let branchDeep = vec3f(0.07, 0.08, 0.14);
    var baseColor: vec3f;
    if (n1 < 0.5) {
      baseColor = mix(branchDark, branchMid, n1 / 0.5);
    } else {
      baseColor = mix(branchMid, branchDeep, (n1 - 0.5) / 0.5);
    }
    baseColor *= (0.90 + n2 * 0.18);

    if (isTop) {
      // Snow accumulation on branch tops — cold gray-blue, but still dark enough
      // linear luminance of (0.32, 0.36, 0.46) ≈ 0.12, well below 0.20 threshold
      let snowOnBranch = vec3f(0.30, 0.34, 0.44);
      let snowAmt = clamp(0.4 + n2 * 0.35, 0.3, 0.75);
      albedo = mix(baseColor, snowOnBranch, snowAmt);
    } else {
      albedo = baseColor;
      if (isSide) { albedo *= 0.72; }
    }

  } else if (bt == 2u) {
    // ── Trunk (cold dark bark) ────────────────────────────────
    let barkLight = vec3f(0.28, 0.18, 0.10);
    let barkMid   = vec3f(0.20, 0.14, 0.08);
    let barkDark  = vec3f(0.15, 0.10, 0.06);
    let barkDeep  = vec3f(0.10, 0.07, 0.04);
    let t = n1;
    var barkColor: vec3f;
    if (t < 0.33) {
      barkColor = mix(barkLight, barkMid, t / 0.33);
    } else if (t < 0.66) {
      barkColor = mix(barkMid, barkDark, (t - 0.33) / 0.33);
    } else {
      barkColor = mix(barkDark, barkDeep, (t - 0.66) / 0.34);
    }
    barkColor *= (0.9 + n2 * 0.2);

    if (isTop) {
      // Top face transitions to dark branch color in flat 2D view
      let branchColor = mix(vec3f(0.14, 0.16, 0.22), vec3f(0.10, 0.12, 0.18), n1);
      albedo = mix(barkColor, branchColor, uniforms.progress);
    } else {
      albedo = barkColor;
      if (isSide) { albedo *= 0.75; }
    }

  } else if (bt == 3u) {
    // ── Outer Snow Field ─────────────────────────────────────
    // Snowy outer ground — stays dark (frozen soil with thin snow)
    let frozenDark   = vec3f(0.18, 0.20, 0.26);
    let frozenMid    = vec3f(0.24, 0.27, 0.34);
    let frozenLight  = vec3f(0.30, 0.33, 0.42);
    if (n1 < 0.5) {
      albedo = mix(frozenDark, frozenMid, n1 / 0.5);
    } else {
      albedo = mix(frozenMid, frozenLight, (n1 - 0.5) / 0.5);
    }
    albedo *= (0.92 + n2 * 0.12);
    if (isSide) { albedo *= 0.70; }

  } else {
    // ── Inner Ground (frozen earth) ──────────────────────────
    let earthDark  = vec3f(0.16, 0.18, 0.24);
    let earthMid   = vec3f(0.22, 0.24, 0.30);
    // occasional ice crystal glint
    let iceGlint   = vec3f(0.28, 0.32, 0.42);
    let isGlint = n3 > 0.8;
    if (isGlint) {
      albedo = mix(earthMid, iceGlint, n2 * 0.5);
    } else {
      albedo = mix(earthDark, earthMid, n1);
    }
    albedo *= (0.90 + n2 * 0.15);
    if (isSide) { albedo *= 0.75; }
  }

  // Edge darkening (3D only)
  let edgeDist = min(
    min(input.uv.x, 1.0 - input.uv.x),
    min(input.uv.y, 1.0 - input.uv.y)
  );
  let edgeDarken = mix(0.72, 1.0, smoothstep(0.0, 0.1, edgeDist));
  albedo *= mix(edgeDarken, 1.0, uniforms.progress);

  return vec4f(computeLighting(albedo, N), 1.0);
}
`;
