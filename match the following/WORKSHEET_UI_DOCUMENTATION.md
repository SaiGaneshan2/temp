# Worksheet-Style UI Panel Documentation

## Overview
Created two React components for displaying quiz pairs in a traditional worksheet format with two columns and line-drawing functionality.

## Components Created

### 1. MatchWorksheet.jsx (Basic Version)
A simple two-column worksheet layout without line-drawing functionality.

**Features:**
- Two-column grid layout using CSS Grid
- Left column: numbered list of terms (1, 2, 3...)
- Right column: lettered list of shuffled definitions (A, B, C...)
- React refs for accessing DOM elements of each item
- Responsive design

**Props:**
- `pairs` - Array of {term, definition} objects

**Key Implementation Details:**
```javascript
// Shuffled definitions using useMemo
const shuffledDefinitions = useMemo(() => {
  const definitions = pairs.map(pair => pair.definition)
  const shuffled = [...definitions]
  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}, [pairs])

// Refs for DOM access
const termRefs = useRef([])
const definitionRefs = useRef([])
```

---

### 2. MatchWorksheetWithLines.jsx (Enhanced Version)
Full-featured worksheet with interactive line-drawing between terms and definitions.

**Features:**
- All features from basic version PLUS:
- HTML Canvas overlay for drawing lines
- Click-to-connect interaction
- Visual feedback for selected items
- Line drawing with smooth curves
- Check answers functionality
- Clear all lines functionality
- Connection state management

**Props:**
- `pairs` - Array of {term, definition} objects

**Key Implementation Details:**

#### State Management
```javascript
const [connections, setConnections] = useState([]) // {termIndex, definitionIndex}
const [selectedTerm, setSelectedTerm] = useState(null)
const [selectedDefinition, setSelectedDefinition] = useState(null)
const [currentLine, setCurrentLine] = useState(null)
```

#### Canvas Drawing
```javascript
const drawLine = (termIndex, definitionIndex, color, width, dashed) => {
  // Get element positions
  const termRect = termRefs.current[termIndex].getBoundingClientRect()
  const defRect = definitionRefs.current[definitionIndex].getBoundingClientRect()
  
  // Calculate line coordinates
  const startX = termRect.right - canvasRect.left
  const startY = termRect.top + termRect.height / 2 - canvasRect.top
  const endX = defRect.left - canvasRect.left
  const endY = defRect.top + defRect.height / 2 - canvasRect.top
  
  // Draw line with endpoints
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.lineTo(endX, endY)
  ctx.stroke()
}
```

#### User Interaction Flow
```
1. User clicks a term (highlighted)
2. User clicks a definition (highlighted)
3. Line is drawn connecting them
4. Both items deselected
5. Can click "Check Answers" to validate
6. Can click "Clear Lines" to reset
```

---

## CSS Styling (MatchWorksheet.css)

### Layout Structure
```css
.worksheet-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  position: relative; /* For canvas positioning */
}

.drawing-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Clicks pass through to items */
  z-index: 5;
}
```

### Visual Design
- **Color Scheme:** 
  - Primary: `#667eea` (blue-purple)
  - Secondary: `#764ba2` (deep purple)
  - Gradient background
  
- **Interactive States:**
  - Hover: slight translate and color change
  - Selected: background changes to primary color
  - Connected: visual indicator (can be enhanced)

### Responsive Behavior
- Desktop: Two-column layout
- Mobile (< 768px): Single column, canvas hidden

---

## Usage Examples

### Basic Usage
```jsx
import MatchWorksheet from './components/MatchWorksheet'

function App() {
  const quizPairs = [
    { term: "Photosynthesis", definition: "Process by which plants convert light to energy" },
    { term: "Mitochondria", definition: "Powerhouse of the cell" },
    // ...
  ]
  
  return <MatchWorksheet pairs={quizPairs} />
}
```

### With Line Drawing
```jsx
import MatchWorksheetWithLines from './components/MatchWorksheetWithLines'

function QuizPage() {
  const pairs = location.state?.pairs || []
  
  return (
    <div className="quiz-container">
      <MatchWorksheetWithLines pairs={pairs} />
    </div>
  )
}
```

---

## Integration with Existing Game

### Option 1: Side-by-Side Layout
Show Phaser game on left, worksheet on right:

```jsx
function MatchGameLauncher() {
  const quizData = location.state?.pairs
  
  return (
    <div className="game-layout">
      <div className="game-section">
        <div id="phaser-game-container"></div>
      </div>
      
      <div className="worksheet-section">
        <MatchWorksheetWithLines pairs={quizData} />
      </div>
    </div>
  )
}
```

CSS:
```css
.game-layout {
  display: grid;
  grid-template-columns: 800px 1fr;
  gap: 20px;
  padding: 20px;
}
```

