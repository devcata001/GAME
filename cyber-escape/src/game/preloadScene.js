// All textures are drawn at runtime with Phaser Graphics so the game
// ships as a single self-contained bundle with no image assets needed.
export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' })
    }

    preload() {
        const { width: W, height: H } = this.scale
        const cx = W / 2, cy = H / 2

        this.add.rectangle(cx, cy, W * 0.6, 28, 0x0d1117).setStrokeStyle(1, 0x00fff7, 0.8)

        const bar = this.add.rectangle(cx - (W * 0.6) / 2, cy, 0, 28, 0x00fff7, 0.9).setOrigin(0, 0.5)

        this.add.text(cx, cy - 90, 'CYBER ESCAPE', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '28px',
            color: '#00fff7',
        }).setOrigin(0.5)

        this.add.text(cx, cy + 40, 'LOADING...', {
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '12px',
            color: '#00aaff',
        }).setOrigin(0.5)

        this.load.on('progress', v => { bar.width = W * 0.6 * v })
    }

    create() {
        this._makeTextures()
        this.scene.start('MainScene', { level: 1 })
    }

    _makeTextures() {
        const g = this.make.graphics({ x: 0, y: 0, add: false })

        // background grid
        g.clear()
        g.fillStyle(0x0a0a0f)
        g.fillRect(0, 0, 800, 600)
        g.lineStyle(1, 0x00aaff, 0.12)
        for (let x = 0; x <= 800; x += 40) {
            g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 600); g.strokePath()
        }
        for (let y = 0; y <= 600; y += 40) {
            g.beginPath(); g.moveTo(0, y); g.lineTo(800, y); g.strokePath()
        }
        g.fillStyle(0x00aaff, 0.25)
        for (let x = 0; x <= 800; x += 40) {
            for (let y = 0; y <= 600; y += 40) g.fillCircle(x, y, 1.5)
        }
        g.generateTexture('background', 800, 600)

        // platform tile
        g.clear()
        g.fillStyle(0x0d1117)
        g.fillRect(0, 0, 200, 18)
        g.lineStyle(1, 0x00fff7, 0.9)
        g.strokeRect(0, 0, 200, 18)
        g.lineStyle(1, 0x00fff7, 0.4)
        for (let i = 10; i < 200; i += 20) {
            g.beginPath(); g.moveTo(i, 4); g.lineTo(i + 10, 4); g.strokePath()
            g.fillStyle(0x00fff7, 0.5)
            g.fillRect(i + 10, 2, 2, 4)
        }
        g.generateTexture('platform', 200, 18)

        // player character frames
        const drawPlayer = (armSwing = 0, legSwing = 0) => {
            g.clear()
            // head
            g.fillStyle(0x00e8d0)
            g.fillCircle(12, 5, 5)
            // visor
            g.fillStyle(0x0a0a0f)
            g.fillRect(8, 3, 8, 4)
            g.fillStyle(0x00fff7, 0.75)
            g.fillRect(9, 3, 6, 2)
            g.fillStyle(0xffffff, 0.9)
            g.fillRect(10, 4, 1, 1)
            g.fillRect(13, 4, 1, 1)
            // neck + torso
            g.fillStyle(0x00c8b8)
            g.fillRect(10, 10, 4, 3)
            g.fillStyle(0x007788)
            g.fillRect(5, 13, 14, 10)
            g.fillStyle(0x00fff7, 0.25)
            g.fillRect(7, 14, 10, 7)
            g.lineStyle(1, 0x00fff7, 0.6)
            g.beginPath(); g.moveTo(12, 14); g.lineTo(12, 21); g.strokePath()
            g.beginPath(); g.moveTo(7, 17); g.lineTo(17, 17); g.strokePath()
            // arms
            const la = 14 + armSwing, ra = 14 - armSwing
            g.fillStyle(0x005566)
            g.fillRect(1, la, 4, 9)
            g.fillRect(19, ra, 4, 9)
            g.fillStyle(0x00e8d0)
            g.fillRect(1, la + 9, 4, 4)
            g.fillRect(19, ra + 9, 4, 4)
            // legs
            const ll = 23 + legSwing, rl = 23 - legSwing
            g.fillStyle(0x004455)
            g.fillRect(5, 23, 5, 8)
            g.fillRect(14, 23, 5, 8)
            g.fillStyle(0x003344)
            g.fillRect(5, 31, 5, ll - 23)
            g.fillRect(14, 31, 5, Math.max(1, rl < 23 ? 1 : 23 - rl + 5))
            g.fillStyle(0x00fff7, 0.8)
            g.fillRect(4, 23 + 8 + (ll - 23), 6, 3)
            g.fillRect(13, 23 + 8 + Math.max(0, 23 - rl), 6, 3)
        }

        drawPlayer()
        g.generateTexture('player', 24, 36)

        const frames = [{ a: 3, l: 3 }, { a: 0, l: 0 }, { a: -3, l: -3 }, { a: 0, l: 0 }]
        frames.forEach((f, i) => {
            drawPlayer(f.a, f.l)
            g.generateTexture(`player_run_${i}`, 24, 36)
        })

        // firewall enemy
        g.clear()
        g.fillStyle(0x1a0005)
        g.fillRect(0, 0, 32, 32)
        g.lineStyle(2, 0xff003c, 1)
        g.strokeRect(1, 1, 30, 30)
        g.lineStyle(2, 0xff003c, 0.8)
        g.beginPath(); g.moveTo(6, 6); g.lineTo(26, 26); g.strokePath()
        g.beginPath(); g.moveTo(26, 6); g.lineTo(6, 26); g.strokePath()
        g.lineStyle(1, 0xff6680, 0.6)
        g.strokeRect(8, 8, 16, 16)
        g.fillStyle(0xff003c)
        g.fillCircle(16, 16, 3)
        g.generateTexture('firewall', 32, 32)

        // coin pickup
        g.clear()
        g.fillStyle(0xd4a017)
        g.fillCircle(12, 12, 12)
        g.fillStyle(0xf5c842)
        g.fillCircle(12, 12, 9)
        g.fillStyle(0xffe066)
        g.fillCircle(12, 12, 6)
        g.fillStyle(0x8a6800)
        g.fillRect(11, 4, 2, 16)
        g.fillRect(8, 7, 8, 2)
        g.fillRect(8, 11, 8, 2)
        g.fillRect(8, 15, 8, 2)
        g.fillStyle(0xfff8c0, 0.7)
        g.fillCircle(9, 9, 2)
        g.generateTexture('coin', 24, 24)

        // particles
        g.clear()
        g.fillStyle(0x00fff7)
        g.fillCircle(2, 2, 2)
        g.generateTexture('particle', 4, 4)

        g.clear()
        g.fillStyle(0xff003c)
        g.fillCircle(2, 2, 2)
        g.generateTexture('particle_red', 4, 4)

        // danger ground strip at bottom
        g.clear()
        g.fillStyle(0x1a0005)
        g.fillRect(0, 0, 800, 20)
        g.lineStyle(2, 0xff003c, 0.8)
        g.beginPath(); g.moveTo(0, 0); g.lineTo(800, 0); g.strokePath()
        for (let x = 0; x < 800; x += 20) {
            g.fillStyle(0xff003c, 0.3 + Math.random() * 0.4)
            g.fillRect(x + 2, 4, 14, 12)
        }
        g.generateTexture('danger_ground', 800, 20)

        // door closed (locked until all coins grabbed)
        g.clear()
        g.fillStyle(0x1a1a2e)
        g.fillRect(0, 0, 40, 58)
        g.lineStyle(3, 0x445566, 1)
        g.strokeRect(1, 1, 38, 56)
        g.lineStyle(1, 0x334455, 0.8)
        g.strokeRect(4, 4, 32, 24)
        g.strokeRect(4, 32, 32, 20)
        g.lineStyle(2, 0xff003c, 0.9)
        g.strokeCircle(20, 34, 5)
        g.beginPath(); g.moveTo(16, 34); g.lineTo(16, 29); g.strokePath()
        g.beginPath(); g.moveTo(24, 34); g.lineTo(24, 29); g.strokePath()
        g.beginPath(); g.moveTo(16, 29); g.lineTo(24, 29); g.strokePath()
        g.fillStyle(0xd4a017, 0.4)
        g.fillCircle(20, 16, 7)
        g.lineStyle(1, 0xf5c842, 0.6)
        g.strokeCircle(20, 16, 7)
        g.fillStyle(0x8a6800, 0.5)
        g.fillRect(19, 11, 2, 10)
        g.fillRect(16, 13, 8, 2)
        g.fillRect(16, 17, 8, 2)
        g.generateTexture('door_closed', 40, 58)

        // door open (level exit)
        g.clear()
        g.fillStyle(0xfff4c2, 0.85)
        g.fillRect(4, 4, 32, 50)
        g.lineStyle(3, 0xffe600, 1)
        g.strokeRect(1, 1, 38, 56)
        g.lineStyle(2, 0xffd700, 0.7)
        g.strokeRect(4, 4, 32, 50)
        g.lineStyle(2, 0xffffff, 0.5)
        g.beginPath(); g.moveTo(20, 4); g.lineTo(4, 0); g.strokePath()
        g.beginPath(); g.moveTo(20, 4); g.lineTo(36, 0); g.strokePath()
        g.lineStyle(1, 0xffffff, 0.3)
        g.beginPath(); g.moveTo(20, 4); g.lineTo(0, 2); g.strokePath()
        g.beginPath(); g.moveTo(20, 4); g.lineTo(40, 2); g.strokePath()
        g.fillStyle(0xc8860a)
        g.fillTriangle(20, 10, 14, 22, 26, 22)
        g.fillRect(17, 22, 6, 12)
        g.generateTexture('door_open', 40, 58)

        g.destroy()
    }
}
