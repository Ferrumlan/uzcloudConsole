# Загрузка данных в реальном времени

## 🎯 Что реализовано

### 1. Динамическая загрузка конфигурации ВМ

Теперь все данные о виртуальных машинах (CPU, RAM, Disk, IP) загружаются **в реальном времени** из API Stack Console.

#### Как это работает:

```typescript
// Загрузка списка ВМ с полной конфигурацией
const vms = await api.virtualMachines.list(undefined, true);
//                                              ↑         ↑
//                                         projectSlug  loadDetails
```

Когда `loadDetails=true`:
1. Сначала загружается список всех ВМ
2. Затем для каждой ВМ загружаются детали через `GET /virtual-machines/{slug}`
3. Данные нормализуются и возвращаются с полной конфигурацией

### 2. Нормализация данных ВМ

Функция `normalizeVM()` извлекает данные из разных возможных структур API:

```typescript
// CPU/RAM/Disk из offering
const offering = apiVM.offering || {};
const cpu = parseInt(offering.cpu || '0', 10);
const memoryMB = parseInt(offering.memory || '0', 10);
const ram = memoryMB > 100 ? Math.round(memoryMB / 1024) : memoryMB; // MB → GB
const disk = parseInt(offering.storage || '0', 10);

// IP адрес из ipaddresses массива
let ip_address = null;
if (apiVM.ipaddresses && apiVM.ipaddresses.length > 0) {
  const publicIP = apiVM.ipaddresses.find(ip => ip.is_public);
  ip_address = publicIP?.ip_address || apiVM.ipaddresses[0]?.ip_address;
}

// Статус из state (не status!)
const status = apiVM.state?.toLowerCase() || 'stopped';
```

### 3. Нормализация тарифных планов

Планы загружаются из API и нормализуются:

```typescript
// Загрузка планов
const plans = await api.plans.listVMPlans();

// Нормализация - извлекаем CPU/RAM из attribute
const normalizedPlans = plans.map(plan => ({
  ...plan,
  cpu: plan.attribute?.cpu || 0,
  ram: plan.attribute?.memory 
    ? Math.round(plan.attribute.memory / 1024)  // MB → GB
    : 0,
  price: plan.monthly_price || 0,
}));
```

### 4. Реальные данные из API

#### Storage Categories
```bash
GET /storage-categories
```
Возвращает: SSD Storage, Standard SSD, Premium SSD, NVMe, HDD и т.д.

#### Billing Cycles
```bash
GET /billing-cycles
```
Возвращает: Hourly, Monthly, Yearly

#### Templates (образы ОС)
```bash
GET /templates
```
Возвращает: Ubuntu 24.04, CentOS 9, Debian 12, Windows Server 2022 и т.д.

#### Plans (тарифы)
```bash
GET /plans/service/Virtual Machine
```
Возвращает тарифы с CPU/RAM в `attribute`:
```json
{
  "name": "Start-1",
  "slug": "start-1",
  "attribute": {
    "cpu": 2,
    "memory": 2048,  // MB
    "storage": 0
  },
  "monthly_price": 194000
}
```

## 🔍 Отладка

### Логи в консоли браузера

При загрузке данных в консоли (F12) будут видны логи:

```
=== VM List API Response ===
Total VMs: 4
First VM keys: ['id', 'slug', 'name', 'state', 'offering', ...]
First VM sample: {
  id: '...',
  slug: 'vm-xxx',
  name: 'Web Server',
  state: 'Running',
  has_offering: true,
  offering_cpu: '4',
  offering_memory: '4096',
  offering_storage: '50'
}

Normalizing VM: vm-xxx
Offering data: { cpu: '4', memory: '4096', storage: '50' }
Extracted config: { cpu: 4, ram: 4, disk: 50, memoryMB: 4096 }
Normalized VM: { id: '...', cpu: 4, ram: 4, disk: 50, ... }

=== Plans API Response ===
Total plans: 5
First plan sample: {
  name: 'Start-1',
  has_attribute: true,
  attribute: { cpu: 2, memory: 2048 },
  monthly_price: 194000
}
```

### Проверка на VPS

```bash
# Проверить логи PM2
pm2 logs uzcloud-console --lines 50

# Проверить API напрямую
curl -s "http://localhost/api/virtual-machines" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.data[0].offering'

curl -s "http://localhost/api/plans/service/Virtual%20Machine" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.data[0].attribute'
```

## 📊 Структура данных

### Виртуальная машина (после нормализации)

```typescript
{
  id: string,
  slug: string,
  name: string,
  hostname: string,
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error',
  cpu: number,           // vCPU (например: 4)
  ram: number,           // GB (например: 4)
  disk: number,          // GB (например: 50)
  ip_address: string | null,
  zone: string,          // например: 'PRODUCTION'
  template: string,      // например: 'Ubuntu 24.04 LTS'
  project_slug: string,
  created_at: string
}
```

### Тарифный план (после нормализации)

```typescript
{
  id: string,
  slug: string,
  name: string,          // например: 'Start-1'
  cpu: number,           // vCPU (из attribute.cpu)
  ram: number,           // GB (из attribute.memory / 1024)
  price: number,         // сўм/мес (из monthly_price)
  // ... другие поля из API
}
```

## 🚀 Обновление на VPS

```bash
cd /var/www/uzcloud-console
git pull origin main
npm run build
pm2 restart uzcloud-console

# Проверить логи
pm2 logs uzcloud-console --lines 50
```

## ✅ Что теперь работает

- [x] Список ВМ показывает реальные CPU/RAM/Disk/IP
- [x] Детали ВМ загружаются из API
- [x] Тарифные планы показывают реальные CPU/RAM/цену
- [x] Storage categories загружаются из API
- [x] Billing cycles загружаются из API
- [x] Templates (образы ОС) загружаются из API
- [x] Создание ВМ использует реальные slug из API
- [x] Подробное логирование для отладки

## 🐛 Известные ограничения

1. **Загрузка деталей ВМ** - может быть медленной если много ВМ (каждая ВМ = 1 запрос)
2. **Kubernetes ноды** - могут иметь другую структуру данных
3. **Некоторые ВМ** - могут не иметь offering если созданы через другой механизм

## 📈 Следующие улучшения

- [ ] Кэширование данных ВМ для ускорения
- [ ] Lazy loading деталей ВМ (загрузка по клику)
- [ ] WebSocket для real-time обновлений статуса
- [ ] Batch запросы для загрузки нескольких ВМ сразу

---

**Статус**: ✅ Все данные загружаются в реальном времени из API Stack Console
