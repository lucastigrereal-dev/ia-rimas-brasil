/**
 * @fileoverview Utilitários para cálculo de XP e níveis
 * @module utils/xp
 *
 * Fórmula de XP: XP necessário para nível N = 100 * N^1.5
 * - Nível 1: 100 XP
 * - Nível 2: 283 XP
 * - Nível 5: 1118 XP
 * - Nível 10: 3162 XP
 */

/**
 * Modificadores que afetam o cálculo de XP
 */
export interface XPModifiers {
  /** Bônus de streak (percentual, ex: 0.3 = 30%) */
  streakBonus?: number;

  /** Bônus de dificuldade (percentual) */
  difficultyBonus?: number;

  /** Bônus de tempo (completou rápido) */
  timeBonus?: number;

  /** Bônus de perfeição (100% correto) */
  perfectBonus?: number;
}

/**
 * Constante base para cálculo de XP por nível
 */
const XP_BASE = 100;

/**
 * Expoente da curva de progressão
 */
const XP_EXPONENT = 1.5;

/**
 * Calcula o XP total com base no XP base e modificadores
 *
 * @param baseXP - XP base do drill/ação
 * @param modifiers - Modificadores opcionais
 * @returns XP total calculado (arredondado)
 *
 * @example
 * calculateXP(50, { streakBonus: 0.3, perfectBonus: 0.2 })
 * // Retorna 75 (50 * 1.5)
 */
export function calculateXP(baseXP: number, modifiers: XPModifiers = {}): number {
  if (baseXP < 0) return 0;

  const {
    streakBonus = 0,
    difficultyBonus = 0,
    timeBonus = 0,
    perfectBonus = 0,
  } = modifiers;

  // Soma todos os bônus (limitado a 100% total de bônus)
  const totalBonus = Math.min(streakBonus + difficultyBonus + timeBonus + perfectBonus, 1);

  return Math.round(baseXP * (1 + totalBonus));
}

/**
 * Retorna o XP total necessário para atingir um determinado nível
 *
 * @param level - Nível desejado (mínimo 1)
 * @returns XP total necessário para o nível
 *
 * @example
 * getXPForLevel(5) // Retorna 1118
 */
export function getXPForLevel(level: number): number {
  if (level < 1) return 0;

  return Math.round(XP_BASE * Math.pow(level, XP_EXPONENT));
}

/**
 * Retorna o nível atual com base no XP total
 *
 * @param xp - XP total do usuário
 * @returns Nível atual (mínimo 1)
 *
 * @example
 * getLevelFromXP(500) // Retorna 3
 */
export function getLevelFromXP(xp: number): number {
  if (xp <= 0) return 1;

  // Fórmula inversa: level = (xp / XP_BASE)^(1/XP_EXPONENT)
  const level = Math.floor(Math.pow(xp / XP_BASE, 1 / XP_EXPONENT));

  return Math.max(1, level);
}

/**
 * Retorna o progresso percentual para o próximo nível
 *
 * @param xp - XP total do usuário
 * @returns Objeto com informações de progresso
 *
 * @example
 * getXPProgress(150)
 * // { currentLevel: 1, nextLevel: 2, currentXP: 150, xpForNext: 283, progress: 53 }
 */
export function getXPProgress(xp: number): {
  currentLevel: number;
  nextLevel: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpInCurrentLevel: number;
  xpNeededForNext: number;
  progress: number;
} {
  const currentLevel = getLevelFromXP(xp);
  const nextLevel = currentLevel + 1;

  const xpForCurrentLevel = getXPForLevel(currentLevel);
  const xpForNextLevel = getXPForLevel(nextLevel);

  const xpInCurrentLevel = xp - xpForCurrentLevel;
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;

  const progress = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));

  return {
    currentLevel,
    nextLevel,
    currentXP: xp,
    xpForCurrentLevel,
    xpForNextLevel,
    xpInCurrentLevel: Math.max(0, xpInCurrentLevel),
    xpNeededForNext,
    progress: Math.max(0, progress),
  };
}

/**
 * Retorna o XP restante para atingir o próximo nível
 *
 * @param xp - XP atual
 * @returns XP faltando para o próximo nível
 */
export function getXPToNextLevel(xp: number): number {
  const currentLevel = getLevelFromXP(xp);
  const nextLevelXP = getXPForLevel(currentLevel + 1);

  return Math.max(0, nextLevelXP - xp);
}
