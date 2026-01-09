import 'dotenv/config';
import { GeniusClient } from './genius-api';
import { OllamaProcessor } from './ollama-processor';
import { RimasDatabase } from './database';
import fs from 'fs';
import path from 'path';

// Lista de artistas brasileiros de rap/hip-hop
const ARTISTAS_BR = [
  'Emicida',
  'Racionais MCs',
  'Criolo',
  'Djonga',
  'Rashid',
  'Mano Brown',
  'Sabotage',
  'MV Bill',
  'Marcelo D2',
  'Planet Hemp',
  'GOG',
  'Facção Central',
  'Dexter',
  'Eduardo',
  'Projota',
  'Hungria Hip Hop',
  'Orochi',
  'Poze do Rodo',
  'Kayblack',
  'MC Cabelinho',
  'Filipe Ret',
  'L7nnon',
  'MC Ryan SP',
  'MC IG',
  'Xamã',
  'Baco Exu do Blues',
  'Rincon Sapiência',
  'Rapadura',
  'Don L',
  'Haikaiss',
  'Costa Gold',
  'Pineapple',
  'Nocivo Shomon',
  'Thaíde',
  'Black Alien',
  'BK',
  'Froid',
  'Slim Rimografia',
  'Clara Lima',
  'Drik Barbosa',
  'Flora Matos',
  'Karol Conká',
  'Rico Dalasam',
  'Bivolt',
  'Edi Rock',
  'KL Jay',
  'Negra Li',
  'RAPadura Xique-Chico',
  'Cone Crew Diretoria',
  'Inquérito'
];

const CONFIG = {
  MUSICAS_POR_ARTISTA: 100,
  META_TOTAL: 5000,
  DELAY_ENTRE_MUSICAS: 1000,
  DELAY_ENTRE_ARTISTAS: 5000,
  LOG_FILE: 'logs/crawler.log'
};

class NightCrawler {
  private genius: GeniusClient;
  private ollama: OllamaProcessor;
  private db: RimasDatabase;
  private stats = {
    artistas_processados: 0,
    musicas_coletadas: 0,
    rimas_encontradas: 0,
    erros: 0,
    inicio: new Date()
  };

