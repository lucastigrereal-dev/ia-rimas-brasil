/**
 * @fileoverview Página 404 - Not Found
 * @module pages/NotFound
 */

import React from 'react';

interface NotFoundProps {
  /** Navegar para home */
  onGoHome?: () => void;
  /** Navegar para drills */
  onGoDrills?: () => void;
}

/**
 * Página 404 - Não Encontrada
 */
export function NotFound({ onGoHome, onGoDrills }: NotFoundProps) {
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleGoDrills = () => {
    if (onGoDrills) {
      onGoDrills();
    } else {
      window.location.href = '/drills';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Illustration */}
        <div className="relative mb-8">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full scale-150" />

          {/* Main icon */}
          <div className="relative">
            <span className="text-9xl block opacity-20 select-none">404</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl animate-bounce">🎤</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Essa rima não existe!
        </h1>

        {/* Description */}
        <p className="text-gray-400 mb-8 leading-relaxed">
          A página que você procura não foi encontrada.
          Pode ter sido removida, renomeada ou nunca existiu.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 mb-8">
          <button
            onClick={handleGoHome}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span>🏠</span>
            Voltar para Home
          </button>

          <button
            onClick={handleGoDrills}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span>🎯</span>
            Ver Drills
          </button>
        </div>

        {/* Fun message */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-sm text-gray-500">
            💡 <span className="text-gray-400">Dica:</span> Enquanto você está aqui, que tal praticar uma rima?
          </p>
          <p className="text-sm text-purple-400 mt-2 italic">
            "Não encontrei a página, mas encontrei inspiração"
          </p>
        </div>

        {/* Report link */}
        <p className="mt-8 text-sm text-gray-600">
          Acha que isso é um erro?{' '}
          <a
            href="https://github.com/seu-repo/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300"
          >
            Reportar problema
          </a>
        </p>
      </div>

      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Floating emojis */}
        <span className="absolute top-1/4 left-1/4 text-4xl opacity-10 animate-pulse">🎤</span>
        <span className="absolute top-1/3 right-1/4 text-3xl opacity-10 animate-pulse delay-100">🎵</span>
        <span className="absolute bottom-1/4 left-1/3 text-3xl opacity-10 animate-pulse delay-200">🔥</span>
        <span className="absolute bottom-1/3 right-1/3 text-4xl opacity-10 animate-pulse delay-300">🎯</span>
      </div>
    </div>
  );
}

export default NotFound;
