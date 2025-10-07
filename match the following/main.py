from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import fitz  # PyMuPDF
import os
from groq import Groq
import json
import traceback
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
# Make sure to set your GROQ_API_KEY environment variable
api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    print("\n" + "="*60)
    print("ERROR: GROQ_API_KEY environment variable is not set!")
    print("="*60)
    print("\nTo fix this, run ONE of the following commands:\n")
    print("Option 1 - Set for current session:")
    print('  $env:GROQ_API_KEY = "your-api-key-here"')
    print("\nOption 2 - Set permanently:")
    print('  [System.Environment]::SetEnvironmentVariable(\'GROQ_API_KEY\', \'your-api-key-here\', \'User\')')
    print("\nGet your API key from: https://console.groq.com/keys")
    print("="*60 + "\n")
    raise SystemExit("Missing GROQ_API_KEY environment variable")

groq_client = Groq(api_key=api_key)


class MatchPair(BaseModel):
    term: str
    definition: str


class MatchPairsResponse(BaseModel):
    pairs: List[MatchPair]


@app.get("/")
async def root():
    return {"message": "Match the Following API - Upload a PDF to generate matching pairs"}


@app.post("/api/generate-matches", response_model=MatchPairsResponse)
async def generate_matches(file: UploadFile = File(...)):
    """
    Generate match-the-following pairs from an uploaded PDF file.
    
    This endpoint:
    1. Accepts a PDF file upload
    2. Extracts all text from the PDF using PyMuPDF
    3. Sends the text to Groq AI with a specialized prompt
    4. Returns 5 term-definition pairs in JSON format
    """
    
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload a PDF file."
            )
        
        # Read the uploaded PDF file
        print(f"Processing PDF file: {file.filename}")
        pdf_bytes = await file.read()
        print(f"PDF file size: {len(pdf_bytes)} bytes")
        
        # Extract text from PDF using PyMuPDF
        pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
        extracted_text = ""
        page_count = pdf_document.page_count
        
        # Iterate through all pages and extract text
        for page_num in range(page_count):
            page = pdf_document[page_num]
            extracted_text += page.get_text()
        
        pdf_document.close()
        print(f"Extracted {len(extracted_text)} characters from {page_count} pages")
        
        # Check if we extracted any text
        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the PDF. The file might be empty or contain only images."
            )
        
        # Create the system prompt for Groq
        system_prompt = """You are an expert educational content creator specializing in creating "match the following" quiz questions.

Your task is to analyze the provided text and generate exactly 5 high-quality matching pairs that test understanding of key concepts.

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY a valid JSON array
2. Do NOT include any explanatory text, markdown formatting, or code blocks
3. The JSON array must contain exactly 5 objects
4. Each object must have exactly two keys: "term" and "definition"
5. Terms should be concise (1-5 words)
6. Definitions should be clear and specific (5-20 words)
7. Ensure the pairs test different concepts from the text
8. Make sure terms and definitions are distinct enough to avoid ambiguity

Example of the EXACT format required:
[{"term": "Photosynthesis", "definition": "Process by which plants convert light energy into chemical energy"}, {"term": "Mitochondria", "definition": "Organelle responsible for cellular respiration and ATP production"}]

Remember: Respond with ONLY the JSON array, nothing else."""

        # Prepare the user message with extracted text
        user_message = f"Generate 5 match-the-following pairs from this text:\n\n{extracted_text[:4000]}"  # Limit to first 4000 chars to avoid token limits
        
        # Call Groq API
        print("Calling Groq API...")
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            model="llama-3.3-70b-versatile",  # Using the latest supported model
            temperature=0.7,
            max_tokens=2000
        )
        
        # Extract the response
        ai_response = chat_completion.choices[0].message.content.strip()
        print(f"Received response from Groq API (length: {len(ai_response)} chars)")
        print(f"Response preview: {ai_response[:200]}...")
        
        # Parse the JSON response
        try:
            # Remove any potential markdown code blocks if present
            if ai_response.startswith("```"):
                print("Removing markdown code blocks from response")
                ai_response = ai_response.split("```")[1]
                if ai_response.startswith("json"):
                    ai_response = ai_response[4:]
            
            # Parse JSON
            print("Parsing JSON response...")
            match_pairs = json.loads(ai_response)
            print(f"Successfully parsed {len(match_pairs)} pairs from JSON")
            
            # Validate the structure
            if not isinstance(match_pairs, list):
                raise ValueError("Response is not a JSON array")
            
            if len(match_pairs) == 0:
                raise ValueError("No matching pairs generated")
            
            # CRITICAL: Enforce exactly 5 pairs
            if len(match_pairs) > 5:
                print(f"WARNING: AI generated {len(match_pairs)} pairs, limiting to 5")
                match_pairs = match_pairs[:5]
            
            # Validate each pair has the required keys
            validated_pairs = []
            for pair in match_pairs[:5]:  # Ensure we only take 5 pairs
                if not isinstance(pair, dict) or "term" not in pair or "definition" not in pair:
                    continue
                validated_pairs.append(MatchPair(term=pair["term"], definition=pair["definition"]))
            
            if len(validated_pairs) == 0:
                raise ValueError("No valid matching pairs found in response")
            
            # FINAL CHECK: Ensure exactly 5 pairs
            if len(validated_pairs) > 5:
                validated_pairs = validated_pairs[:5]
            
            print(f"Returning {len(validated_pairs)} validated pairs")
            return MatchPairsResponse(pairs=validated_pairs)
            
        except json.JSONDecodeError as e:
            print(f"JSON Decode Error: {str(e)}")
            traceback.print_exc()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse AI response as JSON. Error: {str(e)}"
            )
        except ValueError as e:
            print(f"Validation Error: {str(e)}")
            traceback.print_exc()
            raise HTTPException(
                status_code=500,
                detail=f"Invalid response format from AI: {str(e)}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected Error in generate_matches endpoint: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing the PDF: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
