# Match the Following - PDF to Quiz Pairs Generator

A FastAPI backend service that reads PDF files and uses Groq AI to generate "match the following" quiz pairs.

## Features

- Upload PDF files via REST API
- Automatic text extraction from PDFs using PyMuPDF
- AI-powered generation of educational matching pairs using Groq
- Returns structured JSON with term-definition pairs

## Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

   Or install individually:
   ```bash
   pip install fastapi uvicorn python-multipart groq pymupdf pydantic
   ```

2. **Set up your Groq API key:**
   - Get your API key from [Groq Console](https://console.groq.com)
   - Create a `.env` file or set environment variable:
     ```bash
     # Windows PowerShell
     $env:GROQ_API_KEY = "your-api-key-here"
     
     # Windows CMD
     set GROQ_API_KEY=your-api-key-here
     ```

## Running the Server

```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload
```

The server will start at `http://localhost:8000`

## API Endpoints

### GET `/`
Health check endpoint.

**Response:**
```json
{
  "message": "Match the Following API - Upload a PDF to generate matching pairs"
}
```

### POST `/api/generate-matches`
Generate matching pairs from an uploaded PDF.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: PDF file (form field name: `file`)

**Response:**
```json
{
  "pairs": [
    {
      "term": "Mitochondria",
      "definition": "The powerhouse of the cell"
    },
    {
      "term": "Photosynthesis",
      "definition": "Process by which plants convert light energy into chemical energy"
    }
    // ... up to 10 pairs
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Invalid file type or no text extracted
- `500 Internal Server Error`: Processing or AI generation error

## Testing with cURL

```bash
curl -X POST "http://localhost:8000/api/generate-matches" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/document.pdf"
```

## Testing with Python

```python
import requests

url = "http://localhost:8000/api/generate-matches"
files = {"file": open("document.pdf", "rb")}
response = requests.post(url, files=files)
print(response.json())
```

## Project Structure

```
.
├── main.py              # FastAPI application with PDF processing endpoint
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## How It Works

1. **File Upload**: Client uploads a PDF file to the `/api/generate-matches` endpoint
2. **Text Extraction**: PyMuPDF (fitz) extracts all text content from the PDF
3. **AI Processing**: Extracted text is sent to Groq AI with a specialized prompt
4. **JSON Generation**: Groq generates exactly 10 term-definition pairs in JSON format
5. **Response**: The structured data is validated and returned to the client

## Technologies Used

- **FastAPI**: Modern, fast web framework for building APIs
- **PyMuPDF (fitz)**: High-performance PDF text extraction
- **Groq**: Fast AI inference for content generation
- **Pydantic**: Data validation using Python type annotations
