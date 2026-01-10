#!/usr/bin/env python3
"""
🌙 MODO NOTURNO - ORQUESTRADOR PRINCIPAL
IA Rimas Brasil - Sistema de Desenvolvimento Automatizado

Arquitetura:
- Claude (API): Planeja ciclos, revisa diffs, aprova lotes
- Ollama (Local): Executa código, refatora, cria arquivos
- Orquestrador (Este script): Coordena tudo, roda testes, faz commits

Autor: Sistema IA Rimas Brasil
Data: 09/01/2026
"""

import os
import sys
import json
import yaml
import time
import shutil
import hashlib
import subprocess
import requests
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import difflib

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURAÇÕES
# ═══════════════════════════════════════════════════════════════════════════════

CONFIG = {
    # Ollama
    "ollama_url": "http://localhost:11434/api/generate",
    "ollama_model": "codellama:13b",  # ou "deepseek-coder:6.7b", "mistral:7b"
    
    # Claude (via API Anthropic)
    "claude_api_url": "https://api.anthropic.com/v1/messages",
    "claude_model": "claude-sonnet-4-20250514",  # Sonnet para custo-benefício
    
    # Projeto
    "project_root": os.environ.get("PROJECT_ROOT", r"C:\Users\lucas\webapp"),
    "nightmode_branch": "nightly-bot",
    "main_branch": "main",
    
    # Ciclos
    "cycle_interval_minutes": 30,
    "max_files_per_cycle": 10,
    "max_diff_lines": 500,
    "max_cycles_per_night": 20,
    
    # Testes
    "test_command": "npm test",
    "lint_command": "npm run lint",
    "build_command": "npm run build",
    
    # Paths
    "reports_dir": "nightmode/reports",
    "backups_dir": "nightmode/backups",
    "logs_dir": "nightmode/logs",
}

# ═══════════════════════════════════════════════════════════════════════════════
# GUARDRAILS - REGRAS DE SEGURANÇA
# ═══════════════════════════════════════════════════════════════════════════════

GUARDRAILS = {
    # Comandos permitidos (whitelist)
    "allowed_commands": [
        "npm test",
        "npm run lint",
        "npm run build",
        "npm install",
        "npx prettier --write",
        "git status",
        "git diff",
        "git add",
        "git commit",
        "git checkout",
        "git branch",
        "git merge",
        "git stash",
        "dir",
        "type",
        "copy",
        "move",
        "mkdir",
    ],
    
    # Comandos PROIBIDOS (blacklist absoluta)
    "forbidden_commands": [
        "rm -rf",
        "del /s /q",
        "rmdir /s /q",
        "format",
        "diskpart",
        "reg delete",
        "netsh",
        "shutdown",
        "taskkill",
        "curl",  # sem rede externa
        "wget",
        "Invoke-WebRequest",
    ],
    
    # Paths protegidos (não pode mexer)
    "protected_paths": [
        ".env",
        ".env.local",
        ".env.production",
        "credentials",
        "secrets",
        ".git/config",
        "node_modules",
        "C:\\Windows",
        "C:\\Program Files",
        "C:\\Users\\*\\AppData",
    ],
    
    # Extensões permitidas para edição
    "allowed_extensions": [
        ".ts", ".tsx", ".js", ".jsx",
        ".css", ".scss", ".html",
        ".json", ".yaml", ".yml",
        ".md", ".txt",
        ".py", ".sh", ".bat",
    ],
    
    # Limites de segurança
    "limits": {
        "max_file_size_kb": 500,
        "max_files_changed": 10,
        "max_lines_added": 500,
        "max_lines_removed": 200,
        "max_new_files": 5,
    },
    
    # Critérios de aprovação automática
    "auto_approve_criteria": {
        "tests_pass": True,
        "lint_pass": True,
        "build_pass": True,
        "no_protected_files": True,
        "within_limits": True,
    },
}

