/**
 * @fileoverview Context do estado global do jogo
 * @module contexts/GameContext
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useAuthContext } from './AuthContext';
import {
  getAllDrills,
  getUserProgress,
  saveProgress,
  updateUser,
  addUserXP,
  updateUserStreak,
  getLeaderboard,
} from '../services/firebaseDB';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type {
  GameState,
  GameActions,
  GameContextType,
} from '../types/gameState';
import type {
  DrillDocument,
  ProgressDocument,
  LeaderboardEntry,
} from '../types/firebase';

/**
 * Estado inicial
 */
const initialState: GameState = {
  user: null,
  drills: [],
  progress: new Map(),
  leaderboard: [],
  currentDrill: null,
  loading: true,
  initialized: false,
};

/**
 * Context do jogo
 */
const GameContext = createContext<GameContextType | null>(null);

/**
 * Props do GameProvider
 */
interface GameProviderProps {
  children: ReactNode;
}

/**
 * Provider do estado global do jogo
 */
export function GameProvider({ children }: GameProviderProps) {
  const { user, userData, isAuthenticated } = useAuthContext();

  const [state, setState] = useState<GameState>(initialState);

  // Cache local dos drills
  const [cachedDrills, setCachedDrills] = useLocalStorage<DrillDocument[]>(
    'ia-rimas-drills',
    []
  );

  /**
   * Carrega drills do Firebase ou cache
   */
  const loadDrills = useCallback(async () => {
    try {
      const drills = await getAllDrills();
      setState((prev) => ({ ...prev, drills }));
      setCachedDrills(drills);
    } catch (error) {
      console.error('Erro ao carregar drills:', error);
      // Usa cache se falhar
      if (cachedDrills.length > 0) {
        setState((prev) => ({ ...prev, drills: cachedDrills }));
      }
    }
  }, [cachedDrills, setCachedDrills]);

  /**
   * Carrega progresso do usuário
   */
  const loadProgress = useCallback(async (userId: string) => {
    try {
      const progressList = await getUserProgress(userId);
      const progressMap = new Map<string, ProgressDocument>();
      progressList.forEach((p) => {
        progressMap.set(p.drillId, p);
      });
      setState((prev) => ({ ...prev, progress: progressMap }));
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  }, []);

  /**
   * Carrega leaderboard
   */
  const loadLeaderboard = useCallback(async () => {
    try {
      const leaderboard = await getLeaderboard('weekly', 50);
      setState((prev) => ({ ...prev, leaderboard }));
    } catch (error) {
      console.error('Erro ao carregar leaderboard:', error);
    }
  }, []);

  /**
   * Inicializa dados quando autenticado
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      setState((prev) => ({ ...prev, loading: true }));

      Promise.all([
        loadDrills(),
        loadProgress(user.uid),
        loadLeaderboard(),
      ]).then(() => {
        setState((prev) => ({
          ...prev,
          user: userData,
          loading: false,
          initialized: true,
        }));
      });
    } else {
      setState({
        ...initialState,
        drills: cachedDrills,
        loading: false,
      });
    }
  }, [isAuthenticated, user, userData, loadDrills, loadProgress, loadLeaderboard, cachedDrills]);

  /**
   * Atualiza user quando userData muda
   */
  useEffect(() => {
    if (userData) {
      setState((prev) => ({ ...prev, user: userData }));
    }
  }, [userData]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Adiciona XP
   */
  const addXP = useCallback(async (amount: number) => {
    if (!user) return;

    try {
      await addUserXP(user.uid, amount);

      setState((prev) => {
        if (!prev.user) return prev;
        const newXP = prev.user.xp + amount;
        const newLevel = Math.floor(Math.pow(newXP / 100, 1 / 1.5)) + 1;
        return {
          ...prev,
          user: {
            ...prev.user,
            xp: newXP,
            level: Math.max(prev.user.level, newLevel),
          },
        };
      });
    } catch (error) {
      console.error('Erro ao adicionar XP:', error);
    }
  }, [user]);

  /**
   * Atualiza streak
   */
  const updateStreakAction = useCallback(async () => {
    if (!user) return;

    try {
      await updateUserStreak(user.uid);
      // Recarrega dados do usuário
      // O AuthContext vai atualizar userData
    } catch (error) {
      console.error('Erro ao atualizar streak:', error);
    }
  }, [user]);

  /**
   * Completa um drill
   */
  const completeDrill = useCallback(
    async (drillId: string, score: number, stars: 0 | 1 | 2 | 3) => {
      if (!user) return;

      try {
        await saveProgress(user.uid, drillId, {
          bestScore: score,
          stars,
          completed: true,
        });

        // Atualiza estado local
        setState((prev) => {
          const newProgress = new Map(prev.progress);
          const existing = newProgress.get(drillId);

          newProgress.set(drillId, {
            id: `${user.uid}_${drillId}`,
            userId: user.uid,
            drillId,
            attempts: (existing?.attempts || 0) + 1,
            bestScore: Math.max(existing?.bestScore || 0, score),
            stars: Math.max(existing?.stars || 0, stars) as 0 | 1 | 2 | 3,
            completed: true,
            firstAttemptAt: existing?.firstAttemptAt || new Date(),
            lastAttemptAt: new Date(),
          });

          // Atualiza contador de drills completados
          const completedCount = Array.from(newProgress.values()).filter(
            (p) => p.completed
          ).length;

          return {
            ...prev,
            progress: newProgress,
            user: prev.user
              ? { ...prev.user, drillsCompleted: completedCount }
              : null,
          };
        });
      } catch (error) {
        console.error('Erro ao completar drill:', error);
      }
    },
    [user]
  );

  /**
   * Define drill atual
   */
  const setCurrentDrill = useCallback((drill: DrillDocument | null) => {
    setState((prev) => ({ ...prev, currentDrill: drill }));
  }, []);

  /**
   * Adiciona badge
   */
  const addBadge = useCallback(
    async (badgeId: string) => {
      if (!user || !state.user) return;

      if (state.user.badges.includes(badgeId)) return;

      try {
        const newBadges = [...state.user.badges, badgeId];
        await updateUser(user.uid, { badges: newBadges });

        setState((prev) => ({
          ...prev,
          user: prev.user ? { ...prev.user, badges: newBadges } : null,
        }));
      } catch (error) {
        console.error('Erro ao adicionar badge:', error);
      }
    },
    [user, state.user]
  );

  /**
   * Atualiza leaderboard
   */
  const refreshLeaderboard = useCallback(async () => {
    await loadLeaderboard();
  }, [loadLeaderboard]);

  /**
   * Recarrega todos os dados
   */
  const refresh = useCallback(async () => {
    if (!user) return;

    setState((prev) => ({ ...prev, loading: true }));

    await Promise.all([
      loadDrills(),
      loadProgress(user.uid),
      loadLeaderboard(),
    ]);

    setState((prev) => ({ ...prev, loading: false }));
  }, [user, loadDrills, loadProgress, loadLeaderboard]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT VALUE
  // ═══════════════════════════════════════════════════════════════════════════

  const value: GameContextType = useMemo(
    () => ({
      ...state,
      addXP,
      updateStreak: updateStreakAction,
      completeDrill,
      setCurrentDrill,
      addBadge,
      refreshLeaderboard,
      refresh,
    }),
    [
      state,
      addXP,
      updateStreakAction,
      completeDrill,
      setCurrentDrill,
      addBadge,
      refreshLeaderboard,
      refresh,
    ]
  );

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

/**
 * Hook para acessar o contexto do jogo
 */
export function useGameContext(): GameContextType {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error('useGameContext deve ser usado dentro de GameProvider');
  }

  return context;
}

export default GameContext;
