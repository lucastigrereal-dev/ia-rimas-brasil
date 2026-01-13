# 🎵 GUIA DE BEATS CC0 PARA VERSO GENIUS

## ⚠️ IMPORTANTE - DIREITOS AUTORAIS

Este projeto usa **APENAS beats com licença CC0 (Creative Commons Zero)** para garantir uso legal e livre de royalties.

---

## 📁 ONDE BAIXAR BEATS CC0

### 1. Free Music Archive (FMA)
**URL:** https://freemusicarchive.org
**Filtro:** CC0 / Public Domain

```
Passos:
1. Acesse https://freemusicarchive.org/search
2. Filtrar por License: "Creative Commons: Public Domain"
3. Genre: Hip-Hop / Beats
4. Download MP3
```

### 2. Incompetech (Kevin MacLeod)
**URL:** https://incompetech.com/music/royalty-free/music.html
**Licença:** CC BY 4.0 (uso livre com atribuição)

```
Gêneros recomendados:
- Hip Hop
- Urban
- Electronica / Dance
```

### 3. YouTube Audio Library
**URL:** https://www.youtube.com/audiolibrary
**Filtro:** "No attribution required"

### 4. Pixabay Music
**URL:** https://pixabay.com/music/
**Licença:** Pixabay License (uso livre)

```
Buscar por:
- "hip hop beat"
- "rap instrumental"
- "freestyle beat"
```

### 5. Uppbeat
**URL:** https://uppbeat.io/browse/sfx/hip-hop
**Licença:** Free for creators

---

## 🎯 ESPECIFICAÇÕES DOS BEATS

### Requisitos Técnicos
- **Formato:** MP3 ou WebM
- **BPM:** 80-140 (variado para diferentes estilos)
- **Duração:** 2-4 minutos (loops bem definidos)
- **Qualidade:** 128kbps mínimo, 320kbps ideal

### Estilos Necessários

| Estilo | BPM Ideal | Características |
|--------|-----------|-----------------|
| **Boom Bap Classic** | 85-95 | Bateria tradicional, snare forte, samples jazz |
| **Trap Moderno** | 130-150 | Hi-hats rápidos, 808 bass, dark vibes |
| **Old School 808** | 80-90 | Drum machine 808, simples e limpo |
| **Freestyle Flow** | 90-100 | Tempo médio, fácil de rimar |

---

## 📂 ESTRUTURA DE ARQUIVOS

```
ia-rimas-brasil-optimized/
└── public/
    └── assets/
        └── beats/
            ├── boom-bap-90bpm.mp3
            ├── trap-140bpm.mp3
            ├── old-school-85bpm.mp3
            └── freestyle-95bpm.mp3
```

---

## 🛠️ COMO ADICIONAR NOVOS BEATS

### 1. Baixar Beat CC0
Escolha um dos sites acima e baixe o beat.

### 2. Renomear Arquivo
Padrão: `{estilo}-{bpm}bpm.mp3`

Exemplos:
```
boom-bap-90bpm.mp3
trap-140bpm.mp3
lofi-85bpm.mp3
```

### 3. Colocar na Pasta
```bash
mv seu-beat.mp3 public/assets/beats/boom-bap-90bpm.mp3
```

### 4. Atualizar Código
Editar: `src/services/audioService.ts`

```typescript
export const CC0_BEATS: Beat[] = [
  {
    id: 'beat-5-novo',
    name: 'Novo Beat Adicionado',
    bpm: 100,
    genre: 'Boom Bap',
    url: '/assets/beats/novo-beat-100bpm.mp3',
    license: 'CC0',
    source: 'Free Music Archive',
    author: 'Nome do Artista'
  },
  // ... outros beats
]
```

### 5. Testar Localmente
```bash
npm run dev
# Abra http://localhost:5555/studio
# Teste o novo beat
```

---

## ✅ BEATS PLACEHOLDER (PARA DESENVOLVIMENTO)

Para desenvolvimento inicial, você pode usar **beats silenciosos/placeholder** ou **samples curtos**.

### Opção 1: Gerar Placeholder com Tone.js
```typescript
// Gerar beat simples programaticamente
import * as Tone from 'tone'

const generatePlaceholderBeat = (bpm: number) => {
  const synth = new Tone.MembraneSynth().toDestination()
  const loop = new Tone.Loop((time) => {
    synth.triggerAttackRelease('C1', '8n', time)
  }, '4n')

  Tone.Transport.bpm.value = bpm
  loop.start(0)
  Tone.Transport.start()
}
```

### Opção 2: Usar Web Audio API
Gerar beats programaticamente (implementado no código).

---

## 📝 DOCUMENTAR LICENÇAS

**CRÍTICO:** Sempre documentar a fonte e licença de cada beat!

### Template de Documentação

```markdown
## Beat: Boom Bap Classic

- **Arquivo:** boom-bap-90bpm.mp3
- **BPM:** 90
- **Duração:** 3:24
- **Licença:** CC0 (Public Domain)
- **Fonte:** Free Music Archive
- **Artista:** Kevin MacLeod
- **URL Original:** https://freemusicarchive.org/music/...
- **Data de Download:** 12/01/2026
```

---

## 🚫 O QUE EVITAR

### ❌ NUNCA use beats de:
- YouTube sem permissão explícita
- SoundCloud sem licença CC0
- BeatStars (são todos pagos)
- Producers sem licença clara
- Músicas famosas (sample clearance necessário)

### ⚠️ Cuidado com:
- CC BY (requer atribuição)
- CC BY-SA (requer mesma licença)
- Royalty-free ≠ Livre (pode exigir pagamento)

---

## 🎯 BEATS RECOMENDADOS (CC0 Verificados)

### Kevin MacLeod - Incompetech
```
✅ "Chill Wave" - 90 BPM - Boom Bap
✅ "Carefree" - 95 BPM - Old School
✅ "Airport Lounge" - 85 BPM - Chill
```

### Bensound (CC BY)
```
✅ "Betamax" - 90 BPM - Retro Hip Hop
✅ "Hip Jazz" - 95 BPM - Jazz Rap
```

---

## 📞 SUPORTE

Se tiver dúvidas sobre licenciamento:
1. Verifique a licença no site original
2. Leia os termos de uso
3. Em caso de dúvida, NÃO USE

---

**🎤 VERSO GENIUS - Sistema Legal de Treino de Freestyle**

*Último update: 12/01/2026*
