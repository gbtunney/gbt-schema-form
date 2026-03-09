import { execSync } from 'child_process'
import path from 'path'

export const getRootGitPath = (): string => {
    const rootStr: string = execSync('git rev-parse --show-toplevel')
        .toString()
        .trim()
    return path.resolve(rootStr)
}
