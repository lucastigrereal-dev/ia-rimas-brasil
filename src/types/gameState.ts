/**
 * @fileoverview Tipos para o estado do jogo
 * @module types/gameState
 */

import type { DrillDocument, ProgressDocument, LeaderboardEntry, UserDocument } from './firebase';

/**
 * Estado global do jogo
 */
export interface GameState {
  /** Dados do usuário */
  user: UserDocument | null;
  /** Lista de drills disponíveis */
  drills: DrillDocument[];
  /** Progresso do usuário em cada drill */
  progress: Map<string, ProgressDocument>;
  /** Leaderboard atual */
  leaderboard: LeaderboardEntry[];
  /** Drill sendo jogado */
  currentDrill: DrillDocument | null;
  /** Se está carregando dados */
  loading: boolean;
  /** Se os dados foram carregados inicialmente */
  initialized: boolean;
}

/**
 * Ações do jogo
 */
export interface GameActions {
  /** Adiciona XP ao usuário */
  addXP: (amount: number) => Promise<void>;
  /** Atualiza streak */
  updateStreak: () => Promise<void>;
  /** Completa um drill */
  completeDrill: (drillId: string, score: number, stars: 0 | 1 | 2 | 3) => Promise<void>;
  /** Define o drill atual */
  setCurrentDrill: (drill: DrillDocument | null) => void;
  /** Adiciona um badge */
  addBadge: (badgeId: string) => Promise<void>;
  /** Atualiza leaderboard */
  refreshLeaderboard: () => Promise<void>;
  /** Recarrega todos os dados */
  refresh: () => Promise<void>;
}

/**
 * Tipo completo do contexto do jogo
 */
export interface GameContextType extends GameState, GameActions {}

/**
 * Estatísticas calculadas
 */
export interface ComputedStats {
  /** XP para o próximo nível */
  xpToNextLevel: number;
  /** Progresso percentual para próximo nível */
  levelProgress: number;
  /** Total de drills completados */
  totalCompleted: number;
  /** Total de drills disponíveis */
  totalDrills: number;
  /** Porcentagem de conclusão */
  completionPercentage: number;
  /** Média de estrelas */
  averageStars: number;
  /** Total de estrelas */
  totalStars: number;
  /** Máximo de estrelas possíveis */
  maxStars: number;
}

/**
 * Resultado de um drill jogado
 */
export interface DrillResult {
  drillId: string;
  score: number;
  stars: 0 | 1 | 2 | 3;
  xpEarned: number;
  timeSpent: number;
  isPersonalBest: boolean;
  leveledUp: boolean;
  newBadges: string[];
}

/**
 * Desafio diário
 */
export interface DailyChallenge {
  id: string;
  date: string;
  drillId: string;
  drill: DrillDocument;
  xpBonus: number;
  completed: boolean;
}
