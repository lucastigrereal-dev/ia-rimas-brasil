/**
 * @fileoverview Hook de Analytics
 * @module hooks/useAnalytics
 */

import { useEffect, useCallback, useRef } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import analytics, {
  trackScreenView,
  trackSignUp,
  trackLogin,
  trackLogout,
  trackDrillStart,
  trackDrillComplete,
  trackDrillAbandon,
  trackLevelUp,
  trackBadgeEarned,
  trackStreakMilestone,
  trackStreakLost,
  trackShare,
  trackFeatureUsed,
  trackError,
  setAnalyticsUserId,
  setAnalyticsUserProperties,
} from '../services/analytics';

/**
 * Hook para tracking de analytics
 */
export function useAnalytics() {
  const { user } = useAuthContext();

  // Set user ID when user changes
  useEffect(() => {
    if (user?.uid) {
      setAnalyticsUserId(user.uid);
    }
  }, [user?.uid]);

  return {
    // Screen tracking
    trackScreenView,

    // Auth events
    trackSignUp,
    trackLogin,
    trackLogout,

    // Drill events
    trackDrillStart,
    trackDrillComplete,
    trackDrillAbandon,

    // Gamification events
    trackLevelUp,
    trackBadgeEarned,
    trackStreakMilestone,
    trackStreakLost,

    // Engagement events
    trackShare,
    trackFeatureUsed,
    trackError,

    // User properties
    setUserProperties: setAnalyticsUserProperties,
  };
}

/**
 * Hook para auto-tracking de screen views
 * @param screenName - Nome da tela
 * @param screenClass - Classe da tela (opcional)
 */
export function useScreenTracking(screenName: string, screenClass?: string): void {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      trackScreenView(screenName, screenClass);
      hasTracked.current = true;
    }
  }, [screenName, screenClass]);
}

/**
 * Hook para tracking de erros
 */
export function useErrorTracking() {
  const trackErrorEvent = useCallback((errorType: string, errorMessage: string) => {
    trackError(errorType, errorMessage);
  }, []);

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackErrorEvent('uncaught_error', event.message);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackErrorEvent('unhandled_rejection', String(event.reason));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackErrorEvent]);

  return { trackError: trackErrorEvent };
}

export default useAnalytics;
