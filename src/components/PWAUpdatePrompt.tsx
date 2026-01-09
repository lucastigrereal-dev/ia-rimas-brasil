/**
 * @fileoverview Prompt para atualização do PWA
 * @module components/PWAUpdatePrompt
 */

import React from 'react';

interface PWAUpdatePromptProps {
  /** Mostra o prompt */
  show: boolean;
  /** Callback para atualizar */
  onUpdate: () => void;
  /** Callback para fechar */
  onDismiss: () => void;
}

/**
 * Prompt de atualização do PWA
 */
export function PWAUpdatePrompt({ show, onUpdate, onDismiss }: PWAUpdatePromptProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="max-w-lg mx-auto bg-gray-900 border border-purple-500/30 rounded-2xl p-4 shadow-xl shadow-purple-500/10">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
            <span className="text-xl">🆕</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white">
              Nova versão disponível!
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Atualize para ter acesso às novidades e melhorias.
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onDismiss}
            className="flex-1 py-2 px-4 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Depois
          </button>
          <button
            onClick={onUpdate}
            className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Atualizar agora
          </button>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

/**
 * Banner de offline
 */
export function OfflineBanner({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-yellow-100 px-4 py-2 text-center text-sm font-medium">
      <span className="mr-2">📡</span>
      Você está offline. Algumas funcionalidades podem estar limitadas.
    </div>
  );
}

export default PWAUpdatePrompt;
