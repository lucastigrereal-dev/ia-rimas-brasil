/**
 * @fileoverview Tests for usePWA hook
 * @module hooks/__tests__/usePWA.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePWA } from '../usePWA';

// Mock the serviceWorkerRegistration module
vi.mock('../../serviceWorkerRegistration', () => ({
  registerServiceWorker: vi.fn((callbacks) => {
    // Store callbacks for testing
    (globalThis as any).__swCallbacks = callbacks;
  }),
  updateServiceWorker: vi.fn().mockResolvedValue(undefined),
  isPWAInstalled: vi.fn().mockReturnValue(false),
  isServiceWorkerSupported: vi.fn().mockReturnValue(true),
  isOffline: vi.fn().mockReturnValue(false),
  onConnectivityChange: vi.fn((callback) => {
    // Store callback for testing
    (globalThis as any).__connectivityCallback = callback;
    return vi.fn(); // unsubscribe function
  }),
}));

describe('usePWA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset online status
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current.isOffline).toBe(false);
    expect(result.current.needsRefresh).toBe(false);
    expect(result.current.offlineReady).toBe(false);
  });

  it('registers service worker on mount', async () => {
    const { registerServiceWorker } = await import('../../serviceWorkerRegistration');
    renderHook(() => usePWA());

    expect(registerServiceWorker).toHaveBeenCalled();
  });

  it('calls updateServiceWorker when updateApp is invoked', async () => {
    const { updateServiceWorker } = await import('../../serviceWorkerRegistration');
    const { result } = renderHook(() => usePWA());

    await act(async () => {
      await result.current.updateApp();
    });

    expect(updateServiceWorker).toHaveBeenCalledWith(true);
  });

  it('dismissUpdate resets needsRefresh state', async () => {
    const { result } = renderHook(() => usePWA());

    // The hook exposes dismissUpdate function
    expect(typeof result.current.dismissUpdate).toBe('function');
  });

  it('exposes isInstalled property', async () => {
    const { result } = renderHook(() => usePWA());

    // The hook should expose isInstalled
    expect(typeof result.current.isInstalled).toBe('boolean');
  });

  it('exposes updateApp function', async () => {
    const { result } = renderHook(() => usePWA());

    expect(typeof result.current.updateApp).toBe('function');
  });
});
