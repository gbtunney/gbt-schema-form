import type { Config as PrettierConfig } from 'prettier'

const config: PrettierConfig = {
    overrides: [
        {
            files: '.husky/*',
            options: {
                parser: 'sh',
            },
        },
        {
            files: '**/*.md',
            options: {
                printWidth: 110,
                proseWrap: 'always',
            },
        },
    ],
    plugins: ['@prettier/plugin-xml', 'prettier-plugin-sh'],
    printWidth: 110,
    semi: false,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'all',
}

export default config
