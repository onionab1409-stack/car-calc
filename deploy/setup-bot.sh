#!/bin/bash
# ============================================
# 🤖 P8.4 · Настройка Telegram Bot
# ============================================
# Запуск:
#   chmod +x deploy/setup-bot.sh
#   ./deploy/setup-bot.sh <BOT_TOKEN>
#
# Или вручную:
#   ./deploy/setup-bot.sh 1234567890:ABCdefGhIJKlmnOPQRsTUVwxyz
# ============================================

set -euo pipefail

DOMAIN="app.americanautohouse.com"
WEBHOOK_URL="https://${DOMAIN}/api/bot"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[✅]${NC} $1"; }
err() { echo -e "${RED}[❌]${NC} $1"; exit 1; }
warn() { echo -e "${YELLOW}[⚠️]${NC} $1"; }

echo ""
echo "============================================"
echo "  🤖 Telegram Bot Setup"
echo "  $DOMAIN"
echo "============================================"
echo ""

# ─── Получаем токен ───
if [ -n "${1:-}" ]; then
  BOT_TOKEN="$1"
else
  echo -n "Введи токен бота от @BotFather: "
  read -r BOT_TOKEN
fi

if [ -z "$BOT_TOKEN" ]; then
  err "Токен не указан!"
fi

API="https://api.telegram.org/bot${BOT_TOKEN}"

# ─── 1. Проверка токена ───
log "Проверяю токен..."
RESULT=$(curl -s "${API}/getMe")
BOT_OK=$(echo "$RESULT" | grep -o '"ok":true' || true)

if [ -z "$BOT_OK" ]; then
  err "Токен невалидный! Проверь токен от @BotFather."
fi

BOT_USERNAME=$(echo "$RESULT" | grep -o '"username":"[^"]*"' | head -1 | cut -d'"' -f4)
log "Бот найден: @${BOT_USERNAME}"

# ─── 2. Установка webhook ───
log "Устанавливаю webhook: ${WEBHOOK_URL}"
WH_RESULT=$(curl -s "${API}/setWebhook" \
  -d "url=${WEBHOOK_URL}" \
  -d "allowed_updates=[\"message\",\"callback_query\"]" \
  -d "drop_pending_updates=true" \
  -d "max_connections=40")

WH_OK=$(echo "$WH_RESULT" | grep -o '"ok":true' || true)
if [ -z "$WH_OK" ]; then
  err "Не удалось установить webhook: $WH_RESULT"
fi
log "Webhook установлен!"

# ─── 3. Установка команд ───
log "Устанавливаю меню команд..."
COMMANDS='[
  {"command":"start","description":"🚗 Начать — приветствие и калькулятор"},
  {"command":"calc","description":"🧮 Рассчитать стоимость авто"},
  {"command":"help","description":"📖 Помощь — как пользоваться"}
]'

curl -s "${API}/setMyCommands" \
  -H "Content-Type: application/json" \
  -d "{\"commands\":${COMMANDS}}" > /dev/null

log "Команды установлены (/start, /calc, /help)"

# ─── 4. Описание бота ───
log "Устанавливаю описание бота..."
curl -s "${API}/setMyDescription" \
  -d "description=Калькулятор стоимости доставки авто из США 🇺🇸, Кореи 🇰🇷, ОАЭ 🇦🇪 и Китая 🇨🇳 в Россию и Беларусь. Узнай точную цену «под ключ» за 10 секунд!" > /dev/null

curl -s "${API}/setMyShortDescription" \
  -d "short_description=🚗 Калькулятор доставки авто из-за рубежа" > /dev/null

log "Описание установлено"

# ─── 5. Проверка webhook ───
log "Проверяю webhook..."
WH_INFO=$(curl -s "${API}/getWebhookInfo")
echo ""
echo "Webhook info:"
echo "$WH_INFO" | python3 -m json.tool 2>/dev/null || echo "$WH_INFO"

# ─── Итог ───
echo ""
echo "============================================"
echo -e "${GREEN}  ✅ Бот настроен!${NC}"
echo "============================================"
echo ""
echo "  🤖 Бот: @${BOT_USERNAME}"
echo "  🔗 Webhook: ${WEBHOOK_URL}"
echo "  📱 Mini App: https://${DOMAIN}"
echo ""
echo "  Не забудь добавить в .env.local:"
echo "    TELEGRAM_BOT_TOKEN=${BOT_TOKEN}"
echo "    NEXT_PUBLIC_BOT_USERNAME=${BOT_USERNAME}"
echo ""
echo "  Для админ-команд также нужен:"
echo "    TELEGRAM_ADMIN_CHAT_ID=<твой_chat_id>"
echo "    (Узнать: отправь /start боту @userinfobot)"
echo ""
echo "============================================"
