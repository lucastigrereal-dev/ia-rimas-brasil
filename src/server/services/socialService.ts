import { db } from '../../config/database'
import { cache } from '../../config/redis'
import { getUserService } from './userService'
import type { Knex } from 'knex'

export interface UserProfile {
  id: number
  username: string
  email: string
  avatar_url?: string
  bio?: string
  is_verified: boolean
  is_premium: boolean
  created_at: string
}

export interface SocialConnection {
  user_id: number
  username: string
  avatar_url?: string
  followers_count: number
  is_following: boolean
  is_follower: boolean
  mutual: boolean
}

export interface SocialGraph {
  user: UserProfile & { followers_count: number; following_count: number }
  followers: SocialConnection[]
  following: SocialConnection[]
  mutual_connections: SocialConnection[]
  suggested_users: SocialConnection[]
}

export interface UserSuggestion {
  user_id: number
  username: string
  avatar_url?: string
  followers_count: number
  mutual_followers: number
  relevance_score: number
}

export class SocialService {
  private db: Knex
  private userService = getUserService()

  constructor() {
    this.db = db
  }

  /**
   * Get full social graph for a user
   */
  async getSocialGraph(userId: number): Promise<SocialGraph | null> {
    const cacheKey = `social:graph:${userId}`

    // Try cache first
    const cached = await cache.get<SocialGraph>(cacheKey)
    if (cached) {
      return cached
    }

    const user = await this.userService.getProfile(userId)
    if (!user) return null

    const stats = await this.userService.getStats(userId)
    const followers = await this.getFollowersWithStatus(userId, userId)
    const following = await this.getFollowingWithStatus(userId, userId)
    const mutualConnections = await this.getMutualConnections(userId)
    const suggestedUsersData = await this.suggestUsers(userId, 10)
    const suggestedUsers = suggestedUsersData.map(u => ({
      user_id: u.user_id,
      username: u.username,
      avatar_url: u.avatar_url,
      followers_count: u.followers_count,
      is_following: false,
      is_follower: false,
      mutual: false
    }))

    const graph: SocialGraph = {
      user: {
        ...user,
        followers_count: stats?.followers_count || 0,
        following_count: stats?.following_count || 0
      },
      followers,
      following,
      mutual_connections: mutualConnections,
      suggested_users: suggestedUsers
    }

    // Cache for 5 minutes
    await cache.set(cacheKey, graph, 300)

    return graph
  }

  /**
   * Get followers with relationship status (for another user's perspective)
   */
  async getFollowersWithStatus(userId: number, currentUserId: number): Promise<SocialConnection[]> {
    return this.db('users as u')
      .select(
        'u.id as user_id',
        'u.username',
        'u.avatar_url',
        'us.followers_count',
        this.db.raw('EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id) as is_following', [currentUserId]),
        this.db.raw('EXISTS(SELECT 1 FROM follows WHERE follower_id = u.id AND following_id = ?) as is_follower', [currentUserId]),
        this.db.raw('CASE WHEN EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id) AND EXISTS(SELECT 1 FROM follows WHERE follower_id = u.id AND following_id = ?) THEN true ELSE false END as mutual', [currentUserId, currentUserId])
      )
      .leftJoin('user_stats as us', 'u.id', 'us.user_id')
      .whereIn('u.id', this.db('follows')
        .select('follower_id')
        .where('following_id', userId)
      )
      .limit(100) as Promise<SocialConnection[]>
  }

  /**
   * Get following with relationship status (for another user's perspective)
   */
  async getFollowingWithStatus(userId: number, currentUserId: number): Promise<SocialConnection[]> {
    return this.db('users as u')
      .select(
        'u.id as user_id',
        'u.username',
        'u.avatar_url',
        'us.followers_count',
        this.db.raw('EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id) as is_following', [currentUserId]),
        this.db.raw('EXISTS(SELECT 1 FROM follows WHERE follower_id = u.id AND following_id = ?) as is_follower', [currentUserId]),
        this.db.raw('CASE WHEN EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id) AND EXISTS(SELECT 1 FROM follows WHERE follower_id = u.id AND following_id = ?) THEN true ELSE false END as mutual', [currentUserId, currentUserId])
      )
      .leftJoin('user_stats as us', 'u.id', 'us.user_id')
      .whereIn('u.id', this.db('follows')
        .select('following_id')
        .where('follower_id', userId)
      )
      .limit(100) as Promise<SocialConnection[]>
  }

