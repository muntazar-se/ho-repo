# Frontend Server Startup Script
Write-Host "Starting Frontend Server..." -ForegroundColor Green
Write-Host ""

cd $PSScriptRoot\frontend

$env:VITE_API_URL='http://localhost:5001/api'

Write-Host "Environment variables set" -ForegroundColor Yellow
Write-Host "Starting server on port 5173..." -ForegroundColor Yellow
Write-Host ""

npm run dev

