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
