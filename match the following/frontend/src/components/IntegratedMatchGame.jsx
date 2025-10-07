import { useState, useEffect, useRef, useMemo } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import Phaser from 'phaser'
import MatchGameScene from '../game/MatchGameScene'
import '../styles/IntegratedGame.css'

function IntegratedMatchGame() {
  const gameRef = useRef(null)
  const phaserGameRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  
  // Worksheet refs
  const termRefs = useRef([])
  const definitionRefs = useRef([])
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  
  // Get quiz data from navigation state
  const quizData = location.state?.pairs
  
  // State for tracking game progress and connections
  const [connections, setConnections] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  
  // Create shuffled definitions
  const shuffledDefinitions = useMemo(() => {
    if (!quizData || quizData.length === 0) return []
    
    const definitions = quizData.map(pair => pair.definition)
    const shuffled = [...definitions]
    
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    return shuffled
  }, [quizData])
  
  // Initialize refs arrays
  useEffect(() => {
    if (quizData) {
      termRefs.current = termRefs.current.slice(0, quizData.length)
      definitionRefs.current = definitionRefs.current.slice(0, quizData.length)
    }
  }, [quizData])
  
  // Redirect to upload page if no data provided
  useEffect(() => {
    if (!quizData || quizData.length === 0) {
      console.error('No quiz data provided. Redirecting to upload page.')
      navigate('/')
    }
  }, [quizData, navigate])
  
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
    connections.forEach(({ termIndex, definitionIndex, isCorrect, start, end }) => {
      const color = isCorrect ? '#28a745' : '#dc3545'
      // If we cached coordinates, use them; else recompute live
      if (start && end) {
        drawCachedLine(start, end, color, 4)
      } else {
        drawLine(termIndex, definitionIndex, color, 4)
      }
    })
  }
  
  // Draw a line using precomputed coordinates
  const drawCachedLine = (start, end, color, width = 4) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { x: startX, y: startY } = start
    const { x: endX, y: endY } = end

    // Control points for smooth curve (reuse bezier style)
    const controlX1 = startX + (endX - startX) * 0.33
    const controlY1 = startY
    const controlX2 = startX + (endX - startX) * 0.67
    const controlY2 = endY

    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, endX, endY)
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.shadowColor = color
    ctx.shadowBlur = 8
    ctx.stroke()
    ctx.shadowBlur = 0

    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(startX, startY, 6, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(endX, endY, 6, 0, Math.PI * 2); ctx.fill()
  }

  // Draw a single line
  const drawLine = (termIndex, definitionIndex, color = '#667eea', width = 4) => {
    const canvas = canvasRef.current
    const termEl = termRefs.current[termIndex]
    const defEl = definitionRefs.current[definitionIndex]
    
    if (!canvas || !termEl || !defEl) {
      console.warn(`Cannot draw line: termIndex=${termIndex}, defIndex=${definitionIndex}, termEl=${!!termEl}, defEl=${!!defEl}`)
      return
    }
    
    const ctx = canvas.getContext('2d')
    const canvasRect = canvas.getBoundingClientRect()
    const termRect = termEl.getBoundingClientRect()
    const defRect = defEl.getBoundingClientRect()
    
    console.log(`Drawing line from Q${termIndex + 1} (y=${termRect.top}) to Ans${definitionIndex} (y=${defRect.top})`)
    
    // Calculate line positions
    const startX = termRect.right - canvasRect.left
    const startY = termRect.top + termRect.height / 2 - canvasRect.top
    const endX = defRect.left - canvasRect.left
    const endY = defRect.top + defRect.height / 2 - canvasRect.top
    
    // Calculate control points for a smooth curve
    const controlX1 = startX + (endX - startX) * 0.33
    const controlY1 = startY
    const controlX2 = startX + (endX - startX) * 0.67
    const controlY2 = endY
    
    // Draw curved line with bezier curve
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, endX, endY)
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.shadowColor = color
    ctx.shadowBlur = 8
    ctx.stroke()
    ctx.shadowBlur = 0
    
    // Draw start circle
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(startX, startY, 6, 0, Math.PI * 2)
    ctx.fill()
    
    // Draw end circle
    ctx.beginPath()
    ctx.arc(endX, endY, 6, 0, Math.PI * 2)
    ctx.fill()
  }
  
  // Redraw lines whenever connections OR question progression changes
  useEffect(() => {
    const timer = setTimeout(() => drawAllLines(), 50)
    return () => clearTimeout(timer)
  }, [connections, currentQuestionIndex])

  // Redraw on scroll (so lines stay anchored when user scrolls the worksheet panel)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const handleScroll = () => {
      // For live-position lines (those without cached coords) redraw
      requestAnimationFrame(drawAllLines)
    }
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Function to be called from Phaser game when answer is shot
  const handleAnswerShot = (shotDefinition, isCorrect) => {
    // Find which definition was shot
    const definitionIndex = shuffledDefinitions.findIndex(def => def === shotDefinition)
    
    if (definitionIndex !== -1) {
      // Cache coordinates at the time of shooting to avoid future layout shifts
      const canvas = canvasRef.current
      const termEl = termRefs.current[currentQuestionIndex]
      const defEl = definitionRefs.current[definitionIndex]
      if (canvas && termEl && defEl) {
        const canvasRect = canvas.getBoundingClientRect()
        const termRect = termEl.getBoundingClientRect()
        const defRect = defEl.getBoundingClientRect()
        const start = {
          x: termRect.right - canvasRect.left,
          y: termRect.top + termRect.height / 2 - canvasRect.top
        }
        const end = {
          x: defRect.left - canvasRect.left,
          y: defRect.top + defRect.height / 2 - canvasRect.top
        }
        const newConnection = {
          termIndex: currentQuestionIndex,
            definitionIndex,
            isCorrect,
            start,
            end
        }
        setConnections(prev => [...prev, newConnection])
      } else {
        // Fallback without cached positions
        const newConnection = { termIndex: currentQuestionIndex, definitionIndex, isCorrect }
        setConnections(prev => [...prev, newConnection])
      }
      
      if (isCorrect) {
        setScore(prev => prev + 1)
      }
      
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }
  
  // Initialize Phaser game with callback
  useEffect(() => {
    if (!quizData || phaserGameRef.current) return

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-game-container',
      backgroundColor: '#1a1a2e',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: [MatchGameScene]
    }

    const game = new Phaser.Game(config)
    phaserGameRef.current = game

    // Pass quiz data and callback to the scene
    const scene = game.scene.start('MatchGameScene', { 
      pairs: quizData,
      onAnswerShot: handleAnswerShot
    })

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
      }
    }
  }, [quizData])
  
  // Helper function to convert index to letter
  const indexToLetter = (index) => {
    return String.fromCharCode(65 + index)
  }
  
  if (!quizData || quizData.length === 0) {
    return null
  }

  return (
    <div className="integrated-game-wrapper">
      <div className="integrated-header">
        <h1 className="game-title">Match the Following</h1>
        <div className="game-stats-bar">
          <span className="stat-item">Question: {currentQuestionIndex + 1} / {quizData.length}</span>
          <span className="stat-item">Score: {score} / {quizData.length}</span>
        </div>
        <p className="game-instructions">
          🎯 Shoot the correct definition to draw a line!
        </p>
      </div>

      <div className="integrated-content">
        {/* Left Side - Phaser Game */}
        <div className="game-section">
          <div id="phaser-game-container" ref={gameRef}></div>
        </div>

        {/* Right Side - Worksheet */}
        <div className="worksheet-section">
          <div className="worksheet-panel">
            <h2 className="worksheet-title">Matching Progress</h2>
            
            <div className="worksheet-content" ref={containerRef}>
              {/* Canvas for drawing lines */}
              <canvas ref={canvasRef} className="drawing-canvas" />
              
              {/* Left Column - Terms */}
              <div className="worksheet-column terms-column">
                <h3 className="column-title">Questions</h3>
                <div className="items-list">
                  {quizData.map((pair, index) => {
                    return (
                      <div
                        key={`term-${index}`}
                        ref={(el) => (termRefs.current[index] = el)}
                        className={`worksheet-item term-item ${
                          index === currentQuestionIndex ? 'active' : ''
                        } ${index < currentQuestionIndex ? 'completed' : ''}`}
                      >
                        <span className="item-number">{index + 1}.</span>
                        <span className="item-text">{pair.term}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Right Column - Definitions (Shuffled) */}
              <div className="worksheet-column definitions-column">
                <h3 className="column-title">Answers</h3>
                <div className="items-list">
                  {shuffledDefinitions.map((definition, index) => {
                    const isConnected = connections.some(conn => conn.definitionIndex === index)
                    const connection = connections.find(conn => conn.definitionIndex === index)
                    
                    return (
                      <div
                        key={`definition-${index}`}
                        ref={(el) => (definitionRefs.current[index] = el)}
                        className={`worksheet-item definition-item ${
                          isConnected ? (connection?.isCorrect ? 'correct' : 'wrong') : ''
                        }`}
                      >
                        <span className="item-letter">{indexToLetter(index)}.</span>
                        <span className="item-text">{definition}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="navigation-footer">
        <Link to="/" className="back-button">
          ← Back to Upload
        </Link>
      </div>
    </div>
  )
}

export default IntegratedMatchGame
