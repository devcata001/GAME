export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' })
    }

    init(data) {
        this.main = data.main || null
        this.state = {
            level: 1, levelName: '', score: 0,
            lives: 3, timeLeft: 60, coins: 0, total: 0,
        }
    }

    create() {
        this._listen = e => { Object.assign(this.state, e.detail); this.draw() }
        window.addEventListener('game:update', this._listen)
        this._build()
    }

    attach(ref) { this.main = ref }

    _build() {
        const W = this.scale.width
        const base = { fontFamily: '"Share Tech Mono", monospace', fontSize: '13px', color: '#00fff7' }
        const sm = { ...base, fontSize: '11px', color: '#00aaff' }

        this.add.rectangle(W / 2, 20, W, 40, 0x000000, 0.72).setDepth(20)
        this.add.rectangle(W / 2, 40, W, 1, 0x00fff7, 0.4).setDepth(20)

        this.add.text(8, 8, 'SCORE', sm).setDepth(21)
        this.scoreTxt = this.add.text(8, 20, '000000', { ...base, color: '#ffe600', fontSize: '15px' }).setDepth(21)
        this.nameTxt = this.add.text(W / 2, 12, '', sm).setOrigin(0.5, 0).setDepth(21)
        this.livesTxt = this.add.text(W - 8, 8, '', sm).setOrigin(1, 0).setDepth(21)
        this.coinsTxt = this.add.text(W - 8, 22, '', base).setOrigin(1, 0).setDepth(21)

        // timer bar
        this.add.rectangle(W / 2, 37, W - 120, 6, 0x002233).setDepth(21)
        this.timerBar = this.add.rectangle(8, 34, W - 120, 6, 0x00fff7).setOrigin(0, 0.5).setDepth(22)
        this.timerTxt = this.add.text(W / 2, 29, '60', { ...base, fontSize: '11px', color: '#aaffff' }).setOrigin(0.5, 0).setDepth(22)
    }

    draw() {
        const d = this.state
        const W = this.scale.width

        this.scoreTxt.setText(String(d.score).padStart(6, '0'))
        this.livesTxt.setText(`LIVES: ${'■'.repeat(Math.max(0, d.lives))}`)
        this.coinsTxt.setText(`COINS: ${d.coins}/${d.total}  🪙`)
        this.nameTxt.setText(d.levelName)

        const pct = d.timeLeft / 60
        this.timerBar.width = Math.max(0, (W - 120) * pct)
        this.timerTxt.setText(`${d.timeLeft}s`)

        if (d.timeLeft <= 10) {
            this.timerBar.setFillStyle(0xff003c)
            this.timerTxt.setColor('#ff003c')
        } else if (d.timeLeft <= 20) {
            this.timerBar.setFillStyle(0xffe600)
            this.timerTxt.setColor('#ffe600')
        } else {
            this.timerBar.setFillStyle(0x00fff7)
            this.timerTxt.setColor('#aaffff')
        }
    }

    destroy() {
        window.removeEventListener('game:update', this._listen)
        super.destroy?.()
    }
}
