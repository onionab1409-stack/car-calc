// ============================================
// 🧪 P7.3 · Stress-test Rate Limiter
// ============================================
// Фокус: поведение под нагрузкой, множественные клиенты,
// временные окна, очистка памяти, изоляция endpoint-ов.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  checkRateLimit,
  getClientId,
  _resetRateLimiter,
  RATE_LIMITS,
} from '@/lib/rate-limiter';

beforeEach(() => {
  _resetRateLimiter();
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ═══════════════════════════════════════════
// A. МНОЖЕСТВЕННЫЕ КЛИЕНТЫ — ИЗОЛЯЦИЯ
// ═══════════════════════════════════════════

describe('P7.3-A · Изоляция клиентов', () => {

  it('10 разных клиентов — каждый имеет свой лимит', () => {
    const clients = Array.from({ length: 10 }, (_, i) => `client-${i}`);

    // Каждый клиент делает 10 запросов (лимит /api/calculate = 10)
    for (const client of clients) {
      for (let i = 0; i < 10; i++) {
        const r = checkRateLimit('/api/calculate', client);
        expect(r.allowed, `${client} req ${i}`).toBe(true);
      }
    }

    // 11-й запрос от каждого — отказ
    for (const client of clients) {
      const r = checkRateLimit('/api/calculate', client);
      expect(r.allowed, `${client} req 11`).toBe(false);
      expect(r.remaining).toBe(0);
    }
  });

  it('Блокировка одного клиента не влияет на остальных', () => {
    // Забиваем лимит клиента A
    for (let i = 0; i < 10; i++) {
      checkRateLimit('/api/calculate', 'blocked-user');
    }
    expect(checkRateLimit('/api/calculate', 'blocked-user').allowed).toBe(false);

    // Клиент B — свободен
    const r = checkRateLimit('/api/calculate', 'free-user');
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(9);
  });

  it('50 клиентов × 10 запросов = 500 запросов, все проходят', () => {
    let totalAllowed = 0;
    for (let c = 0; c < 50; c++) {
      for (let i = 0; i < 10; i++) {
        const r = checkRateLimit('/api/calculate', `mass-client-${c}`);
        if (r.allowed) totalAllowed++;
      }
    }
    expect(totalAllowed).toBe(500);
  });

  it('50 клиентов × 11 запросов — ровно 50 отказов', () => {
    let totalDenied = 0;
    for (let c = 0; c < 50; c++) {
      for (let i = 0; i < 11; i++) {
        const r = checkRateLimit('/api/calculate', `burst-client-${c}`);
        if (!r.allowed) totalDenied++;
      }
    }
    expect(totalDenied).toBe(50); // по 1 отказу на клиента
  });
});

// ═══════════════════════════════════════════
// B. ИЗОЛЯЦИЯ ENDPOINT-ОВ
// ═══════════════════════════════════════════

describe('P7.3-B · Изоляция endpoint-ов', () => {

  it('Лимит на /api/calculate не влияет на /api/rates', () => {
    // Забиваем /api/calculate
    for (let i = 0; i < 10; i++) {
      checkRateLimit('/api/calculate', 'same-user');
    }
    expect(checkRateLimit('/api/calculate', 'same-user').allowed).toBe(false);

    // /api/rates — всё ещё ок
    const r = checkRateLimit('/api/rates', 'same-user');
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(29);
  });

  it('Лимит на /api/lead не влияет на /api/calculate', () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit('/api/lead', 'lead-user');
    }
    expect(checkRateLimit('/api/lead', 'lead-user').allowed).toBe(false);

    expect(checkRateLimit('/api/calculate', 'lead-user').allowed).toBe(true);
  });

  it('Все 3 endpoint-а блокируются независимо для одного клиента', () => {
    const user = 'multi-endpoint';

    // Забиваем все
    for (let i = 0; i < 10; i++) checkRateLimit('/api/calculate', user);
    for (let i = 0; i < 30; i++) checkRateLimit('/api/rates', user);
    for (let i = 0; i < 3; i++) checkRateLimit('/api/lead', user);

    expect(checkRateLimit('/api/calculate', user).allowed).toBe(false);
    expect(checkRateLimit('/api/rates', user).allowed).toBe(false);
    expect(checkRateLimit('/api/lead', user).allowed).toBe(false);
  });

  it('Неизвестный endpoint → всегда разрешён', () => {
    for (let i = 0; i < 100; i++) {
      const r = checkRateLimit('/api/unknown', 'anyone');
      expect(r.allowed).toBe(true);
      expect(r.remaining).toBe(999);
    }
  });
});

