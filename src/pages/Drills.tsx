/**
 * @fileoverview Página de Drills (Treinos)
 * @module pages/Drills
 */

import { useState } from 'react';
import { Layout } from '../components/Layout';
import { DrillCard } from '../components/DrillCard';

type NavItem = 'home' | 'drills' | 'ranking' | 'profile';
type DrillCategory = 'all' | 'rimas' | 'flow' | 'punchline' | 'batalha';

interface DrillsProps {
  /** Navega para outra página */
  onNavigate: (page: NavItem) => void;
  /** Inicia um drill */
  onStartDrill: (drillId: string) => void;
}

interface DrillItem {
  id: string;
  title: string;
  description: string;
  category: 'rimas' | 'flow' | 'punchline' | 'batalha';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  duration: string;
  progress?: number;
  total?: number;
  isLocked?: boolean;
  isNew?: boolean;
}

const categoryFilters: { id: DrillCategory; label: string; emoji: string }[] = [
  { id: 'all', label: 'Todos', emoji: '📚' },
  { id: 'rimas', label: 'Rimas', emoji: '🎵' },
  { id: 'flow', label: 'Flow', emoji: '🌊' },
  { id: 'punchline', label: 'Punch', emoji: '👊' },
  { id: 'batalha', label: 'Batalha', emoji: '⚔️' },
];

// Mock drills data
const allDrills: DrillItem[] = [
  // Rimas
  {
    id: 'rimas-simples',
    title: 'Rimas Simples',
    description: 'Complete com palavras que rimam',
    category: 'rimas',
    difficulty: 'easy',
    xpReward: 50,
    duration: '3 min',
    progress: 2,
    total: 5,
  },
  {
    id: 'rimas-multiplas',
    title: 'Rimas Múltiplas',
    description: 'Encontre 3 rimas para cada palavra',
    category: 'rimas',
    difficulty: 'medium',
    xpReward: 75,
    duration: '4 min',
  },
  {
    id: 'rimas-multisilabicas',
    title: 'Multissilábicas',
    description: 'Rimas com 3+ sílabas em comum',
    category: 'rimas',
    difficulty: 'hard',
    xpReward: 100,
    duration: '5 min',
    isNew: true,
  },
  // Flow
  {
    id: 'flow-basico',
    title: 'Flow Básico',
    description: 'Mantenha o ritmo nas batidas',
    category: 'flow',
    difficulty: 'easy',
    xpReward: 50,
    duration: '3 min',
    progress: 1,
    total: 3,
  },
  {
    id: 'flow-variado',
    title: 'Flow Variado',
    description: 'Alterne entre flows diferentes',
    category: 'flow',
    difficulty: 'medium',
    xpReward: 75,
    duration: '5 min',
  },
  {
    id: 'flow-complexo',
    title: 'Flow Complexo',
    description: 'Triplets, double-time e mais',
    category: 'flow',
    difficulty: 'hard',
    xpReward: 100,
    duration: '6 min',
    isLocked: true,
  },
  // Punchline
  {
    id: 'punchline-temas',
    title: 'Punchlines por Tema',
    description: 'Crie punchlines sobre temas dados',
    category: 'punchline',
    difficulty: 'easy',
    xpReward: 60,
    duration: '4 min',
  },
  {
    id: 'punchline-metaforas',
    title: 'Metáforas Criativas',
    description: 'Use metáforas nas punchlines',
    category: 'punchline',
    difficulty: 'medium',
    xpReward: 80,
    duration: '5 min',
    isNew: true,
  },
  {
    id: 'punchline-wordplay',
    title: 'Wordplay Avançado',
    description: 'Trocadilhos e duplos sentidos',
    category: 'punchline',
    difficulty: 'hard',
    xpReward: 120,
    duration: '6 min',
  },
  // Batalha
  {
    id: 'batalha-intro',
    title: 'Intro de Batalha',
    description: 'Aprenda a se apresentar',
    category: 'batalha',
    difficulty: 'easy',
    xpReward: 70,
    duration: '4 min',
  },
  {
    id: 'batalha-resposta',
    title: 'Resposta Rápida',
    description: 'Responda ataques do oponente',
    category: 'batalha',
    difficulty: 'medium',
    xpReward: 90,
    duration: '5 min',
  },
  {
    id: 'batalha-simulada',
    title: 'Batalha Simulada',
    description: 'Batalhe contra a IA',
    category: 'batalha',
    difficulty: 'hard',
    xpReward: 150,
    duration: '8 min',
    isLocked: true,
  },
];

/**
 * Página de Drills
 */
export function Drills({ onNavigate, onStartDrill }: DrillsProps) {
  const [activeCategory, setActiveCategory] = useState<DrillCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtra drills
  const filteredDrills = allDrills.filter((drill) => {
    const matchesCategory = activeCategory === 'all' || drill.category === activeCategory;
    const matchesSearch = drill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          drill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Agrupa por dificuldade
  const groupedDrills = {
    easy: filteredDrills.filter((d) => d.difficulty === 'easy'),
    medium: filteredDrills.filter((d) => d.difficulty === 'medium'),
    hard: filteredDrills.filter((d) => d.difficulty === 'hard'),
  };

  return (
    <Layout
      activeNav="drills"
      onNavChange={(nav) => onNavigate(nav)}
      headerProps={{ title: 'Treinos' }}
    >
      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar drills..."
            className="w-full px-4 py-3 pl-10 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            🔍
          </span>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 scrollbar-hide">
        {categoryFilters.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap
              transition-all text-sm font-medium
              ${activeCategory === cat.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }
            `}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Drills list */}
      {filteredDrills.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl block mb-4">🔍</span>
          <p className="text-gray-500">Nenhum drill encontrado</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Easy */}
          {groupedDrills.easy.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Iniciante
              </h3>
              <div className="space-y-3">
                {groupedDrills.easy.map((drill) => (
                  <DrillCard
                    key={drill.id}
                    title={drill.title}
                    description={drill.description}
                    category={drill.category}
                    difficulty={drill.difficulty}
                    xpReward={drill.xpReward}
                    duration={drill.duration}
                    progress={drill.progress}
                    total={drill.total}
                    isLocked={drill.isLocked}
                    isNew={drill.isNew}
                    onClick={() => !drill.isLocked && onStartDrill(drill.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Medium */}
          {groupedDrills.medium.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                Intermediário
              </h3>
              <div className="space-y-3">
                {groupedDrills.medium.map((drill) => (
                  <DrillCard
                    key={drill.id}
                    title={drill.title}
                    description={drill.description}
                    category={drill.category}
                    difficulty={drill.difficulty}
                    xpReward={drill.xpReward}
                    duration={drill.duration}
                    progress={drill.progress}
                    total={drill.total}
                    isLocked={drill.isLocked}
                    isNew={drill.isNew}
                    onClick={() => !drill.isLocked && onStartDrill(drill.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Hard */}
          {groupedDrills.hard.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Avançado
              </h3>
              <div className="space-y-3">
                {groupedDrills.hard.map((drill) => (
                  <DrillCard
                    key={drill.id}
                    title={drill.title}
                    description={drill.description}
                    category={drill.category}
                    difficulty={drill.difficulty}
                    xpReward={drill.xpReward}
                    duration={drill.duration}
                    progress={drill.progress}
                    total={drill.total}
                    isLocked={drill.isLocked}
                    isNew={drill.isNew}
                    onClick={() => !drill.isLocked && onStartDrill(drill.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

export default Drills;
