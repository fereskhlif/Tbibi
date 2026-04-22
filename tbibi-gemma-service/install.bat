@echo off
echo ============================================================
echo  Tbibi AI Service — Installing GGUF dependencies
echo ============================================================
echo.

:: Activate venv if it exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo [OK] Virtual environment activated
) else (
    echo [INFO] No venv found — installing to system Python
)

echo.
echo [1/3] Upgrading pip...
python -m pip install --upgrade pip --quiet

echo.
echo [2/3] Installing FastAPI + server deps...
pip install fastapi==0.115.0 uvicorn[standard]==0.30.6 python-dotenv==1.0.1 huggingface_hub>=0.27.0 --quiet
echo [OK] Server deps installed

echo.
echo [3/3] Installing llama-cpp-python (pre-built CPU wheel)...
echo       This is the fast GGUF inference engine — no compiler needed.
pip install llama-cpp-python --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu --quiet

if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Pre-built wheel failed — trying standard install...
    echo        If this fails, install Visual C++ Build Tools from:
    echo        https://visualstudio.microsoft.com/visual-cpp-build-tools/
    pip install llama-cpp-python --quiet
)

echo.
echo ============================================================
echo  Installation complete!
echo  Run:  python main.py
echo ============================================================
pause
