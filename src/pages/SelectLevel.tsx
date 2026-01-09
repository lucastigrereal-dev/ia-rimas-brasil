/**
 * @fileoverview Tela de Seleção de Nível
 * @module pages/SelectLevel
 */

import { useState } from 'react';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

interface SelectLevelProps {
  /** Callback ao selecionar nível */
  onSelect: (level: SkillLevel) => void;
}

interface LevelOption {
  id: SkillLevel;
  emoji: string;
  title: string;
  description: string;
  features: string[];
  color: string;
}

const levelOptions: LevelOption[] = [
  {
    id: 'beginner',
    emoji: '🌱',
    title: 'Iniciante',
    description: 'Nunca rimei ou estou começando agora',
    features: [
      'Exercícios básicos de rima',
      'Vocabulário expandido',
      'Ritmo e compasso',
    ],
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'intermediate',
    emoji: '🔥',
    title: 'Intermediário',
    description: 'Já rimo mas quero evoluir',
    features: [
      'Rimas complexas',
      'Flows variados',
      'Construção de punchlines',
    ],
    color: 'from-orange-500 to-amber-500',
  },
  {
    id: 'advanced',
    emoji: '👑',
    title: 'Avançado',
    description: 'Rimo bem, quero dominar',
    features: [
      'Multissilábicas avançadas',
      'Batalhas simuladas',
      'Improvisação livre',
    ],
    color: 'from-purple-500 to-pink-500',
  },
];

/**
 * Tela de Seleção de Nível
 */
export function SelectLevel({ onSelect }: SelectLevelProps) {
  const [selected, setSelected] = useState<SkillLevel | null>(null);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 pt-safe px-6 py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">
          Qual seu nível de freestyle?
        </h1>
        <p className="text-gray-500">
          Isso ajuda a personalizar seus treinos
        </p>
      </div>

      {/* Level options */}
      <div className="flex-1 px-6 space-y-4 overflow-auto">
        {levelOptions.map((level) => {
          const isSelected = selected === level.id;

          return (
            <button
              key={level.id}
              onClick={() => setSelected(level.id)}
              className={`
                w-full text-left rounded-2xl p-4 transition-all duration-300
                border-2
                ${isSelected
                  ? `bg-gradient-to-br ${level.color} border-transparent shadow-lg scale-[1.02]`
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }
              `}
            >
              <div className="flex items-start gap-4">
                {/* Emoji */}
                <span className="text-4xl">{level.emoji}</span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg">{level.title}</h3>
                  <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                    {level.description}
                  </p>

                  {/* Features */}
                  <ul className="mt-3 space-y-1">
                    {level.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className={`text-xs flex items-center gap-2 ${
                          isSelected ? 'text-white/70' : 'text-gray-500'
                        }`}
                      >
                        <span className="w-1 h-1 rounded-full bg-current" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Selection indicator */}
                <div
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${isSelected
                      ? 'border-white bg-white'
                      : 'border-gray-600'
                    }
                  `}
                >
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {/* Info text */}
        <p className="text-center text-gray-600 text-xs pt-2">
          Você pode mudar isso depois nas configurações
        </p>
      </div>

      {/* Bottom button */}
      <div className="flex-shrink-0 px-6 pb-safe py-6">
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className={`
            w-full py-4 rounded-xl font-bold text-lg transition-all
            ${selected
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

export default SelectLevel;
