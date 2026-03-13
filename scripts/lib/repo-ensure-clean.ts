import { getExecCommandOutput } from './shell-utilities.js'

const isRepoClean = (): boolean => {
    const _resultObj = getExecCommandOutput('git status --porcelain')
    return _resultObj.success && _resultObj.result === ''
}

//todo: return other repo stats
if (!isRepoClean()) {
    const _resultObj = getExecCommandOutput('git status --porcelain')

    if (!_resultObj.success) {
        console.error('Repo is dirty after running release verification steps.')
        console.error(_resultObj.result)
        console.error('\nFix locally, commit generated outputs, and push.')
        process.exit(1)
    }
}
