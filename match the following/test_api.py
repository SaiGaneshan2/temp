"""
Test script for the Match the Following API
This script demonstrates how to call the /api/generate-matches endpoint
"""

import requests
import json
import sys

def test_generate_matches(pdf_path: str, api_url: str = "http://localhost:8000"):
    """
    Test the generate-matches endpoint with a PDF file
    
    Args:
        pdf_path: Path to the PDF file to upload
        api_url: Base URL of the API (default: http://localhost:8000)
    """
    endpoint = f"{api_url}/api/generate-matches"
    
    try:
        # Open and upload the PDF file
        with open(pdf_path, 'rb') as pdf_file:
            files = {'file': (pdf_path.split('\\')[-1], pdf_file, 'application/pdf')}
            
            print(f"Uploading PDF: {pdf_path}")
            print(f"To endpoint: {endpoint}\n")
            
            response = requests.post(endpoint, files=files)
            
            # Check response status
            if response.status_code == 200:
                print("✓ Success! Generated matching pairs:\n")
                data = response.json()
                
                # Display the pairs
                for i, pair in enumerate(data['pairs'], 1):
                    print(f"{i}. Term: {pair['term']}")
                    print(f"   Definition: {pair['definition']}\n")
                
                # Save to file
                output_file = 'generated_matches.json'
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                print(f"✓ Results saved to {output_file}")
                
            else:
                print(f"✗ Error {response.status_code}:")
                print(response.json())
                
    except FileNotFoundError:
        print(f"✗ Error: PDF file not found at {pdf_path}")
    except requests.exceptions.ConnectionError:
        print(f"✗ Error: Could not connect to {api_url}")
        print("Make sure the FastAPI server is running (python main.py)")
    except Exception as e:
        print(f"✗ Unexpected error: {str(e)}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_api.py <path_to_pdf_file>")
        print("Example: python test_api.py sample.pdf")
        sys.exit(1)
    
    pdf_file_path = sys.argv[1]
    test_generate_matches(pdf_file_path)
