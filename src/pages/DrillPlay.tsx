/**
 * @fileoverview Tela de Execução do Drill
 * @module pages/DrillPlay
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DrillLayout } from '../components/Layout';
import { useTimer } from '../hooks/useTimer';

interface DrillPlayProps {
  /** ID do drill */
  drillId: string;
  /** Voltar para lista */
  onBack: () => void;
  /** Ao completar */
  onComplete: (result: DrillResult) => void;
}

interface DrillResult {
  drillId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  xpEarned: number;
  stars: 1 | 2 | 3;
}

interface Question {
  id: number;
  type: 'fill' | 'choice' | 'freestyle';
  prompt: string;
  hint?: string;
  options?: string[];
  correctAnswer?: string;
  acceptedAnswers?: string[];
}

// Mock questions for demo
const mockQuestions: Question[] = [
  {
    id: 1,
    type: 'fill',
    prompt: 'Complete a rima: "Meu flow é pesado como _____"',
    hint: 'Pense em algo pesado',
    acceptedAnswers: ['chumbo', 'ferro', 'pedra', 'rocha', 'concreto'],
  },
  {
    id: 2,
    type: 'choice',
    prompt: 'Qual palavra rima melhor com "freestyle"?',
    options: ['estilo', 'simples', 'Brasil', 'infantil'],
    correctAnswer: 'estilo',
  },
  {
    id: 3,
    type: 'fill',
    prompt: 'Crie uma rima para: "Subindo no game, não tem como _____"',
    hint: 'Verbo que indica impedimento',
    acceptedAnswers: ['parar', 'travar', 'brecar', 'barrar', 'frear'],
  },
  {
    id: 4,
    type: 'freestyle',
    prompt: 'Crie um verso sobre: SUPERAÇÃO',
    hint: 'Mínimo 8 palavras',
  },
  {
    id: 5,
    type: 'fill',
    prompt: 'Rima multissilábica: "Minha mente brilhante _____"',
    hint: '3 sílabas em comum',
    acceptedAnswers: ['é diamante', 'constante', 'radiante', 'dominante'],
  },
];

/**
 * Tela de Execução do Drill
 */
export function DrillPlay({ drillId, onBack, onComplete }: DrillPlayProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<{ questionId: number; answer: string; isCorrect: boolean }[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timer = useTimer({ mode: 'stopwatch', autoStart: true });
  const question = mockQuestions[currentQuestion];
  const progress = ((currentQuestion) / mockQuestions.length) * 100;

  /**
   * Verifica se resposta está correta
   */
  const checkAnswer = useCallback((userAnswer: string, q: Question): boolean => {
    const normalized = userAnswer.toLowerCase().trim();

    if (q.type === 'choice') {
      return normalized === q.correctAnswer?.toLowerCase();
    }

    if (q.type === 'fill' && q.acceptedAnswers) {
      return q.acceptedAnswers.some((a) => normalized.includes(a.toLowerCase()));
    }

    // Freestyle: aceita se tem mínimo de palavras
    if (q.type === 'freestyle') {
      return normalized.split(' ').filter(Boolean).length >= 8;
    }

    return false;
  }, []);

  /**
   * Submete resposta
   */
  const handleSubmit = async () => {
    if (!answer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const correct = checkAnswer(answer, question);
    setIsCorrect(correct);

    setAnswers((prev) => [
      ...prev,
      { questionId: question.id, answer, isCorrect: correct },
    ]);

    setShowFeedback(true);

    // Aguarda feedback e avança
    setTimeout(() => {
      setShowFeedback(false);
      setIsSubmitting(false);
      setAnswer('');

      if (currentQuestion < mockQuestions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        // Finaliza drill
        finishDrill();
      }
    }, 1500);
  };

  /**
   * Seleciona opção em questão de múltipla escolha
   */
  const handleSelectOption = (option: string) => {
    setAnswer(option);
  };

  /**
   * Finaliza o drill e calcula resultado
   */
  const finishDrill = () => {
    timer.pause();

    const correctCount = answers.filter((a) => a.isCorrect).length + (isCorrect ? 1 : 0);
    const score = Math.round((correctCount / mockQuestions.length) * 100);
    const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1;
    const xpEarned = Math.round(50 * (score / 100) * stars);

    const result: DrillResult = {
      drillId,
      score,
      totalQuestions: mockQuestions.length,
      correctAnswers: correctCount,
      timeSpent: timer.time,
      xpEarned,
      stars: stars as 1 | 2 | 3,
    };

    onComplete(result);
  };

  /**
   * Formata tempo
   */
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <DrillLayout title={`Questão ${currentQuestion + 1}/${mockQuestions.length}`} onBack={onBack}>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progresso</span>
          <span className="text-purple-400 font-mono">{formatTime(timer.time)}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
        {/* Question type badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${question.type === 'fill' ? 'bg-blue-500/20 text-blue-400' : ''}
            ${question.type === 'choice' ? 'bg-green-500/20 text-green-400' : ''}
            ${question.type === 'freestyle' ? 'bg-purple-500/20 text-purple-400' : ''}
          `}>
            {question.type === 'fill' && '✍️ Complete'}
            {question.type === 'choice' && '🔘 Escolha'}
            {question.type === 'freestyle' && '🎤 Freestyle'}
          </span>
        </div>

        {/* Prompt */}
        <p className="text-lg font-medium leading-relaxed mb-4">
          {question.prompt}
        </p>

        {/* Hint */}
        {question.hint && (
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <span>💡</span>
            {question.hint}
          </p>
        )}
      </div>

      {/* Answer section */}
      <div className="space-y-4">
        {/* Multiple choice */}
        {question.type === 'choice' && question.options && (
          <div className="grid grid-cols-2 gap-3">
            {question.options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelectOption(option)}
                disabled={showFeedback}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all
                  ${answer === option
                    ? showFeedback
                      ? isCorrect
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-red-500 bg-red-500/20'
                      : 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }
                  disabled:opacity-50
                `}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Text input */}
        {(question.type === 'fill' || question.type === 'freestyle') && (
          <div>
            {question.type === 'freestyle' ? (
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Digite seu verso aqui..."
                disabled={showFeedback}
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none disabled:opacity-50"
              />
            ) : (
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Digite sua resposta..."
                disabled={showFeedback}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
            )}
          </div>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div className={`
            p-4 rounded-xl flex items-center gap-3
            ${isCorrect
              ? 'bg-green-500/20 border border-green-500/50'
              : 'bg-red-500/20 border border-red-500/50'
            }
          `}>
            <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
            <div>
              <p className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? 'Muito bom!' : 'Quase lá!'}
              </p>
              {!isCorrect && question.type !== 'freestyle' && (
                <p className="text-sm text-gray-400 mt-1">
                  Resposta esperada: {question.correctAnswer || question.acceptedAnswers?.[0]}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Submit button */}
        {!showFeedback && (
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === mockQuestions.length - 1 ? 'Finalizar' : 'Confirmar'}
          </button>
        )}
      </div>

      {/* Question dots */}
      <div className="flex justify-center gap-1.5 mt-6">
        {mockQuestions.map((_, idx) => {
          const answered = answers[idx];
          return (
            <div
              key={idx}
              className={`
                w-2 h-2 rounded-full transition-all
                ${idx === currentQuestion
                  ? 'w-6 bg-purple-500'
                  : answered
                    ? answered.isCorrect
                      ? 'bg-green-500'
                      : 'bg-red-500'
                    : 'bg-gray-700'
                }
              `}
            />
          );
        })}
      </div>
    </DrillLayout>
  );
}

export default DrillPlay;
