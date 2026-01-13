# Backend Server Startup Script
Write-Host "Starting Backend Server..." -ForegroundColor Green
Write-Host ""

cd $PSScriptRoot\backend

$env:MONGODB_URI='mongodb+srv://mfhomnnea_db_user:9YbEo2xUdIIhZZPD@cluster0.lidyutu.mongodb.net/sales_management?retryWrites=true&w=majority'
$env:JWT_SECRET='your_super_secret_jwt_key_here_change_in_production'
$env:JWT_EXPIRE='24h'
$env:NODE_ENV='development'
$env:FRONTEND_URL='http://localhost:5173'
$env:PORT='5001'

Write-Host "Environment variables set" -ForegroundColor Yellow
Write-Host "Starting server on port 5001..." -ForegroundColor Yellow
Write-Host ""

npm run dev