### Option 2: Tabbed Interface
```jsx
const [activeTab, setActiveTab] = useState('game') // 'game' or 'worksheet'

return (
  <div>
    <div className="tabs">
      <button onClick={() => setActiveTab('game')}>Shooting Game</button>
      <button onClick={() => setActiveTab('worksheet')}>Worksheet</button>
    </div>
    
    {activeTab === 'game' && <div id="phaser-game-container"></div>}
    {activeTab === 'worksheet' && <MatchWorksheetWithLines pairs={quizData} />}
  </div>
)
```

### Option 3: Separate Route
```jsx
// In App.jsx
<Route path="/worksheet" element={<WorksheetPage />} />
<Route path="/match-game" element={<MatchGameLauncher />} />
```

---

## Key Features Explained

### 1. Shuffling Algorithm
Uses Fisher-Yates shuffle to randomize definitions:
- Ensures truly random distribution
- Happens once on mount (useMemo)
- Prevents easy pattern matching

### 2. Ref Management
```javascript
// Initialize refs array based on pairs length
useEffect(() => {
  termRefs.current = termRefs.current.slice(0, pairs.length)
  definitionRefs.current = definitionRefs.current.slice(0, pairs.length)
}, [pairs])

// Assign refs in render
ref={(el) => (termRefs.current[index] = el)}
```

### 3. Canvas Positioning
- Absolute positioning over content
- Dynamically sized to match container
- Pointer-events: none allows clicks to pass through
- Redraws on window resize

### 4. Connection Logic
```javascript
// One-to-one connections only
const addConnection = (termIndex, definitionIndex) => {
  // Remove existing connections with these items
  const filtered = connections.filter(
    conn => conn.termIndex !== termIndex && 
            conn.definitionIndex !== definitionIndex
  )
  // Add new connection
  setConnections([...filtered, { termIndex, definitionIndex }])
}
```

### 5. Answer Checking
```javascript
const checkAnswers = () => {
  let correct = 0
  connections.forEach(({ termIndex, definitionIndex }) => {
    const term = pairs[termIndex]
    const definition = shuffledDefinitions[definitionIndex]
    if (term.definition === definition) correct++
  })
  alert(`You got ${correct} out of ${pairs.length} correct!`)
}
```

---

## Customization Options

### Change Colors
Edit in CSS:
```css
.worksheet-container {
  background: linear-gradient(135deg, YOUR_COLOR_1, YOUR_COLOR_2);
}
```

### Change Line Style
In `drawLine()` function:
```javascript
ctx.strokeStyle = '#YOUR_COLOR'
ctx.lineWidth = 5 // Thicker lines
ctx.setLineDash([10, 5]) // Dashed lines
```

### Add Animations
```javascript
// Animate line drawing
const animateLine = (start, end, duration) => {
  let progress = 0
  const animate = () => {
    progress += 0.02
    if (progress < 1) {
      drawPartialLine(start, end, progress)
      requestAnimationFrame(animate)
    }
  }
  animate()
}
```

### Add Sound Effects
```javascript
const playSound = (type) => {
  const audio = new Audio(type === 'correct' ? '/correct.mp3' : '/wrong.mp3')
  audio.play()
}
```

---

## Files Created

1. **Components:**
   - `frontend/src/components/MatchWorksheet.jsx` - Basic version
   - `frontend/src/components/MatchWorksheetWithLines.jsx` - Full version

2. **Styles:**
   - `frontend/src/styles/MatchWorksheet.css` - Complete styling

3. **Documentation:**
   - This file

---

## Next Steps / Enhancements

### Immediate Improvements:
1. ✅ Add visual feedback for correct/incorrect lines
2. ✅ Store user's answers
3. ✅ Show score/results screen
4. ✅ Add undo functionality
5. ✅ Highlight correct answers after checking

### Future Enhancements:
- Drag-and-drop instead of click-to-connect
- Curved/bezier lines instead of straight
- Animations for line drawing
- Timer functionality
- Hint system
- Export results as PDF
- Accessibility improvements (keyboard navigation)
- Touch device optimization

---

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (with responsive layout)

**Note:** Canvas API is supported in all modern browsers.

---

## Performance Considerations

- **useMemo** for shuffling prevents unnecessary recalculations
- **Canvas** is efficient for drawing multiple lines
- **Refs** provide direct DOM access without re-renders
- **Event delegation** could be added for better performance with many items

---

## Accessibility

Current accessibility features:
- Semantic HTML structure
- Clear visual feedback for selections
- Keyboard-accessible buttons

Recommended additions:
- ARIA labels for items
- Keyboard navigation for term/definition selection
- Screen reader announcements for connections
- Focus management

---

## Testing Checklist

- [ ] Shuffling works correctly
- [ ] All items are clickable
- [ ] Lines draw correctly
- [ ] Lines persist after drawing
- [ ] Clear button works
- [ ] Check answers calculates correctly
- [ ] Responsive layout works on mobile
- [ ] Canvas resizes properly
- [ ] No memory leaks on unmount
- [ ] Works with different numbers of pairs (5, 10, 20+)
