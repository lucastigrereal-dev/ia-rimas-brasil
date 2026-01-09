/**
 * Gerador Híbrido de Rimas - Classe Principal
 *
 * Orquestra todo o fluxo de geração:
 * 1. Busca letras similares (SQLite FTS5)
 * 2. Extrai padrões das letras
 * 3. Gera versos (OpenAI GPT-4o-mini)
 * 4. Valida qualidade (Ollama local)
 * 5. Regenera se necessário (max 3x)
 *
 * Custo alvo: < R$ 0,01 por geração
 * Score alvo: 8.5+ médio
 */

import { FTSSearch } from './fts-search.js';
import { PatternExtractor } from './pattern-extractor.js';
import { OpenAIClient } from './openai-client.js';
import { RhymeValidator } from './validator.js';
import {
    InputGeracao,
    ResultadoGeracao,
    ConfigGeracao,
    CONFIG_PADRAO,
    ErroGeracao,
    LetraEncontrada,
    PadroesExtraidos,
    CustoGeracao
} from './types.js';

/**
 * Classe principal do sistema híbrido de geração de rimas
 *
 * @example
 * ```typescript
 * import { RhymeGenerator } from './generator';
 *
 * const gerador = new RhymeGenerator();
 *
 * const resultado = await gerador.gerar({
 *     tema: 'superação na quebrada',
 *     estilo: 'consciente',
 *     contexto: 'história de um jovem que venceu'
 * });
 *
 * console.log(resultado.versosFormatados);
 * console.log(`Score: ${resultado.score}/10`);
 * console.log(`Custo: R$ ${resultado.custo.custo_reais.toFixed(4)}`);
 * ```
 */
export class RhymeGenerator {
    private ftsSearch: FTSSearch;
    private patternExtractor: PatternExtractor;
    private openaiClient: OpenAIClient;
    private validator: RhymeValidator;
    private config: ConfigGeracao;

    constructor(config?: Partial<ConfigGeracao>) {
        this.config = { ...CONFIG_PADRAO, ...config };

        // Inicializar componentes
        this.ftsSearch = new FTSSearch();
        this.patternExtractor = new PatternExtractor();
        this.openaiClient = new OpenAIClient();
        this.validator = new RhymeValidator();
    }

