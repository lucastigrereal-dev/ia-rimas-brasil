/**
 * @fileoverview Banco de questões para os drills
 * @module data/questions
 */

export type QuestionType = 'fill' | 'choice' | 'freestyle' | 'audio';

export interface Question {
  id: string;
  drillId: string;
  type: QuestionType;
  prompt: string;
  hint?: string;
  options?: string[];
  correctAnswer?: string;
  acceptedAnswers?: string[];
  minWords?: number;
  maxTime?: number; // in seconds
  points: number;
}

/**
 * Banco de questões organizado por drill
 */
export const questionBank: Record<string, Question[]> = {
  // ==================== RIMAS SIMPLES ====================
  'rimas-simples': [
    {
      id: 'rs-1',
      drillId: 'rimas-simples',
      type: 'fill',
      prompt: 'Complete a rima: "Meu flow é pesado como _____"',
      hint: 'Pense em algo pesado',
      acceptedAnswers: ['chumbo', 'ferro', 'pedra', 'rocha', 'concreto', 'aço'],
      points: 10,
    },
    {
      id: 'rs-2',
      drillId: 'rimas-simples',
      type: 'choice',
      prompt: 'Qual palavra rima melhor com "freestyle"?',
      options: ['estilo', 'simples', 'Brasil', 'infantil'],
      correctAnswer: 'estilo',
      points: 10,
    },
    {
      id: 'rs-3',
      drillId: 'rimas-simples',
      type: 'fill',
      prompt: 'Crie uma rima para: "Subindo no game, não tem como _____"',
      hint: 'Verbo que indica impedimento',
      acceptedAnswers: ['parar', 'travar', 'brecar', 'barrar', 'frear', 'duvidar'],
      points: 10,
    },
    {
      id: 'rs-4',
      drillId: 'rimas-simples',
      type: 'fill',
      prompt: 'Complete: "Na batida eu sou _____"',
      hint: 'Algo que domina',
      acceptedAnswers: ['rei', 'o cara', 'demais', 'foda', 'certeiro', 'ligeiro'],
      points: 10,
    },
    {
      id: 'rs-5',
      drillId: 'rimas-simples',
      type: 'choice',
      prompt: 'Qual rima com "rima"?',
      options: ['clima', 'prima', 'cima', 'todas'],
      correctAnswer: 'todas',
      points: 10,
    },
    {
      id: 'rs-6',
      drillId: 'rimas-simples',
      type: 'fill',
      prompt: 'Complete: "Minha mente é afiada como uma _____"',
      hint: 'Objeto cortante',
      acceptedAnswers: ['espada', 'faca', 'navalha', 'lâmina', 'gilete'],
      points: 10,
    },
    {
      id: 'rs-7',
      drillId: 'rimas-simples',
      type: 'fill',
      prompt: 'Rima para: "Eu vim da favela, não nego minha _____"',
      hint: 'Origem, história',
      acceptedAnswers: ['vida', 'história', 'estória', 'correria', 'família'],
      points: 10,
    },
  ],

  // ==================== RIMAS MÚLTIPLAS ====================
  'rimas-multiplas': [
    {
      id: 'rm-1',
      drillId: 'rimas-multiplas',
      type: 'freestyle',
      prompt: 'Escreva 3 palavras que rimam com "coração"',
      hint: 'Terminação -ão',
      minWords: 3,
      points: 15,
    },
    {
      id: 'rm-2',
      drillId: 'rimas-multiplas',
      type: 'freestyle',
      prompt: 'Escreva 3 rimas para "verdade"',
      hint: 'Terminação -ade',
      minWords: 3,
      points: 15,
    },
    {
      id: 'rm-3',
      drillId: 'rimas-multiplas',
      type: 'freestyle',
      prompt: 'Liste 3 palavras que rimam com "sucesso"',
      hint: 'Terminação -esso',
      minWords: 3,
      points: 15,
    },
    {
      id: 'rm-4',
      drillId: 'rimas-multiplas',
      type: 'freestyle',
      prompt: '3 rimas para "história"',
      hint: 'Terminação -ória',
      minWords: 3,
      points: 15,
    },
    {
      id: 'rm-5',
      drillId: 'rimas-multiplas',
      type: 'freestyle',
      prompt: 'Encontre 3 rimas para "caminho"',
      hint: 'Terminação -inho',
      minWords: 3,
      points: 15,
    },
  ],

  // ==================== MULTISSILÁBICAS ====================
  'rimas-multisilabicas': [
    {
      id: 'rms-1',
      drillId: 'rimas-multisilabicas',
      type: 'fill',
      prompt: 'Rima multissilábica: "Minha mente brilhante _____"',
      hint: '3 sílabas em comum',
      acceptedAnswers: ['é diamante', 'constante', 'radiante', 'dominante', 'importante'],
      points: 20,
    },
    {
      id: 'rms-2',
      drillId: 'rimas-multisilabicas',
      type: 'fill',
      prompt: 'Complete: "Inacreditável, _____"',
      hint: 'Mesma terminação -ável',
      acceptedAnswers: ['impecável', 'inegável', 'admirável', 'respeitável', 'imbatível'],
      points: 20,
    },
    {
      id: 'rms-3',
      drillId: 'rimas-multisilabicas',
      type: 'freestyle',
      prompt: 'Crie um verso rimando com "extraordinário"',
      hint: 'Terminação -ário, mínimo 8 palavras',
      minWords: 8,
      points: 25,
    },
    {
      id: 'rms-4',
      drillId: 'rimas-multisilabicas',
      type: 'fill',
      prompt: '"Problemático" rima com _____',
      hint: 'Terminação -ático',
      acceptedAnswers: ['sistemático', 'automático', 'pragmático', 'carismático', 'dramático'],
      points: 20,
    },
    {
      id: 'rms-5',
      drillId: 'rimas-multisilabicas',
      type: 'freestyle',
      prompt: 'Verso com rima para "revolucionário"',
      hint: 'Mínimo 10 palavras',
      minWords: 10,
      points: 25,
    },
  ],

  // ==================== FLOW BÁSICO ====================
  'flow-basico': [
    {
      id: 'fb-1',
      drillId: 'flow-basico',
      type: 'choice',
      prompt: 'Quantos tempos tem um compasso comum de hip-hop?',
      options: ['2 tempos', '4 tempos', '6 tempos', '8 tempos'],
      correctAnswer: '4 tempos',
      points: 10,
    },
    {
      id: 'fb-2',
      drillId: 'flow-basico',
      type: 'freestyle',
      prompt: 'Escreva um verso de 8 sílabas',
      hint: 'Conte as sílabas enquanto escreve',
      minWords: 4,
      points: 15,
    },
    {
      id: 'fb-3',
      drillId: 'flow-basico',
      type: 'freestyle',
      prompt: 'Crie 2 versos com a mesma quantidade de sílabas',
      hint: 'Mantenha a métrica igual',
      minWords: 8,
      points: 20,
    },
    {
      id: 'fb-4',
      drillId: 'flow-basico',
      type: 'choice',
      prompt: 'O que é "cair na batida"?',
      options: [
        'Errar o ritmo',
        'Encaixar as palavras no tempo da música',
        'Cantar muito rápido',
        'Pausar entre versos',
      ],
      correctAnswer: 'Encaixar as palavras no tempo da música',
      points: 10,
    },
  ],

  // ==================== PUNCHLINE TEMAS ====================
  'punchline-temas': [
    {
      id: 'pt-1',
      drillId: 'punchline-temas',
      type: 'freestyle',
      prompt: 'Crie uma punchline sobre: DINHEIRO',
      hint: 'Seja criativo e impactante',
      minWords: 8,
      points: 15,
    },
    {
      id: 'pt-2',
      drillId: 'punchline-temas',
      type: 'freestyle',
      prompt: 'Punchline sobre: SUPERAÇÃO',
      hint: 'Conte uma história de vitória',
      minWords: 10,
      points: 15,
    },
    {
      id: 'pt-3',
      drillId: 'punchline-temas',
      type: 'freestyle',
      prompt: 'Tema: CONFIANÇA',
      hint: 'Mostre autoestima',
      minWords: 8,
      points: 15,
    },
    {
      id: 'pt-4',
      drillId: 'punchline-temas',
      type: 'freestyle',
      prompt: 'Crie uma punchline sobre: TEMPO',
      hint: 'Pode ser literal ou metafórico',
      minWords: 8,
      points: 15,
    },
  ],

  // ==================== PUNCHLINE DO DIA ====================
  'punchline-diaria': [
    {
      id: 'pd-1',
      drillId: 'punchline-diaria',
      type: 'freestyle',
      prompt: 'Tema do dia: FORÇA',
      hint: 'Mostre sua força interior',
      minWords: 10,
      maxTime: 120,
      points: 30,
    },
    {
      id: 'pd-2',
      drillId: 'punchline-diaria',
      type: 'freestyle',
      prompt: 'Tema do dia: LIBERDADE',
      hint: 'O que liberdade significa pra você?',
      minWords: 10,
      maxTime: 120,
      points: 30,
    },
    {
      id: 'pd-3',
      drillId: 'punchline-diaria',
      type: 'freestyle',
      prompt: 'Tema do dia: FAMÍLIA',
      hint: 'Fale sobre suas raízes',
      minWords: 10,
      maxTime: 120,
      points: 30,
    },
  ],

  // ==================== BATALHA INTRO ====================
  'batalha-intro': [
    {
      id: 'bi-1',
      drillId: 'batalha-intro',
      type: 'freestyle',
      prompt: 'Crie uma intro se apresentando',
      hint: 'Quem é você no mic?',
      minWords: 15,
      points: 20,
    },
    {
      id: 'bi-2',
      drillId: 'batalha-intro',
      type: 'freestyle',
      prompt: 'Faça uma intro intimidadora',
      hint: 'Mostre que você veio pra vencer',
      minWords: 12,
      points: 20,
    },
    {
      id: 'bi-3',
      drillId: 'batalha-intro',
      type: 'freestyle',
      prompt: 'Intro mostrando de onde você veio',
      hint: 'Represente seu lugar',
      minWords: 12,
      points: 20,
    },
  ],

  // ==================== BATALHA RESPOSTA ====================
  'batalha-resposta': [
    {
      id: 'br-1',
      drillId: 'batalha-resposta',
      type: 'freestyle',
      prompt: 'Oponente disse: "Você é fraco, nem rima direito". Responda!',
      hint: 'Vire o jogo contra ele',
      minWords: 12,
      points: 25,
    },
    {
      id: 'br-2',
      drillId: 'batalha-resposta',
      type: 'freestyle',
      prompt: 'Ataque: "Seu flow é lento, parece tartaruga". Contra-ataque!',
      hint: 'Use a metáfora contra ele',
      minWords: 12,
      points: 25,
    },
    {
      id: 'br-3',
      drillId: 'batalha-resposta',
      type: 'freestyle',
      prompt: 'Oponente: "Você copia todo mundo, não tem estilo". Responda!',
      hint: 'Mostre sua originalidade',
      minWords: 12,
      points: 25,
    },
    {
      id: 'br-4',
      drillId: 'batalha-resposta',
      type: 'freestyle',
      prompt: 'Ataque: "Você só fala de dinheiro que não tem". Contra-ataque!',
      hint: 'Vire a narrativa',
      minWords: 12,
      points: 25,
    },
  ],
};

/**
 * Retorna questões de um drill
 */
export function getQuestionsByDrillId(drillId: string): Question[] {
  return questionBank[drillId] || [];
}

/**
 * Retorna questões aleatórias de um drill
 */
export function getRandomQuestions(drillId: string, count: number): Question[] {
  const questions = getQuestionsByDrillId(drillId);
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Retorna uma questão por ID
 */
export function getQuestionById(questionId: string): Question | undefined {
  for (const questions of Object.values(questionBank)) {
    const found = questions.find((q) => q.id === questionId);
    if (found) return found;
  }
  return undefined;
}

/**
 * Conta total de questões disponíveis
 */
export function getTotalQuestionsCount(): number {
  return Object.values(questionBank).reduce((acc, questions) => acc + questions.length, 0);
}

export default questionBank;
