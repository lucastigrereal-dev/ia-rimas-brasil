/**
 * @fileoverview Serviço de Push Notifications
 * @module services/notifications
 */

import { isDevelopment } from '../config/env';

/**
 * Estado da permissão de notificação
 */
export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

/**
 * Opções para notificação
 */
export interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * Storage key para preferências
 */
const STORAGE_KEY = 'ia-rimas-notification-prefs';
const REMINDER_KEY = 'ia-rimas-daily-reminder';

/**
 * Verifica se notificações são suportadas
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Obtém o estado atual da permissão
 */
export function getPermissionState(): NotificationPermissionState {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
}

/**
 * Verifica se já pediu permissão antes
 */
export function hasAskedPermission(): boolean {
  const prefs = localStorage.getItem(STORAGE_KEY);
  if (!prefs) return false;

  try {
    const parsed = JSON.parse(prefs);
    return parsed.asked === true;
  } catch {
    return false;
  }
}

/**
 * Marca que já pediu permissão
 */
function markPermissionAsked(): void {
  const prefs = {
    asked: true,
    askedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

/**
 * Solicita permissão de notificação
 * @returns Promise com o estado da permissão
 */
export async function requestPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) {
    console.warn('[Notifications] Not supported in this browser');
    return 'unsupported';
  }

  // Se já está decidido, retorna o estado atual
  if (Notification.permission !== 'default') {
    return Notification.permission as NotificationPermissionState;
  }

  try {
    markPermissionAsked();
    const permission = await Notification.requestPermission();

    if (isDevelopment) {
      console.log('[Notifications] Permission:', permission);
    }

    return permission as NotificationPermissionState;
  } catch (error) {
    console.error('[Notifications] Error requesting permission:', error);
    return 'denied';
  }
}

/**
 * Exibe uma notificação
 * @param title - Título da notificação
 * @param options - Opções da notificação
 */
export async function showNotification(
  title: string,
  options: NotificationOptions = {}
): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('[Notifications] Not supported');
    return false;
  }

  if (Notification.permission !== 'granted') {
    console.warn('[Notifications] Permission not granted');
    return false;
  }

  try {
    // Usa Service Worker para notificações se disponível
    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options,
    });

    if (isDevelopment) {
      console.log('[Notifications] Shown:', title);
    }

    return true;
  } catch (error) {
    // Fallback para Notification API direta
    try {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        ...options,
      });
      return true;
    } catch (fallbackError) {
      console.error('[Notifications] Error showing notification:', fallbackError);
      return false;
    }
  }
}

/**
 * Notificações pré-definidas do app
 */
export const AppNotifications = {
  /**
   * Notificação de lembrete diário de streak
   */
  dailyStreak: (currentStreak: number) =>
    showNotification('Hora de rimar! 🎤', {
      body: currentStreak > 0
        ? `Mantenha seu streak de ${currentStreak} dias! Não perca seu progresso.`
        : 'Pratique hoje e comece um novo streak!',
      tag: 'daily-streak',
      requireInteraction: false,
      data: { type: 'daily-streak' },
    }),

  /**
   * Notificação de streak perdido
   */
  streakLost: (previousStreak: number) =>
    showNotification('Streak perdido 😢', {
      body: `Você perdeu seu streak de ${previousStreak} dias. Volte a praticar hoje!`,
      tag: 'streak-lost',
      data: { type: 'streak-lost' },
    }),

  /**
   * Notificação de level up
   */
  levelUp: (newLevel: number) =>
    showNotification('Level Up! 🎉', {
      body: `Parabéns! Você alcançou o nível ${newLevel}!`,
      tag: 'level-up',
      data: { type: 'level-up', level: newLevel },
    }),

  /**
   * Notificação de badge conquistado
   */
  badgeEarned: (badgeName: string) =>
    showNotification('Nova conquista! 🏆', {
      body: `Você desbloqueou: ${badgeName}`,
      tag: 'badge-earned',
      data: { type: 'badge-earned', badge: badgeName },
    }),

  /**
   * Notificação de streak milestone
   */
  streakMilestone: (days: number) =>
    showNotification(`${days} dias de streak! 🔥`, {
      body: 'Você está arrasando! Continue assim!',
      tag: 'streak-milestone',
      data: { type: 'streak-milestone', days },
    }),
};

/**
 * Agenda um lembrete diário
 * @param hour - Hora do dia (0-23)
 */
export function scheduleDailyReminder(hour: number): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  // Salva preferência
  const reminder = {
    enabled: true,
    hour,
    setAt: new Date().toISOString(),
  };
  localStorage.setItem(REMINDER_KEY, JSON.stringify(reminder));

  if (isDevelopment) {
    console.log('[Notifications] Daily reminder set for:', hour + ':00');
  }
}

/**
 * Obtém configuração do lembrete diário
 */
export function getDailyReminderConfig(): { enabled: boolean; hour: number } | null {
  const stored = localStorage.getItem(REMINDER_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Cancela o lembrete diário
 */
export function cancelDailyReminder(): void {
  localStorage.removeItem(REMINDER_KEY);

  if (isDevelopment) {
    console.log('[Notifications] Daily reminder cancelled');
  }
}

/**
 * Cancela todas as notificações
 */
export async function cancelAllNotifications(): Promise<void> {
  if (!isNotificationSupported()) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications();

    notifications.forEach(notification => notification.close());

    // Limpa lembretes
    localStorage.removeItem(REMINDER_KEY);

    if (isDevelopment) {
      console.log('[Notifications] All notifications cancelled');
    }
  } catch (error) {
    console.error('[Notifications] Error cancelling notifications:', error);
  }
}

/**
 * Verifica se deve mostrar lembrete diário
 * (Chamado pelo Service Worker ou no app load)
 */
export function shouldShowDailyReminder(): boolean {
  const config = getDailyReminderConfig();
  if (!config?.enabled) return false;

  const now = new Date();
  const currentHour = now.getHours();

  // Verifica se é a hora configurada
  if (currentHour !== config.hour) return false;

  // Verifica se já mostrou hoje
  const lastShown = localStorage.getItem('ia-rimas-last-reminder');
  if (lastShown) {
    const lastDate = new Date(lastShown).toDateString();
    if (lastDate === now.toDateString()) {
      return false; // Já mostrou hoje
    }
  }

  return true;
}

/**
 * Marca que mostrou o lembrete hoje
 */
export function markReminderShown(): void {
  localStorage.setItem('ia-rimas-last-reminder', new Date().toISOString());
}

export default {
  isSupported: isNotificationSupported,
  getPermissionState,
  hasAskedPermission,
  requestPermission,
  showNotification,
  scheduleDailyReminder,
  getDailyReminderConfig,
  cancelDailyReminder,
  cancelAllNotifications,
  shouldShowDailyReminder,
  markReminderShown,
  AppNotifications,
};
