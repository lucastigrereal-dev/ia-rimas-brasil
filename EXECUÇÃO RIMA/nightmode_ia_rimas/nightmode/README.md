# 🌙 MODO NOTURNO - GUIA COMPLETO
## IA Rimas Brasil - Sistema de Desenvolvimento Automatizado

---

## 📋 O QUE É ISSO?

Um sistema que desenvolve código **automaticamente durante a noite**, enquanto você dorme.

### Arquitetura:
```
┌─────────────────────────────────────────────────────────────────┐
│                        MODO NOTURNO                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │   CLAUDE     │    │  ORQUESTRADOR │    │   OLLAMA     │     │
│  │   (Cérebro)  │◄──►│   (Python)    │◄──►│   (Local)    │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│        │                    │                    │              │
│        │                    │                    │              │
│   Planeja ciclos      Coordena tudo       Gera código         │
│   Revisa mudanças     Roda testes         Refatora            │
│   Aprova/Rejeita      Faz commits         Cria arquivos       │
│                       Rollback            Corrige bugs         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Fluxo de um Ciclo:
```
1. 📖 Lê ROADMAP.md e TODO.yaml
2. 🧠 Claude planeja tarefas do ciclo
3. 🔧 Ollama gera código
4. 📁 Arquivos são criados/editados
5. 🧪 Testes rodam automaticamente
6. 🔍 Claude revisa as mudanças
7. ✅ Se passar: commit automático
8. ❌ Se falhar: rollback automático
9. 📝 Relatório gerado
10. ⏳ Aguarda próximo ciclo
```

---

## 🚀 INSTALAÇÃO RÁPIDA

### Pré-requisitos:
- Windows 10/11
- Python 3.10+
- Git
- Node.js 18+
- Ollama instalado

### Passo 1: Instalar Ollama
```bash
# Baixe de https://ollama.ai
# Depois rode:
ollama pull codellama:13b
ollama serve
```

### Passo 2: Configurar API Key (opcional mas recomendado)
```batch
# No CMD:
setx ANTHROPIC_API_KEY "sk-ant-api03-..."
```

### Passo 3: Copiar arquivos para o projeto
```batch
# Copie a pasta nightmode/ para seu projeto
copy nightmode\ C:\Users\lucas\webapp\nightmode\
```

### Passo 4: Executar
```batch
cd C:\Users\lucas\webapp
nightmode\night_run.bat
```

---

## 📁 ESTRUTURA DE ARQUIVOS

```
seu-projeto/
├── nightmode/
│   ├── orchestrator.py     # 🧠 Orquestrador principal
│   ├── night_run.bat       # 🚀 Script de inicialização
│   ├── config.yaml         # ⚙️ Configurações
│   ├── GUARDRAILS.md       # 🛡️ Regras de segurança
│   ├── ROADMAP.md          # 🗺️ O que fazer
│   ├── TODO.yaml           # 📋 Fila de tarefas
│   ├── reports/            # 📊 Relatórios por ciclo
│   ├── backups/            # 💾 Pontos de restauração
│   └── logs/               # 📝 Logs detalhados
├── src/                    # Seu código
└── package.json
```

---

## ⚙️ CONFIGURAÇÃO

### config.yaml
```yaml
# Modelo do Ollama (escolha um)
ollama:
  model: "codellama:13b"     # Melhor para código
  # model: "deepseek-coder:6.7b"  # Mais rápido
  # model: "mistral:7b"      # Generalista

# Intervalo entre ciclos
cycles:
  interval_minutes: 30       # A cada 30 minutos
  max_per_night: 20          # Máximo de ciclos

# Testes
tests:
  command: "npm test"
  lint_command: "npm run lint"
  build_command: "npm run build"
```

### TODO.yaml
```yaml
tasks:
  - id: "task_001"
    title: "Criar componente X"
    description: "Detalhes do que fazer"
    priority: 1
    difficulty: 2
    estimated_minutes: 15
    files_to_create:
      - "src/components/X.tsx"
    acceptance_criteria:
      - "Critério 1"
      - "Critério 2"
