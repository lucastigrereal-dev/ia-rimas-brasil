import 'dotenv/config';
import { GeniusClient } from './genius-api';
import { OllamaProcessor } from './ollama-processor';
import { RimasDatabase } from './database';

async function testeRapido() {
  console.log('🧪 TESTE RÁPIDO\n');

  // 1. Testar Genius
  console.log('1️⃣ Testando Genius API...');
  const genius = new GeniusClient(process.env.GENIUS_TOKEN!);
  const artista = await genius.buscarArtista('Emicida');

  if (!artista) {
    console.error('❌ Erro: Artista não encontrado');
    return;
  }

  console.log(`✅ Artista encontrado: ${artista.name} (ID: ${artista.id})\n`);

  // 2. Buscar 3 músicas
  console.log('2️⃣ Buscando 3 músicas...');
  const musicas = await genius.obterMusicasArtista(artista.id, 3);
  console.log(`✅ ${musicas.length} músicas coletadas\n`);

  if (musicas.length === 0) {
    console.error('❌ Nenhuma música encontrada');
    return;
  }

  // 3. Testar Ollama
  console.log('3️⃣ Testando processamento com Ollama...');
  const ollama = new OllamaProcessor();
  const processada = await ollama.processar(musicas[0].letra);

  console.log(`✅ Letra processada:`);
  console.log(`   - ${processada.rimas.length} rimas encontradas`);
  console.log(`   - Estilo: ${processada.estilo}`);
  console.log(`   - Qualidade: ${(processada.qualidade * 10).toFixed(1)}/10`);
  console.log(`   - Versos: ${processada.versos_total}`);
  console.log(`   - Palavras: ${processada.palavras_total}\n`);

  // 4. Testar banco de dados
  console.log('4️⃣ Testando banco de dados...');
  const db = new RimasDatabase();
  db.salvarLetra(musicas[0], processada);

  const stats = db.getEstatisticas();
  console.log(`✅ Salvo no banco:`);
  console.log(`   - Total letras: ${stats.total_letras}`);
  console.log(`   - Total rimas: ${stats.total_rimas}`);

  db.close();

  console.log('\n🎉 TESTE COMPLETO! Tudo funcionando!\n');
  console.log('Próximo passo: npx tsx night-crawler/index.ts');
}

testeRapido().catch(console.error);
