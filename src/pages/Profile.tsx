/**
 * @fileoverview Página de Perfil do Usuário
 * @module pages/Profile
 */

import React from 'react';
import { Layout } from '../components/Layout';
import { XPBar } from '../components/XPBar';
import { StreakFire } from '../components/StreakFire';
import { BadgeIcon } from '../components/BadgeIcon';
import { ProgressCalendar } from '../components/ProgressCalendar';
import { useAuthContext } from '../contexts/AuthContext';
import { useGameContext } from '../contexts/GameContext';

type NavItem = 'home' | 'drills' | 'ranking' | 'profile';

interface ProfileProps {
  /** Navega para outra página */
  onNavigate: (page: NavItem) => void;
  /** Abre configurações */
  onOpenSettings: () => void;
}

// Mock badges data
const userBadges = [
  { id: 'first-drill', name: 'Primeiro Drill', description: 'Complete seu primeiro drill', icon: '🎯', earned: true },
  { id: 'streak-7', name: 'Semana On Fire', description: '7 dias de streak', icon: '🔥', earned: true },
  { id: 'streak-30', name: 'Mês Dedicado', description: '30 dias de streak', icon: '⭐', earned: false },
  { id: 'perfect-score', name: 'Perfeição', description: '100% em um drill', icon: '💎', earned: true },
  { id: 'level-10', name: 'Nível 10', description: 'Alcance nível 10', icon: '🏅', earned: false },
  { id: 'battle-win', name: 'Vencedor', description: 'Vença uma batalha', icon: '🏆', earned: false },
];

// Mock activity data (last 30 days)
const mockActivity: Record<string, number> = {};
const today = new Date();
for (let i = 0; i < 30; i++) {
  const date = new Date(today);
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split('T')[0];
  // Random activity: 0-4 drills per day, more recent days more active
  if (Math.random() > 0.3 || i < 7) {
    mockActivity[dateStr] = Math.floor(Math.random() * 4) + 1;
  }
}

/**
 * Página de Perfil
 */
export function Profile({ onNavigate, onOpenSettings }: ProfileProps) {
  const { user } = useAuthContext();
  const { state, computed } = useGameContext();

  const earnedBadges = userBadges.filter((b) => b.earned);
  const pendingBadges = userBadges.filter((b) => !b.earned);

  return (
    <Layout
      activeNav="profile"
      onNavChange={(nav) => onNavigate(nav)}
      headerProps={{
        title: 'Perfil',
        showXP: false,
        showStreak: false,
      }}
    >
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              '🎤'
            )}
          </div>
          {/* Level badge */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold border-2 border-gray-950">
            {computed.level}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-xl font-bold">{user?.displayName || 'MC Anônimo'}</h1>
          <p className="text-gray-500 text-sm">@{user?.email?.split('@')[0] || 'anonimo'}</p>

          {/* Quick stats */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <StreakFire streak={state.user?.stats?.streak || 0} size="sm" showLabel={false} />
              <span className="text-sm text-gray-400">
                {state.user?.stats?.streak || 0} dias
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg">🏆</span>
              <span className="text-sm text-gray-400">
                #{42}
              </span>
            </div>
          </div>
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          aria-label="Configurações"
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* XP Progress */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-400 text-sm">Progresso de Nível</span>
          <span className="text-purple-400 font-medium">Nível {computed.level}</span>
        </div>
        <XPBar
          current={computed.xpInCurrentLevel}
          max={computed.xpToNextLevel}
          level={computed.level}
          showLabel
        />
        <p className="text-xs text-gray-500 mt-2 text-center">
          {computed.xpToNextLevel - computed.xpInCurrentLevel} XP para o próximo nível
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {(state.user?.stats?.totalXP || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">XP Total</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
          <p className="text-2xl font-bold text-green-400">
            {state.user?.stats?.drillsCompleted || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Drills</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
          <p className="text-2xl font-bold text-orange-400">
            {state.user?.stats?.maxStreak || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Max Streak</p>
        </div>
      </div>

      {/* Activity calendar */}
      <div className="mb-6">
        <h2 className="font-bold text-lg mb-3">Atividade</h2>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <ProgressCalendar activity={mockActivity} />
          <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
            <span>Últimos 30 dias</span>
            <div className="flex items-center gap-1">
              <span>Menos</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`w-3 h-3 rounded-sm ${
                      level === 1 ? 'bg-purple-900' :
                      level === 2 ? 'bg-purple-700' :
                      level === 3 ? 'bg-purple-500' :
                      'bg-purple-400'
                    }`}
                  />
                ))}
              </div>
              <span>Mais</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">Conquistas</h2>
          <span className="text-sm text-gray-500">
            {earnedBadges.length}/{userBadges.length}
          </span>
        </div>

        {/* Earned badges */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {earnedBadges.map((badge) => (
            <div
              key={badge.id}
              className="bg-gray-900 rounded-xl p-3 border border-gray-800 text-center"
            >
              <BadgeIcon icon={badge.icon} size="lg" earned />
              <p className="text-xs font-medium mt-2 truncate">{badge.name}</p>
            </div>
          ))}
        </div>

        {/* Pending badges */}
        {pendingBadges.length > 0 && (
          <>
            <p className="text-xs text-gray-500 mb-2">Próximas conquistas</p>
            <div className="grid grid-cols-3 gap-3">
              {pendingBadges.slice(0, 3).map((badge) => (
                <div
                  key={badge.id}
                  className="bg-gray-900/50 rounded-xl p-3 border border-gray-800/50 text-center opacity-60"
                >
                  <BadgeIcon icon={badge.icon} size="lg" earned={false} />
                  <p className="text-xs font-medium mt-2 truncate text-gray-500">{badge.name}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Share profile */}
      <button className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
        <span>📤</span>
        Compartilhar Perfil
      </button>
    </Layout>
  );
}

export default Profile;
