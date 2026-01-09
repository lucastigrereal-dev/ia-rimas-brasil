# ESTRUTURA NOTION - IA RIMAS BRASIL

> Copie esta estrutura para criar seu workspace no Notion

---

## DATABASE: Projeto IA Rimas Brasil

### Propriedades da Database

| Propriedade | Tipo | Opções |
|-------------|------|--------|
| Nome | Title | - |
| Status | Select | Backlog, Em Progresso, Concluído, Bloqueado |
| Prioridade | Select | Alta, Média, Baixa |
| Tipo | Select | Feature, Bug, Infra, Docs, Research |
| Sprint | Select | Sprint 1, Sprint 2, Sprint 3 |
| Responsável | Person | - |
| Data Início | Date | - |
| Data Fim | Date | - |
| Progresso | Number | 0-100% |
| Tags | Multi-select | Frontend, Backend, IA, Database, Deploy |

---

## PÁGINAS PRINCIPAIS

### 1. HOME - Dashboard

```
# IA RIMAS BRASIL
> Sistema de Geração de Rimas para Rap Brasileiro

## Quick Links
- [Documentação Técnica]
- [GitHub Repository](https://github.com/lucastigrereal-dev/ia-rimas-brasil)
- [Deploy (Cloudflare)]
- [API Docs]

## Status do Projeto
████████████████████ 100% Completo

## Métricas
| Métrica | Valor |
|---------|-------|
| Letras | 787 |
| Rimas | 26.600+ |
| Artistas | 9 |
| Versos | 28.730 |

## Servidores
| Serviço | URL | Status |
|---------|-----|--------|
| Frontend | localhost:5555 | ✅ |
| API | localhost:12345 | ✅ |
| Ollama | localhost:11434 | ✅ |
```

---

### 2. ARQUITETURA

```
# Arquitetura do Sistema

## Diagrama
[Inserir imagem do diagrama]

## Stack Tecnológica

### Frontend
- React 18.3
- TypeScript 5.0
- Vite 5.0
- TailwindCSS 3.4
- Framer Motion

### Backend
- Node.js 20+
- Hono 4.0
- SQLite + FTS5
- Zod (validação)

### IA
- GPT-4o-mini (OpenAI)
- Ollama (mistral:latest)
- Templates Fallback

## Fluxo de Dados
1. Usuário insere tema e estilo
2. Frontend envia POST /api/gerar
3. API busca contexto do SQLite
4. Gerador tenta Ollama → GPT → Fallback
5. Calcula score e salva no banco
6. Retorna resultado para UI
```

---

### 3. FEATURES

```
# Features do Sistema

## Implementadas ✅

### Geração de Rimas
- [x] Geração com GPT-4o-mini
- [x] Fallback com Ollama local
- [x] Templates offline
- [x] 4 estilos suportados
- [x] Contexto de rimas reais

### Interface
- [x] Dark mode (preto/dourado)
- [x] Responsivo mobile-first
- [x] Animações Framer Motion
- [x] Dashboard de stats
- [x] Histórico lateral
- [x] Sistema de favoritos

### API
- [x] Endpoints REST
- [x] Validação Zod PT-BR
- [x] CORS configurado
- [x] Health checks

### Database
- [x] SQLite com FTS5
- [x] 26k+ rimas
- [x] 787 letras
- [x] 9 artistas

## Planejadas ⏳

### Fase 4
- [ ] Migração D1 (Cloudflare)
- [ ] Cache KV
- [ ] Workers para API
- [ ] CDN para assets

### Futuro
- [ ] Autenticação
- [ ] Rate limiting
- [ ] App mobile
- [ ] API pública
```

---

### 4. API DOCUMENTATION

```
# API Reference

Base URL: http://localhost:12345

## Endpoints

### Stats
GET /api/stats
Retorna estatísticas gerais

### Letras
GET /api/letras
GET /api/letras/:id
GET /api/letras/search?q=

### Rimas
GET /api/rimas
GET /api/rimas/palavra/:palavra

### Geração
POST /api/gerar
Body: { tema, estilo, num_versos?, palavras_chave? }

POST /api/rimas/gerar
Body: { tema, estilo, contexto? }

### Histórico
GET /api/rimas-geradas
GET /api/rimas/historico

### Artistas
GET /api/artistas

### Health
GET /api/openai/status
```

