import { execSync } from 'node:child_process'

const out: string = execSync('git status --porcelain', {
    encoding: 'utf8',
}).trim()
if (out.length > 0) {
    console.error('Repo is dirty after running release verification steps.')
    console.error(out)
    console.error('\nFix locally, commit generated outputs, and push.')
    process.exit(1)
}

export {}
