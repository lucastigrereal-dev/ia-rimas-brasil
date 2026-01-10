/**
 * @fileoverview Página de Ranking (Leaderboard)
 * @module pages/Leaderboard
 */

import { useState } from 'react';
import { Layout } from '../components/Layout';
import { LeaderboardRow } from '../components/LeaderboardRow';
import { useAuthContext } from '../contexts/AuthContext';

type NavItem = 'home' | 'drills' | 'ranking' | 'profile';
type LeaderboardPeriod = 'daily' | 'weekly' | 'allTime';

interface LeaderboardProps {
  /** Navega para outra página */
  onNavigate: (page: NavItem) => void;
  /** Ver perfil de usuário */
  onViewProfile?: (userId: string) => void;
}

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL?: string;
  xp: number;
  level: number;
  streak: number;
  rank: number;
}

const periodTabs: { id: LeaderboardPeriod; label: string }[] = [
  { id: 'daily', label: 'Hoje' },
  { id: 'weekly', label: 'Semana' },
  { id: 'allTime', label: 'Geral' },
];

// Mock leaderboard data
const mockLeaderboard: Record<LeaderboardPeriod, LeaderboardEntry[]> = {
  daily: [
    { userId: '1', displayName: 'MC Thunder', xp: 850, level: 15, streak: 45, rank: 1 },
    { userId: '2', displayName: 'Flow Master', xp: 720, level: 12, streak: 30, rank: 2 },
    { userId: '3', displayName: 'Rimadora', xp: 680, level: 11, streak: 28, rank: 3 },
    { userId: 'current', displayName: 'Você', xp: 450, level: 8, streak: 7, rank: 4 },
    { userId: '5', displayName: 'Beat King', xp: 420, level: 7, streak: 15, rank: 5 },
    { userId: '6', displayName: 'Mic Check', xp: 380, level: 6, streak: 10, rank: 6 },
    { userId: '7', displayName: 'Freestyle Kid', xp: 350, level: 6, streak: 8, rank: 7 },
    { userId: '8', displayName: 'Verbal Ace', xp: 320, level: 5, streak: 5, rank: 8 },
    { userId: '9', displayName: 'Word Smith', xp: 280, level: 5, streak: 12, rank: 9 },
    { userId: '10', displayName: 'Lyric Lord', xp: 250, level: 4, streak: 3, rank: 10 },
  ],
  weekly: [
    { userId: '1', displayName: 'MC Thunder', xp: 5200, level: 15, streak: 45, rank: 1 },
    { userId: '3', displayName: 'Rimadora', xp: 4800, level: 11, streak: 28, rank: 2 },
    { userId: '2', displayName: 'Flow Master', xp: 4500, level: 12, streak: 30, rank: 3 },
    { userId: '5', displayName: 'Beat King', xp: 3200, level: 7, streak: 15, rank: 4 },
    { userId: 'current', displayName: 'Você', xp: 2800, level: 8, streak: 7, rank: 5 },
    { userId: '6', displayName: 'Mic Check', xp: 2400, level: 6, streak: 10, rank: 6 },
    { userId: '9', displayName: 'Word Smith', xp: 2100, level: 5, streak: 12, rank: 7 },
    { userId: '7', displayName: 'Freestyle Kid', xp: 1900, level: 6, streak: 8, rank: 8 },
    { userId: '8', displayName: 'Verbal Ace', xp: 1700, level: 5, streak: 5, rank: 9 },
    { userId: '10', displayName: 'Lyric Lord', xp: 1500, level: 4, streak: 3, rank: 10 },
  ],
  allTime: [
    { userId: '1', displayName: 'MC Thunder', xp: 125000, level: 45, streak: 180, rank: 1 },
    { userId: '2', displayName: 'Flow Master', xp: 98000, level: 38, streak: 120, rank: 2 },
    { userId: '3', displayName: 'Rimadora', xp: 87000, level: 35, streak: 90, rank: 3 },
    { userId: '11', displayName: 'Rap God', xp: 75000, level: 32, streak: 200, rank: 4 },
    { userId: '12', displayName: 'Battle Queen', xp: 68000, level: 30, streak: 85, rank: 5 },
    { userId: '5', displayName: 'Beat King', xp: 54000, level: 25, streak: 60, rank: 6 },
    { userId: '6', displayName: 'Mic Check', xp: 45000, level: 22, streak: 45, rank: 7 },
    { userId: 'current', displayName: 'Você', xp: 12500, level: 8, streak: 7, rank: 42 },
  ],
};

/**
 * Página de Ranking
 */
