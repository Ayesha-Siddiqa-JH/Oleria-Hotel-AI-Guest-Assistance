# Oleria Hotel Unified Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  OLERIA HOTEL - AI-Powered Guest Experience & Concierge" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }
Set-Location $scriptDir

$env:PYTHONPATH = "$scriptDir\backend"

# Ensure port 8000 is clean by stopping any old background instances
$conn = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($conn) {
    foreach ($c in $conn) {
        if ($c.OwningProcess -and $c.OwningProcess -ne $PID) {
            Write-Host "Freeing port 8000 (stopping old server instance PID $($c.OwningProcess))..." -ForegroundColor DarkYellow
            Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Milliseconds 800
}

$port = 8000
Write-Host "Opening browser at http://127.0.0.1:$port ..." -ForegroundColor Green
Start-Process "http://127.0.0.1:$port"

Write-Host "Starting unified server on http://127.0.0.1:$port (Press Ctrl+C to stop)..." -ForegroundColor Yellow
& "$scriptDir\backend\venv\Scripts\python.exe" -m uvicorn app.main:app --port $port --host 127.0.0.1 --reload
