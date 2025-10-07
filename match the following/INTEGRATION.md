# Match the Following - Integration Guide

## 🎯 New Features Implemented

### Backend Integration
- ✅ Fetches quiz data from FastAPI backend (`/api/generate-matches`)
- ✅ PDF upload functionality
- ✅ Demo data option for testing without PDF
- ✅ Loading states and error handling
- ✅ Quiz data validation (minimum 4 pairs required)

### Game Logic
- ✅ Displays current term at the top of the screen
- ✅ Spawns 4 moving targets with definitions (1 correct + 3 distractors)
- ✅ Collision detection between projectiles and targets
- ✅ Correct/incorrect answer validation
- ✅ Score tracking and progression through all pairs
- ✅ Game completion screen with final score
- ✅ Visual feedback (explosions, colors, text)

## 📊 How It Works

### Data Flow
```
1. User uploads PDF (or uses demo data)
   ↓
2. React component fetches data from backend
   POST http://localhost:8000/api/generate-matches
   ↓
3. Backend processes PDF with Groq AI
   Returns: [{ term: "...", definition: "..." }, ...]
   ↓
4. React passes data to Phaser scene
   game.scene.start('MatchGameScene', { pairs: quizData })
   ↓
5. Phaser initializes game with quiz data
   init(data) receives the pairs array
   ↓
6. Game spawns targets and begins gameplay
```

### Game Loop

```
For each pair in the quiz:
  1. Display term at top: "Match: [term]"
  2. Spawn 4 targets moving downward:
     - 1 target with correct definition
     - 3 targets with random wrong definitions
  3. Player shoots targets:
     - Hit correct target → Score++ → Next pair
     - Hit wrong target → Target destroyed → Keep trying
  4. Repeat until all pairs matched
  5. Show completion screen with final score
```

## 🎮 User Experience

### Upload Flow
1. **Landing Page** → Click "Start Game"
2. **Upload Screen** → Choose:
   - Upload PDF (generates custom quiz)
   - Use Demo Data (instant play)
3. **Loading** → Shows spinner while backend generates questions
4. **Game Starts** → Phaser canvas appears with quiz data

### Gameplay
1. **Aim**: Mouse automatically rotates turret
2. **Shoot**: Left-click fires projectile
3. **Match**: Hit the correct definition target
4. **Feedback**: 
   - ✓ Green "Correct!" + explosion
   - ✗ Red "Wrong! Try again" + explosion
5. **Progress**: Score updates, new term appears
6. **Complete**: Final score screen with replay option

## 🔧 Technical Implementation

### React Component (MatchGameLauncher.jsx)

**State Management:**
```javascript
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)
const [quizData, setQuizData] = useState(null)
const [pdfFile, setPdfFile] = useState(null)
```

**Key Functions:**
- `fetchQuizData(file)` - Uploads PDF to backend
- `handleFileUpload(event)` - Handles file input
- `useDemoData()` - Loads hardcoded demo pairs
- `useEffect()` - Initializes Phaser when data ready

**Data Passing:**
```javascript
game.scene.start('MatchGameScene', { pairs: quizData })
```

### Phaser Scene (MatchGameScene.js)

**Initialization:**
```javascript
init(data) {
  this.pairs = data.pairs
  this.currentPairIndex = 0
  this.score = 0
}
```

**Key Methods:**

| Method | Purpose |
|--------|---------|
| `createUI()` | Creates term display, score, feedback text |
| `createTargetTexture()` | Generates blue rounded rectangle sprite |
| `spawnTargetsForCurrentPair()` | Creates 4 targets with definitions |
| `getRandomIncorrectDefinitions(count)` | Selects 3 wrong answers |
| `handleCollision(projectile, target)` | Processes hits |
| `handleCorrectAnswer(target)` | Score++, next pair |
| `handleWrongAnswer(target)` | Destroys wrong target |
| `handleGameComplete()` | Shows final score screen |

**Collision System:**
```javascript
this.physics.add.overlap(
  this.projectiles,
  this.targets,
  this.handleCollision,
  null,
  this
)
```

**Target Data Structure:**
```javascript
target.definitionText = "The actual definition text"
target.isCorrect = true/false
target.textObject = Phaser.Text (follows target position)
```

## 📝 JSON Structure

**Request to Backend:**
```javascript
POST /api/generate-matches
Content-Type: multipart/form-data

FormData {
  file: [PDF File]
}
```

