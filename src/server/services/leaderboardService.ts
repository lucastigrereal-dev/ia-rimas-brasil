import { db } from '../../config/database'
import { cache } from '../../config/redis'
import type { Knex } from 'knex'

export interface LeaderboardEntry {
  rank: number
  user_id: number
  username: string
  avatar_url?: string
  total_xp: number
  current_level: number
  wins?: number
  battles?: number
  win_rate?: number
  total_score?: number
  followers_count: number
}

export interface BattleLeaderboardEntry {
  rank: number
  user_id: number
  username: string
  avatar_url?: string
  wins: number
  total_battles: number
  total_score: number
  win_rate: number
}

export interface ChallengeLeaderboardEntry {
  rank: number
  user_id: number
  username: string
  avatar_url?: string
  total_challenges: number
  best_score: number
  average_score: number
}

export class LeaderboardService {
  private db: Knex

  // Cache TTL in seconds
  private readonly CACHE_TTL = {
    overall: 3600,      // 1 hour
    battles: 3600,      // 1 hour
    challenges: 3600,   // 1 hour
    daily: 300,         // 5 minutes
    weekly: 1800,       // 30 minutes
    monthly: 7200       // 2 hours
  }

  constructor() {
    this.db = db
  }

  /**
   * Get overall leaderboard (XP + Level)
   */
  async getOverallLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    const cacheKey = `leaderboard:overall:${limit}`

    // Try cache first
    const cached = await cache.get<LeaderboardEntry[]>(cacheKey)
    if (cached) {
      return cached
    }

    // Query from database
    const results = await this.db('users as u')
      .select(
        'u.id as user_id',
        'u.username',
        'u.avatar_url',
        'us.total_xp',
        'us.current_level',
        'us.followers_count'
      )
      .join('user_stats as us', 'u.id', 'us.user_id')
      .orderBy('us.total_xp', 'desc')
      .orderBy('us.current_level', 'desc')
      .limit(limit) as any[]

    // Add ranks
    const withRanks = results.map((row, index) => ({
      ...row,
      rank: index + 1
    }))

    // Cache results
    await cache.set(cacheKey, withRanks, this.CACHE_TTL.overall)