# ═══════════════════════════════════════════════════════════════════════════════
# CLASSES PRINCIPAIS
# ═══════════════════════════════════════════════════════════════════════════════

class Logger:
    """Sistema de logging para o modo noturno"""
    
    def __init__(self, log_dir: str):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.current_log = self.log_dir / f"night_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        
    def log(self, level: str, message: str):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        entry = f"[{timestamp}] [{level}] {message}"
        print(entry)
        with open(self.current_log, "a", encoding="utf-8") as f:
            f.write(entry + "\n")
    
    def info(self, msg): self.log("INFO", msg)
    def warn(self, msg): self.log("WARN", msg)
    def error(self, msg): self.log("ERROR", msg)
    def success(self, msg): self.log("SUCCESS", msg)


class GitManager:
    """Gerencia operações Git com segurança"""
    
    def __init__(self, project_root: str, logger: Logger):
        self.root = Path(project_root)
        self.logger = logger
        
    def run_git(self, args: List[str]) -> Tuple[bool, str]:
        """Executa comando git e retorna (sucesso, output)"""
        try:
            result = subprocess.run(
                ["git"] + args,
                cwd=self.root,
                capture_output=True,
                text=True,
                timeout=60
            )
            output = result.stdout + result.stderr
            return result.returncode == 0, output
        except Exception as e:
            return False, str(e)
    
    def setup_nightly_branch(self) -> bool:
        """Cria ou atualiza branch noturna"""
        self.logger.info("Configurando branch noturna...")
        
        # Salva trabalho atual
        self.run_git(["stash", "push", "-m", "nightmode_backup"])
        
        # Vai para main e atualiza
        self.run_git(["checkout", CONFIG["main_branch"]])
        self.run_git(["pull", "origin", CONFIG["main_branch"]])
        
        # Cria ou reseta branch noturna
        branch = CONFIG["nightmode_branch"]
        success, _ = self.run_git(["checkout", "-B", branch])
        
        if success:
            self.logger.success(f"Branch '{branch}' pronta!")
        else:
            self.logger.error(f"Falha ao criar branch '{branch}'")
        
        return success
    
    def create_backup(self, cycle_id: str) -> str:
        """Cria backup antes de mudanças"""
        backup_dir = self.root / CONFIG["backups_dir"]
        backup_dir.mkdir(parents=True, exist_ok=True)
        
        # Commit de checkpoint
        self.run_git(["add", "-A"])
        success, _ = self.run_git(["commit", "-m", f"🔒 Backup antes do ciclo {cycle_id}"])
        
        # Salva hash do commit
        _, commit_hash = self.run_git(["rev-parse", "HEAD"])
        backup_file = backup_dir / f"backup_{cycle_id}.txt"
        backup_file.write_text(commit_hash.strip())
        
        self.logger.info(f"Backup criado: {commit_hash[:8]}")
        return commit_hash.strip()
    
    def rollback(self, commit_hash: str) -> bool:
        """Volta para um commit específico"""
        self.logger.warn(f"Executando rollback para {commit_hash[:8]}...")
        success, output = self.run_git(["reset", "--hard", commit_hash])
        if success:
            self.logger.success("Rollback completo!")
        else:
            self.logger.error(f"Rollback falhou: {output}")
        return success
    
    def get_diff(self) -> str:
        """Retorna diff das mudanças atuais"""
        _, diff = self.run_git(["diff", "--staged"])
        return diff
    
    def commit_changes(self, message: str) -> bool:
        """Commita mudanças com mensagem"""
        self.run_git(["add", "-A"])
        success, _ = self.run_git(["commit", "-m", message])
        return success


