# 🚀 SPRINT 2 + 3: GAMIFICAÇÃO + SISTEMA DE TREINO

**Duração:** 2 semanas (7 dias x 2)
**Executor:** 1 dev solo
**Stack:** React + Vite + Tailwind + SQLite local
**Status:** READY TO BUILD

---

## 📊 PANORAMA GERAL

### Sprint 2 (Dias 1-7): Gamificação Core
```
Day 1: XP Service + DB schema
Day 2: Level System + Progress calculation
Day 3: Streak System + Daily Challenge
Day 4: UI Components (XPBar, LevelBadge, etc)
Day 5: Integration with existing exercises
Day 6: Testing + refinement
Day 7: Polish + edge cases
```

**Deliverable:** User pode ver XP, nível, streak, daily challenge no dashboard.

### Sprint 3 (Dias 8-14): Sistema de Treino Expandido
```
Day 8: Structure 80 exercises em JSON
Day 9: Exercise Loader + categorização
Day 10: 4 Lesson Pages (UI)
Day 11: AI Scoring integration (OpenAI/Mock)
Day 12: Exercise Types implementation (10 tipos)
Day 13: Results Page + feedback
Day 14: E2E testing + deploy
```

**Deliverable:** User pode completar 80 exercícios estruturados com feedback IA.

---

## 🎮 SPRINT 2: GAMIFICAÇÃO CORE

### 2.1 XP Service (`src/services/xpService.ts`)

```typescript
import Database from 'better-sqlite3';
import path from 'path';

interface XPEvent {
  type: 'exercise' | 'streak' | 'daily' | 'achievement' | 'battle';
  baseXP: number;
  multiplier: number;
  source: string;
  metadata?: Record<string, any>;
}

interface XPHistory {
  id: number;
  user_id: string;
  amount: number;
  source: string;
  multiplier: number;
  created_at: string;
}

const db = new Database(path.join(process.cwd(), 'data', 'rimas.db'));

export class XPService {
  /**
   * Calcula XP final baseado em multiplicadores
   */
  static calculateXP(event: XPEvent): number {
    const baseXP = event.baseXP;
    const multipliedXP = Math.floor(baseXP * event.multiplier);
    return Math.max(10, multipliedXP); // Mínimo 10 XP
  }

  /**
   * Adiciona XP ao usuário
   */
  static async addXP(userId: string, event: XPEvent): Promise<number> {
    const totalXP = this.calculateXP(event);

    // Insert na história
    const stmt = db.prepare(`
      INSERT INTO xp_history (user_id, amount, source, multiplier)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(userId, totalXP, event.source, event.multiplier);

    // Update no progresso
    const updateStmt = db.prepare(`
      UPDATE user_progress
      SET xp_total = xp_total + ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);

    updateStmt.run(totalXP, userId);

    return totalXP;
  }

  /**
   * Get total XP do usuário
   */
  static getTotalXP(userId: string): number {
    const stmt = db.prepare(`
      SELECT xp_total FROM user_progress WHERE user_id = ?
    `);

    const result = stmt.get(userId) as { xp_total: number } | undefined;
    return result?.xp_total ?? 0;
  }

  /**
   * Get XP history
   */
  static getXPHistory(userId: string, limit = 20): XPHistory[] {
    const stmt = db.prepare(`
      SELECT * FROM xp_history
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);

    return stmt.all(userId, limit) as XPHistory[];
  }

  /**
   * Get XP earned today
   */
  static getXPToday(userId: string): number {
    const stmt = db.prepare(`
      SELECT SUM(amount) as total FROM xp_history
      WHERE user_id = ?
      AND DATE(created_at) = DATE('now')
    `);

    const result = stmt.get(userId) as { total: number } | undefined;
    return result?.total ?? 0;
  }
}
```

### 2.2 Level Service (`src/services/levelService.ts`)

```typescript
import Database from 'better-sqlite3';
import path from 'path';

interface LevelProgress {
  currentLevel: number;
  currentXP: number;
  xpForNextLevel: number;
  xpProgress: number;
  percentToNextLevel: number;
  isLevelUp: boolean;
}

const db = new Database(path.join(process.cwd(), 'data', 'rimas.db'));

export class LevelService {
  // Exponential curve: 100 * 1.5^(level-1)
  static getXPForLevel(level: number): number {
    if (level <= 1) return 0;
    return Math.floor(100 * Math.pow(1.5, level - 2));
  }

