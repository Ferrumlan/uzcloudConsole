# Настройка Nginx Reverse Proxy для UzCloud Console

## Проблема

Браузер не может напрямую обращаться к `https://uzcloud.stackpoc.in/backend/api` из-за CORS (Cross-Origin Resource Sharing). API разрешает запросы только с домена `console.uzcloud.uz`.

## Решение

Настроить Nginx reverse proxy на VPS, который будет проксировать запросы через `/api`.

## Шаги настройки

### 1. Открой конфигурацию Nginx

```bash
sudo nano /etc/nginx/sites-available/uzcloud-console
```

### 2. Добавь location block для API proxy

Добавь **внутрь** блока `server { ... }`:

```nginx
location /api/ {
    proxy_pass https://uzcloud.stackpoc.in/backend/api/;
    proxy_set_header Host uzcloud.stackpoc.in;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_ssl_server_name on;
    proxy_ssl_protocols TLSv1.2 TLSv1.3;
}
```

### 3. Проверь и перезапусти Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Обнови `.env` на VPS

```bash
cd /var/www/uzcloud-console
nano .env
```

Измени `VITE_API_BASE_URL` на `/api`:

```env
VITE_API_BASE_URL=/api
VITE_API_TOKEN=a2cd2bd0-6523-4c84-90b1-6a2ea6fe322d|xQAL2WnXxU4ngNzxvgAJ0s9q9gRue2ZPgFFg4Xv7330120af
VITE_USE_MOCK=false
```

### 5. Пересобери и перезапусти

```bash
npm run build
pm2 restart uzcloud-console
```

## Проверка

### Проверь что proxy работает

```bash
curl -X GET "http://localhost/api/profile" \
  -H "Authorization: Bearer a2cd2bd0-6523-4c84-90b1-6a2ea6fe322d|xQAL2WnXxU4ngNzxvgAJ0s9q9gRue2ZPgFFg4Xv7330120af" \
  -H "Content-Type: application/json"
```

Должен вернуть JSON с данными пользователя.

### Проверь в браузере

1. Открой сайт
2. Открой консоль (F12)
3. Проверь логи — запросы должны идти через `/api/profile`
4. Должны загрузиться реальные данные

## Полный пример конфигурации Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;  # или IP

    root /var/www/uzcloud-console/dist;
    index index.html;

    # API Proxy
    location /api/ {
        proxy_pass https://uzcloud.stackpoc.in/backend/api/;
        proxy_set_header Host uzcloud.stackpoc.in;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_ssl_server_name on;
        proxy_ssl_protocols TLSv1.2 TLSv1.3;
    }

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Troubleshooting

### Ошибка 502 Bad Gateway

```bash
# Проверь что Nginx может достучаться до API
curl -I https://uzcloud.stackpoc.in/backend/api/profile
```

### Ошибка SSL

Убедись что в location block есть:
```nginx
proxy_ssl_server_name on;
```

### Запросы всё ещё идут напрямую

1. Проверь `.env` — должно быть `VITE_API_BASE_URL=/api`
2. Пересобери проект: `npm run build`
3. Очисти кэш браузера (Ctrl+Shift+R)