```

---

## 🛡️ SEGURANÇA

### O sistema é seguro porque:

1. **Branch isolada** - Nunca mexe na main
2. **Whitelist de comandos** - Só executa o permitido
3. **Rollback automático** - Desfaz se falhar
4. **Testes obrigatórios** - Só commita se passar
5. **Limites de mudança** - Máximo de arquivos por ciclo
6. **Review do Claude** - IA revisa antes de aprovar
7. **Logs completos** - Tudo é registrado

### Comandos que PODE fazer:
```
✅ npm test, npm run lint, npm run build
✅ git add, commit, checkout, branch
✅ Criar/editar arquivos .ts, .tsx, .js, .jsx, .css, .md
```

### Comandos que NÃO PODE fazer:
```
❌ rm -rf, del /s, format
❌ curl, wget (rede externa)
❌ Mexer em .env, credenciais
❌ Sair do diretório do projeto
```

---

## 📊 COMANDOS ÚTEIS

### Iniciar modo noturno:
```batch
nightmode\night_run.bat
```

### Rodar apenas 1 ciclo (teste):
```batch
python nightmode\orchestrator.py --single
```

### Verificar pré-requisitos:
```batch
python nightmode\orchestrator.py --check
```

### Ver relatórios:
```batch
type nightmode\reports\report_*.md
```

### Ver logs:
```batch
type nightmode\logs\night_*.log
```

### Merge mudanças para main:
```batch
git checkout main
git merge nightly-bot
git push origin main
```

### Descartar mudanças:
```batch
git checkout main
git branch -D nightly-bot
```

---

## 🔧 TROUBLESHOOTING

### Ollama não conecta
```batch
# Verifique se está rodando
curl http://localhost:11434/api/tags

# Se não, inicie:
ollama serve
```

### Python não encontra módulos
```batch
pip install requests pyyaml
```

### Git dá erro de permissão
```batch
# Verifique se não tem arquivos abertos
# Feche VSCode e tente novamente
```

### Ciclos falham sempre
```batch
# Verifique o log:
type nightmode\logs\night_*.log

# Causas comuns:
# - Testes já estão falhando
# - Lint com muitos erros
# - Ollama gerando código inválido
```

### Claude não revisa (sem API key)
```batch
# Configure a variável:
set ANTHROPIC_API_KEY=sk-ant-api03-...

# Ou rode sem Claude (menos seguro):
# O sistema vai funcionar, mas sem revisão inteligente
```

---

## 📈 MELHORES PRÁTICAS

### 1. Comece pequeno
```yaml
# No TODO.yaml, comece com tarefas simples:
tasks:
  - id: "task_001"
    title: "Criar tipo TypeScript"
    difficulty: 1  # Fácil
```

### 2. Teste de dia primeiro
```batch
# Rode 1 ciclo manualmente:
python nightmode\orchestrator.py --single

# Verifique se funcionou antes de deixar à noite
```

### 3. Revise pela manhã
```batch
# Veja o que foi feito:
git log --oneline -20

# Veja os relatórios:
dir nightmode\reports\
```

### 4. Mantenha TODO.yaml atualizado
- Adicione novas tarefas quando pensar nelas
- Marque como "done" o que foi completado
- Priorize o que é mais seguro automatizar

### 5. Ajuste os guardrails
- Se algo deu errado, adicione à blacklist
- Se precisa de algo novo, adicione à whitelist

---

## 💰 CUSTO ESTIMADO

| Recurso | Custo | Uso Típico/Noite |
|---------|-------|------------------|
| Ollama | R$ 0 | Local, grátis |
| Claude Sonnet | ~$0.003/1k tokens | ~50k tokens = ~$0.15 |
| Eletricidade | ~R$ 0.50 | PC ligado 8h |

**Total por noite: ~R$ 1-2**

Se rodar 20 noites/mês: **~R$ 20-40/mês**

---

## 🎯 ROADMAP DO MODO NOTURNO

### v1.0 (Atual)
- ✅ Orquestrador básico
- ✅ Integração Ollama
- ✅ Integração Claude
- ✅ Git automático
- ✅ Relatórios

### v1.1 (Futuro)
- [ ] Dashboard web para monitorar
- [ ] Notificações por email/Slack
- [ ] Agendamento Windows Task Scheduler
- [ ] Métricas de produtividade

### v2.0 (Futuro)
- [ ] Multi-projeto
- [ ] Auto-priorização de tarefas
- [ ] Aprendizado com feedback
- [ ] Deploy automático para staging

---

## ❓ FAQ

**P: Posso deixar rodando a noite toda?**
R: Sim! Configure `max_cycles` alto e deixe rodar.

**P: E se a luz acabar?**
R: Último commit está salvo. Rollback automático protege.

**P: Ollama é bom o suficiente?**
R: Para tarefas simples (componentes, tipos), sim. Para lógica complexa, Claude ajuda a revisar.

**P: Preciso da API do Claude?**
R: Não é obrigatório, mas recomendado. Sem Claude, não tem revisão inteligente.

**P: Posso usar em projetos de trabalho?**
R: Use com cautela. Sempre em branch separada e revise as mudanças.

---

## 📞 SUPORTE

Problemas? Abra uma issue no GitHub ou verifique os logs em `nightmode/logs/`.

---

*Desenvolvido para o projeto IA Rimas Brasil*
*"Enquanto você dorme, o código cresce"* 🌙
