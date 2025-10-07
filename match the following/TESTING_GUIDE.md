# Testing Guide for Error Handling

## Quick Start

### 1. Start the Backend Server

```powershell
cd "c:\Users\Saiga\Documents\hackathon\match the following"
python main.py
```

**Expected Output:**
```
INFO:     Started server process [XXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### 2. Test the Endpoint

You can test in multiple ways:

#### Option A: Using the Frontend (Recommended)
1. Start the frontend in another terminal:
   ```powershell
   cd frontend
   npm run dev
   ```
2. Open browser to `http://localhost:5173`
3. Upload a PDF file
4. Watch the backend terminal for detailed logs

#### Option B: Using curl (Direct API Test)
```powershell
# Test with a PDF file
curl -X POST "http://localhost:8000/api/generate-matches" `
  -F "file=@test.pdf"
```

#### Option C: Using Python Requests
```python
import requests

with open('test.pdf', 'rb') as f:
    files = {'file': ('test.pdf', f, 'application/pdf')}
    response = requests.post('http://localhost:8000/api/generate-matches', files=files)
    print(response.json())
```

## What to Look For

### Success Case

**Terminal Output:**
```
Processing PDF file: example.pdf
PDF file size: 12345 bytes
Extracted 2500 characters from 5 pages
Calling Groq API...
Received response from Groq API (length: 1234 chars)
Response preview: [{"term": "Machine Learning", "definition": "..."}]...
Parsing JSON response...
Successfully parsed 10 pairs from JSON
INFO:     127.0.0.1:XXXXX - "POST /api/generate-matches HTTP/1.1" 200 OK
```

**HTTP Response:**
```json
{
  "pairs": [
    {
      "term": "Machine Learning",
      "definition": "A subset of AI that enables systems to learn from data"
    },
    // ... 9 more pairs
  ]
}
```

### Error Cases

#### Case 1: Missing API Key

**Terminal Output:**
```
Processing PDF file: example.pdf
PDF file size: 12345 bytes
Extracted 2500 characters from 5 pages
Calling Groq API...
Unexpected Error in generate_matches endpoint: API key not set
Traceback (most recent call last):
  File "c:\Users\Saiga\Documents\hackathon\match the following\main.py", line XXX, in generate_matches
    chat_completion = groq_client.chat.completions.create(
  ...
AttributeError: 'NoneType' object has no attribute 'chat'
```

**Solution:**
```powershell
$env:GROQ_API_KEY="your-api-key-here"
```

#### Case 2: Invalid File Type

**Terminal Output:**
```
INFO:     127.0.0.1:XXXXX - "POST /api/generate-matches HTTP/1.1" 400 Bad Request
```

**HTTP Response:**
```json
{
  "detail": "Invalid file type. Please upload a PDF file."
}
```

#### Case 3: Empty PDF

**Terminal Output:**
```
Processing PDF file: empty.pdf
PDF file size: 1234 bytes
Extracted 0 characters from 1 pages
INFO:     127.0.0.1:XXXXX - "POST /api/generate-matches HTTP/1.1" 400 Bad Request
```

**HTTP Response:**
```json
{
  "detail": "No text could be extracted from the PDF. The file might be empty or contain only images."
}
```

#### Case 4: JSON Parse Error

**Terminal Output:**
```
Processing PDF file: example.pdf
PDF file size: 12345 bytes
Extracted 2500 characters from 5 pages
Calling Groq API...
Received response from Groq API (length: 234 chars)
Response preview: Sorry, I cannot help with that request...
Parsing JSON response...
JSON Decode Error: Expecting value: line 1 column 1 (char 0)
Traceback (most recent call last):
  File "c:\Users\Saiga\Documents\hackathon\match the following\main.py", line XXX, in generate_matches
    match_pairs = json.loads(ai_response)
  ...
json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
```

**Solution:** The AI didn't return valid JSON. Check the response preview to see what went wrong.

## Common Issues

### Issue 1: Server Won't Start

**Error:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**
```powershell
pip install fastapi uvicorn pymupdf groq python-multipart
```

### Issue 2: Port Already in Use

**Error:**
```
OSError: [WinError 10048] Only one usage of each socket address is normally permitted
```

**Solution:**
```powershell
# Find and kill the process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Issue 3: CORS Error in Browser

**Error in Browser Console:**
```
Access to fetch at 'http://localhost:8000/api/generate-matches' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:** This should not happen with current configuration (CORS is set to allow all origins), but if it does:
- Check that the backend server is running
- Verify CORS middleware is configured correctly in `main.py`
- Try restarting both frontend and backend

## Debugging Tips

### 1. Check Environment Variables
```powershell
# Check if GROQ_API_KEY is set
$env:GROQ_API_KEY
```

### 2. Test PDF Extraction Separately
```python
import fitz

with open('test.pdf', 'rb') as f:
    pdf_bytes = f.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    print(f"Extracted {len(text)} characters")
```

### 3. Test Groq API Separately
```python
from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
response = client.chat.completions.create(
    messages=[{"role": "user", "content": "Say hello"}],
    model="llama-3.1-70b-versatile"
)
print(response.choices[0].message.content)
```

### 4. Monitor Network Traffic
- Use browser DevTools (Network tab) to see request/response
- Check request payload (should contain PDF file)
- Check response body (should contain JSON or error message)

## Expected Flow

```
┌─────────────┐
│   Upload    │
│     PDF     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Backend Logs (Terminal)            │
├─────────────────────────────────────┤
│ Processing PDF file: example.pdf    │
│ PDF file size: 12345 bytes          │
│ Extracted 2500 characters...        │
│ Calling Groq API...                 │
│ Received response...                │
│ Parsing JSON response...            │
│ Successfully parsed 10 pairs        │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────┐
│   Success   │
│   Response  │
│   (JSON)    │
└─────────────┘
```

## Performance Notes

- **PDF Processing**: ~1-2 seconds for typical PDFs
- **Groq API Call**: ~2-5 seconds depending on text length
- **JSON Parsing**: < 0.1 seconds
- **Total Expected Time**: 3-7 seconds for complete request

## Next Steps After Testing

1. ✅ Verify error messages are clear and helpful
2. ✅ Confirm stack traces appear in terminal
3. ✅ Test with various PDF types (text, scanned, empty)
4. ✅ Test with different file types (should reject non-PDF)
5. ✅ Verify frontend receives and displays errors properly
6. 🔲 Add rate limiting (if needed)
7. 🔲 Add request logging to file (if needed)
8. 🔲 Set up production monitoring (if deploying)
