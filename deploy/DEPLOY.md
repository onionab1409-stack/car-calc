# 🚀 Деплой Car-Calc на VPS

## Сервер: Ubuntu 24.04 · app.americanautohouse.com

---

## Шаг 1 · DNS

Убедись что домен указывает на IP сервера:
```
A-запись: app.americanautohouse.com → <IP_VPS>
```

Проверка: `dig app.americanautohouse.com`

---

## Шаг 2 · Первоначальная настройка VPS

Подключись к VPS по SSH:
```bash
ssh root@<IP_VPS>
```

Клонируй репо и запусти setup:
```bash
cd /var/www
git clone https://github.com/onionab1409-stack/car-calc.git
cd car-calc
chmod +x deploy/setup-vps.sh
sudo ./deploy/setup-vps.sh
```

Скрипт автоматически:
- Обновит систему
- Установит Nginx, Node.js 18, PM2, Certbot
- Настроит файрвол (SSH + Nginx)
- Получит SSL сертификат
- Активирует Nginx конфиг
- Настроит логrotate

---

## Шаг 3 · Настройка приложения

```bash
cd /var/www/car-calc

# Создай .env.local из шаблона
cp deploy/.env.production .env.local
nano .env.local   # заполни TELEGRAM_BOT_TOKEN и остальное

# Установи зависимости и собери
npm ci --production=false
npx prisma generate
npx prisma db push
npm run build

# Запусти через PM2
pm2 start deploy/ecosystem.config.js
pm2 save
```

---

## Шаг 4 · Проверка

```bash
# PM2 статус
pm2 status

# Логи
pm2 logs car-calc --lines 20

# Тест из браузера
curl -I https://app.americanautohouse.com
```

---

## Полезные команды

| Команда | Что делает |
|---------|-----------|
| `pm2 status` | Статус приложения |
| `pm2 logs car-calc` | Логи в реальном времени |
| `pm2 restart car-calc` | Перезапуск |
| `pm2 reload car-calc` | Graceful reload (0 downtime) |
| `pm2 monit` | Мониторинг CPU/RAM |
| `sudo nginx -t` | Проверка конфига Nginx |
| `sudo systemctl reload nginx` | Перезагрузка Nginx |
| `sudo certbot renew --dry-run` | Тест обновления SSL |

---

## Структура на сервере

```
/var/www/car-calc/          ← приложение
├── .env.local              ← секреты (не в git!)
├── .next/                  ← build
├── prisma/prod.db          ← база данных
├── deploy/                 ← конфиги деплоя
│   ├── ecosystem.config.js ← PM2 конфиг
│   ├── nginx.conf          ← Nginx конфиг
│   └── setup-vps.sh        ← скрипт установки
└── node_modules/

/var/log/car-calc/          ← логи PM2
/etc/nginx/sites-available/ ← Nginx конфиг
/etc/letsencrypt/           ← SSL сертификаты
```
