import { EsLint } from '@snailicide/build-config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
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
    // Allow PascalCase for .tsx component files
    {
        files: ['**/*.tsx'],
        ...reactHooks.configs.flat.recommended,
        ...reactRefresh.configs.vite,
        rules: {
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    format: ['PascalCase', 'camelCase'],
                    selector: 'function',
                },
            ],
            'filenames-simple/naming-convention': ['error', { rule: 'PascalCase' }],
        },
    },
    {},
]
