# UzCloud Console - MVP 1.0

## 🎯 Архитектура

### Динамическая загрузка данных из API

В отличие от предыдущих версий с захардкоженными данными, MVP 1.0 использует **динамическую загрузку** всех конфигурационных данных из Stack Console API в реальном времени.

#### Что загружается из API:

1. **Regions** (`GET /regions`)
   - Список доступных регионов
   - Cloud provider информация
   - Динамический выбор при создании ВМ

2. **Projects** (`GET /projects`)
   - Список проектов пользователя
   - Возможность выбора существующего проекта
   - Создание новых проектов

3. **Templates** (`GET /templates`)
   - Список доступных образов ОС
   - Ubuntu, CentOS, Debian, Windows и др.
   - Реальные slug из API

4. **Plans** (`GET /plans/service/Virtual Machine`)
   - Тарифные планы из rate card пользователя
   - CPU, RAM конфигурации
   - Реальные slug из API

5. **Virtual Machines** (`GET /virtual-machines`)
   - Список ВМ пользователя
   - Реальная конфигурация (CPU, RAM, Disk, IP)
   - Актуальные статусы

## 🏗️ Структура проекта

```
src/
├── api/
│   ├── client.ts          # API клиент с нормализацией данных
│   └── types.ts           # TypeScript типы (Project, Region, Template, Plan, VM)
├── components/
│   ├── Layout.tsx         # Основной layout с sidebar
│   ├── ModernButton.tsx   # Кнопки с градиентами
│   ├── ModernCard.tsx     # Карточки с hover эффектами
│   └── VMCreateWizard.tsx # Мастер создания ВМ с динамической загрузкой
├── contexts/
│   └── AppContext.tsx     # Глобальное состояние приложения
├── pages/
│   ├── DashboardPage.tsx  # Дашборд с реальной статистикой
│   ├── VMListPage.tsx     # Список ВМ из API
│   ├── VMDetailPage.tsx   # Детали ВМ с защитой от undefined
│   └── BillingPage.tsx    # Биллинг и инвойсы
├── theme.ts               # Chakra UI тема
└── App.tsx                # Главный компонент
```

## 🔄 Поток данных

### Создание виртуальной машины

```
1. Пользователь открывает VMCreateWizard
   ↓
2. Параллельная загрузка из API:
   - GET /regions
   - GET /projects
   - GET /templates
   - GET /plans/service/Virtual Machine
   ↓
3. Отображение реальных данных в UI
   ↓
4. Пользователь выбирает:
   - Region (slug из API)
   - Project (slug из API)
   - Template (slug из API)
   - Plan (slug из API)
   - Volume size
   - Network type
   - VM name
   ↓
5. POST /virtual-machines с реальными slug
   ↓
6. Обновление списка ВМ
```

### Отображение списка ВМ

```
1. GET /virtual-machines
   ↓
2. Нормализация данных (normalizeVM):
   - Извлечение cpu, ram, disk из разных форматов
   - Маппинг статусов
   - Извлечение IP адреса
   ↓
3. Отображение в UI с реальной конфигурацией
```

## 🛡️ Обработка ошибок

### API недоступен (CORS в preview)

- Автоматический переход в демо-режим
- Отображение mock данных
- Оранжевая пометка "Демо-режим"

### Ошибка авторизации (401)

- Экран ошибки с деталями
- Возможность повторной попытки

### Ошибка создания ВМ (422)

- Валидация обязательных полей
- Отображение ошибки API
- Сохранение состояния формы

### Ошибка загрузки данных

- Экран ошибки с кнопкой "Попробовать снова"
- Логирование в консоль

## 🎨 UI/UX особенности

### Динамическая загрузка

- **Spinner** при загрузке данных из API
- **Автоматический выбор** первых значений (region, project)
- **Сохранение состояния** в localStorage при навигации между шагами
- **Кнопка закрытия** (X) в wizard

### Защита от undefined

- Fallback значения для всех полей ВМ
- Проверка существования vm перед рендерингом
- Безопасное форматирование дат

### Современные элементы

- **Градиентные кнопки** с hover эффектами
- **Карточки** с анимациями
- **Плюс Jakarta Sans** шрифт
- **Chakra UI v3** компоненты

## 🚀 Деплой

### На VPS (реальные данные)

```bash
# Настройка Nginx proxy
sudo nano /etc/nginx/sites-available/uzcloud-console

# Добавить:
location /api/ {
    proxy_pass https://uzcloud.stackpoc.in/backend/api/;
    proxy_set_header Host uzcloud.stackpoc.in;
    proxy_ssl_server_name on;
}

# Обновить .env
VITE_API_BASE_URL=/api
VITE_API_TOKEN=your_token_here
VITE_USE_MOCK=false

# Пересобрать
npm run build
pm2 restart uzcloud-console
```

