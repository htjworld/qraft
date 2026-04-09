import { useState, useCallback } from 'react';

interface UrlInputProps {
  onChange: (url: string) => void;
}

export function UrlInput({ onChange }: UrlInputProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    onChange(v);
  }, [onChange]);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <input
        type="text"
        inputMode="url"
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Enter a URL to encode"
        style={{
          width: 'clamp(260px, 72vw, 380px)',
          background: focused ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(16px)',
          border: `1.5px solid ${focused ? 'rgba(0,0,0,0.20)' : 'rgba(0,0,0,0.10)'}`,
          borderRadius: 14,
          padding: '12px 40px 12px 16px',
          fontSize: 15,
          color: '#222',
          fontFamily: 'inherit',
          outline: 'none',
          boxShadow: focused
            ? '0 4px 20px rgba(0,0,0,0.12)'
            : '0 2px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.15s',
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
      />
      {value && (
        <button
          onClick={() => { setValue(''); onChange(''); }}
          style={{
            position: 'absolute',
            right: 12,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 4,
            color: 'rgba(0,0,0,0.30)',
            fontSize: 14,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
