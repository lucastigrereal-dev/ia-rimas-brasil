import { describe, it, expect } from 'vitest';
import {
  checkStreak,
  calculateStreakBonus,
  getStreakStatus,
  getStreakInfo,
  isNewDay,
} from '../../utils/streak';

describe('checkStreak', () => {
  it('should continue streak when training same day', () => {
    const today = new Date('2024-01-15');
    const result = checkStreak(today, today, 5);

    expect(result.continues).toBe(true);
    expect(result.newStreak).toBe(5);
    expect(result.daysSinceLastActivity).toBe(0);
  });

  it('should continue and increment streak when training day after', () => {
    const yesterday = new Date('2024-01-14');
    const today = new Date('2024-01-15');
    const result = checkStreak(yesterday, today, 5);

    expect(result.continues).toBe(true);
    expect(result.newStreak).toBe(6);
    expect(result.daysSinceLastActivity).toBe(1);
  });

  it('should reset streak when skipping more than 1 day', () => {
    const twoDaysAgo = new Date('2024-01-13');
    const today = new Date('2024-01-15');
    const result = checkStreak(twoDaysAgo, today, 5);

    expect(result.continues).toBe(false);
    expect(result.newStreak).toBe(1);
    expect(result.daysSinceLastActivity).toBe(2);
  });

  it('should handle streak of 0', () => {
    const yesterday = new Date('2024-01-14');
    const today = new Date('2024-01-15');
    const result = checkStreak(yesterday, today, 0);

    expect(result.continues).toBe(true);
    expect(result.newStreak).toBe(1);
  });

  it('should return at least 1 for newStreak on same day', () => {
    const today = new Date('2024-01-15');
    const result = checkStreak(today, today, 0);

    expect(result.newStreak).toBe(1);
  });

  it('should handle week gap', () => {
    const weekAgo = new Date('2024-01-08');
    const today = new Date('2024-01-15');
    const result = checkStreak(weekAgo, today, 10);

    expect(result.continues).toBe(false);
    expect(result.newStreak).toBe(1);
    expect(result.daysSinceLastActivity).toBe(7);
  });
});

describe('calculateStreakBonus', () => {
  it('should return 0 for streak <= 2', () => {
    expect(calculateStreakBonus(0)).toBe(0);
    expect(calculateStreakBonus(1)).toBe(0);
    expect(calculateStreakBonus(2)).toBe(0);
  });

  it('should return 10% for streak 3-6', () => {
    expect(calculateStreakBonus(3)).toBe(0.1);
    expect(calculateStreakBonus(6)).toBe(0.1);
  });

  it('should return 20% for streak 7-13', () => {
    expect(calculateStreakBonus(7)).toBe(0.2);
    expect(calculateStreakBonus(13)).toBe(0.2);
  });

  it('should return 35% for streak 14-20', () => {
    expect(calculateStreakBonus(14)).toBe(0.35);
    expect(calculateStreakBonus(20)).toBe(0.35);
  });

  it('should return 50% for streak 21-29', () => {
    expect(calculateStreakBonus(21)).toBe(0.5);
    expect(calculateStreakBonus(29)).toBe(0.5);
  });

  it('should cap at 70% for streak >= 30', () => {
    expect(calculateStreakBonus(30)).toBe(0.7);
    expect(calculateStreakBonus(100)).toBe(0.7);
    expect(calculateStreakBonus(365)).toBe(0.7);
  });

  it('should return 0 for negative streak', () => {
    expect(calculateStreakBonus(-5)).toBe(0);
  });
});

describe('getStreakStatus', () => {
  it('should return cold for streak < 3', () => {
    expect(getStreakStatus(0)).toBe('cold');
    expect(getStreakStatus(1)).toBe('cold');
    expect(getStreakStatus(2)).toBe('cold');
  });

  it('should return warm for streak 3-6', () => {
    expect(getStreakStatus(3)).toBe('warm');
    expect(getStreakStatus(5)).toBe('warm');
    expect(getStreakStatus(6)).toBe('warm');
  });

  it('should return fire for streak >= 7', () => {
    expect(getStreakStatus(7)).toBe('fire');
    expect(getStreakStatus(10)).toBe('fire');
    expect(getStreakStatus(100)).toBe('fire');
  });
});

describe('getStreakInfo', () => {
  it('should return complete streak info', () => {
    const info = getStreakInfo(5);

    expect(info.streak).toBe(5);
    expect(info.status).toBe('warm');
    expect(info.bonus).toBe(0.1);
    expect(info.bonusPercentage).toBe('10%');
  });

  it('should calculate next milestone', () => {
    const info = getStreakInfo(5);

    expect(info.nextMilestone).toBe(7);
    expect(info.daysToNextMilestone).toBe(2);
  });

  it('should show 30 as milestone when streak >= 30', () => {
    const info = getStreakInfo(35);

    expect(info.nextMilestone).toBe(30);
    expect(info.daysToNextMilestone).toBe(0);
  });

  it('should format bonus as percentage string', () => {
    expect(getStreakInfo(0).bonusPercentage).toBe('0%');
    expect(getStreakInfo(10).bonusPercentage).toBe('20%');
    expect(getStreakInfo(30).bonusPercentage).toBe('70%');
  });
});

describe('isNewDay', () => {
  it('should return false for same day', () => {
    const date = new Date('2024-01-15T10:00:00');
    const now = new Date('2024-01-15T20:00:00');

    expect(isNewDay(date, now)).toBe(false);
  });

  it('should return true for different days', () => {
    const date = new Date('2024-01-14T12:00:00');
    const now = new Date('2024-01-15T12:00:00');

    expect(isNewDay(date, now)).toBe(true);
  });

  it('should return true for week difference', () => {
    const date = new Date('2024-01-08');
    const now = new Date('2024-01-15');

    expect(isNewDay(date, now)).toBe(true);
  });
});
