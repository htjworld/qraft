import { uniformsStruct, acesTonemapping, blockNoise } from '../../../shared/shaders/common';
import { AUTUMN_PALETTE } from '../constants';

const p = AUTUMN_PALETTE;

export const autumnFragmentShader = /* wgsl */`
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
const AMBIENT:  vec3f = vec3f(0.38, 0.35, 0.28);

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
    // ── Dirt (QR light modules) ──────────────────────────────
    let dirtLight = vec3f(1.00, 0.98, 0.94);
    let dirtMid   = vec3f(0.96, 0.94, 0.88);
    let dirtDark  = vec3f(0.92, 0.88, 0.82);
    if (n1 < 0.4) {
      albedo = mix(dirtLight, dirtMid, n1 / 0.4);
    } else {
      albedo = mix(dirtMid, dirtDark, (n1 - 0.4) / 0.6);
    }
    if (isSide) { albedo *= 0.88; }

  } else if (bt == 1u) {
    // ── Autumn Leaves (QR dark modules / canopy) ─────────────
    // Deep rust-orange — linear brightness well below 0.20 for QR scan
    let leafLight = vec3f(0.55, 0.20, 0.04);
    let leafMid   = vec3f(0.42, 0.14, 0.02);
    let leafDeep  = vec3f(0.28, 0.08, 0.01);
    let leafRich  = vec3f(0.18, 0.05, 0.01);
    let t = n1;
    if (t < 0.33) {
      albedo = mix(leafLight, leafMid, t / 0.33);
    } else if (t < 0.66) {
      albedo = mix(leafMid, leafDeep, (t - 0.33) / 0.33);
    } else {
      albedo = mix(leafDeep, leafRich, (t - 0.66) / 0.34);
    }
    // Occasional red variation
    let redLeaf = vec3f(0.48, 0.08, 0.02);
    if (n3 > 0.7) {
      albedo = mix(albedo, redLeaf * (0.85 + n2 * 0.2), 0.4);
    }
    albedo *= (0.92 + n2 * 0.16);
    if (isSide) { albedo *= 0.72; }

  } else if (bt == 2u) {
    // ── Trunk (bark) ─────────────────────────────────────────
    let barkLight = vec3f(0.34, 0.18, 0.07);
    let barkMid   = vec3f(0.26, 0.13, 0.05);
    let barkDark  = vec3f(0.20, 0.09, 0.03);
    let barkDeep  = vec3f(0.14, 0.06, 0.02);
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
      // Top face transitions to autumn leaf color in flat 2D view
      let leafLight = vec3f(0.55, 0.20, 0.04);
      let leafMid   = vec3f(0.42, 0.14, 0.02);
      var leafColor: vec3f;
      if (n1 < 0.5) {
        leafColor = mix(leafLight, leafMid, n1 / 0.5);
      } else {
        leafColor = mix(leafMid, vec3f(0.28, 0.08, 0.01), (n1 - 0.5) / 0.5);
      }
      leafColor *= (0.92 + n2 * 0.16);
      albedo = mix(barkColor, leafColor, uniforms.progress);
    } else {
      albedo = barkColor;
      if (isSide) { albedo *= 0.75; }
    }

  } else if (bt == 3u) {
    // ── Outer Grass (dry autumn grass) ───────────────────────
    let grassDark   = vec3f(0.22, 0.18, 0.04);
    let grassMid    = vec3f(0.32, 0.26, 0.06);
    let grassBright = vec3f(0.44, 0.36, 0.09);
    if (n1 < 0.5) {
      albedo = mix(grassDark, grassMid, n1 / 0.5);
    } else {
      albedo = mix(grassMid, grassBright, (n1 - 0.5) / 0.5);
    }
    albedo *= (0.92 + n2 * 0.16);
    if (isSide) { albedo *= 0.70; }

  } else {
    // ── Fallen Leaves ────────────────────────────────────────
    let brownLeaf  = vec3f(0.50, 0.25, 0.06);
    let orangeLeaf = vec3f(0.58, 0.22, 0.04);
    let redLeaf    = vec3f(0.52, 0.12, 0.04);
    var leafColor: vec3f;
    if (n3 < 0.4) {
      leafColor = mix(brownLeaf, orangeLeaf, n1);
    } else if (n3 < 0.75) {
      leafColor = mix(orangeLeaf, redLeaf, n1);
    } else {
      leafColor = mix(redLeaf, brownLeaf, n1);
    }
    albedo = leafColor * (0.9 + n2 * 0.15);
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
