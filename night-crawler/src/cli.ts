#!/usr/bin/env node
/**
 * CLI do Gerador de Rimas
 *
 * Uso:
 *   npm run generate -- --tema "superação" --estilo "consciente"
 *   npm run generate -- --tema "vida na rua" --estilo "gangsta" --contexto "história de luta"
 *
 * Opções:
 *   --tema      Tema principal (obrigatório)
 *   --estilo    Estilo: gangsta, consciente, trap, boom_bap, poetico (obrigatório)
 *   --contexto  Contexto adicional (opcional)
 *   --stats     Mostrar apenas estatísticas do banco
 *   --help      Mostrar ajuda
 */

import 'dotenv/config';
import { RhymeGenerator, EstiloRap, ErroGeracao } from './generator/index.js';

// Parse argumentos da linha de comando
function parseArgs(): {
    tema?: string;
    estilo?: EstiloRap;
    contexto?: string;
    stats?: boolean;
    help?: boolean;
} {
    const args: Record<string, string | boolean> = {};
    const argv = process.argv.slice(2);

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg === '--help' || arg === '-h') {
            args.help = true;
        } else if (arg === '--stats') {
            args.stats = true;
        } else if (arg.startsWith('--')) {
            const key = arg.slice(2);
            const value = argv[i + 1];
            if (value && !value.startsWith('--')) {
                args[key] = value;
                i++;
            }
        }
    }

    return args as any;
}

