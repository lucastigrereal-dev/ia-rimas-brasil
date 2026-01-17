import { db } from '../../config/database'
import { cache } from '../../config/redis'
import { getGamificationService } from './gamificationService'
import type { Knex } from 'knex'

export interface Achievement {
  id: number
  code: string
  name: string
  description: string
  xp_reward: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon_url?: string
  requirement_type?: string
  requirement_value?: number
  created_at: string
}

export interface UserAchievement {
  id: number
  user_id: number
  achievement_id: number
  achievement?: Achievement
  unlocked_at: string
}

export interface AchievementProgress {
  achievement: Achievement
  progress: number
  requirement: number
  unlocked: boolean
  unlocked_at?: string
}

export const ACHIEVEMENT_DEFINITIONS = {
  // Rima/Verse Achievements
  FIRST_RIMA: {
    code: 'FIRST_RIMA',
    name: 'Primeira Rima',
    description: 'Complete a primeira rima.',
    xp_reward: 50,
    rarity: 'common' as const
  },
  TEN_RIMAS: {
    code: 'TEN_RIMAS',
    name: 'Rimador',
    description: 'Complete 10 rimas.',
    xp_reward: 200,
    rarity: 'rare' as const
  },
  HUNDRED_RIMAS: {
    code: 'HUNDRED_RIMAS',
    name: 'Mestre das Rimas',
    description: 'Complete 100 rimas.',
    xp_reward: 500,
    rarity: 'epic' as const
  },

  // Battle Achievements
  FIRST_BATTLE: {
    code: 'FIRST_BATTLE',
    name: 'Guerreiro Iniciante',
    description: 'Vença a primeira batalha.',
    xp_reward: 100,
    rarity: 'common' as const
  },
  BATTLE_STREAK_5: {
    code: 'BATTLE_STREAK_5',
    name: 'Invencível',
    description: 'Ganhe 5 batalhas seguidas.',
    xp_reward: 300,
    rarity: 'rare' as const
  },
  BATTLE_STREAK_10: {
    code: 'BATTLE_STREAK_10',
    name: 'Lenda das Batalhas',
    description: 'Ganhe 10 batalhas seguidas.',
    xp_reward: 500,
    rarity: 'epic' as const
  },
  HUNDRED_BATTLES: {
    code: 'HUNDRED_BATTLES',
    name: 'Veterano',
    description: 'Participe de 100 batalhas.',
    xp_reward: 400,
    rarity: 'epic' as const
  },

  // Level Achievements
  LEVEL_5: {
    code: 'LEVEL_5',
    name: 'Iniciado',
    description: 'Alcance nível 5.',
    xp_reward: 150,
    rarity: 'common' as const
  },
  LEVEL_10: {
    code: 'LEVEL_10',
    name: 'Veterano',
    description: 'Alcance nível 10.',
    xp_reward: 300,
    rarity: 'rare' as const
  },
  LEVEL_20: {
    code: 'LEVEL_20',
    name: 'Mestre',
    description: 'Alcance nível 20.',
    xp_reward: 500,
    rarity: 'epic' as const
  },
  LEVEL_50: {
    code: 'LEVEL_50',
    name: 'Lendário',
    description: 'Alcance nível 50.',
    xp_reward: 1000,
    rarity: 'legendary' as const
  },

  // Social Achievements
  FIRST_FOLLOWER: {
    code: 'FIRST_FOLLOWER',
    name: 'Influenciador',
    description: 'Ganhe o primeiro seguidor.',
    xp_reward: 50,
    rarity: 'common' as const
  },
  HUNDRED_FOLLOWERS: {
    code: 'HUNDRED_FOLLOWERS',
    name: 'Celebridade Local',
    description: 'Alcance 100 seguidores.',
    xp_reward: 400,
    rarity: 'epic' as const
  },
  THOUSAND_FOLLOWERS: {
    code: 'THOUSAND_FOLLOWERS',
    name: 'Superestrela',
    description: 'Alcance 1000 seguidores.',
    xp_reward: 800,
    rarity: 'legendary' as const
  },

  // Challenge Achievements
  DAILY_CHALLENGE: {
    code: 'DAILY_CHALLENGE',
    name: 'Desafio Diário',
    description: 'Complete um desafio diário.',
    xp_reward: 100,
    rarity: 'common' as const
  },
  WEEK_STREAK: {
    code: 'WEEK_STREAK',
    name: 'Consistente',
    description: 'Complete desafios por 7 dias seguidos.',
    xp_reward: 250,
    rarity: 'rare' as const
  },
  MONTH_STREAK: {
    code: 'MONTH_STREAK',
    name: 'Monge das Rimas',
    description: 'Complete desafios por 30 dias seguidos.',
    xp_reward: 500,
    rarity: 'epic' as const
  },

  // Score Achievements
  PERFECT_SCORE: {
    code: 'PERFECT_SCORE',
    name: 'Perfeição',
    description: 'Alcance score perfeito (100) em um desafio.',
    xp_reward: 300,
    rarity: 'rare' as const
  }
}

