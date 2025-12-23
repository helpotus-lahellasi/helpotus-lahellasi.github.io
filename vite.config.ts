import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    publicDir: 'public',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                sovellus: resolve(__dirname, 'sovellus.html'),
                haku: resolve(__dirname, 'haku.html'),
                esitys: resolve(__dirname, 'esitys.html'),
                'media-vaatimukset': resolve(__dirname, 'media-vaatimukset.html'),
                sw: resolve(__dirname, 'src/sw.ts'),
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    return chunkInfo.name === 'sw' ? 'sw.js' : 'assets/[name]-[hash].js'
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src/modules'),
        },
    },
})
