import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import Database from 'better-sqlite3';
import path from 'path';
import { z } from 'zod';
import {
  GerarRimaInputSchema,
  HistoricoQuerySchema,
  type GerarRimaInput,
  type HistoricoQuery,
} from './schemas/rima.schemas';

// Schemas de validação para endpoints específicos
const BuscaAvancadaSchema = z.object({
  palavra: z.string().optional(),
  tipo: z.enum(['perfeita', 'consoante', 'toante', 'interna'], {
    invalid_type_error: 'Tipo inválido. Use: perfeita, consoante, toante ou interna',
  }).optional(),
  artista_id: z.number().int().positive().optional(),
  qualidade_min: z.number().min(0).max(100).optional(),
  limite: z.number().int().positive().max(100).optional().default(50),
});

const QueryLimiteSchema = z.object({
  limite: z.coerce.number().int().positive().max(100).optional().default(50),
});

const QueryLimiteSugestaoSchema = z.object({
  limite: z.coerce.number().int().positive().max(100).optional().default(30),
});

const QueryLimiteLetrasSchema = z.object({
  limite: z.coerce.number().int().positive().max(100).optional().default(20),
});

const TopQuerySchema = z.object({
  limite: z.coerce.number().int().positive().max(100).optional().default(50),
  tipo: z.enum(['perfeita', 'consoante', 'toante', 'interna']).optional(),
});

const app = new Hono();

// CORS
app.use('/*', cors());

// Conexão com banco
function getDb() {
  const dbPath = path.join(process.cwd(), 'data', 'rimas.db');
  return new Database(dbPath, { readonly: true });
}

// ==================== ENDPOINTS ====================

