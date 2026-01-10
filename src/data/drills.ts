/**
 * @fileoverview Definições de todos os Drills
 * @module data/drills
 */

import type { DrillCategory } from '../types/drill';

export interface DrillDefinition {
  id: string;
  title: string;
  description: string;
  category: DrillCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  duration: string; // estimated duration
  questionsCount: number;
  requiredLevel?: number;
  prerequisites?: string[];
  tags: string[];
  isDaily?: boolean;
  isFeatured?: boolean;
}

/**
 * Todos os drills disponíveis
 */
export const drills: DrillDefinition[] = [
  // ==================== RIMAS ====================
  {
    id: 'rimas-simples',
    title: 'Rimas Simples',
    description: 'Complete com palavras que rimam',
    category: 'rimas',
    difficulty: 'easy',
    xpReward: 50,
    duration: '3 min',
    questionsCount: 5,
    tags: ['iniciante', 'básico', 'rima'],
    isFeatured: true,
  },
  {
    id: 'rimas-multiplas',
    title: 'Rimas Múltiplas',
    description: 'Encontre 3 rimas para cada palavra',
    category: 'rimas',
    difficulty: 'medium',
    xpReward: 75,
    duration: '4 min',
    questionsCount: 5,
    requiredLevel: 3,
    prerequisites: ['rimas-simples'],
    tags: ['intermediário', 'vocabulário'],
  },
  {
    id: 'rimas-multisilabicas',
    title: 'Multissilábicas',
    description: 'Rimas com 3+ sílabas em comum',
    category: 'rimas',
    difficulty: 'hard',
    xpReward: 100,
    duration: '5 min',
    questionsCount: 5,
    requiredLevel: 8,
    prerequisites: ['rimas-multiplas'],
    tags: ['avançado', 'técnica'],
  },
  {
    id: 'rimas-toantes',
    title: 'Rimas Toantes',
    description: 'Rimas de vogais (assonância)',
    category: 'rimas',
    difficulty: 'medium',
    xpReward: 70,
    duration: '4 min',
    questionsCount: 5,
    requiredLevel: 5,
    tags: ['técnica', 'assonância'],
  },
  {
    id: 'rimas-internas',
    title: 'Rimas Internas',
    description: 'Rimas dentro do mesmo verso',
    category: 'rimas',
    difficulty: 'hard',
    xpReward: 90,
    duration: '5 min',
    questionsCount: 5,
    requiredLevel: 10,
    tags: ['avançado', 'estilo'],
  },

  // ==================== FLOW ====================
  {
    id: 'flow-basico',
    title: 'Flow Básico',
    description: 'Mantenha o ritmo nas batidas',
    category: 'flow',
    difficulty: 'easy',
    xpReward: 50,
    duration: '3 min',
    questionsCount: 4,
    tags: ['iniciante', 'ritmo'],
    isFeatured: true,
  },
  {
    id: 'flow-variado',
    title: 'Flow Variado',
    description: 'Alterne entre flows diferentes',
    category: 'flow',
    difficulty: 'medium',
    xpReward: 75,
    duration: '5 min',
    questionsCount: 5,
    requiredLevel: 4,
    prerequisites: ['flow-basico'],
    tags: ['intermediário', 'variação'],
  },
  {
    id: 'flow-triplet',
    title: 'Triplet Flow',
    description: 'Domine o flow de 3 tempos',
    category: 'flow',
    difficulty: 'medium',
    xpReward: 80,
    duration: '4 min',
    questionsCount: 4,
    requiredLevel: 6,
    tags: ['técnica', 'triplet'],
  },
  {
    id: 'flow-doubletime',
    title: 'Double Time',
    description: 'Acelere sem perder a métrica',
    category: 'flow',
    difficulty: 'hard',
    xpReward: 100,
    duration: '5 min',
    questionsCount: 4,
    requiredLevel: 10,
    prerequisites: ['flow-variado'],
    tags: ['avançado', 'velocidade'],
  },
  {
    id: 'flow-offbeat',
    title: 'Off-beat',
    description: 'Jogue com contratempos',
    category: 'flow',
    difficulty: 'hard',
    xpReward: 110,
    duration: '6 min',
    questionsCount: 5,
    requiredLevel: 12,
    tags: ['avançado', 'sincopado'],
  },

  // ==================== PUNCHLINE ====================
  {
    id: 'punchline-temas',
    title: 'Punchlines por Tema',
    description: 'Crie punchlines sobre temas dados',
    category: 'punchline',
    difficulty: 'easy',
    xpReward: 60,
    duration: '4 min',
    questionsCount: 4,
    tags: ['iniciante', 'criatividade'],
  },
  {
    id: 'punchline-metaforas',
    title: 'Metáforas Criativas',
    description: 'Use metáforas nas punchlines',
    category: 'punchline',
    difficulty: 'medium',
    xpReward: 80,
    duration: '5 min',
    questionsCount: 4,
    requiredLevel: 5,
    tags: ['intermediário', 'metáfora'],
  },
  {
    id: 'punchline-wordplay',
    title: 'Wordplay Avançado',
    description: 'Trocadilhos e duplos sentidos',
    category: 'punchline',
    difficulty: 'hard',
    xpReward: 120,
    duration: '6 min',
    questionsCount: 4,
    requiredLevel: 10,
    prerequisites: ['punchline-metaforas'],
    tags: ['avançado', 'wordplay'],
  },
  {
    id: 'punchline-setup',
    title: 'Setup & Payoff',
    description: 'Construa o setup perfeito',
    category: 'punchline',
    difficulty: 'hard',
    xpReward: 100,
    duration: '5 min',
    questionsCount: 4,
    requiredLevel: 8,
    tags: ['técnica', 'estrutura'],
  },
  {
    id: 'punchline-diaria',
    title: 'Punchline do Dia',
    description: 'Desafio diário de criatividade',
    category: 'punchline',
    difficulty: 'medium',
    xpReward: 100,
    duration: '4 min',
    questionsCount: 3,
    tags: ['diário', 'desafio'],
    isDaily: true,
  },

  // ==================== BATALHA ====================
  {
    id: 'batalha-intro',
    title: 'Intro de Batalha',
    description: 'Aprenda a se apresentar',
    category: 'batalha',
    difficulty: 'easy',
    xpReward: 70,
    duration: '4 min',
    questionsCount: 3,
    tags: ['iniciante', 'apresentação'],
  },
  {
    id: 'batalha-resposta',
    title: 'Resposta Rápida',
    description: 'Responda ataques do oponente',
    category: 'batalha',
    difficulty: 'medium',
    xpReward: 90,
    duration: '5 min',
    questionsCount: 4,
    requiredLevel: 6,
    prerequisites: ['batalha-intro'],
    tags: ['intermediário', 'resposta'],
  },
  {
    id: 'batalha-ataque',
    title: 'Ataques Criativos',
    description: 'Crie ataques originais',
    category: 'batalha',
    difficulty: 'medium',
    xpReward: 85,
    duration: '5 min',
    questionsCount: 4,
    requiredLevel: 7,
    tags: ['intermediário', 'ataque'],
  },
  {
    id: 'batalha-improviso',
    title: 'Improviso Total',
    description: 'Responda temas aleatórios',
    category: 'batalha',
    difficulty: 'hard',
    xpReward: 120,
    duration: '6 min',
    questionsCount: 5,
    requiredLevel: 12,
    prerequisites: ['batalha-resposta', 'batalha-ataque'],
    tags: ['avançado', 'improviso'],
  },
  {
    id: 'batalha-simulada',
    title: 'Batalha Simulada',
    description: 'Batalhe contra a IA',
    category: 'batalha',
    difficulty: 'hard',
    xpReward: 150,
    duration: '8 min',
    questionsCount: 6,
    requiredLevel: 15,
    tags: ['avançado', 'simulação'],
    isFeatured: true,
  },
];

/**
 * Busca drill por ID
 */
export function getDrillById(id: string): DrillDefinition | undefined {
  return drills.find((d) => d.id === id);
}

/**
 * Filtra drills por categoria
 */
export function getDrillsByCategory(category: DrillCategory): DrillDefinition[] {
  return drills.filter((d) => d.category === category);
}

/**
 * Filtra drills por dificuldade
 */
export function getDrillsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): DrillDefinition[] {
  return drills.filter((d) => d.difficulty === difficulty);
}

/**
 * Retorna drills disponíveis para um nível
 */
export function getAvailableDrills(level: number): DrillDefinition[] {
  return drills.filter((d) => !d.requiredLevel || d.requiredLevel <= level);
}

/**
 * Retorna drills em destaque
 */
export function getFeaturedDrills(): DrillDefinition[] {
  return drills.filter((d) => d.isFeatured);
}

/**
 * Retorna drill diário
 */
export function getDailyDrill(): DrillDefinition | undefined {
  return drills.find((d) => d.isDaily);
}

/**
 * Busca drills por tag
 */
export function getDrillsByTag(tag: string): DrillDefinition[] {
  return drills.filter((d) => d.tags.includes(tag.toLowerCase()));
}

export default drills;
