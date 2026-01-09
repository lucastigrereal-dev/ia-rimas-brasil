import { Hono } from 'hono';
import { rapLyrics, historicoRimas, getRandomVersos, getArtistasList, type RapLyric } from './data/rapLyrics';

const iaRimasApi = new Hono();

// POST /api/rimas/gerar - Gerar rimas com dados fake
iaRimasApi.post('/rimas/gerar', async (c) => {
  const body = await c.req.json();
  const { tema, estilo, contexto } = body;

  if (!tema) {
    return c.json({ error: 'Tema é obrigatório' }, 400);
  }

  const versos = getRandomVersos(estilo, 4);

  const rimasFiltradas = estilo
    ? rapLyrics.filter(r => r.estilo === estilo)
    : rapLyrics;

  const baseScore = rimasFiltradas.length > 0
    ? rimasFiltradas.reduce((acc, r) => acc + r.score, 0) / rimasFiltradas.length
    : 8.0;

  const score = Number((baseScore + (Math.random() * 0.5 - 0.25)).toFixed(1));

  const novaRima: RapLyric = {
    id: historicoRimas.length + 100,
    titulo: `${tema.charAt(0).toUpperCase() + tema.slice(1)} - Gerado`,
    artista: 'IA Rimas',
    versos,
    score,
    estilo: estilo || 'consciente',
    createdAt: new Date().toISOString()
  };

  historicoRimas.unshift(novaRima);

  return c.json({
    versos: novaRima.versos,
    score: novaRima.score,
    metadata: {
      id: novaRima.id,
      tema,
      estilo: novaRima.estilo,
      contexto: contexto || null,
      geradoEm: novaRima.createdAt,
      fonte: 'ia-local'
    }
  });
});

// GET /api/rimas/historico - Histórico de rimas geradas
iaRimasApi.get('/rimas/historico', (c) => {
  const limit = Number(c.req.query('limit')) || 20;
  const usuario_id = c.req.query('usuario_id');

  let rimas = [...historicoRimas];

  if (usuario_id) {
    rimas = rimas.slice(0, Math.ceil(rimas.length / 2));
  }

  const resultado = rimas.slice(0, limit);

  return c.json({
    rimas: resultado.map(r => ({
      id: r.id,
      titulo: r.titulo,
      versos: r.versos,
      score: r.score,
      estilo: r.estilo,
      createdAt: r.createdAt
    })),
    total: rimas.length
  });
});

// GET /api/stats - Estatísticas gerais
iaRimasApi.get('/stats', (c) => {
  const allRimas = [...rapLyrics, ...historicoRimas];
  const artistas = getArtistasList();

  const totalRimas = allRimas.length;
  const scoreMedio = Number(
    (allRimas.reduce((acc, r) => acc + r.score, 0) / totalRimas).toFixed(1)
  );

  const estilos = ['gangsta', 'consciente', 'trap', 'boom_bap', 'poetico'] as const;
  const porEstilo = estilos.map(estilo => {
    const rimasEstilo = allRimas.filter(r => r.estilo === estilo);
    return {
      estilo,
      total: rimasEstilo.length,
      score_medio: rimasEstilo.length > 0
        ? Number((rimasEstilo.reduce((acc, r) => acc + r.score, 0) / rimasEstilo.length).toFixed(1))
        : 0
    };
  });

  return c.json({
    total_rimas: totalRimas,
    artistas: artistas.length,
    score_medio: scoreMedio,
    rimas_geradas: historicoRimas.length,
    por_estilo: porEstilo
  });
});

export default iaRimasApi;
