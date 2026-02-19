// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format

import { EsLint } from '@snailicide/build-config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import storybook from 'eslint-plugin-storybook'
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
            '**/scripts/**',
            '**/*.map',
            '**/.venv/**',
            '**/venv/**',
            '**/__pycache__/**',
            '**/*.py', // ignore Python files
            //TODO:REMOVE
            '**/storybook-static/**',
        ],
    }, // Fix: Remove 'project' setting when 'projectService' is enabled
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
        // extends: [tsEslint.configs.disableTypeChecked],
        files: ['**/*.stories.ts'],
        rules: {
            ...storybook.configs['flat/recommended'].rules,
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
