# ⚡ QUICK START - RODAR HOJE NO CMD
## Instruções passo a passo para Windows

---

## 📋 CHECKLIST PRÉ-REQUISITOS

Execute estes comandos no CMD para verificar:

```batch
REM 1. Verificar Python
python --version
REM Esperado: Python 3.10+ 

REM 2. Verificar Git
git --version
REM Esperado: git version 2.x

REM 3. Verificar Node
node --version
REM Esperado: v18+ ou v20+

REM 4. Verificar npm
npm --version
REM Esperado: 9+ ou 10+
```

---

## 🚀 PASSO A PASSO

### PASSO 1: Instalar Ollama (se ainda não tem)

```batch
REM Baixe de: https://ollama.ai/download/windows
REM Execute o instalador
REM Depois, abra um CMD novo e rode:

ollama pull codellama:13b
ollama serve
```

**Deixe esse CMD aberto com Ollama rodando!**

### PASSO 2: Configurar API Key do Claude (recomendado)

Abra outro CMD e rode:

```batch
REM Substitua pela sua API key
setx ANTHROPIC_API_KEY "sk-ant-api03-SUA-KEY-AQUI"

REM IMPORTANTE: Feche e abra um novo CMD para a variável funcionar
```

### PASSO 3: Copiar arquivos para o projeto

```batch
REM Vá para a pasta do projeto
cd C:\Users\lucas\webapp

REM Crie a pasta nightmode
mkdir nightmode

REM Copie os arquivos (ou baixe do repositório)
```

### PASSO 4: Instalar dependências Python

```batch
pip install requests pyyaml
```

### PASSO 5: Testar Ollama

```batch
REM Teste se Ollama responde
curl http://localhost:11434/api/tags
REM Deve retornar JSON com os modelos
```

### PASSO 6: Teste rápido (1 ciclo só)

```batch
cd C:\Users\lucas\webapp
python nightmode\orchestrator.py --check
```

Se tudo estiver OK, rode 1 ciclo:

```batch
python nightmode\orchestrator.py --single
```

### PASSO 7: Modo noturno completo

```batch
nightmode\night_run.bat
```

---

## 🎯 COMANDOS RÁPIDOS

| O que fazer | Comando |
|-------------|---------|
| **Verificar pré-requisitos** | `python nightmode\orchestrator.py --check` |
| **Rodar 1 ciclo (teste)** | `python nightmode\orchestrator.py --single` |
| **Rodar 5 ciclos** | `python nightmode\orchestrator.py --cycles 5` |
| **Modo noturno completo** | `nightmode\night_run.bat` |
| **Ver relatórios** | `dir nightmode\reports\` |
| **Ver último log** | `type nightmode\logs\night_*.log` |
| **Ver mudanças Git** | `git log --oneline -10` |
| **Merge para main** | `git checkout main && git merge nightly-bot` |

---

## 🔍 VERIFICAÇÃO PÓS-EXECUÇÃO

Depois de rodar, verifique:

```batch
REM 1. Ver commits feitos
git log --oneline -5

REM 2. Ver arquivos criados
git status

REM 3. Ver relatório do ciclo
type nightmode\reports\report_cycle_*.md

REM 4. Rodar testes
npm test

REM 5. Ver o código gerado
code .
```

---

## ⚠️ SE DER ERRO

### Erro: "Ollama não conecta"
```batch
REM Verifique se Ollama está rodando
tasklist | findstr ollama

REM Se não estiver, inicie:
ollama serve
```

### Erro: "ANTHROPIC_API_KEY não configurada"
```batch
REM Verifique a variável
echo %ANTHROPIC_API_KEY%

REM Se vazio, configure:
set ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Erro: "Git branch não existe"
```batch
REM Crie a branch manualmente
git checkout -b nightly-bot
```

### Erro: "Testes falham"
```batch
REM Primeiro conserte os testes na main
npm test

REM Depois tente novamente
```

---

## 📊 ESTRUTURA FINAL

Depois de copiar tudo, seu projeto deve ter:

```
C:\Users\lucas\webapp\
├── nightmode\
│   ├── orchestrator.py      ✅
│   ├── night_run.bat        ✅
│   ├── config.yaml          ✅
│   ├── GUARDRAILS.md        ✅
│   ├── ROADMAP.md           ✅
│   ├── TODO.yaml            ✅
│   ├── README.md            ✅
│   ├── QUICK_START.md       ✅
│   ├── reports\             (criado automaticamente)
│   ├── backups\             (criado automaticamente)
│   └── logs\                (criado automaticamente)
├── src\
├── package.json
└── ...
```

---

## ✅ PRONTO!

Se chegou até aqui, você pode:

1. **Testar agora**: `python nightmode\orchestrator.py --single`
2. **Deixar rodando à noite**: `nightmode\night_run.bat`
3. **Ver resultados de manhã**: `type nightmode\reports\*.md`

---

*Dica: Na primeira vez, rode apenas 1-2 ciclos para ver como funciona!*
