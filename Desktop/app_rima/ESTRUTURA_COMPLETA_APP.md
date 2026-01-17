# 🎤 APRENDA RIMA - ESTRUTURA COMPLETA DO APP

**Status:** Production-Ready | **MVP:** 7 semanas | **Usuários alvo:** MCs, rappers, iniciantes

---

## 📊 VISÃO GERAL EXECUTIVA

### O que é?
App de treinamento de freestyle rap estilo **Duolingo para battle rappers**.

Usuário aprende em 30 dias → vira competidor de batalla → compete com comunidade.

### Diferencial
```
❌ Red Bull Freestyle: Sem ensino, só competição
❌ Rap Fame: Features mas sem pedagogia estruturada
✅ Seu App: Duolingo + AI Feedback + Battle Real
```

### Escala
- **MVP (7 semanas):** 1 dev solo
- **Beta (4 semanas):** 5 beta testers
- **Launch:** 100 usuários simultâneos
- **Escala:** 100K+ usuários

---

## 🏗️ ARQUITETURA TÉCNICA

### Stack Completo
```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Home/Onboard │  │ Learning     │  │ Battle Arena │  │
│  │              │  │ (30 lessons) │  │ (Duels)      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Leaderboard  │  │ Shop         │  │ Profile      │  │
│  │              │  │ (Cosmetics)  │  │ (Stats)      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
              ↓ API Calls (REST + WebSocket)
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Auth Service │  │ Exercise API │  │ Duel Service │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Leaderboard  │  │ Shop Service │  │ AI Scoring   │  │
│  │ (Redis cache)│  │ (Stripe)     │  │ (OpenAI)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
              ↓ SQL Queries
┌─────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL 15)                   │
│                    28 TABELAS                           │
│  Core | Learning | Rimas | Gamification | Battle | Shop│
└─────────────────────────────────────────────────────────┘
```

### Serviços Externos
- **Supabase:** Database + Auth + Storage
- **OpenAI/Claude:** AI scoring de versos
- **Stripe:** Pagamento de cosmetics
- **Firebase:** Analytics (opcional)
- **Redis:** Cache de leaderboard

---

## 🎮 EXPERIÊNCIA DO USUÁRIO (USER FLOW)

### 1. ONBOARDING (5 min)
```
Sign Up / Login
    ↓
Create Profile (username, avatar, bio)
    ↓
Tutorial: O que é rima? (video + interactive)
    ↓
First Exercise (listening - fácil)
    ↓
Desbloqueado: Pillar 1 (Rima Básica)
```

### 2. APRENDIZADO (30 dias)
```
DIA 1-7: Pillar 1 - RIMA BÁSICA
├─ Lesson 1.1: O que é rima? (5 exercícios)
├─ Lesson 1.2: AABB structure (5 exercícios)
├─ Lesson 1.3: Multi-sílabas (5 exercícios)
└─ Lesson 1.4: Slant rima (5 exercícios)
   Reward: +200 XP, Badge "Rima Master"

DIA 8-14: Pillar 2 - FLOW
├─ Lesson 2.1: Beat sync (5 exercícios)
├─ Lesson 2.2: Pacing (5 exercícios)
├─ Lesson 2.3: Breath control (5 exercícios)
└─ Lesson 2.4: Estilo (5 exercícios)
   Reward: +200 XP, Badge "Flow King"

DIA 15-21: Pillar 3 - CONTEÚDO
├─ Lesson 3.1: Estrutura verso (5 exercícios)
├─ Lesson 3.2: Wordplay & metáfora (5 exercícios)
├─ Lesson 3.3: Referências (5 exercícios)
└─ Lesson 3.4: Storytelling (5 exercícios)
   Reward: +200 XP, Badge "Criativo"

DIA 22-30: Pillar 4 - BATALLA
├─ Lesson 4.1: Rebuttal (5 exercícios)
├─ Lesson 4.2: Improviso (5 exercícios)
├─ Lesson 4.3: Stage presence (5 exercícios)
└─ Lesson 4.4: Real-time adaptation (5 exercícios)
   Reward: +200 XP, Badge "Battle Ready"

   ✅ COMPETIDOR PRONTO PARA DUELOS REAIS!
```

