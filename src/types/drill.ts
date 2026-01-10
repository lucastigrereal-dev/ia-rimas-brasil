/**
 * @fileoverview Tipos relacionados aos drills (exercícios) do IA Rimas Brasil
 * @module types/drill
 */

/**
 * Categorias de drill disponíveis no sistema
 */
export type DrillCategory = 'rimas' | 'flow' | 'punchline' | 'batalha';

/**
 * Nível de dificuldade do drill (1 a 5)
 */
export type DrillDifficulty = 1 | 2 | 3 | 4 | 5;

/**
 * Conteúdo detalhado de um drill
 */
export interface DrillContent {
  /** Instruções para completar o drill */
  instructions: string;

  /** Exemplos de respostas corretas */
  examples: string[];

  /** Palavras disponíveis para o exercício */
  words: string[];
}

/**
 * Interface principal de um drill/exercício
 */
export interface Drill {
  /** Identificador único do drill */
  id: string;

  /** Título do drill exibido ao usuário */
  title: string;

  /** Descrição breve do exercício */
  description: string;

  /** Categoria do drill */
  category: DrillCategory;

  /** Nível de dificuldade (1-5) */
  difficulty: DrillDifficulty;

  /** Quantidade de XP ganho ao completar */
  xpReward: number;

  /** Conteúdo do drill */
  content: DrillContent;

  /** Tempo limite em segundos (opcional) */
  timeLimit?: number;

  /** IDs de drills que precisam ser completados antes */
  prerequisites?: string[];

  /** Se o drill está ativo/disponível */
  isActive: boolean;
}

/**
 * Resultado de uma tentativa de drill
 */
export interface DrillAttempt {
  /** ID do drill tentado */
  drillId: string;

  /** ID do usuário que tentou */
  userId: string;

  /** Pontuação obtida (0-100) */
  score: number;

  /** Tempo gasto em segundos */
  timeSpent: number;

  /** Respostas do usuário */
  answers: string[];

  /** Data/hora da tentativa */
  attemptedAt: Date;
}

/**
 * Mapeamento de categoria para emoji
 */
export const DRILL_CATEGORY_EMOJI: Record<DrillCategory, string> = {
  rimas: '🎵',
  flow: '🎶',
  punchline: '💬',
  batalha: '⚔️',
};
