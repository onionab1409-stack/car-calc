import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Car-Calc — Калькулятор доставки авто',
  description: 'Рассчитайте полную стоимость доставки автомобиля из США, Кореи, ОАЭ или Китая',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Telegram Mini App не должен зумиться
  themeColor: '#0c0c0e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        {/* Telegram WebApp SDK */}
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </head>
      <body className="bg-surface-primary text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
