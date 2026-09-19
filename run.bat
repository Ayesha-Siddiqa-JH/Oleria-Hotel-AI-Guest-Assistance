@echo off
title Oleria Hotel - AI-Powered Guest Experience & Concierge
echo ========================================================
echo   OLERIA HOTEL - AI-Powered Guest Experience
echo ========================================================
echo.

cd /d "%~dp0"

echo Freeing port 8000 if occupied by previous instance...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Stopping old process PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo Application will be available at: http://127.0.0.1:8000
echo API Docs will be available at:    http://127.0.0.1:8000/docs
echo.
echo Opening browser...
start http://127.0.0.1:8000

set PYTHONPATH=%~dp0backend
backend\venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --reload
pause
