import { useEffect, useState } from 'react';
import { getXPProgress } from '../utils/xp';

interface XPBarProps {
  /** XP atual do usuário */
  currentXP: number;
  /** Nível atual (opcional, calculado automaticamente) */
  level?: number;
  /** Mostrar label de nível */
  showLevel?: boolean;
  /** Mostrar texto de XP */
  showXPText?: boolean;
  /** Tamanho da barra */
  size?: 'sm' | 'md' | 'lg';
  /** Callback quando animação terminar */
  onAnimationEnd?: () => void;
}

/**
 * Barra de progresso de XP com animação
 *
 * Cores:
 * - Verde: 0-50% do nível
 * - Amarelo: 50-80% do nível
 * - Vermelho/Laranja: 80-100% do nível
 */
export function XPBar({
  currentXP,
  level: levelProp,
  showLevel = true,
  showXPText = true,
  size = 'md',
  onAnimationEnd,
}: XPBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const progress = getXPProgress(currentXP);
  const displayLevel = levelProp ?? progress.currentLevel;

  // Animar a barra quando o XP mudar
  useEffect(() => {
    setIsAnimating(true);

    // Animação suave
    const startProgress = animatedProgress;
    const endProgress = progress.progress;
    const duration = 500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Easing: ease-out-cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startProgress + (endProgress - startProgress) * eased;

      setAnimatedProgress(current);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        onAnimationEnd?.();
      }
    };

    requestAnimationFrame(animate);
  }, [currentXP]);

  // Cor baseada no progresso
  const getBarColor = (percent: number): string => {
    if (percent < 50) return 'bg-green-500';
    if (percent < 80) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  // Glow quando animando
  const getGlowClass = (): string => {
    if (!isAnimating) return '';
    if (animatedProgress < 50) return 'shadow-green-500/50';
    if (animatedProgress < 80) return 'shadow-yellow-500/50';
    return 'shadow-orange-500/50';
  };

  // Altura baseada no tamanho
  const heightClass = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }[size];

  const textSizeClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  return (
    <div className="w-full">
      {/* Header com nível e XP */}
      <div className={`flex justify-between items-center mb-1 ${textSizeClass}`}>
        {showLevel && (
          <span className="font-bold text-purple-400">
            Nível {displayLevel}
          </span>
        )}
        {showXPText && (
          <span className="text-gray-400">
            {progress.xpInCurrentLevel.toLocaleString()} / {progress.xpNeededForNext.toLocaleString()} XP
          </span>
        )}
      </div>

      {/* Barra de progresso */}
      <div
        className={`w-full ${heightClass} bg-gray-700 rounded-full overflow-hidden`}
        role="progressbar"
        aria-valuenow={animatedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${heightClass} ${getBarColor(animatedProgress)} rounded-full transition-all duration-300 ${
            isAnimating ? `shadow-lg ${getGlowClass()}` : ''
          }`}
          style={{ width: `${Math.max(0, Math.min(100, animatedProgress))}%` }}
        />
      </div>

      {/* Texto de progresso percentual (opcional) */}
      {size === 'lg' && (
        <div className="text-center mt-1 text-xs text-gray-500">
          {Math.round(animatedProgress)}% para o nível {progress.nextLevel}
        </div>
      )}
    </div>
  );
}

export default XPBar;