  /**
   * Get mutual connections (following each other)
   */
  async getMutualConnections(userId: number): Promise<SocialConnection[]> {
    return this.db('users as u')
      .select(
        'u.id as user_id',
        'u.username',
        'u.avatar_url',
        'us.followers_count',
        this.db.raw('true as is_following'),
        this.db.raw('true as is_follower'),
        this.db.raw('true as mutual')
      )
      .leftJoin('user_stats as us', 'u.id', 'us.user_id')
      .whereIn('u.id', this.db('follows as f1')
        .select('f1.following_id')
        .where('f1.follower_id', userId)
        .whereIn('f1.following_id', this.db('follows as f2')
          .select('f2.follower_id')
          .where('f2.following_id', userId)
        )
      )
      .limit(100) as Promise<SocialConnection[]>
  }

  /**
   * Suggest users to follow (collaborative filtering)
   */
  async suggestUsers(userId: number, limit: number = 20): Promise<UserSuggestion[]> {
    const cacheKey = `social:suggestions:${userId}`

    // Try cache first
    const cached = await cache.get<UserSuggestion[]>(cacheKey)
    if (cached) {
      return cached
    }

    // Get users I'm already following
    const followingIds = (await this.db('follows')
      .select('following_id')
      .where('follower_id', userId)).map(f => f.following_id)

    if (followingIds.length === 0) {
      return [] // No one to suggest if not following anyone
    }

    // Get users followed by people I follow
    const suggestions = (await this.db('users as u')
      .select(
        'u.id as user_id',
        'u.username',
        'u.avatar_url',
        'us.followers_count'
      )
      .leftJoin('user_stats as us', 'u.id', 'us.user_id')
      .whereIn('u.id', this.db('follows')
        .select('following_id')
        .whereIn('follower_id', followingIds)
      )
      .where('u.id', '!=', userId)
      .whereNotIn('u.id', followingIds)
      .limit(limit * 2) as any[])
      .map(u => ({
        ...u,
        mutual_followers: 1, // Simplified
        relevance_score: Math.round(u.followers_count / 10)
      }))
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, limit)

    // Convert to proper type
    const converted = suggestions.map(s => ({
      user_id: s.user_id,
      username: s.username,
      avatar_url: s.avatar_url,
      followers_count: s.followers_count || 0,
      mutual_followers: s.mutual_followers || 0,
      relevance_score: Math.round(s.relevance_score * 100) / 100
    }))

    // Cache for 1 hour
    await cache.set(cacheKey, converted, 3600)

