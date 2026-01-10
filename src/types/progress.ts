/**
 * @fileoverview Tipos relacionados ao progresso do usuário no IA Rimas Brasil
 * @module types/progress
 */

/**
 * Quantidade de estrelas obtidas em um drill (0 a 3)
 */
export type Stars = 0 | 1 | 2 | 3;

/**
 * Progresso do usuário em um drill específico
 */
export interface DrillProgress {
  /** ID do usuário */
  userId: string;

  /** ID do drill */
  drillId: string;

  /** Número total de tentativas */
  attempts: number;

  /** Melhor pontuação obtida (0-100) */
  bestScore: number;

  /** Estrelas conquistadas no drill */
  stars: Stars;

  /** Data da primeira tentativa */
  firstAttemptAt: Date;

  /** Data da última tentativa */
  lastAttemptAt: Date;

  /** Se o drill foi completado com sucesso */
  completed: boolean;
}

/**
 * Progresso geral do usuário no sistema
 */
export interface UserProgress {
  /** ID do usuário */
  userId: string;

  /** XP total acumulado */
  totalXp: number;

  /** Nível atual */
  level: number;

  /** Dias consecutivos de treino (streak atual) */
  streak: number;

  /** IDs dos drills completados */
  completedDrills: string[];

  /** Total de drills completados */
  totalCompleted: number;

  /** Porcentagem de conclusão geral */
  completionPercentage: number;

  /** Última atualização do progresso */
  lastUpdated: Date;
}

/**
 * Resumo diário de atividade
 */
export interface DailyActivity {
  /** Data do dia (formato YYYY-MM-DD) */
  date: string;

  /** XP ganho no dia */
  xpEarned: number;

  /** Drills completados no dia */
  drillsCompleted: number;

  /** Tempo total de treino em minutos */
  minutesTrained: number;
}

/**
 * Critérios para ganhar estrelas em um drill
 */
export const STARS_CRITERIA: Record<Stars, { minScore: number; label: string }> = {
  0: { minScore: 0, label: 'Não completado' },
  1: { minScore: 50, label: 'Bronze' },
  2: { minScore: 75, label: 'Prata' },
  3: { minScore: 90, label: 'Ouro' },
};