**Response from Backend:**
```json
{
  "pairs": [
    {
      "term": "API",
      "definition": "Application Programming Interface for software communication"
    },
    {
      "term": "REST",
      "definition": "Representational State Transfer architectural style"
    }
    // ... up to 10 pairs
  ]
}
```

**Passed to Phaser:**
```javascript
{
  pairs: [
    { term: "...", definition: "..." },
    { term: "...", definition: "..." }
  ]
}
```

## 🎨 Visual Feedback

### Correct Answer
- ✅ Green text: "✓ Correct!"
- 💚 Green particle explosion
- 📈 Score increments
- 🎯 New term appears after 1 second

### Wrong Answer
- ❌ Red text: "✗ Wrong! Try again"
- 💔 Red particle explosion
- 🎯 Target destroyed, others remain
- 🔄 Player can keep trying

### Game Complete
- 🎉 Large completion message
- 📊 Final score display
- 🔄 "Click to Play Again" button
- ✨ Hover effects on restart button

## 🚀 Running the Complete System

### Terminal 1 - Backend
```powershell
# Make sure API key is set
$env:GROQ_API_KEY = "your-key-here"
python main.py
```

### Terminal 2 - Frontend
```powershell
cd frontend
npm run dev
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🧪 Testing

### Test with Demo Data
1. Go to http://localhost:3000
2. Click "Start Game"
3. Click "🎮 Use Demo Data"
4. Game starts immediately with 10 programming pairs

### Test with PDF
1. Go to http://localhost:3000
2. Click "Start Game"
3. Click "📄 Choose PDF File"
4. Select any educational PDF
5. Wait for processing (shows loading spinner)
6. Game starts with generated pairs

## 🐛 Error Handling

### Frontend Errors
- **No quiz data**: Shows error message with retry button
- **API failure**: Displays error from backend
- **Invalid PDF**: Shows validation error
- **< 4 pairs**: Error message about minimum pairs needed

### Game Errors
- **No pairs loaded**: Shows error in game canvas
- **Target off-screen**: Automatically respawns at top
- **Projectile off-screen**: Automatically cleaned up

## 🔮 Game Mechanics

### Target Spawning
- 4 targets per term
- Start above screen at y = -50 to -100
- Spaced 180px apart horizontally
- Fall at 80px/second
- Respawn at top if they reach bottom

### Scoring
- +1 point for each correct match
- No penalty for wrong answers
- Final score = correct matches / total pairs
- Display format: "Score: X / Y"

### Progression
- Linear progression through pairs array
- Current index tracked: `this.currentPairIndex`
- After correct match → increment index → spawn new targets
- After last pair → show completion screen

## 📊 Performance Optimizations

1. **Object Pooling**: Projectiles reused from pool (max 50)
2. **Auto-Cleanup**: Off-screen projectiles destroyed
3. **Target Recycling**: Targets respawn instead of creating new ones
4. **Text Updates**: Text position updated in update() loop
5. **Tween Limits**: Explosion particles auto-destroy after animation

## 🎯 Game Balance

Current settings:
- `projectileSpeed: 500` - Fast enough to hit targets
- `targetSpeed: 80` - Slow enough to read and aim
- `targetSpacing: 180` - Enough space between targets
- `projectileLifetime: 3000ms` - 3 seconds before auto-destroy

Adjust these in `MatchGameScene.js` constructor for difficulty tuning.

## 🌟 Key Features Summary

✅ **Backend Integration**: Fetches real quiz data from FastAPI
✅ **PDF Processing**: Uploads and processes PDF files with Groq
✅ **Demo Mode**: Instant play without PDF upload
✅ **4-Choice Quiz**: 1 correct + 3 distractors per question
✅ **Collision Detection**: Arcade physics overlap detection
✅ **Answer Validation**: Checks if hit target is correct
✅ **Visual Feedback**: Colors, explosions, text feedback
✅ **Score Tracking**: Running score display
✅ **Game Progression**: Auto-advances through all pairs
✅ **Completion Screen**: Final score + replay option
✅ **Error Handling**: Graceful fallbacks and user feedback
✅ **Loading States**: Spinner during backend processing
✅ **Responsive UI**: Upload buttons, file input, status messages

The game now has complete quiz functionality with backend integration! 🚀
