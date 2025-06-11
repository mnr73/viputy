import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    build: {
        lib: {
            entry: {
                index: path.resolve(__dirname, 'src/index.js'),
                datepicker: path.resolve(__dirname, 'src/datepicker.js')
            },
            name: 'Viputy',
            fileName: (format) => `${entryName}.${format}.js`,
        },
        rollupOptions: {
            external: ['vue', 'tailwindcss'],
        },
    },
})
