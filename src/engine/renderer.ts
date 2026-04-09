import type { QraftStyle } from '../styles/types';
import type { BlockData } from '../shared/types';
import { createRenderPipeline } from './pipeline';
import { createBuffers, writeBlockBuffers, type Buffers } from './buffers';
import { easeInOutCubic } from '../utils/helpers';

export class QraftRenderer {
  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private format!: GPUTextureFormat;

  private buffers!: Buffers;
  private depthTexture!: GPUTexture;

  private skyPipeline!: GPURenderPipeline;
  private shadowPipeline!: GPURenderPipeline;
  private blocksPipeline!: GPURenderPipeline;

  private skyBindGroup!: GPUBindGroup;
  private blockBindGroup!: GPUBindGroup;
  private skyBindGroupLayout!: GPUBindGroupLayout;
  private blockBindGroupLayout!: GPUBindGroupLayout;

  private animationId: number | null = null;
  private startTime = Date.now();
  private lastFrameTime = Date.now();
  private rawProgress = 0;
  private progress = 0;
  private isFlat = false;

  private blockCount = 0;
  private gridSize = 29;
  private maxBlocks = 0;
  private lerpSpeed = 4.0;

  async init(canvas: HTMLCanvasElement, style: QraftStyle): Promise<void> {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('WebGPU not supported');
    this.device = await adapter.requestDevice();

    this.format = navigator.gpu.getPreferredCanvasFormat();
    this.context = canvas.getContext('webgpu')!;
    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: 'premultiplied',
    });

    this.resizeCanvas(canvas);
    this.maxBlocks = style.constants.maxBlocks;
    this.lerpSpeed = style.constants.lerpSpeed;

    this.createBindGroupLayouts();
    this.buffers = createBuffers(this.device, this.maxBlocks);
    this.createDepthTexture(canvas.width, canvas.height);
    this.createPipelines(style);
    this.createBindGroups();
  }

  private resizeCanvas(canvas: HTMLCanvasElement) {
    const dpr = window.devicePixelRatio;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
  }

  private createBindGroupLayouts() {
    this.skyBindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
      ],
    });

    this.blockBindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
        { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
        { binding: 2, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
        { binding: 3, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
        { binding: 4, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
      ],
    });
  }

  private createBindGroups() {
    this.skyBindGroup = this.device.createBindGroup({
      layout: this.skyBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.buffers.uniformBuffer } },
      ],
    });

    this.blockBindGroup = this.device.createBindGroup({
      layout: this.blockBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.buffers.uniformBuffer } },
        { binding: 1, resource: { buffer: this.buffers.typeBuffer } },
        { binding: 2, resource: { buffer: this.buffers.posBuffer } },
        { binding: 3, resource: { buffer: this.buffers.heightBuffer } },
        { binding: 4, resource: { buffer: this.buffers.baseYBuffer } },
      ],
    });
  }

  private createPipelines(style: QraftStyle) {
    this.skyPipeline = createRenderPipeline(
      this.device, this.format, this.skyBindGroupLayout,
      { vertex: style.skyVertexShader, fragment: style.skyFragmentShader, depthWrite: false, depthCompare: 'always' },
    );

    this.shadowPipeline = createRenderPipeline(
      this.device, this.format, this.skyBindGroupLayout,
      {
        vertex: style.shadowVertexShader,
        fragment: style.shadowFragmentShader,
        depthWrite: false,
        depthCompare: 'always',
        blend: {
          color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
          alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
        },
      },
    );

    this.blocksPipeline = createRenderPipeline(
      this.device, this.format, this.blockBindGroupLayout,
      { vertex: style.vertexShader, fragment: style.fragmentShader, depthWrite: true, depthCompare: 'less' },
    );
  }

  private createDepthTexture(w: number, h: number) {
    if (this.depthTexture) this.depthTexture.destroy();
    this.depthTexture = this.device.createTexture({
      size: [w, h],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
  }

  updateQR(qrMatrix: boolean[][], style: QraftStyle) {
    const blockData: BlockData = style.generateBlocks(qrMatrix);
    this.blockCount = blockData.numBlocks;
    this.gridSize = blockData.gridSize;
    writeBlockBuffers(this.device, this.buffers, blockData, this.maxBlocks);
  }

  switchStyle(style: QraftStyle, qrMatrix: boolean[][]) {
    this.maxBlocks = style.constants.maxBlocks;
    this.lerpSpeed = style.constants.lerpSpeed;

    // Recreate buffers if needed (max size may differ)
    this.buffers = createBuffers(this.device, this.maxBlocks);
    this.createPipelines(style);
    this.createBindGroups();
    this.updateQR(qrMatrix, style);
  }

  handleResize(canvas: HTMLCanvasElement) {
    this.resizeCanvas(canvas);
    this.createDepthTexture(canvas.width, canvas.height);
  }

  toggleFlat() {
    this.isFlat = !this.isFlat;
  }

  get flatMode() {
    return this.isFlat;
  }

  start() {
    const render = () => {
      const now = Date.now();
      const dt = Math.min((now - this.lastFrameTime) / 1000, 0.05);
      this.lastFrameTime = now;

      const target = this.isFlat ? 1 : 0;
      this.rawProgress += (target - this.rawProgress) * Math.min(1, this.lerpSpeed * dt);
      if (Math.abs(this.rawProgress - target) < 0.001) this.rawProgress = target;
      this.progress = easeInOutCubic(this.rawProgress);

      const time = (now - this.startTime) / 1000;
      const canvas = this.context.canvas as HTMLCanvasElement;
      const ar = canvas.width / canvas.height;

      const uniformData = new Float32Array([
        ar, time, this.blockCount, this.progress, this.gridSize, 0, 0, 0,
      ]);
      this.device.queue.writeBuffer(this.buffers.uniformBuffer, 0, uniformData);

      const encoder = this.device.createCommandEncoder();
      const textureView = this.context.getCurrentTexture().createView();

      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view: textureView,
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: 'clear',
          storeOp: 'store',
        }],
        depthStencilAttachment: {
          view: this.depthTexture.createView(),
          depthClearValue: 1,
          depthLoadOp: 'clear',
          depthStoreOp: 'store',
        },
      });

      // 1. Sky
      pass.setPipeline(this.skyPipeline);
      pass.setBindGroup(0, this.skyBindGroup);
      pass.draw(3);

      // 2. Shadow
      pass.setPipeline(this.shadowPipeline);
      pass.setBindGroup(0, this.skyBindGroup);
      pass.draw(6);

      // 3. Blocks
      if (this.blockCount > 0) {
        pass.setPipeline(this.blocksPipeline);
        pass.setBindGroup(0, this.blockBindGroup);
        pass.draw(36 * this.blockCount);
      }

      pass.end();
      this.device.queue.submit([encoder.finish()]);

      this.animationId = requestAnimationFrame(render);
    };
    render();
  }

  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy() {
    this.stop();
    this.depthTexture?.destroy();
    this.buffers?.uniformBuffer.destroy();
    this.buffers?.typeBuffer.destroy();
    this.buffers?.posBuffer.destroy();
    this.buffers?.heightBuffer.destroy();
    this.buffers?.baseYBuffer.destroy();
  }
}
