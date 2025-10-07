# Script to run both backend and frontend servers
# Opens two separate PowerShell windows

Write-Host "`n🚀 Starting Match the Following servers...`n" -ForegroundColor Cyan

$currentDir = Get-Location

# Check if API key is set
if (-not $env:GROQ_API_KEY) {
    Write-Host "⚠ Warning: GROQ_API_KEY is not set!" -ForegroundColor Yellow
    Write-Host "Set it with: " -NoNewline
    Write-Host '$env:GROQ_API_KEY = "your-key"' -ForegroundColor White
    Write-Host ""
}

# Start backend in a new window
Write-Host "Starting backend server..." -ForegroundColor Green
$backendScript = @"
`$host.UI.RawUI.WindowTitle = 'Backend Server - Port 8000'
Write-Host 'Backend Server Starting...' -ForegroundColor Cyan
Set-Location '$currentDir'
if (-not `$env:GROQ_API_KEY) {
    Write-Host 'ERROR: GROQ_API_KEY not set!' -ForegroundColor Red
    Write-Host 'Press any key to exit...'
    `$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    exit
}
python main.py
Write-Host 'Press any key to exit...'
`$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

# Wait a moment
Start-Sleep -Seconds 2

# Start frontend in a new window
Write-Host "Starting frontend server..." -ForegroundColor Green
$frontendScript = @"
`$host.UI.RawUI.WindowTitle = 'Frontend Server - Port 3000'
Write-Host 'Frontend Server Starting...' -ForegroundColor Cyan
Set-Location '$currentDir\frontend'
npm run dev
Write-Host 'Press any key to exit...'
`$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

Write-Host "`n✓ Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host "`nBackend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nClose the terminal windows to stop the servers.`n" -ForegroundColor Yellow
