/**
 * @file Commitlint configuration for the Monorepo.
 * @author Gillian Tunney
 * @see [commitlint - Lint commit messages](https://commitlint.js.org/#/)
 */
import { commitlint, CommitlintUserConfig } from '@snailicide/build-config'

const Configuration: CommitlintUserConfig = commitlint.configuration([
    'root',
    'core',
    'store',
    'ui',
    'adapter-local',
    'adapter-drizzle',
    'api',
    'notes',
    '@gbt/example-package',
    'todo:fix disable scope',
])

export default Configuration
