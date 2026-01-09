import * as cheerio from 'cheerio';

interface Artista {
  id: number;
  name: string;
  image_url: string;
  url: string;
}

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

export class GeniusClient {
  private token: string;
  private baseUrl = 'https://api.genius.com';

  constructor(token: string) {
    this.token = token;
  }

  private async request(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Genius API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  }

  async buscarArtista(nome: string): Promise<Artista | null> {
    const response = await this.request(`/search?q=${encodeURIComponent(nome)}`);

    if (!response.hits || response.hits.length === 0) {
      return null;
    }

    // Encontrar o artista principal nos resultados
    const hit = response.hits[0];
    const artist = hit.result.primary_artist;

    return {
      id: artist.id,
      name: artist.name,
      image_url: artist.image_url,
      url: artist.url
    };
  }

  async obterMusicasArtista(artistaId: number, limite: number = 10): Promise<Musica[]> {
    const musicas: Musica[] = [];
    let page = 1;

    while (musicas.length < limite) {
      const response = await this.request(`/artists/${artistaId}/songs?per_page=20&page=${page}&sort=popularity`);

      if (!response.songs || response.songs.length === 0) {
        break;
      }

      for (const song of response.songs) {
        if (musicas.length >= limite) break;

        // Buscar letra da música
        console.log(`   Coletando: ${song.title}...`);
        const letra = await this.obterLetra(song.url);

        if (letra && letra.length > 100) {
          musicas.push({
            id: song.id,
            titulo: song.title,
            artista: song.primary_artist.name,
            artista_id: artistaId,
            url: song.url,
            letra: letra,
            views: song.stats?.pageviews || 0,
            release_date: song.release_date_for_display || null
          });
        }

        // Delay para não sobrecarregar
        await this.delay(500);
      }

      page++;
      if (page > 5) break; // Limite de páginas
    }

    return musicas;
  }

  private async obterLetra(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);

      // Genius usa data-lyrics-container para as letras
      let letra = '';
      $('[data-lyrics-container="true"]').each((_, el) => {
        // Substituir <br> por quebras de linha
        $(el).find('br').replaceWith('\n');
        letra += $(el).text() + '\n';
      });

      // Limpar a letra
      letra = letra
        .replace(/\[.*?\]/g, '') // Remover [Verso 1], [Refrão], etc
        .replace(/\n{3,}/g, '\n\n') // Múltiplas quebras -> dupla
        .trim();

      return letra;
    } catch (error) {
      console.error(`Erro ao obter letra: ${error}`);
      return '';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
