/** Install in workspace by deleting top level stuff */
import { merge } from '@snailicide/build-config'
import shell from 'shelljs'
import basePkg from './../package.json' assert { type: 'json' }
import monorepoPkg from './monorepo.package.json' assert { type: 'json' }

const FILES = [
    './src',
    './.gitignore',
    './tsconfig.json',
    './package.json',
    './README.md',
    './rollup.config.ts',
]
const DEST = './packages/example-package'

//remove ignored files
shell.exec('rm -rf ./pnpm-lock.yaml ./.idea ./.history')

shell.exec(`mkdir -p ${DEST}`)
shell.exec(`cp -R ${FILES.join(' ')}  ${DEST}`)

//remove files
shell.exec(`rm -rf ./rollup.config.ts ./src`)
//rm  bin exports main types module commonjs files
//pnpm --filter=gbt-boilerplate remove -D  @changesets/cli @commitlint/cli @commitlint/cz-commitlint @commitlint/config-conventional @commitlint/types husky commitizen prettier-plugin-jsdoc prettier-plugin-sh lint-staged shelljs @types/shelljs
const mergedPackage = merge(basePkg, monorepoPkg)
