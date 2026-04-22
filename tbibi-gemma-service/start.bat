@echo off
echo ========================================
echo   Tbibi Gemma AI Service
echo ========================================
echo.

REM ── Check .env file ─────────────────────────────────────────────────────────
if not exist .env (
    echo [ERROR] .env file not found!
    echo Please copy .env.example to .env and fill in your HuggingFace credentials.
    echo.
    echo    copy .env.example .env
    echo    then edit .env with your HF_TOKEN
    echo.
    pause
    exit /b 1
)

REM ── Check Python ─────────────────────────────────────────────────────────────
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.9-3.11.
    pause
    exit /b 1
)

REM ── Create virtual environment if missing ────────────────────────────────────
if not exist venv (
    echo [SETUP] Creating Python virtual environment...
    python -m venv venv
    echo [SETUP] Installing dependencies (this may take a few minutes)...
    call venv\Scripts\activate.bat
    pip install --upgrade pip
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)

echo.
echo [INFO]  Virtual environment activated
echo [INFO]  Starting Gemma AI service on http://localhost:5000
echo [INFO]  First run will download ~5GB of Gemma weights — please wait...
echo [INFO]  Press Ctrl+C to stop
echo.

python main.py
pause
