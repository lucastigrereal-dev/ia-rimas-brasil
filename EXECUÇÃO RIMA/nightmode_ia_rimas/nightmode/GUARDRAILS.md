# 🛡️ GUARDRAILS - REGRAS DE SEGURANÇA DO MODO NOTURNO
## IA Rimas Brasil - Sistema de Desenvolvimento Automatizado

**IMPORTANTE:** Este documento define o que o sistema PODE e NÃO PODE fazer.
Qualquer operação fora destas regras será BLOQUEADA automaticamente.

---

## ✅ COMANDOS PERMITIDOS (Whitelist)

### NPM / Node
```
npm test              # Rodar testes
npm run lint          # Verificar código
npm run build         # Compilar projeto
npm install           # Instalar dependências (apenas package.json)
npx prettier --write  # Formatar código
```

### Git
```
git status            # Ver status
git diff              # Ver diferenças
git add               # Adicionar arquivos
git commit            # Commitar mudanças
git checkout          # Trocar branch
git branch            # Listar/criar branches
git merge             # Merge de branches
git stash             # Guardar mudanças temporárias
```

### Sistema (Leitura)
```
dir                   # Listar diretórios
type                  # Ver conteúdo de arquivo
```

### Sistema (Escrita Controlada)
```
copy                  # Copiar arquivos (dentro do projeto)
move                  # Mover arquivos (dentro do projeto)
mkdir                 # Criar diretórios (dentro do projeto)
```

---

## ❌ COMANDOS PROIBIDOS (Blacklist Absoluta)

### Destrutivos
```
rm -rf                # Deletar recursivo (Unix)
del /s /q             # Deletar recursivo (Windows)
rmdir /s /q           # Remover diretório (Windows)
format                # Formatar disco
diskpart              # Manipular partições
```

### Sistema
```
reg delete            # Deletar registro Windows
netsh                 # Configurar rede
shutdown              # Desligar sistema
taskkill              # Matar processos
```

### Rede (por padrão)
```
curl                  # Downloads externos
wget                  # Downloads externos
Invoke-WebRequest     # Downloads externos (PowerShell)
```

---

## 🔒 PATHS PROTEGIDOS (Não pode tocar)

```
.env                  # Variáveis de ambiente
.env.local            # Variáveis locais
.env.production       # Variáveis de produção
credentials/          # Pasta de credenciais
secrets/              # Pasta de secrets
.git/config           # Configuração do Git
node_modules/         # Dependências (só npm install pode mexer)

# Paths do sistema
C:\Windows\           # Sistema operacional
C:\Program Files\     # Programas instalados
C:\Users\*\AppData\   # Dados de usuário
```

---

## 📁 EXTENSÕES PERMITIDAS PARA EDIÇÃO

```
# Código
.ts, .tsx             # TypeScript
.js, .jsx             # JavaScript
.py                   # Python
.sh, .bat             # Scripts

# Estilos
.css, .scss           # Estilos

# Markup
.html                 # HTML
.md, .txt             # Documentação

# Dados
.json                 # Configurações
.yaml, .yml           # Configurações
```

### ❌ Extensões PROIBIDAS
```
.exe, .dll, .so       # Executáveis
.env, .pem, .key      # Secrets
.zip, .tar, .gz       # Arquivos compactados
.db, .sqlite          # Bancos de dados (apenas via API)
```

---

## 📊 LIMITES POR CICLO

| Limite | Valor | Justificativa |
|--------|-------|---------------|
| **Arquivos modificados** | 10 | Evita mudanças massivas |
| **Linhas adicionadas** | 500 | Limita complexidade |
| **Linhas removidas** | 200 | Conservador em deleções |
| **Arquivos novos** | 5 | Evita explosão de arquivos |
| **Tamanho máximo/arquivo** | 500KB | Evita arquivos gigantes |
| **Tempo máximo/ciclo** | 30min | Evita loops infinitos |

---

## ✅ CRITÉRIOS DE APROVAÇÃO AUTOMÁTICA

Para um ciclo ser aprovado SEM intervenção humana, TODOS estes critérios devem passar:

| Critério | Obrigatório | Verificação |
|----------|-------------|-------------|
| **Testes passam** | ✅ Sim | `npm test` retorna 0 |
| **Lint passa** | ✅ Sim | `npm run lint` retorna 0 |
| **Build passa** | ✅ Sim | `npm run build` retorna 0 |
| **Sem arquivos protegidos** | ✅ Sim | Nenhum path da blacklist |
| **Dentro dos limites** | ✅ Sim | Todos os limites respeitados |
| **Review do Claude > 70** | ✅ Sim | Score de revisão aceitável |

### Se QUALQUER critério falhar:
1. Rollback automático para último commit bom
2. Relatório de falha gerado
3. Próximo ciclo tenta novamente (ou pula tarefa)

---

## 🔄 POLÍTICA DE ROLLBACK

### Rollback AUTOMÁTICO quando:
- Testes falham
- Build falha
- Lint com erros críticos
- Arquivo protegido modificado
- Limite excedido
- Timeout do ciclo

### Rollback MANUAL (requer humano):
- Merge para branch principal
- Publicação em produção
- Mudanças em credenciais
- Alteração deste arquivo (GUARDRAILS.md)

---

## 🌐 POLÍTICA DE REDE

### Por padrão: REDE DESABILITADA

O modo noturno opera **offline** para segurança.

### Exceções permitidas:
```
http://localhost:*     # APIs locais
http://127.0.0.1:*     # APIs locais
https://api.anthropic.com  # Claude API (para revisão)
```

### Bloqueado:
```
*                      # Todo o resto
```

---

## 📝 COMO MODIFICAR ESTAS REGRAS

1. **NÃO modifique via modo noturno** (este arquivo é protegido)
2. Edite manualmente durante o dia
3. Commite com mensagem: `[GUARDRAILS] Descrição da mudança`
4. Próximo ciclo noturno usará as novas regras

---

## ⚠️ AVISOS DE SEGURANÇA

### 🔴 NUNCA FAÇA:
- Rodar modo noturno em branch `main` ou `production`
- Dar permissão de admin ao script
- Deixar ANTHROPIC_API_KEY em arquivo (use variável de ambiente)
- Rodar com credenciais de produção no ambiente

### 🟢 SEMPRE FAÇA:
- Rodar em branch isolada (`nightly-bot`)
- Manter backups externos do projeto
- Revisar relatórios pela manhã
- Validar mudanças antes de merge para main

---

## 📋 CHECKLIST ANTES DE INICIAR

- [ ] Branch noturna criada (`nightly-bot`)
- [ ] Variáveis de ambiente configuradas
- [ ] Ollama rodando (`ollama serve`)
- [ ] Testes passando no estado atual
- [ ] Disco com espaço suficiente (> 5GB)
- [ ] Este arquivo revisado e atualizado

---

*Última atualização: 09/01/2026*
*Responsável: Sistema IA Rimas Brasil*
