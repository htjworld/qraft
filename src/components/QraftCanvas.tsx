import { useEffect, useRef, useState, useCallback } from 'react';
// useState kept for isReady flag
import { QraftRenderer } from '../engine/renderer';
import { generateQRMatrix } from '../utils/qr-matrix';
import type { QraftStyle } from '../styles/types';

interface QraftCanvasProps {
  url: string;
  style: QraftStyle;
  onWebGPUUnsupported?: () => void;
}

export function QraftCanvas({ url, style, onWebGPUUnsupported }: QraftCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<QraftRenderer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const styleRef = useRef(style);
  const urlRef = useRef(url);

  // Initial setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    const renderer = new QraftRenderer();
    rendererRef.current = renderer;

    (async () => {
      try {
        if (!navigator.gpu) {
          const isInsecure = location.protocol !== 'https:' && location.hostname !== 'localhost';
          console.error(isInsecure
            ? 'WebGPU requires HTTPS or localhost'
            : 'navigator.gpu is undefined — enable hardware acceleration in browser settings'
          );
          onWebGPUUnsupported?.();
          return;
        }
        await renderer.init(canvas, style);
        if (cancelled) return;

        const matrix = generateQRMatrix(url);
        renderer.updateQR(matrix, style);
        renderer.start();
        setIsReady(true);
      } catch {
        if (!cancelled) onWebGPUUnsupported?.();
      }
    })();

    return () => {
      cancelled = true;
      renderer.destroy();
      rendererRef.current = null;
      setIsReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // URL changes
  useEffect(() => {
    urlRef.current = url;
    const renderer = rendererRef.current;
    if (!renderer || !isReady) return;
    const matrix = generateQRMatrix(url);
    renderer.updateQR(matrix, styleRef.current);
  }, [url, isReady]);

  // Style changes
  useEffect(() => {
    styleRef.current = style;
    const renderer = rendererRef.current;
    if (!renderer || !isReady) return;
    const matrix = generateQRMatrix(urlRef.current);
    renderer.switchStyle(style, matrix);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style, isReady]);

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = rendererRef.current;
    if (!canvas || !renderer || !isReady) return;
    const observer = new ResizeObserver(() => renderer.handleResize(canvas));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [isReady]);

  const handleClick = useCallback(() => {
    rendererRef.current?.toggleFlat();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }}
    />
  );
}
