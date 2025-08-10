import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        open: true,
        port: 3000,
        strictPort: true,
        host: true
    },
    base: '/',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        manifest: true,
        rollupOptions: {
            output: {
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
        }
    }
}) 