/**
 * @fileoverview Header do app
 * @module components/Header
 */

import React from 'react';
import { XPBar } from './XPBar';
import { StreakFire } from './StreakFire';
import { useGameState } from '../hooks/useGameState';

interface HeaderProps {
  /** Mostrar XP bar */
  showXP?: boolean;
  /** Mostrar streak */
  showStreak?: boolean;
  /** Título customizado (substitui logo) */
  title?: string;
  /** Mostrar botão de voltar */
  showBack?: boolean;
  /** Callback do botão voltar */
  onBack?: () => void;
}

/**
 * Header do aplicativo
 */
export function Header({
  showXP = true,
  showStreak = true,
  title,
  showBack = false,
  onBack,
}: HeaderProps) {
  const { user, xpInfo } = useGameState();

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-lg mx-auto px-4 py-3">
        {/* Top row: Logo/Title + Streak */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={onBack}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                aria-label="Voltar"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {title ? (
              <h1 className="text-lg font-bold text-white">{title}</h1>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎤</span>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  IA Rimas
                </span>
              </div>
            )}
          </div>

          {/* Streak */}
          {showStreak && user && (
            <StreakFire streak={user.streak} size="sm" showDays />
          )}
        </div>

        {/* XP Bar */}
        {showXP && user && xpInfo && (
          <XPBar
            currentXP={user.xp}
            level={user.level}
            size="sm"
            showLevel
            showXPText
          />
        )}
      </div>
    </header>
  );
}

export default Header;
