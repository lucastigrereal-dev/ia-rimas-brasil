/**
 * @fileoverview Página de Erro
 * @module pages/ErrorPage
 */

import { useState } from 'react';
import type { ErrorInfo } from 'react';

interface ErrorPageProps {
  /** Erro que ocorreu */
  error: Error | null;
  /** Informações do erro */
  errorInfo: ErrorInfo | null;
  /** Tentar novamente (reload) */
  onRetry?: () => void;
  /** Ir para home */
  onGoHome?: () => void;
  /** Resetar erro (tentar renderizar novamente) */
  onReset?: () => void;
}

/**
 * Página de Erro amigável
 */
export function ErrorPage({
  error,
  errorInfo,
  onRetry,
  onGoHome,
  onReset,
}: ErrorPageProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
          <span className="relative text-8xl block">🎤</span>
          <span className="absolute -bottom-2 -right-2 text-4xl">💥</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-3">
          Ops! Algo deu errado
        </h1>

        {/* Description */}
        <p className="text-gray-400 mb-8 leading-relaxed">
          Parece que encontramos um problema inesperado.
          Não se preocupe, isso não é culpa sua!
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 mb-8">
          <button
            onClick={onRetry}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:opacity-90 transition-opacity"
          >
            🔄 Tentar novamente
          </button>

          <button
            onClick={onGoHome}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
          >
            🏠 Voltar para Home
          </button>

          {onReset && (
            <button
              onClick={onReset}
              className="w-full py-3 text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Tentar renderizar novamente
            </button>
          )}
        </div>

        {/* Error details (dev only or collapsible) */}
        {(isDev || error) && (
          <div className="text-left">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-400 transition-colors py-2"
            >
              <span>🔍 Detalhes técnicos</span>
              <svg
                className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDetails && (
              <div className="mt-2 p-4 bg-gray-900 rounded-xl border border-gray-800 text-left overflow-auto max-h-60">
                {error && (
                  <div className="mb-4">
                    <p className="text-xs text-red-400 font-mono mb-1">Error:</p>
                    <p className="text-sm text-gray-300 font-mono break-all">
                      {error.message}
                    </p>
                  </div>
                )}

                {isDev && error?.stack && (
                  <div className="mb-4">
                    <p className="text-xs text-yellow-400 font-mono mb-1">Stack:</p>
                    <pre className="text-xs text-gray-500 font-mono whitespace-pre-wrap break-all">
                      {error.stack}
                    </pre>
                  </div>
                )}

                {isDev && errorInfo?.componentStack && (
                  <div>
                    <p className="text-xs text-blue-400 font-mono mb-1">Component Stack:</p>
                    <pre className="text-xs text-gray-500 font-mono whitespace-pre-wrap break-all">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Report link */}
        <p className="mt-8 text-sm text-gray-600">
          Problema persistir?{' '}
          <a
            href="https://github.com/seu-repo/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300"
          >
            Reportar bug
          </a>
        </p>
      </div>
    </div>
  );
}

export default ErrorPage;
