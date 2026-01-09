/**
 * @fileoverview Tela de Conclusão do Drill
 * @module pages/DrillComplete
 */

import React, { useEffect, useState } from 'react';
import { ShareCard } from '../components/ShareCard';

interface DrillResult {
  drillId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  xpEarned: number;
  stars: 1 | 2 | 3;
}

interface DrillCompleteProps {
  /** Resultado do drill */
  result: DrillResult;
  /** Título do drill */
  drillTitle: string;
  /** Voltar para drills */
  onBack: () => void;
  /** Jogar novamente */
  onPlayAgain: () => void;
  /** Próximo drill */
  onNextDrill?: () => void;
  /** Compartilhar resultado */
  onShare?: () => void;
}

/**
 * Formata tempo em mm:ss
 */
const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Mensagem baseada no score
 */
const getMessage = (score: number): { emoji: string; title: string; subtitle: string } => {
  if (score >= 90) {
    return {
      emoji: '🔥',
      title: 'Fenomenal!',
      subtitle: 'Você mandou muito bem!',
    };
  }
  if (score >= 70) {
    return {
      emoji: '💪',
      title: 'Muito Bom!',
      subtitle: 'Continue assim!',
    };
  }
  if (score >= 50) {
    return {
      emoji: '👍',
      title: 'Bom trabalho!',
      subtitle: 'Pratique mais para melhorar!',
    };
  }
  return {
    emoji: '💡',
    title: 'Continue tentando!',
    subtitle: 'A prática leva à perfeição!',
  };
};

/**
 * Tela de Conclusão do Drill
 */
export function DrillComplete({
  result,
  drillTitle,
  onBack,
  onPlayAgain,
  onNextDrill,
  onShare,
}: DrillCompleteProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [animatedXP, setAnimatedXP] = useState(0);
  const [showShareCard, setShowShareCard] = useState(false);

  const message = getMessage(result.score);

  // Animação de entrada
  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Animação de XP
  useEffect(() => {
    if (!showAnimation) return;

    const duration = 1500;
    const steps = 30;
    const increment = result.xpEarned / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= result.xpEarned) {
        setAnimatedXP(result.xpEarned);
        clearInterval(interval);
      } else {
        setAnimatedXP(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [showAnimation, result.xpEarned]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Confetti effect placeholder */}
      {result.stars === 3 && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                backgroundColor: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981'][i % 4],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Message */}
        <div
          className={`text-center mb-8 transition-all duration-500 ${
            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <span className="text-6xl block mb-4">{message.emoji}</span>
          <h1 className="text-3xl font-bold mb-2">{message.title}</h1>
          <p className="text-gray-400">{message.subtitle}</p>
        </div>

        {/* Stars */}
        <div
          className={`flex gap-2 mb-8 transition-all duration-700 delay-200 ${
            showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          {[1, 2, 3].map((star) => (
            <span
              key={star}
              className={`text-5xl transition-all duration-300 ${
                star <= result.stars
                  ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                  : 'text-gray-700'
              }`}
              style={{
                animationDelay: `${star * 0.2}s`,
                transform: star <= result.stars ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* Stats card */}
        <div
          className={`w-full max-w-sm bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-8 transition-all duration-500 delay-300 ${
            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Drill title */}
          <p className="text-center text-gray-400 text-sm mb-4">{drillTitle}</p>

          {/* Score */}
          <div className="text-center mb-6">
            <p className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {result.score}%
            </p>
            <p className="text-gray-500 text-sm mt-1">Score</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Correct */}
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {result.correctAnswers}/{result.totalQuestions}
              </p>
              <p className="text-xs text-gray-500 mt-1">Acertos</p>
            </div>

            {/* Time */}
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                {formatTime(result.timeSpent)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Tempo</p>
            </div>

            {/* XP */}
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                +{animatedXP}
              </p>
              <p className="text-xs text-gray-500 mt-1">XP</p>
            </div>
          </div>
        </div>

        {/* XP Animation */}
        <div
          className={`flex items-center gap-2 text-lg font-medium mb-8 transition-all duration-500 delay-500 ${
            showAnimation ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="text-2xl">⚡</span>
          <span className="text-purple-400">+{result.xpEarned} XP ganhos!</span>
        </div>
      </div>

      {/* Actions */}
      <div
        className={`flex-shrink-0 px-6 pb-safe py-6 space-y-3 transition-all duration-500 delay-700 ${
          showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Share button */}
        <button
          onClick={() => setShowShareCard(true)}
          className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <span>📤</span>
          Compartilhar
        </button>

        {/* Primary actions */}
        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
          >
            Jogar Novamente
          </button>

          {onNextDrill ? (
            <button
              onClick={onNextDrill}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30"
            >
              Próximo Drill →
            </button>
          ) : (
            <button
              onClick={onBack}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30"
            >
              Voltar
            </button>
          )}
        </div>
      </div>

      {/* Share card modal */}
      {showShareCard && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50"
          onClick={() => setShowShareCard(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ShareCard
              title={drillTitle}
              score={result.score}
              stars={result.stars}
              xpEarned={result.xpEarned}
            />
            <button
              onClick={() => setShowShareCard(false)}
              className="w-full mt-4 py-3 bg-gray-800 text-white rounded-xl"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DrillComplete;
