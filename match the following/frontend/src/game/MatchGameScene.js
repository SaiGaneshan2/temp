import Phaser from 'phaser'

export default class MatchGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MatchGameScene' })
    
    // Game objects
    this.player = null
    this.projectiles = null
    this.targets = null
    this.definitionTexts = []  // Track all definition text objects
    
    // Quiz data
    this.pairs = []
    this.currentPairIndex = 0
    this.score = 0
    
    // UI elements
    this.termText = null
    this.scoreText = null
    this.feedbackText = null
    
    // Game settings
    this.projectileSpeed = 500
    this.projectileLifetime = 3000
    this.targetSpeed = 30  // Reduced from 50 for even slower, gentler movement
    this.targetSpacing = 180
  }

  /**
   * Initialize scene with quiz data from React
   */
  init(data) {
    if (data && data.pairs) {
      this.pairs = data.pairs
      this.currentPairIndex = 0
      this.score = 0
      
      // Store callback function for notifying React component
      this.onAnswerShot = data.onAnswerShot || null
      
      console.log('Quiz data loaded:', this.pairs.length, 'pairs')
    } else {
      console.error('No quiz data provided!')
    }
  }

  preload() {
    // Generate textures programmatically
    this.createPlayerTexture()
    this.createProjectileTexture()
    this.createTargetTexture()
  }

  create() {
    if (!this.pairs || this.pairs.length === 0) {
      this.add.text(400, 300, 'Error: No quiz data loaded!', {
        fontSize: '24px',
        fill: '#ff0000',
        fontFamily: 'Arial'
      }).setOrigin(0.5)
      return
    }

    // Add background stars
    this.createStarfield()
    
    // Create the player (turret) at the bottom center
    const centerX = this.cameras.main.width / 2
    const bottomY = this.cameras.main.height - 80
    
    this.player = this.add.sprite(centerX, bottomY, 'player')
    this.player.setOrigin(0.5, 0.5)
    
    // Create physics groups
    this.projectiles = this.physics.add.group({
      defaultKey: 'projectile',
      maxSize: 50
    })
    
    this.targets = this.physics.add.group()
    
    // Add collision between targets to prevent overlapping
    this.physics.add.collider(this.targets, this.targets)
    
    // Set up collision detection between projectiles and targets
    this.physics.add.overlap(
      this.projectiles,
      this.targets,
      this.handleCollision,
      null,
      this
    )
    
    // Set up input handlers
    this.input.on('pointermove', this.handleMouseMove, this)
    this.input.on('pointerdown', this.handleShoot, this)
    
    // Create UI elements
    this.createUI()
    
    // Spawn the first set of targets
    this.spawnTargetsForCurrentPair()
  }

  update(time, delta) {
    // Clean up off-screen projectiles
    this.projectiles.getChildren().forEach(projectile => {
      if (projectile.y < -50 || projectile.x < -50 || projectile.x > this.cameras.main.width + 50) {
        this.projectiles.killAndHide(projectile)
        projectile.destroy()
      }
    })
    
    // Update target text positions and handle off-screen targets
    this.targets.getChildren().forEach(target => {
      // Update text position to follow target
      if (target.textObject) {
        target.textObject.setPosition(target.x, target.y)
      }
      
      // Respawn targets that went off the bottom of the screen
      if (target.y > this.cameras.main.height + 100) {
        target.y = -50
        target.x = Phaser.Math.Between(100, this.cameras.main.width - 100)
        const horizontalVelocity = Phaser.Math.Between(-30, 30)
        target.body.setVelocity(horizontalVelocity, this.targetSpeed)
      }
    })
  }

  /**
   * Create UI elements (term display, score, feedback)
   */
  createUI() {
    // Display current term at the top
    const currentTerm = this.pairs[this.currentPairIndex].term
    this.termText = this.add.text(this.cameras.main.width / 2, 40, `Match: "${currentTerm}"`, {
      fontSize: '28px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5,
      backgroundColor: '#1a1a2e',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5)
    
    // Score display
    this.scoreText = this.add.text(16, 16, `Score: ${this.score} / ${this.pairs.length}`, {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      backgroundColor: '#1a1a2e',
      padding: { x: 10, y: 5 }
    })
    
    // Feedback text (hidden initially)
    this.feedbackText = this.add.text(this.cameras.main.width / 2, 150, '', {
      fontSize: '24px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0)
  }

  /**
   * Create target texture (rounded rectangle)
   */
  createTargetTexture() {
    const graphics = this.add.graphics()
    
    // Draw a rounded rectangle
    graphics.fillStyle(0x4a90e2, 1) // Blue color
    graphics.lineStyle(3, 0xffffff, 1) // White outline
    graphics.fillRoundedRect(0, 0, 140, 80, 10)
    graphics.strokeRoundedRect(0, 0, 140, 80, 10)
    
    // Generate texture
    graphics.generateTexture('target', 140, 80)
    graphics.destroy()
  }

  /**
   * Spawn 4 targets: 1 correct answer + 3 incorrect distractors
   */
  spawnTargetsForCurrentPair() {
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
    
    const currentPair = this.pairs[this.currentPairIndex]
    const correctDefinition = currentPair.definition
    
    // Get 3 random incorrect definitions (distractors)
    const incorrectDefinitions = this.getRandomIncorrectDefinitions(3)
    
    // Combine and shuffle all definitions
    const allDefinitions = [correctDefinition, ...incorrectDefinitions]
    Phaser.Utils.Array.Shuffle(allDefinitions)
    
    // Create 4 targets with the definitions
    const startX = 100
    const spacing = this.targetSpacing
    
    allDefinitions.forEach((definition, index) => {
      const x = startX + (index * spacing)
      const y = Phaser.Math.Between(-100, -50) // Start above screen
      
      // Create target sprite
      const target = this.targets.create(x, y, 'target')
      target.setScale(1)
      
      // Store the definition text on the target
      target.definitionText = definition
      target.isCorrect = (definition === correctDefinition)
      
      // Add text label to the target with improved wrapping
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
      
      // Set velocity with slight horizontal variation for more natural movement
      const horizontalVelocity = Phaser.Math.Between(-30, 30)
      target.body.setVelocity(horizontalVelocity, this.targetSpeed)
      
      // Make targets bounce off each other and edges
      target.setBounce(1)
      target.body.setCollideWorldBounds(true)
    })
  }

  /**
   * Get random incorrect definitions from other pairs
   */
  getRandomIncorrectDefinitions(count) {
    const currentDefinition = this.pairs[this.currentPairIndex].definition
    const otherPairs = this.pairs.filter((pair, index) => 
      index !== this.currentPairIndex && pair.definition !== currentDefinition
    )
    
    // Shuffle and take the required count
    Phaser.Utils.Array.Shuffle(otherPairs)
    return otherPairs.slice(0, count).map(pair => pair.definition)
  }

  /**
   * Wrap text to fit within target
   */
  wrapText(text, maxLength) {
    if (text.length <= maxLength) return text
    
    const words = text.split(' ')
    let line = ''
    let result = ''
    
    words.forEach(word => {
      if ((line + word).length > maxLength) {
        result += line.trim() + '\n'
        line = word + ' '
      } else {
        line += word + ' '
      }
    })
    
    result += line.trim()
    return result
  }

  /**
   * Handle collision between projectile and target
   */
  handleCollision(projectile, target) {
    // Destroy the projectile
    projectile.destroy()
    
    // Notify React component about the shot
    if (this.onAnswerShot) {
      this.onAnswerShot(target.definitionText, target.isCorrect)
    }
    
    // Check if the target has the correct definition
    if (target.isCorrect) {
      // Correct answer!
      this.handleCorrectAnswer(target)
    } else {
      // Wrong answer!
      this.handleWrongAnswer(target)
    }
  }

  /**
   * Handle correct answer
   */
  handleCorrectAnswer(target) {
    // Increment score
    this.score++
    this.scoreText.setText(`Score: ${this.score} / ${this.pairs.length}`)
    
    // Show success feedback
    this.showFeedback('✓ Correct!', 0x00ff00)
    
    // Add explosion effect
    this.createExplosion(target.x, target.y, 0x00ff00)
    
    // Destroy ALL targets and their text objects to prevent sticking
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
    
    // Move to next pair
    this.currentPairIndex++
    
    if (this.currentPairIndex < this.pairs.length) {
      // Spawn next set of targets after a short delay
      this.time.delayedCall(1000, () => {
        const currentTerm = this.pairs[this.currentPairIndex].term
        this.termText.setText(`Match: "${currentTerm}"`)
        this.spawnTargetsForCurrentPair()
      })
    } else {
      // Game completed!
      this.handleGameComplete()
    }
  }

  /**
   * Handle wrong answer
   */
  handleWrongAnswer(target) {
    // Show error feedback
    this.showFeedback('✗ Wrong! Moving to next...', 0xff0000)
    
    // Add explosion effect
    this.createExplosion(target.x, target.y, 0xff0000)
    
    // Destroy ALL targets and their text objects (no second chance)
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
    
    // Move to next pair
    this.currentPairIndex++
    
    if (this.currentPairIndex < this.pairs.length) {
      // Spawn next set of targets after a short delay
      this.time.delayedCall(1000, () => {
        const currentTerm = this.pairs[this.currentPairIndex].term
        this.termText.setText(`Match: "${currentTerm}"`)
        this.spawnTargetsForCurrentPair()
      })
    } else {
      // Game completed!
      this.handleGameComplete()
    }
  }

  /**
   * Show feedback message
   */
  showFeedback(message, color) {
    this.feedbackText.setText(message)
    this.feedbackText.setColor(`#${color.toString(16).padStart(6, '0')}`)
    
    // Fade in and out
    this.tweens.add({
      targets: this.feedbackText,
      alpha: 1,
      duration: 200,
      yoyo: true,
      hold: 800,
      onComplete: () => {
        this.feedbackText.setAlpha(0)
      }
    })
  }

  /**
   * Create explosion effect
   */
  createExplosion(x, y, color) {
    // Create particles
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const speed = Phaser.Math.Between(100, 200)
      
      const particle = this.add.circle(x, y, 5, color)
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      })
    }
  }

  /**
   * Handle game completion
   */
  handleGameComplete() {
    // Clear all targets
    this.targets.clear(true, true)
    
    // Remove term text
    this.termText.destroy()
    
    // Show completion message
    const completionText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      `🎉 Game Complete! 🎉\n\nFinal Score: ${this.score} / ${this.pairs.length}`,
      {
        fontSize: '32px',
        fill: '#00ff00',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 6,
        backgroundColor: '#1a1a2e',
        padding: { x: 30, y: 20 }
      }
    ).setOrigin(0.5)
    
    // Add restart button
    const restartText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 80,
      'Click to Play Again',
      {
        fontSize: '20px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        backgroundColor: '#4a90e2',
        padding: { x: 20, y: 10 }
      }
    ).setOrigin(0.5).setInteractive()
    
    restartText.on('pointerdown', () => {
      this.scene.restart()
    })
    
    restartText.on('pointerover', () => {
      restartText.setScale(1.1)
    })
    
    restartText.on('pointerout', () => {
      restartText.setScale(1)
    })
  }

  /**
   * Create the player texture (triangle/ship shape)
   */
  createPlayerTexture() {
    const graphics = this.add.graphics()
    
    // Draw a triangle pointing upward (player ship/turret)
    graphics.fillStyle(0x00ff00, 1) // Green color
    graphics.lineStyle(2, 0xffffff, 1) // White outline
    
    graphics.beginPath()
    graphics.moveTo(25, 0) // Top point
    graphics.lineTo(0, 40) // Bottom left
    graphics.lineTo(50, 40) // Bottom right
    graphics.closePath()
    graphics.fillPath()
    graphics.strokePath()
    
    // Generate texture from graphics
    graphics.generateTexture('player', 50, 40)
    graphics.destroy()
  }

  /**
   * Create the projectile texture (small circle)
   */
  createProjectileTexture() {
    const graphics = this.add.graphics()
    
    // Draw a small circle
    graphics.fillStyle(0xffff00, 1) // Yellow color
    graphics.fillCircle(6, 6, 6) // x, y, radius
    
    // Add glow effect
    graphics.lineStyle(2, 0xffffff, 0.8)
    graphics.strokeCircle(6, 6, 6)
    
    // Generate texture from graphics
    graphics.generateTexture('projectile', 12, 12)
    graphics.destroy()
  }

  /**
   * Create animated starfield background
   */
  createStarfield() {
    // Create random stars in the background
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, this.cameras.main.width)
      const y = Phaser.Math.Between(0, this.cameras.main.height)
      const size = Phaser.Math.Between(1, 3)
      
      const star = this.add.circle(x, y, size, 0xffffff, Phaser.Math.FloatBetween(0.3, 0.8))
      
      // Add twinkling effect
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.1, 1),
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1
      })
    }
  }

  /**
   * Handle mouse movement - rotate player to face the mouse cursor
   */
  handleMouseMove(pointer) {
    if (!this.player) return
    
    // Calculate angle between player and mouse pointer
    const angleToPointer = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.x,
      pointer.y
    )
    
    // Rotate the player to face the pointer
    // Add 90 degrees (Math.PI/2) because the triangle points up by default
    this.player.rotation = angleToPointer + Math.PI / 2
  }

  /**
   * Handle shooting - create and fire a projectile
   */
  handleShoot(pointer) {
    if (!this.player) return
    
    // Get a projectile from the pool or create a new one
    const projectile = this.projectiles.get(this.player.x, this.player.y)
    
    if (!projectile) return // Pool is full
    
    // Make it visible and active
    projectile.setActive(true)
    projectile.setVisible(true)
    
    // Calculate the direction to shoot based on player rotation
    const angle = this.player.rotation - Math.PI / 2 // Subtract the offset we added
    
    // Calculate velocity components
    const velocityX = Math.cos(angle) * this.projectileSpeed
    const velocityY = Math.sin(angle) * this.projectileSpeed
    
    // Set the projectile velocity
    projectile.body.setVelocity(velocityX, velocityY)
    
    // Add a slight scale animation for visual effect
    projectile.setScale(0.5)
    this.tweens.add({
      targets: projectile,
      scale: 1,
      duration: 100,
      ease: 'Power2'
    })
    
    // Auto-destroy after lifetime expires
    this.time.delayedCall(this.projectileLifetime, () => {
      if (projectile.active) {
        this.projectiles.killAndHide(projectile)
      }
    })
    
    // Add shooting sound effect placeholder
    // Future: this.sound.play('shoot')
    
    // Add muzzle flash effect
    this.createMuzzleFlash(this.player.x, this.player.y, angle)
  }

  /**
   * Create a muzzle flash effect when shooting
   */
  createMuzzleFlash(x, y, angle) {
    // Create a small circle for muzzle flash
    const flash = this.add.circle(x, y, 10, 0xffaa00, 1)
    
    // Position it at the tip of the player
    const offsetX = Math.cos(angle) * 25
    const offsetY = Math.sin(angle) * 25
    flash.x += offsetX
    flash.y += offsetY
    
    // Animate and destroy
    this.tweens.add({
      targets: flash,
      scale: 2,
      alpha: 0,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        flash.destroy()
      }
    })
  }
}
