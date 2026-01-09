import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import apiRimas from './api-rimas';
import iaRimasApi from './api-ia-rimas';

const app = new Hono();

app.route('/', apiRimas);
app.route('/api', iaRimasApi);

const PORT = 3002;

console.log('API DE RIMAS BRASILEIRAS v2.0');
console.log('='.repeat(40));
console.log('Servidor: http://localhost:' + PORT);
console.log('');
console.log('ENDPOINTS DISPONIVEIS:');
console.log('');
console.log('  === BANCO SQLite ===');
console.log('  GET  /                    - Status e estatisticas');
console.log('  GET  /buscar/:palavra     - Buscar rimas por palavra');
console.log('  GET  /sugerir/:palavra    - Sugerir rimas para palavra');
console.log('  GET  /top                 - Top rimas mais usadas');
console.log('  GET  /artistas            - Listar artistas');
console.log('  GET  /artistas/:id/letras - Letras de um artista');
console.log('  GET  /letras/:id          - Detalhes de uma letra');
console.log('  GET  /estilos             - Estatisticas por estilo');
console.log('  POST /busca-avancada      - Busca com filtros');
console.log('  GET  /gerar/:tema         - Gerar rima por tema');
console.log('');
console.log('  === IA RIMAS (Fake Data) ===');
console.log('  POST /api/rimas/gerar     - Gerar rimas com IA');
console.log('  GET  /api/rimas/historico - Historico de rimas geradas');
console.log('  GET  /api/stats           - Estatisticas gerais');
console.log('');
console.log('='.repeat(40));
console.log('');

serve({
  fetch: app.fetch,
  port: PORT
});

console.log('API rodando em http://localhost:' + PORT);
