/**
 * @file Commitlint configuration for the Monorepo.
 * @author Gillian Tunney
 * @see [commitlint - Lint commit messages](https://commitlint.js.org/#/)
 */
import { commitlint, CommitlintUserConfig } from '@snailicide/build-config'

const Configuration: CommitlintUserConfig = commitlint.configuration([
    'root',
    'core',
    'ui',
    'playground',
    'api-server',
    'api-client',
    'store',
    'adapter-local',
    'adapter-drizzle',
    'notes',
    'todo:fix disable scope',
])

export default Configuration
