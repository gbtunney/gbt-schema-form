import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname =
    typeof __dirname !== 'undefined'
        ? __dirname
        : path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // Point @operator/ui at its src so the playground can import
            // OperatorEditor without operator-ui needing a build step or
            // an exports field. Vite handles the TSX directly.
            '@operator/ui': path.resolve(
                dirname,
                '../../packages/operator-ui/src',
            ),
        },
    },
    server: {
        port: 5174,
    },
})
