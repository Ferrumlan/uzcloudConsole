# Деплой на VPS через GitHub Actions

## 📋 Настройка GitHub Secrets

Перейди в **Settings → Secrets and variables → Actions** в своем репозитории и добавь:

### Обязательные секреты:

```
VPS_HOST=your-vps-ip-or-domain.com
VPS_USERNAME=root
VPS_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
...ваш приватный SSH ключ...
-----END OPENSSH PRIVATE KEY-----
VPS_DEPLOY_PATH=/var/www/uzcloud-console
```

### Секреты окружения (опционально):

```
VITE_API_BASE_URL=https://uzcloud.stackpoc.in/backend/api
VITE_API_TOKEN=a21d54fa-1f0b-4650-a48a-880d0c5f3de5|ZtIEMcslWHuD2bmSuKJPCelrmqcy7xkCD4R3Xi76d2e2cd46
VITE_USE_MOCK=false
```

## 🔑 Генерация SSH ключа

На своем локальном компьютере:

```bash
# Генерируем ключ
ssh-keygen -t ed25519 -C "github-actions"

# Копируем публичный ключ на VPS
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@your-vps-ip

# Показываем приватный ключ (скопируй его в GitHub Secrets)
cat ~/.ssh/id_ed25519
```

## 🚀 Первоначальная настройка VPS

Подключись к VPS по SSH и выполни:

```bash
# 1. Установи Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Установи PM2
sudo npm install -g pm2

# 3. Создай директорию для проекта
sudo mkdir -p /var/www/uzcloud-console
sudo chown $USER:$USER /var/www/uzcloud-console

# 4. Установи Nginx (если еще не установлен)
sudo apt update
sudo apt install nginx

# 5. Настрой Nginx
sudo nano /etc/nginx/sites-available/uzcloud-console
```

Вставь конфигурацию:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # или IP

    root /var/www/uzcloud-console;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Активируй конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/uzcloud-console /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔄 Как работает деплой

1. Ты пушишь код в ветку `main`
2. GitHub Actions автоматически:
   - Устанавливает зависимости
   - Собирает проект с твоими секретами
   - Копирует `dist/` на VPS через SCP
   - Перезапускает PM2

## 📝 Проверка деплоя

```bash
# На VPS проверь статус PM2
pm2 status

# Посмотри логи
pm2 logs uzcloud-console

# Проверь Nginx
sudo systemctl status nginx
```

## 🔧 Ручной деплой (если нужно)

```bash
# Локально
npm run build

# Копируем на VPS
scp -r dist/* root@your-vps-ip:/var/www/uzcloud-console/

# На VPS перезапускаем
ssh root@your-vps-ip "pm2 restart uzcloud-console"
```

## 🆘 Troubleshooting

### Ошибка: "Permission denied (publickey)"
- Проверь, что приватный ключ в GitHub Secrets правильный
- Убедись, что публичный ключ добавлен в `~/.ssh/authorized_keys` на VPS

### Ошибка: "dist folder not found"
- Проверь, что `VPS_DEPLOY_PATH` указан правильно
- Убедись, что директория существует на VPS

### Сайт не открывается
- Проверь Nginx: `sudo systemctl status nginx`
- Проверь firewall: `sudo ufw status`
- Открой порт 80: `sudo ufw allow 80`

### PM2 не запускается
- Проверь логи: `pm2 logs`
- Перезапусти: `pm2 restart uzcloud-console`
- Удали и создай заново: `pm2 delete uzcloud-console && pm2 start "npm run preview -- --host 0.0.0.0" --name uzcloud-console`