---

### 5. CUSTOS

```
# Análise de Custos

## Por Geração

| Fonte | Custo | Tokens |
|-------|-------|--------|
| Ollama | R$ 0,00 | - |
| GPT-4o-mini | R$ 0,001 | ~590 |
| Fallback | R$ 0,00 | - |

## Estimativa Mensal

| Cenário | Gerações | Custo |
|---------|----------|-------|
| Light | 1.000 | R$ 1 |
| Medium | 10.000 | R$ 10 |
| Heavy | 100.000 | R$ 100 |

## OpenAI Pricing
- Input: $0.15 / 1M tokens
- Output: $0.60 / 1M tokens
- ~5.500 rimas por dólar
```

---

### 6. ROADMAP

```
# Roadmap

## Concluído ✅

### Sprint 1 - Fundação
- [x] Setup projeto (Vite + React + Hono)
- [x] Banco SQLite com FTS5
- [x] Crawler de letras (Genius API)
- [x] Extração de rimas

### Sprint 2 - Backend
- [x] API endpoints
- [x] Validação Zod
- [x] Integração GPT-4o-mini
- [x] Integração Ollama

### Sprint 3 - Frontend
- [x] UI componentes
- [x] Dark mode
- [x] Animações
- [x] Histórico
- [x] Favoritos

## Em Progresso 🔄

### Sprint 4 - Polish
- [ ] Testes E2E
- [ ] Documentação completa
- [ ] Performance tuning

## Futuro ⏳

### Sprint 5 - Deploy
- [ ] Cloudflare D1
- [ ] Workers
- [ ] CDN
- [ ] Domínio customizado

### Sprint 6 - Scale
- [ ] Autenticação
- [ ] Multi-tenant
- [ ] API pública
- [ ] Monetização
```

---

### 7. TEAM

```
# Equipe

## Desenvolvimento
- **Lucas** - Full Stack Developer
- **Claude** - AI Assistant (Orquestrador)

## Ferramentas
- Claude Code (desenvolvimento)
- GitHub (versionamento)
- Cloudflare (deploy)
- Notion (documentação)
```

---

### 8. LINKS

```
# Links Úteis

## Repositório
- GitHub: https://github.com/lucastigrereal-dev/ia-rimas-brasil

## Documentação
- README.md
- RELATORIO_TECNICO_COMPLETO.md
- ARQUITETURA_RIMAS.md

## APIs Externas
- OpenAI: https://platform.openai.com
- Genius: https://genius.com/api-clients
- Ollama: https://ollama.ai

## Referências
- Hono: https://hono.dev
- Vite: https://vitejs.dev
- TailwindCSS: https://tailwindcss.com
- Framer Motion: https://framer.com/motion
```

---

## TEMPLATES DE TASKS

### Bug Report
```
## Bug
**Descrição:** [O que aconteceu]
**Esperado:** [O que deveria acontecer]
**Passos:**
1. [Passo 1]
2. [Passo 2]
**Ambiente:** [Browser, OS]
**Screenshots:** [Se aplicável]
```

### Feature Request
```
## Feature
**Título:** [Nome da feature]
**Descrição:** [O que faz]
**Benefício:** [Por que é importante]
**Critérios de Aceite:**
- [ ] Critério 1
- [ ] Critério 2
**Estimativa:** [P/M/G]
```

### Sprint Planning
```
## Sprint [N]
**Período:** [Data início] - [Data fim]
**Objetivo:** [Meta principal]

### Tasks
| Task | Responsável | Status | Pontos |
|------|-------------|--------|--------|
| | | | |

### Métricas
- Velocity: X pontos
- Bugs: X
- Tech Debt: X%
```

---

## COMO USAR

1. **Criar Workspace** no Notion
2. **Criar Database** com as propriedades listadas
3. **Criar Páginas** seguindo os templates
4. **Importar Markdown** dos arquivos do projeto
5. **Conectar GitHub** integration para sync

---

*Estrutura criada para IA Rimas Brasil - Janeiro 2026*
