import {
    type EvidenceItem,
    type FieldProposal,
    JsonSchemaType,
    type RecordDoc,
} from '@operator/core'

import type {
    OperatorStore,
    ProposalClient,
    SchemaResolver,
} from '@operator/store'
import type { RJSFSchema } from '@rjsf/utils'
import { type ReactElement, useCallback, useEffect, useState } from 'react'

import { EvidencePane } from './EvidencePane.tsx'
import { FormPane } from './FormPane.tsx'
import { ProposalsPane } from './ProposalsPane.tsx'
import './operator-editor.css'

export type OperatorEditorProps = {
    recordId?: string
    schemaId: string
    schemaResolver: SchemaResolver
    store: OperatorStore
    /** Optional AI proposal client. When provided, selecting an evidence item triggers proposal generation. */
    proposalClient?: ProposalClient
    /** Base URL of api-server for Whisper transcription, e.g. "http://localhost:3001". Omit for mock mode. */
    transcribeUrl?: string
}

/**
 * Main editor layout.
 *
 * - Two-pane (Evidence | Form) when no proposalClient provided.
 * - Three-pane (Evidence | Proposals | Form) when proposalClient is provided.
 *
 * Flow: select evidence item → proposalClient generates FieldProposals → apply arrow → patch saved.
 */
export function OperatorEditor({
    proposalClient,
    recordId,
    schemaId,
    schemaResolver,
    store,
    transcribeUrl,
}: OperatorEditorProps): ReactElement {
    const [schema, setSchema] = useState<RJSFSchema | null>(null)
    const [record, setRecord] = useState<RecordDoc | null>(null)
    const [formData, setFormData] = useState<Record<string, JsonSchemaType>>({})
    const [activeRecordId, setActiveRecordId] = useState<string | undefined>(
        recordId,
    )
    const [statusMessage, setStatusMessage] = useState('')

    const [proposals, setProposals] = useState<Array<FieldProposal>>([])
    const [proposalsLoading, setProposalsLoading] = useState(false)
    const [activeEvidenceItem, setActiveEvidenceItem] =
        useState<EvidenceItem | null>(null)

    useEffect(() => {
        void schemaResolver(schemaId).then(
            (resolved: { schemaId: string; jsonSchema: unknown }) => {
                setSchema(resolved.jsonSchema as RJSFSchema)
            },
        )
    }, [schemaResolver, schemaId])

    useEffect(() => {
        if (activeRecordId) {
            void store.records.load(activeRecordId).then((loaded) => {
                if (loaded) {
                    setRecord(loaded)
                    setFormData(
                        (loaded.data ?? {}) as Record<string, JsonSchemaType>,
                    )
                }
            })
        }
    }, [store, activeRecordId])

    const handleFormChange = useCallback(
        (updatedData: Record<string, JsonSchemaType>) => {
            setFormData(updatedData)
            const currentRecordId = activeRecordId ?? crypto.randomUUID()
            if (!activeRecordId) setActiveRecordId(currentRecordId)
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

    /** Select an evidence item → run proposalClient → populate proposals pane */
    const handleItemSelect = useCallback(
        (item: EvidenceItem) => {
            if (!proposalClient) return
            setActiveEvidenceItem(item)
            setProposals([])
            setProposalsLoading(true)
            const currentRecordId = activeRecordId ?? crypto.randomUUID()
            if (!activeRecordId) setActiveRecordId(currentRecordId)
            void proposalClient({
                evidenceItem: item,
                recordData: formData,
                recordId: currentRecordId,
                schemaId,
            })
                .then(setProposals)
                .finally(() => {
                    setProposalsLoading(false)
                })
        },
        [proposalClient, activeRecordId, formData, schemaId],
    )

    /** Apply a proposal: write value into formData at path + append patch for undo history */
    const handleApplyProposal = useCallback(
        (proposal: FieldProposal) => {
            const key = proposal.path.replace(/^\//, '')
            const updatedData = {
                ...formData,
                [key]: proposal.value,
            }
            handleFormChange(updatedData)
            if (activeRecordId) {
                void store.patches.append({
                    afterJson: proposal.value,
                    beforeJson: (formData[key] ??
                        null) as unknown as typeof proposal.value,
                    createdAt: new Date().toISOString(),
                    evidenceItemId: activeEvidenceItem?.id ?? null,
                    id: crypto.randomUUID(),
                    path: proposal.path,
                    recordId: activeRecordId,
                    source: 'proposal',
                })
            }
        },
        [formData, handleFormChange, store, activeRecordId, activeEvidenceItem],
    )

    const evidenceOwner = activeRecordId
        ? { kind: 'record' as const, recordId: activeRecordId }
        : { kind: 'draft' as const }

    if (!schema) {
        return (
            <div className="operator-editor operator-editor--loading">
                Loading schema...
            </div>
        )
    }

    return (
        <div className="operator-editor">
            <div className="operator-editor__sidebar">
                <EvidencePane
                    onItemSelect={handleItemSelect}
                    owner={evidenceOwner}
                    store={store}
                    transcribeUrl={transcribeUrl}
                />
            </div>

            {proposalClient && (
                <div className="operator-editor__proposals">
                    <ProposalsPane
                        currentData={formData}
                        evidenceItem={activeEvidenceItem}
                        loading={proposalsLoading}
                        proposals={proposals}
                        onApply={handleApplyProposal}
                        onApplyAll={(batch) => {
                            batch.forEach(handleApplyProposal)
                        }}
                    />
                </div>
            )}

            <div className="operator-editor__main">
                {statusMessage && (
                    <div className="operator-editor__status">
                        {statusMessage}
                    </div>
                )}
                <FormPane
                    formData={formData}
                    onChange={handleFormChange}
                    schema={schema}
                />
            </div>
        </div>
    )
}
