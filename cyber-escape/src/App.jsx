import { useEffect, useRef, useState, useCallback } from 'react'
import Phaser from 'phaser'
import { motion, AnimatePresence } from 'framer-motion'
import PreloadScene from './game/preloadScene'
import MainScene from './game/mainScene'
import UIScene from './game/uiScene'
import './index.css'

const W = 800
const H = 600

function buildConfig(parent) {
    return {
        type: Phaser.AUTO,
        parent,
        width: W,
        height: H,
        backgroundColor: '#0a0a0f',
        scene: [PreloadScene, MainScene, UIScene],
        physics: {
            default: 'arcade',
            arcade: { gravity: { y: 0 }, debug: false },
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        audio: { disableWebAudio: false },
        render: { antialias: true, roundPixels: false },
    }
}

function TitleScreen({ onPlay }) {
    return (
        <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-cyber-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="absolute inset-0 scanlines pointer-events-none" />

            <motion.h1
                className="font-mono text-5xl font-bold text-cyber-cyan text-glow-cyan tracking-widest mb-2"
                animate={{
                    textShadow: [
                        '0 0 10px #00fff7, 0 0 40px #00fff780',
                        '0 0 18px #00fff7, 0 0 60px #00fff7aa',
                        '0 0 10px #00fff7, 0 0 40px #00fff780',
                    ]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
                CYBER ESCAPE
            </motion.h1>

            <p className="font-mono text-cyber-blue text-sm tracking-widest mb-12">
                BREACH THE NETWORK · COLLECT COINS · SURVIVE
            </p>

            <div className="relative bg-cyber-dark/80 border border-cyber-cyan/30 rounded-lg px-8 py-5 mb-10 max-w-sm w-full mx-4">
                <div className="absolute inset-0 scanlines rounded-lg pointer-events-none" />
                <p className="font-mono text-cyber-green text-glow-green text-xs tracking-widest mb-3">CONTROLS</p>
                <div className="space-y-1 font-mono text-xs text-cyber-cyan/80">
                    <div className="flex justify-between"><span>MOVE</span><span className="text-cyber-yellow">← →</span></div>
                    <div className="flex justify-between"><span>JUMP</span><span className="text-cyber-yellow">↑</span></div>
                </div>
                <hr className="border-cyber-cyan/20 my-3" />
                <p className="font-mono text-cyber-red text-xs tracking-widest mb-2">OBJECTIVE</p>
                <div className="space-y-1 font-mono text-xs text-cyber-cyan/80">
                    <div>🪙 Collect all coins to open the exit door</div>
                    <div>🔥 Avoid firewalls — they kill on touch</div>
                    <div>⏱ 60 seconds per level, 3 levels total</div>
                </div>
            </div>

            <motion.button
                onClick={onPlay}
                className="font-mono text-cyber-black bg-cyber-cyan px-12 py-3 rounded text-lg font-bold tracking-widest shadow-neon hover:bg-white transition-colors"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
            >
                PLAY
            </motion.button>
        </motion.div>
    )
}

function GameOverScreen({ win, score, level, onRetry }) {
    return (
        <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="absolute inset-0 scanlines pointer-events-none" />
            <motion.div
                className="bg-cyber-dark border border-cyber-cyan/40 rounded-lg px-10 py-8 max-w-sm w-full mx-4 shadow-neon text-center"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
            >
                <h2 className={`font-mono text-3xl font-bold tracking-widest mb-1 ${win ? 'text-cyber-green text-glow-green' : 'text-cyber-red text-glow-red'}`}>
                    {win ? 'ACCESS GRANTED' : 'CONNECTION LOST'}
                </h2>
                <p className="font-mono text-cyber-blue text-xs mb-6">
                    {win ? 'ALL LEVELS CLEARED' : `TERMINATED AT LEVEL ${level}`}
                </p>
                <div className="bg-black/40 rounded mb-6 py-4">
                    <div className="font-mono text-cyber-yellow text-4xl font-bold text-glow-green">
                        {String(score).padStart(6, '0')}
                    </div>
                    <div className="font-mono text-cyber-blue text-xs mt-1">FINAL SCORE</div>
                </div>
                <motion.button
                    onClick={onRetry}
                    className="w-full font-mono text-cyber-black bg-cyber-cyan py-2.5 rounded hover:bg-white transition-colors tracking-widest text-sm font-bold shadow-neon"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    PLAY AGAIN
                </motion.button>
            </motion.div>
        </motion.div>
    )
}

function LevelBanner({ data }) {
    return (
        <motion.div
            className="absolute inset-0 flex items-center justify-center z-35 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.8] }}
            transition={{ duration: 2.2, times: [0, 0.2, 0.7, 1] }}
        >
            <div className="text-center">
                <div className="font-mono text-cyber-green text-glow-green text-4xl font-bold tracking-widest">
                    LEVEL COMPLETE
                </div>
                <div className="font-mono text-cyber-yellow text-lg mt-1">
                    +{data.bonus} TIME BONUS &nbsp;·&nbsp; {String(data.score).padStart(6, '0')}
                </div>
            </div>
        </motion.div>
    )
}

export default function App() {
    const mountRef = useRef(null)
    const gameRef = useRef(null)
    const [view, setView] = useState('title')
    const [result, setResult] = useState({ score: 0, level: 1, win: false })
    const [banner, setBanner] = useState(null)

    const launch = useCallback(() => {
        setView('game')
        setTimeout(() => {
            gameRef.current?.destroy(true)
            gameRef.current = new Phaser.Game(buildConfig(mountRef.current))
        }, 80)
    }, [])

    useEffect(() => {
        const onOver = e => { setResult(e.detail); setView('gameover') }
        const onLevel = e => { setBanner(e.detail); setTimeout(() => setBanner(null), 2400) }
        window.addEventListener('game:end', onOver)
        window.addEventListener('game:clear', onLevel)
        return () => {
            window.removeEventListener('game:end', onOver)
            window.removeEventListener('game:clear', onLevel)
        }
    }, [])

    useEffect(() => () => gameRef.current?.destroy(true), [])

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-cyber-black overflow-hidden">
            <div ref={mountRef} style={{ width: W, height: H }} id="game-root" />

            <AnimatePresence>
                {view === 'title' && <TitleScreen key="t" onPlay={launch} />}
                {view === 'gameover' && (
                    <GameOverScreen
                        key="g"
                        win={result.win}
                        score={result.score}
                        level={result.level}
                        onRetry={launch}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {banner && <LevelBanner key={banner.level} data={banner} />}
            </AnimatePresence>
        </div>
    )
}
