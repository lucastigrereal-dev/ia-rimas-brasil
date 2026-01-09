import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { zValidator } from '@hono/zod-validator'
import { getDB } from '../services/database'
import { gerarRima as gerarRimaIA, checkOpenAI, type GerarParams } from '../services/generator'
import {
  GerarRimaInputSchema,
  HistoricoQuerySchema,
} from '../schemas/rima.schemas'

const app = new Hono()
const PORT = 12345

// CORS
app.use('/api/*', cors())

// Database instance
const db = getDB()

// Check OpenAI on startup
checkOpenAI().then(status => {
  if (status.ok) {
    console.log('✅ OpenAI API conectada')
  } else {
    console.log('⚠️  OpenAI:', status.error, '(usando fallback)')
  }
})

// Funcao para analisar rimas
function analisarRimas(letra: string) {
  const versos = letra.split('\n').filter((v) => v.trim())
  const rimas = []

  for (let i = 0; i < versos.length - 1; i++) {
    const palavras1 = versos[i].trim().split(' ')
    const palavras2 = versos[i + 1].trim().split(' ')

    const ultima1 = palavras1[palavras1.length - 1]
      .toLowerCase()
      .replace(/[.,!?]/g, '')
    const ultima2 = palavras2[palavras2.length - 1]
      .toLowerCase()
      .replace(/[.,!?]/g, '')

    if (ultima1.length >= 2 && ultima2.length >= 2) {
      const fim1 = ultima1.slice(-2)
      const fim2 = ultima2.slice(-2)

      if (fim1 === fim2) {
        rimas.push({
          verso1: versos[i],
          verso2: versos[i + 1],
          palavra1: ultima1,
          palavra2: ultima2,
          tipo: 'consoante',
          score: 0.85,
        })
      }
    }
  }

  return rimas
}

// Funcao para gerar rimas (template - sera substituido por GPT)
function gerarRima(tema: string, estilo: string) {
  const templates: Record<string, string[]> = {
    agressivo: [
      `No ${tema} eu sou rei, minha palavra e lei`,
      `Enquanto voce dorme, eu to no corre fiel`,
      `Meu verso e pesado, flow calibrado`,
      `Na batalha da vida, eu sou o mais cotado`,
    ],
    tecnico: [
      `${tema} no sangue, rima na veia`,
      `Cada verso que eu solto e uma nova ideia`,
      `Tecnica apurada, flow sem freio`,
      `No game do rap, eu domino o meio`,
    ],
    filosofico: [
      `${tema} me ensina, a vida e professor`,
      `Cada cicatriz que eu tenho conta uma dor`,
      `Mas no concreto eu aprendi o valor`,
      `De cada batalha vencida com amor`,
    ],
  }

  const escolhido = templates[estilo] || templates.agressivo

  return {
    tema,
    estilo,
    conteudo: escolhido.join('\n'),
    score: Math.random() * 2 + 8,
    data: new Date().toISOString(),
  }
}

// API: Listar letras
app.get('/api/letras', (c) => {
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = parseInt(c.req.query('offset') || '0')
  const estilo = c.req.query('estilo')
  const artista_id = c.req.query('artista_id')

  const letras = db.getLetras({
    limit,
    offset,
    estilo: estilo || undefined,
    artista_id: artista_id ? parseInt(artista_id) : undefined,
  })

  const stats = db.getStats()

  return c.json({
    total: stats.totalLetras,
    limit,
    offset,
    hasMore: offset + letras.length < stats.totalLetras,
    letras: letras.map((l) => ({
      id: l.id,
      titulo: l.titulo,
      artista: l.artista_nome || 'Desconhecido',
      letra: l.letra,
      estilo: l.estilo,
      qualidade: l.qualidade,
      views: l.views,
      versos_total: l.versos_total,
    })),
  })
})

// API: Buscar letras (deve vir ANTES de /api/letras/:id)
app.get('/api/letras/search', (c) => {
  const q = c.req.query('q') || ''
  if (q.length < 2) {
    return c.json({ error: 'Query deve ter ao menos 2 caracteres' }, 400)
  }

  const letras = db.searchLetras(q)
  return c.json({
    query: q,
    count: letras.length,
    results: letras.map((l) => ({
      id: l.id,
      titulo: l.titulo,
      artista: l.artista_nome || 'Desconhecido',
      estilo: l.estilo,
    })),
  })
})

// API: Buscar letra especifica
app.get('/api/letras/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const letra = db.getLetraById(id)

  if (!letra) {
    return c.json({ error: 'Letra nao encontrada' }, 404)
  }

  return c.json({
    id: letra.id,
    titulo: letra.titulo,
    artista: letra.artista_nome || 'Desconhecido',
    letra: letra.letra,
    estilo: letra.estilo,
    qualidade: letra.qualidade,
    views: letra.views,
    versos_total: letra.versos_total,
    temas: letra.temas ? JSON.parse(letra.temas) : [],
  })
})

// API: Analisar rimas de uma letra
app.post('/api/analisar', async (c) => {
  const { letraId } = await c.req.json()
  const letra = db.getLetraById(letraId)

  if (!letra) {
    return c.json({ error: 'Letra nao encontrada' }, 404)
  }

  const rimas = analisarRimas(letra.letra)

  return c.json({
    letra: letra.titulo,
    artista: letra.artista_nome || 'Desconhecido',
    totalRimas: rimas.length,
    rimas,
  })
})

