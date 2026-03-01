#!/bin/bash
# ============================================
# 🚀 P8.2 · VPS Setup Script — Car-Calc
# Ubuntu 24.04 · app.americanautohouse.com
# ============================================
# Запуск:
#   chmod +x deploy/setup-vps.sh
#   sudo ./deploy/setup-vps.sh
# ============================================

set -euo pipefail

DOMAIN="app.americanautohouse.com"
APP_DIR="/var/www/car-calc"
LOG_DIR="/var/log/car-calc"
CERTBOT_DIR="/var/www/certbot"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[✅]${NC} $1"; }
warn() { echo -e "${YELLOW}[⚠️]${NC} $1"; }
err() { echo -e "${RED}[❌]${NC} $1"; exit 1; }

echo ""
echo "============================================"
echo "  🚗 Car-Calc VPS Setup"
echo "  $DOMAIN"
echo "============================================"
echo ""

# ─── 1. Проверка root ───
if [ "$EUID" -ne 0 ]; then
  err "Запусти с sudo: sudo ./deploy/setup-vps.sh"
fi

# ─── 2. Обновление системы ───
log "Обновляю систему..."
apt update -qq && apt upgrade -y -qq

# ─── 3. Установка пакетов ───
log "Устанавливаю Nginx, Certbot, Git..."
apt install -y -qq nginx certbot python3-certbot-nginx git curl ufw

# ─── 4. Node.js 18 (если нет) ───
if ! command -v node &> /dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 18 ]]; then
  log "Устанавливаю Node.js 18..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt install -y -qq nodejs
else
  log "Node.js $(node -v) уже установлен"
fi

# ─── 5. PM2 (если нет) ───
if ! command -v pm2 &> /dev/null; then
  log "Устанавливаю PM2..."
  npm install -g pm2
  pm2 startup systemd -u root --hp /root
else
  log "PM2 $(pm2 -v) уже установлен"
fi

# ─── 6. Директории ───
log "Создаю директории..."
mkdir -p "$APP_DIR" "$LOG_DIR" "$CERTBOT_DIR"

# ─── 7. Firewall (UFW) ───
log "Настраиваю файрвол..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
log "UFW активирован (SSH + Nginx)"

# ─── 8. Nginx конфиг (без SSL сначала) ───
log "Настраиваю Nginx (HTTP only для получения SSL)..."

# Временный конфиг — только HTTP для certbot
cat > /etc/nginx/sites-available/car-calc-temp <<'NGINX_TEMP'
server {
    listen 80;
    listen [::]:80;
    server_name app.americanautohouse.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
    }

    location / {
        return 200 'Car-Calc setup in progress...';
        add_header Content-Type text/plain;
    }
}
NGINX_TEMP

# Активируем
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/car-calc
rm -f /etc/nginx/sites-enabled/car-calc-temp
ln -s /etc/nginx/sites-available/car-calc-temp /etc/nginx/sites-enabled/car-calc-temp

nginx -t && systemctl reload nginx
log "Nginx запущен (HTTP)"

# ─── 9. SSL сертификат ───
log "Получаю SSL сертификат от Let's Encrypt..."
echo ""
warn "⚡ ВАЖНО: Домен $DOMAIN должен указывать на IP этого сервера!"
warn "   Проверь: dig $DOMAIN"
echo ""

certbot certonly \
  --webroot \
  --webroot-path="$CERTBOT_DIR" \
  -d "$DOMAIN" \
  --non-interactive \
  --agree-tos \
  --email admin@americanautohouse.com \
  || {
    warn "Certbot не смог получить сертификат."
    warn "Убедись что DNS $DOMAIN → IP этого сервера."
    warn "После настройки DNS запусти:"
    warn "  sudo certbot certonly --webroot --webroot-path=$CERTBOT_DIR -d $DOMAIN"
    warn ""
    warn "Пока продолжаем без SSL..."
  }

# ─── 10. Полный Nginx конфиг (с SSL) ───
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  log "SSL получен! Активирую полный Nginx конфиг..."
  
  # Копируем продакшен-конфиг
  if [ -f "$APP_DIR/deploy/nginx.conf" ]; then
    cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/car-calc
  else
    warn "deploy/nginx.conf не найден — скопируй вручную после клонирования репо"
  fi
  
  # Переключаемся
  rm -f /etc/nginx/sites-enabled/car-calc-temp
  ln -sf /etc/nginx/sites-available/car-calc /etc/nginx/sites-enabled/car-calc
  nginx -t && systemctl reload nginx
  log "Nginx с SSL активен! 🔒"
else
  warn "SSL не получен — Nginx работает на HTTP"
fi

# ─── 11. Автообновление SSL ───
log "Настраиваю автообновление SSL (2 раза в день)..."
(crontab -l 2>/dev/null; echo "0 3,15 * * * certbot renew --quiet --deploy-hook 'systemctl reload nginx'") | sort -u | crontab -
log "Cron для certbot renew добавлен"

# ─── 12. Logrotate ───
log "Настраиваю ротацию логов..."
cat > /etc/logrotate.d/car-calc <<'LOGROTATE'
/var/log/car-calc/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    copytruncate
}
LOGROTATE

# ─── Итог ───
echo ""
echo "============================================"
echo -e "${GREEN}  ✅ VPS Setup Complete!${NC}"
echo "============================================"
echo ""
echo "  📂 Приложение:  $APP_DIR"
echo "  📋 Логи:        $LOG_DIR"
echo "  🌐 Домен:       https://$DOMAIN"
echo ""
echo "  Следующие шаги:"
echo "  1. Клонируй репо в $APP_DIR"
echo "  2. Создай .env.local"
echo "  3. npm install && npm run build"
echo "  4. pm2 start deploy/ecosystem.config.js"
echo ""
echo "============================================"
