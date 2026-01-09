const fs = require('fs');

let content = fs.readFileSync('generator.ts', 'utf8');

// Substituir a lógica de geração para incluir Ollama
const oldCode = `  let versos: string[] = []
  let tokensUsados = 0
  let fonte: 'gpt-4o-mini' | 'fallback' = 'fallback'

  // Tentar GPT-4o-mini
  if (openai) {
    try {
      const prompt = buildPrompt(params, rimas, letras)

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Voce e um MC brasileiro especialista em batalhas de rima. Responda APENAS com os versos solicitados, sem explicacoes ou formatacao extra.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8,
      })

      const content = response.choices[0]?.message?.content || ''
      versos = content
        .split('\\n')
        .map(v => v.trim())
        .filter(v => v.length > 5 && !v.startsWith('#') && !v.match(/^\\d+\\./))

      tokensUsados = response.usage?.total_tokens || 0
      fonte = 'gpt-4o-mini'

      console.log(\`[GPT] Gerado \${versos.length} versos, \${tokensUsados} tokens\`)

    } catch (error: any) {
      console.error('[GPT] Erro:', error.message)
      // Fallback sera usado
    }
  }

  // Fallback se GPT falhou ou nao esta configurado
  if (versos.length < 4) {
    console.log('[FALLBACK] Usando templates')
    const template = FALLBACK_TEMPLATES[params.estilo] || FALLBACK_TEMPLATES.agressivo
    versos = template(params.tema).slice(0, params.num_versos || 8)
    fonte = 'fallback'
  }`;

const newCode = `  let versos: string[] = []
  let tokensUsados = 0
  let fonte: 'gpt-4o-mini' | 'ollama' | 'fallback' = 'fallback'

  const prompt = buildPrompt(params, rimas, letras)

  // 1. Tentar Ollama primeiro (local, gratuito)
  if (params.usar_ollama !== false) {
    try {
      console.log('[OLLAMA] Tentando gerar com', OLLAMA_MODEL)
      const ollamaResponse = await callOllama(prompt)

      if (ollamaResponse) {
        versos = ollamaResponse
          .split('\\n')
          .map(v => v.trim())
          .filter(v => v.length > 5 && !v.startsWith('#') && !v.match(/^\\d+\\./) && !v.startsWith('```'))

        if (versos.length >= 4) {
          fonte = 'ollama'
          console.log(\`[OLLAMA] Gerado \${versos.length} versos\`)
        }
      }
    } catch (error: any) {
      console.error('[OLLAMA] Erro:', error.message)
    }
  }

  // 2. Tentar GPT-4o-mini se Ollama falhou
  if (versos.length < 4 && openai) {
    try {
      console.log('[GPT] Tentando gerar com gpt-4o-mini')
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Voce e um MC brasileiro especialista em batalhas de rima. Responda APENAS com os versos solicitados, sem explicacoes ou formatacao extra.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8,
      })

      const content = response.choices[0]?.message?.content || ''
      versos = content
        .split('\\n')
        .map(v => v.trim())
        .filter(v => v.length > 5 && !v.startsWith('#') && !v.match(/^\\d+\\./))

      tokensUsados = response.usage?.total_tokens || 0
      fonte = 'gpt-4o-mini'

      console.log(\`[GPT] Gerado \${versos.length} versos, \${tokensUsados} tokens\`)

    } catch (error: any) {
      console.error('[GPT] Erro:', error.message)
    }
  }

  // 3. Fallback se ambos falharam
  if (versos.length < 4) {
    console.log('[FALLBACK] Usando templates')
    const template = FALLBACK_TEMPLATES[params.estilo] || FALLBACK_TEMPLATES.agressivo
    versos = template(params.tema).slice(0, params.num_versos || 8)
    fonte = 'fallback'
  }`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync('generator.ts', content);
  console.log('gerarRima patched with Ollama support!');
} else {
  console.log('Old code not found - may already be patched');
  // Tentar patch mais simples
  if (!content.includes('callOllama(prompt)')) {
    console.log('Trying simpler patch...');
    content = content.replace(
      "let fonte: 'gpt-4o-mini' | 'fallback' = 'fallback'",
      "let fonte: 'gpt-4o-mini' | 'ollama' | 'fallback' = 'fallback'"
    );
    fs.writeFileSync('generator.ts', content);
  }
}
