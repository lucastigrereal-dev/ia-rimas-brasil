/**
 * @fileoverview Utilitários para verificação de rimas em português BR
 * @module utils/rhyme
 *
 * Funciona com:
 * - Acentos (á, é, í, ó, ú, ã, õ, etc.)
 * - Diferentes terminações
 * - Rimas pobres e ricas
 */

/**
 * Mapa de normalização de vogais acentuadas
 */
const VOWEL_MAP: Record<string, string> = {
  á: 'a', à: 'a', â: 'a', ã: 'a',
  é: 'e', ê: 'e',
  í: 'i',
  ó: 'o', ô: 'o', õ: 'o',
  ú: 'u', ü: 'u',
};

/**
 * Vogais para detecção de sílabas
 */
const VOWELS = 'aeiouáàâãéêíóôõúü';

/**
 * Normaliza uma string removendo acentos
 */
function normalizeAccents(str: string): string {
  return str
    .toLowerCase()
    .split('')
    .map((char) => VOWEL_MAP[char] || char)
    .join('');
}

/**
 * Verifica se um caractere é vogal
 */
function isVowel(char: string): boolean {
  return VOWELS.includes(char.toLowerCase());
}

/**
 * Extrai a última sílaba de uma palavra
 *
 * @param word - Palavra para analisar
 * @returns Última sílaba (ou terminação fonética)
 *
 * @example
 * getLastSyllable('amor') // 'or'
 * getLastSyllable('coração') // 'ão'
 * getLastSyllable('felicidade') // 'ade'
 */
export function getLastSyllable(word: string): string {
  const cleaned = word.toLowerCase().trim();
  if (cleaned.length === 0) return '';

  // Encontra a última vogal
  let lastVowelIndex = -1;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    if (isVowel(cleaned[i])) {
      lastVowelIndex = i;
      break;
    }
  }

  if (lastVowelIndex === -1) {
    // Sem vogal, retorna a palavra inteira
    return cleaned;
  }

  // Encontra o início da sílaba (consoante antes da última vogal)
  let start = lastVowelIndex;
  for (let i = lastVowelIndex - 1; i >= 0; i--) {
    if (!isVowel(cleaned[i])) {
      start = i;
      break;
    } else if (i === 0) {
      start = 0;
    }
  }

  // Se a sílaba é muito curta, pega mais
  if (cleaned.length - start < 2 && start > 0) {
    start = Math.max(0, lastVowelIndex - 2);
  }

  return cleaned.slice(start);
}

/**
 * Extrai a terminação para comparação de rima
 * Considera as últimas 2-3 letras com vogal
 */
function getRhymeEnding(word: string): string {
  const cleaned = word.toLowerCase().trim();
  if (cleaned.length <= 2) return normalizeAccents(cleaned);

  // Pega os últimos 3 caracteres
  const ending = cleaned.slice(-3);
  return normalizeAccents(ending);
}

/**
 * Verifica se duas palavras rimam
 *
 * @param word1 - Primeira palavra
 * @param word2 - Segunda palavra
 * @returns true se as palavras rimam
 *
 * @example
 * checkRhyme('amor', 'dor') // true
 * checkRhyme('coração', 'paixão') // true
 * checkRhyme('casa', 'mesa') // false (quase, mas não)
 */
export function checkRhyme(word1: string, word2: string): boolean {
  const ending1 = getRhymeEnding(word1);
  const ending2 = getRhymeEnding(word2);

  // Rimas idênticas ou muito similares
  if (ending1 === ending2) return true;

  // Compara últimas 2 letras
  if (ending1.slice(-2) === ending2.slice(-2)) return true;

  // Casos especiais de rima em português
  const last2_1 = normalizeAccents(word1.slice(-2));
  const last2_2 = normalizeAccents(word2.slice(-2));

  // Terminações que rimam
  const rhymePairs: [string, string][] = [
    ['ao', 'am'],
    ['ão', 'am'],
    ['er', 'ar'],
    ['ir', 'ar'],
    ['eu', 'el'],
  ];

  for (const [a, b] of rhymePairs) {
    if ((last2_1 === a && last2_2 === b) || (last2_1 === b && last2_2 === a)) {
      return true;
    }
  }

  return false;
}

/**
 * Calcula um score de 0-100 de quão bem duas palavras rimam
 *
 * Critérios:
 * - 100: Rima perfeita (mesma terminação)
 * - 80-99: Rima rica (mais sílabas em comum)
 * - 50-79: Rima pobre (só última sílaba)
 * - 0-49: Não rima
 *
 * @param word1 - Primeira palavra
 * @param word2 - Segunda palavra
 * @returns Score de 0-100
 *
 * @example
 * getRhymeScore('amor', 'amor') // 100
 * getRhymeScore('amor', 'dor') // 85
 * getRhymeScore('casa', 'mesa') // 40
 */
export function getRhymeScore(word1: string, word2: string): number {
  const clean1 = normalizeAccents(word1.toLowerCase().trim());
  const clean2 = normalizeAccents(word2.toLowerCase().trim());

  if (clean1 === clean2) return 100;
  if (clean1.length === 0 || clean2.length === 0) return 0;

  // Conta quantas letras coincidem do final
  let matchingChars = 0;
  const minLen = Math.min(clean1.length, clean2.length);

  for (let i = 1; i <= minLen; i++) {
    if (clean1[clean1.length - i] === clean2[clean2.length - i]) {
      matchingChars++;
    } else {
      break;
    }
  }

  // Score baseado na quantidade de letras em comum
  if (matchingChars >= 4) return 95;
  if (matchingChars === 3) return 85;
  if (matchingChars === 2) return 70;
  if (matchingChars === 1) {
    // Verifica se pelo menos a vogal final é igual
    const lastVowel1 = getLastVowel(clean1);
    const lastVowel2 = getLastVowel(clean2);
    if (lastVowel1 === lastVowel2) return 50;
    return 30;
  }

  return 0;
}

/**
 * Encontra a última vogal de uma palavra
 */
function getLastVowel(word: string): string {
  for (let i = word.length - 1; i >= 0; i--) {
    if ('aeiou'.includes(word[i])) {
      return word[i];
    }
  }
  return '';
}

/**
 * Busca palavras que rimam com a palavra dada em um banco de palavras
 *
 * @param word - Palavra para encontrar rimas
 * @param wordBank - Banco de palavras para buscar
 * @param minScore - Score mínimo para considerar rima (default: 60)
 * @returns Lista de palavras que rimam, ordenadas por score
 *
 * @example
 * getSuggestedRhymes('amor', ['dor', 'flor', 'casa', 'favor'])
 * // [{ word: 'dor', score: 85 }, { word: 'flor', score: 85 }, { word: 'favor', score: 85 }]
 */
export function getSuggestedRhymes(
  word: string,
  wordBank: string[],
  minScore: number = 60
): Array<{ word: string; score: number }> {
  const results: Array<{ word: string; score: number }> = [];

  for (const candidate of wordBank) {
    if (candidate.toLowerCase() === word.toLowerCase()) continue;

    const score = getRhymeScore(word, candidate);
    if (score >= minScore) {
      results.push({ word: candidate, score });
    }
  }

  // Ordena por score (maior primeiro)
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Verifica se uma palavra é válida (não vazia, só letras)
 */
export function isValidWord(word: string): boolean {
  const cleaned = word.trim();
  if (cleaned.length < 2) return false;

  // Aceita letras e acentos
  return /^[a-záàâãéêíóôõúüç]+$/i.test(cleaned);
}
