import { useState, useCallback, useEffect } from 'react';
import { QraftCanvas } from './components/QraftCanvas';
import { StylePicker } from './components/StylePicker';
import { UrlInput } from './components/UrlInput';
import { getInitialStyle } from './styles/registry';
import type { QraftStyle } from './styles/types';

const DEFAULT_URL = 'https://github.com/htjworld/qraft';

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return mobile;
}

const errorBox: React.CSSProperties = {
  width: '100%', height: '100%',
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  gap: 14, padding: 24, textAlign: 'center', background: '#f5f5f5',
};

export function App() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [style, setStyle] = useState<QraftStyle>(getInitialStyle);
  const [webGPUError, setWebGPUError] = useState<'insecure' | 'unsupported' | false>(false);
  const isMobile = useIsMobile();

  const handleUrlChange = useCallback((newUrl: string) => {
    setUrl(newUrl || DEFAULT_URL);
  }, []);

  const onUnsupported = useCallback(() => {
    const isInsecure = location.protocol !== 'https:' && location.hostname !== 'localhost';
    setWebGPUError(isInsecure ? 'insecure' : 'unsupported');
  }, []);

  const errorContent = webGPUError && (
    <div style={errorBox}>
      <span style={{ fontSize: 44 }}>😢</span>
      {webGPUError === 'insecure' ? (
        <>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#222' }}>HTTPS required</h2>
          <p style={{ margin: 0, fontSize: 14, color: '#666', maxWidth: 300, lineHeight: 1.6 }}>
            WebGPU only works on HTTPS. Please open the deployed URL instead of a local file.
          </p>
        </>
      ) : (
        <>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#222' }}>WebGPU not available</h2>
          <p style={{ margin: 0, fontSize: 14, color: '#666', maxWidth: 300, lineHeight: 1.6 }}>
            Chrome 113+ is required. If you're on a supported browser, try enabling hardware acceleration in{' '}
            <code style={{ fontSize: 13 }}>Settings → System</code>.
          </p>
        </>
      )}
    </div>
  );

  /* ── Mobile layout ─────────────────────────────────────── */
  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        {/* QR canvas — top 52% */}
        <div style={{ position: 'relative', height: '52dvh', flexShrink: 0 }}>
          {errorContent || (
            <QraftCanvas url={url} style={style} onWebGPUUnsupported={onUnsupported} />
          )}
          <div style={{ position: 'absolute', top: 12, right: 16, zIndex: 10 }}>
            <StylePicker current={style} onChange={setStyle} />
          </div>
        </div>

        {/* Controls — remaining space, URL input near top of area */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '20px 16px 0',
          overflow: 'hidden',
        }}>
          <UrlInput onChange={handleUrlChange} />
        </div>
      </div>
    );
  }

  /* ── Desktop layout ────────────────────────────────────── */
  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100dvh',
      overflow: 'hidden',
      touchAction: 'none',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {errorContent || (
        <QraftCanvas url={url} style={style} onWebGPUUnsupported={onUnsupported} />
      )}

      <div style={{ position: 'absolute', top: 16, right: 20, zIndex: 10 }}>
        <StylePicker current={style} onChange={setStyle} />
      </div>

      <div style={{
        position: 'absolute',
        bottom: 32,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 10,
      }}>
        <UrlInput onChange={handleUrlChange} />
      </div>
    </div>
  );
}