// Mostrar ajuda
function showHelp(): void {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║           GERADOR HÍBRIDO DE RIMAS - CLI                     ║
╚══════════════════════════════════════════════════════════════╝

USO:
  npm run generate -- --tema "seu tema" --estilo "estilo"

OPÇÕES:
  --tema      Tema principal para os versos (obrigatório)
  --estilo    Estilo de rap (obrigatório):
              • gangsta    - Agressivo, de rua
              • consciente - Reflexivo, crítico
              • trap       - Moderno, melódico
              • boom_bap   - Clássico, técnico
              • poetico    - Lírico, romântico
  --contexto  Contexto adicional para guiar a geração (opcional)
  --stats     Mostrar estatísticas do banco
  --help      Mostrar esta ajuda

EXEMPLOS:
  npm run generate -- --tema "superação" --estilo "consciente"
  npm run generate -- --tema "vida na quebrada" --estilo "gangsta"
  npm run generate -- --tema "amor perdido" --estilo "poetico" --contexto "fim de relacionamento"

CONFIGURAÇÃO:
  1. Copie .env.example para .env
  2. Configure OPENAI_API_KEY
  3. (Opcional) Execute: npm run setup-fts
  4. (Opcional) Instale Ollama: ollama pull llama3.2
`);
}

// Mostrar estatísticas
async function showStats(gerador: RhymeGenerator): Promise<void> {
    console.log('\n=== ESTATÍSTICAS DO BANCO ===\n');

    const stats = gerador.getEstatisticas();
    console.log(`Letras indexadas: ${stats.letras}`);
    console.log(`Rimas extraídas:  ${stats.rimas}`);
    console.log(`Artistas:         ${stats.artistas}`);
    console.log(`FTS5 ativo:       ${stats.fts5 ? 'Sim ✓' : 'Não ✗'}`);

    console.log('\n=== STATUS DOS SERVIÇOS ===\n');
    const servicos = await gerador.verificarServicos();
    console.log(`Banco SQLite:  ${servicos.banco ? 'OK ✓' : 'Vazio ✗'}`);
    console.log(`Índice FTS5:   ${servicos.fts5 ? 'OK ✓' : 'Não configurado ✗'}`);
    console.log(`Ollama LLM:    ${servicos.ollama ? 'OK ✓' : 'Offline ✗'}`);

    if (!servicos.fts5) {
        console.log('\n[DICA] Execute "npm run setup-fts" para configurar busca full-text.');
    }
    if (!servicos.ollama) {
        console.log('[DICA] Instale Ollama e execute "ollama pull llama3.2" para validação local.');
    }
}

// Função principal
async function main(): Promise<void> {
    const args = parseArgs();

    // Mostrar ajuda
    if (args.help) {
        showHelp();
        process.exit(0);
    }

    const gerador = new RhymeGenerator();

    try {
        // Mostrar estatísticas
        if (args.stats) {
            await showStats(gerador);
            process.exit(0);
        }

        // Validar argumentos obrigatórios
        if (!args.tema) {
            console.error('Erro: --tema é obrigatório');
            console.log('Use --help para ver opções disponíveis.');
            process.exit(1);
        }

        if (!args.estilo) {
            console.error('Erro: --estilo é obrigatório');
            console.log('Use --help para ver opções disponíveis.');
            process.exit(1);
        }

        const estilosValidos: EstiloRap[] = ['gangsta', 'consciente', 'trap', 'boom_bap', 'poetico'];
        if (!estilosValidos.includes(args.estilo)) {
            console.error(`Erro: estilo "${args.estilo}" inválido`);
            console.log(`Estilos válidos: ${estilosValidos.join(', ')}`);
            process.exit(1);
        }

        // Verificar API key
        if (!process.env.OPENAI_API_KEY) {
            console.error('Erro: OPENAI_API_KEY não configurada');
            console.log('Configure no arquivo .env ou exporte a variável de ambiente.');
            process.exit(1);
        }

        // Header
        console.log('\n╔══════════════════════════════════════════════════════════════╗');
        console.log('║           GERADOR HÍBRIDO DE RIMAS                           ║');
        console.log('╚══════════════════════════════════════════════════════════════╝\n');
        console.log(`Tema:     ${args.tema}`);
        console.log(`Estilo:   ${args.estilo}`);
        if (args.contexto) {
            console.log(`Contexto: ${args.contexto}`);
        }
        console.log('');

        // Gerar
        const resultado = await gerador.gerar({
            tema: args.tema,
            estilo: args.estilo,
            contexto: args.contexto
        });

        // Resultado
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('                        RESULTADO');
        console.log('═══════════════════════════════════════════════════════════════\n');

        console.log('VERSOS GERADOS:');
        console.log('───────────────────────────────────────────────────────────────');
        resultado.versos.forEach((verso, i) => {
            console.log(`  ${verso}`);
        });
        console.log('───────────────────────────────────────────────────────────────\n');

        console.log('MÉTRICAS:');
        console.log(`  Score:        ${resultado.score}/10 ${resultado.aprovado ? '✓' : '✗'}`);
        console.log(`  Tentativas:   ${resultado.tentativas}`);
        console.log(`  Tempo:        ${resultado.tempo_ms}ms`);
        console.log(`  Custo:        R$ ${resultado.custo.custo_reais.toFixed(4)}`);
        console.log(`  Tokens:       ${resultado.custo.tokens_input} in / ${resultado.custo.tokens_output} out`);

        console.log('\nVALIDAÇÃO:');
        console.log(`  Rima:         ${resultado.validacao.criterios.rima}/10`);
        console.log(`  Métrica:      ${resultado.validacao.criterios.metrica}/10`);
        console.log(`  Coerência:    ${resultado.validacao.criterios.coerencia}/10`);
        console.log(`  Original.:    ${resultado.validacao.criterios.originalidade}/10`);
        console.log(`  Feedback:     ${resultado.validacao.feedback}`);

        console.log('\nINSPIRAÇÃO (top 3):');
        resultado.inspiracao.slice(0, 3).forEach(letra => {
            console.log(`  • ${letra.titulo} (${letra.artista})`);
        });

        console.log('\n═══════════════════════════════════════════════════════════════\n');

    } catch (error) {
        if (error instanceof ErroGeracao) {
            console.error(`\n[ERRO] ${error.codigo}: ${error.message}`);
            if (error.codigo === 'FTS_VAZIO') {
                console.log('\nDica: Verifique se o banco tem letras do estilo solicitado.');
                console.log('      Execute "npm run generate -- --stats" para ver estatísticas.');
            }
        } else {
            console.error('\n[ERRO]', error);
        }
        process.exit(1);
    } finally {
        gerador.close();
    }
}

main();
