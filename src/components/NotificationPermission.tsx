/**
 * @fileoverview Modal de Permissão de Notificações
 * @module components/NotificationPermission
 */

import { useState, useEffect } from 'react';
import { useNotificationPrompt } from '../hooks/useNotifications';

interface NotificationPermissionProps {
  /** Chamado quando fecha o modal (aceita ou recusa) */
  onClose?: () => void;
  /** Delay antes de mostrar (ms) */
  delay?: number;
}

/**
 * Modal pedindo permissão de notificação
 * Mostra automaticamente se ainda não pediu permissão
 */
export function NotificationPermission({
  onClose,
  delay = 3000,
}: NotificationPermissionProps) {
  const { shouldShow, requestPermission } = useNotificationPrompt();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mostra após delay
  useEffect(() => {
    if (!shouldShow) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [shouldShow, delay]);

  const handleAllow = async () => {
    setIsLoading(true);
    await requestPermission();
    setIsLoading(false);
    setIsVisible(false);
    onClose?.();
  };

  const handleDeny = () => {
    // Salva que recusou
    localStorage.setItem('ia-rimas-notification-prefs', JSON.stringify({
      asked: true,
      denied: true,
      askedAt: new Date().toISOString(),
    }));
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-sm bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 animate-in slide-in-from-bottom-4 duration-300"
        role="dialog"
        aria-labelledby="notification-title"
        aria-describedby="notification-desc"
      >
        {/* Icon */}
        <div className="flex justify-center pt-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h2
            id="notification-title"
            className="text-xl font-bold text-white mb-2"
          >
            Ative as Notificações
          </h2>
          <p
            id="notification-desc"
            className="text-gray-400 text-sm mb-6"
          >
            Receba lembretes para manter seu streak e não perder nenhuma conquista!
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-6 text-left">
            <BenefitItem
              icon="🔥"
              text="Lembretes diários para manter seu streak"
            />
            <BenefitItem
              icon="🏆"
              text="Alertas quando conquistar badges"
            />
            <BenefitItem
              icon="📈"
              text="Notificações de level up"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleAllow}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Ativando...' : 'Ativar Notificações'}
            </button>
            <button
              onClick={handleDeny}
              disabled={isLoading}
              className="w-full py-3 px-4 text-gray-400 font-medium hover:text-gray-300 transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Item de benefício
 */
function BenefitItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <span className="text-gray-300 text-sm">{text}</span>
    </div>
  );
}

/**
 * Botão para ativar notificações (para Settings)
 */
export function NotificationSettingsButton() {
  const { canAskAgain, requestPermission } = useNotificationPrompt();
  const [permission, setPermission] = useState<string>('default');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleClick = async () => {
    setIsLoading(true);
    const result = await requestPermission();
    setPermission(result);
    setIsLoading(false);
  };

  if (permission === 'granted') {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">Notificações Ativas</p>
            <p className="text-gray-400 text-sm">Você receberá alertas</p>
          </div>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">Notificações Bloqueadas</p>
            <p className="text-gray-400 text-sm">Ative nas configurações do navegador</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || !canAskAgain}
      className="w-full flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="text-left">
          <p className="text-white font-medium">Ativar Notificações</p>
          <p className="text-gray-400 text-sm">Receba alertas e lembretes</p>
        </div>
      </div>
      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

export default NotificationPermission;
