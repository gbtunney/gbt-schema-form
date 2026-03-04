/** Install in workspace by deleting top level stuff */
import shell from 'shelljs'

shell.exec('rm -rf  ./.github ./.changeset ./.husky')
shell.exec(
    'rm -rf ./pnpm-workspace.yaml ./commitlint.config.ts ./eslint.config.js ./prettier.config.ts ./pnpm-lock.yaml',
)

//remove ignored files
shell.exec('rm -rf ./pnpm-lock.yaml ./.idea ./.history')