  /**
   * Calcula nível baseado em XP total
   */
  static calculateLevel(totalXP: number): number {
    let level = 1;
    let accumulatedXP = 0;

    for (let i = 2; i <= 50; i++) {
      const xpNeeded = this.getXPForLevel(i);
      if (accumulatedXP + xpNeeded > totalXP) {
        return i - 1;
      }
      accumulatedXP += xpNeeded;
      level = i - 1;
    }

    return Math.min(50, level);
  }

  /**
   * Get total XP acumulado para atingir um nível
   */
  static getTotalXPForLevel(level: number): number {
    let total = 0;
    for (let i = 2; i <= level; i++) {
      total += this.getXPForLevel(i);
    }
    return total;
  }

  /**
   * Get progresso de XP
   */
  static getLevelProgress(totalXP: number): LevelProgress {
    const currentLevel = this.calculateLevel(totalXP);
    const xpForCurrentLevel = this.getTotalXPForLevel(currentLevel);
    const xpForNextLevel = this.getTotalXPForLevel(currentLevel + 1);

    const currentXP = totalXP - xpForCurrentLevel;
    const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
    const percentToNextLevel = Math.floor((currentXP / xpNeededForNext) * 100);

    return {
      currentLevel,
      currentXP,
      xpForNextLevel: xpNeededForNext,
      xpProgress: currentXP,
      percentToNextLevel,
      isLevelUp: currentLevel > 1 && totalXP >= xpForCurrentLevel
    };
  }

  /**
   * Get reward por level (badge, cosmetic, etc)
   */
  static getLevelRewards(level: number): string[] {
    const rewards: Record<number, string[]> = {
      5: ['badge:beginner'],
      10: ['cosmetic:bronze_border'],
      15: ['badge:intermediate'],
      20: ['cosmetic:silver_border', 'emote:fire'],
      25: ['badge:advanced'],
      30: ['cosmetic:gold_border'],
      40: ['cosmetic:platinum_border', 'emote:king'],
      50: ['cosmetic:legendary_border', 'achievement:legend']
    };

    return rewards[level] ?? [];
  }

  /**
   * Update level no banco
   */
  static updateLevel(userId: string, totalXP: number): void {
    const level = this.calculateLevel(totalXP);

    const stmt = db.prepare(`
      UPDATE user_progress
      SET nivel = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);

    stmt.run(level, userId);
  }
}
```

### 2.3 Streak Service (`src/services/streakService.ts`)

```typescript
import Database from 'better-sqlite3';
import path from 'path';

interface StreakStatus {
  currentStreak: number;
  bestStreak: number;
  multiplier: number;
  lastActivityDate: string | null;
  isStreakAtRisk: boolean;
  canContinueToday: boolean;
}

const db = new Database(path.join(process.cwd(), 'data', 'rimas.db'));

export class StreakService {
  /**
   * Calcula multiplicador baseado em dias de streak
   */
  static getStreakMultiplier(streakDays: number): number {
    if (streakDays === 0) return 1.0;
    if (streakDays < 7) return 1.0 + (streakDays * 0.1); // 1.0x -> 1.6x
    if (streakDays < 14) return 1.6 + ((streakDays - 7) * 0.05); // 1.6x -> 1.95x
    return Math.min(3.0, 1.95 + ((streakDays - 14) * 0.01)); // até 3.0x
  }

  /**
   * Checa e retorna status do streak
   */
  static checkStreak(userId: string): StreakStatus {
    const stmt = db.prepare(`
      SELECT current_streak, best_streak, last_activity_at
      FROM user_progress
      WHERE user_id = ?
    `);

    const row = stmt.get(userId) as {
      current_streak: number;
      best_streak: number;
      last_activity_at: string | null;
    } | undefined;

    if (!row) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        multiplier: 1.0,
        lastActivityDate: null,
        isStreakAtRisk: false,
        canContinueToday: true
      };
    }

    const lastActivity = row.last_activity_at ? new Date(row.last_activity_at) : null;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let currentStreak = row.current_streak;
    let isStreakAtRisk = false;
    let canContinueToday = true;

    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      const lastDateOnly = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

      if (lastDateOnly.getTime() === todayOnly.getTime()) {
        // Já completou hoje
        canContinueToday = false;
      } else if (lastDateOnly.getTime() !== yesterdayOnly.getTime()) {
        // Quebrou o streak
        currentStreak = 0;
      }

      // Streak em risco se não fez ontem
      const daysSince = Math.floor((todayOnly.getTime() - lastDateOnly.getTime()) / (1000 * 60 * 60 * 24));
      isStreakAtRisk = daysSince === 1 && canContinueToday;
    }

    return {
      currentStreak,
      bestStreak: row.best_streak,
      multiplier: this.getStreakMultiplier(currentStreak),
      lastActivityDate: row.last_activity_at,
      isStreakAtRisk,
      canContinueToday
    };
  }

  /**
   * Atualiza streak quando usuário completa atividade
   */
  static updateStreak(userId: string): StreakStatus {
    const current = this.checkStreak(userId);

    let newStreak = current.currentStreak;
    if (current.canContinueToday) {
      newStreak = current.currentStreak + 1;
    }

    const newBest = Math.max(current.bestStreak, newStreak);

    const stmt = db.prepare(`
      UPDATE user_progress
      SET current_streak = ?,
          best_streak = ?,
          last_activity_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);

    stmt.run(newStreak, newBest, userId);

    return this.checkStreak(userId);
  }

