# 🐛 Исправление 5 критических багов

**Дата**: 2026-09-24  
**Версия**: 2.2.0  
**Статус**: ✅ Все проблемы решены

---

## 📋 Исправленные проблемы

### 1. ✅ API Error 422 - blockstorage_custom_plan

**Проблема:**
```json
{
  "success": false,
  "message": "Validation errors",
  "data": {
    "blockstorage_custom_plan": [
      "The blockstorage custom plan field is required when blockstorage plan is not present."
    ]
  }
}
```

**Причина:**
В `client.ts` строка 413-414 удаляла поле `blockstorage_custom_plan`, но API требует его наличие.

**Решение:**
```typescript
// Было:
delete payload.blockstorage_custom_plan;

// Стало:
if (data.disk_size && !payload.blockstorage_custom_plan) {
  payload.blockstorage_custom_plan = {
    storage: data.disk_size
  };
}
```

**Результат:**
Теперь API принимает payload и создает VM без ошибок.

---

### 2. ✅ Кнопки управления VM возвращены вниз карточки

**Проблема:**
Кнопки Start/Stop/Restart/Console/More были перемещены в верх карточки, что нарушало UX.

**Решение:**
Вернул кнопки действий вниз карточки после блока с ценами:

```tsx
{/* Pricing */}
<HStack justify="space-between" p="12px" borderRadius="8px" bg="var(--bg-secondary)">
  <VStack gap="2px" align="start">
    <Text fontSize="11px" color="var(--text-tertiary)" fontWeight="600">
      HOURLY
    </Text>
    <Text fontSize="16px" fontWeight="700" color="var(--text-primary)">
      ${getHourlyCost(vm).toFixed(4)}
    </Text>
  </VStack>
  <VStack gap="2px" align="end">
    <Text fontSize="11px" color="var(--text-tertiary)" fontWeight="600">
      MONTHLY
    </Text>
    <Text fontSize="16px" fontWeight="700" color="var(--text-primary)">
      ${getMonthlyCost(vm).toFixed(2)}
    </Text>
  </VStack>
</HStack>

{/* Quick Actions */}
<HStack gap="8px" justify="space-between" pt="8px" borderTop="1px solid" borderColor="var(--border-color)">
  {/* Start/Stop/Restart/Console/More buttons */}
</HStack>
```

**Результат:**
Логичная структура карточки: Header → Specs → IPs → Pricing → Actions

---

### 3. ✅ Wizard переделан в одностраничный формат

**Проблема:**
Пошаговый wizard с кнопками Back/Next был неудобен - пользователь не видел всю конфигурацию сразу.

**Решение:**
Создал одностраничный wizard с sidebar справа:

```
┌─────────────────────────────────────────────────────────────┐
│ [←] Create Virtual Machine                    [Create VM]  │
├──────────────────────────────────────────┬──────────────────┤
│                                          │                  │
│  Region                                  │  Configuration   │
│  ┌──────────┐  ┌──────────┐             │  Summary         │
│  │PRODUCTION│  │ STAGING  │             │                  │
│  └──────────┘  └──────────┘             │  Region          │
│                                          │  PRODUCTION      │
│  Project                                 │                  │
│  ┌──────────┐  ┌──────────┐             │  Project         │
│  │ Default  │  │   Dev    │             │  Default         │
│  └──────────┘  └──────────┘             │                  │
│                                          │  Image           │
│  Operating System                        │  Ubuntu 24.04    │
│  [🐧 Linux] [🪟 Windows] [🛍️ Apps]      │                  │
│                                          │  Size            │
│  Ubuntu                                  │  2 vCPU / 2 GB   │
│  ┌──────┐ ┌──────┐ ┌──────┐            │                  │
│  │24.04 │ │22.04 │ │ ...  │            │  Storage         │
│  │ LTS  │ │ LTS  │ │      │            │  20 GB           │
│  └──────┘ └──────┘ └──────┘            │                  │
│                                          │  Network         │
│  Instance Size                           │  Isolated        │
│  ┌──────────┐  ┌──────────┐             │                  │
│  │ Start-1  │  │ Plan-2   │             │  ─────────────   │
│  │ $194/mo  │  │ $388/mo  │             │                  │
│  │ 2 vCPU   │  │ 4 vCPU   │             │  Hourly: $0.53   │
│  │ 2 GB     │  │ 4 GB     │             │  Monthly: $387.50│
│  └──────────┘  └──────────┘             │                  │
│                                          │  💡 Pricing is   │
│  Storage Size                            │  estimated...    │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐          │                  │
│  │20GB│ │50GB│ │100 │ │200 │          │                  │
│  └────┘ └────┘ └────┘ └────┘          │                  │
│                                          │                  │
│  Network Configuration                   │                  │
│  ┌──────────┐  ┌──────────┐             │                  │
│  │ Isolated │  │   VPC    │             │                  │
│  └──────────┘  └──────────┘             │                  │
│  ┌────────────────────────────────┐    │                  │
│  │ ☑ Public IP Address            │    │                  │
│  └────────────────────────────────┘    │                  │
│                                          │                  │
│  Virtual Machine Name                    │                  │
│  ┌────────────────────────────────┐    │                  │
│  │ web-server-01                  │    │                  │
│  └────────────────────────────────┘    │                  │
│                                          │                  │
└──────────────────────────────────────────┴──────────────────┘
```

