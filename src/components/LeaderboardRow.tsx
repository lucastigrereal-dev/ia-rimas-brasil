
interface LeaderboardUser {
  /** ID do usuário */
  id: string;
  /** Nome de exibição */
  displayName: string;
  /** URL do avatar */
  photoURL?: string | null;
  /** XP ou pontuação */
  score: number;
}

interface LeaderboardRowProps {
  /** Dados do usuário */
  user: LeaderboardUser;
  /** Posição no ranking (1-based) */
  position: number;
  /** Variação de posição (+1 subiu, -1 desceu, 0 manteve) */
  positionChange?: number;
  /** Se é o usuário atual (para highlight) */
  isCurrentUser?: boolean;
  /** Delay para animação de entrada (ms) */
  animationDelay?: number;
  /** Callback ao clicar na linha */
  onClick?: (userId: string) => void;
  /** Classes adicionais */
  className?: string;
}

/**
 * Linha de leaderboard com animação
 *
 * Top 3 tem medalhas especiais:
 * - #1: 🥇 Ouro
 * - #2: 🥈 Prata
 * - #3: 🥉 Bronze
 */
export function LeaderboardRow({
  user,
  position,
  positionChange = 0,
  isCurrentUser = false,
  animationDelay = 0,
  onClick,
  className = '',
}: LeaderboardRowProps) {
  // Medalhas para top 3
  const getMedal = (pos: number): string | null => {
    if (pos === 1) return '🥇';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return null;
  };

  // Cor de fundo para top 3
  const getPositionStyle = (pos: number): string => {
    if (pos === 1) return 'bg-gradient-to-r from-yellow-600/20 to-transparent border-yellow-500/50';
    if (pos === 2) return 'bg-gradient-to-r from-gray-400/20 to-transparent border-gray-400/50';
    if (pos === 3) return 'bg-gradient-to-r from-amber-700/20 to-transparent border-amber-600/50';
    return 'bg-gray-800/50 border-gray-700';
  };

  // Indicador de mudança de posição
  const renderPositionChange = () => {
    if (positionChange === 0) return null;

    if (positionChange > 0) {
      return (
        <span className="text-green-400 text-xs flex items-center" title={`Subiu ${positionChange} posição(ões)`}>
          <span className="animate-bounce">▲</span>
          <span>{positionChange}</span>
        </span>
      );
    }

    return (
      <span className="text-red-400 text-xs flex items-center" title={`Desceu ${Math.abs(positionChange)} posição(ões)`}>
        <span>▼</span>
        <span>{Math.abs(positionChange)}</span>
      </span>
    );
  };

  const medal = getMedal(position);

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-xl border transition-all duration-300
        ${getPositionStyle(position)}
        ${isCurrentUser ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20' : ''}
        ${onClick ? 'cursor-pointer hover:bg-gray-700/50' : ''}
        ${className}
      `}
      style={{
        animation: `slideIn 0.3s ease-out ${animationDelay}ms both`,
      }}
      onClick={() => onClick?.(user.id)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Posição */}
      <div className="flex items-center justify-center w-10 shrink-0">
        {medal ? (
          <span className="text-2xl">{medal}</span>
        ) : (
          <span className="text-lg font-bold text-gray-500">#{position}</span>
        )}
      </div>

      {/* Avatar */}
      <div className="relative shrink-0">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Badge de usuário atual */}
        {isCurrentUser && (
          <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-0.5">
            <span className="text-xs">👤</span>
          </div>
        )}
      </div>

      {/* Nome e indicador de mudança */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`font-medium truncate ${
              isCurrentUser ? 'text-purple-300' : 'text-white'
            }`}
          >
            {user.displayName}
          </span>
          {isCurrentUser && (
            <span className="text-xs bg-purple-600 px-1.5 py-0.5 rounded text-purple-100">
              Você
            </span>
          )}
        </div>
        {renderPositionChange()}
      </div>

      {/* Score */}
      <div className="text-right shrink-0">
        <span className={`font-bold ${position <= 3 ? 'text-yellow-400' : 'text-gray-300'}`}>
          {user.score.toLocaleString()}
        </span>
        <span className="text-gray-500 text-sm ml-1">XP</span>
      </div>

      {/* Estilo da animação */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

export default LeaderboardRow;
