import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'

const libraryName = 'OperatorStore'

export default defineConfig([
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.js',
            format: 'es',
            sourcemap: true,
        },
        plugins: [
            esbuild({ target: 'es2019', minify: false, sourcemap: true }),
        ],
        external: ['@operator/core'],
    },
    {
        input: 'dist/dts/index.d.ts',
        output: {
            file: 'dist/index.d.ts',
            format: 'es',
        },
        plugins: [dts()],
    },
])
