import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Diretório de testes (relativo ao root do projeto)
        root: './night-crawler',
        include: ['tests/**/*.test.ts'],

        // Ambiente de execução
        environment: 'node',

        // Timeout para testes (30s para testes de integração)
        testTimeout: 30000,

        // Rodar testes em paralelo
        pool: 'threads',

        // Mostrar logs durante testes
        reporters: ['verbose'],

        // Coverage
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/**/*.ts'],
            exclude: ['src/cli.ts']
        },

        // Globals para expect, describe, it, etc.
        globals: true
    }
});
