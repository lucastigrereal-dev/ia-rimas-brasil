# IA Rimas Brasil

Treine freestyle e melhore suas habilidades de rima com inteligencia artificial.

## Features

- **Drills de Freestyle**: Pratique com diferentes exercicios de rima
- **Gamificacao**: XP, niveis, badges e streaks para manter voce motivado
- **Leaderboard**: Compete com outros rimadores
- **PWA**: Instale como app e use offline
- **Analytics**: Acompanhe seu progresso

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Hono (API)
- **Database**: Firebase (Auth + Firestore)
- **Deploy**: Cloudflare Pages
- **PWA**: vite-plugin-pwa + Workbox

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Firebase project configurado

### Installation

```bash
# Clone o repositorio
git clone https://github.com/seu-usuario/ia-rimas-brasil.git
cd ia-rimas-brasil

# Instale dependencias
npm install

# Configure variaveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais Firebase
```

### Development

```bash
# Inicie o servidor de desenvolvimento
npm run dev

# Apenas o frontend
npm run dev:ui

# Apenas a API
npm run dev:api
```

### Testing

```bash
# Testes unitarios
npm run test

# Testes com watch mode
npm run test:watch

# Testes E2E (requer build)
npm run test:e2e
```

### Build

```bash
# Build para producao
npm run build

# Preview da build
npm run preview
```

### Deploy

```bash
# Deploy para Cloudflare Pages
npm run deploy
```

## Project Structure

```
src/
├── api/           # API Hono
├── components/    # Componentes React
├── config/        # Configuracoes (env, etc)
├── contexts/      # React Contexts
├── hooks/         # Custom hooks
├── pages/         # Paginas da aplicacao
├── services/      # Servicos (Firebase, Analytics, etc)
├── types/         # TypeScript types
├── ui/            # Entry point React
└── utils/         # Utilitarios
```

## Environment Variables

Veja `.env.example` para a lista completa de variaveis necessarias.

Variaveis obrigatorias:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Scripts

| Script | Descricao |
|--------|-----------|
| `npm run dev` | Inicia dev server (API + UI) |
| `npm run dev:ui` | Inicia apenas o frontend |
| `npm run dev:api` | Inicia apenas a API |
| `npm run build` | Build para producao |
| `npm run preview` | Preview da build |
| `npm run test` | Roda testes unitarios |
| `npm run test:e2e` | Roda testes E2E |
| `npm run typecheck` | Verifica tipos TypeScript |
| `npm run deploy` | Deploy para Cloudflare |

## Contributing

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudancas (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## License

MIT
