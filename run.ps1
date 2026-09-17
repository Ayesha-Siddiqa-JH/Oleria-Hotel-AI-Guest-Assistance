# StayAI One-Click Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  StayAI — AI-Powered Hotel Guest Assistant" -ForegroundColor Gold
Write-Host "========================================================" -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$env:PYTHONPATH = "$root\backend"

Write-Host "`nOpening browser at http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process "http://127.0.0.1:8000"

Write-Host "Starting unified server on http://127.0.0.1:8000 (Press Ctrl+C to stop)...`n" -ForegroundColor Yellow
& "$root\backend\venv\Scripts\python.exe" -m uvicorn app.main:app --port 8000
