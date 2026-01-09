import React, { useState } from 'react';

/**
 * IDs de badges disponíveis no sistema
 */
export type BadgeId =
  | 'first_drill'      // Primeiro drill completado
  | 'streak_3'         // 3 dias de streak
  | 'streak_7'         // 7 dias de streak
  | 'streak_30'        // 30 dias de streak
  | 'perfect_score'    // 100% em um drill
  | 'speed_demon'      // Completou em tempo recorde
  | 'drill_master'     // 50 drills completados
  | 'rima_king'        // 100 drills completados
  | 'level_10'         // Alcançou nível 10
  | 'level_25'         // Alcançou nível 25
  | 'battle_winner'    // Venceu uma batalha
  | 'battle_champion'; // Venceu 10 batalhas

/**
 * Configuração de cada badge
 */
interface BadgeConfig {
  icon: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

/**
 * Configurações de todos os badges
 */
export const BADGE_CONFIG: Record<BadgeId, BadgeConfig> = {
  first_drill: {
    icon: '🎯',
    name: 'Primeiro Passo',
    description: 'Completou seu primeiro drill',
    rarity: 'common',
  },
  streak_3: {
    icon: '🔥',
    name: 'Aquecendo',
    description: '3 dias consecutivos de treino',
    rarity: 'common',
  },
  streak_7: {
    icon: '💪',
    name: 'Determinado',
    description: '7 dias consecutivos de treino',
    rarity: 'rare',
  },
  streak_30: {
    icon: '👑',
    name: 'Imparável',
    description: '30 dias consecutivos de treino',
    rarity: 'legendary',
  },
  perfect_score: {
    icon: '💯',
    name: 'Perfeição',
    description: 'Conseguiu 100% em um drill',
    rarity: 'rare',
  },
  speed_demon: {
    icon: '⚡',
    name: 'Velocista',
    description: 'Completou um drill em tempo recorde',
    rarity: 'epic',
  },
  drill_master: {
    icon: '🏅',
    name: 'Mestre dos Drills',
    description: 'Completou 50 drills',
    rarity: 'rare',
  },
  rima_king: {
    icon: '👑',
    name: 'Rei da Rima',
    description: 'Completou 100 drills',
    rarity: 'epic',
  },
  level_10: {
    icon: '🌟',
    name: 'Estrela Nascente',
    description: 'Alcançou o nível 10',
    rarity: 'rare',
  },
  level_25: {
    icon: '🌠',
    name: 'Constelação',
    description: 'Alcançou o nível 25',
    rarity: 'epic',
  },
  battle_winner: {
    icon: '⚔️',
    name: 'Primeiro Sangue',
    description: 'Venceu sua primeira batalha',
    rarity: 'common',
  },
  battle_champion: {
    icon: '🏆',
    name: 'Campeão de Batalha',
    description: 'Venceu 10 batalhas',
    rarity: 'epic',
  },
};

interface BadgeIconProps {
  /** ID do badge */
  badgeId: BadgeId;
  /** Se o badge foi conquistado */
  unlocked?: boolean;
  /** Tamanho do ícone */
  size?: 'sm' | 'md' | 'lg';
  /** Se está sendo conquistado agora (animação especial) */
  justUnlocked?: boolean;
  /** Mostrar tooltip */
  showTooltip?: boolean;
  /** Classes adicionais */
  className?: string;
}

/**
 * Ícone de badge com tooltip
 *
 * Estados:
 * - unlocked: Colorido e brilhante
 * - locked: Grayscale e opaco
 * - justUnlocked: Animação de conquista
 */
export function BadgeIcon({
  badgeId,
  unlocked = true,
  size = 'md',
  justUnlocked = false,
  showTooltip = true,
  className = '',
}: BadgeIconProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const badge = BADGE_CONFIG[badgeId];

  // Cores por raridade
  const getRarityGlow = (rarity: BadgeConfig['rarity']): string => {
    const glows: Record<BadgeConfig['rarity'], string> = {
      common: 'shadow-gray-400/50',
      rare: 'shadow-blue-500/50',
      epic: 'shadow-purple-500/50',
      legendary: 'shadow-yellow-500/50',
    };
    return glows[rarity];
  };

  const getRarityBorder = (rarity: BadgeConfig['rarity']): string => {
    const borders: Record<BadgeConfig['rarity'], string> = {
      common: 'border-gray-500',
      rare: 'border-blue-500',
      epic: 'border-purple-500',
      legendary: 'border-yellow-500',
    };
    return borders[rarity];
  };

  const getRarityBg = (rarity: BadgeConfig['rarity']): string => {
    const bgs: Record<BadgeConfig['rarity'], string> = {
      common: 'bg-gray-800',
      rare: 'bg-blue-900/50',
      epic: 'bg-purple-900/50',
      legendary: 'bg-yellow-900/30',
    };
    return bgs[rarity];
  };

  // Tamanhos
  const sizeConfig = {
    sm: { icon: 'text-xl', container: 'w-8 h-8', tooltip: 'text-xs' },
    md: { icon: 'text-3xl', container: 'w-12 h-12', tooltip: 'text-sm' },
    lg: { icon: 'text-5xl', container: 'w-16 h-16', tooltip: 'text-base' },
  }[size];

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
    >
      {/* Badge container */}
      <div
        className={`
          ${sizeConfig.container} rounded-full flex items-center justify-center
          border-2 transition-all duration-300
          ${unlocked
            ? `${getRarityBg(badge.rarity)} ${getRarityBorder(badge.rarity)} shadow-lg ${getRarityGlow(badge.rarity)}`
            : 'bg-gray-900 border-gray-700 grayscale opacity-40'
          }
          ${justUnlocked ? 'animate-bounce' : ''}
        `}
      >
        <span
          className={`${sizeConfig.icon} ${!unlocked ? 'opacity-50' : ''}`}
          style={{
            animation: justUnlocked ? 'pulse 0.5s ease-in-out infinite' : undefined,
          }}
        >
          {badge.icon}
        </span>

        {/* Efeito de brilho para legendary */}
        {unlocked && badge.rarity === 'legendary' && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 animate-pulse" />
        )}
      </div>

      {/* Indicador de justUnlocked */}
      {justUnlocked && (
        <div className="absolute -top-1 -right-1">
          <span className="text-sm animate-ping">✨</span>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && isTooltipVisible && (
        <div
          className={`
            absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2
            bg-gray-900 border border-gray-700 rounded-lg p-2 min-w-[150px]
            shadow-xl ${sizeConfig.tooltip}
          `}
        >
          {/* Seta */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-8 border-transparent border-t-gray-700" />
          </div>

          {/* Conteúdo */}
          <div className="text-center">
            <div className="font-bold text-white">{badge.name}</div>
            <div className="text-gray-400 text-xs mt-0.5">{badge.description}</div>
            <div className={`text-xs mt-1 capitalize ${
              badge.rarity === 'legendary' ? 'text-yellow-400' :
              badge.rarity === 'epic' ? 'text-purple-400' :
              badge.rarity === 'rare' ? 'text-blue-400' :
              'text-gray-500'
            }`}>
              {badge.rarity}
            </div>
            {!unlocked && (
              <div className="text-red-400 text-xs mt-1">🔒 Bloqueado</div>
            )}
          </div>
        </div>
      )}

      {/* Estilo da animação */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

export default BadgeIcon;
