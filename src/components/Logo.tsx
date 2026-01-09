/**
 * @fileoverview Logo do IA Rimas Brasil
 * @module components/Logo
 */


type LogoVariant = 'full' | 'icon' | 'text';
type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

interface LogoProps {
  /** Variante do logo */
  variant?: LogoVariant;
  /** Tamanho */
  size?: LogoSize;
  /** Animação de pulse */
  animated?: boolean;
  /** Classes adicionais */
  className?: string;
}

/**
 * Configurações de tamanho
 */
const sizeConfig: Record<LogoSize, { icon: string; text: string; gap: string }> = {
  sm: { icon: 'text-2xl', text: 'text-lg', gap: 'gap-1.5' },
  md: { icon: 'text-3xl', text: 'text-xl', gap: 'gap-2' },
  lg: { icon: 'text-4xl', text: 'text-2xl', gap: 'gap-2.5' },
  xl: { icon: 'text-5xl', text: 'text-3xl', gap: 'gap-3' },
};

/**
 * Componente de Logo
 *
 * @example
 * <Logo variant="full" size="lg" />
 * <Logo variant="icon" animated />
 */
export function Logo({
  variant = 'full',
  size = 'md',
  animated = false,
  className = '',
}: LogoProps) {
  const config = sizeConfig[size];

  // Ícone do logo (microfone com ondas)
  const LogoIcon = () => (
    <span
      className={`
        ${config.icon}
        ${animated ? 'animate-pulse' : ''}
      `}
      role="img"
      aria-label="IA Rimas Brasil"
    >
      🎤
    </span>
  );

  // Texto do logo
  const LogoText = () => (
    <span
      className={`
        ${config.text} font-bold
        bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400
        bg-clip-text text-transparent
        ${animated ? 'animate-gradient' : ''}
      `}
    >
      IA Rimas
    </span>
  );

  // Renderiza baseado na variante
  if (variant === 'icon') {
    return (
      <div className={className}>
        <LogoIcon />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={className}>
        <LogoText />
      </div>
    );
  }

  // Full variant
  return (
    <div className={`flex items-center ${config.gap} ${className}`}>
      <LogoIcon />
      <LogoText />
    </div>
  );
}

/**
 * Logo completo com tagline
 */
export function LogoWithTagline({
  size = 'lg',
  animated = false,
  className = '',
}: Omit<LogoProps, 'variant'>) {
  return (
    <div className={`text-center ${className}`}>
      <Logo variant="full" size={size} animated={animated} />
      <p className="text-gray-500 mt-2 text-sm">
        Duolingo do Freestyle
      </p>
    </div>
  );
}

/**
 * Logo para splash screen
 */
export function SplashLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 blur-xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full scale-150" />

        {/* Logo icon */}
        <span className="relative text-7xl animate-bounce">🎤</span>
      </div>

      <div className="mt-6 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          IA Rimas Brasil
        </h1>
        <p className="text-gray-500 mt-2">Treine seu freestyle</p>
      </div>

      {/* Loading dots */}
      <div className="mt-8 flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>

      {/* Animação de gradiente */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default Logo;
