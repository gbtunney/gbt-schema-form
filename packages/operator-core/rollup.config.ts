import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'

// This configuration is modelled after the template package in the original monorepo.
// It bundles the TypeScript sources into a single ES module and generates a
// declaration file. Adjust the libraryName if you re‑use this template.
const libraryName = 'OperatorCore'

export default defineConfig([
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.js',
            format: 'es',
            sourcemap: true,
        },
        plugins: [
            esbuild({
                target: 'es2019',
                minify: false,
                sourcemap: true,
            }),
        ],
        external: [],
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
