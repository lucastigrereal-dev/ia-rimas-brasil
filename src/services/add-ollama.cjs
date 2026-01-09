const fs = require('fs');

let content = fs.readFileSync('generator.ts', 'utf8');

// Adicionar config Ollama após o import
const ollamaConfig = `

// Ollama config
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'codellama:7b'

// Ollama API call
async function callOllama(prompt: string): Promise<string | null> {
  try {
    const response = await fetch(OLLAMA_URL + '/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: { temperature: 0.8, num_predict: 500 }
      })
    })

    if (!response.ok) {
      console.error('[OLLAMA] HTTP error:', response.status)
      return null
    }

    const data = await response.json()
    return data.response || null
  } catch (error: any) {
    console.error('[OLLAMA] Error:', error.message)
    return null
  }
}

// Check Ollama availability
export async function checkOllama(): Promise<{ ok: boolean; model?: string; error?: string }> {
  try {
    const response = await fetch(OLLAMA_URL + '/api/tags')
    if (!response.ok) return { ok: false, error: 'Ollama not responding' }
    const data = await response.json()
    const hasModel = data.models?.some(m => m.name === OLLAMA_MODEL)
    return { ok: hasModel, model: OLLAMA_MODEL, error: hasModel ? undefined : 'Model not found' }
  } catch (error: any) {
    return { ok: false, error: error.message }
  }
}
`;

// Inserir após o import
content = content.replace(
  "import { getDB, type Rima, type Letra } from './database'",
  "import { getDB, type Rima, type Letra } from './database'" + ollamaConfig
);

// Atualizar tipo fonte
content = content.replace(
  "fonte: 'gpt-4o-mini' | 'fallback'",
  "fonte: 'gpt-4o-mini' | 'ollama' | 'fallback'"
);

// Adicionar usar_ollama ao GerarParams
content = content.replace(
  /usar_referencia\?: boolean\n\}/,
  'usar_referencia?: boolean\n  usar_ollama?: boolean\n}'
);

fs.writeFileSync('generator.ts', content);
console.log('Ollama config added!');