// Status da API
app.get('/', (c) => {
  const db = getDb();
  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM letras) as total_letras,
      (SELECT COUNT(*) FROM rimas) as total_rimas,
      (SELECT COUNT(*) FROM artistas) as total_artistas,
      (SELECT AVG(qualidade) FROM letras) as media_qualidade
  `).get() as any;
  db.close();

  return c.json({
    status: 'online',
    versao: '1.0.0',
    banco: {
      letras: stats.total_letras,
      rimas: stats.total_rimas,
      artistas: stats.total_artistas,
      qualidade_media: Number((stats.media_qualidade * 10).toFixed(1))
    }
  });
});

// Buscar rimas por palavra
app.get('/buscar/:palavra', zValidator('query', QueryLimiteSchema), (c) => {
  const palavra = c.req.param('palavra').toLowerCase();
  const { limite } = c.req.valid('query');

  const db = getDb();

  // Buscar rimas que contenham a palavra
  const rimas = db.prepare(`
    SELECT DISTINCT
      r.palavra1,
      r.palavra2,
      r.tipo,
      r.score,
      l.titulo as musica,
      l.artista_id
    FROM rimas r
    JOIN letras l ON r.letra_id = l.id
    WHERE r.palavra1 LIKE ? OR r.palavra2 LIKE ?
    ORDER BY r.score DESC
    LIMIT ?
  `).all(`%${palavra}%`, `%${palavra}%`, limite) as any[];

  db.close();

  // Agrupar por tipo
  const porTipo = {
    perfeita: rimas.filter(r => r.tipo === 'perfeita'),
    consoante: rimas.filter(r => r.tipo === 'consoante'),
    toante: rimas.filter(r => r.tipo === 'toante'),
    interna: rimas.filter(r => r.tipo === 'interna')
  };

  return c.json({
    palavra,
    total: rimas.length,
    por_tipo: {
      perfeita: porTipo.perfeita.length,
      consoante: porTipo.consoante.length,
      toante: porTipo.toante.length,
      interna: porTipo.interna.length
    },
    rimas: rimas.map(r => ({
      rima: r.palavra1 === palavra ? r.palavra2 : r.palavra1,
      par: [r.palavra1, r.palavra2],
      tipo: r.tipo,
      score: r.score,
      musica: r.musica
    }))
  });
});

// Sugerir rimas para uma palavra (encontrar palavras que rimam)
app.get('/sugerir/:palavra', zValidator('query', QueryLimiteSugestaoSchema), (c) => {
  const palavra = c.req.param('palavra').toLowerCase();
  const { limite } = c.req.valid('query');

  const db = getDb();

  // Encontrar terminação da palavra (últimas 2-3 letras)
  const fim2 = palavra.slice(-2);
  const fim3 = palavra.length >= 3 ? palavra.slice(-3) : fim2;

  // Buscar palavras com mesma terminação
  const sugestoes = db.prepare(`
    SELECT DISTINCT palavra1 as palavra, tipo, COUNT(*) as frequencia
    FROM rimas
    WHERE (palavra1 LIKE ? OR palavra1 LIKE ?) AND palavra1 != ?
    GROUP BY palavra1
    UNION
    SELECT DISTINCT palavra2 as palavra, tipo, COUNT(*) as frequencia
    FROM rimas
    WHERE (palavra2 LIKE ? OR palavra2 LIKE ?) AND palavra2 != ?
    GROUP BY palavra2
    ORDER BY frequencia DESC
    LIMIT ?
  `).all(`%${fim3}`, `%${fim2}`, palavra, `%${fim3}`, `%${fim2}`, palavra, limite) as any[];

  db.close();

  return c.json({
    palavra,
    terminacao: fim3,
    total: sugestoes.length,
    sugestoes: sugestoes.map(s => ({
      palavra: s.palavra,
      tipo: s.tipo,
      frequencia: s.frequencia
    }))
  });
});

// Top rimas mais usadas
app.get('/top', zValidator('query', TopQuerySchema), (c) => {
  const { limite, tipo } = c.req.valid('query');

  const db = getDb();

  let query = `
    SELECT palavra1, palavra2, tipo, COUNT(*) as frequencia, AVG(score) as score_medio
    FROM rimas
    ${tipo ? 'WHERE tipo = ?' : ''}
    GROUP BY palavra1, palavra2
    ORDER BY frequencia DESC
    LIMIT ?
  `;

  const params = tipo ? [tipo, limite] : [limite];
  const top = db.prepare(query).all(...params) as any[];

  db.close();

  return c.json({
    total: top.length,
    filtro_tipo: tipo || 'todos',
    rimas: top.map(r => ({
      par: [r.palavra1, r.palavra2],
      tipo: r.tipo,
      frequencia: r.frequencia,
      score_medio: Number(r.score_medio.toFixed(2))
    }))
  });
});

// Listar artistas
app.get('/artistas', (c) => {
  const db = getDb();

  const artistas = db.prepare(`
    SELECT
      a.id,
      a.nome,
      a.genius_id,
      COUNT(DISTINCT l.id) as total_musicas,
      AVG(l.qualidade) as qualidade_media,
      SUM(l.versos_total) as total_versos
    FROM artistas a
    LEFT JOIN letras l ON l.artista_id = a.id
    GROUP BY a.id
    ORDER BY total_musicas DESC
  `).all() as any[];

  db.close();

  return c.json({
    total: artistas.length,
    artistas: artistas.map(a => ({
      id: a.id,
      nome: a.nome,
      genius_id: a.genius_id,
      musicas: a.total_musicas,
      qualidade: Number((a.qualidade_media * 10).toFixed(1)),
      versos: a.total_versos
    }))
  });
});

// Buscar letras por artista
app.get('/artistas/:id/letras', zValidator('query', QueryLimiteLetrasSchema), (c) => {
  const artistaId = Number(c.req.param('id'));
  const { limite } = c.req.valid('query');

  const db = getDb();

  const artista = db.prepare('SELECT * FROM artistas WHERE id = ?').get(artistaId) as any;

  if (!artista) {
    db.close();
    return c.json({ error: 'Artista não encontrado' }, 404);
  }

  const letras = db.prepare(`
    SELECT id, titulo, estilo, qualidade, versos_total, palavras_total, temas
    FROM letras
    WHERE artista_id = ?
    ORDER BY qualidade DESC
    LIMIT ?
  `).all(artistaId, limite) as any[];

  db.close();

  return c.json({
    artista: artista.nome,
    total: letras.length,
    letras: letras.map(l => ({
      id: l.id,
      titulo: l.titulo,
      estilo: l.estilo,
      qualidade: Number((l.qualidade * 10).toFixed(1)),
      versos: l.versos_total,
      palavras: l.palavras_total,
      temas: JSON.parse(l.temas || '[]')
    }))
  });
});

// Detalhes de uma letra específica
app.get('/letras/:id', (c) => {
  const letraId = Number(c.req.param('id'));

  const db = getDb();

  const letra = db.prepare(`
    SELECT l.*, a.nome as artista_nome
    FROM letras l
    JOIN artistas a ON l.artista_id = a.id
    WHERE l.id = ?
  `).get(letraId) as any;

  if (!letra) {
    db.close();
    return c.json({ error: 'Letra não encontrada' }, 404);
  }

  const rimas = db.prepare(`
    SELECT palavra1, palavra2, tipo, score
    FROM rimas
    WHERE letra_id = ?
    ORDER BY score DESC
  `).all(letraId) as any[];

  db.close();

  return c.json({
    id: letra.id,
    titulo: letra.titulo,
    artista: letra.artista_nome,
    estilo: letra.estilo,
    qualidade: Number((letra.qualidade * 10).toFixed(1)),
    versos: letra.versos_total,
    palavras: letra.palavras_total,
    temas: JSON.parse(letra.temas || '[]'),
    letra: letra.letra,
    rimas: {
      total: rimas.length,
      lista: rimas.map(r => ({
        par: [r.palavra1, r.palavra2],
        tipo: r.tipo,
        score: r.score
      }))
    }
  });
});

// Estatísticas por estilo
app.get('/estilos', (c) => {
  const db = getDb();

  const estilos = db.prepare(`
    SELECT
      estilo,
      COUNT(*) as total_letras,
      AVG(qualidade) as qualidade_media,
      SUM(versos_total) as total_versos
    FROM letras
    WHERE estilo IS NOT NULL AND estilo != 'indefinido'
    GROUP BY estilo
    ORDER BY total_letras DESC
  `).all() as any[];

  db.close();

  return c.json({
    estilos: estilos.map(e => ({
      nome: e.estilo,
      letras: e.total_letras,
      qualidade: Number((e.qualidade_media * 10).toFixed(1)),
      versos: e.total_versos
    }))
  });
});

// Busca avançada
app.post('/busca-avancada', zValidator('json', BuscaAvancadaSchema), async (c) => {
  const { palavra, tipo, artista_id, qualidade_min, limite } = c.req.valid('json');

  const db = getDb();

  let query = `
    SELECT DISTINCT
      r.palavra1, r.palavra2, r.tipo, r.score,
      l.titulo, l.qualidade,
      a.nome as artista
    FROM rimas r
    JOIN letras l ON r.letra_id = l.id
    JOIN artistas a ON l.artista_id = a.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (palavra) {
    query += ` AND (r.palavra1 LIKE ? OR r.palavra2 LIKE ?)`;
    params.push(`%${palavra}%`, `%${palavra}%`);
  }

  if (tipo) {
    query += ` AND r.tipo = ?`;
    params.push(tipo);
  }

  if (artista_id) {
    query += ` AND l.artista_id = ?`;
    params.push(artista_id);
  }

  if (qualidade_min) {
    query += ` AND l.qualidade >= ?`;
    params.push(qualidade_min / 10);
  }

  query += ` ORDER BY r.score DESC LIMIT ?`;
  params.push(limite);

  const resultados = db.prepare(query).all(...params) as any[];

  db.close();

  return c.json({
    filtros: { palavra, tipo, artista_id, qualidade_min },
    total: resultados.length,
    resultados: resultados.map(r => ({
      par: [r.palavra1, r.palavra2],
      tipo: r.tipo,
      score: r.score,
      musica: r.titulo,
      artista: r.artista,
      qualidade: Number((r.qualidade * 10).toFixed(1))
    }))
  });
});

