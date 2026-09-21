# MVP 1 - Реальное создание ВМ через Stack Console API

## ✅ Что реализовано

### 1. API интеграция
- Добавлен метод `api.virtualMachines.create()` для создания ВМ
- Увеличен timeout до 30 секунд для операции создания
- Обработка ошибок API с отображением пользователю

### 2. VMCreateWizard - 7 шагов создания
1. **Location** - выбор региона (Production/Staging)
2. **Project** - выбор существующего проекта или создание нового
3. **Image** - выбор образа ОС (Ubuntu, CentOS, Debian, Windows)
4. **Instance** - конфигурация vCPU и vRAM
5. **Volume** - размер диска (50-1000 GB)
6. **Network** - выбор Isolated ИЛИ VPC + опция Public IP
7. **Name** - имя ВМ + итоговая сводка

### 3. Маппинг данных
Создан маппинг между UI данными и реальными ID для API:
- `service_offering_id` - ID тарифного плана
- `template_id` - ID образа ОС
- `zone_id` - ID региона/зоны

### 4. Обработка ошибок
- Валидация обязательных полей перед отправкой
- Отображение ошибок API в UI
- Состояние загрузки на кнопке создания
- Блокировка кнопок во время создания

## 🚀 Как работает

### Поток создания ВМ:

```
1. Пользователь заполняет форму (7 шагов)
2. Нажимает "Создать ВМ"
3. Frontend собирает данные и маппит в API формат:
   {
     name: "web-server-01",
     hostname: "web-server-01",
     service_offering_id: 2,  // Medium (4 vCPU, 8 GB)
     template_id: 1,          // Ubuntu 22.04
     zone_id: 1,              // Production
     disk_size: 100,
     public_ip: true
   }
4. Отправляется POST /virtual-machines
5. API Stack Console создает ВМ
6. При успехе - страница перезагружается, ВМ появляется в списке
7. При ошибке - показывается сообщение об ошибке
```

## ⚠️ Важные моменты

### 1. Маппинг ID
Сейчас используются захардкоженные маппинги:
```typescript
const getServiceOfferingId = (configId: string): number => {
  const mapping: Record<string, number> = {
    'small': 1,
    'medium': 2,
    'large': 3,
    'xlarge': 4,
  };
  return mapping[configId] || 1;
};
```

**Для продакшена нужно:**
- Получать реальные ID из API (`/service-offerings`, `/templates`, `/zones`)
- Динамически маппить данные

### 2. Timeout
- Создание ВМ может занять 30+ секунд
- Timeout установлен на 30 секунд
- Если API медленнее - нужно увеличить или добавить polling

### 3. Обновление списка ВМ
Сейчас используется `window.location.reload()` для обновления списка.

**Для улучшения:**
- Добавить callback `onVMCreated` в VMCreateWizard
- Вызывать `loadVMs()` в VMListPage после создания
- Показывать toast уведомление об успехе

### 4. Обработка 500 при успехе
Согласно документации Stack Console, POST /virtual-machines может вернуть 500 при фактическом успехе.

**Решение (из постановки):**
```typescript
// При создании в name вшивается маркер
// При 500 выполняется поиск ресурса по маркеру
// Найден — успех. Код 200 без появления ресурса — ошибка
```

## 📋 API Endpoints

### Использованные:
- `POST /virtual-machines` - создание ВМ
- `GET /virtual-machines` - список ВМ
- `GET /virtual-machines/{slug}` - детали ВМ
- `PUT /virtual-machines/{slug}/start` - запуск
- `PUT /virtual-machines/{slug}/stop` - остановка
- `PUT /virtual-machines/{slug}/reboot` - перезагрузка

### Требуют реализации:
- `GET /service-offerings` - список тарифных планов
- `GET /templates` - список образов ОС
- `GET /zones` - список регионов/зон
- `GET /networks` - список сетей
- `POST /projects` - создание проекта

## 🔧 Конфигурация

### .env
```env
VITE_API_BASE_URL=https://uzcloud.stackpoc.in/backend/api
VITE_API_TOKEN=a21d54fa-1f0b-4650-a48a-880d0c5f3de5|ZtIEMcslWHuD2bmSuKJPCelrmqcy7xkCD4R3Xi76d2e2cd46
VITE_USE_MOCK=false
```

### Токен API
Токен пользователя staging для тестирования:
```
a21d54fa-1f0b-4650-a48a-880d0c5f3de5|ZtIEMcslWHuD2bmSuKJPCelrmqcy7xkCD4R3Xi76d2e2cd46
```

## 🧪 Тестирование

### 1. Локально
```bash
npm run dev
```

### 2. На VPS
```bash
# Обновить код
git pull origin main
npm install
npm run build
pm2 restart uzcloud-console

# Проверить логи
pm2 logs uzcloud-console
```

### 3. Тест создания ВМ
1. Открыть `http://your-vps-ip`
2. Нажать "Создать ВМ"
3. Пройти все 7 шагов
4. Нажать "Создать ВМ"
5. Проверить в Stack Console staging что ВМ создана
6. Проверить что ВМ появилась в списке

## 🐛 Известные проблемы

1. **Маппинг ID** - захардкожен, нужно получать из API
2. **Обновление списка** - используется reload(), нужно сделать callback
3. **Обработка 500** - не реализована проверка состояния после мутации
4. **Проекты** - создание нового проекта не работает через API
5. **Сети** - выбор сети не реализован (всегда default)

## 📈 Следующие шаги (MVP 2)

1. **Получать реальные ID из API:**
   - `/service-offerings` - тарифные планы
   - `/templates` - образы ОС
   - `/zones` - регионы
   - `/networks` - сети

2. **Улучшить UX:**
   - Toast уведомления
   - Progress bar при создании
   - Polling статуса ВМ

3. **Обработка ошибок:**
   - Проверка состояния после 500
   - Откат при ошибке создания
   - Валидация на уровне API

4. **Проекты:**
   - Реальное создание проектов через API
   - Выбор проекта при создании ВМ

5. **Сети:**
   - Выбор существующей сети
   - Создание новой сети
   - Настройка VPC

## ✅ Критерии готовности MVP 1

- [x] API клиент с методом create
- [x] VMCreateWizard с 7 шагами
- [x] Маппинг данных в API формат
- [x] Обработка ошибок
- [x] Состояние загрузки
- [x] Timeout 30 секунд
- [ ] Получение реальных ID из API
- [ ] Обработка 500 при успехе
- [ ] Toast уведомления
- [ ] Обновление списка без reload

**Статус: MVP 1 готов к тестированию на staging** 🚀
