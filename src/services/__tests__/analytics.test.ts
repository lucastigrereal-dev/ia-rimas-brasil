/**
 * @fileoverview Tests for Analytics service
 * @module services/__tests__/analytics.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Firebase Analytics
vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(),
  logEvent: vi.fn(),
  setUserId: vi.fn(),
  setUserProperties: vi.fn(),
}));

// Mock Firebase service
vi.mock('../firebase', () => ({
  getFirebaseApp: vi.fn(),
  initializeAnalytics: vi.fn().mockResolvedValue({}),
}));

// Mock env config
vi.mock('../../config/env', () => ({
  isProduction: false,
  isDevelopment: true,
}));

describe('Analytics Service', () => {
  let analytics: typeof import('../analytics');
  let firebaseAnalytics: typeof import('firebase/analytics');

  beforeEach(async () => {
    vi.clearAllMocks();

    // Fresh import
    analytics = await import('../analytics');
    firebaseAnalytics = await import('firebase/analytics');
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('initAnalytics', () => {
    it('initializes analytics from firebase', async () => {
      const { initializeAnalytics } = await import('../firebase');
      await analytics.initAnalytics();

      expect(initializeAnalytics).toHaveBeenCalled();
    });

    it('handles initialization errors gracefully', async () => {
      const { initializeAnalytics } = await import('../firebase');
      (initializeAnalytics as any).mockRejectedValueOnce(new Error('Init failed'));

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await analytics.initAnalytics();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('trackScreenView', () => {
    it('logs screen view with name and class', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      analytics.trackScreenView('Home', 'HomePage');

      // In dev mode, should log to console
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics DEV]'),
        expect.objectContaining({
          screen_name: 'Home',
          screen_class: 'HomePage',
        })
      );

      consoleSpy.mockRestore();
    });

    it('uses screen name as class if not provided', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      analytics.trackScreenView('Profile');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics DEV]'),
        expect.objectContaining({
          screen_name: 'Profile',
          screen_class: 'Profile',
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Auth Events', () => {
    it('tracks sign up with method', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      analytics.trackSignUp('email');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics DEV] sign_up'),
        expect.objectContaining({ method: 'email' })
      );

      consoleSpy.mockRestore();
    });

    it('tracks login with method', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      analytics.trackLogin('google');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics DEV] login'),
        expect.objectContaining({ method: 'google' })
      );

      consoleSpy.mockRestore();
    });

    it('tracks logout', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      analytics.trackLogout();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics DEV] logout'),
        expect.any(String)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Drill Events', () => {
    it('tracks drill start', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      analytics.trackDrillStart('drill-123', 'rhymes');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics DEV] drill_start'),
        expect.objectContaining({
          drill_id: 'drill-123',
          drill_category: 'rhymes',
        })
      );

      consoleSpy.mockRestore();
    });

    it('tracks drill complete with all params', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      analytics.trackDrillComplete('drill-123', 85, 3, 120000, 150);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics DEV] drill_complete'),
        expect.objectContaining({
          drill_id: 'drill-123',
          score: 85,
          stars: 3,
          time_spent_seconds: 120,
          xp_earned: 150,
        })
      );

      consoleSpy.mockRestore();
    });

    it('tracks drill abandon', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      analytics.trackDrillAbandon('drill-123', 50);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics DEV] drill_abandon'),
        expect.objectContaining({
          drill_id: 'drill-123',
          progress_percent: 50,
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Gamification Events', () => {
    it('tracks level up', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      analytics.trackLevelUp(5, 2500);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics DEV] level_up'),
        expect.objectContaining({
          new_level: 5,
          total_xp: 2500,
        })
      );

      consoleSpy.mockRestore();
    });

    it('tracks badge earned', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      analytics.trackBadgeEarned('first-drill', 'Primeiro Drill');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics DEV] badge_earned'),
        expect.objectContaining({
          badge_id: 'first-drill',
          badge_name: 'Primeiro Drill',
        })
      );

      consoleSpy.mockRestore();
    });

    it('tracks streak milestone', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      analytics.trackStreakMilestone(7);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics DEV] streak_milestone'),
        expect.objectContaining({ streak_days: 7 })
      );

      consoleSpy.mockRestore();
    });

    it('tracks streak lost', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      analytics.trackStreakLost(14);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics DEV] streak_lost'),
        expect.objectContaining({ previous_streak: 14 })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Share Events', () => {
    it('tracks share with content type', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      analytics.trackShare('result', 'whatsapp');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics DEV] share'),
        expect.objectContaining({
          content_type: 'result',
          platform: 'whatsapp',
        })
      );

      consoleSpy.mockRestore();
    });

    it('uses native as default platform', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      analytics.trackShare('app');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics DEV] share'),
        expect.objectContaining({
          content_type: 'app',
          platform: 'native',
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Engagement Events', () => {
    it('tracks feature used', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      analytics.trackFeatureUsed('dark-mode');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics DEV] feature_used'),
        expect.objectContaining({ feature_name: 'dark-mode' })
      );

      consoleSpy.mockRestore();
    });

    it('tracks error with truncated message', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const longMessage = 'a'.repeat(200);

      analytics.trackError('api_error', longMessage);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics DEV] app_error'),
        expect.objectContaining({
          error_type: 'api_error',
          error_message: 'a'.repeat(100), // truncated to 100 chars
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('User Properties', () => {
    it('sets user properties in dev mode', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      analytics.setAnalyticsUserProperties({
        user_level: 5,
        user_streak: 10,
        drills_completed: 25,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics DEV] Set user properties'),
        expect.objectContaining({
          user_level: 5,
          user_streak: 10,
          drills_completed: 25,
        })
      );

      consoleSpy.mockRestore();
    });
  });
});
