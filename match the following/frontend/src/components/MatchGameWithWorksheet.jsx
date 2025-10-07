import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import Phaser from 'phaser'
import MatchGameScene from '../game/MatchGameScene'
import MatchWorksheetWithLines from './MatchWorksheetWithLines'
import '../styles/GameWithWorksheet.css'

function MatchGameWithWorksheet() {
  const gameRef = useRef(null)
  const phaserGameRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState('game') // 'game' or 'worksheet'

  // Get quiz data from navigation state
  const quizData = location.state?.pairs

  // Redirect to upload page if no data provided
  useEffect(() => {
    if (!quizData || quizData.length === 0) {
      console.error('No quiz data provided. Redirecting to upload page.')
      navigate('/')
    }
  }, [quizData, navigate])

  // Initialize Phaser game once we have quiz data
  useEffect(() => {
    if (!quizData || phaserGameRef.current || activeView !== 'game') return

    // Phaser game configuration
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

    // Initialize the Phaser game with quiz data
    const game = new Phaser.Game(config)
    phaserGameRef.current = game

    // Pass quiz data to the scene when it starts
    game.scene.start('MatchGameScene', { pairs: quizData })

    // Cleanup function to destroy the game when component unmounts
    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
      }
    }
  }, [quizData, activeView])

  // Don't render if no data
  if (!quizData || quizData.length === 0) {
    return null
  }

  return (
    <div className="game-wrapper">
      <div className="game-header">
        <h1 className="game-title">Match the Following</h1>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${activeView === 'game' ? 'active' : ''}`}
            onClick={() => setActiveView('game')}
          >
            🎮 Shooting Game
          </button>
          <button 
            className={`toggle-btn ${activeView === 'worksheet' ? 'active' : ''}`}
            onClick={() => setActiveView('worksheet')}
          >
            📝 Worksheet
          </button>
        </div>
      </div>

      <div className="content-area">
        {activeView === 'game' ? (
          <div className="game-view">
            <p className="game-instructions">
              🎯 Shoot the correct definition | 💯 Match all terms to win!
            </p>
            <div id="phaser-game-container" ref={gameRef}></div>
          </div>
        ) : (
          <div className="worksheet-view">
            <MatchWorksheetWithLines pairs={quizData} />
          </div>
        )}
      </div>

      <div className="navigation-footer">
        <Link to="/" className="back-button">
          ← Back to Upload
        </Link>
        <div className="game-stats">
          <span>Total Pairs: {quizData.length}</span>
        </div>
      </div>
    </div>
  )
}

export default MatchGameWithWorksheet
