'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// ═══════════════════════════════════════════
// Telegram WebApp types
// ═══════════════════════════════════════════

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface MainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  setText(text: string): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
  enable(): void;
  disable(): void;
  showProgress(leaveActive?: boolean): void;
  hideProgress(): void;
  setParams(params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }): void;
}

interface BackButton {
  isVisible: boolean;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
}

interface HapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
  notificationOccurred(type: 'error' | 'success' | 'warning'): void;
  selectionChanged(): void;
}

interface WebApp {
  ready(): void;
  expand(): void;
  close(): void;
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
  };
  MainButton: MainButton;
  BackButton: BackButton;
  HapticFeedback: HapticFeedback;
  colorScheme: 'dark' | 'light';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  platform: string;
  version: string;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp;
    };
  }
}

// ═══════════════════════════════════════════
// Context
// ═══════════════════════════════════════════

interface TelegramContextValue {
  webApp: WebApp | null;
  user: TelegramUser | null;
  isReady: boolean;
  isTelegram: boolean;
  haptic: HapticFeedback | null;
}

const TelegramContext = createContext<TelegramContextValue>({
  webApp: null,
  user: null,
  isReady: false,
  isTelegram: false,
  haptic: null,
});

export function useTelegram() {
  return useContext(TelegramContext);
}

// ═══════════════════════════════════════════
// Provider
// ═══════════════════════════════════════════

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [webApp, setWebApp] = useState<WebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      // Инициализация
      tg.ready();
      tg.expand();

      // Стилизация под наш дизайн
      tg.setHeaderColor('#2a2b2a');
      tg.setBackgroundColor('#2a2b2a');

      // Настройка MainButton
      tg.MainButton.setParams({
        color: '#C4A265',
        text_color: '#1A1208',
      });

      setWebApp(tg);
      setIsReady(true);
    } else {
      // Не в Telegram — dev-режим
      setIsReady(true);
    }
  }, []);

  const value: TelegramContextValue = {
    webApp,
    user: webApp?.initDataUnsafe?.user ?? null,
    isReady,
    isTelegram: !!webApp,
    haptic: webApp?.HapticFeedback ?? null,
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}
