import { useState, useEffect, useRef, useMemo } from 'react'
import '../styles/MatchWorksheet.css'

function MatchWorksheetWithLines({ pairs }) {
  // Refs to store DOM elements for each term and definition
  const termRefs = useRef([])
  const definitionRefs = useRef([])
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  
  // State for tracking connections
  const [connections, setConnections] = useState([]) // Array of {termIndex, definitionIndex}
  const [selectedTerm, setSelectedTerm] = useState(null)
  const [selectedDefinition, setSelectedDefinition] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentLine, setCurrentLine] = useState(null)
  
  // Create shuffled definitions on mount
  const shuffledDefinitions = useMemo(() => {
    if (!pairs || pairs.length === 0) return []
    
    const definitions = pairs.map(pair => pair.definition)
    const shuffled = [...definitions]
    
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    return shuffled
  }, [pairs])
  
  // Initialize refs arrays
  useEffect(() => {
    termRefs.current = termRefs.current.slice(0, pairs.length)
    definitionRefs.current = definitionRefs.current.slice(0, pairs.length)
  }, [pairs])
  
  // Setup canvas size
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current
        const container = containerRef.current
        canvas.width = container.offsetWidth
        canvas.height = container.offsetHeight
        drawAllLines()
      }
    }
    
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [connections])
  
  // Draw all lines on canvas
  const drawAllLines = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw all connections
    connections.forEach(({ termIndex, definitionIndex }) => {
      drawLine(termIndex, definitionIndex, '#667eea', 3)
    })
    
    // Draw current line being drawn
    if (currentLine) {
      drawLine(currentLine.termIndex, currentLine.definitionIndex, '#764ba2', 2, true)
    }
  }
  
  // Draw a single line between term and definition
  const drawLine = (termIndex, definitionIndex, color = '#667eea', width = 3, dashed = false) => {
    const canvas = canvasRef.current
    const termEl = termRefs.current[termIndex]
    const defEl = definitionRefs.current[definitionIndex]
    
    if (!canvas || !termEl || !defEl) return
    
    const ctx = canvas.getContext('2d')
    const canvasRect = canvas.getBoundingClientRect()
    const termRect = termEl.getBoundingClientRect()
    const defRect = defEl.getBoundingClientRect()
    
    // Calculate line positions
    const startX = termRect.right - canvasRect.left
    const startY = termRect.top + termRect.height / 2 - canvasRect.top
    const endX = defRect.left - canvasRect.left
    const endY = defRect.top + defRect.height / 2 - canvasRect.top
    
    // Draw line
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    
    if (dashed) {
      ctx.setLineDash([5, 5])
    } else {
      ctx.setLineDash([])
    }
    
    ctx.stroke()
    
    // Draw endpoints
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(startX, startY, 5, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.beginPath()
    ctx.arc(endX, endY, 5, 0, Math.PI * 2)
    ctx.fill()
  }
  
  // Redraw lines whenever connections change
  useEffect(() => {
    drawAllLines()
  }, [connections, currentLine])
  
  // Handle term click
  const handleTermClick = (index) => {
    if (selectedDefinition !== null) {
      // If a definition is already selected, create connection
      addConnection(index, selectedDefinition)
      setSelectedTerm(null)
      setSelectedDefinition(null)
      setIsDrawing(false)
      setCurrentLine(null)
    } else {
      // Select this term
      setSelectedTerm(index)
      setSelectedDefinition(null)
    }
  }
  
  // Handle definition click
  const handleDefinitionClick = (index) => {
    if (selectedTerm !== null) {
      // If a term is already selected, create connection
      addConnection(selectedTerm, index)
      setSelectedTerm(null)
      setSelectedDefinition(null)
      setIsDrawing(false)
      setCurrentLine(null)
    } else {
      // Select this definition
      setSelectedDefinition(index)
      setSelectedTerm(null)
    }
  }
  
  // Add a connection
  const addConnection = (termIndex, definitionIndex) => {
    // Remove any existing connection with this term or definition
    const filtered = connections.filter(
      conn => conn.termIndex !== termIndex && conn.definitionIndex !== definitionIndex
    )
    setConnections([...filtered, { termIndex, definitionIndex }])
  }
  
  // Clear all connections
  const clearAllLines = () => {
    setConnections([])
    setSelectedTerm(null)
    setSelectedDefinition(null)
    setCurrentLine(null)
  }
  
  // Check answers
  const checkAnswers = () => {
    let correct = 0
    
    connections.forEach(({ termIndex, definitionIndex }) => {
      const term = pairs[termIndex]
      const definition = shuffledDefinitions[definitionIndex]
      
      if (term.definition === definition) {
        correct++
      }
    })
    
    alert(`You got ${correct} out of ${pairs.length} correct!`)
  }
  
  // Helper function to convert index to letter
  const indexToLetter = (index) => {
    return String.fromCharCode(65 + index)
  }
  
  if (!pairs || pairs.length === 0) {
    return (
      <div className="worksheet-container">
        <p className="no-data">No quiz data available</p>
      </div>
    )
  }
  
  return (
    <div className="worksheet-container">
      <div className="worksheet-header">
        <h2>Match the Following</h2>
        <p className="worksheet-instructions">
          Click a term, then click its matching definition to draw a line
        </p>
      </div>
      
      <div className="worksheet-content" ref={containerRef}>
        {/* Canvas for drawing lines */}
        <canvas
          ref={canvasRef}
          className="drawing-canvas"
        />
        
        {/* Left Column - Terms */}
        <div className="worksheet-column terms-column">
          <h3 className="column-title">Terms</h3>
          <div className="items-list">
            {pairs.map((pair, index) => (
              <div
                key={`term-${index}`}
                ref={(el) => (termRefs.current[index] = el)}
                className={`worksheet-item term-item ${selectedTerm === index ? 'selected' : ''}`}
                data-index={index}
                onClick={() => handleTermClick(index)}
              >
                <span className="item-number">{index + 1}.</span>
                <span className="item-text">{pair.term}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right Column - Definitions (Shuffled) */}
        <div className="worksheet-column definitions-column">
          <h3 className="column-title">Definitions</h3>
          <div className="items-list">
            {shuffledDefinitions.map((definition, index) => (
              <div
                key={`definition-${index}`}
                ref={(el) => (definitionRefs.current[index] = el)}
                className={`worksheet-item definition-item ${selectedDefinition === index ? 'selected' : ''}`}
                data-index={index}
                data-definition={definition}
                onClick={() => handleDefinitionClick(index)}
              >
                <span className="item-letter">{indexToLetter(index)}.</span>
                <span className="item-text">{definition}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="worksheet-footer">
        <button className="check-answers-btn" onClick={checkAnswers}>
          Check Answers
        </button>
        <button className="clear-lines-btn" onClick={clearAllLines}>
          Clear Lines
        </button>
      </div>
    </div>
  )
}

export default MatchWorksheetWithLines
