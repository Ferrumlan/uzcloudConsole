import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  globalCss: {
    'html, body': {
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: '16px',
      lineHeight: '1.6',
    },
    ':root': {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f8fafc',
      '--bg-tertiary': '#f1f5f9',
      '--text-primary': '#0f172a',
      '--text-secondary': '#475569',
      '--text-tertiary': '#94a3b8',
      '--border-color': '#e2e8f0',
      '--card-bg': '#ffffff',
      '--card-border': '#e2e8f0',
    },
    '[data-theme="dark"]': {
      '--bg-primary': '#0f172a',
      '--bg-secondary': '#1e293b',
      '--bg-tertiary': '#334155',
      '--text-primary': '#f1f5f9',
      '--text-secondary': '#cbd5e1',
      '--text-tertiary': '#64748b',
      '--border-color': '#334155',
      '--card-bg': '#1e293b',
      '--card-border': '#334155',
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: `'Plus Jakarta Sans', sans-serif` },
        body: { value: `'Plus Jakarta Sans', sans-serif` },
      },
      colors: {
        brand: {
          50: { value: '#eff6ff' },
          100: { value: '#dbeafe' },
          200: { value: '#bfdbfe' },
          300: { value: '#93c5fd' },
          400: { value: '#60a5fa' },
          500: { value: '#3b82f6' },
          600: { value: '#2563eb' },
          700: { value: '#1d4ed8' },
          800: { value: '#1e40af' },
          900: { value: '#1e3a8a' },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