    return converted
  }

  /**
   * Get common followers between two users
   */
  async getCommonFollowers(userId1: number, userId2: number): Promise<UserProfile[]> {
    // Get followers of user1
    const followers1 = await this.db('follows as f1')
      .select('f1.follower_id')
      .where('f1.following_id', userId1)

    // Get followers of user2
    const followers2 = await this.db('follows as f2')
      .select('f2.follower_id')
      .where('f2.following_id', userId2)

    // Find common
    const follower1Ids = followers1.map(f => f.follower_id)
    const follower2Ids = followers2.map(f => f.follower_id)
    const commonIds = follower1Ids.filter(id => follower2Ids.includes(id))

    if (commonIds.length === 0) {
      return []
    }

    return this.db('users as u')
      .select(
        'u.id',
        'u.email',
        'u.username',
        'u.avatar_url',
        'u.bio',
        'u.is_verified',
        'u.is_premium',
        'u.created_at',
        'u.updated_at'
      )
      .whereIn('u.id', commonIds) as Promise<UserProfile[]>
  }

  /**
   * Get connection strength score (0-100)
   */
  async getConnectionStrength(userId1: number, userId2: number): Promise<number> {
    const mutual = await this.db('follows as f1')
      .count('f1.id', { as: 'count' })
      .where('f1.follower_id', userId1)
      .andWhere('f1.following_id', userId2)
      .whereExists(this.db('follows as f2')
        .select('f2.id')
        .where('f2.follower_id', userId2)
        .andWhere('f2.following_id', userId1)
      )
      .first() as { count: number }

    const commonFollowers = await this.db('follows as f1')
      .count('f1.id', { as: 'count' })
      .where('f1.following_id', userId1)
      .whereIn('f1.follower_id', this.db('follows')
        .select('follower_id')
        .where('following_id', userId2)
      )
      .first() as { count: number }

    // Calculate strength score
    // Mutual connection: 50 points
    // Each common follower: 1 point (up to 50)
    let score = mutual.count > 0 ? 50 : 0
    score += Math.min(commonFollowers.count || 0, 50)

    return Math.min(score, 100)
  }

  /**
   * Get user's social stats
   */
  async getUserSocialStats(userId: number): Promise<any> {
    const stats = await this.db('user_stats')
      .select('followers_count', 'following_count')
      .where('user_id', userId)
      .first() as any

    if (!stats) return null

    const followerData = await this.db('follows')
      .count('id', { as: 'followers' })
      .where('following_id', userId)
      .first() as { followers: number }

    const followingData = await this.db('follows')
      .count('id', { as: 'following' })
      .where('follower_id', userId)
      .first() as { following: number }

    const mutualData = await this.db.raw(`
      SELECT COUNT(*) as count FROM follows f1
      WHERE f1.follower_id = ? AND EXISTS(
        SELECT 1 FROM follows f2 WHERE f2.follower_id = ? AND f2.following_id = f1.following_id
      )
    `, [userId, userId]) as any[]

    return {
      followers: followerData.followers || 0,
      following: followingData.following || 0,
      mutual_connections: (mutualData[0]?.count || 0),
      engagement_ratio: followingData.following > 0 ? ((followerData.followers || 0) / followingData.following) : 0
    }
  }

  /**
   * Get trending creators (gaining followers quickly)
   */
  async getTrendingCreators(limit: number = 20): Promise<any[]> {
    const cacheKey = `social:trending:${limit}`

    // Try cache first
    const cached = await cache.get<any[]>(cacheKey)
    if (cached) {
      return cached
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const creators = await this.db('users as u')
      .select(
        'u.id as user_id',
        'u.username',
        'u.avatar_url',
        'us.followers_count',
        this.db.raw('COUNT(DISTINCT f.id) as new_followers_week')
      )
      .leftJoin('user_stats as us', 'u.id', 'us.user_id')
      .leftJoin('follows as f', function() {
        this.on('u.id', '=', 'f.following_id')
      })
      .whereRaw('f.created_at > ? OR f.id IS NULL', [sevenDaysAgo])
      .groupBy('u.id')
      .orderBy('new_followers_week', 'desc')
      .limit(limit) as any[]

    // Convert to proper type
    const converted = creators.map((c, index) => ({
      rank: index + 1,
      ...c
    }))

    // Cache for 1 hour
    await cache.set(cacheKey, converted, 3600)

    return converted
  }

  /**
   * Invalidate social caches for a user
   */
  async invalidateSocialCaches(userId: number): Promise<void> {
    const keys = [
      `social:graph:${userId}`,
      `social:suggestions:${userId}`
    ]
    await cache.deleteMany(keys)
  }

  /**
   * Invalidate social caches for two users (when they follow/unfollow)
   */
  async invalidateFollowCaches(userId1: number, userId2: number): Promise<void> {
    await this.invalidateSocialCaches(userId1)
    await this.invalidateSocialCaches(userId2)
    // Also invalidate trending caches
    const trendingKeys = [
      'social:trending:10',
      'social:trending:20',
      'social:trending:50'
    ]
    await cache.deleteMany(trendingKeys)
  }
}

// Singleton
let socialService: SocialService | null = null

export function getSocialService(): SocialService {
  if (!socialService) {
    socialService = new SocialService()
  }
  return socialService
}
