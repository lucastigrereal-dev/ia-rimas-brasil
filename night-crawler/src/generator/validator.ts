/**
 * Validador de Qualidade com Ollama
 *
 * Valida a qualidade dos versos gerados usando:
 * 1. Métricas algorítmicas (rima, métrica)
 * 2. Validação semântica com LLM local (Ollama)
 *
 * Custo: R$ 0,00 (execução local)
 */

import { ResultadoValidacao, PadroesExtraidos, EstiloRap, CriteriosValidacao } from './types.js';

/**
 * Resposta do Ollama
 */
interface OllamaResponse {
    response: string;
}

/**
 * Validador híbrido de qualidade de versos
 */
export class RhymeValidator {
    private baseUrl: string;
    private modelo: string;

    constructor(
        baseUrl: string = 'http://localhost:11434',
        modelo: string = 'llama3.2:latest'
    ) {
        this.baseUrl = baseUrl;
        this.modelo = modelo;
    }

    /**
     * Valida qualidade dos versos gerados
     *
     * Combina métricas algorítmicas (40%) com validação LLM (60%)
     * para um score final de 0-10.
     *
     * @param versos - Array de versos para validar
     * @param tema - Tema original da geração
     * @param estilo - Estilo esperado
     * @param padroes - Padrões de referência
     * @returns Resultado detalhado da validação
     *
     * @example
     * ```typescript
     * const validator = new RhymeValidator();
     * const resultado = await validator.validar(
     *     ['verso1', 'verso2', 'verso3', 'verso4'],
     *     'superação',
     *     'consciente',
     *     padroes
     * );
     * console.log(resultado.score); // 8.5
     * console.log(resultado.aprovado); // true
     * ```
     */
    async validar(
        versos: string[],
        tema: string,
        estilo: EstiloRap,
        padroes: PadroesExtraidos
    ): Promise<ResultadoValidacao> {
        // 1. Métricas algorítmicas (rápidas, sem LLM)
        const metricasAlgo = this.calcularMetricasAlgoritmicas(versos);

        // 2. Se métricas básicas muito ruins, nem chamar LLM
        if (metricasAlgo.scoreBase < 4.0) {
            return {
                score: metricasAlgo.scoreBase,
                aprovado: false,
                feedback: `Métricas básicas insuficientes: ${metricasAlgo.problemas.join(', ')}`,
                criterios: {
                    rima: metricasAlgo.rima,
                    metrica: metricasAlgo.metrica,
                    coerencia: 0,
                    originalidade: 0
                }
            };
        }

        // 3. Validação semântica com LLM
        let validacaoLLM: {
            score: number;
            feedback: string;
            coerencia: number;
            originalidade: number;
        };

        try {
            validacaoLLM = await this.validarComLLM(versos, tema, estilo);
        } catch (error) {
            // Se Ollama falhar, usar apenas métricas algorítmicas
            console.warn('[Validator] Ollama indisponível, usando apenas métricas algorítmicas');
            validacaoLLM = {
                score: metricasAlgo.scoreBase,
                feedback: 'Validação LLM indisponível',
                coerencia: 6,
                originalidade: 6
            };
        }

        // 4. Combinar scores (40% algorítmico, 60% LLM)
        const scoreFinal = (metricasAlgo.scoreBase * 0.4) + (validacaoLLM.score * 0.6);

        return {
            score: Math.round(scoreFinal * 10) / 10,
            aprovado: scoreFinal >= 7.0,
            feedback: validacaoLLM.feedback,
            criterios: {
                rima: metricasAlgo.rima,
                metrica: metricasAlgo.metrica,
                coerencia: validacaoLLM.coerencia,
                originalidade: validacaoLLM.originalidade
            }
        };
    }