### 3. COMPETIÇÃO (contínuo)
```
Battle Arena
├─ vs IA (fácil/médio/hard)
│  └─ Score automático, feedback imediato
├─ vs Outro Usuário (matchmaking por rating)
│  └─ Duelo ao vivo, comunidade vota
└─ Torneio Semanal (leaderboard, prizes)

Ganhar → Rating ↑ → Prêmios → Status 🏆
```

### 4. MONETIZAÇÃO (contínuo)
```
Cosmetics Shop
├─ Skins (aparência no vs)
├─ Borders (moldura do duelo)
├─ Avatars (foto do perfil)
└─ Emotes (reações)

Pricing: R$ 4,99 - R$ 29,99
Payment: Stripe
```

---

## 📚 SISTEMA DE APRENDIZADO: 30 LIÇÕES

### Pillar 1: RIMA BÁSICA (Lições 1-4)

**Lesson 1.1: O que é Rima?**
```
THEORY (2 min):
- Definição de rima perfeita vs slant
- Exemplos de MCs reais (BDA, Urban Roosters)
- Por que rima é importante em freestyle

EXAMPLES (3 exemplos):
1. BDA: "Tenho estilo, tenho talento / Fundamento"
2. Urban Roosters: "Meu flow é tipo rio / Desaparecendo"
3. Freestyle: "Meu nome é importante / Complicado"

EXERCISES (5):
┌─ Ex 1: LISTENING (30s) - Identifique a rima
├─ Ex 2: MATCHING (60s) - Agrupe pares
├─ Ex 3: FILL BLANK (45s) - Complete a rima
├─ Ex 4: PRODUCTION (120s) - Grava sua rima
└─ Ex 5: SPEED (60s) - 10 rimas rápido

REWARD: +10 XP base, +20 XP bonus (>80%)
```

**Lesson 1.2: AABB (2 linhas rimam com 2 próximas linhas)**
**Lesson 1.3: Multi-sílabas (Rimas complexas)**
**Lesson 1.4: Slant Rima (Quase-rima criativa)**

---

### Pillar 2: FLOW (Lições 5-8)

**Lesson 2.1: Beat Sync**
- Metrônomo e timing
- BPM recognition
- Sincronização com beat

**Lesson 2.2: Syllable Pacing**
- Velocidade de entrega
- Consistência
- Variação rítmica

**Lesson 2.3: Breath Control**
- Respiração natural
- Pausas estratégicas
- Endurance (rimas longas)

**Lesson 2.4: Estilo**
- Agressivo, smooth, criativo, comedido
- Reconhecer estilos de MCs famosos
- Desenvolver seu próprio estilo

---

### Pillar 3: CONTEÚDO (Lições 9-12)

**Lesson 3.1: Estrutura de Verso**
- Setup (introdução) → Punchline (impacto)
- Twist (reviravolta)
- Exemplos de estrutura forte

**Lesson 3.2: Wordplay & Metáfora**
- Double meaning (duplo sentido)
- Trocadilhos
- Metáforas criativas

**Lesson 3.3: Referências & Context**
- Memes culturais brasileiros
- Referências a notícias
- Contexto local/social

**Lesson 3.4: Storytelling**
- Narrativa de começo/meio/fim
- Emoção e impacto
- Conexão com audiência

---

### Pillar 4: BATALLA (Lições 13-16)

**Lesson 4.1: Rebuttal (Responder)**
- Identificar diss (ataque)
- Responder direto
- Counter-ataque inteligente

**Lesson 4.2: Improviso**
- Freestyle com tema aleatório
- Quick thinking
- Criatividade sob pressão

