import { vitest } from '@snailicide/build-config'
import { mergeConfig, defineConfig } from 'vitest/config'

export default mergeConfig(
    defineConfig(vitest.config()),
    defineConfig({
        test: {
            coverage: {
                exclude: [
                    '**/node_modules/**',
                    '**/dist/**',
                    '**/types/**',
                    '**/*.test.ts',
                    '**/index.ts', // re-export barrels
                ],
                include: ['src/**/*.ts'],
                provider: 'v8',
                reporter: ['text', 'json', 'html'],
            },
        },
    }),
)
