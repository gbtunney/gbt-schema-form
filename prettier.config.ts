import { merge, Prettier } from '@snailicide/build-config'
import type { Config as PrettierConfig } from 'prettier'

const overrides: PrettierConfig = {
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
                tabWidth: 2,
            },
        },
    ],

    plugins: ['@prettier/plugin-xml'],
}

const default_config: PrettierConfig = Prettier.config
const config: PrettierConfig = merge(default_config, overrides)
export default config