export class AchievementService {
  private db: Knex
  private gamificationService = getGamificationService()

  constructor() {
    this.db = db
  }

  /**
   * Get all available achievements
   */
  async getAllAchievements(): Promise<Achievement[]> {
    const cacheKey = 'achievements:all'

    // Try cache first
    const cached = await cache.get<Achievement[]>(cacheKey)
    if (cached) {
      return cached
    }

    const achievements = await this.db('achievements')
      .select('*')
      .orderBy('rarity', 'asc')
      .orderBy('created_at', 'asc') as Achievement[]

    await cache.set(cacheKey, achievements, 3600)
    return achievements
  }

  /**
   * Get user's unlocked achievements
   */
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return this.db('user_achievements as ua')
      .select('ua.*', 'a.*')
      .join('achievements as a', 'ua.achievement_id', 'a.id')
      .where('ua.user_id', userId)
      .orderBy('ua.unlocked_at', 'desc') as Promise<UserAchievement[]>
  }

  /**
   * Get user's achievement progress
   */
  async getUserAchievementProgress(userId: number): Promise<AchievementProgress[]> {
    const allAchievements = await this.getAllAchievements()
    const unlockedAchievements = await this.getUserAchievements(userId)
    const unlockedCodes = new Set(unlockedAchievements.map(ua => ua.achievement?.code))

    const userStats = await this.db('user_stats')
      .select('*')
      .where('user_id', userId)
      .first() as any

    const progress: AchievementProgress[] = []

    for (const achievement of allAchievements) {
      const unlocked = unlockedCodes.has(achievement.code)
      let progressValue = 0
      let requirement = 1

      if (!unlocked) {
        // Calculate progress for locked achievements
        switch (achievement.code) {
          case 'TEN_RIMAS':
            progressValue = Math.min(userStats?.verses_created || 0, 10)
            requirement = 10
            break
          case 'HUNDRED_RIMAS':
            progressValue = Math.min(userStats?.verses_created || 0, 100)
            requirement = 100
            break
          case 'BATTLE_STREAK_5':
            progressValue = Math.min(userStats?.max_battle_streak || 0, 5)
            requirement = 5
            break
          case 'BATTLE_STREAK_10':
            progressValue = Math.min(userStats?.max_battle_streak || 0, 10)
            requirement = 10
            break
          case 'HUNDRED_BATTLES':
            progressValue = Math.min(userStats?.battles_participated || 0, 100)
            requirement = 100
            break
          case 'LEVEL_5':
            progressValue = Math.min(userStats?.current_level || 0, 5)
            requirement = 5
            break
          case 'LEVEL_10':
            progressValue = Math.min(userStats?.current_level || 0, 10)
            requirement = 10
            break
          case 'LEVEL_20':
            progressValue = Math.min(userStats?.current_level || 0, 20)
            requirement = 20
            break
          case 'LEVEL_50':
            progressValue = Math.min(userStats?.current_level || 0, 50)
            requirement = 50
            break
          case 'HUNDRED_FOLLOWERS':
            progressValue = Math.min(userStats?.followers_count || 0, 100)
            requirement = 100
            break
          case 'THOUSAND_FOLLOWERS':
            progressValue = Math.min(userStats?.followers_count || 0, 1000)
            requirement = 1000
            break
          case 'MONTH_STREAK':
            progressValue = Math.min(userStats?.current_challenge_streak || 0, 30)
            requirement = 30
            break
          default:
            progressValue = unlocked ? 1 : 0
            requirement = 1
        }
      } else {
        progressValue = requirement
      }

      progress.push({
        achievement,
        progress: progressValue,
        requirement,
        unlocked,
        unlocked_at: unlockedAchievements.find(ua => ua.achievement?.code === achievement.code)?.unlocked_at
      })
    }

    return progress
  }

  /**
   * Unlock achievement for user
   */
  async unlockAchievement(userId: number, achievementCode: string): Promise<UserAchievement | null> {
    const achievement = await this.db('achievements')
      .select('*')
      .where('code', achievementCode)
      .first() as Achievement | undefined

    if (!achievement) {
      return null
    }

    // Check if already unlocked
    const existing = await this.db('user_achievements')
      .select('*')
      .where('user_id', userId)
      .andWhere('achievement_id', achievement.id)
      .first()

    if (existing) {
      return existing as UserAchievement
    }

    // Unlock achievement
    const result = await this.db('user_achievements').insert({
      user_id: userId,
      achievement_id: achievement.id,
      unlocked_at: this.db.fn.now()
    }).returning('*')

    // Award XP
    if (achievement.xp_reward) {
      await this.gamificationService.addXP(userId, achievement.xp_reward, 'achievement_unlock')
    }

    return result[0] as UserAchievement
  }

  /**
   * Check and auto-unlock achievements for user based on criteria
   */
  async checkAndUnlockAchievements(userId: number): Promise<string[]> {
    const unlockedCodes: string[] = []
    const userStats = await this.db('user_stats')
      .select('*')
      .where('user_id', userId)
      .first() as any

    // Check level achievements
    if (userStats?.current_level >= 5) {
      const result = await this.unlockAchievement(userId, 'LEVEL_5')
      if (result) unlockedCodes.push('LEVEL_5')
    }
    if (userStats?.current_level >= 10) {
      const result = await this.unlockAchievement(userId, 'LEVEL_10')
      if (result) unlockedCodes.push('LEVEL_10')
    }
    if (userStats?.current_level >= 20) {
      const result = await this.unlockAchievement(userId, 'LEVEL_20')
      if (result) unlockedCodes.push('LEVEL_20')
    }
    if (userStats?.current_level >= 50) {
      const result = await this.unlockAchievement(userId, 'LEVEL_50')
      if (result) unlockedCodes.push('LEVEL_50')
    }

    // Check challenge achievements
    if (userStats?.verses_created >= 1) {
      const result = await this.unlockAchievement(userId, 'FIRST_RIMA')
      if (result) unlockedCodes.push('FIRST_RIMA')
    }
    if (userStats?.verses_created >= 10) {
      const result = await this.unlockAchievement(userId, 'TEN_RIMAS')
      if (result) unlockedCodes.push('TEN_RIMAS')
    }
    if (userStats?.verses_created >= 100) {
      const result = await this.unlockAchievement(userId, 'HUNDRED_RIMAS')
      if (result) unlockedCodes.push('HUNDRED_RIMAS')
    }

    // Check battle achievements
    if (userStats?.battles_won >= 1) {
      const result = await this.unlockAchievement(userId, 'FIRST_BATTLE')
      if (result) unlockedCodes.push('FIRST_BATTLE')
    }
    if (userStats?.max_battle_streak >= 5) {
      const result = await this.unlockAchievement(userId, 'BATTLE_STREAK_5')
      if (result) unlockedCodes.push('BATTLE_STREAK_5')
    }
    if (userStats?.max_battle_streak >= 10) {
      const result = await this.unlockAchievement(userId, 'BATTLE_STREAK_10')
      if (result) unlockedCodes.push('BATTLE_STREAK_10')
    }
    if (userStats?.battles_participated >= 100) {
      const result = await this.unlockAchievement(userId, 'HUNDRED_BATTLES')
      if (result) unlockedCodes.push('HUNDRED_BATTLES')
    }

    // Check social achievements
    if (userStats?.followers_count >= 1) {
      const result = await this.unlockAchievement(userId, 'FIRST_FOLLOWER')
      if (result) unlockedCodes.push('FIRST_FOLLOWER')
    }
    if (userStats?.followers_count >= 100) {
      const result = await this.unlockAchievement(userId, 'HUNDRED_FOLLOWERS')
      if (result) unlockedCodes.push('HUNDRED_FOLLOWERS')
    }
    if (userStats?.followers_count >= 1000) {
      const result = await this.unlockAchievement(userId, 'THOUSAND_FOLLOWERS')
      if (result) unlockedCodes.push('THOUSAND_FOLLOWERS')
    }

    // Check streak achievements
    if (userStats?.daily_challenges_completed >= 1) {
      const result = await this.unlockAchievement(userId, 'DAILY_CHALLENGE')
      if (result) unlockedCodes.push('DAILY_CHALLENGE')
    }
    if (userStats?.current_challenge_streak >= 7) {
      const result = await this.unlockAchievement(userId, 'WEEK_STREAK')
      if (result) unlockedCodes.push('WEEK_STREAK')
    }
    if (userStats?.current_challenge_streak >= 30) {
      const result = await this.unlockAchievement(userId, 'MONTH_STREAK')
      if (result) unlockedCodes.push('MONTH_STREAK')
    }

    return unlockedCodes
  }

  /**
   * Get achievement by code
   */
  async getAchievementByCode(code: string): Promise<Achievement | null> {
    return this.db('achievements')
      .select('*')
      .where('code', code)
      .first() as Promise<Achievement | null>
  }

  /**
   * Get achievement stats (how many users have unlocked)
   */
  async getAchievementStats(achievementId: number): Promise<{ unlocked_by: number; unlock_rate: number } | null> {
    const achievement = await this.db('achievements')
      .select('*')
      .where('id', achievementId)
      .first()

    if (!achievement) return null

    const unlockedCount = await this.db('user_achievements')
      .count('id', { as: 'count' })
      .where('achievement_id', achievementId)
      .first() as { count: number }

    const totalUsers = await this.db('users')
      .count('id', { as: 'count' })
      .first() as { count: number }

    const unlockRate = totalUsers.count > 0 ? (unlockedCount.count / totalUsers.count) * 100 : 0

    return {
      unlocked_by: unlockedCount.count,
      unlock_rate: Math.round(unlockRate * 100) / 100
    }
  }
}

// Singleton
let achievementService: AchievementService | null = null

export function getAchievementService(): AchievementService {
  if (!achievementService) {
    achievementService = new AchievementService()
  }
  return achievementService
}
