import Database from 'better-sqlite3';
import path from 'path';

interface Musica {
  id: number;
  titulo: string;
  artista: string;
  artista_id: number;
  url: string;
  letra: string;
  views: number;
  release_date: string | null;
}

interface ResultadoProcessamento {
  rimas: Array<{
    palavra1: string;
    palavra2: string;
    verso1: string;
    verso2: string;
    tipo: string;
    score: number;
  }>;
  estilo: string;
  qualidade: number;
  versos_total: number;
  palavras_total: number;
  temas: string[];
  metricas: {
    rimas_por_verso: number;
    densidade_rima: number;
    variedade_vocabular: number;
  };
}

export class RimasDatabase {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const finalPath = dbPath || path.join(process.cwd(), 'data', 'rimas.db');
    this.db = new Database(finalPath);
    this.inicializar();
  }

  private inicializar() {
    // Tabela de artistas
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS artistas (
        id INTEGER PRIMARY KEY,
        nome TEXT NOT NULL,
        genius_id INTEGER UNIQUE,
        total_musicas INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de letras
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS letras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        genius_id INTEGER UNIQUE,
        artista_id INTEGER,
        titulo TEXT NOT NULL,
        letra TEXT NOT NULL,
        url TEXT,
        views INTEGER DEFAULT 0,
        release_date TEXT,
        estilo TEXT,
        qualidade REAL,
        versos_total INTEGER,
        palavras_total INTEGER,
        temas TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (artista_id) REFERENCES artistas(id)
      )
    `);

    // Tabela de rimas
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS rimas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        letra_id INTEGER,
        palavra1 TEXT NOT NULL,
        palavra2 TEXT NOT NULL,
        verso1 TEXT,
        verso2 TEXT,
        tipo TEXT,
        score REAL,
        FOREIGN KEY (letra_id) REFERENCES letras(id)
      )
    `);

    // Tabela de métricas
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS metricas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        letra_id INTEGER UNIQUE,
        rimas_por_verso REAL,
        densidade_rima REAL,
        variedade_vocabular REAL,
        FOREIGN KEY (letra_id) REFERENCES letras(id)
      )
    `);

    // Índices para performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_letras_artista ON letras(artista_id);
      CREATE INDEX IF NOT EXISTS idx_letras_estilo ON letras(estilo);
      CREATE INDEX IF NOT EXISTS idx_rimas_letra ON rimas(letra_id);
      CREATE INDEX IF NOT EXISTS idx_rimas_palavras ON rimas(palavra1, palavra2);
    `);
  }

  salvarArtista(geniusId: number, nome: string): number {
    // Inserir ou buscar artista existente
    const existing = this.db.prepare('SELECT id FROM artistas WHERE genius_id = ?').get(geniusId) as { id: number } | undefined;

    if (existing) {
      return existing.id;
    }

    const stmt = this.db.prepare(`
      INSERT INTO artistas (genius_id, nome)
      VALUES (?, ?)
    `);
    const result = stmt.run(geniusId, nome);
    return result.lastInsertRowid as number;
  }

  salvarLetra(musica: Musica, processamento: ResultadoProcessamento): number {
    // Salvar artista primeiro e obter ID interno
    const artistaId = this.salvarArtista(musica.artista_id, musica.artista);

    // Inserir letra
    const stmtLetra = this.db.prepare(`
      INSERT OR REPLACE INTO letras
      (genius_id, artista_id, titulo, letra, url, views, release_date, estilo, qualidade, versos_total, palavras_total, temas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmtLetra.run(
      musica.id,
      artistaId,
      musica.titulo,
      musica.letra,
      musica.url,
      musica.views,
      musica.release_date,
      processamento.estilo,
      processamento.qualidade,
      processamento.versos_total,
      processamento.palavras_total,
      JSON.stringify(processamento.temas)
    );

    const letraId = result.lastInsertRowid as number;

    // Inserir rimas
    const stmtRima = this.db.prepare(`
      INSERT INTO rimas (letra_id, palavra1, palavra2, verso1, verso2, tipo, score)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const rima of processamento.rimas) {
      stmtRima.run(
        letraId,
        rima.palavra1,
        rima.palavra2,
        rima.verso1,
        rima.verso2,
        rima.tipo,
        rima.score
      );
    }

    // Inserir métricas
    const stmtMetrica = this.db.prepare(`
      INSERT OR REPLACE INTO metricas (letra_id, rimas_por_verso, densidade_rima, variedade_vocabular)
      VALUES (?, ?, ?, ?)
    `);

    stmtMetrica.run(
      letraId,
      processamento.metricas.rimas_por_verso,
      processamento.metricas.densidade_rima,
      processamento.metricas.variedade_vocabular
    );

    return letraId;
  }

  getEstatisticas(): {
    total_artistas: number;
    total_letras: number;
    total_rimas: number;
    media_qualidade: number;
    estilos: Record<string, number>;
  } {
    const artistas = this.db.prepare('SELECT COUNT(*) as count FROM artistas').get() as { count: number };
    const letras = this.db.prepare('SELECT COUNT(*) as count FROM letras').get() as { count: number };
    const rimas = this.db.prepare('SELECT COUNT(*) as count FROM rimas').get() as { count: number };
    const qualidade = this.db.prepare('SELECT AVG(qualidade) as avg FROM letras').get() as { avg: number };

    const estilosRows = this.db.prepare(`
      SELECT estilo, COUNT(*) as count FROM letras GROUP BY estilo
    `).all() as Array<{ estilo: string; count: number }>;

    const estilos: Record<string, number> = {};
    for (const row of estilosRows) {
      if (row.estilo) {
        estilos[row.estilo] = row.count;
      }
    }

    return {
      total_artistas: artistas.count,
      total_letras: letras.count,
      total_rimas: rimas.count,
      media_qualidade: qualidade.avg || 0,
      estilos
    };
  }

  buscarRimasPorPalavra(palavra: string): Array<{ palavra1: string; palavra2: string; tipo: string }> {
    return this.db.prepare(`
      SELECT DISTINCT palavra1, palavra2, tipo FROM rimas
      WHERE palavra1 LIKE ? OR palavra2 LIKE ?
      LIMIT 50
    `).all(`%${palavra}%`, `%${palavra}%`) as Array<{ palavra1: string; palavra2: string; tipo: string }>;
  }

  getTopRimas(limite: number = 20): Array<{ palavra1: string; palavra2: string; count: number }> {
    return this.db.prepare(`
      SELECT palavra1, palavra2, COUNT(*) as count
      FROM rimas
      GROUP BY palavra1, palavra2
      ORDER BY count DESC
      LIMIT ?
    `).all(limite) as Array<{ palavra1: string; palavra2: string; count: number }>;
  }

  close(): void {
    this.db.close();
  }
}
