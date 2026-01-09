# IA Rimas Brasil

> Sistema de Geração de Rimas para Batalhas de Rap Brasileiro usando IA Híbrida

[![Status](https://img.shields.io/badge/status-production-green.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)]()
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()

## Sobre

O **IA Rimas Brasil** é um sistema completo de geração de rimas para MCs e batalhas de rap. Combina inteligência artificial híbrida (GPT-4o-mini + Ollama) com um banco de dados de 26.600+ rimas reais extraídas de letras de rap brasileiro.

## Features

- **Geração de Rimas com IA** - GPT-4o-mini + Ollama + Fallback
- **4 Estilos** - Agressivo, Técnico, Filosófico, Romântico
- **26k+ Rimas Reais** - Extraídas de 787 letras de rap BR
- **Score Automático** - Análise de qualidade das rimas
- **Interface Dark Mode** - Design preto/dourado
- **Custo Mínimo** - ~R$ 0,001 por geração

## Quick Start

```bash
# Clonar repositório
git clone https://github.com/lucastigrereal-dev/ia-rimas-brasil.git
cd ia-rimas-brasil

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas API keys

# Iniciar desenvolvimento
npm run dev
```

## Acessar

- **Frontend:** http://localhost:5555
- **API:** http://localhost:12345

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, Framer Motion |
| Backend | Node.js, Hono, SQLite, Zod |
| IA | GPT-4o-mini, Ollama (mistral:latest) |
| Deploy | Cloudflare Pages |

## API

### Gerar Rima

```bash
curl -X POST http://localhost:12345/api/gerar \
  -H "Content-Type: application/json" \
  -d '{"tema":"favela","estilo":"agressivo"}'
```

### Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/stats` | Estatísticas |
| GET | `/api/rimas` | Listar rimas |
| GET | `/api/letras` | Listar letras |
| POST | `/api/gerar` | Gerar rima |
| GET | `/api/rimas-geradas` | Histórico |

## Estrutura

```
webapp/
├── src/
│   ├── api/          # Backend Hono
│   ├── services/     # Database + Generator
│   ├── schemas/      # Validação Zod
│   └── ui/           # Frontend React
├── data/             # SQLite database
├── night-crawler/    # Engine avançado
└── public/           # Assets estáticos
```

## Métricas

| Métrica | Valor |
|---------|-------|
| Letras | 787 |
| Rimas | 26.600+ |
| Artistas | 9 |
| Versos | 28.730 |

## Documentação

- [Relatório Técnico Completo](./RELATORIO_TECNICO_COMPLETO.md)
- [Estrutura Notion](./NOTION_ESTRUTURA.md)
- [Arquitetura](./ARQUITETURA_RIMAS.md)

## Scripts

```bash
npm run dev          # Dev (UI + API)
npm run dev:ui       # Apenas frontend
npm run dev:api      # Apenas backend
npm run build        # Build produção
npm run deploy       # Deploy Cloudflare
```

## Variáveis de Ambiente

```env
GENIUS_TOKEN=your_genius_token
OPENAI_API_KEY=your_openai_key
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral:latest
```

## Custos

| Fonte | Custo por Rima |
|-------|----------------|
| Ollama | R$ 0,00 (grátis) |
| GPT-4o-mini | ~R$ 0,001 |
| Fallback | R$ 0,00 (offline) |

## Licença

MIT License

---

Desenvolvido com Claude Code
