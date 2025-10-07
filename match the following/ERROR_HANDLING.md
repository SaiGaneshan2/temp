# Error Handling and Logging Implementation

## Overview
This document describes the comprehensive error handling and logging system implemented in the `/api/generate-matches` endpoint to diagnose and prevent 500 Internal Server Errors.

## Changes Made

### 1. Added Traceback Module
```python
import traceback
```
- Added to imports at the top of `main.py`
- Enables detailed stack trace logging for all exceptions

### 2. Wrapped Entire Endpoint in Try-Except Block
The entire endpoint logic (after the docstring) is now wrapped in a comprehensive try-except structure:

```python
@app.post("/api/generate-matches", response_model=MatchPairsResponse)
async def generate_matches(file: UploadFile = File(...)):
    try:
        # All endpoint logic here
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected Error in generate_matches endpoint: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing the PDF: {str(e)}"
        )
```

### 3. Enhanced Exception Handling with Traceback

#### JSON Decode Errors
```python
except json.JSONDecodeError as e:
    print(f"JSON Decode Error: {str(e)}")
    traceback.print_exc()
    raise HTTPException(
        status_code=500,
        detail=f"Failed to parse AI response as JSON. Error: {str(e)}"
    )
```

#### Validation Errors
```python
except ValueError as e:
    print(f"Validation Error: {str(e)}")
    traceback.print_exc()
    raise HTTPException(
        status_code=500,
        detail=f"Invalid response format from AI: {str(e)}"
    )
```

#### General Exceptions
```python
except Exception as e:
    print(f"Unexpected Error in generate_matches endpoint: {str(e)}")
    traceback.print_exc()
    raise HTTPException(
        status_code=500,
        detail=f"An error occurred while processing the PDF: {str(e)}"
    )
```

### 4. Added Detailed Logging Throughout Endpoint

#### PDF Processing Logs
```python
print(f"Processing PDF file: {file.filename}")
print(f"PDF file size: {len(pdf_bytes)} bytes")
print(f"Extracted {len(extracted_text)} characters from {page_count} pages")
```

#### Groq API Call Logs
```python
print("Calling Groq API...")
print(f"Received response from Groq API (length: {len(ai_response)} chars)")
print(f"Response preview: {ai_response[:200]}...")
```

#### JSON Parsing Logs
```python
print("Removing markdown code blocks from response")  # If applicable
print("Parsing JSON response...")
print(f"Successfully parsed {len(match_pairs)} pairs from JSON")
```

## Error Handling Flow

```
┌─────────────────────────────────────┐
│  PDF Upload Request                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Try Block Starts                   │
│  ├─ Validate file type (.pdf)       │
│  ├─ Read PDF bytes (log size)       │
│  ├─ Extract text (log char count)   │
│  ├─ Call Groq API (log status)      │
│  ├─ Parse JSON (log success)        │
│  └─ Return validated pairs          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Exception Handling                 │
│  ├─ HTTPException → Re-raise        │
│  ├─ JSONDecodeError → Log + 500     │
│  ├─ ValueError → Log + 500          │
│  └─ Exception → Log + 500           │
└─────────────────────────────────────┘
```

## Benefits

### 1. **Detailed Stack Traces**
- `traceback.print_exc()` prints the complete error stack trace to the console
- Shows exact line numbers and function calls where errors occur
- Makes debugging significantly easier

### 2. **Comprehensive Logging**
- Logs every major step of the process
- File information (name, size)
- Extraction results (character count, page count)
- API call status
- JSON parsing progress

### 3. **Error Context**
- Prints descriptive error messages before stack traces
- Includes error type (JSON Decode, Validation, Unexpected)
- Provides error details in HTTP response

### 4. **No Server Crashes**
- All exceptions are caught and converted to proper HTTP responses
- Server stays running even when errors occur
- Client receives meaningful error messages instead of timeouts

## Debugging Workflow

When a 500 error occurs:

1. **Check Terminal/Console Output**
   - Look for the last print statement to see where the error occurred
   - Example: If you see "Calling Groq API..." but not "Received response...", the error is in the API call

2. **Read the Stack Trace**
   - `traceback.print_exc()` will show the complete error chain
   - Identify the exact line number causing the issue

3. **Check Error Details**
   - The HTTP response includes the error message
   - Example: "Failed to parse AI response as JSON. Error: Expecting value: line 1 column 1 (char 0)"

4. **Common Issues and Solutions**
   - **Empty PDF**: Check if text extraction returned empty string
   - **Groq API Error**: Verify API key is set correctly
   - **JSON Parse Error**: Check if AI response is valid JSON
   - **No valid pairs**: Verify AI returned the correct format

## Testing the Error Handling

To test if error handling is working:

1. **Start the backend**:
   ```bash
   python main.py
   ```

2. **Upload a PDF** and watch the console for log messages

3. **Expected Console Output**:
   ```
   Processing PDF file: example.pdf
   PDF file size: 12345 bytes
   Extracted 2500 characters from 5 pages
   Calling Groq API...
   Received response from Groq API (length: 1234 chars)
   Response preview: [{"term": "Machine Learning", "definition": "..."}]...
   Parsing JSON response...
   Successfully parsed 10 pairs from JSON
   ```

4. **If Error Occurs**, you'll see:
   ```
   Processing PDF file: example.pdf
   PDF file size: 12345 bytes
   Extracted 2500 characters from 5 pages
   Calling Groq API...
   Unexpected Error in generate_matches endpoint: API key not set
   Traceback (most recent call last):
     File "main.py", line XXX, in generate_matches
       ...
   ```

## Next Steps

If you still encounter errors after this implementation:

1. **Check the terminal output** for detailed error messages and stack traces
2. **Verify environment variables**: Make sure `GROQ_API_KEY` is set
3. **Test with a simple PDF**: Try a small, text-based PDF first
4. **Share the stack trace**: If the issue persists, the traceback will show exactly what went wrong

## Environment Variables Required

Make sure these are set before running the server:

```bash
# Windows PowerShell
$env:GROQ_API_KEY="your-api-key-here"

# Or create a .env file (not implemented yet, but recommended):
GROQ_API_KEY=your-api-key-here
```

## Related Files
- `main.py` - Backend server with enhanced error handling
- `INTEGRATION.md` - Overall system integration guide
- `ARCHITECTURE.md` - System architecture documentation
