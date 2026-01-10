/**
 * @fileoverview Sistema de Conquistas (Badges)
 * @module data/badges
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'drills' | 'xp' | 'skill' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: BadgeRequirement;
  xpReward: number;
}

export interface BadgeRequirement {
  type: 'streak' | 'drills_completed' | 'xp_total' | 'perfect_score' | 'category_mastery' | 'level' | 'special';
  value: number;
  category?: string;
}

/**
 * Todos os badges disponíveis
 */
export const badges: Badge[] = [
  // ==================== STREAK BADGES ====================
  {
    id: 'streak-3',
    name: 'Fogo Aceso',
    description: '3 dias seguidos treinando',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    requirement: { type: 'streak', value: 3 },
    xpReward: 50,
  },
  {
    id: 'streak-7',
    name: 'Semana On Fire',
    description: '7 dias de streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    requirement: { type: 'streak', value: 7 },
    xpReward: 100,
  },
  {
    id: 'streak-30',
    name: 'Mês Dedicado',
    description: '30 dias consecutivos',
    icon: '⭐',
    category: 'streak',
    rarity: 'rare',
    requirement: { type: 'streak', value: 30 },
    xpReward: 300,
  },
  {
    id: 'streak-100',
    name: 'Centenário',
    description: '100 dias de streak!',
    icon: '💯',
    category: 'streak',
    rarity: 'epic',
    requirement: { type: 'streak', value: 100 },
    xpReward: 1000,
  },
  {
    id: 'streak-365',
    name: 'Lendário',
    description: '1 ano treinando todo dia',
    icon: '👑',
    category: 'streak',
    rarity: 'legendary',
    requirement: { type: 'streak', value: 365 },
    xpReward: 5000,
  },

  // ==================== DRILLS BADGES ====================
  {
    id: 'first-drill',
    name: 'Primeiro Drill',
    description: 'Complete seu primeiro drill',
    icon: '🎯',
    category: 'drills',
    rarity: 'common',
    requirement: { type: 'drills_completed', value: 1 },
    xpReward: 25,
  },
  {
    id: 'drills-10',
    name: 'Aquecendo',
    description: 'Complete 10 drills',
    icon: '🏃',
    category: 'drills',
    rarity: 'common',
    requirement: { type: 'drills_completed', value: 10 },
    xpReward: 75,
  },
  {
    id: 'drills-50',
    name: 'Em Forma',
    description: 'Complete 50 drills',
    icon: '💪',
    category: 'drills',
    rarity: 'rare',
    requirement: { type: 'drills_completed', value: 50 },
    xpReward: 200,
  },
  {
    id: 'drills-100',
    name: 'Máquina de Rimas',
    description: 'Complete 100 drills',
    icon: '🤖',
    category: 'drills',
    rarity: 'epic',
    requirement: { type: 'drills_completed', value: 100 },
    xpReward: 500,
  },
  {
    id: 'drills-500',
    name: 'Veterano',
    description: 'Complete 500 drills',
    icon: '🎖️',
    category: 'drills',
    rarity: 'legendary',
    requirement: { type: 'drills_completed', value: 500 },
    xpReward: 2000,
  },

  // ==================== XP BADGES ====================
  {
    id: 'xp-1000',
    name: 'Mil XP',
    description: 'Acumule 1.000 XP',
    icon: '⚡',
    category: 'xp',
    rarity: 'common',
    requirement: { type: 'xp_total', value: 1000 },
    xpReward: 50,
  },
  {
    id: 'xp-10000',
    name: 'Dez Mil',
    description: 'Acumule 10.000 XP',
    icon: '⚡',
    category: 'xp',
    rarity: 'rare',
    requirement: { type: 'xp_total', value: 10000 },
    xpReward: 250,
  },
  {
    id: 'xp-50000',
    name: 'Cinquenta K',
    description: 'Acumule 50.000 XP',
    icon: '💎',
    category: 'xp',
    rarity: 'epic',
    requirement: { type: 'xp_total', value: 50000 },
    xpReward: 750,
  },
  {
    id: 'xp-100000',
    name: 'Cem Mil',
    description: 'Acumule 100.000 XP',
    icon: '👑',
    category: 'xp',
    rarity: 'legendary',
    requirement: { type: 'xp_total', value: 100000 },
    xpReward: 2500,
  },

  // ==================== SKILL BADGES ====================
  {
    id: 'perfect-score',
    name: 'Perfeição',
    description: '100% em um drill',
    icon: '💎',
    category: 'skill',
    rarity: 'rare',
    requirement: { type: 'perfect_score', value: 1 },
    xpReward: 150,
  },
  {
    id: 'perfect-10',
    name: 'Perfeccionista',
    description: '10 drills com 100%',
    icon: '🌟',
    category: 'skill',
    rarity: 'epic',
    requirement: { type: 'perfect_score', value: 10 },
    xpReward: 500,
  },
  {
    id: 'rimas-master',
    name: 'Mestre das Rimas',
    description: 'Complete todos os drills de rimas',
    icon: '🎵',
    category: 'skill',
    rarity: 'epic',
    requirement: { type: 'category_mastery', value: 5, category: 'rimas' },
    xpReward: 400,
  },
  {
    id: 'flow-master',
    name: 'Mestre do Flow',
    description: 'Complete todos os drills de flow',
    icon: '🌊',
    category: 'skill',
    rarity: 'epic',
    requirement: { type: 'category_mastery', value: 5, category: 'flow' },
    xpReward: 400,
  },
  {
    id: 'punch-master',
    name: 'Mestre das Punchlines',
    description: 'Complete todos os drills de punchline',
    icon: '👊',
    category: 'skill',
    rarity: 'epic',
    requirement: { type: 'category_mastery', value: 5, category: 'punchline' },
    xpReward: 400,
  },
  {
    id: 'battle-master',
    name: 'Mestre das Batalhas',
    description: 'Complete todos os drills de batalha',
    icon: '⚔️',
    category: 'skill',
    rarity: 'epic',
    requirement: { type: 'category_mastery', value: 5, category: 'batalha' },
    xpReward: 400,
  },

  // ==================== LEVEL BADGES ====================
  {
    id: 'level-5',
    name: 'Nível 5',
    description: 'Alcance nível 5',
    icon: '5️⃣',
    category: 'xp',
    rarity: 'common',
    requirement: { type: 'level', value: 5 },
    xpReward: 50,
  },
  {
    id: 'level-10',
    name: 'Nível 10',
    description: 'Alcance nível 10',
    icon: '🔟',
    category: 'xp',
    rarity: 'rare',
    requirement: { type: 'level', value: 10 },
    xpReward: 150,
  },
  {
    id: 'level-25',
    name: 'Nível 25',
    description: 'Alcance nível 25',
    icon: '🏅',
    category: 'xp',
    rarity: 'epic',
    requirement: { type: 'level', value: 25 },
    xpReward: 400,
  },
  {
    id: 'level-50',
    name: 'Nível 50',
    description: 'Alcance nível 50',
    icon: '🏆',
    category: 'xp',
    rarity: 'legendary',
    requirement: { type: 'level', value: 50 },
    xpReward: 1000,
  },

  // ==================== SPECIAL BADGES ====================
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Um dos primeiros usuários',
    icon: '🌟',
    category: 'special',
    rarity: 'legendary',
    requirement: { type: 'special', value: 1 },
    xpReward: 500,
  },
  {
    id: 'beta-tester',
    name: 'Beta Tester',
    description: 'Participou do beta',
    icon: '🧪',
    category: 'special',
    rarity: 'epic',
    requirement: { type: 'special', value: 2 },
    xpReward: 300,
  },
];

