/**
 * Cliente OpenAI GPT-4o-mini
 *
 * Gera versos de rap usando GPT-4o-mini com prompts otimizados.
 * Objetivo: custo < R$ 0,01 por geração (~400 tokens total).
 */

import { PadroesExtraidos, EstiloRap, CustoGeracao, ErroGeracao } from './types.js';

/**
 * Resposta da API OpenAI
 */
interface OpenAIResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

/**
 * Descrições de estilo para o prompt
 */
const DESCRICAO_ESTILOS: Record<EstiloRap, string> = {
    gangsta: 'agressivo, de rua, confrontacional, linguagem direta',
    consciente: 'reflexivo, crítico social, mensagem profunda, poético',
    trap: 'moderno, melódico, gírias atuais, flow trap brasileiro',
    boom_bap: 'clássico, técnico, multissilábicas, flow old school',
    poetico: 'lírico, metafórico, romântico, linguagem elaborada'
};

/**
 * System prompts otimizados por estilo
 */
const SYSTEM_PROMPTS: Record<EstiloRap, string> = {
    gangsta: `Você é um letrista de rap brasileiro experiente, especialista em letras agressivas e de rua.
Crie versos autênticos que rimam perfeitamente. Nunca explique - apenas escreva os versos.`,

    consciente: `Você é um letrista de rap brasileiro experiente, especialista em rap consciente e crítico.
Crie versos reflexivos que rimam perfeitamente. Nunca explique - apenas escreva os versos.`,

    trap: `Você é um letrista de trap brasileiro experiente, especialista em flows modernos.
Crie versos com gírias atuais que rimam bem. Nunca explique - apenas escreva os versos.`,

    boom_bap: `Você é um letrista de rap brasileiro old school, especialista em técnica e flow clássico.
Crie versos técnicos com rimas multissilábicas. Nunca explique - apenas escreva os versos.`,

    poetico: `Você é um poeta-letrista brasileiro, especialista em rap lírico e romântico.
Crie versos com metáforas e rimas elaboradas. Nunca explique - apenas escreva os versos.`
};

/**
 * Cliente para geração de versos usando GPT-4o-mini
 */
export class OpenAIClient {
    private apiKey: string;
    private baseUrl = 'https://api.openai.com/v1';
    private modelo = 'gpt-4o-mini';

