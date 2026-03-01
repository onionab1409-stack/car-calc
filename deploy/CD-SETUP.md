# 🔑 Настройка автодеплоя (CD)

## Как это работает

```
git push → CI (lint + тесты) → ✅ → CD (SSH → VPS → deploy.sh → pm2 reload)
```

Автоматически. Ты пушишь код — через 5-7 минут он уже на сервере.

---

## Шаг 1 · Создай SSH ключ для деплоя

На своём компьютере (или на VPS):

```bash
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/car-calc-deploy
# Пароль — пустой (жми Enter дважды)
```

Будет 2 файла:
- `~/.ssh/car-calc-deploy` — ПРИВАТНЫЙ ключ (для GitHub)
- `~/.ssh/car-calc-deploy.pub` — ПУБЛИЧНЫЙ ключ (для VPS)

---

## Шаг 2 · Добавь публичный ключ на VPS

```bash
# На VPS:
cat ~/.ssh/car-calc-deploy.pub >> ~/.ssh/authorized_keys
```

Или скопируй содержимое `.pub` файла вручную в `/root/.ssh/authorized_keys` на VPS.

---

## Шаг 3 · Добавь секреты в GitHub

1. Открой https://github.com/onionab1409-stack/car-calc/settings/secrets/actions
2. Нажми **New repository secret** и добавь 3 секрета:

| Имя | Значение |
|-----|---------|
| `VPS_HOST` | IP адрес твоего VPS (например `185.123.45.67`) |
| `VPS_USER` | `root` (или другой SSH пользователь) |
| `VPS_SSH_KEY` | Содержимое файла `~/.ssh/car-calc-deploy` (ПРИВАТНЫЙ ключ, всё от `-----BEGIN` до `-----END`) |

---

## Шаг 4 · Проверь

Сделай любой пуш в main — в GitHub Actions увидишь:
1. **CI** — lint + тесты (3-5 мин)
2. **CD — Deploy** — деплой на VPS (1-2 мин)

---

## Ручной деплой (если нужно)

SSH на VPS и запусти:
```bash
cd /var/www/car-calc
./deploy/deploy.sh
```

Или принудительно (без проверки изменений):
```bash
./deploy/deploy.sh --force
```
