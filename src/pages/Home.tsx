/**
 * @fileoverview Página Principal (Home)
 * @module pages/Home
 */

import React from 'react';
import { Layout } from '../components/Layout';
import { XPBar } from '../components/XPBar';
import { StreakFire } from '../components/StreakFire';
import { DrillCard } from '../components/DrillCard';
import { useGameContext } from '../contexts/GameContext';

type NavItem = 'home' | 'drills' | 'ranking' | 'profile';

interface HomeProps {
  /** Navega para outra página */
  onNavigate: (page: NavItem | 'drill') => void;
  /** ID do drill para iniciar */
  onStartDrill?: (drillId: string) => void;
}

/**
 * Página Principal
 */
export function Home({ onNavigate, onStartDrill }: HomeProps) {
  const { state, computed } = useGameContext();
  const { user } = state;

  // Drills sugeridos (mock data - futuramente virá do backend)
  const suggestedDrills = [
    {
      id: 'rimas-simples',
      title: 'Rimas Simples',
      description: 'Complete com palavras que rimam',
      category: 'rimas' as const,
      difficulty: 'easy' as const,
      xpReward: 50,
      duration: '3 min',
      progress: 2,
      total: 5,
    },
    {
      id: 'flow-basico',
      title: 'Flow Básico',
      description: 'Mantenha o ritmo nas batidas',
      category: 'flow' as const,
      difficulty: 'medium' as const,
      xpReward: 75,
      duration: '5 min',
      progress: 0,
      total: 3,
    },
    {
      id: 'punchline-diaria',
      title: 'Punchline do Dia',
      description: 'Crie uma punchline sobre o tema',
      category: 'punchline' as const,
      difficulty: 'hard' as const,
      xpReward: 100,
      duration: '4 min',
      isDaily: true,
    },
  ];

  return (
    <Layout
      activeNav="home"
      onNavChange={(nav) => onNavigate(nav)}
      headerProps={{
        showXP: true,
        showStreak: true,
      }}
    >
      {/* Welcome section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Fala, {user?.displayName?.split(' ')[0] || 'MC'}! 🎤
        </h1>
        <p className="text-gray-400 mt-1">
          {computed.isStreakActive
            ? `${user?.stats?.streak || 0} dias de streak! Continue assim!`
            : 'Bora treinar hoje?'
          }
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* XP Card */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⚡</span>
            <span className="text-gray-400 text-sm">XP Total</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">
            {(user?.stats?.totalXP || 0).toLocaleString()}
          </p>
          <XPBar
            current={computed.xpInCurrentLevel}
            max={computed.xpToNextLevel}
            level={computed.level}
            size="sm"
            className="mt-2"
          />
        </div>

        {/* Streak Card */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <StreakFire streak={user?.stats?.streak || 0} size="sm" />
            <span className="text-gray-400 text-sm">Streak</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {user?.stats?.streak || 0} dias
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Recorde: {user?.stats?.maxStreak || 0} dias
          </p>
        </div>
      </div>

      {/* Daily challenge highlight */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🎯</span>
                <span className="text-sm font-medium text-purple-300">Desafio Diário</span>
              </div>
              <h3 className="font-bold text-lg">Punchline do Dia</h3>
              <p className="text-gray-400 text-sm mt-1">
                +100 XP • Tema: Superação
              </p>
            </div>
            <button
              onClick={() => onStartDrill?.('punchline-diaria')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Começar
            </button>
          </div>
        </div>
      </div>

      {/* Suggested drills */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">Continue Treinando</h2>
          <button
            onClick={() => onNavigate('drills')}
            className="text-purple-400 text-sm hover:text-purple-300"
          >
            Ver todos →
          </button>
        </div>

        <div className="space-y-3">
          {suggestedDrills.slice(0, 2).map((drill) => (
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
              isDaily={drill.isDaily}
              onClick={() => onStartDrill?.(drill.id)}
            />
          ))}
        </div>
      </div>

      {/* Weekly progress */}
      <div className="mb-6">
        <h2 className="font-bold text-lg mb-3">Esta Semana</h2>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400 text-sm">Drills completados</span>
            <span className="font-bold">{user?.stats?.drillsCompleted || 0}</span>
          </div>

          {/* Week days */}
          <div className="flex justify-between">
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, idx) => {
              // Mock: últimos 3 dias ativos
              const isActive = idx >= 4;
              const isToday = idx === 6;

              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">{day}</span>
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${isActive
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                        : 'bg-gray-800'
                      }
                      ${isToday ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-gray-900' : ''}
                    `}
                  >
                    {isActive && <span className="text-xs">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate('drills')}
          className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors text-center"
        >
          <span className="text-2xl block mb-1">🎯</span>
          <span className="text-xs text-gray-400">Treinar</span>
        </button>
        <button
          onClick={() => onNavigate('ranking')}
          className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors text-center"
        >
          <span className="text-2xl block mb-1">🏆</span>
          <span className="text-xs text-gray-400">Ranking</span>
        </button>
        <button
          onClick={() => onNavigate('profile')}
          className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors text-center"
        >
          <span className="text-2xl block mb-1">📊</span>
          <span className="text-xs text-gray-400">Progresso</span>
        </button>
      </div>
    </Layout>
  );
}

export default Home;