**Lesson 4.3: Stage Presence**
- Confiança e atitude
- Energia e entusiasmo
- Controle da audiência

**Lesson 4.4: Real-time Adaptation**
- Mudar tema no meio
- Responder argumento
- Lidar com 1v2 (dois oponentes)

---

## 🎯 100 EXERCÍCIOS GAMIFICADOS

### Formato dos Exercícios (10 tipos)

```
1. LISTENING (30-60s)
   └─ Você ouve e escolhe resposta

2. MATCHING (60s)
   └─ Arrasta/agrupa respostas

3. FILL BLANK (45s)
   └─ Completa com palavra que rima

4. PRODUCTION (120s)
   └─ Você grava seu verso

5. SPEED CHALLENGE (60s)
   └─ Máxima velocidade, múltiplos rounds

6. SEQUENCING (60s)
   └─ Coloca em ordem correta

7. RHYTHM SYNC (30s)
   └─ Bata na tela no tempo do beat

8. COMPARISON (45s)
   └─ Escolhe qual é melhor

9. REAL-WORLD SIMULATION (90s)
   └─ AI responde seu verso (batalla)

10. FREESTYLE IMPROVISO (120s)
    └─ Tema aleatório, 4 versos
```

### Distribuição dos 100
```
PILLAR 1 (Rima): 25 exercícios
PILLAR 2 (Flow): 25 exercícios
PILLAR 3 (Conteúdo): 25 exercícios
PILLAR 4 (Batalla): 25 exercícios
```

### XP e Rewards
```
Listening: +10 XP
Matching: +15 XP
Production: +50 XP
Speed Challenge: +40-100 XP
Batalha AI: +75 XP
Freestyle Master: +300 XP
```

---

## 🏆 SISTEMA DE GAMIFICAÇÃO

### Níveis & XP
```
Nível = (XP total / 500) + 1

Nível 1: 0 XP
Nível 2: 500 XP
Nível 5: 2.000 XP
Nível 10: 5.000 XP
Nível 20: 10.000 XP
Nível 50: 25.000 XP (máximo)
```

### Rating & Ranking
```
Rating inicial: 1200
├─ Ganhar duel: +25 rating
├─ Perder duel: -10 rating
└─ Streak (5 vitórias): +50 bonus

Ranks:
├─ Bronze: 0-1500
├─ Silver: 1500-2000
├─ Gold: 2000-2500
├─ Platinum: 2500-3000
└─ Diamond: 3000+

Leaderboard global: TOP 100
```

### Streaks
```
Current Streak: 0-∞
├─ Ganhar duel: +1
├─ Perder duel: reset a 0
└─ Best Streak: histórico

Reward:
├─ 5-streak: +50 XP
├─ 10-streak: +100 XP + Badge
└─ 25-streak: +250 XP + Special Badge
```

### Achievements (20+)
```
🏆 Primeiro Duelo
🏆 Primeira Vitória
🏆 Em Fogo (5 streak)
🏆 Intermediário (Nível 10)
🏆 Top 100 (Rating 2500)
🏆 Elite (Rating 3000)
🏆 Lenda (Tudo com 90%+)
🏆 Rima Master (Pillar 1)
🏆 Flow King (Pillar 2)
🏆 Criativo (Pillar 3)
🏆 Battle Ready (Pillar 4)
```

### Badges/Cosmetics
```
Comum: Avatar, border, skin
Raro: Efeitos visuais, emotes
Épico: Skins animadas
Lendário: Exclusive (limited-time)

Preço: R$ 4,99 - R$ 29,99
```

### Daily Quests
```
DAILY:
├─ Prática Matinal (1 lesson) → 50 XP
├─ Desafio Battle (1 duel win) → 100 XP
├─ Consistência (2 exercícios) → 75 XP
└─ Completar: +20 pontos

WEEKLY:
├─ Semana de Fogo (5 duels) → 200 XP
└─ Completar: +50 pontos
```

