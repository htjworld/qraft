export const uniformsStruct = /* wgsl */`
struct Uniforms {
  aspectRatio: f32,
  time: f32,
  blockCount: f32,
  progress: f32,
  gridSize: f32,
  _pad1: f32,
  _pad2: f32,
  _pad3: f32,
}
`;

export const acesTonemapping = /* wgsl */`
fn acesFilm(x: vec3f) -> vec3f {
  let a = 2.51; let b = 0.03; let c = 2.43; let d = 0.59; let e = 0.14;
  return clamp((x*(a*x+b)) / (x*(c*x+d)+e), vec3f(0.0), vec3f(1.0));
}
`;

export const blockNoise = /* wgsl */`
fn blockNoise3(col: f32, row: f32, layer: f32) -> vec3f {
  let seed = col * 17.3 + row * 31.1 + layer * 73.7;
  let n1 = fract(sin(seed) * 43758.5);
  let n2 = fract(sin(seed * 1.7 + 127.1) * 43758.5);
  let n3 = fract(sin(seed * 2.3 + 311.7) * 43758.5);
  return vec3f(n1, n2, n3);
}
`;

export const commonLighting = /* wgsl */`
fn computeLighting(albedo: vec3f, N: vec3f) -> vec3f {
  let sunDir = normalize(vec3f(-0.5, 0.8, -0.5));
  let sunCol = vec3f(1.15, 1.05, 0.95);
  let ambient = vec3f(0.35, 0.38, 0.45);
  let skyFill = vec3f(0.85, 0.9, 0.95);
  let bounce = vec3f(0.5, 0.65, 0.42);
  let NdSun = max(dot(N, sunDir), 0.0);
  let NdUp = max(dot(N, vec3f(0.0, 1.0, 0.0)), 0.0);
  let diffuse = albedo * (ambient + sunCol * NdSun * 0.65 + skyFill * NdUp * 0.25 + bounce * 0.2);
  var hdr = acesFilm(diffuse * 1.05);
  return pow(hdr, vec3f(1.0 / 2.2));
}
`;
