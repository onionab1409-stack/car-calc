/**
 * Prisma клиент — singleton для серверных компонентов
 *
 * Реализация: P4 · Бэкенд (подэтап 4.4)
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
