@echo off
title StayAI - Hotel Guest Assistant
echo ========================================================
echo   StayAI - AI-Powered Hotel Guest Assistant
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Checking backend environment...
if not exist "backend\venv\Scripts\python.exe" (
    echo Creating virtual environment...
    python -m venv backend\venv
    call backend\venv\Scripts\pip.exe install -r backend\requirements.txt
)

echo [2/2] Starting unified server (Frontend + Backend)...
echo.
echo Application will be available at: http://127.0.0.1:8000
echo API Docs will be available at:    http://127.0.0.1:8000/docs
echo.
echo Opening browser...
start http://127.0.0.1:8000

set PYTHONPATH=%~dp0backend
backend\venv\Scripts\python.exe -m uvicorn app.main:app --port 8000
pause
