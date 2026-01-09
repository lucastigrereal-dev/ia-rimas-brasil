import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import fs from 'fs';
import path from 'path';

const app = new Hono();

// Servir arquivos estáticos da pasta public
app.use('/*', serveStatic({ root: './public' }));

// Fallback para index.html
app.get('/', (c) => {
  const html = fs.readFileSync(path.join(process.cwd(), 'public', 'index.html'), 'utf-8');
  return c.html(html);
});

const PORT = 3003;

console.log('');
console.log('🎤 FRONTEND - BANCO DE RIMAS BRASIL');
console.log('═'.repeat(40));
console.log(`🌐 Acesse: http://localhost:${PORT}`);
console.log('');
console.log('📡 API Backend: http://localhost:3002');
console.log('═'.repeat(40));
console.log('');

serve({
  fetch: app.fetch,
  port: PORT
});

console.log(`✅ Frontend rodando em http://localhost:${PORT}`);
