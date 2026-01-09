import { describe, it, expect } from 'vitest';
import {
  calculateXP,
  getXPForLevel,
  getLevelFromXP,
  getXPProgress,
  getXPToNextLevel,
} from '../../utils/xp';

describe('calculateXP', () => {
  it('should return base XP when no modifiers', () => {
    expect(calculateXP(100)).toBe(100);
    expect(calculateXP(50)).toBe(50);
  });

  it('should apply streak bonus correctly', () => {
    expect(calculateXP(100, { streakBonus: 0.3 })).toBe(130);
    expect(calculateXP(100, { streakBonus: 0.5 })).toBe(150);
  });

  it('should apply multiple modifiers', () => {
    expect(calculateXP(100, {
      streakBonus: 0.1,
      difficultyBonus: 0.2,
      perfectBonus: 0.3,
    })).toBe(160); // 100 * 1.6 = 160
  });

  it('should cap total bonus at 100%', () => {
    expect(calculateXP(100, {
      streakBonus: 0.5,
      difficultyBonus: 0.5,
      timeBonus: 0.5,
      perfectBonus: 0.5, // Total: 200%, but capped at 100%
    })).toBe(200); // 100 * 2 = 200
  });

  it('should return 0 for negative base XP', () => {
    expect(calculateXP(-50)).toBe(0);
  });

  it('should handle 0 XP', () => {
    expect(calculateXP(0)).toBe(0);
    expect(calculateXP(0, { streakBonus: 0.5 })).toBe(0);
  });

  it('should round result', () => {
    expect(calculateXP(33, { streakBonus: 0.1 })).toBe(36); // 33 * 1.1 = 36.3 -> 36
  });
});

describe('getXPForLevel', () => {
  it('should return correct XP for level 1', () => {
    expect(getXPForLevel(1)).toBe(100);
  });

  it('should return correct XP for level 2', () => {
    const expected = Math.round(100 * Math.pow(2, 1.5));
    expect(getXPForLevel(2)).toBe(expected); // ~283
  });

  it('should return correct XP for level 10', () => {
    const expected = Math.round(100 * Math.pow(10, 1.5));
    expect(getXPForLevel(10)).toBe(expected); // ~3162
  });

  it('should return 0 for level 0 or negative', () => {
    expect(getXPForLevel(0)).toBe(0);
    expect(getXPForLevel(-1)).toBe(0);
  });

  it('should increase XP requirement with level', () => {
    const level1 = getXPForLevel(1);
    const level2 = getXPForLevel(2);
    const level3 = getXPForLevel(3);

    expect(level2).toBeGreaterThan(level1);
    expect(level3).toBeGreaterThan(level2);
  });
});

describe('getLevelFromXP', () => {
  it('should return level 1 for 0 XP', () => {
    expect(getLevelFromXP(0)).toBe(1);
  });

  it('should return level 1 for negative XP', () => {
    expect(getLevelFromXP(-100)).toBe(1);
  });

  it('should return level 1 for 100 XP', () => {
    expect(getLevelFromXP(100)).toBe(1);
  });

  it('should return level 2 for XP >= 283', () => {
    expect(getLevelFromXP(283)).toBe(2);
    expect(getLevelFromXP(300)).toBe(2);
  });

  it('should handle large XP values', () => {
    expect(getLevelFromXP(10000)).toBeGreaterThan(5);
    expect(getLevelFromXP(100000)).toBeGreaterThan(10);
  });

  it('should be consistent with getXPForLevel', () => {
    // XP para nível 5 + 1 deve retornar nível 5
    // (o nível atual é baseado no XP acumulado, não no threshold)
    const xpForLevel5 = getXPForLevel(5);
    const level = getLevelFromXP(xpForLevel5 + 1);
    expect(level).toBeGreaterThanOrEqual(4);
    expect(level).toBeLessThanOrEqual(5);
  });
});

describe('getXPProgress', () => {
  it('should return correct progress for 0 XP', () => {
    const progress = getXPProgress(0);

    expect(progress.currentLevel).toBe(1);
    expect(progress.nextLevel).toBe(2);
    expect(progress.currentXP).toBe(0);
  });

  it('should return progress percentage', () => {
    const progress = getXPProgress(150);

    expect(progress.currentLevel).toBe(1);
    expect(progress.progress).toBeGreaterThan(0);
    expect(progress.progress).toBeLessThan(100);
  });

  it('should return xpInCurrentLevel', () => {
    const progress = getXPProgress(150);

    expect(progress.xpInCurrentLevel).toBeGreaterThanOrEqual(0);
    expect(progress.xpNeededForNext).toBeGreaterThan(0);
  });

  it('should cap progress at 100%', () => {
    const progress = getXPProgress(1000000);

    expect(progress.progress).toBeLessThanOrEqual(100);
  });

  it('should have positive xpNeededForNext', () => {
    const progress = getXPProgress(500);

    expect(progress.xpNeededForNext).toBeGreaterThan(0);
  });
});

describe('getXPToNextLevel', () => {
  it('should return positive value for any XP', () => {
    expect(getXPToNextLevel(0)).toBeGreaterThan(0);
    expect(getXPToNextLevel(100)).toBeGreaterThan(0);
    expect(getXPToNextLevel(500)).toBeGreaterThan(0);
  });

  it('should decrease as XP increases within level', () => {
    const remaining1 = getXPToNextLevel(100);
    const remaining2 = getXPToNextLevel(150);

    expect(remaining2).toBeLessThan(remaining1);
  });

  it('should never return negative', () => {
    expect(getXPToNextLevel(-100)).toBeGreaterThanOrEqual(0);
  });
});
