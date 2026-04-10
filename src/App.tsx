import { useState, useCallback } from 'react';
import { QraftCanvas } from './components/QraftCanvas';
import { StylePicker } from './components/StylePicker';
import { UrlInput } from './components/UrlInput';
import { getInitialStyle } from './styles/registry';
import type { QraftStyle } from './styles/types';

const DEFAULT_URL = 'https://github.com/htjworld/qraft';

export function App() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [style, setStyle] = useState<QraftStyle>(getInitialStyle);
  const [webGPUError, setWebGPUError] = useState<'insecure' | 'unsupported' | false>(false);

  const handleUrlChange = useCallback((newUrl: string) => {
    setUrl(newUrl || DEFAULT_URL);
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100dvh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Header — StylePicker */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '16px 20px',
      }}>
        <StylePicker current={style} onChange={setStyle} />
      </div>

      {/* Canvas — fills remaining space between header and footer */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
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
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#222' }}>
                  HTTPS required
                </h2>
                <p style={{ margin: 0, fontSize: 14, color: '#666', maxWidth: 300, lineHeight: 1.6 }}>
                  WebGPU only works on HTTPS. Please open the deployed URL instead of a local file.
                </p>
              </>
            ) : (
              <>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#222' }}>
                  WebGPU not available
                </h2>
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
      </div>

      {/* Footer — URL input */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'center',
        padding: '20px 20px 32px',
      }}>
        <UrlInput onChange={handleUrlChange} />
      </div>
    </div>
  );
}