  constructor() {
    if (!process.env.GENIUS_TOKEN) {
      throw new Error('GENIUS_TOKEN não configurado no .env');
    }

    this.genius = new GeniusClient(process.env.GENIUS_TOKEN);
    this.ollama = new OllamaProcessor();
    this.db = new RimasDatabase();

    // Garantir que pasta de logs existe
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  private log(msg: string) {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${msg}`;
    console.log(logMsg);

    // Salvar em arquivo
    fs.appendFileSync(
      path.join(process.cwd(), CONFIG.LOG_FILE),
      logMsg + '\n'
    );
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async executar() {
    this.log('🦇 NIGHT CRAWLER INICIADO');
    this.log(`📊 Meta: ${CONFIG.META_TOTAL} letras`);
    this.log(`🎤 Artistas: ${ARTISTAS_BR.length}`);
    this.log('═'.repeat(50));

    for (const nomeArtista of ARTISTAS_BR) {
      if (this.stats.musicas_coletadas >= CONFIG.META_TOTAL) {
        this.log(`🎯 Meta atingida! ${this.stats.musicas_coletadas} letras coletadas`);
        break;
      }

      try {
        await this.processarArtista(nomeArtista);
        this.stats.artistas_processados++;
        await this.delay(CONFIG.DELAY_ENTRE_ARTISTAS);
      } catch (error) {
        this.log(`❌ Erro no artista ${nomeArtista}: ${error}`);
        this.stats.erros++;
      }

      // Mostrar progresso
      this.mostrarProgresso();
    }

    this.finalizarRelatorio();
  }

  private async processarArtista(nome: string) {
    this.log(`\n🎤 Processando: ${nome}`);

    // Buscar artista
    const artista = await this.genius.buscarArtista(nome);
    if (!artista) {
      this.log(`   ⚠️ Artista não encontrado: ${nome}`);
      return;
    }

    this.log(`   ✓ ID: ${artista.id}`);

    // Buscar músicas
    const quantidadeRestante = CONFIG.META_TOTAL - this.stats.musicas_coletadas;
    const quantidade = Math.min(CONFIG.MUSICAS_POR_ARTISTA, quantidadeRestante);

    this.log(`   📥 Buscando ${quantidade} músicas...`);
    const musicas = await this.genius.obterMusicasArtista(artista.id, quantidade);

    this.log(`   ✓ ${musicas.length} músicas coletadas`);

    // Processar cada música
    for (const musica of musicas) {
      try {
        this.log(`   🔄 Processando: ${musica.titulo}`);

        // Processar com Ollama
        const resultado = await this.ollama.processar(musica.letra);

        // Salvar no banco
        this.db.salvarLetra(musica, resultado);

        this.stats.musicas_coletadas++;
        this.stats.rimas_encontradas += resultado.rimas.length;

        this.log(`      ✓ ${resultado.rimas.length} rimas | Qualidade: ${(resultado.qualidade * 10).toFixed(1)}/10`);

        await this.delay(CONFIG.DELAY_ENTRE_MUSICAS);
      } catch (error) {
        this.log(`      ❌ Erro: ${error}`);
        this.stats.erros++;
      }
    }
  }

  private mostrarProgresso() {
    const agora = new Date();
    const tempoDecorrido = (agora.getTime() - this.stats.inicio.getTime()) / 1000 / 60; // minutos
    const velocidade = this.stats.musicas_coletadas / tempoDecorrido;
    const restante = CONFIG.META_TOTAL - this.stats.musicas_coletadas;
    const tempoEstimado = restante / velocidade;

    const progresso = (this.stats.musicas_coletadas / CONFIG.META_TOTAL * 100).toFixed(1);
    const barra = '█'.repeat(Math.floor(Number(progresso) / 5)) + '░'.repeat(20 - Math.floor(Number(progresso) / 5));

    this.log('');
    this.log(`📊 PROGRESSO: [${barra}] ${progresso}%`);
    this.log(`   Letras: ${this.stats.musicas_coletadas}/${CONFIG.META_TOTAL}`);
    this.log(`   Rimas: ${this.stats.rimas_encontradas}`);
    this.log(`   Artistas: ${this.stats.artistas_processados}/${ARTISTAS_BR.length}`);
    this.log(`   Velocidade: ${velocidade.toFixed(1)} letras/min`);
    this.log(`   Tempo restante: ~${tempoEstimado.toFixed(0)} min`);
    this.log(`   Erros: ${this.stats.erros}`);
  }

  private finalizarRelatorio() {
    const agora = new Date();
    const tempoTotal = (agora.getTime() - this.stats.inicio.getTime()) / 1000 / 60;

    const dbStats = this.db.getEstatisticas();

    this.log('\n' + '═'.repeat(50));
    this.log('🏁 COLETA FINALIZADA!');
    this.log('═'.repeat(50));
    this.log(`📊 ESTATÍSTICAS FINAIS:`);
    this.log(`   • Tempo total: ${tempoTotal.toFixed(1)} minutos`);
    this.log(`   • Artistas processados: ${this.stats.artistas_processados}`);
    this.log(`   • Letras coletadas: ${dbStats.total_letras}`);
    this.log(`   • Rimas extraídas: ${dbStats.total_rimas}`);
    this.log(`   • Qualidade média: ${(dbStats.media_qualidade * 10).toFixed(1)}/10`);
    this.log(`   • Erros: ${this.stats.erros}`);
    this.log('');
    this.log(`📁 Banco de dados: data/rimas.db`);
    this.log(`📁 Log completo: ${CONFIG.LOG_FILE}`);
    this.log('═'.repeat(50));

    // Mostrar distribuição de estilos
    if (Object.keys(dbStats.estilos).length > 0) {
      this.log('\n🎨 ESTILOS ENCONTRADOS:');
      for (const [estilo, count] of Object.entries(dbStats.estilos)) {
        this.log(`   • ${estilo}: ${count} letras`);
      }
    }

    this.db.close();
  }
}

// Executar
const crawler = new NightCrawler();
crawler.executar().catch(error => {
  console.error('❌ ERRO FATAL:', error);
  process.exit(1);
});