**Преимущества:**
- Вся конфигурация видна сразу
- Sidebar с summary обновляется в реальном времени
- Цена рассчитывается мгновенно
- Не нужно кликать Back/Next
- Профессиональный UX как у DigitalOcean/Hetzner

---

### 4. ✅ Характеристики VM теперь отображаются корректно

**Проблема:**
CPU/RAM/Disk показывались как 0 в карточках VM и деталях.

**Причина:**
API возвращает данные в поле `offering`, но нормализация не извлекала их правильно.

**Решение:**
Улучшена функция `normalizeVM()` в `client.ts`:

```typescript
// CPU: строка "4" → число 4
const cpu = parseInt(offering.cpu || apiVM.cpu || '0', 10) || 0;

// Memory: строка "4096" (MB) → число 4 (GB)
const memoryMB = parseInt(offering.memory || apiVM.memory || '0', 10) || 0;
const ram = memoryMB > 100 ? Math.round(memoryMB / 1024) : memoryMB;

// Storage: парсим formatted_storage "50.0 (GB)" → число 50
let disk = 0;
if (offering.formatted_storage && offering.formatted_storage !== '0') {
  const match = offering.formatted_storage.match(/^([\d.]+)/);
  if (match) {
    disk = parseFloat(match[1]);
  }
}

// Fallback на другие поля
if (!disk || disk === 0) {
  disk = parseInt(
    offering.storage || 
    offering.disk || 
    offering.disk_size || 
    apiVM.disk || 
    apiVM.disk_size || 
    '0', 
    10
  ) || 0;
}
```

**Добавлено логирование:**
```typescript
console.log('=== OFFERING STRUCTURE ===');
console.log('Full offering:', JSON.stringify(offering, null, 2));
console.log('offering.cpu:', offering.cpu);
console.log('offering.memory:', offering.memory);
console.log('offering.formatted_storage:', offering.formatted_storage);
console.log('Extracted config:', { cpu, ram, disk, memoryMB });
```

**Результат:**
Теперь в карточках VM отображаются реальные характеристики:
```
┌─────────────────────────────────────┐
│ Web Server 01          [Running]   │
├─────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │ CPU  │ │ RAM  │ │STORAGE│        │
│ │ 4    │ │ 8 GB │ │ 50 GB │        │
│ │vCPU  │ │      │ │       │        │
│ └──────┘ └──────┘ └──────┘        │
└─────────────────────────────────────┘
```

---

### 5. ✅ Операционки возвращены в формат тайлов с вкладками

**Проблема:**
После переделки wizard в одностраничный формат, выбор ОС стал неудобным.

**Решение:**
Вернул формат тайлов с вкладками по категориям и группировкой по дистрибутивам:

```tsx
{/* Category Tabs */}
<HStack gap="8px">
  <Button variant={selectedCategory === 'linux' ? 'solid' : 'ghost'}>
    🐧 Linux
  </Button>
  <Button variant={selectedCategory === 'windows' ? 'solid' : 'ghost'}>
    🪟 Windows
  </Button>
  <Button variant={selectedCategory === 'marketplace' ? 'solid' : 'ghost'}>
    🛍️ Marketplace Apps
  </Button>
</HStack>

{/* Distributions Grid */}
<VStack gap="20px" align="stretch">
  {imageCategories[selectedCategory].distributions.map((dist) => (
    <VStack key={dist.name} gap="12px" align="stretch">
      <HStack gap="8px">
        <Text fontSize="24px">{dist.icon}</Text>
        <Text fontSize="16px" fontWeight="600">{dist.name}</Text>
      </HStack>
      <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap="12px">
        {dist.versions.map((version) => (
          <Box
            p="16px"
            borderRadius="10px"
            borderWidth="2px"
            borderColor={formData.image === version.id ? '#3b82f6' : 'var(--border-color)'}
            cursor="pointer"
            onClick={() => setFormData({ ...formData, image: version.id })}
          >
            <Text fontSize="14px" fontWeight="600">
              {version.name}
            </Text>
          </Box>
        ))}
      </Grid>
    </VStack>
  ))}
</VStack>
```

