#!/bin/bash
# ============================================
# 🚀 Deploy Script — Car-Calc
# Запускается на VPS после успешного CI
# ============================================
# Использование:
#   ./deploy/deploy.sh          — обычный деплой
#   ./deploy/deploy.sh --force  — без проверок
# ============================================

set -euo pipefail

APP_DIR="/var/www/car-calc"
LOG_FILE="/var/log/car-calc/deploy.log"
LOCK_FILE="/tmp/car-calc-deploy.lock"

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"; }
err() { echo -e "${RED}[$(date '+%H:%M:%S')] ❌ $1${NC}" | tee -a "$LOG_FILE"; exit 1; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠️  $1${NC}" | tee -a "$LOG_FILE"; }

# ─── Защита от параллельного деплоя ───
if [ -f "$LOCK_FILE" ]; then
  LOCK_AGE=$(( $(date +%s) - $(stat -c %Y "$LOCK_FILE") ))
  if [ "$LOCK_AGE" -lt 300 ]; then
    err "Деплой уже запущен (lock файл $LOCK_AGE сек назад). Подожди."
  else
    warn "Удаляю старый lock (${LOCK_AGE}с)"
    rm -f "$LOCK_FILE"
  fi
fi
trap 'rm -f $LOCK_FILE' EXIT
touch "$LOCK_FILE"

echo "" >> "$LOG_FILE"
log "════════════════════════════════════════"
log "🚀 Деплой запущен"
log "════════════════════════════════════════"

cd "$APP_DIR" || err "Директория $APP_DIR не найдена"

# ─── 1. Git pull ───
log "📥 Git pull..."
BEFORE=$(git rev-parse HEAD)
git fetch origin main --quiet
git reset --hard origin/main --quiet
AFTER=$(git rev-parse HEAD)

if [ "$BEFORE" = "$AFTER" ] && [ "${1:-}" != "--force" ]; then
  log "Нет изменений (${BEFORE:0:7}). Пропускаю."
  exit 0
fi

log "Обновлено: ${BEFORE:0:7} → ${AFTER:0:7}"
git log --oneline -3 | while read line; do log "  $line"; done

# ─── 2. Установка зависимостей (если изменился package-lock) ───
if git diff "$BEFORE" "$AFTER" --name-only | grep -q "package-lock.json"; then
  log "📦 npm ci (package-lock изменился)..."
  npm ci --production=false --quiet 2>&1 | tail -3
else
  log "📦 Зависимости не изменились — пропускаю npm ci"
fi

# ─── 3. Prisma (если изменилась схема) ───
if git diff "$BEFORE" "$AFTER" --name-only | grep -q "prisma/schema.prisma"; then
  log "🗄️ Prisma generate + db push..."
  npx prisma generate --quiet
  npx prisma db push --skip-generate --accept-data-loss 2>&1 | tail -2
else
  log "🗄️ Prisma схема не изменилась — пропускаю"
fi

# ─── 4. Build ───
log "🏗️ Next.js build..."
BUILD_START=$(date +%s)
npm run build 2>&1 | tail -5
BUILD_TIME=$(( $(date +%s) - BUILD_START ))
log "Build завершён за ${BUILD_TIME}с"

# ─── 5. PM2 reload (zero-downtime) ───
log "🔄 PM2 reload..."
if pm2 describe car-calc > /dev/null 2>&1; then
  pm2 reload car-calc --update-env
else
  pm2 start deploy/ecosystem.config.js
fi
pm2 save --quiet

# ─── 6. Health check ───
log "❤️ Health check..."
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  log "✅ Приложение работает (HTTP $HTTP_CODE)"
else
  warn "Приложение вернуло HTTP $HTTP_CODE — проверь логи: pm2 logs car-calc"
fi

# ─── Итог ───
TOTAL_TIME=$(( $(date +%s) - $(stat -c %Y "$LOCK_FILE") ))
log "════════════════════════════════════════"
log "✅ Деплой завершён за ${TOTAL_TIME}с"
log "   Коммит: $(git rev-parse --short HEAD)"
log "   Время: $(date '+%Y-%m-%d %H:%M:%S')"
log "════════════════════════════════════════"
