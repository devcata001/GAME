/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                cyber: {
                    black: '#0a0a0f',
                    dark: '#0d1117',
                    blue: '#00aaff',
                    cyan: '#00fff7',
                    green: '#39ff14',
                    purple: '#8b00ff',
                    red: '#ff003c',
                    yellow: '#ffe600',
                },
            },
            fontFamily: {
                mono: ['"Share Tech Mono"', 'monospace'],
            },
            boxShadow: {
                neon: '0 0 10px #00fff7, 0 0 40px #00fff780',
                neonGreen: '0 0 10px #39ff14, 0 0 40px #39ff1480',
                neonRed: '0 0 10px #ff003c, 0 0 40px #ff003c80',
            },
            keyframes: {
                scanline: {
                    '0%': { backgroundPosition: '0 0' },
                    '100%': { backgroundPosition: '0 100%' },
                },
                glitch: {
                    '0%, 100%': { transform: 'translate(0)' },
                    '20%': { transform: 'translate(-2px, 2px)' },
                    '40%': { transform: 'translate(2px, -2px)' },
                    '60%': { transform: 'translate(-1px, 1px)' },
                    '80%': { transform: 'translate(1px, -1px)' },
                },
                pulse2: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
            },
            animation: {
                scanline: 'scanline 8s linear infinite',
                glitch: 'glitch 0.5s steps(2) infinite',
                pulse2: 'pulse2 2s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}