    /**
     * Calcula métricas algorítmicas (sem LLM)
     */
    private calcularMetricasAlgoritmicas(versos: string[]): {
        scoreBase: number;
        rima: number;
        metrica: number;
        problemas: string[];
    } {
        const problemas: string[] = [];

        // Verificar quantidade de versos
        if (versos.length !== 4) {
            problemas.push(`Esperado 4 versos, recebido ${versos.length}`);
        }

        // Verificar rimas (versos 1-2 e 3-4 devem rimar)
        let scoreRima = 0;

        if (versos.length >= 2) {
            const qualidadeRima12 = this.calcularQualidadeRima(versos[0], versos[1]);
            scoreRima += qualidadeRima12 * 5; // Max 5 pontos

            if (qualidadeRima12 === 0) {
                problemas.push('Versos 1-2 não rimam');
            }
        }

        if (versos.length >= 4) {
            const qualidadeRima34 = this.calcularQualidadeRima(versos[2], versos[3]);
            scoreRima += qualidadeRima34 * 5; // Max 5 pontos

            if (qualidadeRima34 === 0) {
                problemas.push('Versos 3-4 não rimam');
            }
        }

        // Verificar métrica (sílabas por verso)
        let scoreMetrica = 0;

        for (let i = 0; i < versos.length; i++) {
            const silabas = this.contarSilabas(versos[i]);

            if (silabas >= 6 && silabas <= 16) {
                scoreMetrica += 2.5; // Max 10 pontos (4 versos x 2.5)
            } else {
                problemas.push(`Verso ${i + 1}: ${silabas} sílabas (esperado 6-16)`);
            }
        }

        // Score base: média de rima e métrica
        const scoreBase = (scoreRima + scoreMetrica) / 2;

        return {
            scoreBase: Math.round(scoreBase * 10) / 10,
            rima: Math.round(scoreRima * 10) / 10,
            metrica: Math.round(scoreMetrica * 10) / 10,
            problemas
        };
    }

    /**
     * Validação semântica com Ollama LLM
     */
    private async validarComLLM(
        versos: string[],
        tema: string,
        estilo: EstiloRap
    ): Promise<{
        score: number;
        feedback: string;
        coerencia: number;
        originalidade: number;
    }> {
        const prompt = `Avalie estes versos de rap brasileiro em uma escala de 0 a 10.

TEMA SOLICITADO: ${tema}
ESTILO: ${estilo}

VERSOS:
${versos.join('\n')}

Avalie considerando:
1. Coerência com o tema (0-10)
2. Originalidade/criatividade (0-10)
3. Qualidade geral (0-10)

Responda APENAS em formato JSON válido:
{"score": 8, "coerencia": 8, "originalidade": 7, "feedback": "explicação curta"}`;

        const response = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.modelo,
                prompt,
                stream: false,
                options: {
                    temperature: 0.3,
                    num_predict: 150
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama erro: ${response.status}`);
        }

        const data = await response.json() as OllamaResponse;
        const resposta = data.response || '';

        // Tentar extrair JSON da resposta
        const jsonMatch = resposta.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    score: this.clamp(parsed.score || 5, 0, 10),
                    coerencia: this.clamp(parsed.coerencia || 5, 0, 10),
                    originalidade: this.clamp(parsed.originalidade || 5, 0, 10),
                    feedback: parsed.feedback || 'Sem feedback'
                };
            } catch {
                // JSON inválido, usar fallback
            }
        }

        // Fallback se não conseguir parsear
        return {
            score: 6,
            feedback: 'Validação inconclusiva - resposta não parseável',
            coerencia: 6,
            originalidade: 6
        };
    }

    /**
     * Calcula qualidade da rima entre dois versos (0-1)
     */
    private calcularQualidadeRima(verso1: string, verso2: string): number {
        const p1 = this.ultimaPalavra(verso1);
        const p2 = this.ultimaPalavra(verso2);

        if (!p1 || !p2 || p1 === p2) return 0;

        // Rima perfeita (3+ letras iguais): 1.0
        if (p1.length >= 3 && p2.length >= 3 && p1.slice(-3) === p2.slice(-3)) {
            return 1.0;
        }

        // Rima consoante (2 letras): 0.8
        if (p1.length >= 2 && p2.length >= 2 && p1.slice(-2) === p2.slice(-2)) {
            return 0.8;
        }

        // Rima toante (vogais): 0.5
        const vogais1 = p1.replace(/[^aeiouáéíóúâêîôûãõ]/gi, '').slice(-2);
        const vogais2 = p2.replace(/[^aeiouáéíóúâêîôûãõ]/gi, '').slice(-2);

        if (vogais1.length >= 2 && vogais1 === vogais2) {
            return 0.5;
        }

        return 0;
    }

    /**
     * Extrai última palavra de um verso
     */
    private ultimaPalavra(verso: string): string | null {
        const palavras = verso.trim().split(/\s+/);
        const ultima = palavras[palavras.length - 1];
        if (!ultima) return null;

        const limpa = ultima.toLowerCase().replace(/[^\wáéíóúâêîôûãõç]/g, '');
        return limpa.length >= 2 ? limpa : null;
    }

    /**
     * Conta sílabas em um texto (heurística para português)
     */
    private contarSilabas(texto: string): number {
        const vogais = texto.toLowerCase().match(/[aeiouáéíóúâêîôûãõ]+/g);
        return vogais ? vogais.length : 0;
    }

    /**
     * Limita valor entre min e max
     */
    private clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Verifica se Ollama está disponível
     */
    async isOllamaDisponivel(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`, {
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}
