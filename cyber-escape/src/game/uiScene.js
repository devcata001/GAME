export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' })
    }

    init(data) {
        this.main = data.main || null
        this.hud = {
            level: 1, levelName: '', score: 0,
            lives: 3, timeLeft: 60, coins: 0, total: 0,
        }
    }

    create() {
        this.handleHudUpdate = event => {
            Object.assign(this.hud, event.detail)
            this.draw()
        }
        window.addEventListener('game:update', this.handleHudUpdate)
        this.buildHud()
    }

    attach(ref) { this.main = ref }

    buildHud() {
        const width = this.scale.width
        const baseStyle = { fontFamily: '"Share Tech Mono", monospace', fontSize: '13px', color: '#00fff7' }
        const smallStyle = { ...baseStyle, fontSize: '11px', color: '#00aaff' }
        const timerWidth = 180

        this.add.rectangle(width / 2, 20, width, 40, 0x000000, 0.72).setDepth(20)
        this.add.rectangle(width / 2, 40, width, 1, 0x00fff7, 0.4).setDepth(20)

        this.add.text(8, 8, 'TIME', smallStyle).setDepth(21)
        this.timerTxt = this.add.text(8, 20, '60s', { ...baseStyle, fontSize: '15px', color: '#aaffff' }).setDepth(22)
        this.add.rectangle(8, 36, timerWidth, 6, 0x002233).setOrigin(0, 0.5).setDepth(21)
        this.timerBar = this.add.rectangle(8, 36, timerWidth, 6, 0x00fff7).setOrigin(0, 0.5).setDepth(22)

        this.add.text(width - 8, 8, 'SCORE', smallStyle).setOrigin(1, 0).setDepth(21)
        this.scoreTxt = this.add.text(width - 8, 20, '000000', { ...baseStyle, color: '#ffe600', fontSize: '15px' }).setOrigin(1, 0).setDepth(21)
        this.coinsTxt = this.add.text(width - 8, 36, '', baseStyle).setOrigin(1, 0).setDepth(21)

        this.nameTxt = this.add.text(width / 2, 12, '', smallStyle).setOrigin(0.5, 0).setDepth(21)
        this.livesTxt = this.add.text(width / 2, 28, '', smallStyle).setOrigin(0.5, 0).setDepth(21)
    }

    draw() {
        const data = this.hud

        this.scoreTxt.setText(String(data.score).padStart(6, '0'))
        this.livesTxt.setText(`LIVES: ${'■'.repeat(Math.max(0, data.lives))}`)
        this.coinsTxt.setText(`COINS: ${data.coins}/${data.total}  🪙`)
        this.nameTxt.setText(data.levelName)

        const timePercent = data.timeLeft / 60
        this.timerBar.width = Math.max(0, 180 * timePercent)
        this.timerTxt.setText(`${data.timeLeft}s`)

        if (data.timeLeft <= 10) {
            this.timerBar.setFillStyle(0xff003c)
            this.timerTxt.setColor('#ff003c')
        } else if (data.timeLeft <= 20) {
            this.timerBar.setFillStyle(0xffe600)
            this.timerTxt.setColor('#ffe600')
        } else {
            this.timerBar.setFillStyle(0x00fff7)
            this.timerTxt.setColor('#aaffff')
        }
    }

    destroy() {
        window.removeEventListener('game:update', this.handleHudUpdate)
        super.destroy?.()
    }
}
