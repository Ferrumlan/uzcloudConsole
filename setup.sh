#!/bin/bash

# UzCloud Console - Автоматическая установка
# Запуск: chmod +x setup.sh && ./setup.sh

set -e

echo "🚀 Установка UzCloud Console..."

# Создание структуры директорий
echo "📁 Создание структуры проекта..."
mkdir -p src/{api,components,contexts,pages,theme}

# package.json
cat > package.json << 'EOF'
{
  "name": "uzcloud-console",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@chakra-ui/react": "^3.8.0",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0",
    "framer-motion": "^12.6.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-icons": "^5.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.20",
    "@types/react-dom": "^18.3.6",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.8.2",
    "vite": "^6.2.4"
  }
}
EOF

# vite.config.js
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
EOF

# tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# index.html
cat > index.html << 'EOF'
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>UzCloud Console</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# .env
cat > .env << 'EOF'
VITE_API_BASE_URL=https://uzcloud.stackpoc.in/backend/api
VITE_USE_MOCK=true
EOF

# vercel.json
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
EOF

# src/vite-env.d.ts
cat > src/vite-env.d.ts << 'EOF'
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_USE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
EOF

# src/index.css
cat > src/index.css << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

button, a {
  transition: all 0.2s ease;
}

*:focus-visible {
  outline: 2px solid #0ea5e9;
  outline-offset: 2px;
}
EOF

# src/theme.ts
cat > src/theme.ts << 'EOF'
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
EOF

# src/main.tsx
cat > src/main.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from './theme';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider value={system}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
EOF

echo "✅ Базовые файлы созданы"
echo ""
echo "⚠️  ВАЖНО: Теперь нужно скопировать содержимое следующих файлов из проекта:"
echo "   - src/App.tsx"
echo "   - src/api/client.ts"
echo "   - src/api/types.ts"
echo "   - src/components/Layout.tsx"
echo "   - src/components/ModernButton.tsx"
echo "   - src/components/ModernCard.tsx"
echo "   - src/components/VMCreateWizard.tsx"
echo "   - src/contexts/AppContext.tsx"
echo "   - src/pages/*.tsx (все страницы)"
echo ""
echo "📋 Или используйте команду для копирования всего проекта через интерфейс платформы"
echo ""
echo "После копирования файлов выполните:"
echo "   npm install"
echo "   npm run dev"
