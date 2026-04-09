import { useState, useRef, useEffect } from 'react';
import { getAllStyles } from '../styles/registry';
import type { QraftStyle } from '../styles/types';

interface StylePickerProps {
  current: QraftStyle;
  onChange: (style: QraftStyle) => void;
}

// 3×2 dots icon
function DotsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <circle cx="5"  cy="5"  r="2.2" />
      <circle cx="13" cy="5"  r="2.2" />
      <circle cx="5"  cy="13" r="2.2" />
      <circle cx="13" cy="13" r="2.2" />
      <circle cx="5"  cy="9"  r="2.2" />
      <circle cx="13" cy="9"  r="2.2" />
    </svg>
  );
}

export function StylePicker({ current, onChange }: StylePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const styles = getAllStyles();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Choose style"
        style={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.88)',
          border: 'none',
          borderRadius: 12,
          cursor: 'pointer',
          color: '#444',
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(10px)',
          transition: 'transform 0.1s, box-shadow 0.1s',
        }}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.93)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <DotsIcon />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            display: 'flex',
            gap: 4,
            padding: '8px 10px',
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: 16,
            boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
            backdropFilter: 'blur(16px)',
            zIndex: 200,
          }}
        >
          {styles.map(s => (
            <button
              key={s.id}
              onClick={() => { onChange(s); setOpen(false); }}
              title={s.label}
              style={{
                width: 44,
                height: 44,
                fontSize: 26,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: s.id === current.id ? 'rgba(0,0,0,0.08)' : 'transparent',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'background 0.1s, transform 0.1s',
                transform: s.id === current.id ? 'scale(1.15)' : 'scale(1)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = s.id === current.id ? 'rgba(0,0,0,0.08)' : 'transparent')}
            >
              {s.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
