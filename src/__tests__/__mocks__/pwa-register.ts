/**
 * @fileoverview Mock for virtual:pwa-register
 */

import { vi } from 'vitest';

export const registerSW = vi.fn((options?: {
  immediate?: boolean;
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
  onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
  onRegisterError?: (error: Error) => void;
}) => {
  // Store callbacks for testing
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__swCallbacks = options;
  }
  return vi.fn(); // updateSW function
});