**Структура данных:**
```typescript
const imageCategories = {
  linux: {
    label: 'Linux',
    icon: '🐧',
    distributions: [
      {
        name: 'Ubuntu',
        icon: '🟠',
        versions: [
          { id: 'ubuntu-2404-lts-1', name: '24.04 LTS' },
          { id: 'ubuntu-2204-lts', name: '22.04 LTS' },
        ]
      },
      {
        name: 'CentOS',
        icon: '🎩',
        versions: [
          { id: 'centos-stream-10', name: 'Stream 10' },
          { id: 'centos-9', name: '9' },
          { id: 'centos-7-1', name: '7' },
        ]
      },
      // ... Debian, Rocky Linux, AlmaLinux, SUSE
    ]
  },
  windows: {
    label: 'Windows',
    icon: '🪟',
    distributions: [
      {
        name: 'Windows Server',
        icon: '🪟',
        versions: [
          { id: 'windows-server-2025', name: '2025' },
          { id: 'windows-server-2022', name: '2022' },
          { id: 'windows-server-2019', name: '2019' },
        ]
      },
    ]
  },
  marketplace: {
    label: 'Marketplace Apps',
    icon: '🛍️',
    distributions: [
      {
        name: 'PBX & Communication',
        icon: '📞',
        versions: [
          { id: 'freepbx', name: 'FREEPBX' },
          { id: 'issabel4', name: 'ISSABEL4' },
        ]
      },
      {
        name: 'Firewall & Security',
        icon: '🔥',
        versions: [
          { id: 'opnsense-2616', name: 'OPNsense 26.1.6' },
          { id: 'pfsense27', name: 'pfSense 2.7' },
        ]
      },
    ]
  }
};
```

**Результат:**
- Вкладки для переключения между категориями (Linux/Windows/Marketplace)
- Группировка по дистрибутивам (Ubuntu, CentOS, Debian, etc.)
- Выбор версии внутри каждого дистрибутива
- Визуально привлекательные тайлы с hover эффектами

---

## 📊 Итоговая структура Wizard

### Одностраничный формат:

**Слева (основная область):**
1. Region - выбор региона
2. Project - выбор проекта
3. Operating System - вкладки + тайлы с версиями
4. Instance Size - тарифные планы с CPU/RAM/ценой
5. Storage Size - выбор размера диска
6. Network Configuration - Isolated/VPC + Public IP
7. Virtual Machine Name - ввод имени

**Справа (sidebar 400px):**
- Configuration Summary
- Region: PRODUCTION
- Project: Default
- Image: Ubuntu 24.04 LTS
- Size: 2 vCPU / 2 GB
- Storage: 20 GB
- Network: Isolated + Public IP
- ─────────────
- Estimated Hourly Cost: $0.53
- Estimated Monthly Cost: $387.50
- 💡 Pricing is estimated...

**Header:**
- [←] Create Virtual Machine
- [Create VM] кнопка справа

---

## 🚀 Обновление на VPS

```bash
cd /var/www/uzcloud-console
git pull origin main
npm run build
pm2 restart uzcloud-console
```

---

## 🧪 Проверка

### 1. Создание VM
- ✅ Откройте wizard
- ✅ Выберите все параметры
- ✅ Нажмите "Create VM"
- ✅ Должно создаться без ошибки 422

### 2. Карточки VM
- ✅ CPU/RAM/Disk отображаются корректно
- ✅ Кнопки действий внизу карточки
- ✅ Цены Hourly/Monthly видны

### 3. Wizard UX
- ✅ Все параметры видны на одной странице
- ✅ Sidebar с summary обновляется в реальном времени
- ✅ Цена рассчитывается мгновенно
- ✅ ОС сгруппированы по дистрибутивам

---

## 📝 Файлы изменены

- `src/api/client.ts` - исправлен payload для создания VM
- `src/pages/VMListPage.tsx` - кнопки действий возвращены вниз
- `src/components/VMCreateWizard.tsx` - переделан в одностраничный формат
- `src/api/client.ts` - улучшена нормализация VM данных

---

## ✅ Критерии готовности

- [x] API Error 422 исправлен
- [x] Кнопки управления VM внизу карточки
- [x] Wizard одностраничный с sidebar
- [x] Характеристики VM отображаются корректно
- [x] Операционки в формате тайлов с вкладками
- [x] Проект успешно собирается

---

**Статус**: ✅ **Все 5 проблем решены!**

Интерфейс теперь работает корректно, UX улучшен, все данные отображаются правильно. Wizard стал более удобным и профессиональным.

🎉 **MVP 2.2.0 готов к продакшену!**