export function Leaderboard({ onNavigate, onViewProfile }: LeaderboardProps) {
  const { user: _user } = useAuthContext();
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');

  const leaderboard = mockLeaderboard[period];
  const currentUserEntry = leaderboard.find((e) => e.userId === 'current');
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <Layout
      activeNav="ranking"
      onNavChange={(nav) => onNavigate(nav)}
      headerProps={{ title: 'Ranking' }}
    >
      {/* Period tabs */}
      <div className="flex bg-gray-900 rounded-xl p-1 mb-6">
        {periodTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPeriod(tab.id)}
            className={`
              flex-1 py-2 rounded-lg text-sm font-medium transition-all
              ${period === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'text-gray-400 hover:text-white'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div className="flex items-end justify-center gap-2 mb-8 px-4">
        {/* 2nd place */}
        {top3[1] && (
          <div className="flex-1 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-2xl mb-2 border-2 border-gray-600">
              {top3[1].photoURL ? (
                <img src={top3[1].photoURL} alt="" className="w-full h-full rounded-full" />
              ) : (
                '🎤'
              )}
            </div>
            <p className="text-sm font-medium text-center truncate w-full">
              {top3[1].displayName}
            </p>
            <p className="text-xs text-gray-500">{top3[1].xp.toLocaleString()} XP</p>
            <div className="w-full h-20 bg-gradient-to-t from-gray-700 to-gray-800 rounded-t-lg mt-2 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-400">2</span>
            </div>
          </div>
        )}

        {/* 1st place */}
        {top3[0] && (
          <div className="flex-1 flex flex-col items-center">
            <div className="relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">👑</span>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl border-4 border-yellow-400">
                {top3[0].photoURL ? (
                  <img src={top3[0].photoURL} alt="" className="w-full h-full rounded-full" />
                ) : (
                  '🎤'
                )}
              </div>
            </div>
            <p className="text-sm font-bold text-center truncate w-full mt-2">
              {top3[0].displayName}
            </p>
            <p className="text-xs text-yellow-400">{top3[0].xp.toLocaleString()} XP</p>
            <div className="w-full h-28 bg-gradient-to-t from-yellow-600/30 to-yellow-500/20 rounded-t-lg mt-2 flex items-center justify-center border-t-2 border-yellow-500">
              <span className="text-3xl font-bold text-yellow-400">1</span>
            </div>
          </div>
        )}

        {/* 3rd place */}
        {top3[2] && (
          <div className="flex-1 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-xl mb-2 border-2 border-orange-700">
              {top3[2].photoURL ? (
                <img src={top3[2].photoURL} alt="" className="w-full h-full rounded-full" />
              ) : (
                '🎤'
              )}
            </div>
            <p className="text-sm font-medium text-center truncate w-full">
              {top3[2].displayName}
            </p>
            <p className="text-xs text-gray-500">{top3[2].xp.toLocaleString()} XP</p>
            <div className="w-full h-16 bg-gradient-to-t from-orange-900/30 to-orange-800/20 rounded-t-lg mt-2 flex items-center justify-center">
              <span className="text-xl font-bold text-orange-400">3</span>
            </div>
          </div>
        )}
      </div>

      {/* Rest of leaderboard */}
      <div className="space-y-2">
        {rest.map((entry) => (
          <LeaderboardRow
            key={entry.userId}
            user={{
              id: entry.userId,
              displayName: entry.displayName,
              photoURL: entry.photoURL,
              score: entry.xp,
            }}
            position={entry.rank}
            isCurrentUser={entry.userId === 'current'}
            onClick={() => onViewProfile?.(entry.userId)}
          />
        ))}
      </div>

      {/* Current user position (if not in top 10) */}
      {currentUserEntry && currentUserEntry.rank > 10 && (
        <div className="mt-6 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center mb-2">Sua posição</p>
          <LeaderboardRow
            user={{
              id: currentUserEntry.userId,
              displayName: currentUserEntry.displayName,
              photoURL: currentUserEntry.photoURL,
              score: currentUserEntry.xp,
            }}
            position={currentUserEntry.rank}
            isCurrentUser
          />
        </div>
      )}

      {/* League info */}
      <div className="mt-6 bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🥉</span>
          <div>
            <p className="font-medium">Liga Bronze</p>
            <p className="text-sm text-gray-500">
              Top 10 sobem para Liga Prata
            </p>
          </div>
        </div>
        <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-600 to-orange-400"
            style={{ width: '42%' }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Você está em #{currentUserEntry?.rank || '?'} • Faltam {10 - (currentUserEntry?.rank || 0) > 0 ? 10 - (currentUserEntry?.rank || 0) : 0} posições para subir
        </p>
      </div>
    </Layout>
  );
}

export default Leaderboard;
