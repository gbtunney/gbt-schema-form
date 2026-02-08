import { EsLint } from '@snailicide/build-config'
import tsEslint from 'typescript-eslint'
import url from 'node:url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const FLAT_CONFIG = await EsLint.flatConfig(__dirname)

export default [
    ...FLAT_CONFIG,
    {
        ignores: [
            '**/.history/**',
            '**/scratch/**',
            '**/*.map',
            '**/.venv/**',
            '**/venv/**',
            '**/__pycache__/**',
            '**/*.py', // ignore Python files
            // './packages/google-calendar-util'
        ],
    },
    // Fix: Remove 'project' setting when 'projectService' is enabled
    {
        languageOptions: {
            parserOptions: {
                project: null,
            },
        },
    },
    ...tsEslint.config({
        extends: [tsEslint.configs.disableTypeChecked],
        files: ['**/*.js', '**/*.d.*'],
        rules: {},
    }),
    ...tsEslint.config({
        files: ['./packages/netgear-reboot/**/*.ts'],
        rules: {
            '@typescript-eslint/explicit-function-return-type': 'warn',
            '@typescript-eslint/no-floating-promises': 'warn',
        },
    }),

    {},
]
