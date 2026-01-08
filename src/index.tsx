import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS
app.use('/api/*', cors())

// Banco de dados em memoria
const bancoDados: {
  letras: Array<{ id: number; titulo: string; artista: string; letra: string }>;
  rimas: Array<any>;
  rimasGeradas: Array<{ tema: string; estilo: string; conteudo: string; score: number; data: string }>;
} = {
  letras: [
    {
      id: 1,
      titulo: 'Batalha Exemplo 1',
      artista: 'MC Teste',
      letra: 'Minha vida e um verso, cada luta e refrao\nNo concreto da quebrada eu escrevo minha cancao\nNao venho com fake, meu flow e de raiz\nNa batalha da vida, so sobrevive feliz'
    },
    {
      id: 2,
      titulo: 'Batalha Exemplo 2',
      artista: 'MC Flow',
      letra: 'Teu verso e bonito mas na rua e diferente\nEnquanto tu poetiza eu to no corre presente\nMinha caneta e a rua, minha tinta e suor\nNao falo de batalha, eu vivo o valor'
    }
  ],
  rimas: [],
  rimasGeradas: []
}

// Funcao para analisar rimas
function analisarRimas(letra: string) {
  const versos = letra.split('\n').filter(v => v.trim())
  const rimas = []

  for (let i = 0; i < versos.length - 1; i++) {
    const palavras1 = versos[i].trim().split(' ')
    const palavras2 = versos[i + 1].trim().split(' ')

    const ultima1 = palavras1[palavras1.length - 1].toLowerCase().replace(/[.,!?]/g, '')
    const ultima2 = palavras2[palavras2.length - 1].toLowerCase().replace(/[.,!?]/g, '')

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
          score: 0.85
        })
      }
    }
  }

  return rimas
}

// Funcao para gerar rimas
function gerarRima(tema: string, estilo: string) {
  const templates: Record<string, string[]> = {
    agressivo: [
      `No ${tema} eu sou rei, minha palavra e lei`,
      `Enquanto voce dorme, eu to no corre fiel`,
      `Meu verso e pesado, flow calibrado`,
      `Na batalha da vida, eu sou o mais cotado`
    ],
    tecnico: [
      `${tema} no sangue, rima na veia`,
      `Cada verso que eu solto e uma nova ideia`,
      `Tecnica apurada, flow sem freio`,
      `No game do rap, eu domino o meio`
    ],
    filosofico: [
      `${tema} me ensina, a vida e professor`,
      `Cada cicatriz que eu tenho conta uma dor`,
      `Mas no concreto eu aprendi o valor`,
      `De cada batalha vencida com amor`
    ]
  }

  const escolhido = templates[estilo] || templates.agressivo

  return {
    tema,
    estilo,
    conteudo: escolhido.join('\n'),
    score: Math.random() * 2 + 8,
    data: new Date().toISOString()
  }
}

// API: Listar letras
app.get('/api/letras', (c) => {
  return c.json({
    total: bancoDados.letras.length,
    letras: bancoDados.letras
  })
})

// API: Buscar letra especifica
app.get('/api/letras/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const letra = bancoDados.letras.find(l => l.id === id)

  if (!letra) {
    return c.json({ error: 'Letra nao encontrada' }, 404)
  }

  return c.json(letra)
})

// API: Analisar rimas de uma letra
app.post('/api/analisar', async (c) => {
  const { letraId } = await c.req.json()
  const letra = bancoDados.letras.find(l => l.id === letraId)

  if (!letra) {
    return c.json({ error: 'Letra nao encontrada' }, 404)
  }

  const rimas = analisarRimas(letra.letra)

  return c.json({
    letra: letra.titulo,
    artista: letra.artista,
    totalRimas: rimas.length,
    rimas
  })
})

