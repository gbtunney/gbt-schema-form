
import type { RollupOptions } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

type PackageJson = {
    main?: string
    types?: string
    dependencies?: Record<string, string>
    peerDependencies?: Record<string, string>
}

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as PackageJson

const packageRootUrl = new URL('.', import.meta.url)
const entryPath = fileURLToPath(new URL('./src/index.ts', packageRootUrl))

const externalModules = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})]

const config: Array<RollupOptions> = [
    {
        external: externalModules,
        input: entryPath,
        output: {
            file: fileURLToPath(new URL(pkg.main ?? './dist/index.js', packageRootUrl)),
            format: 'esm',
            sourcemap: true,
        },
        plugins: [
            esbuild({
                target: 'es2022',
            }),
        ],
    },
    {
        external: externalModules,
        input: entryPath,
        output: {
            file: fileURLToPath(new URL(pkg.types ?? './dist/index.d.ts', packageRootUrl)),
            format: 'esm',
        },
        plugins: [dts()],
    },
]

export default config
