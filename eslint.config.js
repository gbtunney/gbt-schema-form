// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format

import { EsLint } from '@snailicide/build-config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import storybook from 'eslint-plugin-storybook'
import tsEslint from 'typescript-eslint'
import url from 'node:url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const FLAT_CONFIG = await EsLint.flatConfig(__dirname)
/** TODO: something is amiss here - check naming-convention Type regexp- its not complaining so im scared */
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

            /** TODO: this should be fixed in new v of build-config */
            '**/*.{js,cjs,mjs}',
            '**/*.d.*',

            '**/storybook-static/**',
            './packages/operator-api-client/src/generated/**',
        ],
    },
    {
        languageOptions: {
            parserOptions: {
                project: null,
            },
        },
    },
    {
        files: ['**/*'],
        rules: {
            'import/no-default-export': 'off',
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'typeParameter',
                    format: ['PascalCase'],
                    custom: { regex: '^.{2,}$', match: true },
                },
            ],
        },
    },
    ...tsEslint.config({
        extends: [tsEslint.configs.disableTypeChecked],
        files: ['**/*.js', '**/*.d.*'],
        rules: {},
    }),
    ...tsEslint.config({
        files: ['**/*.stories.ts', '**/*.stories.tsx'],
        rules: {
            ...storybook.configs['flat/recommended'].rules,
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    format: ['PascalCase', 'camelCase'],
                    selector: 'function',
                },
            ],
            'filenames-simple/naming-convention': [
                'error',
                { rule: 'PascalCase' },
            ],
        },
    }),
    {
        files: ['**/*.tsx'],
        ...reactHooks.configs.flat.recommended,
        ...reactRefresh.configs.vite,
        rules: {
            // Allow PascalCase for .tsx component files
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    format: ['PascalCase', 'camelCase'],
                    selector: 'function',
                },
            ],
            'filenames-simple/naming-convention': [
                'error',
                { rule: 'PascalCase' },
            ],
            'sort/destructuring-properties': [
                'error',
                { caseSensitive: false, natural: true },
            ],
        },
    },

    // Hook filenames like useAudioRecorder.ts should be camelCase
    {
        files: ['**/use*.ts', '**/use*.tsx'],
        rules: {
            'filenames-simple/naming-convention': [
                'error',
                { rule: 'camelCase' },
            ],
        },
    },

    {
        files: ['**/main.tsx'],
        ...reactHooks.configs.flat.recommended,
        ...reactRefresh.configs.vite,
        rules: {
            'filenames-simple/naming-convention': [
                'error',
                { rule: 'camelCase' },
            ],
        },
    },
]
