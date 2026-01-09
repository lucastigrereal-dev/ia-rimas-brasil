/**
 * Busca Full-Text Search com SQLite FTS5
 *
 * Responsável por encontrar letras similares ao tema usando
 * busca full-text com ranking BM25 para relevância.
 */

import Database from 'better-sqlite3';
import path from 'path';
import { LetraEncontrada, EstiloRap, ESTILO_MAP } from './types.js';

/**
 * Classe de busca full-text no SQLite usando FTS5
 */
export class FTSSearch {
    private db: Database.Database;

    constructor(dbPath?: string) {
        const finalPath = dbPath || path.join(process.cwd(), 'data', 'rimas.db');
        this.db = new Database(finalPath, { readonly: true });
    }

    /**
     * Busca letras similares ao tema usando FTS5
     *
     * @param tema - Tema principal para buscar
     * @param estilo - Estilo de rap desejado
     * @param contexto - Contexto adicional opcional
     * @param limite - Número máximo de resultados (default: 10)
     * @returns Array de letras encontradas ordenadas por relevância
     *
     * @example
     * ```typescript
     * const fts = new FTSSearch();
     * const letras = fts.buscarLetrasSimilares('superação', 'consciente');
     * console.log(letras[0].titulo); // "Vida Loka Pt. 2"
     * ```
     */
    buscarLetrasSimilares(
        tema: string,
        estilo: EstiloRap,
        contexto?: string,
        limite: number = 10
    ): LetraEncontrada[] {
        // Estilos mapeados do banco
        const estilosDB = ESTILO_MAP[estilo];

        // Tentar busca FTS5 primeiro
        try {
            return this.buscarComFTS5(tema, estilosDB, contexto, limite);
        } catch (error) {
            // Fallback para LIKE se FTS5 falhar
            console.warn('[FTSSearch] FTS5 falhou, usando fallback LIKE:', error);
            return this.buscarFallback(tema, estilosDB, limite);
        }
    }

    /**
     * Busca usando FTS5 com ranking BM25
     */
    private buscarComFTS5(
        tema: string,
        estilos: string[],
        contexto: string | undefined,
        limite: number
    ): LetraEncontrada[] {
        // Construir query de match FTS5
        const termosTema = this.normalizarTermos(tema);
        const termosContexto = contexto ? this.normalizarTermos(contexto) : '';
        let matchQuery = termosTema;
        if (termosContexto) {
            matchQuery += ` ${termosContexto}`;
        }

        // Placeholders para estilos
        const estilosPlaceholders = estilos.map(() => '?').join(',');

        const query = `
            SELECT
                l.id,
                l.titulo,
                COALESCE(a.nome, 'Desconhecido') as artista,
                l.letra,
                l.estilo,
                COALESCE(l.qualidade, 0.5) as qualidade,
                l.temas,
                bm25(letras_fts) as rank
            FROM letras_fts
            JOIN letras l ON letras_fts.rowid = l.id
            LEFT JOIN artistas a ON l.artista_id = a.id
            WHERE letras_fts MATCH ?
            AND l.estilo IN (${estilosPlaceholders})
            AND COALESCE(l.qualidade, 0.5) >= 0.3
            ORDER BY rank
            LIMIT ?
        `;

        const rows = this.db.prepare(query).all(
            matchQuery,
            ...estilos,
            limite
        ) as any[];

        return rows.map(row => ({
            id: row.id,
            titulo: row.titulo,
            artista: row.artista,
            letra: row.letra,
            estilo: row.estilo,
            qualidade: row.qualidade,
            temas: this.parseTemas(row.temas),
            rank: Math.abs(row.rank) // BM25 retorna negativo (menor = melhor)
        }));
    }

    /**
     * Busca fallback usando LIKE quando FTS5 não está disponível
     */
    private buscarFallback(
        tema: string,
        estilos: string[],
        limite: number
    ): LetraEncontrada[] {
        const termos = tema.toLowerCase().split(/\s+/).filter(t => t.length > 2);

        if (termos.length === 0) {
            return [];
        }

        const likeConditions = termos.map(() => 'LOWER(l.letra) LIKE ?').join(' OR ');
        const likeValues = termos.map(t => `%${t}%`);
        const estilosPlaceholders = estilos.map(() => '?').join(',');

        const query = `
            SELECT
                l.id,
                l.titulo,
                COALESCE(a.nome, 'Desconhecido') as artista,
                l.letra,
                l.estilo,
                COALESCE(l.qualidade, 0.5) as qualidade,
                l.temas,
                0 as rank
            FROM letras l
            LEFT JOIN artistas a ON l.artista_id = a.id
            WHERE (${likeConditions})
            AND l.estilo IN (${estilosPlaceholders})
            AND COALESCE(l.qualidade, 0.5) >= 0.3
            ORDER BY l.qualidade DESC
            LIMIT ?
        `;

        const rows = this.db.prepare(query).all(
            ...likeValues,
            ...estilos,
            limite
        ) as any[];

        return rows.map(row => ({
            id: row.id,
            titulo: row.titulo,
            artista: row.artista,
            letra: row.letra,
            estilo: row.estilo,
            qualidade: row.qualidade,
            temas: this.parseTemas(row.temas),
            rank: 0
        }));
    }

    /**
     * Busca rimas de alta qualidade para um conjunto de letras
     *
     * @param letraIds - IDs das letras para buscar rimas
     * @param limite - Número máximo de rimas total
     */
    buscarRimasQualidade(letraIds: number[], limite: number = 50): any[] {
        if (letraIds.length === 0) {
            return [];
        }

        const placeholders = letraIds.map(() => '?').join(',');

        const query = `
            SELECT
                r.palavra1,
                r.palavra2,
                r.verso1,
                r.verso2,
                r.tipo,
                r.score
            FROM rimas r
            WHERE r.letra_id IN (${placeholders})
            AND r.score >= 0.6
            ORDER BY r.score DESC
            LIMIT ?
        `;

        return this.db.prepare(query).all(...letraIds, limite) as any[];
    }

    /**
     * Normaliza termos para busca FTS5
     * Remove caracteres especiais e prepara para query
     */
    private normalizarTermos(texto: string): string {
        return texto
            .toLowerCase()
            .replace(/[^\w\sáéíóúâêîôûãõç]/g, ' ')
            .split(/\s+/)
            .filter(t => t.length > 2)
            .map(t => `"${t}"`)
            .join(' OR ');
    }

    /**
     * Parse JSON de temas com tratamento de erro
     */
    private parseTemas(temas: string | null): string[] {
        if (!temas) return [];
        try {
            const parsed = JSON.parse(temas);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    /**
     * Verifica se FTS5 está configurado no banco
     */
    isFTS5Disponivel(): boolean {
        try {
            const result = this.db.prepare(`
                SELECT name FROM sqlite_master
                WHERE type='table' AND name='letras_fts'
            `).get();
            return !!result;
        } catch {
            return false;
        }
    }

    /**
     * Retorna estatísticas do banco
     */
    getEstatisticas(): { letras: number; rimas: number; artistas: number; fts5: boolean } {
        const letras = (this.db.prepare('SELECT COUNT(*) as c FROM letras').get() as { c: number }).c;
        const rimas = (this.db.prepare('SELECT COUNT(*) as c FROM rimas').get() as { c: number }).c;
        const artistas = (this.db.prepare('SELECT COUNT(*) as c FROM artistas').get() as { c: number }).c;

        return {
            letras,
            rimas,
            artistas,
            fts5: this.isFTS5Disponivel()
        };
    }

    /**
     * Fecha conexão com o banco
     */
    close(): void {
        this.db.close();
    }
}
