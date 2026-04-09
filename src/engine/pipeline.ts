export interface PipelineConfig {
  vertex: string;
  fragment: string;
  depthWrite: boolean;
  depthCompare: GPUCompareFunction;
  blend?: GPUBlendState;
}

export function createRenderPipeline(
  device: GPUDevice,
  format: GPUTextureFormat,
  layout: GPUBindGroupLayout,
  config: PipelineConfig,
): GPURenderPipeline {
  const defaultBlend: GPUBlendState = {
    color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
    alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
  };

  return device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [layout] }),
    vertex: {
      module: device.createShaderModule({ code: config.vertex }),
      entryPoint: 'main',
    },
    fragment: {
      module: device.createShaderModule({ code: config.fragment }),
      entryPoint: 'main',
      targets: [{ format, blend: config.blend ?? defaultBlend }],
    },
    primitive: { topology: 'triangle-list', cullMode: 'none' },
    depthStencil: {
      depthWriteEnabled: config.depthWrite,
      depthCompare: config.depthCompare,
      format: 'depth24plus',
    },
  });
}
