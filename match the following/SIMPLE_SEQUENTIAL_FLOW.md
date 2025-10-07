# Simple Sequential Flow - Updated!

## What Changed? 🎯

### Before:
- ❌ All questions visible at once (confusing)
- ❌ Current question not obvious
- ❌ Could see question 17/10 (bug)
- ❌ Everything same brightness

### After:
- ✅ **Only current question + completed questions visible**
- ✅ **Current question BRIGHT, BOLD, and PULSING**
- ✅ **All answers BRIGHT and BOLD**
- ✅ Sequential reveal as you progress
- ✅ Clear visual hierarchy

## How It Works Now 📝

### Step 1: Question 1 Appears
```
┌─────────────────────────────────────────┐
│ Questions           │  Answers           │
├─────────────────────┼───────────────────┤
│ 1. Term A (BRIGHT!) │  A. Definition 1  │← All answers
│                     │  B. Definition 2  │  shown and
│                     │  C. Definition 3  │  BRIGHT & BOLD
│                     │  D. Definition 4  │
└─────────────────────┴───────────────────┘
         ↑ PULSING GLOW!
```

### Step 2: User Shoots Answer
```
User shoots target in game → Line draws to answer
```

### Step 3: Question 1 Fades, Question 2 Appears
```
┌─────────────────────────────────────────┐
│ Questions           │  Answers           │
├─────────────────────┼───────────────────┤
│ 1. Term A (faded)   │  A. Def 1 (GREEN!)│
│ 2. Term B (BRIGHT!) │  B. Definition 2  │
│                     │  C. Definition 3  │
│                     │  D. Definition 4  │
└─────────────────────┴───────────────────┘
         ↑ NOW PULSING!
```

### Step 4: Continues...
```
Each time you shoot:
1. Line connects question → answer
2. Answer box turns GREEN (correct) or RED (wrong)
3. Current question fades
4. Next question appears BRIGHT
```

## Visual Design 🎨

### Current Question (Active):
- **85% larger** (scale: 1.05)
- **Gradient background** (purple-blue glow)
- **Pulsing shadow** animation
- **Text size: 22px** (number) + **16px bold** (text)
- **Thick border** (4px)

### Completed Questions:
- **70% opacity** (visible but faded)
- **Light gray background**
- **Semi-bold text** (600 weight)
- Still readable for reference

### All Answers:
- **Always 100% opacity** (bright and visible)
- **Letter size: 20px bold**
- **Text size: 15px semi-bold**
- **Hover effect** (shifts left slightly)

### Shot Answers:
- **Correct**: Green gradient background, green border, bold text
- **Wrong**: Red gradient background, red border, bold text

## Animations 🎬

### Pulse Animation (Current Question):
```css
@keyframes pulse {
  0%, 100% { box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5); }
  50% { box-shadow: 0 8px 32px rgba(102, 126, 234, 0.8); }
}
```
- 2 second loop
- Gentle breathing effect
- Draws attention without being annoying

### Hover Effect (Answers):
```css
.definition-item:hover {
  transform: translateX(-5px);
  box-shadow: 0 6px 20px rgba(118, 75, 162, 0.3);
}
```
- Slides left 5px
- Adds shadow
- Feels interactive

## User Flow Example 📖

### Starting the Game:
1. Upload PDF
2. Click "Generate Game"
3. **See**: Question 1 bright and pulsing, all answers visible
4. **Game shows**: "Match: [Question 1 text]"

### Playing Question 1:
1. Current question (Q1) glows with pulse
2. All answers (A, B, C, D...) visible and bold
3. Shoot target for answer B
4. Line draws from Q1 → B
5. B turns green (correct) or red (wrong)
6. Q1 fades to 70% opacity

### Playing Question 2:
1. Question 2 appears with bright pulse
2. All answers still visible (except B is colored from Q1)
3. Shoot target for answer D
4. Line draws from Q2 → D
5. D turns green/red
6. Q2 fades to 70% opacity

