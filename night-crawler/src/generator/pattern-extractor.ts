/**
 * Extrator de Padrões de Letras
 *
 * Analisa letras de rap para extrair padrões úteis:
 * - Palavras-chave frequentes
 * - Pares de rimas de alta qualidade
 * - Exemplos de versos bem estruturados
 * - Métricas de sílabas por verso
 */

import { LetraEncontrada, ParRima, PadroesExtraidos, TipoRima } from './types.js';

/**
 * Stopwords em português para filtragem
 */
const STOPWORDS = new Set([
    'para', 'como', 'mais', 'porque', 'quando', 'onde', 'esse', 'essa',
    'isso', 'aqui', 'voce', 'você', 'todo', 'toda', 'tudo', 'muito',
    'mesmo', 'ainda', 'depois', 'antes', 'sempre', 'nunca', 'nada',
    'cada', 'outro', 'outra', 'outros', 'outras', 'este', 'esta',
    'estes', 'estas', 'dele', 'dela', 'deles', 'delas', 'pelo', 'pela',
    'pelos', 'pelas', 'numa', 'numas', 'umas', 'uns', 'uma', 'com',
    'sem', 'por', 'entre', 'sobre', 'contra', 'desde', 'durante',
    'tanto', 'tanta', 'tantos', 'tantas', 'qual', 'quais', 'quem',
    'cujo', 'cuja', 'cujos', 'cujas', 'algum', 'alguma', 'alguns'
]);

/**
 * Extrai padrões úteis de um conjunto de letras
 */
export class PatternExtractor {

    /**
     * Extrai todos os padrões de um conjunto de letras
     *
     * @param letras - Letras encontradas na busca FTS5
     * @param tema - Tema principal para filtrar palavras relevantes
     * @returns Padrões consolidados para uso na geração
     *
     * @example
     * ```typescript
     * const extractor = new PatternExtractor();
     * const padroes = extractor.extrair(letras, 'superação');
     * console.log(padroes.paresRimas.length); // 20
     * ```
     */
    extrair(letras: LetraEncontrada[], tema: string): PadroesExtraidos {
        // Combinar todas as letras em um texto único
        const textoCompleto = letras.map(l => l.letra).join('\n');
        const todosVersos = this.extrairVersos(textoCompleto);

        return {
            palavrasChave: this.extrairPalavrasChave(textoCompleto, tema),
            paresRimas: this.extrairParesRimas(todosVersos),
            versosExemplo: this.selecionarVersosExemplo(letras),
            estruturaMetrica: this.analisarMetrica(todosVersos),
            vocabularioTematico: this.extrairVocabularioTematico(letras)
        };
    }

    /**
     * Extrai palavras-chave mais frequentes relacionadas ao tema
     */
    private extrairPalavrasChave(texto: string, tema: string): string[] {
        const palavras = texto
            .toLowerCase()
            .replace(/[^\w\sáéíóúâêîôûãõç]/g, ' ')
            .split(/\s+/)
            .filter(p => p.length > 3);

        // Contar frequência
        const contagem = new Map<string, number>();
        for (const palavra of palavras) {
            if (!STOPWORDS.has(palavra)) {
                contagem.set(palavra, (contagem.get(palavra) || 0) + 1);
            }
        }

        // Ordenar por frequência e retornar top 30
        return Array.from(contagem.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30)
            .map(([palavra]) => palavra);
    }

    /**
     * Extrai pares de rimas dos versos consecutivos
     */
    private extrairParesRimas(versos: string[]): ParRima[] {
        const rimas: ParRima[] = [];
        const rimasVistas = new Set<string>();

        for (let i = 0; i < versos.length - 1; i++) {
            const verso1 = versos[i].trim();
            const verso2 = versos[i + 1].trim();

            if (!verso1 || !verso2) continue;

            const palavra1 = this.ultimaPalavra(verso1);
            const palavra2 = this.ultimaPalavra(verso2);

            if (!palavra1 || !palavra2 || palavra1 === palavra2) continue;

            // Evitar duplicatas
            const chave = [palavra1, palavra2].sort().join('|');
            if (rimasVistas.has(chave)) continue;

            const tipoRima = this.detectarTipoRima(palavra1, palavra2);
            if (tipoRima) {
                rimasVistas.add(chave);
                rimas.push({
                    palavra1,
                    palavra2,
                    tipo: tipoRima.tipo,
                    score: tipoRima.score,
                    verso1,
                    verso2
                });
            }
        }

        // Ordenar por score e retornar top 20
        return rimas
            .sort((a, b) => b.score - a.score)
            .slice(0, 20);
    }