    // Preços em USD (janeiro 2024)
    // GPT-4o-mini: $0.15/1M input, $0.60/1M output
    private precoPorMilTokensInput = 0.00015;
    private precoPorMilTokensOutput = 0.0006;
    private taxaCambioBRL = 5.5; // USD -> BRL (margem de segurança)

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
        if (!this.apiKey) {
            throw new ErroGeracao(
                'OPENAI_API_KEY não configurada. Configure no .env ou passe como parâmetro.',
                'OPENAI_ERRO'
            );
        }
    }

    /**
     * Gera 4 versos baseados nos padrões e tema
     *
     * @param tema - Tema principal
     * @param estilo - Estilo de rap desejado
     * @param padroes - Padrões extraídos das letras de referência
     * @param contexto - Contexto adicional opcional
     * @param temperatura - Temperatura do modelo (0.0-1.0)
     * @returns Versos gerados e informações de custo
     *
     * @example
     * ```typescript
     * const client = new OpenAIClient();
     * const resultado = await client.gerarVersos(
     *     'superação',
     *     'consciente',
     *     padroes
     * );
     * console.log(resultado.versos); // ['verso1', 'verso2', 'verso3', 'verso4']
     * console.log(resultado.custo_reais); // 0.0042
     * ```
     */
    async gerarVersos(
        tema: string,
        estilo: EstiloRap,
        padroes: PadroesExtraidos,
        contexto?: string,
        temperatura: number = 0.8
    ): Promise<{
        versos: string[];
        tokens_input: number;
        tokens_output: number;
        custo_reais: number;
    }> {
        const prompt = this.construirPrompt(tema, estilo, padroes, contexto);
        const systemPrompt = SYSTEM_PROMPTS[estilo];

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.modelo,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    temperature: temperatura,
                    max_tokens: 200,
                    presence_penalty: 0.3,   // Evita repetição de temas
                    frequency_penalty: 0.5   // Evita repetição de palavras
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new ErroGeracao(
                    `OpenAI API erro ${response.status}: ${errorText}`,
                    'OPENAI_ERRO',
                    { status: response.status, body: errorText }
                );
            }

            const data = await response.json() as OpenAIResponse;
            const content = data.choices[0]?.message?.content || '';

            // Extrair versos da resposta
            const versos = this.parseVersos(content);

            // Calcular custo
            const custoInput = (data.usage.prompt_tokens / 1000) * this.precoPorMilTokensInput;
            const custoOutput = (data.usage.completion_tokens / 1000) * this.precoPorMilTokensOutput;
            const custoTotalUSD = custoInput + custoOutput;
            const custoReais = custoTotalUSD * this.taxaCambioBRL;

            return {
                versos,
                tokens_input: data.usage.prompt_tokens,
                tokens_output: data.usage.completion_tokens,
                custo_reais: Math.round(custoReais * 10000) / 10000 // 4 casas decimais
            };

        } catch (error) {
            if (error instanceof ErroGeracao) throw error;

            throw new ErroGeracao(
                `Erro ao chamar OpenAI: ${error}`,
                'OPENAI_ERRO',
                error
            );
        }
    }

    /**
     * Constrói prompt otimizado para geração
     * Foco em: exemplos reais, rimas sugeridas, métrica clara
     */
    private construirPrompt(
        tema: string,
        estilo: EstiloRap,
        padroes: PadroesExtraidos,
        contexto?: string
    ): string {
        // Selecionar melhores exemplos (2 para economia de tokens)
        const exemplos = padroes.versosExemplo.slice(0, 2);

        // Selecionar rimas de alta qualidade (score >= 0.8)
        const rimasSugeridas = padroes.paresRimas
            .filter(r => r.score >= 0.8)
            .slice(0, 6)
            .map(r => `${r.palavra1}/${r.palavra2}`)
            .join(', ');

        // Palavras-chave relevantes (top 12)
        const palavras = padroes.palavrasChave.slice(0, 12).join(', ');

        // Construir prompt compacto
        let prompt = `TEMA: ${tema}\n`;

        if (contexto) {
            prompt += `CONTEXTO: ${contexto}\n`;
        }

        prompt += `ESTILO: ${DESCRICAO_ESTILOS[estilo]}\n`;
        prompt += `\nPALAVRAS-CHAVE: ${palavras || 'vida, luta, sonho'}\n`;

        if (rimasSugeridas) {
            prompt += `RIMAS SUGERIDAS: ${rimasSugeridas}\n`;
        }

        if (exemplos.length > 0) {
            prompt += `\nEXEMPLOS DE REFERÊNCIA:\n`;
            exemplos.forEach((ex, i) => {
                prompt += `[${i + 1}]\n${ex}\n`;
            });
        }

        prompt += `
REGRAS:
- Escreva EXATAMENTE 4 versos
- Versos 1-2 devem rimar entre si
- Versos 3-4 devem rimar entre si
- Cada verso: 8-12 sílabas
- Use rimas sugeridas como inspiração (não obrigatório)
- 70% inspirado nos exemplos, 30% original

Responda APENAS com os 4 versos, um por linha:`;

        return prompt;
    }

    /**
     * Parse da resposta para extrair versos limpos
     */
    private parseVersos(content: string): string[] {
        const linhas = content
            .split('\n')
            .map(l => l.trim())
            // Remover linhas vazias ou muito curtas
            .filter(l => l.length > 5)
            // Remover marcadores como [1], 1., etc.
            .filter(l => !l.match(/^\[?\d+[\].:]/))
            // Remover linhas que começam com "Verso"
            .filter(l => !l.match(/^verso\s/i))
            // Remover asteriscos e outros markdown
            .map(l => l.replace(/^\*+|\*+$/g, '').trim())
            .filter(l => l.length > 5);

        // Garantir exatamente 4 versos
        return linhas.slice(0, 4);
    }

    /**
     * Estima custo antes de chamar a API (útil para preview)
     *
     * @param promptLength - Tamanho aproximado do prompt em caracteres
     * @returns Custo estimado em reais
     */
    estimarCusto(promptLength: number): number {
        // Aproximação: 4 chars = 1 token
        const tokensInput = Math.ceil(promptLength / 4);
        const tokensOutput = 100; // Estimativa para 4 versos

        const custoInput = (tokensInput / 1000) * this.precoPorMilTokensInput;
        const custoOutput = (tokensOutput / 1000) * this.precoPorMilTokensOutput;

        return (custoInput + custoOutput) * this.taxaCambioBRL;
    }
}
