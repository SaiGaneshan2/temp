# 🎮 Match the Following - Complete Setup Guide

## Project Overview

This project consists of two parts:
1. **Backend (FastAPI)**: PDF processing and AI-powered match generation using Groq
2. **Frontend (React + Phaser)**: Interactive shooting game

## 📁 Project Structure

```
match the following/
├── backend/
│   ├── main.py              # FastAPI server
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # API keys (not in git)
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── game/           # Phaser game logic
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
└── SETUP.md                # This file
```

## 🚀 Quick Start

### Backend Setup (Python/FastAPI)

1. **Set your Groq API key:**
   ```powershell
   $env:GROQ_API_KEY = "your-api-key-here"
   ```

2. **Install Python dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

3. **Start the backend server:**
   ```powershell
   python main.py
   ```
   Server runs at: `http://localhost:8000`

### Frontend Setup (React/Phaser)

1. **Navigate to frontend:**
   ```powershell
   cd frontend
   ```

2. **Install Node dependencies:**
   ```powershell
   npm install
   ```

3. **Start the development server:**
   ```powershell
   npm run dev
   ```
   Game runs at: `http://localhost:3000`

## 🎯 Running Both Servers

You'll need **two PowerShell terminals**:

**Terminal 1 - Backend:**
```powershell
# In project root
$env:GROQ_API_KEY = "your-key"
python main.py
```

**Terminal 2 - Frontend:**
```powershell
# In project root
cd frontend
npm run dev
```

## 🧪 Testing

### Test the Backend API
```powershell
# Upload a PDF to generate matches
python test_api.py path\to\document.pdf
```

### Test the Game
1. Open browser to `http://localhost:3000`
2. Click "Start Game"
3. Move mouse to aim, click to shoot

## 📦 Dependencies

### Backend
- Python 3.8+
- FastAPI
- Uvicorn
- PyMuPDF
- Groq
- Pydantic

### Frontend
- Node.js 16+
- React 18
- Phaser 3.70
- React Router
- Vite

## 🔑 Environment Variables

Create a `.env` file in the root:
```env
GROQ_API_KEY=your-groq-api-key-here
```

Get your key from: https://console.groq.com/keys

## 🎮 Game Controls

- **Mouse Move**: Aim the turret
- **Mouse Click**: Fire projectile

## 📚 API Endpoints

### `GET /`
Health check

### `POST /api/generate-matches`
Upload PDF to generate 10 term-definition pairs

**Example Response:**
```json
{
  "pairs": [
    {"term": "API", "definition": "Application Programming Interface"},
    {"term": "REST", "definition": "Representational State Transfer"}
  ]
}
```

## 🛠️ Development Tips

### Hot Reload
- Backend: Restart needed after changes
- Frontend: Auto-reloads with Vite

### Debugging
- Backend: Check terminal output
- Frontend: Open browser DevTools (F12)
- Phaser: Enable debug in `vite.config.js`

### Port Conflicts
If ports are in use:
- Backend: Change port in `main.py`
- Frontend: Change port in `vite.config.js`

## 🚨 Common Issues

**"GROQ_API_KEY not set"**
```powershell
$env:GROQ_API_KEY = "your-key"
```

**"No module named 'fitz'"**
```powershell
pip install pymupdf
```

**"npm command not found"**
Install Node.js from: https://nodejs.org

**Game canvas not showing**
- Check browser console
- Verify Phaser installed: `npm list phaser`

## 📖 Next Steps

1. ✅ Backend endpoint for PDF processing
2. ✅ Player shooting mechanics
3. 🔲 Integrate backend with frontend
4. 🔲 Add falling targets with terms/definitions
5. 🔲 Implement collision detection
6. 🔲 Add scoring system
7. 🔲 Add levels and difficulty

## 📝 Notes

- Keep both servers running during development
- Backend provides match data
- Frontend will fetch from backend (to be implemented)
- Game loop is client-side (Phaser handles rendering)