// ═══════════════════════════════════════════
// C. ВРЕМЕННОЕ ОКНО (fake timers)
// ═══════════════════════════════════════════

describe('P7.3-C · Временное окно', () => {

  it('Лимит сбрасывается через 60 секунд', () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    // Забиваем лимит
    for (let i = 0; i < 10; i++) {
      checkRateLimit('/api/calculate', 'timer-user');
    }
    expect(checkRateLimit('/api/calculate', 'timer-user').allowed).toBe(false);

    // Через 59 секунд — всё ещё blocked
    vi.setSystemTime(now + 59_000);
    expect(checkRateLimit('/api/calculate', 'timer-user').allowed).toBe(false);

    // Через 61 секунду — первый слот освободился
    vi.setSystemTime(now + 61_000);
    const r = checkRateLimit('/api/calculate', 'timer-user');
    expect(r.allowed).toBe(true);
  });

  it('Постепенное освобождение слотов', () => {
    vi.useFakeTimers();
    const base = Date.now();

    // 10 запросов с интервалом 1 секунда (0, 1, 2, ... 9 сек)
    for (let i = 0; i < 10; i++) {
      vi.setSystemTime(base + i * 1000);
      expect(checkRateLimit('/api/calculate', 'gradual-user').allowed).toBe(true);
    }

    // Через 60 сек от первого → 1 слот свободен
    vi.setSystemTime(base + 60_500);
    expect(checkRateLimit('/api/calculate', 'gradual-user').allowed).toBe(true);

    // Второй запрос → нет (ещё только 1 слот освободился, но мы его заняли)
    expect(checkRateLimit('/api/calculate', 'gradual-user').allowed).toBe(false);

    // Через 61.5 сек от первого → ещё один слот свободен
    vi.setSystemTime(base + 61_500);
    expect(checkRateLimit('/api/calculate', 'gradual-user').allowed).toBe(true);
  });

  it('Burst → ожидание → полное восстановление', () => {
    vi.useFakeTimers();
    const base = Date.now();
    vi.setSystemTime(base);

    // Burst: все 10 запросов за 0 мс
    for (let i = 0; i < 10; i++) {
      checkRateLimit('/api/calculate', 'burst-user');
    }
    expect(checkRateLimit('/api/calculate', 'burst-user').allowed).toBe(false);

    // Через 61 секунду — ВСЕ 10 слотов свободны
    vi.setSystemTime(base + 61_000);

    let allowed = 0;
    for (let i = 0; i < 10; i++) {
      if (checkRateLimit('/api/calculate', 'burst-user').allowed) allowed++;
    }
    expect(allowed).toBe(10);

    // 11-й — отказ
    expect(checkRateLimit('/api/calculate', 'burst-user').allowed).toBe(false);
  });

  it('resetMs показывает корректное время до сброса', () => {
    vi.useFakeTimers();
    const base = Date.now();
    vi.setSystemTime(base);

    for (let i = 0; i < 10; i++) {
      checkRateLimit('/api/calculate', 'reset-user');
    }

    const r = checkRateLimit('/api/calculate', 'reset-user');
    expect(r.allowed).toBe(false);
    // Все 10 были в момент base → resetMs = base + 60000 - base = 60000
    expect(r.resetMs).toBeGreaterThanOrEqual(59_000);
    expect(r.resetMs).toBeLessThanOrEqual(60_000);

    // Через 30 сек → resetMs ~30000
    vi.setSystemTime(base + 30_000);
    const r2 = checkRateLimit('/api/calculate', 'reset-user');
    expect(r2.resetMs).toBeGreaterThanOrEqual(29_000);
    expect(r2.resetMs).toBeLessThanOrEqual(30_000);
  });
});

