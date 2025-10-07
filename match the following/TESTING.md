# 🧪 Testing Guide - Match the Following Game

## Quick Test Checklist

### ✅ Backend Test
```powershell
# 1. Set API key
$env:GROQ_API_KEY = "your-key"

# 2. Start backend
python main.py

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8000
```

### ✅ Frontend Test
```powershell
# 1. Open new terminal
cd frontend

# 2. Start frontend
npm run dev

# Expected output:
# VITE ready in Xms
# Local: http://localhost:3000
```

## 🎮 Game Testing Scenarios

### Scenario 1: Demo Data (Quick Test)
**Purpose**: Test game mechanics without backend

1. Navigate to http://localhost:3000
2. Click "Start Game"
3. Click "🎮 Use Demo Data"
4. **Expected**: Game loads immediately with 10 programming terms

**What to Test:**
- [ ] Turret rotates to follow mouse
- [ ] Clicking fires projectiles
- [ ] Projectiles hit targets
- [ ] Correct target shows green "✓ Correct!"
- [ ] Wrong target shows red "✗ Wrong! Try again"
- [ ] Score increments on correct hit
- [ ] New term appears after correct match
- [ ] Targets fall down and respawn at top
- [ ] Game completes after all 10 pairs
- [ ] Final score screen shows
- [ ] "Play Again" button restarts game

### Scenario 2: PDF Upload (Full Integration)
**Purpose**: Test backend integration

1. Navigate to http://localhost:3000
2. Click "Start Game"
3. Click "📄 Choose PDF File"
4. Select any educational PDF (textbook, notes, etc.)
5. **Expected**: Loading spinner appears

**What to Test:**
- [ ] Loading spinner shows
- [ ] Backend receives PDF
- [ ] Groq generates 10 pairs
- [ ] Game loads with generated pairs
- [ ] Terms match PDF content
- [ ] Definitions are accurate
- [ ] Game mechanics work same as demo

**Test PDFs to Try:**
- Science textbook → Biology/Chemistry terms
- Programming tutorial → Code concepts
- History document → Historical terms
- Business paper → Business terminology

### Scenario 3: Error Handling
**Purpose**: Test error states

**Test 3a: Invalid File**
1. Try to upload a .txt or .docx file
2. **Expected**: Error message about PDF required

**Test 3b: Empty PDF**
1. Upload a blank PDF
2. **Expected**: Error about no text extracted

**Test 3c: Backend Offline**
1. Stop backend server
2. Try to upload PDF
3. **Expected**: Connection error message

**Test 3d: No API Key**
1. Unset GROQ_API_KEY
2. Try to upload PDF
3. **Expected**: Backend error about missing API key

## 🎯 Gameplay Testing

### Test: Correct Answer Flow
1. Load game with any data
2. Read the term at top
3. Find correct definition among 4 targets
4. Shoot the correct target
5. **Verify:**
   - ✅ Green "Correct!" appears
   - ✅ Green explosion
   - ✅ Score increases
   - ✅ All 4 targets disappear
   - ✅ New term appears after 1 second
   - ✅ 4 new targets spawn

### Test: Wrong Answer Flow
1. Load game
2. Intentionally shoot wrong target
3. **Verify:**
   - ❌ Red "Wrong!" appears
   - ❌ Red explosion
   - ✅ Score stays same
   - ✅ Wrong target disappears
   - ✅ Other 3 targets remain
   - ✅ Can still hit correct target

### Test: Complete Game
1. Start with demo data
2. Complete all 10 pairs correctly
3. **Verify:**
   - ✅ Completion screen shows
   - ✅ Final score = 10/10
   - ✅ "Click to Play Again" button visible
   - ✅ Clicking button restarts game
   - ✅ Score resets to 0/10
   - ✅ First term shows again

## 🔍 Visual Testing

### UI Elements to Verify
- [ ] Landing page displays properly
- [ ] Upload buttons are visible and styled
- [ ] Loading spinner animates smoothly
- [ ] Error messages are readable
- [ ] Game canvas is centered
- [ ] Term text is large and clear
- [ ] Score display is visible
- [ ] Targets have readable text
- [ ] Feedback text is prominent
- [ ] Completion screen is centered

