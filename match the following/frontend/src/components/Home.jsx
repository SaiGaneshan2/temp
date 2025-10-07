import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">🎯 Match the Following</h1>
      <p className="home-subtitle">
        Shoot terms to match them with their definitions in this exciting shooting game!
      </p>
      <Link to="/game" className="start-button">
        Start Game
      </Link>
    </div>
  )
}

export default Home