### Continue until all questions answered!

## Key Features ✨

### 1. Progressive Reveal
- Questions appear one at a time
- Completed questions stay visible (for context)
- Future questions hidden (no spoilers)

### 2. Visual Hierarchy
- **Current question**: Brightest, largest, pulsing
- **Completed questions**: Faded but readable
- **All answers**: Always bright and bold
- **Shot answers**: Color-coded feedback

### 3. Clear Feedback
- ✅ Green = Correct
- ❌ Red = Wrong
- Lines connect question to answer
- Immediate visual response

### 4. No Confusion
- Only one question active at a time
- Can't skip ahead
- Can't go back (one-shot gameplay)
- Clear progress indication

## Typography 📝

### Active Question:
- Number: **22px, weight 900**
- Text: **16px, weight 700**

### Completed Questions:
- Number: **16px, weight 700**
- Text: **14px, weight 600**

### All Answers:
- Letter: **20px, weight 900**
- Text: **15px, weight 600**

### Shot Answers (Correct/Wrong):
- Letter: **20px, weight 900** (colored)
- Text: **15px, weight 700** (colored)

## Colors 🎨

### Question Colors:
- Active border: `#667eea` (purple-blue)
- Active background: `rgba(102, 126, 234, 0.25)` (light purple)
- Completed background: `#f8f9fa` (light gray)

### Answer Colors:
- Default border: `#764ba2` (purple)
- Correct background: `#d4edda` → `#c3e6cb` (green gradient)
- Correct border: `#28a745` (green)
- Wrong background: `#f8d7da` → `#f5c6cb` (red gradient)
- Wrong border: `#dc3545` (red)

### Line Colors:
- Correct: `#00ff00` (bright green)
- Wrong: `#ff6b6b` (red)

## Spacing & Layout 📐

### Question Items:
- Padding: `12px`
- Gap between items: `10px`
- Border width (active): `4px`
- Border width (normal): `2px`

### Answer Items:
- Padding: `12px`
- Border width (shot): `4px`
- Border width (normal): `2px`

### Columns:
- Gap between columns: `20px`
- Title margin bottom: `15px`

## Testing Checklist ✅

Before:
- [ ] Start game
- [ ] Question 1 appears bright and pulsing
- [ ] All answers visible and bold
- [ ] No other questions visible

During:
- [ ] Shoot answer
- [ ] Line draws immediately
- [ ] Answer changes color (green/red)
- [ ] Question 1 fades to 70%
- [ ] Question 2 appears bright
- [ ] Previous questions still visible

After:
- [ ] All questions visible (faded)
- [ ] All shot answers colored
- [ ] Lines connect all Q→A
- [ ] Score is correct

## Troubleshooting 🔧

### Question not pulsing?
- Check browser supports CSS animations
- Check `.term-item.active` has animation property

### All questions showing?
- Check `{index > currentQuestionIndex} return null`
- Verify currentQuestionIndex state updates

### Answers not bold?
- Check `.definition-item .item-letter` font-weight: 900
- Check `.definition-item .item-text` font-weight: 600

### Colors not changing?
- Check connections state updates
- Verify `.correct` and `.wrong` classes applied
- Check CSS specificity

## Summary 📊

**Simple, Sequential Flow:**
1. **Question 1**: Bright, bold, pulsing
2. **Shoot answer**: Line connects, color feedback
3. **Question 1 fades**: Still visible but dimmed
4. **Question 2**: Bright, bold, pulsing
5. **Repeat**: Until all questions done

**All answers always visible and bold** for easy scanning!

This creates a **clear, focused experience** where the user always knows:
- ✅ What question they're on (the bright one!)
- ✅ What they've already answered (the faded ones)
- ✅ What answers are available (all of them, bold!)
- ✅ What they got right/wrong (green/red colors)

Perfect for learning and gameplay! 🎮📚
