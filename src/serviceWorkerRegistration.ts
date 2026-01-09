/**
 * @fileoverview Service Worker Registration
 * @module serviceWorkerRegistration
 */

import { registerSW } from 'virtual:pwa-register';

export interface ServiceWorkerCallbacks {
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
  onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
  onRegisterError?: (error: Error) => void;
}

let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined;

/**
 * Registra o Service Worker
 */
export function registerServiceWorker(callbacks?: ServiceWorkerCallbacks): void {
  if ('serviceWorker' in navigator) {
    updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[SW] Nova versão disponível');
        callbacks?.onNeedRefresh?.();
      },
      onOfflineReady() {
        console.log('[SW] App pronto para uso offline');
        callbacks?.onOfflineReady?.();
      },
      onRegistered(registration) {
        console.log('[SW] Service Worker registrado:', registration);
        callbacks?.onRegistered?.(registration);

        // Check for updates every hour
        if (registration) {
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        }
      },
      onRegisterError(error) {
        console.error('[SW] Erro ao registrar:', error);
        callbacks?.onRegisterError?.(error);
      },
    });
  }
}

/**
 * Atualiza o Service Worker (recarrega a página)
 */
export async function updateServiceWorker(reloadPage = true): Promise<void> {
  if (updateSW) {
    await updateSW(reloadPage);
  }
}

/**
 * Verifica se o app está rodando como PWA instalado
 */
export function isPWAInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * Verifica se o navegador suporta Service Workers
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

/**
 * Verifica se o app está offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Adiciona listener para mudanças de conectividade
 */
export function onConnectivityChange(
  callback: (online: boolean) => void
): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export default registerServiceWorker;
