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
            { x: 0, y: 570, sx: 4.0, ground: true },
            { x: 120, y: 460, sx: 1.0 },
            { x: 320, y: 390, sx: 1.2 },
            { x: 520, y: 320, sx: 0.9 },
            { x: 680, y: 440, sx: 1.0 },
            { x: 200, y: 280, sx: 0.8 },
            { x: 420, y: 230, sx: 1.1 },
            { x: 600, y: 180, sx: 0.9 },
        ],
        enemies: [
            { x: 300, y: 358, dir: 'h', spd: 80, range: 100 },
            { x: 600, y: 288, dir: 'h', spd: 100, range: 80 },
        ],
        coins: [
            { x: 130, y: 430 },
            { x: 380, y: 360 },
            { x: 610, y: 148 },
            { x: 430, y: 200 },
        ],
        spawn: { x: 60, y: 530 },
        door: { x: 700, y: 141 },
    },
    {
        id: 'Level 2 – Firewall Breach',
        bgTint: 0x001a00,
        platforms: [
            { x: 0, y: 570, sx: 4.0, ground: true },
            { x: 80, y: 480, sx: 0.7 },
            { x: 250, y: 420, sx: 0.9 },
            { x: 430, y: 340, sx: 1.0 },
            { x: 620, y: 280, sx: 0.8 },
            { x: 100, y: 330, sx: 0.7 },
            { x: 300, y: 250, sx: 0.8 },
            { x: 500, y: 200, sx: 0.9 },
            { x: 700, y: 440, sx: 0.7 },
            { x: 650, y: 150, sx: 0.7 },
        ],
        enemies: [
            { x: 240, y: 388, dir: 'h', spd: 110, range: 100 },
            { x: 440, y: 308, dir: 'h', spd: 130, range: 90 },
            { x: 620, y: 248, dir: 'v', spd: 80, range: 70 },
            { x: 100, y: 300, dir: 'h', spd: 90, range: 60 },
        ],
        coins: [
            { x: 90, y: 450 },
            { x: 260, y: 390 },
            { x: 440, y: 310 },
            { x: 630, y: 250 },
            { x: 510, y: 168 },
        ],
        spawn: { x: 50, y: 530 },
        door: { x: 720, y: 111 },
    },
    {
        id: 'Level 3 – Core Breach',
        bgTint: 0x1a0010,
        platforms: [
            { x: 0, y: 570, sx: 4.0, ground: true },
            { x: 100, y: 490, sx: 0.6 },
            { x: 260, y: 420, sx: 0.7 },
            { x: 400, y: 350, sx: 0.8 },
            { x: 560, y: 290, sx: 0.7 },
            { x: 700, y: 360, sx: 0.6 },
            { x: 150, y: 360, sx: 0.6 },
            { x: 320, y: 280, sx: 0.7 },
            { x: 480, y: 210, sx: 0.7 },
            { x: 640, y: 180, sx: 0.6 },
            { x: 200, y: 200, sx: 0.5 },
            { x: 360, y: 140, sx: 0.6 },
        ],
        enemies: [
            { x: 255, y: 388, dir: 'h', spd: 130, range: 90 },
            { x: 395, y: 318, dir: 'h', spd: 150, range: 80 },
            { x: 555, y: 258, dir: 'v', spd: 100, range: 60 },
            { x: 700, y: 328, dir: 'v', spd: 110, range: 60 },
            { x: 315, y: 248, dir: 'h', spd: 120, range: 70 },
            { x: 640, y: 148, dir: 'h', spd: 140, range: 60 },
        ],
        coins: [
            { x: 110, y: 460 },
            { x: 270, y: 390 },
            { x: 410, y: 320 },
            { x: 570, y: 260 },
            { x: 490, y: 178 },
            { x: 370, y: 108 },
        ],
        spawn: { x: 50, y: 530 },
        door: { x: 420, y: 101 },
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
        this.lvlIndex = (data.level || 1) - 1
        this.score = data.score || 0
        this.lives = data.lives ?? 3
        this.timeLeft = TIME_LIMIT
        this.coinsLeft = 0
        this.totalCoins = 0
        this.dead = false
        this.finished = false
        this.restarting = false
        this.doorOpen = false
        this.audio = null
    }

    create() {
        const cfg = levels[this.lvlIndex]

        try {
            this.audio = new (window.AudioContext || window.webkitAudioContext)()
        } catch (_) { }

        this.add.image(400, 300, 'background').setDepth(0)
        this.add.rectangle(400, 300, 800, 600, cfg.bgTint, 0.25).setDepth(1)

        this.platforms = this.physics.add.staticGroup()
        this.coins = this.physics.add.staticGroup()
        this.enemies = this.physics.add.group()
        this.doorGroup = this.physics.add.staticGroup()

        cfg.platforms.forEach(p => {
            const sx = p.sx ?? 1
            const tile = this.platforms.create(p.x + (200 * sx) / 2, p.y, 'platform')
            tile.setScale(sx, 1).refreshBody().setDepth(3)
            if (p.ground) tile.setTint(0x004455)
        })

        this.add.image(400, 590, 'danger_ground').setDepth(2)

        this.player = this.physics.add.sprite(cfg.spawn.x, cfg.spawn.y, 'player').setDepth(5)
        this.player.setBounce(BOUNCE)
        this.player.setCollideWorldBounds(true)
        this.player.body.setGravityY(GRAVITY)
        this.player.body.setSize(14, 34)

        // door starts locked
        this.door = this.doorGroup.create(cfg.door.x, cfg.door.y, 'door_closed').setDepth(4)
        this.door.body.setSize(34, 54)
        this.lockedTween = this.tweens.add({
            targets: this.door,
            alpha: 0.55,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })

        cfg.coins.forEach(c => {
            const s = this.coins.create(c.x, c.y, 'coin').setDepth(4).setScale(1.1)
            this.tweens.add({
                targets: s,
                alpha: 0.5,
                duration: 700 + Math.random() * 300,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        })
        this.totalCoins = cfg.coins.length
        this.coinsLeft = this.totalCoins

        cfg.enemies.forEach(e => {
            const s = this.enemies.create(e.x, e.y, 'firewall').setDepth(4)
            s.setImmovable(true)
            s.body.setAllowGravity(false)
            s.setData('dir', e.dir)
            s.setData('spd', e.spd)
            s.setData('range', e.range)
            s.setData('origin', { x: e.x, y: e.y })
            s.setData('phase', Math.random() * Math.PI * 2)
            this.tweens.add({ targets: s, alpha: 0.5, duration: 400, yoyo: true, repeat: -1 })
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

        const t = time / 1000
        this.enemies.getChildren().forEach(e => {
            const dir = e.getData('dir')
            const spd = e.getData('spd')
            const range = e.getData('range')
            const origin = e.getData('origin')
            const phase = e.getData('phase')
            const offset = Math.sin(t * (spd / 60) + phase) * range
            if (dir === 'h') {
                e.x = origin.x + offset
                e.body.reset(e.x, e.y)
            } else {
                e.y = origin.y + offset
                e.body.reset(e.x, e.y)
            }
        })

        if (this.player.y > 610) this.onDeath(this.player, null)

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
        const bonus = this.timeLeft * TIME_BONUS
        this.score += bonus
        beep(this.audio, 1320, 'sine', 0.8, 0.4)
        beep(this.audio, 1760, 'sine', 0.4, 0.15)
        this.cameras.main.flash(400, 138, 0, 255)
        this.updateHUD()
        window.dispatchEvent(new CustomEvent('game:clear', {
            detail: { level: this.lvlIndex + 1, score: this.score, bonus }
        }))
        this.time.delayedCall(1200, () => {
            const next = this.lvlIndex + 2
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
        this.scene.restart({ level: this.lvlIndex + 1, score: this.score, lives: this.lives })
    }

    endGame(win = false) {
        this.clock?.remove()
        window.dispatchEvent(new CustomEvent('game:end', {
            detail: { score: this.score, win, level: this.lvlIndex + 1 }
        }))
        this.scene.stop('UIScene')
        this.scene.stop('MainScene')
    }

    updateHUD() {
        window.dispatchEvent(new CustomEvent('game:update', {
            detail: {
                level: this.lvlIndex + 1,
                levelName: levels[this.lvlIndex].id,
                score: this.score,
                lives: this.lives,
                timeLeft: this.timeLeft,
                coins: this.totalCoins - this.coinsLeft,
                total: this.totalCoins,
            }
        }))
    }
}
