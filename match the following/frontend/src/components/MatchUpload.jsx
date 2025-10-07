import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function MatchUpload() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
      setError(null)
    } else {
      setSelectedFile(null)
      setError('Please select a valid PDF file')
    }
  }

  // Generate game from PDF
  const handleGenerateGame = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('http://localhost:8000/api/generate-matches', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Failed to generate quiz: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Validate that we have at least 4 pairs (minimum needed for game)
      if (!data.pairs || data.pairs.length < 4) {
        throw new Error('Not enough quiz pairs generated. Need at least 4 pairs.')
      }

      // Navigate to game page with the generated pairs
      navigate('/match-game', { state: { pairs: data.pairs } })

    } catch (err) {
      console.error('Error generating quiz:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  // Use demo data for quick testing
  const handleUseDemoData = () => {
    const demoData = [
      { term: "API", definition: "Application Programming Interface for software communication" },
      { term: "REST", definition: "Representational State Transfer architectural style" },
      { term: "JSON", definition: "JavaScript Object Notation data format" },
      { term: "HTTP", definition: "Hypertext Transfer Protocol for web communication" },
      { term: "Database", definition: "Organized collection of structured information" },
      { term: "Frontend", definition: "Client-side user interface of an application" },
      { term: "Backend", definition: "Server-side logic and data processing" },
      { term: "Framework", definition: "Reusable software platform for development" },
      { term: "Algorithm", definition: "Step-by-step procedure for solving problems" },
      { term: "Debugging", definition: "Process of finding and fixing code errors" }
    ]

    // Navigate to game page with demo data
    navigate('/match-game', { state: { pairs: demoData } })
  }

  return (
    <div className="upload-container">
      <div className="upload-content">
        <h1 className="upload-title">🎯 Match the Following</h1>
        <p className="upload-subtitle">
          Upload a PDF to generate educational quiz questions, then shoot the correct definitions!
        </p>

        <div className="upload-card">
          <div className="upload-icon">📄</div>
          
          <h2 className="upload-card-title">Upload Your PDF</h2>
          <p className="upload-card-description">
            Choose an educational PDF file (textbook, notes, articles, etc.)
          </p>

          {/* File Input */}
          <div className="file-input-wrapper">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="file-input"
              id="pdf-file-input"
              disabled={loading}
            />
            <label htmlFor="pdf-file-input" className="file-input-label">
              {selectedFile ? `📎 ${selectedFile.name}` : '📁 Choose PDF File'}
            </label>
          </div>

          {/* Selected file info */}
          {selectedFile && !loading && (
            <div className="file-info">
              <p className="file-name">✓ {selectedFile.name}</p>
              <p className="file-size">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerateGame}
            disabled={!selectedFile || loading}
            className="generate-button"
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Generating Questions...
              </>
            ) : (
              <>
                🎮 Generate Game
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Divider */}
          <div className="divider">
            <span>OR</span>
          </div>

          {/* Demo Button */}
          <button
            onClick={handleUseDemoData}
            disabled={loading}
            className="demo-button-large"
          >
            🚀 Try Demo (No Upload)
          </button>

          <p className="demo-description">
            Skip the upload and play with pre-loaded programming concepts
          </p>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <h3 className="info-title">How It Works</h3>
          <div className="info-steps">
            <div className="info-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Upload PDF</h4>
                <p>Select any educational PDF document</p>
              </div>
            </div>
            <div className="info-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>AI Generation</h4>
                <p>AI extracts and creates quiz pairs</p>
              </div>
            </div>
            <div className="info-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Play Game</h4>
                <p>Shoot the correct definitions to match terms!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatchUpload
