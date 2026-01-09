/**
 * @fileoverview Hook para acesso simplificado ao estado do jogo
 * @module hooks/useGameState
 */

import { useMemo, useCallback } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { getXPProgress, getXPToNextLevel, getLevelFromXP } from '../utils/xp';
import { getStreakInfo, getStreakStatus } from '../utils/streak';
import type { ComputedStats, DrillResult } from '../types/gameState';
import type { DrillDocument, ProgressDocument } from '../types/firebase';

/**
 * Hook para acesso ao estado do jogo com helpers
 *
 * @example
 * const { user, stats, getDrillProgress, isCompleted } = useGameState();
 */
export function useGameState() {
  const context = useGameContext();

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Estatísticas calculadas
   */
  const stats = useMemo((): ComputedStats => {
    const { user, drills, progress } = context;

    if (!user) {
      return {
        xpToNextLevel: 100,
        levelProgress: 0,
        totalCompleted: 0,
        totalDrills: drills.length,
        completionPercentage: 0,
        averageStars: 0,
        totalStars: 0,
        maxStars: drills.length * 3,
      };
    }

    const xpProgress = getXPProgress(user.xp);
    const completedProgress = Array.from(progress.values()).filter(
      (p) => p.completed
    );

    const totalStars = completedProgress.reduce((sum, p) => sum + p.stars, 0);
    const maxStars = drills.length * 3;

    return {
      xpToNextLevel: getXPToNextLevel(user.xp),
      levelProgress: xpProgress.progress,
      totalCompleted: completedProgress.length,
      totalDrills: drills.length,
      completionPercentage:
        drills.length > 0
          ? Math.round((completedProgress.length / drills.length) * 100)
          : 0,
      averageStars:
        completedProgress.length > 0
          ? totalStars / completedProgress.length
          : 0,
      totalStars,
      maxStars,
    };
  }, [context]);

  /**
   * Informações de XP
   */
  const xpInfo = useMemo(() => {
    if (!context.user) return null;
    return getXPProgress(context.user.xp);
  }, [context.user]);

  /**
   * Informações de streak
   */
  const streakInfo = useMemo(() => {
    if (!context.user) return null;
    return getStreakInfo(context.user.streak);
  }, [context.user]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Retorna o progresso de um drill específico
   */
  const getDrillProgress = useCallback(
    (drillId: string): ProgressDocument | undefined => {
      return context.progress.get(drillId);
    },
    [context.progress]
  );

  /**
   * Verifica se um drill está completado
   */
  const isCompleted = useCallback(
    (drillId: string): boolean => {
      const progress = context.progress.get(drillId);
      return progress?.completed ?? false;
    },
    [context.progress]
  );

  /**
   * Retorna as estrelas de um drill
   */
  const getStars = useCallback(
    (drillId: string): 0 | 1 | 2 | 3 => {
      const progress = context.progress.get(drillId);
      return progress?.stars ?? 0;
    },
    [context.progress]
  );

  /**
   * Verifica se um drill está desbloqueado
   */
  const isUnlocked = useCallback(
    (drill: DrillDocument): boolean => {
      if (!drill.prerequisites || drill.prerequisites.length === 0) {
        return true;
      }

      return drill.prerequisites.every((prereqId) => {
        const progress = context.progress.get(prereqId);
        return progress?.completed ?? false;
      });
    },
    [context.progress]
  );

  /**
   * Retorna drills por categoria
   */
  const getDrillsByCategory = useCallback(
    (category: 'som' | 'ritmo' | 'sentido' | 'batalha'): DrillDocument[] => {
      return context.drills.filter((drill) => drill.category === category);
    },
    [context.drills]
  );

  /**
   * Retorna próximo drill disponível
   */
  const getNextDrill = useCallback((): DrillDocument | null => {
    const availableDrills = context.drills.filter((drill) => {
      const progress = context.progress.get(drill.id);
      return !progress?.completed && isUnlocked(drill);
    });

    return availableDrills[0] ?? null;
  }, [context.drills, context.progress, isUnlocked]);

  /**
   * Retorna drills recomendados
   */
  const getRecommendedDrills = useCallback(
    (limit: number = 3): DrillDocument[] => {
      const available = context.drills.filter((drill) => {
        const progress = context.progress.get(drill.id);
        return !progress?.completed && isUnlocked(drill);
      });

      // Prioriza por dificuldade adequada ao nível
      const userLevel = context.user?.level ?? 1;

      return available
        .sort((a, b) => {
          // Drills com dificuldade próxima ao nível do usuário primeiro
          const diffA = Math.abs(a.difficulty - userLevel);
          const diffB = Math.abs(b.difficulty - userLevel);
          return diffA - diffB;
        })
        .slice(0, limit);
    },
    [context.drills, context.progress, context.user, isUnlocked]
  );

  /**
   * Verifica se o usuário tem um badge
   */
  const hasBadge = useCallback(
    (badgeId: string): boolean => {
      return context.user?.badges.includes(badgeId) ?? false;
    },
    [context.user]
  );

  /**
   * Retorna posição no leaderboard
   */
  const getUserRank = useCallback((): number | null => {
    if (!context.user) return null;

    const entry = context.leaderboard.find(
      (e) => e.userId === context.user?.id
    );
    return entry?.rank ?? null;
  }, [context.user, context.leaderboard]);

  /**
   * Calcula XP que seria ganho em um drill
   */
  const calculateDrillXP = useCallback(
    (drill: DrillDocument, score: number): number => {
      const baseXP = drill.xpReward;
      const scoreMultiplier = score / 100;
      const streakBonus = streakInfo?.bonus ?? 0;

      return Math.round(baseXP * scoreMultiplier * (1 + streakBonus));
    },
    [streakInfo]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    // Estado
    ...context,

    // Computed
    stats,
    xpInfo,
    streakInfo,

    // Helpers
    getDrillProgress,
    isCompleted,
    getStars,
    isUnlocked,
    getDrillsByCategory,
    getNextDrill,
    getRecommendedDrills,
    hasBadge,
    getUserRank,
    calculateDrillXP,
  };
}

export default useGameState;
