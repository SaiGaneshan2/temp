import { useState, useEffect, useRef, useMemo } from 'react'
import '../styles/MatchWorksheet.css'

function MatchWorksheet({ pairs }) {
  // Refs to store DOM elements for each term and definition
  const termRefs = useRef([])
  const definitionRefs = useRef([])
  
  // Create shuffled definitions on mount (using useMemo to avoid reshuffling on re-renders)
  const shuffledDefinitions = useMemo(() => {
    if (!pairs || pairs.length === 0) return []
    
    // Create a copy of definitions
    const definitions = pairs.map(pair => pair.definition)
    
    // Fisher-Yates shuffle algorithm
    const shuffled = [...definitions]
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
  
  // Helper function to convert index to letter (0 -> A, 1 -> B, etc.)
  const indexToLetter = (index) => {
    return String.fromCharCode(65 + index) // 65 is 'A' in ASCII
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
          Draw lines to connect each term with its correct definition
        </p>
      </div>
      
      <div className="worksheet-content">
        {/* Left Column - Terms */}
        <div className="worksheet-column terms-column">
          <h3 className="column-title">Terms</h3>
          <div className="items-list">
            {pairs.map((pair, index) => (
              <div
                key={`term-${index}`}
                ref={(el) => (termRefs.current[index] = el)}
                className="worksheet-item term-item"
                data-index={index}
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
                className="worksheet-item definition-item"
                data-index={index}
                data-definition={definition}
              >
                <span className="item-letter">{indexToLetter(index)}.</span>
                <span className="item-text">{definition}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="worksheet-footer">
        <button className="check-answers-btn">Check Answers</button>
        <button className="clear-lines-btn">Clear Lines</button>
      </div>
    </div>
  )
}

export default MatchWorksheet
