#!/bin/bash
# ============================================
# ❤️ P8.5 · Uptime Monitor — Car-Calc
# ============================================
# Проверяет доступность приложения каждые 5 минут.
# При ошибке — шлёт уведомление в Telegram.
#
# Установка в cron:
#   */5 * * * * /var/www/car-calc/deploy/monitor.sh
# ============================================

set -uo pipefail

APP_URL="https://app.americanautohouse.com"
HEALTH_URL="${APP_URL}/api/health"
LOG_FILE="/var/log/car-calc/monitor.log"
STATE_FILE="/tmp/car-calc-monitor-state"

# Telegram уведомления (берём из .env.local)
ENV_FILE="/var/www/car-calc/.env.local"
if [ -f "$ENV_FILE" ]; then
  BOT_TOKEN=$(grep "^TELEGRAM_BOT_TOKEN=" "$ENV_FILE" | cut -d= -f2)
  ADMIN_CHAT=$(grep "^TELEGRAM_ADMIN_CHAT_ID=" "$ENV_FILE" | cut -d= -f2)
fi

# ─── Отправка уведомления в Telegram ───
send_alert() {
  local message="$1"
  if [ -n "${BOT_TOKEN:-}" ] && [ -n "${ADMIN_CHAT:-}" ]; then
    curl -s "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
      -d "chat_id=${ADMIN_CHAT}" \
      -d "text=${message}" \
      -d "parse_mode=Markdown" > /dev/null 2>&1
  fi
}

# ─── Health check ───
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
HTTP_CODE=$(curl -s -o /tmp/car-calc-health.json -w "%{http_code}" \
  --connect-timeout 10 --max-time 15 "$HEALTH_URL" 2>/dev/null || echo "000")

PREV_STATE="ok"
[ -f "$STATE_FILE" ] && PREV_STATE=$(cat "$STATE_FILE")

if [ "$HTTP_CODE" = "200" ]; then
  # ✅ Всё хорошо
  if [ "$PREV_STATE" != "ok" ]; then
    # Восстановление после ошибки
    DOWNTIME_START=$(stat -c %Y "$STATE_FILE" 2>/dev/null || echo "0")
    NOW=$(date +%s)
    DOWNTIME=$(( NOW - DOWNTIME_START ))
    DOWNTIME_MIN=$(( DOWNTIME / 60 ))

    echo "$TIMESTAMP ✅ RECOVERED after ${DOWNTIME_MIN}min" >> "$LOG_FILE"
    send_alert "✅ *Car-Calc восстановлен*
Был недоступен ${DOWNTIME_MIN} мин
${APP_URL}"
  fi
  echo "ok" > "$STATE_FILE"

else
  # ❌ Ошибка
  echo "$TIMESTAMP ❌ HTTP $HTTP_CODE" >> "$LOG_FILE"

  if [ "$PREV_STATE" = "ok" ]; then
    # Первая ошибка — отправляем алерт
    send_alert "🚨 *Car-Calc НЕ ОТВЕЧАЕТ!*
HTTP: ${HTTP_CODE}
URL: ${HEALTH_URL}
Время: ${TIMESTAMP}

Проверь: \`pm2 logs car-calc\`"
  fi
  echo "error" > "$STATE_FILE"

  # Попытка автоперезапуска (только при 2+ ошибках подряд)
  if [ "$PREV_STATE" = "error" ]; then
    echo "$TIMESTAMP 🔄 Auto-restart PM2..." >> "$LOG_FILE"
    pm2 restart car-calc 2>/dev/null
    send_alert "🔄 *Auto-restart* car-calc через PM2"
  fi
fi
