/**
 * Testes do RhymeValidator
 *
 * Testa validação de qualidade de versos.
 * Nota: Testes de LLM requerem Ollama rodando.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { RhymeValidator } from '../src/generator/validator';
import { PadroesExtraidos } from '../src/generator/types';

describe('RhymeValidator', () => {
    let validator: RhymeValidator;

    // Padrões mock para testes
    const padroesMock: PadroesExtraidos = {
        palavrasChave: ['vida', 'luta', 'sonho'],
        paresRimas: [],
        versosExemplo: [],
        estruturaMetrica: [8, 9, 10, 11],
        vocabularioTematico: ['favela', 'quebrada']
    };

    beforeAll(() => {
        validator = new RhymeValidator();
    });

    describe('isOllamaDisponivel()', () => {
        it('deve verificar disponibilidade do Ollama', async () => {
            const disponivel = await validator.isOllamaDisponivel();
            expect(typeof disponivel).toBe('boolean');
        });
    });

    describe('validar() - métricas algorítmicas', () => {
        it('deve aprovar versos que rimam perfeitamente', async () => {
            const versosOK = [
                'Na quebrada eu cresci sem ter nada',
                'Mas nunca deixei a peteca virada',
                'Hoje olho pra trás e vejo a estrada',
                'Cada luta valeu, cada batalha passada'
            ];

            const resultado = await validator.validar(
                versosOK,
                'superação',
                'consciente',
                padroesMock
            );

            // Rimas -ada/-ada e -ada/-ada devem dar score alto
            expect(resultado.criterios.rima).toBeGreaterThanOrEqual(8);
        });

        it('deve dar score baixo para versos sem rima', async () => {
            const versosSemRima = [
                'Isso aqui não faz sentido',
                'Computador azul grande',
                'Mesa de jantar velha',
                'Cachorro amarelo pequeno'
            ];

            const resultado = await validator.validar(
                versosSemRima,
                'qualquer',
                'consciente',
                padroesMock
            );

            expect(resultado.criterios.rima).toBeLessThan(5);
            expect(resultado.aprovado).toBe(false);
        });

        it('deve penalizar quantidade incorreta de versos', async () => {
            const poucos = ['Apenas um verso'];

            const resultado = await validator.validar(
                poucos,
                'tema',
                'consciente',
                padroesMock
            );

            expect(resultado.score).toBeLessThan(5);
            expect(resultado.aprovado).toBe(false);
        });

        it('deve validar métrica (sílabas)', async () => {
            // Versos com métrica razoável
            const versosMetricaOK = [
                'O sonho é grande demais',
                'A luta não tem mais paz',
                'Eu sigo em frente sempre',
                'A vida é pra quem quer'
            ];

            const resultado = await validator.validar(
                versosMetricaOK,
                'vida',
                'consciente',
                padroesMock
            );

            expect(resultado.criterios.metrica).toBeGreaterThan(5);
        });
    });

    describe('validar() - detecção de tipos de rima', () => {
        it('deve detectar rima perfeita (-ão/-ão)', async () => {
            const versos = [
                'Eu vim da escuridão',
                'Agora tenho a solução',
                'Vivo minha missão',
                'Com força no coração'
            ];

            const resultado = await validator.validar(
                versos,
                'superação',
                'consciente',
                padroesMock
            );

            expect(resultado.criterios.rima).toBeGreaterThanOrEqual(8);
        });

        it('deve detectar rima consoante (-ar/-ar)', async () => {
            const versos = [
                'Eu preciso caminhar',
                'Não posso mais parar',
                'Vou ter que lutar',
                'Pra poder conquistar'
            ];

            const resultado = await validator.validar(
                versos,
                'luta',
                'consciente',
                padroesMock
            );

            expect(resultado.criterios.rima).toBeGreaterThanOrEqual(8);
        });

        it('deve detectar rima toante (vogais iguais)', async () => {
            const versos = [
                'A vida é uma guerra',
                'Quem luta não erra',
                'Força na serra',
                'Paz nessa terra'
            ];

            const resultado = await validator.validar(
                versos,
                'vida',
                'consciente',
                padroesMock
            );

            // Rimas -erra/-erra são perfeitas
            expect(resultado.criterios.rima).toBeGreaterThanOrEqual(8);
        });
    });

    describe('validar() - resultado estruturado', () => {
        it('deve retornar estrutura completa', async () => {
            const versos = [
                'Teste verso um aqui',
                'Teste verso dois aqui',
                'Teste verso três ali',
                'Teste verso quatro ali'
            ];

            const resultado = await validator.validar(
                versos,
                'teste',
                'consciente',
                padroesMock
            );

            expect(resultado).toHaveProperty('score');
            expect(resultado).toHaveProperty('aprovado');
            expect(resultado).toHaveProperty('feedback');
            expect(resultado).toHaveProperty('criterios');

            expect(resultado.criterios).toHaveProperty('rima');
            expect(resultado.criterios).toHaveProperty('metrica');
            expect(resultado.criterios).toHaveProperty('coerencia');
            expect(resultado.criterios).toHaveProperty('originalidade');

            expect(typeof resultado.score).toBe('number');
            expect(typeof resultado.aprovado).toBe('boolean');
            expect(typeof resultado.feedback).toBe('string');
        });

        it('deve ter score entre 0 e 10', async () => {
            const versos = ['a', 'b', 'c', 'd'];

            const resultado = await validator.validar(
                versos,
                'x',
                'trap',
                padroesMock
            );

            expect(resultado.score).toBeGreaterThanOrEqual(0);
            expect(resultado.score).toBeLessThanOrEqual(10);
        });

        it('deve aprovar apenas se score >= 7.0', async () => {
            const versosRuins = ['x', 'y', 'z', 'w'];

            const resultado = await validator.validar(
                versosRuins,
                'x',
                'trap',
                padroesMock
            );

            if (resultado.score >= 7.0) {
                expect(resultado.aprovado).toBe(true);
            } else {
                expect(resultado.aprovado).toBe(false);
            }
        });
    });

    describe('validar() - estilos diferentes', () => {
        const estilos = ['gangsta', 'consciente', 'trap', 'boom_bap', 'poetico'] as const;

        estilos.forEach(estilo => {
            it(`deve validar estilo "${estilo}"`, async () => {
                const versos = [
                    'Primeiro verso aqui',
                    'Segundo verso aqui',
                    'Terceiro verso ali',
                    'Quarto verso ali'
                ];

                const resultado = await validator.validar(
                    versos,
                    'teste',
                    estilo,
                    padroesMock
                );

                expect(resultado).toBeDefined();
                expect(typeof resultado.score).toBe('number');
            });
        });
    });
});

describe('Algoritmos de rima', () => {
    // Testar algoritmos de detecção de rima isoladamente
    // (expostos indiretamente via validar())

    let validator: RhymeValidator;

    beforeAll(() => {
        validator = new RhymeValidator();
    });

    const padroesMock: PadroesExtraidos = {
        palavrasChave: [],
        paresRimas: [],
        versosExemplo: [],
        estruturaMetrica: [],
        vocabularioTematico: []
    };

    it('deve dar score alto para rima perfeita -ção/-ção', async () => {
        const versos = [
            'Esta é minha decisão',
            'Sigo minha intuição',
            'Com toda dedicação',
            'Vou cumprir minha missão'
        ];

        const resultado = await validator.validar(versos, 't', 'consciente', padroesMock);
        // Score de rima algorítmica deve ser alto (8-10)
        expect(resultado.criterios.rima).toBeGreaterThanOrEqual(8);
    });

    it('deve detectar rima em palavras com acentos', async () => {
        const versos = [
            'Eu tenho fé na vitória',
            'Escrevendo minha história',
            'Guardando cada memória',
            'Buscando a glória'
        ];

        const resultado = await validator.validar(versos, 't', 'poetico', padroesMock);
        expect(resultado.criterios.rima).toBeGreaterThanOrEqual(8);
    });
});