// API: Listar rimas do banco
app.get('/api/rimas', (c) => {
  const palavra = c.req.query('palavra')
  const tipo = c.req.query('tipo')
  const limit = parseInt(c.req.query('limit') || '50')

  const rimas = db.getRimas({
    palavra: palavra || undefined,
    tipo: tipo || undefined,
    limit,
  })

  return c.json({
    total: rimas.length,
    rimas: rimas.map((r) => ({
      id: r.id,
      palavra1: r.palavra1,
      palavra2: r.palavra2,
      verso1: r.verso1,
      verso2: r.verso2,
      tipo: r.tipo,
      score: r.score,
      letra: r.letra_titulo,
    })),
  })
})

// API: Buscar rimas por palavra
app.get('/api/rimas/palavra/:palavra', (c) => {
  const palavra = c.req.param('palavra')
  const rimas = db.getRimasPorPalavra(palavra)

  const sugestoes = [
    ...new Set(
      rimas.map((r) =>
        r.palavra1.toLowerCase() === palavra.toLowerCase()
          ? r.palavra2
          : r.palavra1
      )
    ),
  ]

  return c.json({
    palavra,
    total: rimas.length,
    sugestoes: sugestoes.slice(0, 20),
    matches: rimas.slice(0, 50).map((r) => ({
      palavra1: r.palavra1,
      palavra2: r.palavra2,
      tipo: r.tipo,
      score: r.score,
      verso1: r.verso1,
      verso2: r.verso2,
    })),
  })
})

// API: Gerar nova rima (GPT-4o-mini com fallback)
app.post('/api/gerar', async (c) => {
  const body = await c.req.json()

  if (!body.tema) {
    return c.json({ error: 'Tema e obrigatorio' }, 400)
  }

  const params: GerarParams = {
    tema: body.tema,
    estilo: body.estilo || 'agressivo',
    palavras_chave: body.palavras_chave,
    num_versos: body.num_versos || 8,
    usar_referencia: body.usar_referencia !== false,
  }

  try {
    const result = await gerarRimaIA(params)
    return c.json(result)
  } catch (error: any) {
    console.error('[GERAR] Erro:', error.message)
    return c.json({ error: 'Erro ao gerar rima', details: error.message }, 500)
  }
})

// API: Health check OpenAI
app.get('/api/openai/status', async (c) => {
  const status = await checkOpenAI()
  return c.json(status)
})

// API: Listar rimas geradas
app.get('/api/rimas-geradas', (c) => {
  const limit = parseInt(c.req.query('limit') || '10')
  const rimas = db.getRimasGeradas(limit)

  return c.json({
    total: rimas.length,
    rimas: rimas.map((r) => ({
      id: r.id,
      tema: r.tema,
      estilo: r.estilo,
      conteudo: r.conteudo,
      score: r.score,
      data: r.created_at,
    })),
  })
})

// API: Estatisticas
app.get('/api/stats', (c) => {
  const stats = db.getStats()

  return c.json({
    totalLetras: stats.totalLetras,
    totalVersos: stats.totalVersos,
    totalRimas: stats.totalRimas,
    totalArtistas: stats.totalArtistas,
    totalRimasGeradas: stats.totalRimasGeradas,
    mediaQualidade: stats.mediaQualidade,
    rimasPorTipo: stats.rimasPorTipo,
  })
})

// API: Listar artistas
app.get('/api/artistas', (c) => {
  const artistas = db.getArtistas()
  return c.json({
    total: artistas.length,
    artistas,
  })
})

// Start server
console.log(`\n🎤 IA de Rimas Brasil API rodando em http://localhost:${PORT}`)
console.log(`📊 Stats: http://localhost:${PORT}/api/stats`)
console.log(`🎵 Letras: http://localhost:${PORT}/api/letras`)
console.log(`🔗 Rimas: http://localhost:${PORT}/api/rimas\n`)

serve({ fetch: app.fetch, port: PORT })

// ==================== NOVOS ENDPOINTS (especificados) ====================

// POST /api/rimas/gerar - Gerar rimas (formato especificado)
app.post('/api/rimas/gerar', zValidator('json', GerarRimaInputSchema), async (c) => {
  const { tema, estilo, contexto } = c.req.valid('json')

  const params: GerarParams = {
    tema,
    estilo: (estilo as any) || 'agressivo',
    num_versos: 8,
    usar_referencia: true,
  }

  try {
    const result = await gerarRimaIA(params)
    return c.json({
      versos: result.versos,
      score: result.score,
      metadata: {
        id: result.id,
        tema,
        estilo: result.estilo,
        contexto: contexto || null,
        geradoEm: new Date().toISOString(),
        fonte: result.fonte,
        tokens_usados: result.tokens_usados,
        custo_estimado: result.custo_estimado,
        rimas_usadas: result.rimas_usadas,
        referencias: result.referencias,
      }
    })
  } catch (error: any) {
    console.error('[GERAR] Erro:', error.message)
    return c.json({ error: 'Erro ao gerar rima', details: error.message }, 500)
  }
})

// GET /api/rimas/historico - Historico de rimas geradas
app.get('/api/rimas/historico', zValidator('query', HistoricoQuerySchema), (c) => {
  const { limit, usuario_id } = c.req.valid('query')

  const rimas = db.getRimasGeradas(limit)

  return c.json({
    rimas: rimas.map((r) => ({
      id: r.id,
      titulo: r.tema,
      versos: r.conteudo.split('\n'),
      score: r.score,
      estilo: r.estilo,
      createdAt: r.created_at,
    })),
    total: rimas.length
  })
})
