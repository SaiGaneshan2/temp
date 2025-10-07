# Quick Start Guide

## ⚡ Getting Started in 3 Steps

### Step 1: Get Your Groq API Key
1. Visit https://console.groq.com/keys
2. Sign up or log in
3. Create a new API key
4. Copy the key

### Step 2: Set the API Key

**Option A - Use the setup script (Easiest):**
```powershell
.\setup_api_key.ps1
```

**Option B - Manual setup (Current session only):**
```powershell
$env:GROQ_API_KEY = "your-api-key-here"
```

**Option C - Manual setup (Permanent):**
```powershell
[System.Environment]::SetEnvironmentVariable('GROQ_API_KEY', 'your-api-key-here', 'User')
```
Then restart your terminal.

### Step 3: Run the Server
```powershell
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## 🧪 Testing the API

### With the test script:
```powershell
python test_api.py path\to\your\file.pdf
```

### With cURL:
```powershell
curl -X POST "http://localhost:8000/api/generate-matches" -F "file=@document.pdf"
```

### With PowerShell:
```powershell
$file = Get-Item "document.pdf"
$form = @{
    file = $file
}
Invoke-RestMethod -Uri "http://localhost:8000/api/generate-matches" -Method Post -Form $form
```

## 🔍 Troubleshooting

### Error: "GROQ_API_KEY environment variable is not set"
**Solution:** Follow Step 2 above to set your API key

### Error: "No module named 'fitz'"
**Solution:** Install PyMuPDF
```powershell
pip install pymupdf
```

### Error: "No module named 'fastapi'"
**Solution:** Install all dependencies
```powershell
pip install -r requirements.txt
```

### Port 8000 already in use
**Solution:** Use a different port
```powershell
python -c "from main import app; import uvicorn; uvicorn.run(app, host='0.0.0.0', port=8080)"
```

### API returns error after upload
**Possible causes:**
- PDF has no extractable text (scanned images)
- PDF is corrupted
- Groq API rate limit reached

## 📚 API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🎯 Example Response

```json
{
  "pairs": [
    {
      "term": "API",
      "definition": "Application Programming Interface for software communication"
    },
    {
      "term": "REST",
      "definition": "Representational State Transfer architectural style"
    }
  ]
}
```
