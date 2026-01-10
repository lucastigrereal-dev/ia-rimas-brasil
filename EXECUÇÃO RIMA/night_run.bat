@echo off
REM ═══════════════════════════════════════════════════════════════════════════════
REM 🌙 MODO NOTURNO - IA RIMAS BRASIL
REM Script de Inicialização para Windows CMD
REM ═══════════════════════════════════════════════════════════════════════════════

setlocal EnableDelayedExpansion

REM Cores para output (Windows 10+)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

echo.
echo %BLUE%═══════════════════════════════════════════════════════════════════%RESET%
echo %BLUE%        🌙 MODO NOTURNO - IA RIMAS BRASIL                         %RESET%
echo %BLUE%═══════════════════════════════════════════════════════════════════%RESET%
echo.

REM ═══════════════════════════════════════════════════════════════════════════════
REM CONFIGURAÇÕES - EDITE AQUI
REM ═══════════════════════════════════════════════════════════════════════════════

REM Caminho do projeto
set "PROJECT_ROOT=C:\Users\lucas\webapp"

REM Número de ciclos (0 = infinito até CTRL+C)
set "MAX_CYCLES=5"

REM Modelo do Ollama
set "OLLAMA_MODEL=codellama:13b"

REM Branch noturna
set "NIGHTLY_BRANCH=nightly-bot"

REM ═══════════════════════════════════════════════════════════════════════════════
REM VERIFICAÇÕES PRÉ-REQUISITOS
REM ═══════════════════════════════════════════════════════════════════════════════

echo %YELLOW%[1/6] Verificando pre-requisitos...%RESET%
echo.

REM Verifica Python
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[ERRO] Python nao encontrado!%RESET%
    echo Instale Python 3.10+ de https://python.org
    goto :error
)
echo %GREEN%[OK] Python encontrado%RESET%

REM Verifica Git
git --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[ERRO] Git nao encontrado!%RESET%
    echo Instale Git de https://git-scm.com
    goto :error
)
echo %GREEN%[OK] Git encontrado%RESET%

REM Verifica Ollama
curl -s http://localhost:11434/api/tags >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[ERRO] Ollama nao esta rodando!%RESET%
    echo Execute: ollama serve
    goto :error
)
echo %GREEN%[OK] Ollama rodando%RESET%

REM Verifica projeto existe
if not exist "%PROJECT_ROOT%" (
    echo %RED%[ERRO] Projeto nao encontrado em %PROJECT_ROOT%%RESET%
    goto :error
)
echo %GREEN%[OK] Projeto encontrado%RESET%

REM Verifica ANTHROPIC_API_KEY
if "%ANTHROPIC_API_KEY%"=="" (
    echo %YELLOW%[AVISO] ANTHROPIC_API_KEY nao configurada%RESET%
    echo Claude nao fara revisoes automaticas.
    echo Configure com: set ANTHROPIC_API_KEY=sk-ant-...
    echo.
    set /p "CONTINUE=Continuar sem Claude? (S/N): "
    if /i not "!CONTINUE!"=="S" goto :end
)
echo %GREEN%[OK] API Key configurada%RESET%

echo.

REM ═══════════════════════════════════════════════════════════════════════════════
REM SETUP AMBIENTE
REM ═══════════════════════════════════════════════════════════════════════════════

echo %YELLOW%[2/6] Configurando ambiente...%RESET%

REM Vai para o diretório do projeto
cd /d "%PROJECT_ROOT%"

REM Exporta variáveis de ambiente
set "PROJECT_ROOT=%PROJECT_ROOT%"
set "OLLAMA_MODEL=%OLLAMA_MODEL%"

echo %GREEN%[OK] Ambiente configurado%RESET%
echo.

REM ═══════════════════════════════════════════════════════════════════════════════
REM SETUP GIT
REM ═══════════════════════════════════════════════════════════════════════════════

echo %YELLOW%[3/6] Configurando Git...%RESET%

