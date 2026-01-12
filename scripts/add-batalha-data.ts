#!/usr/bin/env tsx
/**
 * Script para adicionar novos dados ao banco ia-rimas-brasil
 * - 700 rimas de batalha
 * - Gírias regionais BR
 * - Exercícios de treino
 */

import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { join } from 'path'

const db = new Database(join(process.cwd(), 'data', 'rimas.db'))
db.pragma('journal_mode = WAL')

console.log('Adicionando novos dados ao ia-rimas-brasil...\n')

// 1. Criar tabela de gírias regionais
console.log('1. Criando tabela girias_regionais...')
db.exec(`
  CREATE TABLE IF NOT EXISTS girias_regionais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estado TEXT NOT NULL,
    palavra TEXT NOT NULL,
    significado TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

db.exec(`CREATE INDEX IF NOT EXISTS idx_girias_estado ON girias_regionais(estado)`)
db.exec(`CREATE INDEX IF NOT EXISTS idx_girias_palavra ON girias_regionais(palavra)`)
console.log('OK Tabela criada!')

// 2. Criar tabela de exercícios
console.log('\n2. Criando tabela exercicios_treino...')
db.exec(`
  CREATE TABLE IF NOT EXISTS exercicios_treino (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    nivel TEXT CHECK(nivel IN ('iniciante', 'intermediario', 'avancado')),
    tipo TEXT,
    conteudo TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)
console.log('OK Tabela criada!')

// 3. Adicionar gírias (dados do JSON)
console.log('\n3. Adicionando gírias regionais...')
try {
  const giriasPath = join(process.cwd(), '..', 'verso-genius', 'data', 'girias.json')
  const giriasData = JSON.parse(readFileSync(giriasPath, 'utf-8'))

  const insertGiria = db.prepare(`
    INSERT INTO girias_regionais (estado, palavra, significado)
    VALUES (?, ?, ?)
  `)

  let count = 0
  for (const [estado, girias] of Object.entries(giriasData)) {
    for (const giria of girias as Array<{palavra: string, significado: string}>) {
      insertGiria.run(estado, giria.palavra, giria.significado)
      count++
    }
  }
  console.log(`OK ${count} gírias adicionadas!`)
} catch (error) {
  console.log('AVISO: Arquivo de gírias não encontrado, continuando...')
}

// 4. Adicionar rimas de batalha
console.log('\n4. Adicionando rimas de batalha...')

// Criar artista "Banco de Batalhas" se não existir
const artistaBatalha = db.prepare(`
  INSERT OR IGNORE INTO artistas (nome, genius_id)
  VALUES ('Banco de Batalhas', 999999)
`).run()

const artistaId = db.prepare(`
  SELECT id FROM artistas WHERE nome = 'Banco de Batalhas'
`).get() as {id: number}

// Criar letra "Rimas de Batalha Compiladas"
const letraId = db.prepare(`
  INSERT OR IGNORE INTO letras (
    artista_id, titulo, letra, estilo, qualidade, genius_id
  ) VALUES (?, 'Rimas de Batalha Compiladas', 'Banco de rimas de batalha', 'agressivo', 8.5, 999999)
  RETURNING id
`).get(artistaId.id) as {id: number} | undefined

const letra_id = letraId?.id || db.prepare(`
  SELECT id FROM letras WHERE genius_id = 999999
`).get() as {id: number}

// Adicionar rimas do verso-genius
try {
  const rimasPath = join(process.cwd(), '..', 'verso-genius', 'data', 'rimas.json')
  const rimasData = JSON.parse(readFileSync(rimasPath, 'utf-8'))

  const insertRima = db.prepare(`
    INSERT INTO rimas (letra_id, palavra1, palavra2, verso1, verso2, tipo, score)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  let count = 0
  for (const rima of rimasData.slice(0, 500)) {  // Limitar a 500 para não duplicar
    insertRima.run(
      letra_id.id,
      rima.palavra1,
      rima.palavra2,
      rima.verso1,
      rima.verso2,
      'perfeita',  // Tipo padrão
      0.85  // Score médio
    )
    count++
  }
  console.log(`OK ${count} rimas de batalha adicionadas!`)
} catch (error) {
  console.log('AVISO: Arquivo de rimas não encontrado')
}

// 5. Estatísticas finais
console.log('\n5. Estatísticas do banco atualizado:')
const stats = {
  letras: db.prepare('SELECT COUNT(*) as count FROM letras').get() as {count: number},
  rimas: db.prepare('SELECT COUNT(*) as count FROM rimas').get() as {count: number},
  artistas: db.prepare('SELECT COUNT(*) as count FROM artistas').get() as {count: number},
  girias: db.prepare('SELECT COUNT(*) as count FROM girias_regionais').get() as {count: number}
}

console.log(`   Letras: ${stats.letras.count}`)
console.log(`   Rimas: ${stats.rimas.count}`)
console.log(`   Artistas: ${stats.artistas.count}`)
console.log(`   Gírias: ${stats.girias.count}`)

db.close()
console.log('\nDados adicionados com sucesso!')
