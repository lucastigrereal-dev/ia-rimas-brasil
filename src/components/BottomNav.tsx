/**
 * @fileoverview Navegação inferior do app
 * @module components/BottomNav
 */

import React from 'react';

type NavItem = 'home' | 'drills' | 'ranking' | 'profile';

interface BottomNavProps {
  /** Item ativo */
  active: NavItem;
  /** Callback ao mudar */
  onChange: (item: NavItem) => void;
}

interface NavItemConfig {
  id: NavItem;
  label: string;
  icon: string;
  iconActive: string;
}

const navItems: NavItemConfig[] = [
  { id: 'home', label: 'Home', icon: '🏠', iconActive: '🏡' },
  { id: 'drills', label: 'Treinar', icon: '🎯', iconActive: '🎯' },
  { id: 'ranking', label: 'Ranking', icon: '🏆', iconActive: '🏆' },
  { id: 'profile', label: 'Perfil', icon: '👤', iconActive: '👤' },
];

/**
 * Navegação inferior fixa
 */
export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = active === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`
                flex flex-col items-center justify-center w-full h-full
                transition-all duration-200
                ${isActive
                  ? 'text-purple-400 scale-105'
                  : 'text-gray-500 hover:text-gray-300'
                }
              `}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-2xl mb-0.5">
                {isActive ? item.iconActive : item.icon}
              </span>
              <span className={`text-xs font-medium ${isActive ? 'text-purple-400' : ''}`}>
                {item.label}
              </span>

              {/* Indicador ativo */}
              {isActive && (
                <span className="absolute bottom-0 w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