REM Salva trabalho atual
git stash push -m "nightmode_backup_%DATE:~-4%%DATE:~3,2%%DATE:~0,2%" >nul 2>&1

REM Vai para main e atualiza
git checkout main >nul 2>&1
git pull origin main >nul 2>&1

REM Cria/atualiza branch noturna
git checkout -B %NIGHTLY_BRANCH% >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo %RED%[ERRO] Falha ao criar branch %NIGHTLY_BRANCH%%RESET%
    goto :error
)

echo %GREEN%[OK] Branch %NIGHTLY_BRANCH% pronta%RESET%
echo.

REM ═══════════════════════════════════════════════════════════════════════════════
REM INSTALA DEPENDÊNCIAS PYTHON
REM ═══════════════════════════════════════════════════════════════════════════════

echo %YELLOW%[4/6] Verificando dependencias Python...%RESET%

pip show requests >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Instalando requests...
    pip install requests -q
)

pip show pyyaml >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Instalando pyyaml...
    pip install pyyaml -q
)

echo %GREEN%[OK] Dependencias OK%RESET%
echo.

REM ═══════════════════════════════════════════════════════════════════════════════
REM CRIA ESTRUTURA DE DIRETORIOS
REM ═══════════════════════════════════════════════════════════════════════════════

echo %YELLOW%[5/6] Criando estrutura de diretorios...%RESET%

if not exist "nightmode" mkdir nightmode
if not exist "nightmode\reports" mkdir nightmode\reports
if not exist "nightmode\backups" mkdir nightmode\backups
if not exist "nightmode\logs" mkdir nightmode\logs

echo %GREEN%[OK] Diretorios criados%RESET%
echo.

REM ═══════════════════════════════════════════════════════════════════════════════
REM INICIA ORQUESTRADOR
REM ═══════════════════════════════════════════════════════════════════════════════

echo %YELLOW%[6/6] Iniciando Modo Noturno...%RESET%
echo.
echo %BLUE%═══════════════════════════════════════════════════════════════════%RESET%
echo %BLUE%                    MODO NOTURNO ATIVO                            %RESET%
echo %BLUE%═══════════════════════════════════════════════════════════════════%RESET%
echo.
echo Projeto: %PROJECT_ROOT%
echo Branch: %NIGHTLY_BRANCH%
echo Ciclos: %MAX_CYCLES%
echo Modelo: %OLLAMA_MODEL%
echo.
echo Pressione CTRL+C para parar.
echo.
echo %BLUE%═══════════════════════════════════════════════════════════════════%RESET%
echo.

REM Executa o orquestrador Python
python nightmode\orchestrator.py --cycles %MAX_CYCLES%

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo %RED%[ERRO] Orquestrador terminou com erro%RESET%
    goto :error
)

echo.
echo %GREEN%═══════════════════════════════════════════════════════════════════%RESET%
echo %GREEN%        🌙 MODO NOTURNO FINALIZADO COM SUCESSO                    %RESET%
echo %GREEN%═══════════════════════════════════════════════════════════════════%RESET%
echo.
echo Relatorios salvos em: nightmode\reports\
echo Logs salvos em: nightmode\logs\
echo.
echo Para ver mudancas: git log --oneline -10
echo Para merge: git checkout main ^&^& git merge %NIGHTLY_BRANCH%
echo.

goto :end

REM ═══════════════════════════════════════════════════════════════════════════════
REM TRATAMENTO DE ERRO
REM ═══════════════════════════════════════════════════════════════════════════════

:error
echo.
echo %RED%═══════════════════════════════════════════════════════════════════%RESET%
echo %RED%        ❌ MODO NOTURNO ABORTADO                                   %RESET%
echo %RED%═══════════════════════════════════════════════════════════════════%RESET%
echo.
echo Verifique os erros acima e tente novamente.
echo.
pause
exit /b 1

REM ═══════════════════════════════════════════════════════════════════════════════
REM FIM
REM ═══════════════════════════════════════════════════════════════════════════════

:end
echo.
pause
exit /b 0
