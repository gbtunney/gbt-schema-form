import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

// This configuration is modelled after the template package in the original monorepo.
// It bundles the TypeScript sources into a single ES module and generates a
// declaration file. Adjust the libraryName if you re‑use this template.
const libraryName = 'OperatorCore'

export default defineConfig([
    {
        external: [],
        input: 'src/index.ts',
        output: {
            file: 'dist/index.js',
            format: 'es',
            sourcemap: true,
        },
        plugins: [
            esbuild({
                minify: false,
                target: 'es2019',
                // sourcemap: true,
            }),
        ],
    },
    {
        // generate corresponding declaration file
        input: 'dist/dts/index.d.ts',
        output: {
            file: 'dist/index.d.ts',
            format: 'es',
        },
        plugins: [dts()],
    },
])