  /**
   * Reseta streak (para debug/admin)
   */
  static resetStreak(userId: string): void {
    const stmt = db.prepare(`
      UPDATE user_progress
      SET current_streak = 0, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);

    stmt.run(userId);
  }
}
```

### 2.4 Daily Challenge Service (`src/services/dailyChallengeService.ts`)

```typescript
import Database from 'better-sqlite3';
import path from 'path';

interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'exercise' | 'theme' | 'xp_goal' | 'battle';
  target: any;
  reward_xp: number;
  completed: boolean;
  progress: number;
}

const db = new Database(path.join(process.cwd(), 'data', 'rimas.db'));

// Challenges data - pode ser hardcoded ou em arquivo JSON
const CHALLENGES_POOL: Omit<DailyChallenge, 'id' | 'date' | 'completed' | 'progress'>[] = [
  {
    title: 'Prática Matinal',
    description: 'Complete 1 exercício antes das 12h',
    type: 'exercise',
    target: { count: 1, deadline_hour: 12 },
    reward_xp: 50
  },
  {
    title: 'Desafio Battle',
    description: 'Vença 1 duelo contra a IA',
    type: 'battle',
    target: { difficulty: 'easy', wins: 1 },
    reward_xp: 100
  },
  {
    title: 'Mestre de Rimas',
    description: 'Complete 2 exercícios de Pillar 1',
    type: 'theme',
    target: { pillar: 1, count: 2 },
    reward_xp: 75
  },
  {
    title: 'Ganhe 200 XP',
    description: 'Acumule 200 XP em qualquer atividade',
    type: 'xp_goal',
    target: { amount: 200 },
    reward_xp: 200
  },
  {
    title: 'Speed Master',
    description: 'Complete 1 Speed Challenge',
    type: 'exercise',
    target: { type: 'speed', count: 1 },
    reward_xp: 80
  },
  {
    title: 'Rhythm Sync',
    description: 'Sincronize perfeitamente com o beat (>90%)',
    type: 'exercise',
    target: { type: 'rhythm', score: 90 },
    reward_xp: 120
  },
  {
    title: 'Gravador de Ouro',
    description: 'Grave um verso com score > 85/100',
    type: 'exercise',
    target: { type: 'production', score: 85 },
    reward_xp: 150
  },
  {
    title: 'Semana de Fogo',
    description: 'Acumule 7 dias de streak',
    type: 'theme',
    target: { streak: 7 },
    reward_xp: 500
  }
];

export class DailyChallengeService {
  /**
   * Gera challenge para o dia baseado em seed
   */
  static getTodayChallenge(userId: string): DailyChallenge {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Seed baseado na data (mesmo desafio para todos usuários no mesmo dia)
    const dateNum = parseInt(today.replace(/-/g, ''));
    const index = dateNum % CHALLENGES_POOL.length;
    const challenge = CHALLENGES_POOL[index];

    // Verifica se já completou hoje
    const stmt = db.prepare(`
      SELECT 1 FROM daily_challenge_completions
      WHERE user_id = ? AND challenge_date = DATE('now')
    `);

    const completed = !!stmt.get(userId);

    return {
      id: `challenge_${today}`,
      date: today,
      completed,
      progress: completed ? 100 : 0,
      ...challenge
    };
  }

  /**
   * Marca challenge como completo
   */
  static completeChallenge(userId: string, challengeId: string): void {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO daily_challenge_completions
      (user_id, challenge_date)
      VALUES (?, DATE('now'))
    `);

    stmt.run(userId);
  }

