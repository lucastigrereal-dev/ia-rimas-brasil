/**
 * Testes do RhymeGenerator
 *
 * Testa o fluxo completo de geração de rimas.
 * Nota: Requer banco SQLite populado e Ollama rodando para testes de integração.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { RhymeGenerator, ErroGeracao, InputGeracao } from '../src/generator';

// Flag para verificar se API key está disponível
const hasApiKey = !!process.env.OPENAI_API_KEY;

describe('RhymeGenerator', () => {
    let gerador: RhymeGenerator | null = null;

    beforeAll(() => {
        // Só cria o gerador se tiver API key (ele lança erro sem)
        if (hasApiKey) {
            gerador = new RhymeGenerator({
                maxTentativas: 2,
                scoreMinimo: 6.0,
                letrasParaBuscar: 5
            });
        }
    });

    afterAll(() => {
        gerador?.close();
    });

    describe('construtor', () => {
        it.skipIf(!hasApiKey)('deve criar instância com configuração padrão', () => {
            const gen = new RhymeGenerator();
            expect(gen).toBeDefined();
            gen.close();
        });

        it.skipIf(!hasApiKey)('deve aceitar configuração customizada', () => {
            const gen = new RhymeGenerator({
                maxTentativas: 5,
                scoreMinimo: 8.0
            });
            expect(gen).toBeDefined();
            gen.close();
        });
    });

    describe('getEstatisticas()', () => {
        it.skipIf(!hasApiKey)('deve retornar estatísticas do banco', () => {
            const stats = gerador!.getEstatisticas();

            expect(stats).toHaveProperty('letras');
            expect(stats).toHaveProperty('rimas');
            expect(stats).toHaveProperty('artistas');
            expect(stats).toHaveProperty('fts5');

            expect(typeof stats.letras).toBe('number');
            expect(typeof stats.fts5).toBe('boolean');
        });
    });

    describe('buscarInspiracao()', () => {
        it.skipIf(!hasApiKey)('deve buscar letras por tema', () => {
            const letras = gerador!.buscarInspiracao('vida', 'consciente', 3);

            // Se o banco estiver populado, deve retornar resultados
            expect(Array.isArray(letras)).toBe(true);

            if (letras.length > 0) {
                expect(letras[0]).toHaveProperty('id');
                expect(letras[0]).toHaveProperty('titulo');
                expect(letras[0]).toHaveProperty('letra');
                expect(letras[0]).toHaveProperty('estilo');
            }
        });

        it.skipIf(!hasApiKey)('deve retornar array vazio para tema inexistente', () => {
            const letras = gerador!.buscarInspiracao('xyzabc123nonsense', 'gangsta', 5);
            expect(Array.isArray(letras)).toBe(true);
        });

        it.skipIf(!hasApiKey)('deve respeitar limite de resultados', () => {
            const letras = gerador!.buscarInspiracao('amor', 'poetico', 2);
            expect(letras.length).toBeLessThanOrEqual(2);
        });
    });

    describe('analisarPadroes()', () => {
        it.skipIf(!hasApiKey)('deve extrair padrões de letras', () => {
            const letras = gerador!.buscarInspiracao('rua', 'gangsta', 3);

            if (letras.length > 0) {
                const padroes = gerador!.analisarPadroes(letras, 'rua');

                expect(padroes).toHaveProperty('palavrasChave');
                expect(padroes).toHaveProperty('paresRimas');
                expect(padroes).toHaveProperty('versosExemplo');
                expect(padroes).toHaveProperty('estruturaMetrica');
                expect(padroes).toHaveProperty('vocabularioTematico');

                expect(Array.isArray(padroes.palavrasChave)).toBe(true);
                expect(Array.isArray(padroes.paresRimas)).toBe(true);
            }
        });
    });

    describe('verificarServicos()', () => {
        it.skipIf(!hasApiKey)('deve verificar disponibilidade dos serviços', async () => {
            const status = await gerador!.verificarServicos();

            expect(status).toHaveProperty('banco');
            expect(status).toHaveProperty('fts5');
            expect(status).toHaveProperty('ollama');

            expect(typeof status.banco).toBe('boolean');
            expect(typeof status.fts5).toBe('boolean');
            expect(typeof status.ollama).toBe('boolean');
        });
    });

    // Testes de integração (requerem OpenAI API key e Ollama)
    describe('gerar() - integração', () => {
        it.skipIf(!process.env.OPENAI_API_KEY)(
            'deve gerar 4 versos para tema válido',
            async () => {
                const resultado = await gerador.gerar({
                    tema: 'superação',
                    estilo: 'consciente'
                });

                expect(resultado.versos).toHaveLength(4);
                expect(resultado.score).toBeGreaterThan(0);
                expect(resultado.custo.custo_reais).toBeLessThan(0.02); // < R$ 0,02
                expect(resultado.tempo_ms).toBeGreaterThan(0);
            },
            30000 // timeout 30s
        );

        it.skipIf(!process.env.OPENAI_API_KEY)(
            'deve manter custo abaixo de R$ 0.01 por tentativa',
            async () => {
                const resultado = await gerador.gerar({
                    tema: 'periferia',
                    estilo: 'consciente'
                });

                // Custo por tentativa deve ser < R$ 0.01
                const custoPorTentativa = resultado.custo.custo_reais / resultado.tentativas;
                expect(custoPorTentativa).toBeLessThan(0.01);
            },
            30000
        );
    });
});

describe('ErroGeracao', () => {
    it('deve criar erro com código e detalhes', () => {
        const erro = new ErroGeracao('Teste', 'FTS_VAZIO', { extra: 'info' });

        expect(erro.message).toBe('Teste');
        expect(erro.codigo).toBe('FTS_VAZIO');
        expect(erro.detalhes).toEqual({ extra: 'info' });
        expect(erro.name).toBe('ErroGeracao');
    });

    it('deve ser instância de Error', () => {
        const erro = new ErroGeracao('Teste', 'OPENAI_ERRO');
        expect(erro instanceof Error).toBe(true);
    });
});
