interface StreakFireProps {
  /** Número de dias consecutivos */
  streak: number;
  /** Tamanho do componente */
  size?: 'sm' | 'md' | 'lg';
  /** Mostrar número de dias */
  showDays?: boolean;
  /** Classes adicionais */
  className?: string;
}

/**
 * Componente de fogo animado para streak
 *
 * Cores por streak:
 * - 1-3 dias: Vermelho
 * - 4-6 dias: Laranja
 * - 7+ dias: Azul (fogo místico)
 */
export function StreakFire({
  streak,
  size = 'md',
  showDays = true,
  className = '',
}: StreakFireProps) {

  // Cores baseadas no streak
  const getFireColors = (): { primary: string; secondary: string; glow: string } => {
    if (streak >= 7) {
      // Fogo azul místico
      return {
        primary: 'text-blue-400',
        secondary: 'text-cyan-300',
        glow: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]',
      };
    }
    if (streak >= 4) {
      // Fogo laranja
      return {
        primary: 'text-orange-500',
        secondary: 'text-yellow-400',
        glow: 'drop-shadow-[0_0_6px_rgba(249,115,22,0.7)]',
      };
    }
    // Fogo vermelho
    return {
      primary: 'text-red-500',
      secondary: 'text-orange-400',
      glow: 'drop-shadow-[0_0_4px_rgba(239,68,68,0.6)]',
    };
  };

  // Tamanhos
  const sizeConfig = {
    sm: { icon: 'text-2xl', text: 'text-xs', container: 'gap-0.5' },
    md: { icon: 'text-4xl', text: 'text-sm', container: 'gap-1' },
    lg: { icon: 'text-6xl', text: 'text-lg', container: 'gap-2' },
  }[size];

  // Animação mais intensa com streak maior
  const animationIntensity = streak >= 7 ? 'animate-pulse' : streak >= 4 ? 'animate-bounce' : '';

  const colors = getFireColors();

  // Se streak é 0 ou cold, mostra fogo apagado
  if (streak <= 0) {
    return (
      <div className={`flex flex-col items-center ${sizeConfig.container} ${className}`}>
        <span className={`${sizeConfig.icon} text-gray-600 opacity-50`}>🔥</span>
        {showDays && (
          <span className={`${sizeConfig.text} text-gray-500`}>
            0 dias
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${sizeConfig.container} ${className}`}>
      {/* Fogo animado */}
      <div className={`relative ${animationIntensity}`}>
        <span
          className={`${sizeConfig.icon} ${colors.primary} ${colors.glow} transition-all duration-300`}
          style={{
            animation: streak >= 3 ? 'flicker 0.5s ease-in-out infinite alternate' : undefined,
          }}
        >
          🔥
        </span>

        {/* Partículas de fogo (streak alto) */}
        {streak >= 7 && (
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs animate-ping">
            ✨
          </span>
        )}
      </div>

      {/* Número de dias */}
      {showDays && (
        <span className={`${sizeConfig.text} font-bold ${colors.primary}`}>
          {streak} {streak === 1 ? 'dia' : 'dias'}
        </span>
      )}

      {/* Badge de milestone */}
      {streak >= 30 && (
        <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 rounded-full text-white">
          🏆 Lendário
        </span>
      )}
      {streak >= 14 && streak < 30 && (
        <span className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 px-2 py-0.5 rounded-full text-white">
          ⚡ Em chamas
        </span>
      )}

      {/* Estilo da animação flicker */}
      <style>{`
        @keyframes flicker {
          0% { transform: scale(1) rotate(-2deg); opacity: 1; }
          100% { transform: scale(1.05) rotate(2deg); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

export default StreakFire;