// Gerar rima baseada no banco (GET simples)
app.get('/gerar/:tema', async (c) => {
  const tema = c.req.param('tema').toLowerCase();
  return gerarRima(c, { tema, estilo: 'livre' });
});

// Gerar rima com validação completa (POST)
app.post('/gerar', zValidator('json', GerarRimaInputSchema), async (c) => {
  const input = c.req.valid('json');
  return gerarRima(c, input);
});

// Função auxiliar para gerar rimas
async function gerarRima(c: any, input: GerarRimaInput) {
  const { tema, estilo, contexto } = input;

  const db = getDb();

  // Construir query baseada nos filtros
  let whereClause = `(r.verso1 LIKE ? OR r.verso2 LIKE ? OR l.temas LIKE ?)`;
  const params: any[] = [`%${tema}%`, `%${tema}%`, `%${tema}%`];

  // Filtrar por estilo se especificado
  if (estilo && estilo !== 'livre') {
    whereClause += ` AND l.estilo = ?`;
    params.push(estilo);
  }

  // Filtrar por contexto se especificado
  if (contexto) {
    whereClause += ` AND (r.verso1 LIKE ? OR r.verso2 LIKE ?)`;
    params.push(`%${contexto}%`, `%${contexto}%`);
  }

  const versos = db.prepare(`
    SELECT DISTINCT r.verso1, r.verso2, r.palavra1, r.palavra2, r.score, l.estilo
    FROM rimas r
    JOIN letras l ON r.letra_id = l.id
    WHERE ${whereClause}
    AND r.tipo IN ('perfeita', 'consoante')
    AND length(r.verso1) > 20
    ORDER BY r.score DESC
    LIMIT 20
  `).all(...params) as any[];

  db.close();

  if (versos.length < 4) {
    return c.json({
      error: 'Poucos versos encontrados para esse tema',
      sugestao: 'Tente temas como: vida, rua, amor, luta, favela',
      filtros: { tema, estilo, contexto }
    }, 404);
  }

  // Montar uma rima com versos do banco
  const selecionados = versos.slice(0, 4);

  // Calcular score médio
  const scoreMedio = selecionados.reduce((acc, v) => acc + v.score, 0) / selecionados.length;

  return c.json({
    tema,
    estilo: estilo || 'livre',
    contexto: contexto || null,
    fonte: 'banco de rimas',
    versos_disponiveis: versos.length,
    versos: selecionados.map(v => v.verso1),
    score: Math.round(scoreMedio * 100),
    metadata: {
      total_encontrados: versos.length,
      estilos: [...new Set(versos.map(v => v.estilo))],
    },
    rimas_usadas: selecionados.map(v => ({
      par: [v.palavra1, v.palavra2],
      score: v.score
    }))
  });
}

export default app;
