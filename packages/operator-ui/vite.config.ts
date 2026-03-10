/// <reference types="vitest/config" />
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vite'

import path from 'node:path'
import { fileURLToPath } from 'node:url'
const dirname =
    typeof __dirname !== 'undefined'
        ? __dirname
        : path.dirname(fileURLToPath(import.meta.url))

/**
 * Vite config for library build and Storybook
 *
 * - Library mode: builds the component library
 * - Test mode: runs Storybook tests with vitest
 */
export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(dirname, 'src/index.ts'),
            fileName: 'index',
            formats: ['es'],
        },
        outDir: 'dist',
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                '@operator/core',
                '@operator/store',
                '@operator/api-client',
            ],
            output: {
                preserveModules: false,
            },
        },
        sourcemap: true,
    },
    plugins: [react()],
    test: {
        projects: [
            {
                extends: true,
                plugins: [
                    storybookTest({
                        configDir: path.join(dirname, '.storybook'),
                    }),
                ],
                test: {
                    browser: {
                        enabled: true,
                        headless: true,
                        instances: [
                            {
                                browser: 'chromium',
                            },
                        ],
                        provider: playwright({}),
                    },
                    name: 'storybook',
                    setupFiles: ['.storybook/vitest.setup.ts'],
                },
            },
        ],
    },
})