// ═══════════════════════════════════════════
// D. REMAINING COUNTER
// ═══════════════════════════════════════════

describe('P7.3-D · Remaining counter', () => {

  it('/api/calculate: remaining уменьшается 9→8→...→0', () => {
    for (let i = 0; i < 10; i++) {
      const r = checkRateLimit('/api/calculate', 'count-user');
      expect(r.remaining).toBe(9 - i);
    }
  });

  it('/api/lead: remaining 2→1→0', () => {
    for (let i = 0; i < 3; i++) {
      const r = checkRateLimit('/api/lead', 'lead-count');
      expect(r.remaining).toBe(2 - i);
    }
  });

  it('/api/rates: remaining 29→28→...→0', () => {
    for (let i = 0; i < 30; i++) {
      const r = checkRateLimit('/api/rates', 'rates-count');
      expect(r.remaining).toBe(29 - i);
    }
    const denied = checkRateLimit('/api/rates', 'rates-count');
    expect(denied.remaining).toBe(0);
    expect(denied.allowed).toBe(false);
  });
});

// ═══════════════════════════════════════════
// E. getClientId — ПАРСИНГ ЗАГОЛОВКОВ
// ═══════════════════════════════════════════

describe('P7.3-E · getClientId', () => {

  it('X-Telegram-User-Id имеет наивысший приоритет', () => {
    const headers = new Headers({
      'x-telegram-user-id': '12345',
      'x-forwarded-for': '1.2.3.4',
      'x-real-ip': '5.6.7.8',
    });
    expect(getClientId(headers)).toBe('tg:12345');
  });

  it('X-Forwarded-For — второй приоритет', () => {
    const headers = new Headers({
      'x-forwarded-for': '10.0.0.1, 10.0.0.2',
      'x-real-ip': '10.0.0.3',
    });
    expect(getClientId(headers)).toBe('ip:10.0.0.1');
  });

  it('X-Forwarded-For: берёт первый IP из цепочки', () => {
    const headers = new Headers({
      'x-forwarded-for': '  192.168.1.1 , 10.0.0.1 , 172.16.0.1 ',
    });
    expect(getClientId(headers)).toBe('ip:192.168.1.1');
  });

  it('X-Real-Ip — третий приоритет', () => {
    const headers = new Headers({ 'x-real-ip': '203.0.113.5' });
    expect(getClientId(headers)).toBe('ip:203.0.113.5');
  });

  it('Нет заголовков → ip:unknown', () => {
    const headers = new Headers();
    expect(getClientId(headers)).toBe('ip:unknown');
  });

  it('Telegram ID изолирует клиента от IP', () => {
    // Два разных Telegram-юзера с одного IP
    const h1 = new Headers({ 'x-telegram-user-id': '111', 'x-forwarded-for': '1.1.1.1' });
    const h2 = new Headers({ 'x-telegram-user-id': '222', 'x-forwarded-for': '1.1.1.1' });

    expect(getClientId(h1)).toBe('tg:111');
    expect(getClientId(h2)).toBe('tg:222');
    expect(getClientId(h1)).not.toBe(getClientId(h2));
  });
});

// ═══════════════════════════════════════════
// F. КОНФИГУРАЦИЯ
// ═══════════════════════════════════════════

