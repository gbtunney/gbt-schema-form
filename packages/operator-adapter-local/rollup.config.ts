import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

const libraryName = 'OperatorAdapterLocal'

export default defineConfig([
    {
        external: ['@operator/core', '@operator/store'],
        input: 'src/index.ts',
        output: {
            file: 'dist/index.js',
            format: 'es',
            sourcemap: true,
        },
        plugins: [esbuild({ minify: false, sourcemap: true, target: 'es2019' })],
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