### GitHub Actions (автоматический деплой)

```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
          VITE_API_TOKEN: ${{ secrets.VITE_API_TOKEN }}
      - uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          source: "dist/*"
          target: ${{ secrets.VPS_DEPLOY_PATH }}
```

## 🔐 Безопасность

- **Токен API** хранится в `.env` (не в коде)
- **CORS proxy** через Nginx на VPS
- **BFF паттерн** для production (опционально)
- **Валидация** всех входных данных

## 📊 API Endpoints

### Используемые:

- `GET /profile` - данные пользователя
- `GET /regions` - список регионов
- `GET /projects` - список проектов
- `GET /templates` - список образов ОС
- `GET /plans/service/Virtual Machine` - тарифные планы
- `GET /virtual-machines` - список ВМ
- `GET /virtual-machines/{slug}` - детали ВМ
- `POST /virtual-machines` - создание ВМ
- `PUT /virtual-machines/{slug}/start` - запуск ВМ
- `PUT /virtual-machines/{slug}/stop` - остановка ВМ
- `PUT /virtual-machines/{slug}/reboot` - перезагрузка ВМ
- `GET /account/balance` - баланс аккаунта
- `GET /billing/invoices` - список инвойсов

## 🎯 Ключевые улучшения vs предыдущих версий

### Было (MVP 0.x):

❌ Захардкоженные slug и ID  
❌ Mock данные вместо реальных  
❌ Нет динамической загрузки  
❌ Ошибки 422 при создании ВМ  
❌ Отсутствие конфигурации ВМ в списке  
❌ Падение VMDetailPage при undefined  

### Стало (MVP 1.0):

✅ Динамическая загрузка из API  
✅ Реальные данные из rate card пользователя  
✅ Нормализация данных ВМ  
✅ Защита от undefined значений  
✅ Сохранение состояния wizard  
✅ Кнопка закрытия wizard  
✅ Экраны загрузки и ошибок  
✅ Production-ready архитектура  

## 📝 Переменные окружения

```env
# API конфигурация
VITE_API_BASE_URL=/api                    # или https://uzcloud.stackpoc.in/backend/api
VITE_API_TOKEN=your_token_here            # токен из Stack Console
VITE_USE_MOCK=false                       # false для реальных данных

# Для preview (демо-режим)
VITE_API_BASE_URL=https://uzcloud.stackpoc.in/backend/api
VITE_USE_MOCK=true
```

## 🧪 Тестирование

### Локально (preview):

```bash
npm run dev
# Откроется в демо-режиме с mock данными
```

### На VPS (реальные данные):

```bash
# Настроить Nginx proxy
# Обновить .env с реальным токеном
npm run build
pm2 restart uzcloud-console
```

### Проверка создания ВМ:

1. Открыть сайт
2. Нажать "Создать ВМ"
3. Выбрать регион из API
4. Выбрать проект из API
5. Выбрать образ из API
6. Выбрать план из API
7. Настроить volume и network
8. Ввести имя ВМ
9. Нажать "Создать ВМ"
10. Проверить в консоли (F12) что отправляются реальные slug
11. Проверить в Stack Console что ВМ создана

## 🐛 Известные ограничения

1. **CORS** - на preview режиме API блокирует запросы (решение: Nginx proxy на VPS)
2. **Создание проектов** - пока не реализовано через API (используется существующий проект)
3. **Создание сетей** - пока не реализовано (используется существующая сеть)
4. **GPU планы** - отображаются, но могут быть недоступны для создания

## 📈 Следующие шаги (MVP 2.0)

- [ ] Создание проектов через API
- [ ] Управление сетями (VPC, Isolated)
- [ ] Snapshots и backups
- [ ] Мониторинг ВМ (графики CPU, RAM, Disk)
- [ ] SSH ключи
- [ ] Kubernetes кластеры
- [ ] Object Storage
- [ ] Webhooks для уведомлений
- [ ] Real-time обновления через WebSocket

## 👥 Команда

- **Разработчик**: AI Assistant (Qwen Code)
- **Заказчик**: Тимур Сатыбеков (UzCloud)
- **Дата**: 2026-09-22
- **Статус**: MVP 1.0 готов к production

## 📄 Лицензия

MIT

---

**UzCloud Console MVP 1.0** - Production-ready CMP интерфейс с динамической загрузкой данных из Stack Console API.