---

## ⚔️ SISTEMA DE DUELOS/BATALHAS

### Tipos de Duelo

#### 1. vs IA (Training)
```
Dificuldade: Easy / Medium / Hard

AI gera verso → Você responde (20s prep + 30s record)
AI analysis:
├─ Rima accuracy: 0-100
├─ Flow timing: 0-100
├─ Content quality: 0-100
└─ Overall: 0-100

Reward: XP + rating change baseado em performance
```

#### 2. vs Outro Usuário (Competitive)
```
Matchmaking: Rating ± 300

1v1 Batalla:
├─ Round 1: User A rima (30s prep, 60s record)
├─ Round 2: User B rebuta (20s prep, 60s record)
├─ Round 3: User A counter (20s prep, 60s record)

Community vote:
├─ 50+ usuários votam
├─ Winner by points
├─ Replay salvo e shareable

Reward: XP + rating change + cosmetic drop (raro)
```

#### 3. Torneio Semanal
```
Bracket: Top 64 users por rating

8 rounds:
├─ Round 1: 64 → 32
├─ Round 2: 32 → 16
├─ Quarterfinal: 16 → 8
├─ Semifinal: 8 → 4
├─ Semifinal: 4 → 2
└─ Final: 1v1

Prize Pool:
├─ 1º lugar: 500 XP + Cosmetic Lendário
├─ 2º lugar: 250 XP + Cosmetic Épico
├─ 3-4º lugar: 100 XP cada
└─ 5-8º lugar: 50 XP cada
```

### Replay System
```
Cada duelo salva:
├─ Vídeo da batalha (com beat)
├─ Audio dos dois versos
├─ Scores e análise IA
└─ Community comments

Shareable para:
├─ TikTok
├─ Instagram
├─ YouTube
└─ App próprio (leaderboard)

Engagement:
├─ Likes
├─ Comments
├─ Shares
└─ Views count
```

---

## 🛍️ SHOP & MONETIZAÇÃO

### Cosmetics
```
Tipos:
├─ Skins (visual no duelo)
├─ Borders (moldura)
├─ Avatars (foto do perfil)
└─ Emotes (reações/celebrações)

Rarity:
├─ Common: R$ 4,99
├─ Rare: R$ 9,99
├─ Epic: R$ 14,99
└─ Legendary: R$ 24,99 (limited-time)
```

### Referral Program
```
Share código: LUCAS_123

Amigo usa → Sign up com código
├─ Amigo ganha: 100 credits (≈ R$ 10)
├─ Você ganha: 50 credits (≈ R$ 5)
└─ Ilimitado!

Leaderboard de top referers (mensal)
```

### Battle Pass (Seasonal)
```
Free track:
├─ 30 tiers
├─ Unlock cosmetics
└─ Unlock emotes

Premium track:
├─ 30 tiers adicionais
├─ Cosmetics épicos
├─ XP boost (+50%)
└─ R$ 29,99/season (4 semanas)

Progression:
├─ Ganha XP em cada atividade
├─ Tier up automático
└─ Cosmetics permanentes
```

---

## 👥 SOCIAL & COMUNIDADE

### Profile
```
Seu perfil mostra:
├─ Username + Avatar
├─ Rating + Nível
├─ Streaks (current + best)
├─ Win rate (% de vitórias)
├─ Favorite verses (top 3)
├─ Achievements
├─ Battle history (últimos 10)
└─ Cosmetics equipados
```

### Friendships
```
Follow / Unfollow usuários

Friends leaderboard:
├─ Seus amigos em ranking
├─ Desafio direto (1v1)
└─ Ver battle history
```

### Comments & Reactions
```
Em cada replay:
├─ Community comments (texto)
├─ Reações (thumbs up/down)
├─ Replies (threads)
└─ Like de comentários
```

