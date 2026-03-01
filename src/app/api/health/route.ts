// ============================================
// ❤️ GET /api/health — Health Check
// ============================================
// Используется:
//   - deploy.sh (после деплоя)
//   - P8.5 мониторинг (uptime check)
//   - Nginx health check
// ============================================

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const uptime = process.uptime();

  return NextResponse.json({
    status: 'ok',
    version: process.env.npm_package_version || '0.1.0',
    uptime: Math.round(uptime),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
}
