/**
 * @fileoverview Motor de execução de Drills
 * @module services/drillEngine
 */

import { getDrillById, type DrillDefinition } from '../data/drills';
import { getRandomQuestions, type Question } from '../data/questions';
import { checkRhyme } from '../utils/rhyme';

export interface DrillSession {
  drillId: string;
  drill: DrillDefinition;
  questions: Question[];
  currentIndex: number;
  answers: AnswerRecord[];
  startTime: number;
  endTime?: number;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface AnswerRecord {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number;
  points: number;
}

export interface DrillResult {
  drillId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  totalPoints: number;
  maxPoints: number;
  timeSpent: number;
  xpEarned: number;
  stars: 1 | 2 | 3;
  answers: AnswerRecord[];
}

/**
 * Inicia uma nova sessão de drill
 */
export function startDrillSession(drillId: string): DrillSession | null {
  const drill = getDrillById(drillId);
  if (!drill) return null;

  const questions = getRandomQuestions(drillId, drill.questionsCount);
  if (questions.length === 0) return null;

  return {
    drillId,
    drill,
    questions,
    currentIndex: 0,
    answers: [],
    startTime: Date.now(),
    status: 'in_progress',
  };
}

/**
 * Obtém a questão atual
 */
export function getCurrentQuestion(session: DrillSession): Question | null {
  if (session.currentIndex >= session.questions.length) return null;
  return session.questions[session.currentIndex];
}

/**
 * Verifica se a resposta está correta
 */
export function checkAnswer(question: Question, userAnswer: string): boolean {
  const normalized = userAnswer.toLowerCase().trim();

  // Questão de múltipla escolha
  if (question.type === 'choice' && question.correctAnswer) {
    return normalized === question.correctAnswer.toLowerCase();
  }

  // Questão de completar
  if (question.type === 'fill' && question.acceptedAnswers) {
    return question.acceptedAnswers.some((answer) =>
      normalized.includes(answer.toLowerCase())
    );
  }

  // Questão freestyle - verifica quantidade mínima de palavras
  if (question.type === 'freestyle') {
    const wordCount = normalized.split(/\s+/).filter(Boolean).length;
    const minWords = question.minWords || 5;

    if (wordCount < minWords) return false;

    // Para freestyle, consideramos correto se tem palavras suficientes
    // Em uma implementação real, poderia usar IA para avaliar qualidade
    return true;
  }

  return false;
}

/**
 * Calcula pontos para uma resposta
 */
export function calculatePoints(
  question: Question,
  isCorrect: boolean,
  timeSpent: number
): number {
  if (!isCorrect) return 0;

  let points = question.points;

  // Bônus de tempo (se respondeu rápido)
  const maxTime = question.maxTime || 60; // 60 segundos padrão
  const timeInSeconds = timeSpent / 1000;

  if (timeInSeconds < maxTime * 0.5) {
    points = Math.round(points * 1.2); // 20% bônus
  } else if (timeInSeconds < maxTime * 0.75) {
    points = Math.round(points * 1.1); // 10% bônus
  }

  return points;
}

/**
 * Submete uma resposta
 */
export function submitAnswer(
  session: DrillSession,
  answer: string,
  questionStartTime: number
): AnswerRecord {
  const question = getCurrentQuestion(session);
  if (!question) {
    throw new Error('No current question');
  }

  const timeSpent = Date.now() - questionStartTime;
  const isCorrect = checkAnswer(question, answer);
  const points = calculatePoints(question, isCorrect, timeSpent);

  const record: AnswerRecord = {
    questionId: question.id,
    answer,
    isCorrect,
    timeSpent,
    points,
  };

  session.answers.push(record);
  session.currentIndex++;

  return record;
}

/**
 * Verifica se o drill terminou
 */
export function isDrillComplete(session: DrillSession): boolean {
  return session.currentIndex >= session.questions.length;
}

/**
 * Calcula estrelas baseado no score
 */
export function calculateStars(scorePercent: number): 1 | 2 | 3 {
  if (scorePercent >= 90) return 3;
  if (scorePercent >= 70) return 2;
  return 1;
}

/**
 * Calcula XP ganho
 */
export function calculateXPEarned(
  drill: DrillDefinition,
  scorePercent: number,
  stars: number
): number {
  const baseXP = drill.xpReward;
  const scoreMultiplier = scorePercent / 100;
  const starsMultiplier = stars === 3 ? 1.5 : stars === 2 ? 1.2 : 1.0;

  return Math.round(baseXP * scoreMultiplier * starsMultiplier);
}

/**
 * Finaliza a sessão e calcula resultados
 */
export function finishDrill(session: DrillSession): DrillResult {
  session.endTime = Date.now();
  session.status = 'completed';

  const correctAnswers = session.answers.filter((a) => a.isCorrect).length;
  const totalQuestions = session.questions.length;
  const totalPoints = session.answers.reduce((sum, a) => sum + a.points, 0);
  const maxPoints = session.questions.reduce((sum, q) => sum + q.points, 0);

  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const stars = calculateStars(score);
  const xpEarned = calculateXPEarned(session.drill, score, stars);
  const timeSpent = session.endTime - session.startTime;

  return {
    drillId: session.drillId,
    score,
    totalQuestions,
    correctAnswers,
    totalPoints,
    maxPoints,
    timeSpent,
    xpEarned,
    stars,
    answers: session.answers,
  };
}

/**
 * Abandona a sessão
 */
export function abandonDrill(session: DrillSession): void {
  session.status = 'abandoned';
  session.endTime = Date.now();
}

/**
 * Calcula progresso da sessão em porcentagem
 */
export function getSessionProgress(session: DrillSession): number {
  return Math.round((session.currentIndex / session.questions.length) * 100);
}

/**
 * Verifica se resposta é uma rima válida
 */
export function validateRhyme(word1: string, word2: string): boolean {
  return checkRhyme(word1, word2);
}

export default {
  startDrillSession,
  getCurrentQuestion,
  checkAnswer,
  submitAnswer,
  isDrillComplete,
  finishDrill,
  abandonDrill,
  getSessionProgress,
  validateRhyme,
};
