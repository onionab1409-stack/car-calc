// ============================================
// 🚀 PM2 Ecosystem Config — Car-Calc
// app.americanautohouse.com
// ============================================

module.exports = {
  apps: [
    {
      name: 'car-calc',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/car-calc',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',

      // Переменные окружения (продакшен)
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Логирование
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/car-calc/error.log',
      out_file: '/var/log/car-calc/out.log',
      merge_logs: true,
      log_type: 'json',

      // Graceful restart
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true,
    },
  ],
};
