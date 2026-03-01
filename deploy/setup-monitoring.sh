#!/bin/bash
# ============================================
# 📊 P8.5 · Настройка мониторинга
# ============================================
# Запуск:
#   chmod +x deploy/setup-monitoring.sh
#   sudo ./deploy/setup-monitoring.sh
# ============================================

set -euo pipefail

GREEN='\033[0;32m'
NC='\033[0m'
log() { echo -e "${GREEN}[✅]${NC} $1"; }

echo ""
echo "============================================"
echo "  📊 Настройка мониторинга Car-Calc"
echo "============================================"
echo ""

APP_DIR="/var/www/car-calc"

# ─── 1. Cron: uptime monitor каждые 5 минут ───
log "Добавляю cron для мониторинга (каждые 5 мин)..."
chmod +x "$APP_DIR/deploy/monitor.sh"

CRON_LINE="*/5 * * * * $APP_DIR/deploy/monitor.sh"
(crontab -l 2>/dev/null | grep -v "monitor.sh"; echo "$CRON_LINE") | crontab -
log "Cron добавлен: $CRON_LINE"

# ─── 2. PM2 log rotation ───
log "Настраиваю PM2 log rotation..."
pm2 install pm2-logrotate 2>/dev/null || true
pm2 set pm2-logrotate:max_size 10M 2>/dev/null
pm2 set pm2-logrotate:retain 14 2>/dev/null
pm2 set pm2-logrotate:compress true 2>/dev/null
log "PM2 logrotate: 10MB max, 14 дней, сжатие"

# ─── 3. Проверка что всё работает ───
log "Тестовый запуск мониторинга..."
"$APP_DIR/deploy/monitor.sh" && log "Мониторинг работает!" || log "Мониторинг пока не может подключиться (это нормально до запуска приложения)"

# ─── Итог ───
echo ""
echo "============================================"
echo -e "${GREEN}  ✅ Мониторинг настроен!${NC}"
echo "============================================"
echo ""
echo "  📊 Uptime check: каждые 5 минут"
echo "  📱 Алерты: Telegram (если настроен бот)"
echo "  🔄 Авторестарт: после 2 ошибок подряд"
echo "  📋 Логи: /var/log/car-calc/monitor.log"
echo "  📦 PM2 logs: pm2 logs car-calc"
echo ""
echo "  Для Sentry: добавь NEXT_PUBLIC_SENTRY_DSN в .env.local"
echo "  Регистрация: https://sentry.io → Create Project → Next.js"
echo ""
echo "============================================"
