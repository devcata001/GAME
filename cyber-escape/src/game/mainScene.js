const GRAVITY = 600
const SPEED = 220
const JUMP_VEL = -480
const BOUNCE = 0.05
const TIME_LIMIT = 60
const COIN_POINTS = 100
const TIME_BONUS = 5

const levels = [
    {
        id: 'Level 1 – Entry Node',
        bgTint: 0x001122,
        platforms: [
            { x: 0, y: 75, sx: 0.7 },
            { x: 220, y: 75, sx: 2.9 },
            { x: 490, y: 200, sx: 1.0 },
            { x: 80, y: 295, sx: 1.2 },
            { x: 460, y: 380, sx: 0.9 },
            { x: 160, y: 465, sx: 1.0 },
            { x: 0, y: 570, sx: 4.0, ground: true },
        ],
        enemies: [
            { x: 490, y: 168, dir: 'h', spd: 80, range: 90 },
            { x: 80, y: 263, dir: 'h', spd: 100, range: 80 },
        ],
        coins: [
            { x: 600, y: 168 },
            { x: 230, y: 263 },
            { x: 470, y: 348 },
            { x: 170, y: 433 },
        ],
        spawn: { x: 60, y: 42 },
        door: { x: 650, y: 537 },
    },
    {
        id: 'Level 2 – Firewall Breach',
        bgTint: 0x001a00,
        platforms: [
            { x: 0, y: 75, sx: 0.7 },
            { x: 220, y: 75, sx: 2.9 },
            { x: 530, y: 165, sx: 0.8 },
            { x: 200, y: 230, sx: 0.9 },
            { x: 550, y: 300, sx: 0.8 },
            { x: 80, y: 365, sx: 0.7 },
            { x: 380, y: 420, sx: 1.0 },
            { x: 600, y: 480, sx: 0.7 },
            { x: 0, y: 570, sx: 4.0, ground: true },
        ],
        enemies: [
            { x: 200, y: 198, dir: 'h', spd: 110, range: 80 },
            { x: 550, y: 268, dir: 'h', spd: 130, range: 80 },
            { x: 80, y: 333, dir: 'h', spd: 90, range: 60 },
            { x: 380, y: 388, dir: 'v', spd: 80, range: 60 },
        ],
        coins: [
            { x: 620, y: 133 },
            { x: 250, y: 198 },
            { x: 560, y: 268 },
            { x: 90, y: 333 },
            { x: 390, y: 388 },
        ],
        spawn: { x: 60, y: 42 },
        door: { x: 680, y: 537 },
    },
    {
        id: 'Level 3 – Core Breach',
        bgTint: 0x1a0010,
        platforms: [
            { x: 0, y: 75, sx: 0.7 },
            { x: 220, y: 75, sx: 2.9 },
            { x: 540, y: 155, sx: 0.7 },
            { x: 200, y: 215, sx: 0.8 },
            { x: 520, y: 280, sx: 0.7 },
            { x: 80, y: 335, sx: 0.6 },
            { x: 350, y: 385, sx: 0.8 },
            { x: 580, y: 440, sx: 0.7 },
            { x: 180, y: 495, sx: 0.6 },
            { x: 0, y: 570, sx: 4.0, ground: true },
        ],
        enemies: [
            { x: 200, y: 183, dir: 'h', spd: 130, range: 90 },
            { x: 520, y: 248, dir: 'h', spd: 150, range: 80 },
            { x: 80, y: 303, dir: 'v', spd: 100, range: 50 },
            { x: 350, y: 353, dir: 'h', spd: 130, range: 80 },
            { x: 580, y: 408, dir: 'v', spd: 110, range: 50 },
        ],
        coins: [
            { x: 620, y: 123 },
            { x: 250, y: 183 },
            { x: 530, y: 248 },
            { x: 90, y: 303 },
            { x: 360, y: 353 },
            { x: 190, y: 463 },
        ],
        spawn: { x: 60, y: 42 },
        door: { x: 650, y: 537 },
    },
]

