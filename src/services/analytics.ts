/**
 * @fileoverview Serviço de Analytics
 * @module services/analytics
 */

import { logEvent, setUserId, setUserProperties, type Analytics } from 'firebase/analytics';
import { initializeAnalytics } from './firebase';
import { isProduction, isDevelopment } from '../config/env';

let analytics: Analytics | null = null;

/**
 * Inicializa o Analytics
 */
export async function initAnalytics(): Promise<void> {
  try {
    analytics = await initializeAnalytics();
    if (analytics && isDevelopment) {
      console.log('[Analytics] Initialized');
    }
  } catch (error) {
    console.warn('[Analytics] Failed to initialize:', error);
  }
}

/**
 * Verifica se analytics está disponível
 */
function isAnalyticsAvailable(): boolean {
  return analytics !== null && isProduction;
}

/**
 * Log de evento (apenas em prod)
 */
function log(eventName: string, params?: Record<string, unknown>): void {
  if (!isAnalyticsAvailable()) {
    if (isDevelopment) {
      console.log(`[Analytics DEV] ${eventName}`, params || '');
    }
    return;
  }

  try {
    logEvent(analytics!, eventName, params);
  } catch (error) {
    console.warn('[Analytics] Error logging event:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN VIEWS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Track screen view
 */
export function trackScreenView(screenName: string, screenClass?: string): void {
  log('screen_view', {
    screen_name: screenName,
    screen_class: screenClass || screenName,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Track sign up
 */
export function trackSignUp(method: 'email' | 'google'): void {
  log('sign_up', { method });
}

/**
 * Track login
 */
export function trackLogin(method: 'email' | 'google'): void {
  log('login', { method });
}

/**
 * Track logout
 */
export function trackLogout(): void {
  log('logout');
}

// ═══════════════════════════════════════════════════════════════════════════════
// DRILL EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Track drill start
 */
export function trackDrillStart(drillId: string, category: string): void {
  log('drill_start', {
    drill_id: drillId,
    drill_category: category,
  });
}

/**
 * Track drill complete
 */
export function trackDrillComplete(
  drillId: string,
  score: number,
  stars: number,
  timeSpent: number,
  xpEarned: number
): void {
  log('drill_complete', {
    drill_id: drillId,
    score,
    stars,
    time_spent_seconds: Math.round(timeSpent / 1000),
    xp_earned: xpEarned,
  });
}

/**
 * Track drill abandon
 */
export function trackDrillAbandon(drillId: string, progress: number): void {
  log('drill_abandon', {
    drill_id: drillId,
    progress_percent: progress,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAMIFICATION EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Track level up
 */
export function trackLevelUp(newLevel: number, totalXP: number): void {
  log('level_up', {
    new_level: newLevel,
    total_xp: totalXP,
  });
}

/**
 * Track badge earned
 */
export function trackBadgeEarned(badgeId: string, badgeName: string): void {
  log('badge_earned', {
    badge_id: badgeId,
    badge_name: badgeName,
  });
}

/**
 * Track streak milestone
 */
export function trackStreakMilestone(days: number): void {
  log('streak_milestone', {
    streak_days: days,
  });
}

/**
 * Track streak lost
 */
export function trackStreakLost(previousStreak: number): void {
  log('streak_lost', {
    previous_streak: previousStreak,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARE EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Track share
 */
export function trackShare(contentType: 'result' | 'profile' | 'app', platform?: string): void {
  log('share', {
    content_type: contentType,
    platform: platform || 'native',
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGAGEMENT EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Track feature used
 */
export function trackFeatureUsed(featureName: string): void {
  log('feature_used', {
    feature_name: featureName,
  });
}

/**
 * Track error
 */
export function trackError(errorType: string, errorMessage: string): void {
  log('app_error', {
    error_type: errorType,
    error_message: errorMessage.substring(0, 100), // Limit length
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER PROPERTIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Set user ID
 */
export function setAnalyticsUserId(userId: string): void {
  if (!isAnalyticsAvailable()) return;

  try {
    setUserId(analytics!, userId);
  } catch (error) {
    console.warn('[Analytics] Error setting user ID:', error);
  }
}

/**
 * Set user properties
 */
export function setAnalyticsUserProperties(properties: {
  user_level?: number;
  user_streak?: number;
  drills_completed?: number;
  account_age_days?: number;
  skill_level?: string;
}): void {
  if (!isAnalyticsAvailable()) {
    if (isDevelopment) {
      console.log('[Analytics DEV] Set user properties:', properties);
    }
    return;
  }

  try {
    setUserProperties(analytics!, properties);
  } catch (error) {
    console.warn('[Analytics] Error setting user properties:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  init: initAnalytics,
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
  setUserId: setAnalyticsUserId,
  setUserProperties: setAnalyticsUserProperties,
};
