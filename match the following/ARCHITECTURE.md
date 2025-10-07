# Match the Following Game - Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE (React)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────┐         ┌──────────────────┐                       │
│  │  Home.jsx      │  Route  │ MatchGameLauncher│                       │
│  │                │ ──────> │      .jsx        │                       │
│  │  Landing Page  │    /    │                  │                       │
│  │  Start Button  │         │  • Upload UI     │                       │
│  └────────────────┘         │  • Fetch Data    │                       │
│                              │  • Init Phaser   │                       │
│                              └──────────────────┘                       │
│                                      │                                  │
│                                      │ State Management                 │
│                                      ▼                                  │
│                              ┌──────────────────┐                       │
│                              │   React State    │                       │
│                              ├──────────────────┤                       │
│                              │ • loading        │                       │
│                              │ • error          │                       │
│                              │ • quizData       │                       │
│                              │ • pdfFile        │                       │
│                              └──────────────────┘                       │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP POST
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API (FastAPI)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  POST /api/generate-matches                                             │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │ 1. Receive PDF file (multipart/form-data)               │           │
│  │ 2. Extract text using PyMuPDF (fitz)                    │           │
│  │ 3. Send to Groq AI with specialized prompt              │           │
│  │ 4. Parse JSON response                                  │           │
│  │ 5. Return: { pairs: [{term, definition}, ...] }        │           │
│  └─────────────────────────────────────────────────────────┘           │
│                                                                          │
│  Dependencies:                                                          │
│  • pymupdf - PDF text extraction                                       │
│  • groq - AI API client                                                │
│  • fastapi - Web framework                                             │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Returns JSON
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA STRUCTURE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  {                                                                       │
│    "pairs": [                                                           │
│      {                                                                  │
│        "term": "API",                                                   │
│        "definition": "Application Programming Interface"                │
│      },                                                                 │
│      { ... }  // 9 more pairs                                          │
│    ]                                                                    │
│  }                                                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Passed to Phaser
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      GAME ENGINE (Phaser 3)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  MatchGameScene.js                                                      │
│  ┌───────────────────────────────────────────────────────────┐         │
│  │ init(data)                                                 │         │
│  │  ├─ Receive pairs array                                   │         │
│  │  ├─ Set currentPairIndex = 0                              │         │
│  │  └─ Set score = 0                                         │         │
│  │                                                            │         │
│  │ create()                                                   │         │
│  │  ├─ Create player (turret)                                │         │
│  │  ├─ Create projectile group                               │         │
│  │  ├─ Create target group                                   │         │
│  │  ├─ Setup collision detection                             │         │
│  │  ├─ Create UI (term, score, feedback)                     │         │
│  │  └─ spawnTargetsForCurrentPair()                          │         │
│  │      ├─ Get current pair's correct definition             │         │
│  │      ├─ Get 3 random incorrect definitions                │         │
│  │      ├─ Shuffle all 4 definitions                         │         │
│  │      └─ Create 4 moving targets                           │         │
│  │                                                            │         │
│  │ update()                                                   │         │
│  │  ├─ Update text positions                                 │         │
│  │  ├─ Clean up off-screen projectiles                       │         │
│  │  └─ Respawn off-screen targets                            │         │
│  │                                                            │         │
│  │ handleCollision(projectile, target)                       │         │
│  │  ├─ Check if target.isCorrect                             │         │
│  │  ├─ If correct:                                            │         │
│  │  │   ├─ score++                                            │         │
│  │  │   ├─ Show green feedback                                │         │
│  │  │   ├─ Destroy all targets                                │         │
│  │  │   ├─ currentPairIndex++                                 │         │
│  │  │   └─ Spawn next targets (or end game)                   │         │
│  │  └─ If wrong:                                              │         │
│  │      ├─ Show red feedback                                  │         │
│  │      └─ Destroy only that target                           │         │
│  └───────────────────────────────────────────────────────────┘         │
│                                                                          │
│  Game Objects:                                                          │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐        │
│  │   Player     │  Projectiles │   Targets    │      UI      │        │
│  ├──────────────┼──────────────┼──────────────┼──────────────┤        │
│  │ • Sprite     │ • Physics    │ • Physics    │ • Term text  │        │
│  │ • Rotates    │ • Pool (50)  │ • Group      │ • Score text │        │
│  │ • Stationary │ • Velocity   │ • Fall down  │ • Feedback   │        │
│  │ • Bottom     │ • Auto-clean │ • Respawn    │ • Explosions │        │
│  └──────────────┴──────────────┴──────────────┴──────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          GAME FLOW DIAGRAM                               │
└─────────────────────────────────────────────────────────────────────────┘

  User Action                React                Backend              Phaser
      │                        │                      │                  │
      ├─ Upload PDF ──────────>│                      │                  │
      │                        │                      │                  │
      │                        ├─ POST /api/... ─────>│                  │
      │                        │                      │                  │
      │                        │                      ├─ Extract text    │
      │                        │                      ├─ Call Groq      │
      │                        │                      ├─ Parse JSON     │
      │                        │                      │                  │
      │                        │<─── pairs[] ─────────┤                  │
      │                        │                      │                  │
      │                        ├─ Init game ─────────────────────────────>│
      │                        │  (pass pairs[])      │                  │
      │                        │                      │                  │
      │                        │                      │    ┌─ Store pairs
      │                        │                      │    ├─ Create UI
      │                        │                      │    ├─ Create player
      │                        │                      │    └─ Spawn targets
      │                        │                      │                  │
      │<────────── Game Ready ─────────────────────────────────────────────┤
      │                        │                      │                  │
      ├─ Move mouse ───────────────────────────────────────────────────────>│
      │                        │                      │    └─ Rotate player
      │                        │                      │                  │
      ├─ Click shoot ──────────────────────────────────────────────────────>│
      │                        │                      │    ├─ Create projectile
      │                        │                      │    └─ Set velocity
      │                        │                      │                  │
      │                        │                      │    ┌─ Collision!
      │                        │                      │    ├─ Check answer
      │                        │                      │    ├─ Update score
      │                        │                      │    ├─ Show feedback
      │                        │                      │    └─ Next pair/End
      │                        │                      │                  │
      │<────────── Game Complete ───────────────────────────────────────────┤
      │                        │                      │    └─ Final score

