# StayAI One-Click Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  StayAI - AI-Powered Hotel Guest Assistant" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }
Set-Location $scriptDir

$env:PYTHONPATH = "$scriptDir\backend"

Write-Host "Opening browser at http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process "http://127.0.0.1:8000"

Write-Host "Starting unified server on http://127.0.0.1:8000 (Press Ctrl+C to stop)..." -ForegroundColor Yellow
& "$scriptDir\backend\venv\Scripts\python.exe" -m uvicorn app.main:app --port 8000