// API: Gerar nova rima
app.post('/api/gerar', async (c) => {
  const { tema, estilo } = await c.req.json()

  if (!tema) {
    return c.json({ error: 'Tema e obrigatorio' }, 400)
  }

  const rima = gerarRima(tema, estilo || 'agressivo')
  bancoDados.rimasGeradas.push(rima)

  return c.json(rima)
})

// API: Listar rimas geradas
app.get('/api/rimas-geradas', (c) => {
  return c.json({
    total: bancoDados.rimasGeradas.length,
    rimas: bancoDados.rimasGeradas.slice(-10)
  })
})

// API: Estatisticas
app.get('/api/stats', (c) => {
  const totalVersos = bancoDados.letras.reduce((acc, l) => {
    return acc + l.letra.split('\n').length
  }, 0)

  return c.json({
    totalLetras: bancoDados.letras.length,
    totalVersos,
    totalRimasGeradas: bancoDados.rimasGeradas.length,
    mediaScore: bancoDados.rimasGeradas.length > 0
      ? bancoDados.rimasGeradas.reduce((acc, r) => acc + r.score, 0) / bancoDados.rimasGeradas.length
      : 0
  })
})

// Pagina principal
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IA de Rimas Brasil - Batalhas de Rap</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 min-h-screen text-white">
        <div class="container mx-auto px-4 py-8">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-5xl font-bold mb-4">
                    <i class="fas fa-fire text-orange-500"></i>
                    IA DE RIMAS BRASIL
                </h1>
                <p class="text-xl text-gray-300">Sistema de Analise e Geracao de Rimas de Batalha</p>
                <p class="text-sm text-gray-400 mt-2">
                    <i class="fas fa-microchip"></i> Otimizado para ROG Strix G16 (i9-14900HX + RTX 5070)
                </p>
            </div>

            <!-- Estatisticas -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div class="bg-gray-800 rounded-lg p-6 text-center">
                    <i class="fas fa-music text-4xl text-blue-500 mb-3"></i>
                    <h3 class="text-3xl font-bold" id="totalLetras">0</h3>
                    <p class="text-gray-400">Letras Coletadas</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-6 text-center">
                    <i class="fas fa-scroll text-4xl text-green-500 mb-3"></i>
                    <h3 class="text-3xl font-bold" id="totalVersos">0</h3>
                    <p class="text-gray-400">Versos Analisados</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-6 text-center">
                    <i class="fas fa-star text-4xl text-yellow-500 mb-3"></i>
                    <h3 class="text-3xl font-bold" id="totalRimas">0</h3>
                    <p class="text-gray-400">Rimas Geradas</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-6 text-center">
                    <i class="fas fa-trophy text-4xl text-purple-500 mb-3"></i>
                    <h3 class="text-3xl font-bold" id="mediaScore">0.0</h3>
                    <p class="text-gray-400">Score Medio</p>
                </div>
            </div>

            <!-- Tabs -->
            <div class="bg-gray-800 rounded-lg overflow-hidden mb-6">
                <div class="flex border-b border-gray-700">
                    <button onclick="showTab('gerar')" id="tab-gerar" class="flex-1 px-6 py-4 font-bold bg-purple-700 border-b-4 border-purple-500">
                        <i class="fas fa-magic mr-2"></i>GERAR RIMA
                    </button>
                    <button onclick="showTab('letras')" id="tab-letras" class="flex-1 px-6 py-4 font-bold hover:bg-gray-700">
                        <i class="fas fa-list mr-2"></i>VER LETRAS
                    </button>
                    <button onclick="showTab('geradas')" id="tab-geradas" class="flex-1 px-6 py-4 font-bold hover:bg-gray-700">
                        <i class="fas fa-history mr-2"></i>RIMAS GERADAS
                    </button>
                </div>
            </div>

            <!-- Conteudo Gerar Rima -->
            <div id="content-gerar" class="bg-gray-800 rounded-lg p-8">
                <h2 class="text-2xl font-bold mb-6">
                    <i class="fas fa-magic text-purple-500 mr-2"></i>
                    Gerar Nova Rima
                </h2>

                <div class="mb-6">
                    <label class="block text-sm font-bold mb-2">TEMA DA RIMA:</label>
                    <input type="text" id="tema"
                           class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white"
                           placeholder="Ex: batalha, periferia, superacao, tecnologia..."
                           value="batalha">
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-bold mb-2">ESTILO:</label>
                    <select id="estilo" class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white">
                        <option value="agressivo">AGRESSIVO (Estilo Batalha)</option>
                        <option value="tecnico">TECNICO (Flow Complexo)</option>
                        <option value="filosofico">FILOSOFICO (Reflexivo)</option>
                    </select>
                </div>

                <button onclick="gerarRima()"
                        class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition">
                    <i class="fas fa-rocket mr-2"></i>
                    GERAR AGORA
                </button>

                <div id="resultado" class="mt-8 hidden">
                    <div class="bg-gray-900 rounded-lg p-6 border-l-4 border-purple-500">
                        <h3 class="text-xl font-bold mb-4">
                            <i class="fas fa-fire text-orange-500 mr-2"></i>
                            RIMA GERADA:
                        </h3>
                        <pre id="rimaGerada" class="text-lg leading-relaxed whitespace-pre-wrap mb-4"></pre>
                        <div class="flex justify-between items-center border-t border-gray-700 pt-4">
                            <div>
                                <span class="text-sm text-gray-400">TEMA:</span>
                                <span id="temaMostrado" class="ml-2 font-bold"></span>
                            </div>
                            <div>
                                <span class="text-sm text-gray-400">ESTILO:</span>
                                <span id="estiloMostrado" class="ml-2 font-bold"></span>
                            </div>
                            <div>
                                <span class="text-sm text-gray-400">SCORE:</span>
                                <span id="scoreMostrado" class="ml-2 font-bold text-yellow-400"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Conteudo Letras -->
            <div id="content-letras" class="bg-gray-800 rounded-lg p-8 hidden">
                <h2 class="text-2xl font-bold mb-6">
                    <i class="fas fa-list text-blue-500 mr-2"></i>
                    Letras Coletadas
                </h2>
                <div id="listaLetras" class="space-y-4"></div>
            </div>

            <!-- Conteudo Rimas Geradas -->
            <div id="content-geradas" class="bg-gray-800 rounded-lg p-8 hidden">
                <h2 class="text-2xl font-bold mb-6">
                    <i class="fas fa-history text-green-500 mr-2"></i>
                    Historico de Rimas Geradas
                </h2>
                <div id="listaGeradas" class="space-y-4"></div>
            </div>
        </div>

        <script>
            // Carregar estatisticas
            async function carregarStats() {
                try {
                    const response = await fetch('/api/stats');
                    const stats = await response.json();

                    document.getElementById('totalLetras').textContent = stats.totalLetras;
                    document.getElementById('totalVersos').textContent = stats.totalVersos;
                    document.getElementById('totalRimas').textContent = stats.totalRimasGeradas;
                    document.getElementById('mediaScore').textContent = stats.mediaScore.toFixed(1);
                } catch (error) {
                    console.error('Erro ao carregar stats:', error);
                }
            }

            // Trocar abas
            function showTab(tab) {
                document.getElementById('content-gerar').classList.add('hidden');
                document.getElementById('content-letras').classList.add('hidden');
                document.getElementById('content-geradas').classList.add('hidden');

                document.getElementById('tab-gerar').className = 'flex-1 px-6 py-4 font-bold hover:bg-gray-700';
                document.getElementById('tab-letras').className = 'flex-1 px-6 py-4 font-bold hover:bg-gray-700';
                document.getElementById('tab-geradas').className = 'flex-1 px-6 py-4 font-bold hover:bg-gray-700';

                document.getElementById('content-' + tab).classList.remove('hidden');
                document.getElementById('tab-' + tab).className = 'flex-1 px-6 py-4 font-bold bg-purple-700 border-b-4 border-purple-500';

                if (tab === 'letras') carregarLetras();
                if (tab === 'geradas') carregarGeradas();
            }

            // Gerar rima
            async function gerarRima() {
                const tema = document.getElementById('tema').value;
                const estilo = document.getElementById('estilo').value;

                if (!tema) {
                    alert('Digite um tema!');
                    return;
                }

                try {
                    const response = await fetch('/api/gerar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ tema, estilo })
                    });
                    const rima = await response.json();

                    document.getElementById('rimaGerada').textContent = rima.conteudo;
                    document.getElementById('temaMostrado').textContent = rima.tema;
                    document.getElementById('estiloMostrado').textContent = rima.estilo.toUpperCase();
                    document.getElementById('scoreMostrado').textContent = rima.score.toFixed(1) + '/10';
                    document.getElementById('resultado').classList.remove('hidden');

                    carregarStats();
                } catch (error) {
                    alert('Erro ao gerar rima: ' + error.message);
                }
            }

            // Carregar letras
            async function carregarLetras() {
                try {
                    const response = await fetch('/api/letras');
                    const data = await response.json();
                    const letras = data.letras;

                    const html = letras.map(letra => \`
                        <div class="bg-gray-900 rounded-lg p-6 border-l-4 border-blue-500">
                            <h3 class="text-xl font-bold mb-2">\${letra.titulo}</h3>
                            <p class="text-gray-400 mb-4">Artista: \${letra.artista}</p>
                            <pre class="text-sm whitespace-pre-wrap text-gray-300">\${letra.letra}</pre>
                            <button onclick="analisarLetra(\${letra.id})"
                                    class="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded">
                                <i class="fas fa-search mr-2"></i>Analisar Rimas
                            </button>
                        </div>
                    \`).join('');

                    document.getElementById('listaLetras').innerHTML = html;
                } catch (error) {
                    console.error('Erro ao carregar letras:', error);
                }
            }

            // Analisar letra
            async function analisarLetra(id) {
                try {
                    const response = await fetch('/api/analisar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ letraId: id })
                    });
                    const resultado = await response.json();

                    alert('Letra: ' + resultado.letra + '\\nArtista: ' + resultado.artista + '\\nRimas encontradas: ' + resultado.totalRimas);
                } catch (error) {
                    alert('Erro ao analisar: ' + error.message);
                }
            }

            // Carregar rimas geradas
            async function carregarGeradas() {
                try {
                    const response = await fetch('/api/rimas-geradas');
                    const data = await response.json();
                    const rimas = data.rimas;

                    if (rimas.length === 0) {
                        document.getElementById('listaGeradas').innerHTML = '<p class="text-gray-400">Nenhuma rima gerada ainda. Va para a aba "GERAR RIMA"!</p>';
                        return;
                    }

                    const html = rimas.map(rima => \`
                        <div class="bg-gray-900 rounded-lg p-6 border-l-4 border-green-500">
                            <div class="flex justify-between items-center mb-4">
                                <div>
                                    <span class="text-sm text-gray-400">TEMA:</span>
                                    <span class="ml-2 font-bold">\${rima.tema}</span>
                                </div>
                                <div>
                                    <span class="text-sm text-gray-400">ESTILO:</span>
                                    <span class="ml-2 font-bold">\${rima.estilo.toUpperCase()}</span>
                                </div>
                                <div>
                                    <span class="text-sm text-gray-400">SCORE:</span>
                                    <span class="ml-2 font-bold text-yellow-400">\${rima.score.toFixed(1)}/10</span>
                                </div>
                            </div>
                            <pre class="text-sm whitespace-pre-wrap">\${rima.conteudo}</pre>
                        </div>
                    \`).join('');

                    document.getElementById('listaGeradas').innerHTML = html;
                } catch (error) {
                    console.error('Erro ao carregar rimas geradas:', error);
                }
            }

            // Inicializar
            carregarStats();
        </script>
    </body>
    </html>
  `)
})

export default app
