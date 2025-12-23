import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                sovellus: resolve(__dirname, 'sovellus.html'),
                haku: resolve(__dirname, 'haku.html'),
                esitys: resolve(__dirname, 'esitys.html'),
                'media-vaatimukset': resolve(__dirname, 'media-vaatimukset.html'),
            },
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './modules'),
        },
    },
})
