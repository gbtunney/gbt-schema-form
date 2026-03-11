#!/usr/bin/env tsx

import { execCommand } from '../workspace-utils.js'

const out: string = execCommand('git status --porcelain') ?? ''
if (out.length > 0) {
    console.error('Repo is dirty after running release verification steps.')
    console.error(out)
    console.error('\nFix locally, commit generated outputs, and push.')
    process.exit(1)
}

export {}
