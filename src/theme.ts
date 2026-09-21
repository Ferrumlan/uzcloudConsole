import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  cssVarsRoot: ':where(:root, :host)',
  cssVarsPrefix: 'chakra',
  globalCss: {
    'html, body': {
      margin: 0,
      padding: 0,
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: '16px',
      lineHeight: '1.6',
    },
    '*': {
      boxSizing: 'border-box',
    },
    'h1, h2, h3, h4, h5, h6': {
      fontWeight: '700',
      letterSpacing: '-0.02em',
      lineHeight: '1.2',
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` },
        body: { value: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` },
      },
      spacing: {
        xs: { value: '4px' },
        sm: { value: '8px' },
        md: { value: '16px' },
        lg: { value: '24px' },
        xl: { value: '32px' },
        '2xl': { value: '48px' },
        '3xl': { value: '64px' },
      },
      radii: {
        none: { value: '0' },
        sm: { value: '6px' },
        md: { value: '8px' },
        lg: { value: '12px' },
        xl: { value: '16px' },
        '2xl': { value: '20px' },
        '3xl': { value: '24px' },
        full: { value: '9999px' },
      },
      shadows: {
        xs: { value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
        sm: { value: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)' },
        md: { value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)' },
        lg: { value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)' },
        xl: { value: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' },
        '2xl': { value: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
        glow: { value: '0 0 20px rgba(14, 165, 233, 0.4)' },
      },
      colors: {
        brand: {
          50: { value: '#f0f9ff' },
          100: { value: '#e0f2fe' },
          200: { value: '#bae6fd' },
          300: { value: '#7dd3fc' },
          400: { value: '#38bdf8' },
          500: { value: '#0ea5e9' },
          600: { value: '#0284c7' },
          700: { value: '#0369a1' },
          800: { value: '#075985' },
          900: { value: '#0c4a6e' },
        },
        accent: {
          50: { value: '#faf5ff' },
          100: { value: '#f3e8ff' },
          200: { value: '#e9d5ff' },
          300: { value: '#d8b4fe' },
          400: { value: '#c084fc' },
          500: { value: '#a855f7' },
          600: { value: '#9333ea' },
          700: { value: '#7e22ce' },
          800: { value: '#6b21a8' },
          900: { value: '#581c87' },
        },
        success: {
          50: { value: '#f0fdf4' },
          100: { value: '#dcfce7' },
          200: { value: '#bbf7d0' },
          300: { value: '#86efac' },
          400: { value: '#4ade80' },
          500: { value: '#22c55e' },
          600: { value: '#16a34a' },
          700: { value: '#15803d' },
          800: { value: '#166534' },
          900: { value: '#14532d' },
        },
        warning: {
          50: { value: '#fffbeb' },
          100: { value: '#fef3c7' },
          200: { value: '#fde68a' },
          300: { value: '#fcd34d' },
          400: { value: '#fbbf24' },
          500: { value: '#f59e0b' },
          600: { value: '#d97706' },
          700: { value: '#b45309' },
          800: { value: '#92400e' },
          900: { value: '#78350f' },
        },
        danger: {
          50: { value: '#fef2f2' },
          100: { value: '#fee2e2' },
          200: { value: '#fecaca' },
          300: { value: '#fca5a5' },
          400: { value: '#f87171' },
          500: { value: '#ef4444' },
          600: { value: '#dc2626' },
          700: { value: '#b91c1c' },
          800: { value: '#991b1b' },
          900: { value: '#7f1d1d' },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: '{colors.brand.500}' },
          contrast: { value: '#ffffff' },
          fg: { value: '{colors.brand.700}' },
          muted: { value: '{colors.brand.100}' },
          subtle: { value: '{colors.brand.200}' },
          emphasized: { value: '{colors.brand.300}' },
          focusRing: { value: '{colors.brand.500}' },
        },
      },
    },
    textStyles: {
      h1: {
        value: {
          fontSize: '48px',
          fontWeight: '800',
          letterSpacing: '-0.03em',
          lineHeight: '1.1',
        },
      },
      h2: {
        value: {
          fontSize: '36px',
          fontWeight: '700',
          letterSpacing: '-0.025em',
          lineHeight: '1.2',
        },
      },
      h3: {
        value: {
          fontSize: '28px',
          fontWeight: '700',
          letterSpacing: '-0.02em',
          lineHeight: '1.3',
        },
      },
      h4: {
        value: {
          fontSize: '22px',
          fontWeight: '600',
          letterSpacing: '-0.015em',
          lineHeight: '1.4',
        },
      },
      body: {
        value: {
          fontSize: '16px',
          fontWeight: '400',
          lineHeight: '1.6',
        },
      },
      caption: {
        value: {
          fontSize: '14px',
          fontWeight: '500',
          lineHeight: '1.5',
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
