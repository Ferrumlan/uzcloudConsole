import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  globalCss: {
    'html, body': {
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: '16px',
      lineHeight: '1.6',
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: `'Plus Jakarta Sans', sans-serif` },
        body: { value: `'Plus Jakarta Sans', sans-serif` },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
