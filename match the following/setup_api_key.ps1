# Setup script for Groq API Key
# Run this script to set your GROQ_API_KEY environment variable

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "  Groq API Key Setup Script" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if API key is already set
$existingKey = [System.Environment]::GetEnvironmentVariable('GROQ_API_KEY', 'User')
if ($existingKey) {
    Write-Host "Current API Key (User level): $($existingKey.Substring(0, [Math]::Min(10, $existingKey.Length)))..." -ForegroundColor Yellow
    $response = Read-Host "`nDo you want to update it? (y/n)"
    if ($response -ne 'y') {
        Write-Host "`nNo changes made. Exiting..." -ForegroundColor Green
        exit
    }
}

# Prompt for API key
Write-Host "`nGet your API key from: " -NoNewline
Write-Host "https://console.groq.com/keys" -ForegroundColor Blue
Write-Host "`nEnter your Groq API Key: " -NoNewline -ForegroundColor Green
$apiKey = Read-Host

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "`nError: API key cannot be empty!" -ForegroundColor Red
    exit 1
}

# Ask for scope
Write-Host "`nChoose scope:" -ForegroundColor Cyan
Write-Host "  1. Current session only (temporary)"
Write-Host "  2. Current user (permanent)"
Write-Host "  3. Both"
$scope = Read-Host "`nEnter choice (1/2/3)"

switch ($scope) {
    "1" {
        $env:GROQ_API_KEY = $apiKey
        Write-Host "`n✓ API key set for current session!" -ForegroundColor Green
        Write-Host "Note: You'll need to set it again when you open a new terminal." -ForegroundColor Yellow
    }
    "2" {
        [System.Environment]::SetEnvironmentVariable('GROQ_API_KEY', $apiKey, 'User')
        Write-Host "`n✓ API key saved permanently for your user account!" -ForegroundColor Green
        Write-Host "Note: Restart your terminal for the change to take effect." -ForegroundColor Yellow
    }
    "3" {
        $env:GROQ_API_KEY = $apiKey
        [System.Environment]::SetEnvironmentVariable('GROQ_API_KEY', $apiKey, 'User')
        Write-Host "`n✓ API key set for current session and saved permanently!" -ForegroundColor Green
    }
    default {
        Write-Host "`nInvalid choice. No changes made." -ForegroundColor Red
        exit 1
    }
}

# Verify
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Verification:" -ForegroundColor Cyan
Write-Host "  Current session: " -NoNewline
if ($env:GROQ_API_KEY) {
    Write-Host "✓ Set" -ForegroundColor Green
} else {
    Write-Host "✗ Not set" -ForegroundColor Red
}

Write-Host "  User environment: " -NoNewline
$userKey = [System.Environment]::GetEnvironmentVariable('GROQ_API_KEY', 'User')
if ($userKey) {
    Write-Host "✓ Set" -ForegroundColor Green
} else {
    Write-Host "✗ Not set" -ForegroundColor Red
}
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "You can now run: " -NoNewline
Write-Host "python main.py" -ForegroundColor Green
Write-Host ""