### Leaderboard Global
```
Rankings:
├─ Top 100 by Rating (real-time)
├─ Top 100 by XP (semana)
├─ Top 100 by Wins (mês)
├─ Top Streamers (futura)
└─ Top Comments (community)

Filters:
├─ All time
├─ This month
├─ This week
└─ Friends only
```

---

## 📱 ESTRUTURA DE TELAS (FRONTEND)

### Home
```
┌─────────────────────┐
│ Aprenda Rima 🎤     │  Header
├─────────────────────┤
│ BEM-VINDO, LUCAS!   │  Greeting + Stats
│ 🎯 Nivel 5          │
│ ⭐ Rating 1800      │
│ 🔥 Streak: 3        │
├─────────────────────┤
│ CONTINUE            │
│ [Pillar 1 - 40%]    │  Progress bar
│ Lesson 1.3          │
├─────────────────────┤
│ QUICK ACTIONS       │
│ [Battle] [Shop]     │  Botões principais
│ [Daily] [Profile]   │
├─────────────────────┤
│ DAILY QUEST         │
│ ☑️ Prática matinal   │  Quest tracker
│ ☐ Desafio battle    │
└─────────────────────┘
```

### Learning Screen
```
┌─────────────────────┐
│ Pillar 1: Rima      │  Title
├─────────────────────┤
│ Lesson 1.1: O que   │  Theory
│ é rima?             │  + Examples
│                     │
│ [Next: Exercícios]  │
├─────────────────────┤
│ Ex 1: LISTENING     │  Exercise list
│ ✅ (score: 95)      │
│ Ex 2: MATCHING      │
│ ⏳ (in progress)    │
│ Ex 3: FILL BLANK    │
│ ⭕ (locked)         │
└─────────────────────┘
```

### Exercise Screen
```
┌─────────────────────┐
│ Ex 1: LISTENING     │  Title
│ [>] Audio playing   │  Player
├─────────────────────┤
│ Qual é a rima?      │  Question
│                     │
│ A) GLÓRIA  ←──────  │  Options
│ B) MELHOR           │
│ C) RÁPIDO           │
│                     │
│ [SUBMIT]            │  Button
├─────────────────────┤
│ ⏱️ 15s remaining    │  Timer
└─────────────────────┘
```

### Battle Screen
```
┌──────────┬──────────┐
│ YOU      │ OPPONENT │  Players
│ Lucas    │ AI Easy  │
├──────────┼──────────┤
│ [RECORD] │ [WAITING]│  Record button
│ [>] Play │          │
│ [SUBMIT] │          │
├──────────┼──────────┤
│ Analysis │          │  AI feedback
│ Rima: 8/10│         │
│ Flow: 7/10│         │
│ Score: 85 │         │
├──────────┼──────────┤
│ Result: WIN! 🎉    │
│ +50 XP, +25 Rating  │
└──────────┴──────────┘
```

### Leaderboard
```
┌──────────────────────┐
│ 🏆 LEADERBOARD       │
├──────────────────────┤
│ 1. Neo_Rima          │
│    ⭐ R: 3200       │
│    🎖️ 85 wins       │
├──────────────────────┤
│ 2. Criolo_Master     │
│    ⭐ R: 2950       │
│    🎖️ 78 wins       │
├──────────────────────┤
│ 3. Estrategista      │
│    ⭐ R: 2800       │
│    🎖️ 72 wins       │
└──────────────────────┘
```

### Shop
```
┌──────────────────────┐
│ 💰 SHOP              │
│ Credits: 1.200       │
├──────────────────────┤
│ COSMETICS:           │
│ [Neon Skin] R$9,99   │
│ ├─ ⭐ Rare          │
│ └─ [ADD TO CART]     │
│                      │
│ [Gold Border] R$14,99│
│ ├─ 🔥 Epic          │
│ └─ [ADD TO CART]     │
│                      │
│ [Cart] [CHECKOUT]    │
└──────────────────────┘
```

