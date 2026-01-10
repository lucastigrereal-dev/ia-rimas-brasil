/**
 * @fileoverview Utilitários para gerenciamento de streak (dias consecutivos)
 * @module utils/streak
 *
 * Regras de streak:
 * - Streak continua se o usuário treinou hoje ou ontem
 * - Streak reseta para 0 se pulou mais de 1 dia
 * - Bônus máximo de 70% (streak >= 30 dias)
 */

/**
 * Status visual do streak
 */
export type StreakStatus = 'fire' | 'warm' | 'cold';

/**
 * Resultado da verificação de streak
 */
export interface StreakCheckResult {
  /** Se o streak continua ou não */
  continues: boolean;

  /** Novo valor do streak */
  newStreak: number;

  /** Dias desde última atividade */
  daysSinceLastActivity: number;
}

/**
 * Normaliza uma data para meia-noite UTC
 */
function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Calcula a diferença em dias entre duas datas
 */
function getDaysDifference(date1: Date, date2: Date): number {
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Verifica se o streak continua baseado na última data de atividade
 *
 * @param lastDate - Data da última atividade do usuário
 * @param today - Data atual (default: agora)
 * @param currentStreak - Streak atual do usuário
 * @returns Resultado com status do streak
 *
 * @example
 * // Usuário treinou ontem
 * checkStreak(yesterday, today, 5)
 * // { continues: true, newStreak: 6, daysSinceLastActivity: 1 }
 *
 * @example
 * // Usuário pulou 2 dias
 * checkStreak(twoDaysAgo, today, 5)
 * // { continues: false, newStreak: 1, daysSinceLastActivity: 2 }
 */
export function checkStreak(
  lastDate: Date,
  today: Date = new Date(),
  currentStreak: number = 0
): StreakCheckResult {
  const daysDiff = getDaysDifference(lastDate, today);

  // Mesmo dia - mantém streak atual
  if (daysDiff === 0) {
    return {
      continues: true,
      newStreak: Math.max(1, currentStreak),
      daysSinceLastActivity: 0,
    };
  }

  // Ontem - streak continua, incrementa
  if (daysDiff === 1) {
    return {
      continues: true,
      newStreak: currentStreak + 1,
      daysSinceLastActivity: 1,
    };
  }

  // Mais de 1 dia - streak reseta
  return {
    continues: false,
    newStreak: 1,
    daysSinceLastActivity: daysDiff,
  };
}

/**
 * Calcula o bônus percentual de XP baseado no streak
 *
 * Escala de bônus:
 * - 1-2 dias: 0%
 * - 3-6 dias: 10%
 * - 7-13 dias: 20%
 * - 14-20 dias: 35%
 * - 21-29 dias: 50%
 * - 30+ dias: 70% (máximo)
 *
 * @param streak - Número de dias consecutivos
 * @returns Bônus percentual (0 a 0.7)
 *
 * @example
 * calculateStreakBonus(7) // Retorna 0.2 (20%)
 * calculateStreakBonus(30) // Retorna 0.7 (70%)
 */
export function calculateStreakBonus(streak: number): number {
  if (streak < 0) return 0;
  if (streak <= 2) return 0;
  if (streak <= 6) return 0.1;
  if (streak <= 13) return 0.2;
  if (streak <= 20) return 0.35;
  if (streak <= 29) return 0.5;
  return 0.7; // Máximo 70%
}

/**
 * Retorna o status visual do streak
 *
 * @param streak - Número de dias consecutivos
 * @returns Status visual: 'fire' (7+), 'warm' (3-6), 'cold' (0-2)
 *
 * @example
 * getStreakStatus(10) // Retorna 'fire'
 * getStreakStatus(4)  // Retorna 'warm'
 * getStreakStatus(1)  // Retorna 'cold'
 */
export function getStreakStatus(streak: number): StreakStatus {
  if (streak >= 7) return 'fire';
  if (streak >= 3) return 'warm';
  return 'cold';
}

/**
 * Retorna informações detalhadas do streak
 */
export function getStreakInfo(streak: number): {
  streak: number;
  status: StreakStatus;
  bonus: number;
  bonusPercentage: string;
  nextMilestone: number;
  daysToNextMilestone: number;
} {
  const status = getStreakStatus(streak);
  const bonus = calculateStreakBonus(streak);

  // Marcos de streak
  const milestones = [3, 7, 14, 21, 30];
  const nextMilestone = milestones.find((m) => m > streak) ?? 30;
  const daysToNextMilestone = Math.max(0, nextMilestone - streak);

  return {
    streak,
    status,
    bonus,
    bonusPercentage: `${Math.round(bonus * 100)}%`,
    nextMilestone,
    daysToNextMilestone,
  };
}

/**
 * Verifica se hoje é um novo dia comparado à última atividade
 */
export function isNewDay(lastDate: Date, now: Date = new Date()): boolean {
  return getDaysDifference(lastDate, now) >= 1;
}
