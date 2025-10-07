import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import MatchUpload from './components/MatchUpload'
import IntegratedMatchGame from './components/IntegratedMatchGame'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MatchUpload />} />
          <Route path="/match-game" element={<IntegratedMatchGame />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
