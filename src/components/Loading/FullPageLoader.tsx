/**
 * @fileoverview Loader de página inteira
 * @module components/Loading/FullPageLoader
 */


interface FullPageLoaderProps {
  /** Mensagem de loading */
  message?: string;
  /** Mostrar logo */
  showLogo?: boolean;
}

/**
 * Loader de página inteira com overlay
 */
export function FullPageLoader({
  message = 'Carregando...',
  showLogo = true,
}: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center">
      {/* Logo */}
      {showLogo && (
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-purple-500/30 blur-2xl rounded-full scale-150" />
          <span className="relative text-6xl block animate-bounce">🎤</span>
        </div>
      )}

      {/* Spinner */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
      </div>

      {/* Message */}
      {message && (
        <p className="mt-6 text-gray-400 text-sm animate-pulse">{message}</p>
      )}

      {/* Dots animation */}
      <div className="flex gap-1 mt-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default FullPageLoader;
