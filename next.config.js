/** @type {import('next').NextConfig} */
const nextConfig = {
  // Отключаем строгий режим для Telegram WebApp SDK
  reactStrictMode: false,

  // Серверные переменные окружения
  serverExternalPackages: ['grammy', 'prisma', '@prisma/client'],

  // Заголовки для Telegram Mini App
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *;',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
