/**
 * Script de migração para configurar FTS5 no banco SQLite
 * Cria tabela virtual full-text search e triggers de sincronização
 *
 * Uso: npm run setup-fts
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

export function setupFTS5(dbPath?: string): void {
    const finalPath = dbPath || path.join(process.cwd(), 'data', 'rimas.db');
    const db = new Database(finalPath);

    console.log('=== Setup FTS5 ===');
    console.log(`Banco: ${finalPath}\n`);

    // Verificar se FTS5 já existe
    const ftsExists = db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type='table' AND name='letras_fts'
    `).get();

    if (ftsExists) {
        console.log('[SKIP] Tabela letras_fts já existe.');

        // Verificar contagem
        const count = db.prepare('SELECT COUNT(*) as c FROM letras_fts').get() as { c: number };
        console.log(`       ${count.c} registros indexados.`);
        db.close();
        return;
    }

    console.log('[1/5] Criando tabela virtual FTS5...');
    db.exec(`
        CREATE VIRTUAL TABLE letras_fts USING fts5(
            titulo,
            letra,
            temas,
            estilo,
            content='letras',
            content_rowid='id'
        )
    `);

    console.log('[2/5] Populando com dados existentes...');
    const result = db.exec(`
        INSERT INTO letras_fts(rowid, titulo, letra, temas, estilo)
        SELECT id, titulo, letra, temas, estilo FROM letras
    `);

    // Contar registros inseridos
    const count = db.prepare('SELECT COUNT(*) as c FROM letras_fts').get() as { c: number };
    console.log(`       ${count.c} letras indexadas.`);

    console.log('[3/5] Criando trigger AFTER INSERT...');
    db.exec(`
        CREATE TRIGGER letras_fts_ai AFTER INSERT ON letras BEGIN
            INSERT INTO letras_fts(rowid, titulo, letra, temas, estilo)
            VALUES (new.id, new.titulo, new.letra, new.temas, new.estilo);
        END
    `);

    console.log('[4/5] Criando trigger AFTER DELETE...');
    db.exec(`
        CREATE TRIGGER letras_fts_ad AFTER DELETE ON letras BEGIN
            INSERT INTO letras_fts(letras_fts, rowid, titulo, letra, temas, estilo)
            VALUES('delete', old.id, old.titulo, old.letra, old.temas, old.estilo);
        END
    `);

    console.log('[5/5] Criando trigger AFTER UPDATE...');
    db.exec(`
        CREATE TRIGGER letras_fts_au AFTER UPDATE ON letras BEGIN
            INSERT INTO letras_fts(letras_fts, rowid, titulo, letra, temas, estilo)
            VALUES('delete', old.id, old.titulo, old.letra, old.temas, old.estilo);
            INSERT INTO letras_fts(rowid, titulo, letra, temas, estilo)
            VALUES (new.id, new.titulo, new.letra, new.temas, new.estilo);
        END
    `);

    // Criar índices adicionais para performance
    console.log('\n[+] Criando índices de performance...');
    db.exec(`CREATE INDEX IF NOT EXISTS idx_rimas_score ON rimas(score DESC)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_letras_qualidade ON letras(qualidade DESC)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_letras_estilo_qual ON letras(estilo, qualidade DESC)`);

    console.log('\n[OK] FTS5 configurado com sucesso!');

    // Mostrar estatísticas
    const stats = {
        letras: (db.prepare('SELECT COUNT(*) as c FROM letras').get() as { c: number }).c,
        rimas: (db.prepare('SELECT COUNT(*) as c FROM rimas').get() as { c: number }).c,
        artistas: (db.prepare('SELECT COUNT(*) as c FROM artistas').get() as { c: number }).c,
    };

    console.log('\n=== Estatísticas do Banco ===');
    console.log(`Letras: ${stats.letras}`);
    console.log(`Rimas: ${stats.rimas}`);
    console.log(`Artistas: ${stats.artistas}`);

    db.close();
}

// Executar se chamado diretamente
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
    setupFTS5();
}
