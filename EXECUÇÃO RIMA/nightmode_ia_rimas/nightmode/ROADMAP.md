# 🚀 ROADMAP - IA RIMAS BRASIL
## Modo Noturno - Tarefas para Automação

**Versão:** 2.0.0
**Atualizado:** 09/01/2026
**Foco:** MVP com gamificação e viralização

---

## 📋 VISÃO GERAL

O IA Rimas Brasil é o "Duolingo do Freestyle" - app gamificado para treino de rima, flow, punchline e batalha.

### Princípios de Desenvolvimento:
1. **Mobile-first PWA** - funciona em qualquer dispositivo
2. **Gamificação viciante** - streak, XP, ligas, badges
3. **Treino científico** - SOM, RITMO, SENTIDO, BATALHA
4. **Viralização orgânica** - compartilhamento, competição

---

## 🎯 MVP (P0) - PRÓXIMAS 4 SEMANAS

### Semana 1-2: Infraestrutura
- [ ] Setup Firebase (Auth + Firestore)
- [ ] Schema de usuários
- [ ] Schema de progresso
- [ ] Login/Signup (Email + Google)
- [ ] Migrar GameState local para cloud

### Semana 3: Gamificação Core
- [ ] Sistema de XP completo
- [ ] Sistema de Streak (dias consecutivos)
- [ ] Leaderboard real-time
- [ ] Badges básicos (5 tipos)
- [ ] Daily Challenge

### Semana 4: Drills e Conteúdo
- [ ] Drill 1: Rima Perfeita
- [ ] Drill 2: Rima Aproximada
- [ ] Drill 3: Rima Interna
- [ ] Drill 4: Multisílaba
- [ ] Drill 5: Flow Básico
- [ ] Drill 6: Punchline Setup+Punch
- [ ] Drill 7: Metáfora
- [ ] Drill 8: Ataque Direto
- [ ] Drill 9: Defesa/Rebote
- [ ] Drill 10: Freestyle Livre

---

## 🔧 TAREFAS TÉCNICAS AUTOMATIZÁVEIS

### Alta Prioridade (pode rodar à noite)

#### Componentes React
```
src/components/
├── DrillCard.tsx          # Card de exercício
├── StreakFire.tsx         # Animação de streak
├── XPBar.tsx              # Barra de XP
├── LeaderboardRow.tsx     # Linha do ranking
├── BadgeIcon.tsx          # Ícone de badge
├── DailyChallenge.tsx     # Desafio do dia
├── ProgressCalendar.tsx   # Calendário de progresso
└── ShareCard.tsx          # Card para compartilhar
```

#### Hooks Customizados
```
src/hooks/
├── useStreak.ts           # Lógica de streak
├── useXP.ts               # Lógica de XP
├── useLeaderboard.ts      # Dados do ranking
├── useDrills.ts           # Lista de drills
├── useProgress.ts         # Progresso do usuário
└── useAuth.ts             # Autenticação
```

#### Serviços
```
src/services/
├── firebase.ts            # Config Firebase
├── auth.ts                # Autenticação
├── database.ts            # Firestore
├── analytics.ts           # Eventos
└── notifications.ts       # Push notifications
```

#### Tipos TypeScript
```
src/types/
├── user.ts                # Tipos de usuário
├── drill.ts               # Tipos de drill
├── progress.ts            # Tipos de progresso
├── leaderboard.ts         # Tipos de ranking
└── badge.ts               # Tipos de badge
```

### Média Prioridade

#### Telas/Pages
```
src/pages/
├── Home.tsx               # Tela inicial
├── Drills.tsx             # Lista de drills
├── DrillPlay.tsx          # Executar drill
├── Profile.tsx            # Perfil do usuário
├── Leaderboard.tsx        # Ranking
├── Settings.tsx           # Configurações
└── Onboarding.tsx         # Tutorial inicial
```

#### Utilitários
```
src/utils/
├── rhyme.ts               # Funções de rima
├── scoring.ts             # Sistema de pontuação
├── format.ts              # Formatação
├── validation.ts          # Validações
└── storage.ts             # LocalStorage helpers
```

### Baixa Prioridade (deixar para humano)

