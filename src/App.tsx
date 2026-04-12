import { useState, useCallback, useEffect } from 'react';
import { QraftCanvas } from './components/QraftCanvas';
import { StylePicker } from './components/StylePicker';
import { UrlInput } from './components/UrlInput';
import { getInitialStyle } from './styles/registry';
import type { QraftStyle } from './styles/types';

const DEFAULT_URL = 'https://github.com/htjworld/qraft';

function useMobileKeyboardInset() {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    if (navigator.maxTouchPoints === 0) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setInset(Math.max(0, window.innerHeight - vv.offsetTop - vv.height));
    vv.addEventListener('resize', update);
    return () => vv.removeEventListener('resize', update);
  }, []);
  return inset;
}

export function App() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [style, setStyle] = useState<QraftStyle>(getInitialStyle);
  const [webGPUError, setWebGPUError] = useState<'insecure' | 'unsupported' | false>(false);
  const keyboardInset = useMobileKeyboardInset();

  const handleUrlChange = useCallback((newUrl: string) => {
    setUrl(newUrl || DEFAULT_URL);
  }, []);

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100dvh',
      overflow: 'hidden',
      touchAction: 'none',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>

      {/* Canvas — full screen background */}
      {webGPUError ? (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: 24,
          textAlign: 'center',
          background: '#f5f5f5',
        }}>
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
      ) : (
        <QraftCanvas
          url={url}
          style={style}
          onWebGPUUnsupported={() => {
            const isInsecure = location.protocol !== 'https:' && location.hostname !== 'localhost';
            setWebGPUError(isInsecure ? 'insecure' : 'unsupported');
          }}
        />
      )}

      {/* StylePicker — top-right overlay */}
      <div style={{
        position: 'absolute',
        top: 16,
        right: 20,
        zIndex: 10,
      }}>
        <StylePicker current={style} onChange={setStyle} />
      </div>

      {/* UrlInput — bottom-center overlay, slides up with keyboard */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 10,
        transform: `translateY(-${keyboardInset}px)`,
        transition: keyboardInset > 0 ? 'transform 0.22s ease-out' : 'transform 0.18s ease-in',
      }}>
        <UrlInput onChange={handleUrlChange} />
      </div>

    </div>
  );
}
