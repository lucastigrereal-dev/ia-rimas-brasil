interface Rima {
  palavra1: string;
  palavra2: string;
  verso1: string;
  verso2: string;
  tipo: 'perfeita' | 'toante' | 'consoante' | 'interna';
  score: number;
}

interface ResultadoProcessamento {
  rimas: Rima[];
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

export class OllamaProcessor {
  private baseUrl = 'http://localhost:11434';
  private modelo = 'llama3.2:latest';

  async processar(letra: string): Promise<ResultadoProcessamento> {
    const versos = letra.split('\n').filter(v => v.trim().length > 0);
    const palavras = letra.split(/\s+/).filter(p => p.length > 0);

    // Análise de rimas
    const rimas = this.analisarRimas(versos);

    // Classificar estilo com Ollama
    const estilo = await this.classificarEstilo(letra);

    // Extrair temas
    const temas = await this.extrairTemas(letra);

    // Calcular qualidade
    const qualidade = this.calcularQualidade(rimas, versos.length);

    // Calcular métricas
    const variedadeVocabular = new Set(palavras.map(p => p.toLowerCase())).size / palavras.length;

    return {
      rimas,
      estilo,
      qualidade,
      versos_total: versos.length,
      palavras_total: palavras.length,
      temas,
      metricas: {
        rimas_por_verso: rimas.length / versos.length,
        densidade_rima: rimas.length / (versos.length / 2),
        variedade_vocabular: variedadeVocabular
      }
    };
  }

  private analisarRimas(versos: string[]): Rima[] {
    const rimas: Rima[] = [];

    for (let i = 0; i < versos.length - 1; i++) {
      const verso1 = versos[i].trim();
      const verso2 = versos[i + 1].trim();

      if (!verso1 || !verso2) continue;

      const palavras1 = verso1.split(/\s+/);
      const palavras2 = verso2.split(/\s+/);

      const ultima1 = this.limparPalavra(palavras1[palavras1.length - 1]);
      const ultima2 = this.limparPalavra(palavras2[palavras2.length - 1]);

      if (ultima1.length < 2 || ultima2.length < 2) continue;

      const tipoRima = this.detectarTipoRima(ultima1, ultima2);

      if (tipoRima) {
        rimas.push({
          palavra1: ultima1,
          palavra2: ultima2,
          verso1,
          verso2,
          tipo: tipoRima.tipo,
          score: tipoRima.score
        });
      }

      // Verificar rimas internas
      const rimasInternas = this.detectarRimasInternas(verso1);
      rimas.push(...rimasInternas);
    }

    return rimas;
  }

  private limparPalavra(palavra: string): string {
    return palavra.toLowerCase().replace(/[.,!?;:'"()]/g, '');
  }

  private detectarTipoRima(p1: string, p2: string): { tipo: 'perfeita' | 'toante' | 'consoante'; score: number } | null {
    // Rima perfeita: mesma terminação (últimas 3+ letras)
    if (p1.length >= 3 && p2.length >= 3) {
      if (p1.slice(-3) === p2.slice(-3) && p1 !== p2) {
        return { tipo: 'perfeita', score: 1.0 };
      }
    }

    // Rima consoante: mesmas consoantes finais
    if (p1.length >= 2 && p2.length >= 2) {
      if (p1.slice(-2) === p2.slice(-2) && p1 !== p2) {
        return { tipo: 'consoante', score: 0.8 };
      }
    }

    // Rima toante: mesmas vogais
    const vogais1 = p1.replace(/[^aeiouáéíóúâêîôûãõ]/gi, '').slice(-2);
    const vogais2 = p2.replace(/[^aeiouáéíóúâêîôûãõ]/gi, '').slice(-2);

    if (vogais1.length >= 2 && vogais1 === vogais2 && p1 !== p2) {
      return { tipo: 'toante', score: 0.6 };
    }

    return null;
  }

  private detectarRimasInternas(verso: string): Rima[] {
    const rimas: Rima[] = [];
    const palavras = verso.split(/\s+/).map(p => this.limparPalavra(p)).filter(p => p.length >= 3);

    for (let i = 0; i < palavras.length - 1; i++) {
      for (let j = i + 2; j < palavras.length; j++) {
        if (palavras[i].slice(-2) === palavras[j].slice(-2) && palavras[i] !== palavras[j]) {
          rimas.push({
            palavra1: palavras[i],
            palavra2: palavras[j],
            verso1: verso,
            verso2: verso,
            tipo: 'interna',
            score: 0.5
          });
          break; // Uma rima interna por palavra
        }
      }
    }

    return rimas;
  }

  private calcularQualidade(rimas: Rima[], totalVersos: number): number {
    if (totalVersos === 0) return 0;

    const scoreTotal = rimas.reduce((acc, r) => acc + r.score, 0);
    const densidadeRima = rimas.length / (totalVersos / 2);
    const variedadeTipos = new Set(rimas.map(r => r.tipo)).size / 4;

    // Qualidade de 0 a 1
    const qualidade = Math.min(1, (scoreTotal / totalVersos) * 0.5 + densidadeRima * 0.3 + variedadeTipos * 0.2);

    return qualidade;
  }

  async classificarEstilo(letra: string): Promise<string> {
    try {
      const prompt = `Classifique o estilo desta letra de rap brasileiro em UMA palavra (agressivo, consciente, romantico, festa, storytelling, tecnico):

"${letra.slice(0, 500)}..."

Responda APENAS com a palavra do estilo:`;

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelo,
          prompt,
          stream: false,
          options: { temperature: 0.3, num_predict: 20 }
        })
      });

      const data = await response.json();
      const estilo = data.response?.trim().toLowerCase().split(/\s+/)[0] || 'indefinido';

      const estilosValidos = ['agressivo', 'consciente', 'romantico', 'festa', 'storytelling', 'tecnico'];
      return estilosValidos.includes(estilo) ? estilo : 'indefinido';
    } catch (error) {
      return 'indefinido';
    }
  }

  async extrairTemas(letra: string): Promise<string[]> {
    try {
      const prompt = `Liste os 3 principais temas desta letra de rap (ex: periferia, superacao, amor, dinheiro, violencia, politica):

"${letra.slice(0, 500)}..."

Responda APENAS com 3 palavras separadas por virgula:`;

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelo,
          prompt,
          stream: false,
          options: { temperature: 0.3, num_predict: 30 }
        })
      });

      const data = await response.json();
      const temas = data.response?.trim().toLowerCase()
        .split(/[,\n]/)
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0 && t.length < 20)
        .slice(0, 3) || [];

      return temas;
    } catch (error) {
      return [];
    }
  }
}