### Animations to Check
- [ ] Stars twinkle in background
- [ ] Turret rotates smoothly
- [ ] Projectiles fire in aimed direction
- [ ] Projectiles have scale-up animation
- [ ] Targets fall smoothly
- [ ] Explosions have particle effects
- [ ] Feedback text fades in/out
- [ ] Muzzle flash appears on shoot

## 🐛 Bug Testing

### Edge Cases to Test

**Case 1: Rapid Fire**
- Click very fast (10+ times/second)
- **Verify**: No performance issues, projectiles still work

**Case 2: Off-Screen Shooting**
- Aim and shoot towards edges
- **Verify**: Projectiles clean up properly

**Case 3: Target Overlapping**
- Let targets fall to bottom
- **Verify**: They respawn at top correctly

**Case 4: Multiple Wrong Answers**
- Hit 3 wrong targets before correct
- **Verify**: Game continues normally

**Case 5: Quick Navigation**
- Start game, immediately click back button
- **Verify**: Game cleans up properly

**Case 6: Browser Resize**
- Resize browser window during game
- **Verify**: Game still playable (might need restart)

## 📊 Performance Testing

### Metrics to Monitor

**Frame Rate:**
- Open browser DevTools (F12)
- Enable FPS meter in Rendering tab
- **Expected**: 60 FPS consistently

**Memory:**
- Monitor memory in DevTools
- Play several rounds
- **Expected**: No memory leaks, stable usage

**Network:**
- Check Network tab during PDF upload
- **Expected**: Single POST request, reasonable size

**Backend:**
- Watch backend terminal
- **Expected**: No errors, reasonable response time (<10s)

## ✅ Acceptance Criteria

### Must Pass
- [x] Game loads with demo data
- [x] Game loads with PDF upload
- [x] Correct answers increment score
- [x] Wrong answers don't increment score
- [x] All pairs can be completed
- [x] Completion screen shows
- [x] Game can be replayed

### Should Pass
- [ ] No console errors
- [ ] Smooth 60 FPS
- [ ] < 10 second backend processing
- [ ] Readable text on all targets
- [ ] Clear visual feedback
- [ ] Intuitive controls

### Nice to Have
- [ ] < 5 second backend processing
- [ ] Attractive visual effects
- [ ] Satisfying explosions
- [ ] Smooth animations

## 🚨 Known Issues & Limitations

1. **Target Text Wrapping**: Very long definitions may overflow
2. **PDF Processing**: Some PDFs may not extract text well
3. **API Rate Limit**: Groq may rate limit frequent uploads
4. **Minimum Pairs**: Need at least 4 pairs for game to work
5. **Browser Compatibility**: Best on Chrome/Edge, may vary on others

## 📝 Test Report Template

```
Test Date: _________
Tester: _________

Backend Status:
[ ] Running on port 8000
[ ] API key set
[ ] No errors

Frontend Status:
[ ] Running on port 3000
[ ] No console errors
[ ] All routes accessible

Demo Data Test:
[ ] Game loads
[ ] All mechanics work
[ ] Game completes
Score: __/10

PDF Upload Test:
[ ] File upload works
[ ] Loading shows
[ ] Data fetched
[ ] Game plays
Score: __/__

Bugs Found:
1. _________
2. _________
3. _________

Overall: [ ] Pass [ ] Fail
Notes: _________
```

## 🎯 Quick Smoke Test (2 minutes)

Run this to verify everything works:

```powershell
# 1. Start both servers
.\run_both.ps1

# 2. Open http://localhost:3000

# 3. Test sequence:
#    - Click "Start Game"
#    - Click "Use Demo Data"
#    - Shoot 2-3 targets (mix correct/wrong)
#    - Verify score changes
#    - Click "Back to Home"

# 4. If all works: ✅ System Ready
```

Happy Testing! 🚀
