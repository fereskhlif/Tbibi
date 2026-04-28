@echo off
echo ========================================
echo Service IA - Detection de Fractures
echo ========================================
echo.

REM Verifier si Python est installe
python --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Python n'est pas installe ou pas dans le PATH
    pause
    exit /b 1
)

echo [1/3] Verification des dependances...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo Installation des dependances...
    pip install -r requirements.txt
) else (
    echo Dependances deja installees
)

echo.
echo [2/3] Verification du modele...
if not exist "fracture_model.pt" (
    echo ERREUR: Le fichier fracture_model.pt est introuvable
    pause
    exit /b 1
)
echo Modele trouve: fracture_model.pt

echo.
echo [3/3] Demarrage du service...
echo Service disponible sur: http://localhost:5000
echo.
echo Appuyez sur Ctrl+C pour arreter le service
echo ========================================
echo.

python app.py

pause
