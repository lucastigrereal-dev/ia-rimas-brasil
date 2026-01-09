/**
 * @fileoverview Hooks de Notificações
 * @module hooks/useNotifications
 */

import { useState, useEffect, useCallback } from 'react';
import {
  isNotificationSupported,
  getPermissionState,
  hasAskedPermission,
  requestPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
  getDailyReminderConfig,
  shouldShowDailyReminder,
  markReminderShown,
  AppNotifications,
  type NotificationPermissionState,
} from '../services/notifications';

/**
 * Retorno do hook useNotifications
 */
interface UseNotificationsReturn {
  /** Se notificações são suportadas */
  isSupported: boolean;
  /** Estado da permissão atual */
  permission: NotificationPermissionState;
  /** Se já pediu permissão antes */
  hasAsked: boolean;
  /** Se pode enviar notificações */
  canNotify: boolean;
  /** Solicita permissão */
  requestPermission: () => Promise<NotificationPermissionState>;
  /** Notificações do app */
  notify: typeof AppNotifications;
}

/**
 * Hook para gerenciar notificações
 */
export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermissionState>(() =>
    getPermissionState()
  );
  const [hasAsked, setHasAsked] = useState(() => hasAskedPermission());

  const isSupported = isNotificationSupported();
  const canNotify = isSupported && permission === 'granted';

  // Atualiza estado quando foco retorna à janela
  useEffect(() => {
    const handleFocus = () => {
      setPermission(getPermissionState());
      setHasAsked(hasAskedPermission());
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleRequestPermission = useCallback(async () => {
    const result = await requestPermission();
    setPermission(result);
    setHasAsked(true);
    return result;
  }, []);

  return {
    isSupported,
    permission,
    hasAsked,
    canNotify,
    requestPermission: handleRequestPermission,
    notify: AppNotifications,
  };
}

/**
 * Retorno do hook useDailyReminder
 */
interface UseDailyReminderReturn {
  /** Se o lembrete está ativo */
  isEnabled: boolean;
  /** Hora configurada (0-23) */
  hour: number | null;
  /** Ativa o lembrete diário */
  enable: (hour: number) => void;
  /** Desativa o lembrete diário */
  disable: () => void;
  /** Altera a hora do lembrete */
  setHour: (hour: number) => void;
}

/**
 * Hook para gerenciar lembrete diário de streak
 */
export function useDailyReminder(): UseDailyReminderReturn {
  const [config, setConfig] = useState(() => getDailyReminderConfig());

  const isEnabled = config?.enabled ?? false;
  const hour = config?.hour ?? null;

  // Verifica e mostra lembrete quando app abre
  useEffect(() => {
    if (shouldShowDailyReminder()) {
      // Obtém streak atual do localStorage
      const streakData = localStorage.getItem('ia-rimas-streak');
      const currentStreak = streakData ? JSON.parse(streakData).count || 0 : 0;

      AppNotifications.dailyStreak(currentStreak);
      markReminderShown();
    }
  }, []);

  const enable = useCallback((reminderHour: number) => {
    scheduleDailyReminder(reminderHour);
    setConfig({ enabled: true, hour: reminderHour });
  }, []);

  const disable = useCallback(() => {
    cancelDailyReminder();
    setConfig(null);
  }, []);

  const setHour = useCallback((newHour: number) => {
    if (isEnabled) {
      scheduleDailyReminder(newHour);
      setConfig({ enabled: true, hour: newHour });
    }
  }, [isEnabled]);

  return {
    isEnabled,
    hour,
    enable,
    disable,
    setHour,
  };
}

/**
 * Hook para pedir permissão apenas uma vez
 * Útil para mostrar modal de permissão
 */
export function useNotificationPrompt() {
  const { isSupported, permission, hasAsked, requestPermission } = useNotifications();

  // Deve mostrar prompt se:
  // 1. Suportado
  // 2. Ainda não decidiu (default)
  // 3. Ainda não perguntou
  const shouldShow = isSupported && permission === 'default' && !hasAsked;

  // Não deve mais pedir se já negou
  const canAskAgain = isSupported && permission === 'default';

  return {
    shouldShow,
    canAskAgain,
    requestPermission,
  };
}

export default useNotifications;