class OllamaClient:
    """Cliente para Ollama (modelo local)"""
    
    def __init__(self, logger: Logger):
        self.url = CONFIG["ollama_url"]
        self.model = CONFIG["ollama_model"]
        self.logger = logger
    
    def is_available(self) -> bool:
        """Verifica se Ollama está rodando"""
        try:
            response = requests.get("http://localhost:11434/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def generate(self, prompt: str, system: str = "") -> Optional[str]:
        """Gera resposta do Ollama"""
        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "system": system,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "num_predict": 4096,
                }
            }
            
            response = requests.post(self.url, json=payload, timeout=300)
            
            if response.status_code == 200:
                return response.json().get("response", "")
            else:
                self.logger.error(f"Ollama error: {response.status_code}")
                return None
                
        except Exception as e:
            self.logger.error(f"Ollama exception: {e}")
            return None
    
    def generate_code(self, task: Dict) -> Optional[str]:
        """Gera código para uma tarefa específica"""
        system_prompt = """Você é um desenvolvedor especialista em React, TypeScript e gamificação.
Seu trabalho é implementar features para o app IA Rimas Brasil (treino de freestyle).

REGRAS:
1. Retorne APENAS código, sem explicações
2. Use TypeScript e React hooks
3. Use Tailwind CSS para estilos
4. Siga o padrão existente do projeto
5. Código limpo, sem console.log em produção
6. Trate erros adequadamente

FORMATO DE SAÍDA:
```filepath: caminho/do/arquivo.tsx
// código aqui
```
"""
        
        prompt = f"""TAREFA: {task.get('title', 'Sem título')}

DESCRIÇÃO:
{task.get('description', 'Sem descrição')}

ARQUIVOS RELACIONADOS:
{task.get('related_files', 'Nenhum')}

CRITÉRIOS DE ACEITE:
{task.get('acceptance_criteria', 'Nenhum')}

Implemente esta tarefa seguindo as regras do sistema."""

        return self.generate(prompt, system_prompt)


