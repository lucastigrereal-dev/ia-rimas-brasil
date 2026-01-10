/**
 * @fileoverview Tela de Onboarding (4 slides)
 * @module pages/Onboarding
 */

import { useState } from 'react';

interface OnboardingProps {
  /** Callback ao finalizar */
  onComplete: () => void;
  /** Callback para pular */
  onSkip?: () => void;
}

interface Slide {
  emoji: string;
  title: string;
  description: string;
  color: string;
}

const slides: Slide[] = [
  {
    emoji: '🎤',
    title: 'Treine seu Freestyle',
    description: 'Desenvolva suas habilidades de improvisação com exercícios diários personalizados',
    color: 'from-purple-500 to-pink-500',
  },
  {
    emoji: '🎯',
    title: 'Drills Progressivos',
    description: 'Do básico ao avançado: rimas, flows, punchlines e batalhas simuladas',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    emoji: '🔥',
    title: 'Mantenha a Streak',
    description: 'Pratique todo dia e ganhe recompensas especiais por consistência',
    color: 'from-orange-500 to-red-500',
  },
  {
    emoji: '🏆',
    title: 'Suba no Ranking',
    description: 'Compete com outros MCs, ganhe XP e desbloqueie conquistas únicas',
    color: 'from-yellow-500 to-orange-500',
  },
];

/**
 * Tela de Onboarding
 */
export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];

  /**
   * Avança para próximo slide ou finaliza
   */
  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  /**
   * Volta para slide anterior
   */
  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  /**
   * Vai direto para um slide
   */
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Skip button */}
      {onSkip && !isLastSlide && (
        <button
          onClick={onSkip}
          className="absolute top-safe right-4 mt-4 text-gray-500 hover:text-gray-300 text-sm font-medium z-10"
        >
          Pular
        </button>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Animated background glow */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${slide.color} opacity-10 blur-3xl transition-all duration-500`}
        />

        {/* Emoji */}
        <div className="relative">
          <div
            className={`absolute inset-0 bg-gradient-to-r ${slide.color} blur-2xl opacity-30 rounded-full scale-150`}
          />
          <span className="relative text-8xl block mb-8 animate-bounce">
            {slide.emoji}
          </span>
        </div>

        {/* Title */}
        <h1
          className={`text-3xl font-bold text-center mb-4 bg-gradient-to-r ${slide.color} bg-clip-text text-transparent`}
        >
          {slide.title}
        </h1>

        {/* Description */}
        <p className="text-gray-400 text-center text-lg max-w-xs leading-relaxed">
          {slide.description}
        </p>
      </div>

      {/* Bottom navigation */}
      <div className="flex-shrink-0 px-6 pb-safe py-8">
        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? `w-8 bg-gradient-to-r ${slide.color}`
                  : 'w-2 bg-gray-700 hover:bg-gray-600'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {currentSlide > 0 && (
            <button
              onClick={handlePrev}
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              Voltar
            </button>
          )}

          <button
            onClick={handleNext}
            className={`flex-1 py-3 bg-gradient-to-r ${slide.color} text-white font-bold rounded-lg transition-all shadow-lg ${
              isLastSlide ? 'shadow-purple-500/30' : ''
            }`}
          >
            {isLastSlide ? 'Começar!' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