function beep(ctx, freq, type, dur, vol = 0.3) {
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + dur)
}

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' })
    }

    init(data) {
        this.levelIndex = (data.level || 1) - 1
        this.score = data.score || 0
        this.lives = data.lives ?? 3
        this.timeLeft = TIME_LIMIT
        this.coinsLeft = 0
        this.totalCoins = 0
        this.dead = false
        this.finished = false
        this.restarting = false
        this.doorOpen = false
        this.entryLocked = false
        this.audio = null
    }

    create() {
        const levelData = levels[this.levelIndex]

        try {
            this.audio = new (window.AudioContext || window.webkitAudioContext)()
        } catch (_) { }

        this.add.image(400, 300, 'background').setDepth(0)
        this.add.rectangle(400, 300, 800, 600, levelData.bgTint, 0.25).setDepth(1)
        this.add.rectangle(400, 22, 800, 20, 0x78ff4a, 0.45).setDepth(2)
        this.add.rectangle(400, 40, 800, 16, 0x4b311b, 0.35).setDepth(2)
        this.add.rectangle(400, 52, 800, 4, 0xb8ff7f, 0.45).setDepth(2)

        this.platforms = this.physics.add.staticGroup()
        this.coins = this.physics.add.staticGroup()
        this.enemies = this.physics.add.group()
        this.doorGroup = this.physics.add.staticGroup()

        levelData.platforms.forEach(platformData => {
            const scaleX = platformData.sx ?? 1
            const platformTile = this.platforms.create(platformData.x + (200 * scaleX) / 2, platformData.y, 'platform')
            platformTile.setScale(scaleX, 1).refreshBody().setDepth(3)
            if (platformData.ground) platformTile.setTint(0x004455)
        })

        this.add.image(400, 590, 'danger_ground').setDepth(2)

        this.player = this.physics.add.sprite(levelData.spawn.x, levelData.spawn.y, 'player').setDepth(5)
        this.player.setBounce(BOUNCE)
        this.player.setCollideWorldBounds(true)
        this.player.body.setGravityY(GRAVITY)
        this.player.body.setSize(14, 34)

        this.entrySeal = this.add.rectangle(180, 58, 80, 12, 0x2dd46f, 0).setDepth(3)
        this.physics.add.existing(this.entrySeal, true)
        this.entrySeal.body.enable = false
        this.physics.add.collider(this.player, this.entrySeal)

        // door starts locked
        this.door = this.doorGroup.create(levelData.door.x, levelData.door.y, 'door_closed').setDepth(4)
        this.door.body.setSize(34, 54)
        this.lockedTween = this.tweens.add({
            targets: this.door,
            alpha: 0.55,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })

        levelData.coins.forEach(coinData => {
            const coinSprite = this.coins.create(coinData.x, coinData.y, 'coin').setDepth(4).setScale(1.1)
            this.tweens.add({
                targets: coinSprite,
                alpha: 0.5,
                duration: 700 + Math.random() * 300,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        })
        this.totalCoins = levelData.coins.length
        this.coinsLeft = this.totalCoins

        levelData.enemies.forEach(enemyData => {
            const enemySprite = this.enemies.create(enemyData.x, enemyData.y, 'firewall').setDepth(4)
            enemySprite.setImmovable(true)
            enemySprite.body.setAllowGravity(false)
            enemySprite.setData('dir', enemyData.dir)
            enemySprite.setData('spd', enemyData.spd)
            enemySprite.setData('range', enemyData.range)
            enemySprite.setData('origin', { x: enemyData.x, y: enemyData.y })
            enemySprite.setData('phase', Math.random() * Math.PI * 2)
            this.tweens.add({ targets: enemySprite, alpha: 0.5, duration: 400, yoyo: true, repeat: -1 })
        })

        this.physics.add.collider(this.player, this.platforms)
        this.physics.add.overlap(this.player, this.coins, this.onCoin, null, this)
        this.physics.add.overlap(this.player, this.enemies, this.onDeath, null, this)
        this.physics.add.overlap(this.player, this.doorGroup, this.onDoor, null, this)

        this.sparkFX = this.add.particles(0, 0, 'particle', {
            speed: { min: 80, max: 160 },
            scale: { start: 1, end: 0 },
            lifespan: 500,
            blendMode: 'ADD',
            emitting: false,
        }).setDepth(9)

        this.ambientFX = this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: 800 },
            y: { min: 70, max: 600 },
            speedX: { min: -8, max: 8 },
            speedY: { min: -4, max: 4 },
            alpha: { start: 0.18, end: 0 },
            scale: { start: 0.45, end: 0.1 },
            lifespan: { min: 1800, max: 3200 },
            frequency: 140,
            blendMode: 'ADD',
        }).setDepth(2)

        this.deathFX = this.add.particles(0, 0, 'particle_red', {
            speed: { min: 100, max: 250 },
            scale: { start: 1.5, end: 0 },
            lifespan: 700,
            blendMode: 'ADD',
            quantity: 30,
            emitting: false,
        }).setDepth(9)

        this.keys = this.input.keyboard.createCursorKeys()

        this.clock = this.time.addEvent({
            delay: 1000,
            callback: this.tick,
            callbackScope: this,
            repeat: TIME_LIMIT - 1,
        })

        this.cameras.main.setBounds(0, 0, 800, 600)
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1)

        if (!this.scene.isActive('UIScene')) {
            this.scene.launch('UIScene', { main: this })
        } else {
            this.scene.get('UIScene').attach(this)
        }

        this.updateHUD()
    }

    update(time) {
        if (this.dead || this.finished || this.restarting) return

        const { left, right, up } = this.keys
        const grounded = this.player.body.blocked.down

        if (left.isDown) {
            this.player.setVelocityX(-SPEED)
            this.player.setFlipX(true)
        } else if (right.isDown) {
            this.player.setVelocityX(SPEED)
            this.player.setFlipX(false)
        } else {
            this.player.setVelocityX(0)
        }

        if (up.isDown && grounded) {
            this.player.setVelocityY(JUMP_VEL)
            beep(this.audio, 440, 'square', 0.12, 0.15)
        }

        const elapsedSeconds = time / 1000
        this.enemies.getChildren().forEach(enemy => {
            const moveDirection = enemy.getData('dir')
            const speed = enemy.getData('spd')
            const moveRange = enemy.getData('range')
            const startPoint = enemy.getData('origin')
            const randomPhase = enemy.getData('phase')
            const moveOffset = Math.sin(elapsedSeconds * (speed / 60) + randomPhase) * moveRange
            if (moveDirection === 'h') {
                enemy.x = startPoint.x + moveOffset
                enemy.body.reset(enemy.x, enemy.y)
            } else {
                enemy.y = startPoint.y + moveOffset
                enemy.body.reset(enemy.x, enemy.y)
            }
        })

        if (this.player.y > 610) this.onDeath(this.player, null)

        if (!this.entryLocked && this.player.y > 110) {
            this.entryLocked = true
            this.entrySeal.body.enable = true
        }

        if (!this.doorOpen && this.coinsLeft === 0 && this.totalCoins > 0) {
            this.doorOpen = true
            this.lockedTween.stop()
            this.door.setTexture('door_open').setAlpha(1).setScale(0.5)
            this.tweens.add({
                targets: this.door,
                scaleX: 1, scaleY: 1,
                duration: 380,
                ease: 'Back.easeOut',
            })
            this.tweens.add({
                targets: this.door,
                alpha: 0.8,
                duration: 500,
                yoyo: true,
                repeat: -1,
            })
            this.sparkFX.setPosition(this.door.x, this.door.y)
            this.sparkFX.explode(40)
            this.cameras.main.flash(250, 255, 230, 0, false)
            beep(this.audio, 660, 'sine', 0.4, 0.35)
        }
    }

    onCoin(player, coin) {
        coin.destroy()
        this.coinsLeft--
        this.score += COIN_POINTS
        this.sparkFX.setPosition(coin.x, coin.y)
        this.sparkFX.explode(20)
        beep(this.audio, 880, 'sine', 0.18, 0.25)
        this.updateHUD()
    }

    onDeath(player, _enemy) {
        if (this.dead || this.restarting) return
        this.dead = true
        this.lives--
        this.deathFX.setPosition(player.x, player.y)
        this.deathFX.explode(30)
        player.setVisible(false)
        beep(this.audio, 220, 'sawtooth', 0.6, 0.4)
        this.cameras.main.shake(300, 0.012)
        this.updateHUD()
        this.time.delayedCall(900, () => {
            if (this.lives <= 0) this.endGame()
            else this.resetLevel()
        })
    }

    onDoor(player, _door) {
        if (this.coinsLeft > 0 || this.finished) return
        this.finished = true
        const timeBonus = this.timeLeft * TIME_BONUS
        this.score += timeBonus
        beep(this.audio, 1320, 'sine', 0.8, 0.4)
        beep(this.audio, 1760, 'sine', 0.4, 0.15)
        this.cameras.main.flash(400, 138, 0, 255)
        this.updateHUD()
        window.dispatchEvent(new CustomEvent('game:clear', {
            detail: { level: this.levelIndex + 1, score: this.score, bonus: timeBonus }
        }))

        player.body.enable = false
        this.tweens.add({
            targets: player,
            y: player.y + 180,
            alpha: 0.18,
            duration: 820,
            ease: 'Quad.in',
        })
        this.cameras.main.shake(420, 0.01)
        this.cameras.main.fadeOut(880, 4, 7, 14)

        this.time.delayedCall(980, () => {
            const next = this.levelIndex + 2
            if (next > levels.length) this.endGame(true)
            else this.scene.restart({ level: next, score: this.score, lives: this.lives })
        })
    }

    tick() {
        if (this.dead || this.finished) return
        this.timeLeft = Math.max(0, this.timeLeft - 1)
        this.updateHUD()
        if (this.timeLeft === 0) this.onDeath(this.player, null)
    }

    resetLevel() {
        this.restarting = true
        this.scene.restart({ level: this.levelIndex + 1, score: this.score, lives: this.lives })
    }

    endGame(win = false) {
        this.clock?.remove()
        window.dispatchEvent(new CustomEvent('game:end', {
            detail: { score: this.score, win, level: this.levelIndex + 1 }
        }))
        this.scene.stop('UIScene')
        this.scene.stop('MainScene')
    }

    updateHUD() {
        window.dispatchEvent(new CustomEvent('game:update', {
            detail: {
                level: this.levelIndex + 1,
                levelName: levels[this.levelIndex].id,
                score: this.score,
                lives: this.lives,
                timeLeft: this.timeLeft,
                coins: this.totalCoins - this.coinsLeft,
                total: this.totalCoins,
            }
        }))
    }
}
