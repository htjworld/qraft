import { uniformsStruct } from '../../../shared/shaders/common';

export const dogSkyVertex = /* wgsl */`
${uniformsStruct}
@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn main(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
  var tri = array<vec2f, 3>(
    vec2f(-1.0, -1.0),
    vec2f( 3.0, -1.0),
    vec2f(-1.0,  3.0)
  );
  return vec4f(tri[vi], 0.0, 1.0);
}
`;

export const dogSkyFragment = /* wgsl */`
@fragment
fn main() -> @location(0) vec4f {
  // Minecraft daytime sky — clear blue
  return vec4f(0.53, 0.72, 0.95, 1.0);
}
`;