    /**
     * Gera versos de rap baseados no tema e estilo
     *
     * @param input - Tema, estilo e contexto opcional
     * @returns Resultado completo da geração
     * @throws {ErroGeracao} Se não encontrar letras ou falhar após max tentativas
     */
    async gerar(input: InputGeracao): Promise<ResultadoGeracao> {
        const inicio = Date.now();

        // =========================================
        // ETAPA 1: BUSCA - Encontrar letras similares
        // =========================================
        this.log(`[1/4] Buscando letras similares para "${input.tema}"...`);

        const letras = this.ftsSearch.buscarLetrasSimilares(
            input.tema,
            input.estilo,
            input.contexto,
            this.config.letrasParaBuscar
        );

        if (letras.length === 0) {
            throw new ErroGeracao(
                `Nenhuma letra encontrada para tema "${input.tema}" no estilo "${input.estilo}"`,
                'FTS_VAZIO',
                { tema: input.tema, estilo: input.estilo }
            );
        }

        this.log(`      → ${letras.length} letras encontradas`);

        // =========================================
        // ETAPA 2: EXTRAÇÃO - Extrair padrões
        // =========================================
        this.log('[2/4] Extraindo padrões...');

        const padroes = this.patternExtractor.extrair(letras, input.tema);

        this.log(`      → ${padroes.paresRimas.length} pares de rimas`);
        this.log(`      → ${padroes.palavrasChave.length} palavras-chave`);
        this.log(`      → ${padroes.versosExemplo.length} exemplos`);

        // =========================================
        // ETAPA 3-4: GERAÇÃO + VALIDAÇÃO (loop)
        // =========================================
        let tentativa = 0;
        let melhorResultado: ResultadoGeracao | null = null;
        const custoAcumulado: CustoGeracao = {
            tokens_input: 0,
            tokens_output: 0,
            custo_reais: 0
        };

        while (tentativa < this.config.maxTentativas) {
            tentativa++;

            this.log(`[3/4] Gerando versos (tentativa ${tentativa}/${this.config.maxTentativas})...`);

            try {
                // Temperatura crescente a cada tentativa para mais criatividade
                const temperatura = Math.min(
                    1.0,
                    this.config.temperaturaGPT + (tentativa - 1) * 0.1
                );

                // GERAÇÃO
                const geracao = await this.openaiClient.gerarVersos(
                    input.tema,
                    input.estilo,
                    padroes,
                    input.contexto,
                    temperatura
                );

                // Acumular custos
                custoAcumulado.tokens_input += geracao.tokens_input;
                custoAcumulado.tokens_output += geracao.tokens_output;
                custoAcumulado.custo_reais += geracao.custo_reais;

                this.log(`      → ${geracao.versos.length} versos gerados`);
                this.log(`      → Custo: R$ ${geracao.custo_reais.toFixed(4)}`);

                // VALIDAÇÃO
                this.log('[4/4] Validando qualidade...');

                const validacao = await this.validator.validar(
                    geracao.versos,
                    input.tema,
                    input.estilo,
                    padroes
                );

                this.log(`      → Score: ${validacao.score}/10`);
                this.log(`      → ${validacao.feedback}`);

                // Montar resultado
                const resultado: ResultadoGeracao = {
                    versos: geracao.versos,
                    versosFormatados: geracao.versos.join('\n'),
                    score: validacao.score,
                    tentativas: tentativa,
                    aprovado: validacao.aprovado,
                    inspiracao: letras,
                    padroes,
                    validacao,
                    custo: { ...custoAcumulado },
                    tempo_ms: Date.now() - inicio
                };

                // Guardar melhor resultado até agora
                if (!melhorResultado || validacao.score > melhorResultado.score) {
                    melhorResultado = resultado;
                }

                // Se aprovado, retornar imediatamente
                if (validacao.aprovado) {
                    this.log(`\n✓ Geração aprovada com score ${validacao.score}/10!`);
                    return resultado;
                }

                this.log(`      → Score ${validacao.score} < ${this.config.scoreMinimo}, regenerando...`);

            } catch (error) {
                console.error(`[Erro] Tentativa ${tentativa}:`, error);

                if (tentativa === this.config.maxTentativas) {
                    // Se já é última tentativa e tem resultado anterior, usar ele
                    if (melhorResultado) {
                        this.log(`\n⚠ Usando melhor resultado disponível (score: ${melhorResultado.score})`);
                        return melhorResultado;
                    }

                    throw new ErroGeracao(
                        `Erro na geração após ${tentativa} tentativas`,
                        'OPENAI_ERRO',
                        error
                    );
                }
            }
        }

        // Retornar melhor resultado mesmo se não aprovado
        if (melhorResultado) {
            this.log(`\n⚠ Max tentativas atingido. Melhor score: ${melhorResultado.score}/10`);
            return melhorResultado;
        }

        throw new ErroGeracao(
            'Falha em todas as tentativas de geração',
            'MAX_TENTATIVAS',
            { tentativas: this.config.maxTentativas }
        );
    }

    /**
     * Busca apenas letras similares (útil para debug/exploração)
     *
     * @param tema - Tema para buscar
     * @param estilo - Estilo desejado
     * @param limite - Quantidade máxima
     */
    buscarInspiracao(
        tema: string,
        estilo: InputGeracao['estilo'],
        limite: number = 5
    ): LetraEncontrada[] {
        return this.ftsSearch.buscarLetrasSimilares(tema, estilo, undefined, limite);
    }

    /**
     * Extrai padrões de um conjunto de letras
     *
     * @param letras - Letras para analisar
     * @param tema - Tema para filtrar
     */
    analisarPadroes(letras: LetraEncontrada[], tema: string): PadroesExtraidos {
        return this.patternExtractor.extrair(letras, tema);
    }

    /**
     * Retorna estatísticas do banco de dados
     */
    getEstatisticas(): { letras: number; rimas: number; artistas: number; fts5: boolean } {
        return this.ftsSearch.getEstatisticas();
    }

    /**
     * Verifica se todos os serviços estão disponíveis
     */
    async verificarServicos(): Promise<{
        banco: boolean;
        fts5: boolean;
        ollama: boolean;
    }> {
        const stats = this.ftsSearch.getEstatisticas();
        const ollamaOk = await this.validator.isOllamaDisponivel();

        return {
            banco: stats.letras > 0,
            fts5: stats.fts5,
            ollama: ollamaOk
        };
    }

    /**
     * Libera recursos (fecha conexões)
     */
    close(): void {
        this.ftsSearch.close();
    }

    /**
     * Log interno (pode ser substituído por logger externo)
     */
    private log(message: string): void {
        console.log(message);
    }
}

// Export default para conveniência
export default RhymeGenerator;
