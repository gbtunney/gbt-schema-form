import { JsonSchemaType } from '@operator/core'

import type { EvidenceItem, OperatorStore, RecordDoc, SchemaResolver } from '@operator/store'
import type { RJSFSchema } from '@rjsf/utils'
import { type ReactElement, useCallback, useEffect, useState } from 'react'

import { EvidencePane } from './evidence-pane.tsx'
import { FormPane } from './form-pane.tsx'
import './operator-editor.css'

export type OperatorEditorProps = {
    recordId?: string
    schemaId: string
    schemaResolver: SchemaResolver
    store: OperatorStore
}

/**
 * Main editor layout.
 * Two-pane view: EvidencePane on the left, FormPane on the right.
 * Manages record loading/saving and schema resolution.
 */
export function OperatorEditor({
    recordId,
    schemaId,
    schemaResolver,
    store,
}: OperatorEditorProps): ReactElement {
    const [schema, setSchema] = useState<RJSFSchema | null>(null)
    const [record, setRecord] = useState<RecordDoc | null>(null)
    const [formData, setFormData] = useState<Record<string, JsonSchemaType>>({})
    const [activeRecordId, setActiveRecordId] = useState<string | undefined>(recordId)
    const [statusMessage, setStatusMessage] = useState('')

    /** Resolve the JSON Schema on mount */
    useEffect(() => {
        void schemaResolver(schemaId).then((resolved) => {
            setSchema(resolved.jsonSchema as RJSFSchema)
        })
    }, [schemaResolver, schemaId])

    /** Load existing record if recordId provided */
    useEffect(() => {
        if (activeRecordId) {
            void store.records.load(activeRecordId).then((loaded) => {
                if (loaded) {
                    setRecord(loaded)
                    setFormData((loaded.data ?? {}) as Record<string, JsonSchemaType>)
                }
            })
        }
    }, [store, activeRecordId])

    /** Save form data changes to the store */
    const handleFormChange = useCallback(
        (updatedData: Record<string, JsonSchemaType>) => {
            setFormData(updatedData)

            const currentRecordId = activeRecordId ?? crypto.randomUUID()
            if (!activeRecordId) {
                setActiveRecordId(currentRecordId)
            }

            const now = new Date().toISOString()
            const recordToSave: RecordDoc = {
                createdAt: record?.createdAt ?? now,
                data: updatedData,
                id: currentRecordId,
                schemaId,
                updatedAt: now,
            }

            void store.records.save(recordToSave).then(() => {
                setRecord(recordToSave)
                setStatusMessage('Saved')
                setTimeout(() => {
                    setStatusMessage('')
                }, 1500)
            })
        },
        [store, activeRecordId, record, schemaId],
    )

    /** Handle evidence item selection (for future proposal integration) */
    const handleItemSelect = useCallback((_item: EvidenceItem) => {
        /**
         * Placeholder for proposal generation. When AI is integrated, selected
         * evidence items will trigger the ProposalClient to generate field proposals.
         */
    }, [])

    /** Derive the evidence owner from record state */
    const evidenceOwner = activeRecordId
        ? { kind: 'record' as const, recordId: activeRecordId }
        : { kind: 'draft' as const }

    if (!schema) {
        return <div className="operator-editor operator-editor--loading">Loading schema...</div>
    }

    return (
        <div className="operator-editor">
            <div className="operator-editor__sidebar">
                <EvidencePane onItemSelect={handleItemSelect} owner={evidenceOwner} store={store} />
            </div>
            <div className="operator-editor__main">
                {statusMessage && <div className="operator-editor__status">{statusMessage}</div>}
                <FormPane formData={formData} onChange={handleFormChange} schema={schema} />
            </div>
        </div>
    )
}