class ClaudeClient:
    """Cliente para Claude API (planejamento e revisão)"""
    
    def __init__(self, logger: Logger):
        self.url = CONFIG["claude_api_url"]
        self.model = CONFIG["claude_model"]
        self.api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        self.logger = logger
    
    def is_available(self) -> bool:
        """Verifica se API key está configurada"""
        return len(self.api_key) > 10
    
    def send_message(self, prompt: str, system: str = "") -> Optional[str]:
        """Envia mensagem para Claude"""
        if not self.is_available():
            self.logger.error("ANTHROPIC_API_KEY não configurada!")
            return None
        
        try:
            headers = {
                "Content-Type": "application/json",
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01"
            }
            
            payload = {
                "model": self.model,
                "max_tokens": 4096,
                "system": system,
                "messages": [{"role": "user", "content": prompt}]
            }
            
            response = requests.post(self.url, headers=headers, json=payload, timeout=120)
            
            if response.status_code == 200:
                return response.json()["content"][0]["text"]
            else:
                self.logger.error(f"Claude error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            self.logger.error(f"Claude exception: {e}")
            return None
    
    def plan_cycle(self, roadmap: str, todo: List[Dict], context: str) -> Optional[Dict]:
        """Claude planeja o próximo ciclo"""
        system_prompt = """Você é o Arquiteto do Modo Noturno para o app IA Rimas Brasil.
Seu papel é planejar ciclos de desenvolvimento automatizado.

RETORNE SEMPRE UM JSON VÁLIDO com a estrutura:
{
    "cycle_plan": {
        "tasks": [
            {
                "id": "task_001",
                "title": "Título da tarefa",
                "description": "O que fazer",
                "priority": 1,
                "estimated_minutes": 15,
                "files_to_modify": ["path/file.tsx"],
                "acceptance_criteria": ["Critério 1", "Critério 2"]
            }
        ],
        "total_estimated_minutes": 30,
        "risk_assessment": "baixo|médio|alto",
        "notes": "Observações"
    }
}"""

        prompt = f"""ROADMAP DO PROJETO:
{roadmap}

TAREFAS PENDENTES (TODO):
{json.dumps(todo, indent=2, ensure_ascii=False)}

CONTEXTO DO ÚLTIMO CICLO:
{context}

Analise e planeje o PRÓXIMO CICLO (máximo 30 minutos de trabalho).
Priorize tarefas de baixo risco que podem ser automatizadas.
Retorne o JSON do plano."""

        response = self.send_message(prompt, system_prompt)
        if response:
            try:
                # Extrai JSON da resposta
                start = response.find("{")
                end = response.rfind("}") + 1
                if start >= 0 and end > start:
                    return json.loads(response[start:end])
            except:
                pass
        return None
    
    def review_changes(self, diff: str, logs: str, tasks_done: List[str]) -> Dict:
        """Claude revisa as mudanças do ciclo"""
        system_prompt = """Você é o Revisor do Modo Noturno.
Analise as mudanças e decida se podem ser aprovadas.

RETORNE SEMPRE UM JSON VÁLIDO:
{
    "approved": true|false,
    "score": 0-100,
    "issues": ["problema1", "problema2"],
    "suggestions": ["sugestão1"],
    "summary": "Resumo do que foi feito",
    "next_steps": ["próximo passo 1"]
}

CRITÉRIOS DE APROVAÇÃO:
- Código segue padrões do projeto
- Sem bugs óbvios
- Sem hardcoded secrets
- Sem console.log em excesso
- Lógica faz sentido
- Não quebra funcionalidade existente"""

        prompt = f"""TAREFAS COMPLETADAS:
{json.dumps(tasks_done, indent=2, ensure_ascii=False)}

DIFF DAS MUDANÇAS:
```diff
{diff[:3000]}  # Limita tamanho
```

LOGS DE TESTE/BUILD:
```
{logs[:1000]}
```

Revise e retorne o JSON de avaliação."""

        response = self.send_message(prompt, system_prompt)
        if response:
            try:
                start = response.find("{")
                end = response.rfind("}") + 1
                if start >= 0 and end > start:
                    return json.loads(response[start:end])
            except:
                pass
        
        # Fallback conservador
        return {
            "approved": False,
            "score": 0,
            "issues": ["Não foi possível fazer revisão automática"],
            "suggestions": ["Revisar manualmente"],
            "summary": "Revisão falhou",
            "next_steps": []
        }


class TestRunner:
    """Executa testes, lint e build"""
    
    def __init__(self, project_root: str, logger: Logger):
        self.root = Path(project_root)
        self.logger = logger
    
    def run_command(self, cmd: str) -> Tuple[bool, str]:
        """Executa comando e retorna (sucesso, output)"""
        # Verifica se comando é permitido
        is_allowed = any(cmd.startswith(allowed) for allowed in GUARDRAILS["allowed_commands"])
        is_forbidden = any(forbidden in cmd for forbidden in GUARDRAILS["forbidden_commands"])
        
        if not is_allowed or is_forbidden:
            return False, f"Comando não permitido: {cmd}"
        
        try:
            result = subprocess.run(
                cmd,
                shell=True,
                cwd=self.root,
                capture_output=True,
                text=True,
                timeout=300
            )
            output = result.stdout + result.stderr
            return result.returncode == 0, output
        except subprocess.TimeoutExpired:
            return False, "Timeout"
        except Exception as e:
            return False, str(e)
    
    def run_tests(self) -> Tuple[bool, str]:
        """Roda testes"""
        self.logger.info("Rodando testes...")
        return self.run_command(CONFIG["test_command"])
    
    def run_lint(self) -> Tuple[bool, str]:
        """Roda lint"""
        self.logger.info("Rodando lint...")
        return self.run_command(CONFIG["lint_command"])
    
    def run_build(self) -> Tuple[bool, str]:
        """Roda build"""
        self.logger.info("Rodando build...")
        return self.run_command(CONFIG["build_command"])
    
    def run_all(self) -> Dict:
        """Roda todos os checks"""
        results = {
            "tests": {"passed": False, "output": ""},
            "lint": {"passed": False, "output": ""},
            "build": {"passed": False, "output": ""},
            "all_passed": False
        }
        
        results["tests"]["passed"], results["tests"]["output"] = self.run_tests()
        results["lint"]["passed"], results["lint"]["output"] = self.run_lint()
        results["build"]["passed"], results["build"]["output"] = self.run_build()
        
        results["all_passed"] = all([
            results["tests"]["passed"],
            results["lint"]["passed"],
            results["build"]["passed"]
        ])
        
        return results


class FileManager:
    """Gerencia criação e edição de arquivos com segurança"""
    
    def __init__(self, project_root: str, logger: Logger):
        self.root = Path(project_root)
        self.logger = logger
    
    def is_path_safe(self, filepath: str) -> bool:
        """Verifica se path é seguro para edição"""
        path = Path(filepath)
        
        # Verifica extensão
        if path.suffix not in GUARDRAILS["allowed_extensions"]:
            return False
        
        # Verifica paths protegidos
        for protected in GUARDRAILS["protected_paths"]:
            if protected in str(path):
                return False
        
        # Verifica se está dentro do projeto
        try:
            full_path = (self.root / path).resolve()
            if not str(full_path).startswith(str(self.root.resolve())):
                return False
        except:
            return False
        
        return True
    
    def write_file(self, filepath: str, content: str) -> bool:
        """Escreve arquivo com verificações de segurança"""
        if not self.is_path_safe(filepath):
            self.logger.error(f"Path não permitido: {filepath}")
            return False
        
        # Verifica tamanho
        size_kb = len(content.encode()) / 1024
        if size_kb > GUARDRAILS["limits"]["max_file_size_kb"]:
            self.logger.error(f"Arquivo muito grande: {size_kb}KB")
            return False
        
        try:
            full_path = self.root / filepath
            full_path.parent.mkdir(parents=True, exist_ok=True)
            full_path.write_text(content, encoding="utf-8")
            self.logger.info(f"Arquivo criado: {filepath}")
            return True
        except Exception as e:
            self.logger.error(f"Erro ao escrever {filepath}: {e}")
            return False
    
    def parse_code_blocks(self, response: str) -> List[Dict]:
        """Extrai blocos de código da resposta do Ollama"""
        files = []
        lines = response.split("\n")
        current_file = None
        current_content = []
        
        for line in lines:
            if line.startswith("```filepath:"):
                if current_file and current_content:
                    files.append({
                        "path": current_file,
                        "content": "\n".join(current_content)
                    })
                current_file = line.replace("```filepath:", "").strip()
                current_content = []
            elif line.startswith("```") and current_file:
                files.append({
                    "path": current_file,
                    "content": "\n".join(current_content)
                })
                current_file = None
                current_content = []
            elif current_file:
                current_content.append(line)
        
        return files


class ReportGenerator:
    """Gera relatórios de ciclo"""
    
    def __init__(self, reports_dir: str, logger: Logger):
        self.reports_dir = Path(reports_dir)
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        self.logger = logger
    
    def generate(self, cycle_id: str, data: Dict) -> str:
        """Gera relatório do ciclo"""
        report = f"""# 🌙 RELATÓRIO DO CICLO NOTURNO
## Ciclo: {cycle_id}
## Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

## 📊 RESUMO

| Métrica | Valor |
|---------|-------|
| Status | {'✅ SUCESSO' if data.get('success') else '❌ FALHA'} |
| Tarefas Planejadas | {len(data.get('tasks_planned', []))} |
| Tarefas Completadas | {len(data.get('tasks_done', []))} |
| Arquivos Modificados | {data.get('files_changed', 0)} |
| Testes | {'✅' if data.get('tests_passed') else '❌'} |
| Lint | {'✅' if data.get('lint_passed') else '❌'} |
| Build | {'✅' if data.get('build_passed') else '❌'} |
| Score de Revisão | {data.get('review_score', 0)}/100 |

---

## 📋 TAREFAS EXECUTADAS

{self._format_tasks(data.get('tasks_done', []))}

---

## 📁 ARQUIVOS MODIFICADOS

{self._format_files(data.get('files_modified', []))}

---

## 🔍 REVISÃO DO CLAUDE

**Aprovado:** {'Sim' if data.get('approved') else 'Não'}

**Issues encontradas:**
{self._format_list(data.get('issues', []))}

**Sugestões:**
{self._format_list(data.get('suggestions', []))}

---

## 📝 LOGS

### Testes
```
{data.get('test_output', 'N/A')[:500]}
```

### Build
```
{data.get('build_output', 'N/A')[:500]}
```

---

## ⏭️ PRÓXIMOS PASSOS

{self._format_list(data.get('next_steps', []))}

---

## 🔄 COMO TESTAR

1. Checkout da branch: `git checkout {CONFIG['nightmode_branch']}`
2. Instalar deps: `npm install`
3. Rodar testes: `npm test`
4. Rodar app: `npm run dev`

---

*Relatório gerado automaticamente pelo Modo Noturno*
"""
        
        # Salva relatório
        report_path = self.reports_dir / f"report_{cycle_id}.md"
        report_path.write_text(report, encoding="utf-8")
        self.logger.info(f"Relatório salvo: {report_path}")
        
        return str(report_path)
    
    def _format_tasks(self, tasks: List) -> str:
        if not tasks:
            return "- Nenhuma tarefa completada"
        return "\n".join([f"- [x] {t}" for t in tasks])
    
    def _format_files(self, files: List) -> str:
        if not files:
            return "- Nenhum arquivo modificado"
        return "\n".join([f"- `{f}`" for f in files])
    
    def _format_list(self, items: List) -> str:
        if not items:
            return "- Nenhum"
        return "\n".join([f"- {i}" for i in items])


# ═══════════════════════════════════════════════════════════════════════════════
# ORQUESTRADOR PRINCIPAL
# ═══════════════════════════════════════════════════════════════════════════════

class NightModeOrchestrator:
    """Orquestrador principal do Modo Noturno"""
    
    def __init__(self):
        self.project_root = CONFIG["project_root"]
        self.logger = Logger(os.path.join(self.project_root, CONFIG["logs_dir"]))
        
        # Inicializa componentes
        self.git = GitManager(self.project_root, self.logger)
        self.ollama = OllamaClient(self.logger)
        self.claude = ClaudeClient(self.logger)
        self.tests = TestRunner(self.project_root, self.logger)
        self.files = FileManager(self.project_root, self.logger)
        self.reports = ReportGenerator(
            os.path.join(self.project_root, CONFIG["reports_dir"]),
            self.logger
        )
        
        # Estado
        self.cycle_count = 0
        self.last_context = ""
    
    def load_roadmap(self) -> str:
        """Carrega ROADMAP.md"""
        roadmap_path = Path(self.project_root) / "ROADMAP.md"
        if roadmap_path.exists():
            return roadmap_path.read_text(encoding="utf-8")
        return "Nenhum roadmap encontrado"
    
    def load_todo(self) -> List[Dict]:
        """Carrega TODO.yaml"""
        todo_path = Path(self.project_root) / "TODO.yaml"
        if todo_path.exists():
            with open(todo_path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
                return data.get("tasks", []) if data else []
        return []
    
    def save_todo(self, tasks: List[Dict]):
        """Salva TODO.yaml atualizado"""
        todo_path = Path(self.project_root) / "TODO.yaml"
        with open(todo_path, "w", encoding="utf-8") as f:
            yaml.dump({"tasks": tasks}, f, allow_unicode=True)
    
    def check_prerequisites(self) -> bool:
        """Verifica pré-requisitos"""
        self.logger.info("=" * 60)
        self.logger.info("🌙 MODO NOTURNO - VERIFICAÇÃO DE PRÉ-REQUISITOS")
        self.logger.info("=" * 60)
        
        checks = []
        
        # Ollama
        ollama_ok = self.ollama.is_available()
        self.logger.info(f"Ollama: {'✅ OK' if ollama_ok else '❌ FALHA'}")
        checks.append(ollama_ok)
        
        # Claude API
        claude_ok = self.claude.is_available()
        self.logger.info(f"Claude API: {'✅ OK' if claude_ok else '❌ FALHA (sem ANTHROPIC_API_KEY)'}")
        checks.append(claude_ok)
        
        # Projeto existe
        project_ok = Path(self.project_root).exists()
        self.logger.info(f"Projeto: {'✅ OK' if project_ok else '❌ FALHA'}")
        checks.append(project_ok)
        
        # Git
        git_ok, _ = self.git.run_git(["status"])
        self.logger.info(f"Git: {'✅ OK' if git_ok else '❌ FALHA'}")
        checks.append(git_ok)
        
        return all(checks)
    
    def run_cycle(self) -> Dict:
        """Executa um ciclo completo"""
        cycle_id = f"cycle_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.logger.info("=" * 60)
        self.logger.info(f"🔄 INICIANDO CICLO: {cycle_id}")
        self.logger.info("=" * 60)
        
        result = {
            "cycle_id": cycle_id,
            "success": False,
            "tasks_planned": [],
            "tasks_done": [],
            "files_modified": [],
            "tests_passed": False,
            "lint_passed": False,
            "build_passed": False,
            "approved": False,
            "review_score": 0,
            "issues": [],
            "suggestions": [],
            "next_steps": [],
            "test_output": "",
            "build_output": ""
        }
        
        try:
            # 1. Backup
            self.logger.info("📦 Fase 1: Criando backup...")
            backup_hash = self.git.create_backup(cycle_id)
            
            # 2. Carregar roadmap e todo
            self.logger.info("📖 Fase 2: Carregando roadmap e tarefas...")
            roadmap = self.load_roadmap()
            todo = self.load_todo()
            
            # 3. Claude planeja o ciclo
            self.logger.info("🧠 Fase 3: Claude planejando ciclo...")
            plan = self.claude.plan_cycle(roadmap, todo, self.last_context)
            
            if not plan or "cycle_plan" not in plan:
                self.logger.error("Claude não retornou plano válido")
                return result
            
            tasks = plan["cycle_plan"]["tasks"]
            result["tasks_planned"] = [t["title"] for t in tasks]
            self.logger.info(f"Tarefas planejadas: {len(tasks)}")
            
            # 4. Ollama executa cada tarefa
            self.logger.info("🔧 Fase 4: Ollama executando tarefas...")
            files_written = []
            
            for task in tasks:
                self.logger.info(f"  → Executando: {task['title']}")
                
                code_response = self.ollama.generate_code(task)
                if code_response:
                    code_blocks = self.files.parse_code_blocks(code_response)
                    
                    for block in code_blocks:
                        if self.files.write_file(block["path"], block["content"]):
                            files_written.append(block["path"])
                            result["tasks_done"].append(task["title"])
            
            result["files_modified"] = files_written
            self.logger.info(f"Arquivos modificados: {len(files_written)}")
            
            # 5. Rodar testes
            self.logger.info("🧪 Fase 5: Rodando verificações...")
            test_results = self.tests.run_all()
            
            result["tests_passed"] = test_results["tests"]["passed"]
            result["lint_passed"] = test_results["lint"]["passed"]
            result["build_passed"] = test_results["build"]["passed"]
            result["test_output"] = test_results["tests"]["output"]
            result["build_output"] = test_results["build"]["output"]
            
            # 6. Claude revisa
            self.logger.info("🔍 Fase 6: Claude revisando mudanças...")
            diff = self.git.get_diff()
            logs = f"Tests: {result['test_output'][:500]}\nBuild: {result['build_output'][:500]}"
            
            review = self.claude.review_changes(diff, logs, result["tasks_done"])
            
            result["approved"] = review.get("approved", False)
            result["review_score"] = review.get("score", 0)
            result["issues"] = review.get("issues", [])
            result["suggestions"] = review.get("suggestions", [])
            result["next_steps"] = review.get("next_steps", [])
            
            # 7. Commit ou Rollback
            if result["approved"] and test_results["all_passed"]:
                self.logger.success("✅ Ciclo APROVADO! Fazendo commit...")
                self.git.commit_changes(f"🌙 [{cycle_id}] {', '.join(result['tasks_done'][:3])}")
                result["success"] = True
            else:
                self.logger.warn("❌ Ciclo REJEITADO. Fazendo rollback...")
                self.git.rollback(backup_hash)
            
            # 8. Atualizar contexto
            self.last_context = json.dumps({
                "cycle_id": cycle_id,
                "tasks_done": result["tasks_done"],
                "issues": result["issues"]
            })
            
        except Exception as e:
            self.logger.error(f"Erro no ciclo: {e}")
            result["issues"].append(str(e))
        
        # 9. Gerar relatório
        self.logger.info("📝 Fase 9: Gerando relatório...")
        self.reports.generate(cycle_id, result)
        
        return result
    
    def run_night_mode(self, max_cycles: int = None):
        """Executa modo noturno completo"""
        max_cycles = max_cycles or CONFIG["max_cycles_per_night"]
        
        self.logger.info("=" * 60)
        self.logger.info("🌙 MODO NOTURNO INICIADO")
        self.logger.info(f"Projeto: {self.project_root}")
        self.logger.info(f"Máximo de ciclos: {max_cycles}")
        self.logger.info(f"Intervalo: {CONFIG['cycle_interval_minutes']} minutos")
        self.logger.info("=" * 60)
        
        # Verifica pré-requisitos
        if not self.check_prerequisites():
            self.logger.error("Pré-requisitos não atendidos. Abortando.")
            return
        
        # Setup branch noturna
        if not self.git.setup_nightly_branch():
            self.logger.error("Falha ao criar branch noturna. Abortando.")
            return
        
        # Loop principal
        self.cycle_count = 0
        
        while self.cycle_count < max_cycles:
            self.cycle_count += 1
            self.logger.info(f"\n{'='*60}")
            self.logger.info(f"🔄 CICLO {self.cycle_count}/{max_cycles}")
            self.logger.info(f"{'='*60}\n")
            
            # Executa ciclo
            result = self.run_cycle()
            
            # Log resultado
            if result["success"]:
                self.logger.success(f"Ciclo {self.cycle_count} completado com sucesso!")
            else:
                self.logger.warn(f"Ciclo {self.cycle_count} falhou ou foi rejeitado.")
            
            # Aguarda próximo ciclo
            if self.cycle_count < max_cycles:
                wait_seconds = CONFIG["cycle_interval_minutes"] * 60
                self.logger.info(f"⏳ Aguardando {CONFIG['cycle_interval_minutes']} minutos...")
                time.sleep(wait_seconds)
        
        self.logger.info("\n" + "=" * 60)
        self.logger.info("🌙 MODO NOTURNO FINALIZADO")
        self.logger.info(f"Ciclos executados: {self.cycle_count}")
        self.logger.info("=" * 60)


# ═══════════════════════════════════════════════════════════════════════════════
# PONTO DE ENTRADA
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="🌙 Modo Noturno - IA Rimas Brasil")
    parser.add_argument("--cycles", type=int, default=5, help="Número máximo de ciclos")
    parser.add_argument("--single", action="store_true", help="Executar apenas 1 ciclo")
    parser.add_argument("--check", action="store_true", help="Apenas verificar pré-requisitos")
    
    args = parser.parse_args()
    
    orchestrator = NightModeOrchestrator()
    
    if args.check:
        orchestrator.check_prerequisites()
    elif args.single:
        orchestrator.check_prerequisites()
        orchestrator.git.setup_nightly_branch()
        orchestrator.run_cycle()
    else:
        orchestrator.run_night_mode(max_cycles=args.cycles)
