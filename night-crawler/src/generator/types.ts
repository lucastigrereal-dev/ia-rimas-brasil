/**
 * Tipos e interfaces do sistema de geração de rimas
 *
 * Este módulo define todas as estruturas de dados usadas
 * pelo gerador híbrido de rimas.
 */

// ===========================================
// TIPOS DE ESTILO
// ===========================================

/**
 * Estilos de rap suportados pelo sistema
 */
export type EstiloRap = 'gangsta' | 'consciente' | 'trap' | 'boom_bap' | 'poetico';

/**
 * Mapeamento de estilos da API para estilos do banco
 * O banco usa nomenclatura diferente em alguns casos
 */
export const ESTILO_MAP: Record<EstiloRap, string[]> = {
    gangsta: ['agressivo', 'gangsta', 'indefinido'],
    consciente: ['consciente', 'storytelling', 'indefinido'],
    trap: ['festa', 'trap', 'indefinido'],
    boom_bap: ['tecnico', 'boom_bap', 'indefinido'],
    poetico: ['romantico', 'poetico', 'indefinido']
};

// ===========================================
// INPUTS E OUTPUTS
// ===========================================

/**
 * Input para geração de rimas
 */
export interface InputGeracao {
    /** Tema principal da letra (ex: "superação na quebrada") */
    tema: string;
    /** Estilo de rap desejado */
    estilo: EstiloRap;
    /** Contexto adicional opcional para guiar a geração */
    contexto?: string;
}

/**
 * Resultado final da geração
 */
export interface ResultadoGeracao {
    /** Array com os 4 versos gerados */
    versos: string[];
    /** Versos unidos com \n para exibição */
    versosFormatados: string;
    /** Score final de qualidade (0-10) */
    score: number;
    /** Quantas tentativas foram necessárias */
    tentativas: number;
    /** Se passou na validação (score >= 7.0) */
    aprovado: boolean;
    /** Letras que serviram de inspiração */
    inspiracao: LetraEncontrada[];
    /** Padrões extraídos e utilizados */
    padroes: PadroesExtraidos;
    /** Detalhes da validação */
    validacao: ResultadoValidacao;
    /** Custos da geração */
    custo: CustoGeracao;
    /** Tempo total em milissegundos */
    tempo_ms: number;
}

/**
 * Custos da geração
 */
export interface CustoGeracao {
    /** Tokens de input consumidos */
    tokens_input: number;
    /** Tokens de output gerados */
    tokens_output: number;
    /** Custo total em reais */
    custo_reais: number;
}

// ===========================================
// BUSCA E LETRAS
// ===========================================

/**
 * Letra encontrada no banco via FTS5
 */
export interface LetraEncontrada {
    /** ID interno da letra */
    id: number;
    /** Título da música */
    titulo: string;
    /** Nome do artista */
    artista: string;
    /** Texto completo da letra */
    letra: string;
    /** Estilo classificado */
    estilo: string;
    /** Score de qualidade (0-1) */
    qualidade: number;
    /** Temas identificados */
    temas: string[];
    /** Score de relevância da busca FTS5 */
    rank: number;
}

// ===========================================
// PADRÕES EXTRAÍDOS
// ===========================================

/**
 * Par de rima extraído das letras
 */
export interface ParRima {
    /** Primeira palavra que rima */
    palavra1: string;
    /** Segunda palavra que rima */
    palavra2: string;
    /** Tipo de rima detectada */
    tipo: TipoRima;
    /** Score de qualidade da rima (0-1) */
    score: number;
    /** Verso de origem da primeira palavra */
    verso1?: string;
    /** Verso de origem da segunda palavra */
    verso2?: string;
}

/**
 * Tipos de rima suportados
 */
export type TipoRima = 'perfeita' | 'toante' | 'consoante' | 'interna';

/**
 * Padrões extraídos de um conjunto de letras
 */
export interface PadroesExtraidos {
    /** Palavras-chave mais frequentes relacionadas ao tema */
    palavrasChave: string[];
    /** Pares de rimas de alta qualidade */
    paresRimas: ParRima[];
    /** Blocos de 4 versos de exemplo */
    versosExemplo: string[];
    /** Distribuição de sílabas por verso */
    estruturaMetrica: number[];
    /** Vocabulário específico do tema/estilo */
    vocabularioTematico: string[];
}

// ===========================================
// VALIDAÇÃO
// ===========================================

/**
 * Resultado da validação de qualidade
 */
export interface ResultadoValidacao {
    /** Score geral de qualidade (0-10) */
    score: number;
    /** Se foi aprovado (score >= 7.0) */
    aprovado: boolean;
    /** Explicação do score */
    feedback: string;
    /** Scores por critério */
    criterios: CriteriosValidacao;
}

/**
 * Critérios individuais de validação
 */
export interface CriteriosValidacao {
    /** Qualidade das rimas (0-10) */
    rima: number;
    /** Ritmo e métrica (0-10) */
    metrica: number;
    /** Coerência com o tema (0-10) */
    coerencia: number;
    /** Originalidade/criatividade (0-10) */
    originalidade: number;
}

// ===========================================
// CONFIGURAÇÃO
// ===========================================

/**
 * Configuração do gerador
 */
export interface ConfigGeracao {
    /** Número máximo de tentativas (default: 3) */
    maxTentativas: number;
    /** Score mínimo para aprovação (default: 7.0) */
    scoreMinimo: number;
    /** Quantidade de letras a buscar (default: 10) */
    letrasParaBuscar: number;
    /** Temperatura do GPT (default: 0.8) */
    temperaturaGPT: number;
    /** Max tokens de saída (default: 200) */
    maxTokensGPT: number;
}

/**
 * Configuração padrão do gerador
 */
export const CONFIG_PADRAO: ConfigGeracao = {
    maxTentativas: 3,
    scoreMinimo: 7.0,
    letrasParaBuscar: 10,
    temperaturaGPT: 0.8,
    maxTokensGPT: 200
};

// ===========================================
// ERROS
// ===========================================

/**
 * Códigos de erro do gerador
 */
export type CodigoErro =
    | 'FTS_VAZIO'        // Nenhuma letra encontrada
    | 'OPENAI_ERRO'      // Erro na API OpenAI
    | 'OLLAMA_ERRO'      // Erro na validação Ollama
    | 'VALIDACAO_FALHOU' // Score abaixo do mínimo
    | 'MAX_TENTATIVAS';  // Excedeu tentativas

/**
 * Erro customizado para geração
 */
export class ErroGeracao extends Error {
    constructor(
        message: string,
        public codigo: CodigoErro,
        public detalhes?: unknown
    ) {
        super(message);
        this.name = 'ErroGeracao';
    }
}
