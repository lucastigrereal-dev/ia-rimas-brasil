import React from 'react';
import type { Drill, DrillCategory, DrillDifficulty } from '../types/drill';
import { DRILL_CATEGORY_EMOJI } from '../types/drill';

type DrillStatus = 'locked' | 'available' | 'completed';

interface DrillCardProps {
  /** Dados do drill */
  drill: Drill;
  /** Status do drill para o usuário */
  status?: DrillStatus;
  /** Estrelas conquistadas (0-3) */
  stars?: 0 | 1 | 2 | 3;
  /** Callback ao clicar no botão jogar */
  onPlay?: (drillId: string) => void;
  /** Classes adicionais */
  className?: string;
}

/**
 * Card de drill/exercício
 *
 * Estados visuais:
 * - locked: Cinza, cadeado, não clicável
 * - available: Colorido, botão jogar
 * - completed: Verde, estrelas, replay
 */
export function DrillCard({
  drill,
  status = 'available',
  stars = 0,
  onPlay,
  className = '',
}: DrillCardProps) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  // Cor de fundo baseada na categoria
  const getCategoryGradient = (category: DrillCategory): string => {
    const gradients: Record<DrillCategory, string> = {
      som: 'from-purple-600 to-pink-600',
      ritmo: 'from-blue-600 to-cyan-600',
      sentido: 'from-green-600 to-emerald-600',
      batalha: 'from-red-600 to-orange-600',
    };
    return gradients[category];
  };

  // Renderiza estrelas de dificuldade
  const renderDifficultyStars = (difficulty: DrillDifficulty) => {
    return (
      <div className="flex gap-0.5" title={`Dificuldade: ${difficulty}/5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`text-xs ${n <= difficulty ? 'text-yellow-400' : 'text-gray-600'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Renderiza estrelas conquistadas
  const renderCompletedStars = () => {
    if (!isCompleted) return null;
    return (
      <div className="flex gap-1 mt-2">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`text-lg ${n <= stars ? 'text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.8)]' : 'text-gray-600'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const handleClick = () => {
    if (!isLocked && onPlay) {
      onPlay(drill.id);
    }
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border transition-all duration-300
        ${isLocked
          ? 'bg-gray-800/50 border-gray-700 cursor-not-allowed opacity-60'
          : isCompleted
            ? 'bg-gray-800 border-green-500/50 hover:border-green-400'
            : 'bg-gray-800 border-gray-600 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer'
        }
        ${className}
      `}
      onClick={handleClick}
      role={isLocked ? undefined : 'button'}
      tabIndex={isLocked ? undefined : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      {/* Header com categoria */}
      <div
        className={`
          px-4 py-2 bg-gradient-to-r
          ${isLocked ? 'from-gray-700 to-gray-600' : getCategoryGradient(drill.category)}
        `}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-white font-medium">
            <span className="text-lg">{DRILL_CATEGORY_EMOJI[drill.category]}</span>
            <span className="capitalize">{drill.category}</span>
          </span>
          {renderDifficultyStars(drill.difficulty)}
        </div>
      </div>

      {/* Corpo do card */}
      <div className="p-4">
        <h3 className={`font-bold text-lg mb-1 ${isLocked ? 'text-gray-500' : 'text-white'}`}>
          {isLocked ? '???' : drill.title}
        </h3>

        <p className={`text-sm mb-3 line-clamp-2 ${isLocked ? 'text-gray-600' : 'text-gray-400'}`}>
          {isLocked ? 'Complete os drills anteriores para desbloquear' : drill.description}
        </p>

        {/* XP Reward */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${isLocked ? 'text-gray-600' : 'text-purple-400'}`}>
            +{drill.xpReward} XP
          </span>

          {/* Tempo limite se houver */}
          {drill.timeLimit && !isLocked && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              ⏱️ {Math.floor(drill.timeLimit / 60)}:{String(drill.timeLimit % 60).padStart(2, '0')}
            </span>
          )}
        </div>

        {/* Estrelas conquistadas */}
        {renderCompletedStars()}
      </div>

      {/* Botão / Status */}
      <div className="px-4 pb-4">
        {isLocked ? (
          <div className="w-full py-2 text-center bg-gray-700 rounded-lg text-gray-500 flex items-center justify-center gap-2">
            <span>🔒</span>
            <span>Bloqueado</span>
          </div>
        ) : isCompleted ? (
          <button
            className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.(drill.id);
            }}
          >
            <span>🔄</span>
            <span>Jogar Novamente</span>
          </button>
        ) : (
          <button
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.(drill.id);
            }}
          >
            Jogar
          </button>
        )}
      </div>

      {/* Badge de completado */}
      {isCompleted && (
        <div className="absolute top-4 right-4">
          <span className="text-2xl">✅</span>
        </div>
      )}
    </div>
  );
}

export default DrillCard;
