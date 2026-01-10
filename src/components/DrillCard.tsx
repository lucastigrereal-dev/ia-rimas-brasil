import type { DrillCategory } from '../types/drill';
import { DRILL_CATEGORY_EMOJI } from '../types/drill';

interface DrillCardProps {
  /** ID do drill */
  id?: string;
  /** Título do drill */
  title: string;
  /** Descrição do drill */
  description: string;
  /** Categoria do drill */
  category: DrillCategory;
  /** Dificuldade (easy, medium, hard) */
  difficulty: 'easy' | 'medium' | 'hard';
  /** Recompensa de XP */
  xpReward: number;
  /** Duração estimada */
  duration?: string;
  /** Progresso (opcional) */
  progress?: number;
  /** Total de questões (opcional) */
  total?: number;
  /** Se está bloqueado */
  isLocked?: boolean;
  /** Se é novo */
  isNew?: boolean;
  /** Se é diário */
  isDaily?: boolean;
  /** Callback ao clicar */
  onClick?: () => void;
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
  id: _id,
  title,
  description,
  category,
  difficulty,
  xpReward,
  duration,
  progress,
  total,
  isLocked = false,
  isNew = false,
  isDaily = false,
  onClick,
  className = '',
}: DrillCardProps) {
  const isCompleted = progress !== undefined && total !== undefined && progress >= total;

  // Cor de fundo baseada na categoria
  const getCategoryGradient = (category: DrillCategory): string => {
    const gradients: Record<DrillCategory, string> = {
      rimas: 'from-purple-600 to-pink-600',
      flow: 'from-blue-600 to-cyan-600',
      punchline: 'from-green-600 to-emerald-600',
      batalha: 'from-red-600 to-orange-600',
    };
    return gradients[category];
  };

  // Renderiza indicador de dificuldade
  const getDifficultyLabel = () => {
    const labels = {
      easy: { text: 'Fácil', color: 'text-green-400' },
      medium: { text: 'Médio', color: 'text-yellow-400' },
      hard: { text: 'Difícil', color: 'text-red-400' },
    };
    return labels[difficulty];
  };

  const handleClick = () => {
    if (!isLocked && onClick) {
      onClick();
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
          ${isLocked ? 'from-gray-700 to-gray-600' : getCategoryGradient(category)}
        `}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-white font-medium">
            <span className="text-lg">{DRILL_CATEGORY_EMOJI[category]}</span>
            <span className="capitalize">{category}</span>
          </span>
          <span className={`text-xs font-medium ${getDifficultyLabel().color}`}>
            {getDifficultyLabel().text}
          </span>
        </div>
      </div>

      {/* Corpo do card */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className={`font-bold text-lg ${isLocked ? 'text-gray-500' : 'text-white'}`}>
            {isLocked ? '???' : title}
          </h3>
          {isNew && !isLocked && (
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">NOVO</span>
          )}
          {isDaily && !isLocked && (
            <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">DIÁRIO</span>
          )}
        </div>

        <p className={`text-sm mb-3 line-clamp-2 ${isLocked ? 'text-gray-600' : 'text-gray-400'}`}>
          {isLocked ? 'Complete os drills anteriores para desbloquear' : description}
        </p>

        {/* XP e duração */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${isLocked ? 'text-gray-600' : 'text-purple-400'}`}>
            +{xpReward} XP
          </span>

          {duration && !isLocked && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              ⏱️ {duration}
            </span>
          )}
        </div>

        {/* Progresso */}
        {progress !== undefined && total !== undefined && !isLocked && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Progresso</span>
              <span>{progress}/{total}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-purple-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(progress / total) * 100}%` }}
              />
            </div>
          </div>
        )}
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
              onClick?.();
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
              onClick?.();
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