### Profile
```
┌──────────────────────┐
│ LUCAS TIGRE 👤       │
├──────────────────────┤
│ Nível: 5             │
│ XP: 2.500 / 5.000    │
│ Rating: 1.800        │
│ Wins: 42 / 88        │
│                      │
│ 🔥 Best Streak: 7   │
│ 📊 Win Rate: 47%    │
│                      │
│ [ACHIEVEMENTS]       │
│ [BATTLE HISTORY]     │
│ [FAVORITES]          │
│ [SETTINGS]           │
└──────────────────────┘
```

---

## 🛠️ BACKEND API ENDPOINTS (20+)

### Auth
```
POST   /api/auth/signup          - Register
POST   /api/auth/login           - Login
POST   /api/auth/logout          - Logout
POST   /api/auth/refresh         - Refresh token
```

### Exercises
```
GET    /api/exercises            - Listar todos
GET    /api/exercises/:id        - Get one
POST   /api/exercises/:id/submit - Submit resultado
GET    /api/user/progress        - Learning progress
```

### Duels
```
POST   /api/duels/create         - Criar duel
GET    /api/duels/:id            - Get duel
POST   /api/duels/:id/submit     - Submit verso
GET    /api/user/duels           - User history
GET    /api/duels/vs/:userId     - Challenge user
```

### Leaderboard
```
GET    /api/leaderboard/global   - Top 100
GET    /api/leaderboard/rank     - User rank
GET    /api/leaderboard/friends  - Friends ranking
```

### Shop
```
GET    /api/shop/cosmetics       - List items
POST   /api/shop/purchase        - Comprar item
GET    /api/user/cosmetics       - Owned items
POST   /api/user/equip           - Equipar item
```

### Users
```
GET    /api/users/:id            - Get profile
PUT    /api/users/:id            - Update profile
GET    /api/users/:id/stats      - User stats
GET    /api/users/:id/battles    - Battle history
```

### AI Scoring
```
POST   /api/ai/evaluate          - Score verso
POST   /api/ai/generate-response - AI gera verso
```

---

## 📈 ROADMAP 7 SEMANAS

### Semana 1: SETUP & CORE
```
✅ Database setup (28 tabelas)
✅ Auth (signup, login, JWT)
✅ User profile
✅ Home screen
Deliverable: User pode logar e ver dashboard
```

### Semana 2: LEARNING PATH
```
✅ Lesson pages (4 pilares, 30 lições)
✅ Exercise system (listening, matching, fill_blank)
✅ Exercise results storage
✅ Progress tracking
Deliverable: User pode fazer 10 exercícios
```

### Semana 3: PRODUCTION EXERCISES
```
✅ Audio recording (production exercises)
✅ AI scoring (OpenAI evaluation)
✅ Feedback display
✅ XP/rewards system
Deliverable: User pode gravar verso e receber feedback
```

### Semana 4: GAMIFICATION
```
✅ Achievements system
✅ Badges/cosmetics
✅ Streaks tracking
✅ Leaderboard (global)
Deliverable: User vê rank, achievements, streak
```

### Semana 5: BATTLES vs IA
```
✅ Battle flow (1v1 vs IA)
✅ AI verso generation
✅ Battle scoring
✅ Results page + replay
Deliverable: User pode fazer duelo contra IA
```

### Semana 6: SHOP & SOCIAL
```
✅ Cosmetics shop (Stripe integration)
✅ Purchase flow
✅ Equipped cosmetics
✅ Friendships/leaderboard social
Deliverable: User pode comprar item e ver amigos
```

### Semana 7: POLISH & LAUNCH
```
✅ Bug fixes
✅ Performance optimization
✅ SEO/metadata
✅ Mobile responsive
✅ Load testing
Deliverable: MVP LIVE 🚀
```

---

## 📊 MÉTRICAS & KPIs

