/**
 * @fileoverview Hook para gerenciar estado do PWA
 * @module hooks/usePWA
 */

import { useState, useEffect, useCallback } from 'react';
import {
  registerServiceWorker,
  updateServiceWorker,
  isPWAInstalled,
  isOffline,
  onConnectivityChange,
} from '../serviceWorkerRegistration';

interface PWAState {
  /** App está offline */
  isOffline: boolean;
  /** Nova versão disponível */
  needsRefresh: boolean;
  /** App pronto para uso offline */
  offlineReady: boolean;
  /** App instalado como PWA */
  isInstalled: boolean;
  /** Service Worker registrado */
  isRegistered: boolean;
}

interface UsePWAReturn extends PWAState {
  /** Atualiza para nova versão */
  updateApp: () => Promise<void>;
  /** Dismiss do prompt de update */
  dismissUpdate: () => void;
}

/**
 * Hook para gerenciar PWA
 */
export function usePWA(): UsePWAReturn {
  const [state, setState] = useState<PWAState>({
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    needsRefresh: false,
    offlineReady: false,
    isInstalled: false,
    isRegistered: false,
  });

  useEffect(() => {
    // Check if installed as PWA
    setState((prev) => ({
      ...prev,
      isInstalled: isPWAInstalled(),
      isOffline: isOffline(),
    }));

    // Register service worker
    registerServiceWorker({
      onNeedRefresh() {
        setState((prev) => ({ ...prev, needsRefresh: true }));
      },
      onOfflineReady() {
        setState((prev) => ({ ...prev, offlineReady: true }));
      },
      onRegistered() {
        setState((prev) => ({ ...prev, isRegistered: true }));
      },
      onRegisterError(error) {
        console.error('PWA registration failed:', error);
      },
    });

    // Listen for connectivity changes
    const unsubscribe = onConnectivityChange((online) => {
      setState((prev) => ({ ...prev, isOffline: !online }));
    });

    return unsubscribe;
  }, []);

  const updateApp = useCallback(async () => {
    await updateServiceWorker(true);
  }, []);

  const dismissUpdate = useCallback(() => {
    setState((prev) => ({ ...prev, needsRefresh: false }));
  }, []);

  return {
    ...state,
    updateApp,
    dismissUpdate,
  };
}

export default usePWA;
