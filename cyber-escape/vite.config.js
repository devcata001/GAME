import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: './',
    build: {
        outDir: 'dist',
        assetsInlineLimit: 0,
        chunkSizeWarningLimit: 2200,
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser'],
                    react: ['react', 'react-dom'],
                    framer: ['framer-motion'],
                },
            },
        },
    },
    server: {
        port: 3000,
    },
})
