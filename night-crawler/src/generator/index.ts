/**
 * Módulo de Geração Híbrida de Rimas
 *
 * Sistema que combina:
 * - SQLite FTS5 para busca de letras similares
 * - OpenAI GPT-4o-mini para geração de versos
 * - Ollama LLM local para validação de qualidade
 *
 * @example
 * ```typescript
 * import { RhymeGenerator } from './generator';
 *
 * const gerador = new RhymeGenerator();
 *
 * const resultado = await gerador.gerar({
 *     tema: 'superação',
 *     estilo: 'consciente'
 * });
 *
 * console.log(resultado.versos);
 * // ['Da quebrada eu vim, não vou esquecer',
 * //  'Cada luta me fez mais forte crescer', ...]
 * ```
 *
 * @packageDocumentation
 */

// ===========================================
// CLASSE PRINCIPAL
// ===========================================

export { RhymeGenerator, default } from './rhyme-generator.js';

// ===========================================
// COMPONENTES INDIVIDUAIS
// (para uso avançado ou testes)
// ===========================================

export { FTSSearch } from './fts-search.js';
export { PatternExtractor } from './pattern-extractor.js';
export { OpenAIClient } from './openai-client.js';
export { RhymeValidator } from './validator.js';

// ===========================================
// TIPOS E INTERFACES
// ===========================================

// Re-export types
export type {
    EstiloRap,
    InputGeracao,
    ResultadoGeracao,
    CustoGeracao,
    LetraEncontrada,
    ParRima,
    TipoRima,
    PadroesExtraidos,
    ResultadoValidacao,
    CriteriosValidacao,
    ConfigGeracao,
    CodigoErro
} from './types.js';

// Re-export values
export {
    ESTILO_MAP,
    CONFIG_PADRAO,
    ErroGeracao
} from './types.js';
