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
        this.makeTextures()
        this.scene.start('MainScene', { level: 1 })
    }

    makeTextures() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false })

        // background
        graphics.clear()
        graphics.fillStyle(0x04060b)
        graphics.fillRect(0, 0, 800, 600)

        graphics.fillStyle(0x78ff4a)
        graphics.fillRect(0, 0, 800, 20)
        graphics.fillStyle(0x4fc62e)
        for (let x = 0; x < 800; x += 16) {
            graphics.fillTriangle(x, 20, x + 8, 6, x + 16, 20)
        }
        graphics.lineStyle(2, 0xb8ff7f, 0.75)
        graphics.beginPath()
        graphics.moveTo(0, 20)
        graphics.lineTo(800, 20)
        graphics.strokePath()
        graphics.fillStyle(0x4b311b)
        graphics.fillRect(0, 20, 800, 46)

        graphics.fillStyle(0x070a10)
        graphics.fillRect(140, 0, 80, 64)
        graphics.lineStyle(1, 0x2dd46f, 0.3)
        graphics.strokeRect(140, 0, 80, 64)

        graphics.fillStyle(0x0a1119, 0.94)
        for (let i = 0; i < 8; i++) {
            graphics.fillEllipse(100 + i * 90, 160 + ((i % 2) * 70), 220, 130)
        }

        graphics.fillStyle(0x020306, 0.55)
        graphics.fillRect(0, 120, 800, 480)

        graphics.lineStyle(1, 0x1b3e57, 0.35)
        for (let y = 90; y <= 600; y += 36) {
            graphics.beginPath()
            graphics.moveTo(0, y)
            graphics.lineTo(800, y)
            graphics.strokePath()
        }
        graphics.lineStyle(1, 0x2a6e8f, 0.22)
        for (let x = 0; x <= 800; x += 56) {
            graphics.beginPath()
            graphics.moveTo(x, 78)
            graphics.lineTo(x, 600)
            graphics.strokePath()
        }

        graphics.fillStyle(0x33d0ff, 0.24)
        for (let x = 24; x <= 780; x += 80) {
            for (let y = 110; y <= 570; y += 78) {
                graphics.fillCircle(x, y, 1.5)
            }
        }

        graphics.generateTexture('background', 800, 600)

        // platform tile
        graphics.clear()
        graphics.fillStyle(0x0d1117)
        graphics.fillRect(0, 0, 200, 18)
        graphics.lineStyle(1, 0x00fff7, 0.9)
        graphics.strokeRect(0, 0, 200, 18)
        graphics.lineStyle(1, 0x00fff7, 0.4)
        for (let i = 10; i < 200; i += 20) {
            graphics.beginPath()
            graphics.moveTo(i, 4)
            graphics.lineTo(i + 10, 4)
            graphics.strokePath()
            graphics.fillStyle(0x00fff7, 0.5)
            graphics.fillRect(i + 10, 2, 2, 4)
        }
        graphics.generateTexture('platform', 200, 18)

        // player character frames
        const drawPlayer = (armSwing = 0, legSwing = 0) => {
            graphics.clear()
            // head
            graphics.fillStyle(0x00e8d0)
            graphics.fillCircle(12, 5, 5)
            // visor
            graphics.fillStyle(0x0a0a0f)
            graphics.fillRect(8, 3, 8, 4)
            graphics.fillStyle(0x00fff7, 0.75)
            graphics.fillRect(9, 3, 6, 2)
            graphics.fillStyle(0xffffff, 0.9)
            graphics.fillRect(10, 4, 1, 1)
            graphics.fillRect(13, 4, 1, 1)
            // neck + torso
            graphics.fillStyle(0x00c8b8)
            graphics.fillRect(10, 10, 4, 3)
            graphics.fillStyle(0x007788)
            graphics.fillRect(5, 13, 14, 10)
            graphics.fillStyle(0x00fff7, 0.25)
            graphics.fillRect(7, 14, 10, 7)
            graphics.lineStyle(1, 0x00fff7, 0.6)
            graphics.beginPath()
            graphics.moveTo(12, 14)
            graphics.lineTo(12, 21)
            graphics.strokePath()
            graphics.beginPath()
            graphics.moveTo(7, 17)
            graphics.lineTo(17, 17)
            graphics.strokePath()
            // arms
            const la = 14 + armSwing, ra = 14 - armSwing
            graphics.fillStyle(0x005566)
            graphics.fillRect(1, la, 4, 9)
            graphics.fillRect(19, ra, 4, 9)
            graphics.fillStyle(0x00e8d0)
            graphics.fillRect(1, la + 9, 4, 4)
            graphics.fillRect(19, ra + 9, 4, 4)
            // legs
            const ll = 23 + legSwing, rl = 23 - legSwing
            graphics.fillStyle(0x004455)
            graphics.fillRect(5, 23, 5, 8)
            graphics.fillRect(14, 23, 5, 8)
            graphics.fillStyle(0x003344)
            graphics.fillRect(5, 31, 5, ll - 23)
            graphics.fillRect(14, 31, 5, Math.max(1, rl < 23 ? 1 : 23 - rl + 5))
            graphics.fillStyle(0x00fff7, 0.8)
            graphics.fillRect(4, 23 + 8 + (ll - 23), 6, 3)
            graphics.fillRect(13, 23 + 8 + Math.max(0, 23 - rl), 6, 3)
        }

        drawPlayer()
        graphics.generateTexture('player', 24, 36)

        const frames = [{ a: 3, l: 3 }, { a: 0, l: 0 }, { a: -3, l: -3 }, { a: 0, l: 0 }]
        frames.forEach((f, i) => {
            drawPlayer(f.a, f.l)
            graphics.generateTexture(`player_run_${i}`, 24, 36)
        })

        // firewall enemy
        graphics.clear()
        graphics.fillStyle(0x1a0005)
        graphics.fillRect(0, 0, 32, 32)
        graphics.lineStyle(2, 0xff003c, 1)
        graphics.strokeRect(1, 1, 30, 30)
        graphics.lineStyle(2, 0xff003c, 0.8)
        graphics.beginPath(); graphics.moveTo(6, 6); graphics.lineTo(26, 26); graphics.strokePath()
        graphics.beginPath(); graphics.moveTo(26, 6); graphics.lineTo(6, 26); graphics.strokePath()
        graphics.lineStyle(1, 0xff6680, 0.6)
        graphics.strokeRect(8, 8, 16, 16)
        graphics.fillStyle(0xff003c)
        graphics.fillCircle(16, 16, 3)
        graphics.generateTexture('firewall', 32, 32)

        // coin pickup
        graphics.clear()
        graphics.fillStyle(0xd4a017)
        graphics.fillCircle(12, 12, 12)
        graphics.fillStyle(0xf5c842)
        graphics.fillCircle(12, 12, 9)
        graphics.fillStyle(0xffe066)
        graphics.fillCircle(12, 12, 6)
        graphics.fillStyle(0x8a6800)
        graphics.fillRect(11, 4, 2, 16)
        graphics.fillRect(8, 7, 8, 2)
        graphics.fillRect(8, 11, 8, 2)
        graphics.fillRect(8, 15, 8, 2)
        graphics.fillStyle(0xfff8c0, 0.7)
        graphics.fillCircle(9, 9, 2)
        graphics.generateTexture('coin', 24, 24)

        // particles
        graphics.clear()
        graphics.fillStyle(0x00fff7)
        graphics.fillCircle(2, 2, 2)
        graphics.generateTexture('particle', 4, 4)

        graphics.clear()
        graphics.fillStyle(0xff003c)
        graphics.fillCircle(2, 2, 2)
        graphics.generateTexture('particle_red', 4, 4)

        // danger ground strip at bottom
        graphics.clear()
        graphics.fillStyle(0x1a0005)
        graphics.fillRect(0, 0, 800, 20)
        graphics.lineStyle(2, 0xff003c, 0.8)
        graphics.beginPath(); graphics.moveTo(0, 0); graphics.lineTo(800, 0); graphics.strokePath()
        for (let x = 0; x < 800; x += 20) {
            graphics.fillStyle(0xff003c, 0.3 + Math.random() * 0.4)
            graphics.fillRect(x + 2, 4, 14, 12)
        }
        graphics.generateTexture('danger_ground', 800, 20)

        // door closed (locked until all coins grabbed)
        graphics.clear()
        graphics.fillStyle(0x1a1a2e)
        graphics.fillRect(0, 0, 40, 58)
        graphics.lineStyle(3, 0x445566, 1)
        graphics.strokeRect(1, 1, 38, 56)
        graphics.lineStyle(1, 0x334455, 0.8)
        graphics.strokeRect(4, 4, 32, 24)
        graphics.strokeRect(4, 32, 32, 20)
        graphics.lineStyle(2, 0xff003c, 0.9)
        graphics.strokeCircle(20, 34, 5)
        graphics.beginPath(); graphics.moveTo(16, 34); graphics.lineTo(16, 29); graphics.strokePath()
        graphics.beginPath(); graphics.moveTo(24, 34); graphics.lineTo(24, 29); graphics.strokePath()
        graphics.beginPath(); graphics.moveTo(16, 29); graphics.lineTo(24, 29); graphics.strokePath()
        graphics.fillStyle(0xd4a017, 0.4)
        graphics.fillCircle(20, 16, 7)
        graphics.lineStyle(1, 0xf5c842, 0.6)
        graphics.strokeCircle(20, 16, 7)
        graphics.fillStyle(0x8a6800, 0.5)
        graphics.fillRect(19, 11, 2, 10)
        graphics.fillRect(16, 13, 8, 2)
        graphics.fillRect(16, 17, 8, 2)
        graphics.generateTexture('door_closed', 40, 58)

        // door open (level exit)
        graphics.clear()
        graphics.fillStyle(0xfff4c2, 0.85)
        graphics.fillRect(4, 4, 32, 50)
        graphics.lineStyle(3, 0xffe600, 1)
        graphics.strokeRect(1, 1, 38, 56)
        graphics.lineStyle(2, 0xffd700, 0.7)
        graphics.strokeRect(4, 4, 32, 50)
        graphics.lineStyle(2, 0xffffff, 0.5)
        graphics.beginPath(); graphics.moveTo(20, 4); graphics.lineTo(4, 0); graphics.strokePath()
        graphics.beginPath(); graphics.moveTo(20, 4); graphics.lineTo(36, 0); graphics.strokePath()
        graphics.lineStyle(1, 0xffffff, 0.3)
        graphics.beginPath(); graphics.moveTo(20, 4); graphics.lineTo(0, 2); graphics.strokePath()
        graphics.beginPath(); graphics.moveTo(20, 4); graphics.lineTo(40, 2); graphics.strokePath()
        graphics.fillStyle(0xc8860a)
        graphics.fillTriangle(20, 10, 14, 22, 26, 22)
        graphics.fillRect(17, 22, 6, 12)
        graphics.generateTexture('door_open', 40, 58)

        graphics.destroy()
    }
}
