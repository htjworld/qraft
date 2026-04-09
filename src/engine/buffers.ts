import type { BlockData } from '../shared/types';

export interface Buffers {
  uniformBuffer: GPUBuffer;
  typeBuffer: GPUBuffer;
  posBuffer: GPUBuffer;
  heightBuffer: GPUBuffer;
  baseYBuffer: GPUBuffer;
}

export function createBuffers(device: GPUDevice, maxBlocks: number): Buffers {
  const uniformBuffer = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const typeBuffer = device.createBuffer({
    size: maxBlocks * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const posBuffer = device.createBuffer({
    size: maxBlocks * 16,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const heightBuffer = device.createBuffer({
    size: maxBlocks * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const baseYBuffer = device.createBuffer({
    size: maxBlocks * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  return { uniformBuffer, typeBuffer, posBuffer, heightBuffer, baseYBuffer };
}

export function writeBlockBuffers(
  device: GPUDevice,
  buffers: Buffers,
  data: BlockData,
  maxBlocks: number,
) {
  const paddedTypes = new Uint32Array(maxBlocks);
  paddedTypes.set(data.types);
  device.queue.writeBuffer(buffers.typeBuffer, 0, paddedTypes);

  const paddedPositions = new Float32Array(maxBlocks * 4);
  paddedPositions.set(data.positions);
  device.queue.writeBuffer(buffers.posBuffer, 0, paddedPositions);

  const paddedHeights = new Float32Array(maxBlocks);
  paddedHeights.set(data.heights);
  device.queue.writeBuffer(buffers.heightBuffer, 0, paddedHeights);

  const paddedBaseY = new Float32Array(maxBlocks);
  paddedBaseY.set(data.baseY);
  device.queue.writeBuffer(buffers.baseYBuffer, 0, paddedBaseY);
}
