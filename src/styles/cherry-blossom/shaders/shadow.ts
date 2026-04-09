import { uniformsStruct } from '../../../shared/shaders/common';

export const cherryShadowVertex = /* wgsl */`
${uniformsStruct}
@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn main(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
  var quad = array<vec2f, 6>(
    vec2f(-0.65, -0.65), vec2f( 0.65, -0.65), vec2f(-0.65,  0.65),
    vec2f(-0.65,  0.65), vec2f( 0.65, -0.65), vec2f( 0.65,  0.65)
  );
  let p = quad[vi];
  let offset = vec2f(-0.12 * (1.0 - uniforms.progress), -0.05);
  return vec4f((p + offset) * vec2f(1.0 / uniforms.aspectRatio, 1.0) * 0.5, 0.999, 1.0);
}
`;

export const cherryShadowFragment = /* wgsl */`
@fragment
fn main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let uv = pos.xy / vec2f(pos.w);
  let dist = length(uv - vec2f(0.5));
  let falloff = exp(-dist * dist * 2.5);
  let alpha = 0.08 * falloff;
  return vec4f(0.0, 0.0, 0.0, alpha);
}
`;
