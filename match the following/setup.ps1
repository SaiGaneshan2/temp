# Quick Setup Script for Match the Following Game
# This script will help you set up both backend and frontend

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Match the Following - Setup Wizard" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$currentDir = Get-Location

# Step 1: Check Python
Write-Host "Step 1: Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Step 2: Check Node.js
Write-Host "`nStep 2: Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "  ✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found! Please install Node.js 16+" -ForegroundColor Red
    exit 1
}

# Step 3: Install Backend Dependencies
Write-Host "`nStep 3: Installing backend dependencies..." -ForegroundColor Yellow
try {
    pip install -r requirements.txt
    Write-Host "  ✓ Backend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed to install backend dependencies" -ForegroundColor Red
}

# Step 4: Install Frontend Dependencies
Write-Host "`nStep 4: Installing frontend dependencies..." -ForegroundColor Yellow
try {
    Set-Location "frontend"
    npm install
    Write-Host "  ✓ Frontend dependencies installed" -ForegroundColor Green
    Set-Location $currentDir
} catch {
    Write-Host "  ✗ Failed to install frontend dependencies" -ForegroundColor Red
    Set-Location $currentDir
}

# Step 5: Check for Groq API Key
Write-Host "`nStep 5: Checking Groq API key..." -ForegroundColor Yellow
$apiKey = $env:GROQ_API_KEY
if (-not $apiKey) {
    $envFile = ".env"
    if (Test-Path $envFile) {
        $content = Get-Content $envFile | Select-String "GROQ_API_KEY"
        if ($content) {
            Write-Host "  ✓ API key found in .env file" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ API key not found in .env file" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠ No .env file found and GROQ_API_KEY not set" -ForegroundColor Yellow
    }
    Write-Host "`n  To set API key, run:" -ForegroundColor Cyan
    Write-Host '    $env:GROQ_API_KEY = "your-key-here"' -ForegroundColor White
    Write-Host "  Get your key from: https://console.groq.com/keys" -ForegroundColor Cyan
} else {
    Write-Host "  ✓ API key is set in environment" -ForegroundColor Green
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "To start the backend server:" -ForegroundColor Yellow
Write-Host "  python main.py" -ForegroundColor White

Write-Host "`nTo start the frontend (in a new terminal):" -ForegroundColor Yellow
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White

Write-Host "`nOr use the run script:" -ForegroundColor Yellow
Write-Host "  .\run_both.ps1" -ForegroundColor White

Write-Host "`nHappy coding! 🎮`n" -ForegroundColor Green