- Configuração de CI/CD
- Deploy para produção
- Integração com APIs externas
- Moderação de conteúdo UGC
- Parcerias com MCs

---

## 📊 BANCO DE DADOS (Firestore Schema)

### Collection: users
```typescript
{
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Timestamp;
  lastActive: Timestamp;
  
  // Gamificação
  level: number;
  xp: number;
  streak: number;
  streakBest: number;
  lastDrillDate: string; // YYYY-MM-DD
  
  // Progresso
  drillsCompleted: number;
  totalScore: number;
  
  // Badges
  badges: string[];
  
  // Preferências
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}
```

### Collection: drills
```typescript
{
  id: string;
  title: string;
  description: string;
  category: 'som' | 'ritmo' | 'sentido' | 'batalha';
  difficulty: 1 | 2 | 3 | 4 | 5;
  xpReward: number;
  
  // Conteúdo
  instructions: string;
  examples: string[];
  words: string[];
  
  // Métricas
  completions: number;
  avgScore: number;
}
```

### Collection: progress
```typescript
{
  id: string; // `${userId}_${drillId}`
  userId: string;
  drillId: string;
  
  // Tentativas
  attempts: number;
  bestScore: number;
  lastScore: number;
  completedAt: Timestamp;
  
  // Detalhes
  timeSpent: number; // segundos
  stars: 0 | 1 | 2 | 3;
}
```

### Collection: leaderboard
```typescript
{
  id: string; // `${period}_${userId}`
  userId: string;
  displayName: string;
  photoURL: string;
  
  // Scores
  xp: number;
  drillsCompleted: number;
  streak: number;
  
  // Período
  period: 'daily' | 'weekly' | 'monthly' | 'alltime';
  updatedAt: Timestamp;
}
```

---

## 🎮 SISTEMA DE GAMIFICAÇÃO

### Níveis e XP
```
Nível 1: 0 XP
Nível 2: 100 XP
Nível 3: 250 XP
Nível 4: 500 XP
Nível 5: 1000 XP
...
Nível 50: 50000 XP
Nível 100: 200000 XP
```

### Badges
```
🔥 Streak Master - 7 dias consecutivos
⭐ First Blood - Primeiro drill completado
🎯 Sniper - 100% em um drill
📚 Scholar - 10 drills completados
🏆 Champion - Top 10 semanal
💎 Diamond - Nível 25
👑 Legend - Nível 50
```

### XP por Ação
```
Completar drill: 10-50 XP (baseado em dificuldade)
Primeira vez: +50% XP
3 estrelas: +25% XP
Streak ativo: +10% XP por dia (máx 70%)
Desafio diário: 100 XP
```

---

## 🧪 TESTES AUTOMATIZADOS

### Unitários (Jest)
```
__tests__/
├── components/
│   ├── DrillCard.test.tsx
│   ├── StreakFire.test.tsx
│   └── XPBar.test.tsx
├── hooks/
│   ├── useStreak.test.ts
│   └── useXP.test.ts
├── utils/
│   ├── rhyme.test.ts
│   └── scoring.test.ts
└── services/
    └── database.test.ts
```

### E2E (Playwright)
```
e2e/
├── onboarding.spec.ts
├── drill-flow.spec.ts
├── streak.spec.ts
└── leaderboard.spec.ts
```

---

## 📝 NOTAS PARA O MODO NOTURNO

### O que o Ollama PODE fazer:
- Criar componentes React
- Criar hooks customizados
- Criar tipos TypeScript
- Criar funções utilitárias
- Criar testes unitários
- Refatorar código existente
- Adicionar comentários/documentação
- Corrigir erros de lint

### O que o Ollama NÃO PODE fazer:
- Configurar Firebase (credenciais)
- Deploy para produção
- Mexer em .env files
- Criar UGC/conteúdo de usuário
- Integrar APIs externas
- Decisões de negócio

### Prioridade de Tarefas:
1. Componentes de UI (mais seguros)
2. Hooks e lógica (média complexidade)
3. Serviços (verificar cuidadosamente)
4. Testes (rodar sempre após)

---

*Este roadmap é atualizado automaticamente conforme tarefas são completadas.*