  /**
   * Get desafios próximos (próximos 7 dias)
   */
  static getUpcomingChallenges(days = 7): DailyChallenge[] {
    const upcoming: DailyChallenge[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const dateNum = parseInt(dateStr.replace(/-/g, ''));
      const index = dateNum % CHALLENGES_POOL.length;
      const challenge = CHALLENGES_POOL[index];

      upcoming.push({
        id: `challenge_${dateStr}`,
        date: dateStr,
        completed: false,
        progress: 0,
        ...challenge
      });
    }

    return upcoming;
  }
}
```

### 2.5 Database Schema (`data/schema.sql`)

```sql
-- Adicionar ao schema existente

CREATE TABLE IF NOT EXISTS user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT DEFAULT 'local_user',
  xp_total INTEGER DEFAULT 0,
  nivel INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_activity_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS xp_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT DEFAULT 'local_user',
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  multiplier REAL DEFAULT 1.0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_xp_history_user_date ON xp_history(user_id, created_at);
CREATE INDEX idx_xp_history_date ON xp_history(DATE(created_at));

CREATE TABLE IF NOT EXISTS daily_challenge_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT DEFAULT 'local_user',
  challenge_date TEXT NOT NULL,
  completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, challenge_date)
);

-- Initialize user_progress para 'local_user'
INSERT OR IGNORE INTO user_progress (user_id)
VALUES ('local_user');
```

### 2.6 UI Components

#### `src/ui/components/gamification/XPBar.tsx`

```tsx
import React from 'react';
import { motion } from 'framer-motion';

interface XPBarProps {
  currentXP: number;
  neededXP: number;
  level: number;
  animatePopup?: boolean;
  popupText?: string;
}

