# Match the Following - Frontend Game

A React + Phaser 3 shooting game where players shoot terms to match them with their definitions.

## 🎮 Current Features

- **Player Turret**: Stationary turret at the bottom of the screen
- **Mouse Aiming**: Turret automatically rotates to face mouse cursor
- **Shooting Mechanic**: Click to fire projectiles in the direction you're aiming
- **Visual Effects**: 
  - Animated starfield background
  - Muzzle flash effects
  - Projectile animations
- **Automatic Cleanup**: Projectiles are removed when they go off-screen

## 🚀 Installation

1. **Navigate to the frontend directory:**
   ```powershell
   cd frontend
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Start the development server:**
   ```powershell
   npm run dev
   ```

4. **Open your browser:**
   The game will automatically open at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Home.jsx                 # Landing page
│   │   └── MatchGameLauncher.jsx    # Game container component
│   ├── game/
│   │   └── MatchGameScene.js        # Main Phaser game scene
│   ├── App.jsx                      # Main app with routing
│   ├── App.css                      # Styles
│   ├── main.jsx                     # React entry point
│   └── index.css                    # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## 🎯 How to Play (Current Version)

1. Click "Start Game" on the home page
2. Move your mouse around the screen - the turret will follow
3. Click anywhere to shoot projectiles
4. Projectiles fly in the direction you're aiming

## 🔧 Technical Details

### React Component (`MatchGameLauncher.jsx`)
- Initializes the Phaser game instance
- Manages game lifecycle (creation and cleanup)
- Provides the DOM container for the Phaser canvas
- Includes routing to navigate between home and game

### Phaser Scene (`MatchGameScene.js`)
- **Player**: Green triangle at the bottom-center
- **Aiming**: Uses `Phaser.Math.Angle.Between()` to calculate rotation
- **Projectiles**: Yellow circles fired on mouse click
- **Physics**: Arcade physics with no gravity
- **Object Pooling**: Reuses projectiles for better performance

### Key Methods

#### `preload()`
- Creates textures programmatically (no image files needed)
- Generates player triangle texture
- Generates projectile circle texture

#### `create()`
- Sets up the game scene
- Creates starfield background
- Initializes player sprite
- Sets up projectile physics group
- Configures input handlers

#### `update()`
- Runs every frame
- Removes off-screen projectiles
- Keeps memory usage efficient

#### `handleMouseMove()`
- Calculates angle between player and mouse
- Rotates player sprite to face cursor

#### `handleShoot()`
- Creates projectile at player position
- Calculates velocity based on aim direction
- Adds visual effects (muzzle flash, scaling)
- Sets up auto-destruction after 3 seconds

## 🎨 Customization

### Change Player Color
In `MatchGameScene.js`, find `createPlayerTexture()`:
```javascript
graphics.fillStyle(0x00ff00, 1) // Change 0x00ff00 to any hex color
```

### Change Projectile Speed
```javascript
this.projectileSpeed = 400 // Increase for faster projectiles
```

### Change Projectile Color
In `createProjectileTexture()`:
```javascript
graphics.fillStyle(0xffff00, 1) // Change 0xffff00 to any hex color
```

## 🔮 Next Steps

Future features to implement:
- [ ] Falling terms and definitions
- [ ] Collision detection between projectiles and targets
- [ ] Scoring system
- [ ] Multiple levels
- [ ] Sound effects
- [ ] Power-ups
- [ ] Timer/lives system

## 🐛 Troubleshooting

**Game doesn't load:**
- Make sure you ran `npm install`
- Check browser console for errors
- Ensure port 3000 is not in use

**Can't aim/shoot:**
- Check that you're on the `/game` route
- Try refreshing the page

**Performance issues:**
- Reduce number of stars in `createStarfield()`
- Lower `maxSize` in projectiles group