    /**
     * Seleciona blocos de 4 versos de exemplo de alta qualidade
     */
    private selecionarVersosExemplo(letras: LetraEncontrada[]): string[] {
        const exemplos: string[] = [];

        // Priorizar letras de maior qualidade
        const letrasOrdenadas = [...letras].sort((a, b) => b.qualidade - a.qualidade);

        for (const letra of letrasOrdenadas.slice(0, 5)) {
            const versos = this.extrairVersos(letra.letra);

            // Procurar blocos de 4 versos com rimas
            for (let i = 0; i < versos.length - 3; i += 4) {
                const bloco = versos.slice(i, i + 4).filter(v => v.length > 10);

                if (bloco.length === 4) {
                    // Verificar se tem pelo menos uma rima no bloco
                    const temRima = this.verificarRimaNoBloco(bloco);
                    if (temRima) {
                        exemplos.push(bloco.join('\n'));
                        break; // Apenas um exemplo por letra
                    }
                }
            }

            if (exemplos.length >= 3) break; // Máximo 3 exemplos
        }

        return exemplos;
    }

    /**
     * Analisa estrutura métrica (distribuição de sílabas por verso)
     */
    private analisarMetrica(versos: string[]): number[] {
        const contagens: number[] = [];

        // Analisar apenas primeiros 100 versos para performance
        for (const verso of versos.slice(0, 100)) {
            const silabas = this.contarSilabas(verso);
            if (silabas >= 5 && silabas <= 18) {
                contagens.push(silabas);
            }
        }

        // Retornar valores únicos ordenados
        return [...new Set(contagens)].sort((a, b) => a - b);
    }

    /**
     * Extrai vocabulário temático específico das letras
     */
    private extrairVocabularioTematico(letras: LetraEncontrada[]): string[] {
        const vocabulario = new Set<string>();

        for (const letra of letras) {
            // Adicionar temas identificados
            for (const tema of letra.temas) {
                if (tema && tema.length > 2) {
                    vocabulario.add(tema.toLowerCase());
                }
            }

            // Extrair palavras significativas (substantivos/adjetivos)
            const palavras = letra.letra
                .toLowerCase()
                .replace(/[^\w\sáéíóúâêîôûãõç]/g, ' ')
                .split(/\s+/)
                .filter(p => p.length > 4 && p.length < 15 && !STOPWORDS.has(p));

            for (const palavra of palavras.slice(0, 30)) {
                vocabulario.add(palavra);
            }
        }

        return Array.from(vocabulario).slice(0, 50);
    }

    // ===========================================
    // MÉTODOS UTILITÁRIOS
    // ===========================================

    /**
     * Extrai versos limpos de um texto
     */
    private extrairVersos(texto: string): string[] {
        return texto
            .split('\n')
            .map(v => v.trim())
            .filter(v => v.length > 5 && !v.startsWith('[') && !v.startsWith('('));
    }

    /**
     * Extrai última palavra de um verso
     */
    private ultimaPalavra(verso: string): string | null {
        const palavras = verso.split(/\s+/);
        const ultima = palavras[palavras.length - 1];
        if (!ultima) return null;

        const limpa = ultima.toLowerCase().replace(/[^\wáéíóúâêîôûãõç]/g, '');
        return limpa.length >= 2 ? limpa : null;
    }

    /**
     * Detecta tipo e qualidade de rima entre duas palavras
     */
    private detectarTipoRima(
        p1: string,
        p2: string
    ): { tipo: TipoRima; score: number } | null {
        // Rima perfeita: mesma terminação (3+ letras)
        if (p1.length >= 3 && p2.length >= 3 && p1.slice(-3) === p2.slice(-3)) {
            return { tipo: 'perfeita', score: 1.0 };
        }

        // Rima consoante: mesmas 2 últimas letras
        if (p1.length >= 2 && p2.length >= 2 && p1.slice(-2) === p2.slice(-2)) {
            return { tipo: 'consoante', score: 0.8 };
        }

        // Rima toante: mesmas vogais finais
        const vogais1 = p1.replace(/[^aeiouáéíóúâêîôûãõ]/gi, '').slice(-2);
        const vogais2 = p2.replace(/[^aeiouáéíóúâêîôûãõ]/gi, '').slice(-2);

        if (vogais1.length >= 2 && vogais1 === vogais2) {
            return { tipo: 'toante', score: 0.6 };
        }

        return null;
    }

    /**
     * Verifica se um bloco de 4 versos contém rimas
     */
    private verificarRimaNoBloco(bloco: string[]): boolean {
        if (bloco.length < 2) return false;

        // Verificar rima entre versos 1-2 ou 3-4
        const p1 = this.ultimaPalavra(bloco[0]);
        const p2 = this.ultimaPalavra(bloco[1]);

        if (p1 && p2 && this.detectarTipoRima(p1, p2)) {
            return true;
        }

        if (bloco.length >= 4) {
            const p3 = this.ultimaPalavra(bloco[2]);
            const p4 = this.ultimaPalavra(bloco[3]);

            if (p3 && p4 && this.detectarTipoRima(p3, p4)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Conta sílabas em um texto (heurística para português)
     */
    private contarSilabas(texto: string): number {
        // Contar grupos de vogais como aproximação de sílabas
        const vogais = texto.toLowerCase().match(/[aeiouáéíóúâêîôûãõ]+/g);
        return vogais ? vogais.length : 0;
    }
}
