import type { ReactElement } from 'react'

import type { OperatorStore } from '@operator/store'

export type OperatorEditorProps = {
    /** Persistence layer implementation (adapter-provided). */
    store: OperatorStore
}

/**
 * Embeddable Operator UI entrypoint.
 *
 * Constraints:
 * - React-only.
 * - No DB / AI imports.
 * - Patch semantics and data shapes come from `@operator/core`.
 */
export function OperatorEditor(_props: OperatorEditorProps): ReactElement {
    return <div>Operator Editor placeholder</div>
}

export default OperatorEditor
