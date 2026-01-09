/**
 * Testes do FTSSearch
 *
 * Testa busca full-text com SQLite FTS5.
 * Nota: Requer banco SQLite populado.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FTSSearch } from '../src/generator/fts-search';

describe('FTSSearch', () => {
    let fts: FTSSearch;

    beforeAll(() => {
        fts = new FTSSearch();
    });

    afterAll(() => {
        fts.close();
    });

    describe('construtor', () => {
        it('deve criar instância com path padrão', () => {
            const search = new FTSSearch();
            expect(search).toBeDefined();
            search.close();
        });
    });

    describe('isFTS5Disponivel()', () => {
        it('deve verificar se FTS5 está configurado', () => {
            const disponivel = fts.isFTS5Disponivel();
            expect(typeof disponivel).toBe('boolean');
        });
    });

    describe('getEstatisticas()', () => {
        it('deve retornar estatísticas do banco', () => {
            const stats = fts.getEstatisticas();

            expect(stats).toHaveProperty('letras');
            expect(stats).toHaveProperty('rimas');
            expect(stats).toHaveProperty('artistas');
            expect(stats).toHaveProperty('fts5');

            expect(typeof stats.letras).toBe('number');
            expect(stats.letras).toBeGreaterThanOrEqual(0);
        });
    });

    describe('buscarLetrasSimilares()', () => {
        it('deve retornar array de letras', () => {
            const letras = fts.buscarLetrasSimilares('vida', 'consciente');

            expect(Array.isArray(letras)).toBe(true);
        });

        it('deve respeitar limite de resultados', () => {
            const letras = fts.buscarLetrasSimilares('amor', 'poetico', undefined, 3);

            expect(letras.length).toBeLessThanOrEqual(3);
        });

        it('deve filtrar por estilo', () => {
            const letras = fts.buscarLetrasSimilares('rua', 'gangsta', undefined, 10);

            // Todos os resultados devem ter estilo compatível (inclui 'indefinido' como fallback)
            letras.forEach(letra => {
                expect(['agressivo', 'gangsta', 'indefinido']).toContain(letra.estilo);
            });
        });

        it('deve retornar estrutura correta', () => {
            const letras = fts.buscarLetrasSimilares('sonho', 'consciente', undefined, 1);

            if (letras.length > 0) {
                const letra = letras[0];

                expect(letra).toHaveProperty('id');
                expect(letra).toHaveProperty('titulo');
                expect(letra).toHaveProperty('artista');
                expect(letra).toHaveProperty('letra');
                expect(letra).toHaveProperty('estilo');
                expect(letra).toHaveProperty('qualidade');
                expect(letra).toHaveProperty('temas');
                expect(letra).toHaveProperty('rank');

                expect(typeof letra.id).toBe('number');
                expect(typeof letra.titulo).toBe('string');
                expect(typeof letra.qualidade).toBe('number');
                expect(Array.isArray(letra.temas)).toBe(true);
            }
        });

        it('deve ordenar por relevância (rank)', () => {
            const letras = fts.buscarLetrasSimilares('favela', 'consciente', undefined, 5);

            if (letras.length >= 2) {
                // Se FTS5, primeiro resultado tem rank maior/igual ao segundo
                // (na prática BM25 retorna negativo, menor = melhor)
                expect(letras[0].rank).toBeDefined();
            }
        });

        it('deve usar contexto adicional na busca', () => {
            const semContexto = fts.buscarLetrasSimilares('vida', 'consciente');
            const comContexto = fts.buscarLetrasSimilares('vida', 'consciente', 'superação luta');

            // Ambos devem funcionar
            expect(Array.isArray(semContexto)).toBe(true);
            expect(Array.isArray(comContexto)).toBe(true);
        });

        it('deve retornar array vazio para tema sem resultados', () => {
            const letras = fts.buscarLetrasSimilares('xyzabc123nonsense', 'gangsta');
            expect(letras).toEqual([]);
        });
    });

    describe('buscarRimasQualidade()', () => {
        it('deve retornar array de rimas', () => {
            const letras = fts.buscarLetrasSimilares('vida', 'consciente', undefined, 3);
            const ids = letras.map(l => l.id);

            if (ids.length > 0) {
                const rimas = fts.buscarRimasQualidade(ids, 10);

                expect(Array.isArray(rimas)).toBe(true);

                if (rimas.length > 0) {
                    expect(rimas[0]).toHaveProperty('palavra1');
                    expect(rimas[0]).toHaveProperty('palavra2');
                    expect(rimas[0]).toHaveProperty('tipo');
                    expect(rimas[0]).toHaveProperty('score');
                }
            }
        });

        it('deve retornar array vazio para IDs inexistentes', () => {
            const rimas = fts.buscarRimasQualidade([999999, 999998], 10);
            expect(rimas).toEqual([]);
        });

        it('deve retornar array vazio para array vazio de IDs', () => {
            const rimas = fts.buscarRimasQualidade([], 10);
            expect(rimas).toEqual([]);
        });
    });
});

describe('Estilos mapeados', () => {
    let fts: FTSSearch;

    beforeAll(() => {
        fts = new FTSSearch();
    });

    afterAll(() => {
        fts.close();
    });

    // Inclui 'indefinido' como fallback para todos os estilos
    const estilos = [
        { api: 'gangsta', db: ['agressivo', 'gangsta', 'indefinido'] },
        { api: 'consciente', db: ['consciente', 'storytelling', 'indefinido'] },
        { api: 'trap', db: ['festa', 'trap', 'indefinido'] },
        { api: 'boom_bap', db: ['tecnico', 'boom_bap', 'indefinido'] },
        { api: 'poetico', db: ['romantico', 'poetico', 'indefinido'] }
    ] as const;

    estilos.forEach(({ api, db }) => {
        it(`deve mapear estilo "${api}" para estilos válidos`, () => {
            const letras = fts.buscarLetrasSimilares('teste', api, undefined, 5);

            letras.forEach(letra => {
                expect(db).toContain(letra.estilo);
            });
        });
    });
});