    return withRanks
  }

  /**
   * Get battle leaderboard (wins + win rate)
   */
  async getBattleLeaderboard(limit: number = 50): Promise<BattleLeaderboardEntry[]> {
    const cacheKey = `leaderboard:battles:${limit}`

    // Try cache first
    const cached = await cache.get<BattleLeaderboardEntry[]>(cacheKey)
    if (cached) {
      return cached
    }

    // Query from database
    const results = await this.db('users as u')
      .select(
        'u.id as user_id',
        'u.username',
        'u.avatar_url',
        this.db.raw('COUNT(CASE WHEN b.winner_id = u.id THEN 1 END) as wins'),
        this.db.raw('COUNT(b.id) as total_battles'),
        this.db.raw('SUM(CASE WHEN b.player1_id = u.id THEN b.player1_score ELSE b.player2_score END) as total_score'),
        this.db.raw('ROUND(COUNT(CASE WHEN b.winner_id = u.id THEN 1 END) * 100.0 / COUNT(b.id), 2) as win_rate')
      )
      .leftJoin('battles as b', function() {
        this.on('u.id', '=', 'b.player1_id')
          .orOn('u.id', '=', 'b.player2_id')
      })
      .andWhere(function() {
        this.where('b.status', 'finished').orWhereNull('b.id')
      })
      .groupBy('u.id')
      .having(this.db.raw('COUNT(b.id) > 0'))
      .orderBy('wins', 'desc')
      .orderBy('win_rate', 'desc')
      .limit(limit) as any[]

    // Add ranks
    const withRanks = results.map((row, index) => ({
      ...row,
      rank: index + 1
    }))

    // Cache results
    await cache.set(cacheKey, withRanks, this.CACHE_TTL.battles)

    return withRanks
  }

  /**
   * Get challenge leaderboard (best + average scores)
   */
  async getChallengeLeaderboard(limit: number = 50): Promise<ChallengeLeaderboardEntry[]> {
    const cacheKey = `leaderboard:challenges:${limit}`

    // Try cache first
    const cached = await cache.get<ChallengeLeaderboardEntry[]>(cacheKey)
    if (cached) {
      return cached
    }

    // Query from database
    const results = await this.db('users as u')
      .select(
        'u.id as user_id',
        'u.username',
        'u.avatar_url',
        this.db.raw('COUNT(cs.id) as total_challenges'),
        this.db.raw('MAX(cs.score) as best_score'),
        this.db.raw('ROUND(AVG(cs.score), 2) as average_score')
      )
      .leftJoin('challenge_submissions as cs', 'u.id', 'cs.user_id')
      .groupBy('u.id')
      .having(this.db.raw('COUNT(cs.id) > 0'))
      .orderBy('best_score', 'desc')
      .orderBy('average_score', 'desc')
      .limit(limit) as any[]

    // Add ranks
    const withRanks = results.map((row, index) => ({
      ...row,
      rank: index + 1
    }))

    // Cache results
    await cache.set(cacheKey, withRanks, this.CACHE_TTL.challenges)

    return withRanks
  }

  /**
   * Get daily leaderboard (today's challenges)
   */
  async getDailyLeaderboard(limit: number = 50): Promise<ChallengeLeaderboardEntry[]> {
    const cacheKey = `leaderboard:daily:${limit}`

    // Try cache first
    const cached = await cache.get<ChallengeLeaderboardEntry[]>(cacheKey)
    if (cached) {
      return cached
    }

    const today = new Date().toISOString().split('T')[0]

    // Query from database
    const results = await this.db('users as u')
      .select(
        'u.id as user_id',
        'u.username',
        'u.avatar_url',
        this.db.raw('COUNT(cs.id) as total_challenges'),
        this.db.raw('MAX(cs.score) as best_score'),
        this.db.raw('ROUND(AVG(cs.score), 2) as average_score')
      )
      .leftJoin('challenge_submissions as cs', 'u.id', 'cs.user_id')
      .leftJoin('daily_challenges as dc', 'cs.challenge_id', 'dc.id')
      .where('dc.date', today)
      .groupBy('u.id')
      .having(this.db.raw('COUNT(cs.id) > 0'))
      .orderBy('best_score', 'desc')
      .orderBy('average_score', 'desc')
      .limit(limit) as any[]

    // Add ranks
    const withRanks = results.map((row, index) => ({
      ...row,
      rank: index + 1
    }))

    // Cache results
    await cache.set(cacheKey, withRanks, this.CACHE_TTL.daily)

    return withRanks
  }

  /**
   * Get XP leaderboard (only XP, no level)
   */
  async getXPLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    const cacheKey = `leaderboard:xp:${limit}`

    // Try cache first
    const cached = await cache.get<LeaderboardEntry[]>(cacheKey)
    if (cached) {
      return cached
    }

    // Query from database
    const results = await this.db('users as u')
      .select(
        'u.id as user_id',
        'u.username',
        'u.avatar_url',
        'us.total_xp',
        'us.current_level',
        'us.followers_count'
      )
      .join('user_stats as us', 'u.id', 'us.user_id')
      .orderBy('us.total_xp', 'desc')
      .limit(limit) as any[]

    // Add ranks
    const withRanks = results.map((row, index) => ({
      ...row,
      rank: index + 1
    }))

    // Cache results
    await cache.set(cacheKey, withRanks, this.CACHE_TTL.overall)

    return withRanks
  }

  /**
   * Get user ranking (where does this user rank)
   */
  async getUserRanking(userId: number): Promise<{ rank: number; percentile: number } | null> {
    const user = await this.db('users as u')
      .select('us.total_xp')
      .join('user_stats as us', 'u.id', 'us.user_id')
      .where('u.id', userId)
      .first() as any

    if (!user) return null

    // Count users with more XP
    const betterCount = await this.db('user_stats')
      .count('id', { as: 'count' })
      .where('total_xp', '>', user.total_xp)
      .first() as { count: number }

    // Total users
    const totalCount = await this.db('user_stats')
      .count('id', { as: 'count' })
      .first() as { count: number }

    const rank = (betterCount.count || 0) + 1
    const percentile = Math.round((rank / totalCount.count) * 100)

    return { rank, percentile }
  }

  /**
   * Invalidate all leaderboard caches
   */
  async invalidateAllCaches(): Promise<void> {
    const keys = [
      'leaderboard:overall:*',
      'leaderboard:battles:*',
      'leaderboard:challenges:*',
      'leaderboard:daily:*',
      'leaderboard:xp:*'
    ]

    for (const pattern of keys) {
      const matchedKeys = await this.db.raw(`SELECT * FROM redis WHERE key LIKE ?`, [pattern])
      if (matchedKeys) {
        await cache.delete(pattern)
      }
    }
  }

  /**
   * Invalidate specific leaderboard cache
   */
  async invalidateLeaderboard(type: 'overall' | 'battles' | 'challenges' | 'daily' | 'xp'): Promise<void> {
    // Delete all cache keys with this prefix
    const prefix = `leaderboard:${type}:`
    const cacheKeys = [
      `${prefix}10`,
      `${prefix}50`,
      `${prefix}100`,
      `${prefix}200`
    ]
    await cache.deleteMany(cacheKeys)
  }

  /**
   * Get trending users (most followers gained this week)
   */
  async getTrendingUsers(limit: number = 20): Promise<any[]> {
    const cacheKey = `leaderboard:trending:${limit}`

    // Try cache first
    const cached = await cache.get<any[]>(cacheKey)
    if (cached) {
      return cached
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Query from database
    const results = await this.db('users as u')
      .select(
        'u.id as user_id',
        'u.username',
        'u.avatar_url',
        'us.followers_count',
        this.db.raw('COUNT(DISTINCT f.id) as new_followers')
      )
      .join('user_stats as us', 'u.id', 'us.user_id')
      .leftJoin('follows as f', function() {
        this.on('u.id', '=', 'f.following_id')
      })
      .whereRaw('f.created_at > ? OR f.id IS NULL', [weekAgo])
      .groupBy('u.id')
      .orderBy('new_followers', 'desc')
      .limit(limit) as any[]

    // Add ranks
    const withRanks = results.map((row, index) => ({
      ...row,
      rank: index + 1
    }))

    // Cache results
    await cache.set(cacheKey, withRanks, this.CACHE_TTL.daily)

    return withRanks
  }
}

// Singleton
let leaderboardService: LeaderboardService | null = null

export function getLeaderboardService(): LeaderboardService {
  if (!leaderboardService) {
    leaderboardService = new LeaderboardService()
  }
  return leaderboardService
}
