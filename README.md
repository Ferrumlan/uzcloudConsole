# UzCloud Console

Современный UI для CMP клиентской части Stack Console с использованием React, TypeScript, Chakra UI v3.

## 🚀 Возможности

- ✅ Авторизация с поддержкой 2FA
- ✅ Dashboard с статистикой и графиками
- ✅ Управление виртуальными машинами (список, детали, создание)
- ✅ Биллинг и счета
- ✅ Выбор проектов
- ✅ Многоязычность (RU/UZ/EN)
- ✅ Современный дизайн с Plus Jakarta Sans
- ✅ API интеграция с Stack Console (nimbo)

## 🛠️ Технологии

- **Frontend**: React 18, TypeScript
- **UI Library**: Chakra UI v3
- **Icons**: Lucide React
- **Build**: Vite
- **API**: REST (Stack Console nimbo API)

## 📦 Установка

```bash
npm install
```

## 🔧 Разработка

```bash
npm run dev
```

Откройте [http://localhost:5173](http://localhost:5173)

## 🏗️ Сборка

```bash
npm run build
```

## 🌐 Деплой

### Vercel (рекомендуется)

1. Установите Vercel CLI:
```bash
npm i -g vercel
```

2. Деплой:
```bash
vercel
```

### Netlify

1. Установите Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Деплой:
```bash
netlify deploy --prod
```

### Docker

```bash
# Build
docker build -t uzcloud-console .

# Run
docker run -p 80:80 uzcloud-console
```

## ⚙️ Конфигурация

Создайте файл `.env` на основе `.env.example`:

```bash
# API Configuration
VITE_API_BASE_URL=https://uzcloud.stackpoc.in/backend/api

# Use mock data (set to 'false' to use real API)
VITE_USE_MOCK=true
```

### Переменные окружения

- `VITE_API_BASE_URL` - URL API Stack Console
- `VITE_USE_MOCK` - использовать mock данные (`true`) или реальный API (`false`)

## 📁 Структура проекта

```
src/
├── api/
│   ├── client.ts          # API клиент
│   └── types.ts           # TypeScript типы
├── components/
│   ├── Layout.tsx         # Основной layout
│   ├── ModernButton.tsx   # Кнопки
│   ├── ModernCard.tsx     # Карточки
│   └── VMCreateWizard.tsx # Мастер создания ВМ
├── contexts/
│   └── AppContext.tsx     # Глобальный контекст
├── pages/
│   ├── LoginPage.tsx      # Вход
│   ├── DashboardPage.tsx  # Дашборд
│   ├── VMListPage.tsx     # Список ВМ
│   ├── VMDetailPage.tsx   # Детали ВМ
│   ├── BillingPage.tsx    # Биллинг
│   └── PlaceholderPage.tsx # Заглушки
├── theme.ts               # Chakra UI тема
└── App.tsx                # Главный компонент
```

## 🔐 Безопасность

- Токен не хранится в localStorage
- Password поле вырезается из ответов API
- BFF proxy для CORS и безопасности
- 2FA поддержка

## 📝 Лицензия

MIT

---

**Разработано для UzCloud** • 2026