/**
 * Busca badge por ID
 */
export function getBadgeById(id: string): Badge | undefined {
  return badges.find((b) => b.id === id);
}

/**
 * Filtra badges por categoria
 */
export function getBadgesByCategory(category: Badge['category']): Badge[] {
  return badges.filter((b) => b.category === category);
}

/**
 * Filtra badges por raridade
 */
export function getBadgesByRarity(rarity: Badge['rarity']): Badge[] {
  return badges.filter((b) => b.rarity === rarity);
}

/**
 * Verifica se usuário desbloqueou um badge
 */
export function checkBadgeUnlock(
  badge: Badge,
  stats: {
    streak: number;
    maxStreak: number;
    drillsCompleted: number;
    totalXP: number;
    perfectScores: number;
    level: number;
    categoryProgress: Record<string, number>;
  }
): boolean {
  const { requirement } = badge;

  switch (requirement.type) {
    case 'streak':
      return stats.maxStreak >= requirement.value;

    case 'drills_completed':
      return stats.drillsCompleted >= requirement.value;

    case 'xp_total':
      return stats.totalXP >= requirement.value;

    case 'perfect_score':
      return stats.perfectScores >= requirement.value;

    case 'level':
      return stats.level >= requirement.value;

    case 'category_mastery':
      if (!requirement.category) return false;
      const categoryDrills = stats.categoryProgress[requirement.category] || 0;
      return categoryDrills >= requirement.value;

    case 'special':
      // Special badges são desbloqueados manualmente
      return false;

    default:
      return false;
  }
}

/**
 * Retorna todos os badges que o usuário desbloqueou
 */
export function getUnlockedBadges(stats: Parameters<typeof checkBadgeUnlock>[1]): Badge[] {
  return badges.filter((badge) => checkBadgeUnlock(badge, stats));
}

/**
 * Retorna badges pendentes ordenados por proximidade de desbloquear
 */
export function getPendingBadges(stats: Parameters<typeof checkBadgeUnlock>[1]): Badge[] {
  return badges.filter((badge) => !checkBadgeUnlock(badge, stats));
}

/**
 * Cor por raridade
 */
export const rarityColors: Record<Badge['rarity'], string> = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
};

/**
 * Background por raridade
 */
export const rarityBackgrounds: Record<Badge['rarity'], string> = {
  common: 'bg-gray-700',
  rare: 'bg-blue-900/50',
  epic: 'bg-purple-900/50',
  legendary: 'bg-gradient-to-br from-yellow-600/30 to-orange-600/30',
};

export default badges;