┌─────────────────────────────────────────────────────────────────────────┐
│                          TARGET SPAWNING LOGIC                           │
└─────────────────────────────────────────────────────────────────────────┘

  Current Pair: { term: "API", definition: "Application Programming Interface" }
                                    │
                                    ▼
  ┌───────────────────────────────────────────────────────────────┐
  │ spawnTargetsForCurrentPair()                                   │
  ├───────────────────────────────────────────────────────────────┤
  │ 1. correctDef = "Application Programming Interface"           │
  │                                                                │
  │ 2. incorrectDefs = getRandomIncorrectDefinitions(3)          │
  │    ["Hypertext Transfer Protocol",                            │
  │     "JavaScript Object Notation",                             │
  │     "Representational State Transfer"]                        │
  │                                                                │
  │ 3. allDefs = [correctDef, ...incorrectDefs]                  │
  │                                                                │
  │ 4. Shuffle(allDefs)                                           │
  │    ["REST...", "API...", "JSON...", "HTTP..."] (random order) │
  │                                                                │
  │ 5. Create 4 targets:                                          │
  │    ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐          │
  │    │Target 1│  │Target 2│  │Target 3│  │Target 4│          │
  │    ├────────┤  ├────────┤  ├────────┤  ├────────┤          │
  │    │REST... │  │API...✓│  │JSON... │  │HTTP... │          │
  │    │x=100   │  │x=280   │  │x=460   │  │x=640   │          │
  │    │isCorrect│  │isCorrect│  │isCorrect│  │isCorrect│          │
  │    │= false │  │= true  │  │= false │  │= false │          │
  │    └────────┘  └────────┘  └────────┘  └────────┘          │
  │        ↓           ↓           ↓           ↓                 │
  │     Fall at 80px/second                                      │
  └───────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        COLLISION DETECTION                               │
└─────────────────────────────────────────────────────────────────────────┘

  Projectile hits Target 2 (API...)
           │
           ▼
  ┌─────────────────────────────────────┐
  │ handleCollision(projectile, target) │
  └─────────────────────────────────────┘
           │
           ├─ target.isCorrect?
           │
           ├─ YES (Correct Answer)
           │  │
           │  ├─ this.score++
           │  ├─ scoreText.setText("Score: 2/10")
           │  ├─ showFeedback("✓ Correct!", GREEN)
           │  ├─ createExplosion(x, y, GREEN)
           │  ├─ Destroy ALL 4 targets
           │  ├─ this.currentPairIndex++
           │  └─ After 1 second:
           │      ├─ Update term text
           │      └─ spawnTargetsForCurrentPair()
           │
           └─ NO (Wrong Answer)
              │
              ├─ showFeedback("✗ Wrong!", RED)
              ├─ createExplosion(x, y, RED)
              ├─ Destroy ONLY this target
              └─ Other 3 targets remain

┌─────────────────────────────────────────────────────────────────────────┐
│                          FILE STRUCTURE                                  │
└─────────────────────────────────────────────────────────────────────────┘

match the following/
│
├── main.py                    ← Backend FastAPI server
├── requirements.txt           ← Python dependencies
├── .env                       ← API keys (GROQ_API_KEY)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.jsx                 ← Landing page
│   │   │   └── MatchGameLauncher.jsx    ← Game container + data fetching
│   │   │
│   │   ├── game/
│   │   │   └── MatchGameScene.js        ← Main game logic
│   │   │
│   │   ├── App.jsx            ← Routes: / and /game
│   │   ├── App.css            ← All styles
│   │   ├── main.jsx           ← React entry
│   │   └── index.css          ← Global styles
│   │
│   ├── package.json           ← Node dependencies
│   └── vite.config.js         ← Vite config
│
├── INTEGRATION.md             ← This file
├── TESTING.md                 ← Testing guide
├── SETUP.md                   ← Setup instructions
└── README.md                  ← Project overview
```

## 🎯 Key Integration Points

1. **React → Backend**: HTTP POST with FormData (PDF file)
2. **Backend → React**: JSON response with pairs array
3. **React → Phaser**: Pass data via scene.start() config
4. **Phaser → User**: Visual game with collision detection

## 🔄 Data Transformation

```
PDF File
  ↓ PyMuPDF
Raw Text
  ↓ Groq AI
JSON String
  ↓ Python json.loads()
Python Dict
  ↓ FastAPI Response
JSON HTTP Response
  ↓ fetch().json()
JavaScript Object
  ↓ React State
quizData Array
  ↓ scene.start(config)
Phaser this.pairs
  ↓ Game Logic
Target Objects with isCorrect flag
```