describe('P7.3-F · Конфигурация лимитов', () => {

  it('Конфиг содержит все 3 endpoint-а', () => {
    expect(RATE_LIMITS).toHaveProperty('/api/calculate');
    expect(RATE_LIMITS).toHaveProperty('/api/rates');
    expect(RATE_LIMITS).toHaveProperty('/api/lead');
  });

  it('Лимиты: 10/мин calculate, 30/мин rates, 3/мин lead', () => {
    expect(RATE_LIMITS['/api/calculate'].maxRequests).toBe(10);
    expect(RATE_LIMITS['/api/calculate'].windowMs).toBe(60_000);
    expect(RATE_LIMITS['/api/rates'].maxRequests).toBe(30);
    expect(RATE_LIMITS['/api/lead'].maxRequests).toBe(3);
  });

  it('Точные лимиты /api/lead: 3 проходят, 4-й нет', () => {
    expect(checkRateLimit('/api/lead', 'strict-lead').allowed).toBe(true);
    expect(checkRateLimit('/api/lead', 'strict-lead').allowed).toBe(true);
    expect(checkRateLimit('/api/lead', 'strict-lead').allowed).toBe(true);
    expect(checkRateLimit('/api/lead', 'strict-lead').allowed).toBe(false);
    // 5-й тоже нет
    expect(checkRateLimit('/api/lead', 'strict-lead').allowed).toBe(false);
  });
});

// ═══════════════════════════════════════════
// G. RESET
// ═══════════════════════════════════════════

describe('P7.3-G · Reset', () => {

  it('_resetRateLimiter очищает все данные', () => {
    // Забиваем несколько клиентов
    for (let i = 0; i < 10; i++) checkRateLimit('/api/calculate', 'reset-a');
    for (let i = 0; i < 10; i++) checkRateLimit('/api/calculate', 'reset-b');

    expect(checkRateLimit('/api/calculate', 'reset-a').allowed).toBe(false);
    expect(checkRateLimit('/api/calculate', 'reset-b').allowed).toBe(false);

    // Reset
    _resetRateLimiter();

    // Снова доступны
    expect(checkRateLimit('/api/calculate', 'reset-a').allowed).toBe(true);
    expect(checkRateLimit('/api/calculate', 'reset-b').allowed).toBe(true);
  });
});

// ═══════════════════════════════════════════
// H. ИМИТАЦИЯ РЕАЛЬНОЙ НАГРУЗКИ
// ═══════════════════════════════════════════

describe('P7.3-H · Имитация реальной нагрузки', () => {

  it('100 клиентов за 1 «минуту» — все в лимитах', () => {
    vi.useFakeTimers();
    const base = Date.now();
    let totalAllowed = 0;
    let totalDenied = 0;

    // 100 клиентов, каждый шлёт 5 запросов за минуту
    for (let c = 0; c < 100; c++) {
      for (let i = 0; i < 5; i++) {
        vi.setSystemTime(base + i * 10_000); // каждые 10 сек
        const r = checkRateLimit('/api/calculate', `load-${c}`);
        if (r.allowed) totalAllowed++;
        else totalDenied++;
      }
    }

    expect(totalAllowed).toBe(500); // все проходят (5 < 10 лимит)
    expect(totalDenied).toBe(0);
  });

  it('Агрессивный клиент-спаммер блокируется, остальные нет', () => {
    const spammer = 'spam-bot';
    const normal = 'normal-user';

    // Спаммер шлёт 20 запросов
    let spamAllowed = 0;
    for (let i = 0; i < 20; i++) {
      if (checkRateLimit('/api/calculate', spammer).allowed) spamAllowed++;
    }
    expect(spamAllowed).toBe(10); // первые 10 прошли

    // Нормальный пользователь — не затронут
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('/api/calculate', normal).allowed).toBe(true);
    }
  });

  it('Распределённая нагрузка: 10 запросов/мин стабильно', () => {
    vi.useFakeTimers();
    const base = Date.now();

    // 3 минуты, каждую минуту 10 запросов (ровно в лимит)
    for (let minute = 0; minute < 3; minute++) {
      vi.setSystemTime(base + minute * 61_000); // +61 сек каждый цикл (чтобы окно сбросилось)

      let allowed = 0;
      for (let i = 0; i < 10; i++) {
        if (checkRateLimit('/api/calculate', 'steady-user').allowed) allowed++;
      }
      expect(allowed, `minute ${minute}`).toBe(10);
    }
  });
});
