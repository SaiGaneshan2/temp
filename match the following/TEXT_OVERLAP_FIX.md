# Text Overlap Bug Fix

## Issue
White definition text was overlapping and getting stuck on the screen when clicking wrong answers. The text objects from previous questions weren't being properly cleaned up.

## Root Cause
The text objects were being created with `this.add.text()` which adds them to the scene's display list. Even though we were calling `destroy()` on them, there was a potential race condition or timing issue where some text objects weren't being fully removed before new ones were created.

## Solution
Implemented a comprehensive text tracking and cleanup system:

### 1. Added Text Tracking Array
```javascript
this.definitionTexts = []  // Track all definition text objects
```

### 2. Enhanced Cleanup in spawnTargetsForCurrentPair()
```javascript
// Clear existing targets and their text objects
this.targets.getChildren().forEach(target => {
  if (target.textObject) {
    target.textObject.destroy()
  }
})
this.targets.clear(true, true)

// Also destroy any orphaned definition texts
this.definitionTexts.forEach(text => {
  if (text && text.scene) {
    text.destroy()
  }
})
this.definitionTexts = []
```

### 3. Track Text Objects When Created
```javascript
// Add text label to the target
const textObj = this.add.text(x, y, definition, {
  fontSize: '12px',
  fill: '#ffffff',
  fontFamily: 'Arial',
  align: 'center',
  wordWrap: { width: 120, useAdvancedWrap: true }
}).setOrigin(0.5)

// Store text reference on target
target.textObject = textObj

// Track this text object for cleanup
this.definitionTexts.push(textObj)
```

### 4. Enhanced Cleanup in Answer Handlers
Both `handleCorrectAnswer()` and `handleWrongAnswer()` now include:

```javascript
// Destroy ALL targets and their text objects
this.targets.getChildren().forEach(t => {
  if (t.textObject) {
    t.textObject.destroy()
  }
  t.destroy()
})
this.targets.clear(true, true)

// Also destroy any tracked definition texts
this.definitionTexts.forEach(text => {
  if (text && text.scene) {
    text.destroy()
  }
})
this.definitionTexts = []
```

## How It Works

```
┌─────────────────────────────────────────┐
│  Create New Targets                     │
├─────────────────────────────────────────┤
│  1. Destroy all old target sprites      │
│  2. Destroy all old text objects        │
│  3. Clear definitionTexts array         │
│  4. Create new targets                  │
│  5. Create new text objects             │
│  6. Add text to definitionTexts array   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Answer Hit (Correct or Wrong)          │
├─────────────────────────────────────────┤
│  1. Destroy all targets                 │
│  2. Destroy all textObject references   │
│  3. Destroy all tracked texts           │
│  4. Clear definitionTexts array         │
│  5. Move to next question               │
└─────────────────────────────────────────┘
```

## Benefits

1. **Double Cleanup**: Text objects are destroyed both via target references AND via the tracking array
2. **Safety Check**: `if (text && text.scene)` prevents errors from already-destroyed objects
3. **Complete Reset**: Array is cleared after cleanup, preventing memory leaks
4. **No Orphans**: Even if a text object somehow loses its target reference, it's still tracked and cleaned up

## Testing

To verify the fix:

1. ✅ Upload a PDF and start the game
2. ✅ Shoot a wrong answer
3. ✅ Check that ALL text disappears cleanly
4. ✅ New question appears with fresh text
5. ✅ No overlapping or stuck text
6. ✅ Repeat multiple times to ensure consistency

## Files Modified

- `frontend/src/game/MatchGameScene.js`
  - Line ~10: Added `this.definitionTexts = []` tracking array
  - Lines ~185-200: Enhanced `spawnTargetsForCurrentPair()` cleanup
  - Line ~240: Added text tracking when created
  - Lines ~305-325: Enhanced `handleCorrectAnswer()` cleanup
  - Lines ~345-365: Enhanced `handleWrongAnswer()` cleanup

## Before vs After

### Before:
```
Question 1 → Shoot wrong → Some text stuck
Question 2 → Old text overlaps new text
Question 3 → More text accumulates
Result: Unreadable mess ❌
```

### After:
```
Question 1 → Shoot wrong → All text destroyed
Question 2 → Fresh, clean text appears
Question 3 → Clean transition
Result: Perfect cleanup ✅
```

---

## Additional Notes

The fix uses a defensive programming approach:
- Multiple cleanup points (spawn, correct answer, wrong answer)
- Existence checks before destroying (`if (text && text.scene)`)
- Array clearing to prevent memory leaks
- Double reference cleanup (target.textObject + tracking array)

This ensures that even in edge cases or race conditions, text objects will be properly cleaned up and won't persist on screen.
