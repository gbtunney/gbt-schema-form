import React from 'react'

// Placeholder UI components for the operator. These will eventually render the
// evidence editor, proposal lists and forms. They accept a store and clients
// via props to remain backend agnostic.

export type OperatorEditorProps = {
    /** You would pass the persistence layer implementation here */
    store: unknown
}

export const OperatorEditor: React.FC<OperatorEditorProps> = ({ store }) => {
    return <div>Operator Editor placeholder - implement UI here.</div>
}

export default OperatorEditor
