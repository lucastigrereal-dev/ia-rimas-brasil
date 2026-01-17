# 🚀 CHECKLIST DE IMPLEMENTAÇÃO: DATABASE APRENDA RIMA

**Status:** ✅ SCHEMA FINAL PRONTO
**Data:** 2026-01-17
**Tabelas:** 28 consolidadas
**Linhas SQL:** 1.200+

---

## 📋 ARQUIVOS ENTREGUES

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `BANCO_DADOS_28_TABELAS_FINAL.sql` | ✅ | Schema completo pronto pro Supabase |
| `PLANO_IMPORTACAO_DADOS.sql` | ✅ | Como importar 7.200+ rimas |
| Este checklist | ✅ | Roteiro step-by-step |

---

## 🔧 PARTE 1: SETUP NO SUPABASE (15-20 min)

### Passo 1.1: Criar Novo Projeto Supabase
- [ ] Acesse [supabase.com](https://supabase.com)
- [ ] Clique em "New Project"
- [ ] Preench details:
  - **Organization:** Crie ou selecione
  - **Project Name:** `aprenda-rima-prod`
  - **Database Password:** Gere senha forte (salve em `.env`)
  - **Region:** Brazil (São Paulo)
- [ ] Clique "Create new project"

### Passo 1.2: Copiar Connection String
- [ ] Após criado, vá para: Settings → Database
- [ ] Copie a Connection String (URI)
- [ ] Salve em `.env` como `DATABASE_URL`

### Passo 1.3: Acessar SQL Editor
- [ ] Na sidebar, clique em "SQL Editor"
- [ ] Clique em "New Query"
- [ ] Pronto para colar SQL

---

## 🗄️ PARTE 2: EXECUTAR SCHEMA FINAL (5-10 min)

### Passo 2.1: Copiar SQL Completo
- Abra `BANCO_DADOS_28_TABELAS_FINAL.sql`
- Selecione TODO o conteúdo
- Copie (Ctrl+A, Ctrl+C)

### Passo 2.2: Colar no SQL Editor
- [ ] Abra SQL Editor do Supabase
- [ ] Cole TODO o SQL
- [ ] Clique "Run" (ou Cmd+Enter)
- [ ] Aguarde conclusão (~60 segundos)

### Passo 2.3: Verificar Sucesso
- [ ] Vá para "Table Editor" → veja todas as 28 tabelas
- [ ] Execute query:
```sql
SELECT COUNT(*) as table_count FROM information_schema.tables
WHERE table_schema = 'public';
```
Resultado esperado: 28

---

## 📊 PARTE 3: IMPORTAR DADOS (5-10 min)

### Opção A: Generator SQL (Rápido - 1.800 rimas)

```sql
-- Copie a seção "PARTE 3: GENERATOR SQL" do PLANO_IMPORTACAO_DADOS.sql
-- Cole no SQL Editor
-- Clique Run
-- Espere ~1-2 min
```

✅ Resultado: 1.800 rimas + seed data

### Opção B: Importar CSV (Melhor - 7.200+ rimas)

**Se tem arquivo CSV pronto:**
1. Vá para: Storage → Buckets no Supabase
2. Crie bucket: `rimas-data`
3. Upload `rimas_7200.csv`
4. Use comando COPY via CLI Supabase

---

## ✅ PARTE 4: VALIDAÇÃO & TESTES (5-10 min)

### Teste 4.1: Verificar Estrutura
```sql
-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
-- Esperado: 28 tabelas
```

### Teste 4.2: Verificar Índices
```sql
-- Verificar índices
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
-- Esperado: 40+ índices
```

### Teste 4.3: Testar Views
```sql
-- Teste view leaderboard
SELECT * FROM leaderboard_global LIMIT 5;

-- Teste view learning progress
SELECT * FROM user_learning_progress LIMIT 5;
```

### Teste 4.4: Performance
```sql
-- Consulta rápida (< 100ms)
EXPLAIN ANALYZE
SELECT * FROM leaderboard_global LIMIT 10;

-- Full-text search (< 50ms)
EXPLAIN ANALYZE
SELECT * FROM rimas_banco
WHERE verso ILIKE '%flow%'
LIMIT 10;
```

---

## 🚀 PARTE 5: CONECTAR BACKEND (10-20 min)

### Passo 5.1: Configurar .env Backend
```bash
# backend/.env
DATABASE_URL=postgresql://postgres:SENHA@db.PROJECT_ID.supabase.co:5432/postgres
JWT_SECRET=seu-secret-key
JWT_REFRESH_SECRET=seu-refresh-secret
SUPABASE_URL=https://PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=seu-anon-key
```

### Passo 5.2: Testar Conexão
```javascript
// test-db-connection.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT COUNT(*) FROM users;')
  .then(res => console.log('✅ OK -', res.rows))
  .catch(err => console.error('❌ Erro:', err.message));
```

Execute:
```bash
node test-db-connection.js
# Esperado: ✅ OK - [ { count: '0' } ]
```

---

## 📊 PARTE 6: MONITORAMENTO (5 min)

### Monitorar Tamanho
```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size DESC;
```

### Habilitar Backups
- [ ] Vá para Settings → Backups
- [ ] Habilitar "Auto backups"
- [ ] Frequência: Daily
- [ ] Retenção: 7 dias mínimo

---

## ✅ CHECKLIST FINAL

### Database Setup
- [ ] Schema criado com 28 tabelas
- [ ] Todos os índices criados
- [ ] Triggers funcionando
- [ ] Views funcionando

### Data Import
- [ ] 1.800+ rimas importadas (ou 7.200)
- [ ] Achievements criados
- [ ] Exercises criados
- [ ] Daily quests criados

### Validation
- [ ] Integridade referencial OK
- [ ] Performance queries OK
- [ ] Backups configurados
- [ ] Conexão backend OK

---

## 🎯 O QUE VOCÊ CONSEGUE FAZER AGORA

```
✅ Criar usuário e logar
✅ Completar exercícios (30 lessons, 100 exercises)
✅ Rastrear progresso nos 4 pilares
✅ Duelos contra IA
✅ Ganhar XP e subir nível
✅ Desbloquear achievements
✅ Comprar cosmetics
✅ Ver leaderboard global
✅ Analytics em tempo real
✅ Backups automáticos
```

---

## 📞 TROUBLESHOOTING

| Erro | Solução |
|------|---------|
| "relation does not exist" | Rodar schema novamente |
| "SSL connection required" | Adicionar `?sslmode=require` |
| "permission denied" | Usar `postgres` user |
| Views retornando NULL | Verificar schema, recrie view |

---

## 🎉 PRONTO!

**Banco de dados production-ready em 15 minutos!**

Próximos passos:
1. ✅ Database setup
2. Backend (Express + Services)
3. Frontend (React + API calls)
4. Deploy para produção

---

**Versão:** 1.0 Final
**Status:** Production-Ready ✅