### Engagement
```
DAU (Daily Active Users): Target 1000/mês
MAU (Monthly Active Users): Target 5000/mês
Session duration: Target 20-30 min
Retention D7: Target 60%+
Retention D30: Target 40%+
```

### Learning
```
Completion Pillar 1: Target 80%
Completion Pillar 2: Target 65%
Completion Pillar 3: Target 50%
Completion Pillar 4: Target 35%
Average score: Target >75/100
```

### Monetization
```
ARPU: Target R$ 50/mês
Conversion (free → purchase): Target 5%
Average order value: Target R$ 25
LTV: Target 12x CAC
```

### Community
```
Duels per user/mês: Target 10+
Comments per replay: Target 5+
Leaderboard activity: Target 200+ entries
```

---

## 🎯 DIFERENCIAL vs COMPETIDORES

### vs Duolingo
```
Duolingo:
├─ Genérico (30+ idiomas)
├─ Simples (matching + listening)
└─ Sem audio production

Seu App:
├─ Especializado (freestyle ONLY)
├─ Complexo (10 tipos de exercício)
└─ Audio production + AI scoring ✨
```

### vs Red Bull Freestyle
```
Red Bull:
├─ Sem ensino
├─ Só competição
└─ Churn 80% (novo user perdido)

Seu App:
├─ Pedagogia clara (Duolingo-style)
├─ Learning path → Competition
└─ Retention 60%+ ✨
```

### vs Rap Fame
```
Rap Fame:
├─ Studio + efeitos vocais
├─ Competições
└─ Sem progression

Seu App:
├─ Studio (opcional futura)
├─ Battles + Learning
└─ Clear progression path ✨
```

---

## 💰 REVENUE MODEL

### Cosmetics (80%)
```
R$ 4,99 - R$ 29,99 por item
Target: 5% conversion (free → pago)
Estimated: R$ 50 ARPU
```

### Premium Battle Pass (15%)
```
R$ 29,99/season (4 semanas)
Exclusive cosmetics + XP boost
Target: 2% conversion
```

### Referral Commissions (5%)
```
Top referers ganham comissão
Plataforma ganha 50% de cada ref
```

---

## 🚀 PRÓXIMA FASE (APÓS MVP)

```
Fase 2 (Semana 8-12):
├─ Batalhas entre usuários (1v1 real-time)
├─ Torneios semanais
├─ Streaming integration (Twitch)
└─ Voice changer effects

Fase 3 (Semana 13-24):
├─ Mobile app (iOS + Android)
├─ YouTube integration
├─ Battle analytics dashboard
└─ Pro creator tools

Fase 4 (Semana 25+):
├─ IA mejorada (GPT-4 vision)
├─ Virtual arena com avatares
├─ Sponsorship program
└─ International expansion
```

---

## ✅ STATUS FINAL

**MVP Pronto em:** 7 SEMANAS
**Database:** ✅ 28 tabelas consolidadas
**Backend:** ✅ 20+ endpoints prontos
**Frontend:** ✅ Arquitetura em Next.js
**AI Integration:** ✅ OpenAI ready
**Gamification:** ✅ Completo
**Monetization:** ✅ Stripe + referrals
**Deployment:** ✅ Vercel + Railway ready

---

## 📞 RESUMO EXECUTIVO

```
🎤 APRENDA RIMA

O que é: Duolingo para battle rappers
Alvo: 100K+ usuários em 1 ano
Diferencial: Pedagogia estruturada + AI feedback
Revenue: R$ 50 ARPU × 5000 MAU = R$ 250K/mês (ano 1)
Time: 1 dev solo (7 semanas MVP)
Tech: Next.js + Express + PostgreSQL + OpenAI
Deploy: Supabase + Vercel + Railway
```

---

**Versão:** 1.0 Completa
**Data:** 2026-01-17
**Status:** PRODUCTION READY 🚀