export const XPBar: React.FC<XPBarProps> = ({
  currentXP,
  neededXP,
  level,
  animatePopup,
  popupText
}) => {
  const percentage = Math.min((currentXP / neededXP) * 100, 100);

  return (
    <div className="space-y-1">
      {/* XP Progress Bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-600">Level {level}</span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-600">
          {currentXP}/{neededXP}
        </span>
      </div>

      {/* XP Popup Animation */}
      {animatePopup && popupText && (
        <motion.div
          className="absolute text-lg font-bold text-yellow-500"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -30 }}
          transition={{ duration: 1 }}
        >
          {popupText}
        </motion.div>
      )}
    </div>
  );
};
```

#### `src/ui/components/gamification/LevelBadge.tsx`

```tsx
import React from 'react';
import { motion } from 'framer-motion';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showRing?: boolean;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  size = 'md',
  animated = false,
  showRing = false
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl'
  };

  const colors = {
    1: 'from-gray-400 to-gray-600',       // Bronze
    10: 'from-gray-300 to-gray-500',      // Silver
    20: 'from-yellow-400 to-yellow-600',  // Gold
    30: 'from-cyan-400 to-cyan-600',      // Platinum
    50: 'from-purple-500 to-pink-600'     // Legendary
  };

  let colorClass = colors[1];
  if (level >= 30) colorClass = colors[50];
  else if (level >= 20) colorClass = colors[20];
  else if (level >= 10) colorClass = colors[10];

  return (
    <motion.div
      className={`
        relative flex items-center justify-center rounded-full
        bg-gradient-to-br ${colorClass} font-bold text-white
        shadow-lg ${sizeClasses[size]}
      `}
      animate={animated ? { scale: [1, 1.05, 1] } : undefined}
      transition={animated ? { duration: 2, repeat: Infinity } : undefined}
    >
      {level}

      {/* Anel brilhante para nivel > 20 */}
      {showRing && level > 20 && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-yellow-300"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};
```

#### `src/ui/components/gamification/StreakIndicator.tsx`

```tsx
import React from 'react';
import { motion } from 'framer-motion';

interface StreakIndicatorProps {
  currentStreak: number;
  bestStreak: number;
  isAtRisk: boolean;
  multiplier: number;
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({
  currentStreak,
  bestStreak,
  isAtRisk,
  multiplier
}) => {
  return (
    <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
      <motion.div
        className="text-3xl"
        animate={isAtRisk ? { scale: [1, 1.1, 1] } : undefined}
        transition={isAtRisk ? { duration: 0.5, repeat: Infinity } : undefined}
      >
        🔥
      </motion.div>

      <div className="flex-1">
        <p className="font-bold text-sm">
          Streak: {currentStreak} dias
          {isAtRisk && <span className="text-red-600 ml-2">(EM RISCO!)</span>}
        </p>
        <p className="text-xs text-gray-600">
          Melhor: {bestStreak} dias • Multiplicador: {multiplier.toFixed(1)}x
        </p>
      </div>

      {currentStreak > 0 && (
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">{currentStreak}</p>
          <p className="text-xs text-gray-600">dias</p>
        </div>
      )}
    </div>
  );
};
```

#### `src/ui/components/gamification/DailyChallengeCard.tsx`

```tsx
import React from 'react';
import { motion } from 'framer-motion';

interface DailyChallengCardProps {
  title: string;
  description: string;
  reward_xp: number;
  completed: boolean;
  progress: number;
  onClick?: () => void;
}

export const DailyChallengeCard: React.FC<DailyChallengCardProps> = ({
  title,
  description,
  reward_xp,
  completed,
  progress,
  onClick
}) => {
  return (
    <motion.div
      className={`
        p-4 rounded-lg border-2 cursor-pointer transition-all
        ${completed
          ? 'bg-green-50 border-green-300'
          : 'bg-white border-blue-200 hover:border-blue-400'
        }
      `}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-sm">{title}</h3>
        {completed && <span className="text-xl">✅</span>}
      </div>

      <p className="text-xs text-gray-600 mb-3">{description}</p>

      {/* Progress Bar */}
      {!completed && progress > 0 && (
        <div className="mb-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Reward */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600">
          {progress}% completo
        </span>
        <span className="text-sm font-bold text-yellow-600">+{reward_xp} XP</span>
      </div>
    </motion.div>
  );
};
```

### 2.7 Integration com Dashboard

Atualizar `src/pages/DashboardPage.tsx`:

```tsx
import React, { useEffect, useState } from 'react';
import { XPService } from '../services/xpService';
import { LevelService } from '../services/levelService';
import { StreakService } from '../services/streakService';
import { DailyChallengeService } from '../services/dailyChallengeService';

import { XPBar } from '../ui/components/gamification/XPBar';
import { LevelBadge } from '../ui/components/gamification/LevelBadge';
import { StreakIndicator } from '../ui/components/gamification/StreakIndicator';
import { DailyChallengeCard } from '../ui/components/gamification/DailyChallengeCard';

const DashboardPage: React.FC = () => {
  const userId = 'local_user';
  const [totalXP, setTotalXP] = useState(0);
  const [levelProgress, setLevelProgress] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);

  useEffect(() => {
    const loadGameData = () => {
      // Load XP
      const xp = XPService.getTotalXP(userId);
      setTotalXP(xp);

      // Load level progress
      const progress = LevelService.getLevelProgress(xp);
      setLevelProgress(progress);

      // Load streak
      const streakStatus = StreakService.checkStreak(userId);
      setStreak(streakStatus);

      // Load daily challenge
      const challenge = DailyChallengeService.getTodayChallenge(userId);
      setDailyChallenge(challenge);
    };

    loadGameData();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header com level badge */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {levelProgress && (
          <LevelBadge
            level={levelProgress.currentLevel}
            size="lg"
            animated={false}
            showRing={levelProgress.currentLevel > 20}
          />
        )}
      </div>

      {/* XP Progress */}
      {levelProgress && (
        <XPBar
          currentXP={levelProgress.xpProgress}
          neededXP={levelProgress.xpForNextLevel}
          level={levelProgress.currentLevel}
        />
      )}

      {/* Streak Indicator */}
      {streak && (
        <StreakIndicator
          currentStreak={streak.currentStreak}
          bestStreak={streak.bestStreak}
          isAtRisk={streak.isStreakAtRisk}
          multiplier={streak.multiplier}
        />
      )}

      {/* Daily Challenge */}
      {dailyChallenge && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="font-bold text-lg mb-3">📌 Desafio do Dia</h2>
          <DailyChallengeCard
            title={dailyChallenge.title}
            description={dailyChallenge.description}
            reward_xp={dailyChallenge.reward_xp}
            completed={dailyChallenge.completed}
            progress={dailyChallenge.progress}
          />
        </div>
      )}

      {/* Grid de botões principais */}
      <div className="grid grid-cols-2 gap-4">
        <button className="p-4 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600">
          🎓 Continuar Aprendendo
        </button>
        <button className="p-4 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600">
          ⚔️ Duelo
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
```

---

## 📚 SPRINT 3: SISTEMA DE TREINO EXPANDIDO

### 3.1 Estrutura de 80 Exercícios (`src/data/exercises.json`)

```json
{
  "exercises": [
    {
      "id": "ex_1_1_1",
      "pillar": 1,
      "lesson": 1,
      "exercise_num": 1,
      "type": "listening",
      "title": "Identifique a Rima",
      "description": "Ouça dois sons e identifique se rimam",
      "instructions": "Toque SIM se rimam, NÃO se não rimam",
      "difficulty": "easy",
      "time_limit_seconds": 30,
      "base_xp": 10,
      "bonus_xp": 5,
      "audio_urls": [
        "assets/audio/rimas/ex_1_1_1_audio1.mp3",
        "assets/audio/rimas/ex_1_1_1_audio2.mp3"
      ],
      "options": [
        { "id": "opt_1", "text": "SIM", "correct": true },
        { "id": "opt_2", "text": "NÃO", "correct": false }
      ],
      "explanation": "CAR e STAR rimam porque ambas terminam com o som -AR"
    },
    {
      "id": "ex_1_1_2",
      "pillar": 1,
      "lesson": 1,
      "exercise_num": 2,
      "type": "matching",
      "title": "Agrupe Rimas",
      "description": "Arraste as palavras para agrupar as que rimam",
      "instructions": "Drag and drop as palavras em grupos",
      "difficulty": "easy",
      "time_limit_seconds": 60,
      "base_xp": 15,
      "bonus_xp": 10,
      "items": [
        { "id": "item_1", "text": "CAR", "group": "ar" },
        { "id": "item_2", "text": "STAR", "group": "ar" },
        { "id": "item_3", "text": "PLAY", "group": "ay" },
        { "id": "item_4", "text": "DAY", "group": "ay" }
      ],
      "groups": [
        { "id": "ar", "title": "Som -AR" },
        { "id": "ay", "title": "Som -AY" }
      ]
    },
    {
      "id": "ex_1_1_3",
      "pillar": 1,
      "lesson": 1,
      "exercise_num": 3,
      "type": "fill_blank",
      "title": "Complete a Rima",
      "description": "Escolha a palavra que completa a rima",
      "instructions": "Selecione entre as 3 opções",
      "difficulty": "easy",
      "time_limit_seconds": 45,
      "base_xp": 15,
      "bonus_xp": 10,
      "question": "Meu nome é importante, nem é tão ___",
      "options": [
        { "id": "opt_1", "text": "Rápido", "correct": false },
        { "id": "opt_2", "text": "Complicado", "correct": true },
        { "id": "opt_3", "text": "Caro", "correct": false }
      ],
      "explanation": "IMPORTANTE rima com COMPLICADO (ambos terminam em -ADO)"
    },
    {
      "id": "ex_1_1_4",
      "pillar": 1,
      "lesson": 1,
      "exercise_num": 4,
      "type": "production",
      "title": "Grava Sua Rima",
      "description": "Grava uma frase que rima com o exemplo",
      "instructions": "Aperte REC, fale seu verso, aperte STOP",
      "difficulty": "easy",
      "time_limit_seconds": 120,
      "base_xp": 50,
      "bonus_xp": 30,
      "prompt": "Grava uma linha que rima com: 'Tenho nome, tenho ___'",
      "hint": "Rima com 'NOME' = -OME (FOME, TOMO, COMO)"
    },
    {
      "id": "ex_1_1_5",
      "pillar": 1,
      "lesson": 1,
      "exercise_num": 5,
      "type": "speed",
      "title": "Speed Challenge Rimas",
      "description": "Identifique 10 rimas rápido",
      "instructions": "Toque RIMA ou NÃO RIMA rapidamente",
      "difficulty": "medium",
      "time_limit_seconds": 60,
      "base_xp": 40,
      "bonus_xp": 30,
      "items": [
        { "word1": "CAR", "word2": "STAR", "correct": true },
        { "word1": "CAT", "word2": "DOG", "correct": false },
        { "word1": "PLAY", "word2": "DAY", "correct": true }
      ]
    }
  ]
}
```

**Estrutura completa:** Continue com mais 75 exercícios (25 por pillar)

### 3.2 Exercise Loader (`src/services/exerciseService.ts`)

```typescript
import exercisesData from '../data/exercises.json';

interface Exercise {
  id: string;
  pillar: number;
  lesson: number;
  exercise_num: number;
  type: 'listening' | 'matching' | 'fill_blank' | 'production' | 'speed' | 'sequencing' | 'rhythm' | 'comparison' | 'simulation' | 'freestyle';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  base_xp: number;
  bonus_xp: number;
  [key: string]: any;
}

export class ExerciseService {
  static exercises: Exercise[] = exercisesData.exercises;

  /**
   * Get exercício por ID
   */
  static getExerciseById(id: string): Exercise | null {
    return this.exercises.find(ex => ex.id === id) || null;
  }

  /**
   * Get exercícios por pillar
   */
  static getExercisesByPillar(pillar: number): Exercise[] {
    return this.exercises.filter(ex => ex.pillar === pillar);
  }

  /**
   * Get exercícios por lesson
   */
  static getExercisesByLesson(pillar: number, lesson: number): Exercise[] {
    return this.exercises.filter(ex => ex.pillar === pillar && ex.lesson === lesson);
  }

  /**
   * Get próximo exercício para user
   */
  static getNextExercise(userId: string, pillar: number): Exercise | null {
    // Buscar progresso do user no banco
    // Retornar próximo exercício não completado
    return this.exercises.find(
      ex => ex.pillar === pillar && ex.difficulty === 'easy'
    ) || null;
  }

  /**
   * Get exercícios por dificuldade
   */
  static getExercisesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Exercise[] {
    return this.exercises.filter(ex => ex.difficulty === difficulty);
  }

  /**
   * Valida resposta
   */
  static validateAnswer(exerciseId: string, userAnswer: any): {
    correct: boolean;
    score: number;
    explanation?: string;
  } {
    const exercise = this.getExerciseById(exerciseId);
    if (!exercise) return { correct: false, score: 0 };

    // Lógica por tipo de exercício
    switch (exercise.type) {
      case 'listening':
      case 'fill_blank':
        return {
          correct: userAnswer === exercise.options?.find((opt: any) => opt.correct)?.id,
          score: userAnswer === exercise.options?.find((opt: any) => opt.correct)?.id ? 100 : 0,
          explanation: exercise.explanation
        };

      case 'matching':
        // Verificar se todos os items estão no grupo correto
        let correct = true;
        let matchedCount = 0;
        for (const item of exercise.items) {
          if (userAnswer[item.id] === item.group) {
            matchedCount++;
          } else {
            correct = false;
          }
        }
        const score = Math.round((matchedCount / exercise.items.length) * 100);
        return { correct: matchedCount === exercise.items.length, score };

      case 'speed':
        // Não validar aqui - vai pra IA
        return { correct: true, score: 100 };

      default:
        return { correct: false, score: 0 };
    }
  }
}
```

### 3.3 Lesson Page (`src/pages/LessonPage.tsx`)

```tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ExerciseService } from '../services/exerciseService';
import { LessonHeader } from '../ui/components/learning/LessonHeader';
import { ExerciseCard } from '../ui/components/learning/ExerciseCard';
import { ExercisePlayer } from '../ui/components/learning/ExercisePlayer';

const LessonPage: React.FC = () => {
  const { pillar, lesson } = useParams<{ pillar: string; lesson: string }>();
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  useEffect(() => {
    if (pillar && lesson) {
      const exs = ExerciseService.getExercisesByLesson(
        parseInt(pillar),
        parseInt(lesson)
      );
      setExercises(exs);
    }
  }, [pillar, lesson]);

  return (
    <div className="container mx-auto p-6">
      {/* Lesson Header com teoria */}
      <LessonHeader
        pillar={parseInt(pillar!)}
        lesson={parseInt(lesson!)}
      />

      {/* Exercise list */}
      <div className="grid grid-cols-1 gap-4 mt-6 mb-6">
        {exercises.map((ex, idx) => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            index={idx + 1}
            onClick={() => setSelectedExercise(ex)}
          />
        ))}
      </div>

      {/* Exercise player quando selecionado */}
      {selectedExercise && (
        <ExercisePlayer
          exercise={selectedExercise}
          onComplete={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
};

export default LessonPage;
```

### 3.4 Exercise Player (`src/ui/components/learning/ExercisePlayer.tsx`)

Criar componente dinamicamente baseado em `exercise.type`:

```tsx
import React, { useState } from 'react';
import { ExerciseService } from '../../services/exerciseService';
import { XPService } from '../../services/xpService';
import { StreakService } from '../../services/streakService';

// Sub-components por tipo
import { ListeningExercise } from './exercises/ListeningExercise';
import { MatchingExercise } from './exercises/MatchingExercise';
import { FillBlankExercise } from './exercises/FillBlankExercise';
import { ProductionExercise } from './exercises/ProductionExercise';
import { SpeedExercise } from './exercises/SpeedExercise';

interface ExercisePlayerProps {
  exercise: any;
  onComplete: (result: any) => void;
}

export const ExercisePlayer: React.FC<ExercisePlayerProps> = ({
  exercise,
  onComplete
}) => {
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const userId = 'local_user';

  const handleSubmit = async () => {
    const validation = ExerciseService.validateAnswer(exercise.id, userAnswer);
    setResult({
      ...validation,
      exerciseId: exercise.id,
      userAnswer
    });
    setSubmitted(true);

    // Atualizar XP
    if (validation.correct) {
      const streakStatus = StreakService.checkStreak(userId);
      const multiplier = streakStatus.multiplier;

      const xpEvent = {
        type: 'exercise' as const,
        baseXP: exercise.base_xp + (validation.score > 80 ? exercise.bonus_xp : 0),
        multiplier,
        source: `ex_${exercise.id}`
      };

      await XPService.addXP(userId, xpEvent);
      StreakService.updateStreak(userId);
    }
  };

  // Renderizar exercício baseado no tipo
  const renderExercise = () => {
    switch (exercise.type) {
      case 'listening':
        return (
          <ListeningExercise
            exercise={exercise}
            onAnswer={setUserAnswer}
            submitted={submitted}
            result={result}
          />
        );
      case 'matching':
        return (
          <MatchingExercise
            exercise={exercise}
            onAnswer={setUserAnswer}
            submitted={submitted}
          />
        );
      case 'fill_blank':
        return (
          <FillBlankExercise
            exercise={exercise}
            onAnswer={setUserAnswer}
            submitted={submitted}
            result={result}
          />
        );
      case 'production':
        return (
          <ProductionExercise
            exercise={exercise}
            onAnswer={setUserAnswer}
            submitted={submitted}
            result={result}
          />
        );
      case 'speed':
        return (
          <SpeedExercise
            exercise={exercise}
            onAnswer={setUserAnswer}
            submitted={submitted}
            result={result}
          />
        );
      default:
        return <div>Exercício não suportado</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{exercise.title}</h2>
          <button
            onClick={() => onComplete(result)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Exercise */}
        <div className="mb-6">
          {renderExercise()}
        </div>

        {/* Controls */}
        {!submitted && (
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
          >
            ENVIAR RESPOSTA
          </button>
        )}

        {/* Results */}
        {submitted && result && (
          <div className={`
            p-4 rounded-lg text-center mb-4
            ${result.correct
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
            }
          `}>
            <p className="text-xl font-bold mb-2">
              {result.correct ? '✅ CORRETO!' : '❌ ERRADO'}
            </p>
            <p className="text-sm">Score: {result.score}/100</p>
            {result.explanation && (
              <p className="text-sm mt-2">{result.explanation}</p>
            )}
          </div>
        )}

        {submitted && (
          <button
            onClick={() => onComplete(result)}
            className="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
          >
            PRÓXIMO EXERCÍCIO
          </button>
        )}
      </div>
    </div>
  );
};
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Sprint 2 (Semana 1)
- [ ] Dia 1: XP Service + DB schema
- [ ] Dia 2: Level System calculado
- [ ] Dia 3: Streak System com multiplicadores
- [ ] Dia 4: Daily Challenge geração
- [ ] Dia 5: UI Components (5 componentes)
- [ ] Dia 6: Integração com Dashboard
- [ ] Dia 7: Testing + polish

### Sprint 3 (Semana 2)
- [ ] Dia 8: 80 exercícios estruturados em JSON
- [ ] Dia 9: Exercise Loader + categorização
- [ ] Dia 10: Lesson Pages (4 páginas)
- [ ] Dia 11: Exercise Player (framework)
- [ ] Dia 12: 5 Exercise Types implementados
- [ ] Dia 13: Results Page + AI scoring mock
- [ ] Dia 14: E2E testing + refinement

---

## 🎯 ENTREGÁVEIS FINAIS

Após os 2 sprints, você terá:

```
✅ Dashboard com:
   ├─ XP Bar com progress
   ├─ Level Badge (animado)
   ├─ Streak Indicator com multiplicador
   └─ Daily Challenge card

✅ 4 Lesson Pages com:
   ├─ Theory + examples
   ├─ 5 exercícios por lesson
   └─ Progress tracking

✅ 80 exercícios com:
   ├─ 10 tipos diferentes
   ├─ Validação automática
   ├─ XP rewards
   └─ Streak multiplicador

✅ Sistema de recompensas:
   ├─ XP automático por exercício
   ├─ Multiplicador por streak
   ├─ Bonus por >80% score
   └─ Level up detection

✅ Persistência local (SQLite):
   ├─ User progress
   ├─ XP history
   ├─ Daily challenge completion
   └─ Streak tracking
```

---

## 🚀 PRÓXIMOS PASSOS (Sprint 4)

Após Sprint 2+3 estar pronto:
- Integrar IA scoring (OpenAI/Claude)
- Production exercises (gravação de áudio)
- Duels vs IA
- Leaderboard
- Deploy para produção

---

**Status:** PRONTO PARA COMEÇAR 🚀
**Tempo total:** 14 dias
**Equipe:** 1 dev
**Stack:** React + Vite + SQLite
