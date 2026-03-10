/**
 * Operator Playground
 *
 * Three-panel layout inspired by the RJSF playground:
 *
 * Left — SchemaPanel: paste Zod or JSON Schema, click Apply Middle — OperatorEditor: full 3-pane (Evidence | Proposals
 *
 * | Form) Right — StatePanel: live formData, patch history, raw proposals
 *
 * The editor remounts when a new schema is applied (key prop), giving a fresh in-memory store each time.
 *
 * API URL can be set via VITE_API_URL or typed into the URL bar at the top. No restart needed — same pattern as the
 * LiveApi Storybook story.
 */

import { createInMemoryStore } from '@operator/adapter-local'
import { createProposalClient } from '@operator/api-client'
import type { AppliedPatch, FieldProposal } from '@operator/core'
import type {
    OperatorStore,
    ProposalRequest,
    SchemaResolver,
} from '@operator/store'
import { OperatorEditor } from '@operator/ui'
import {
    type ReactElement,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react'
import { SchemaPanel } from './components/SchemaPanel.tsx'
import { StatePanel } from './components/StatePanel.tsx'

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveSchema = {
    jsonSchema: unknown
    schemaId: string
}

// ─── Default schema (pet record — matches SchemaPanel default) ────────────────

const DEFAULT_SCHEMA: ActiveSchema = {
    jsonSchema: {
        properties: {
            birthday: { format: 'date', title: 'Birthday', type: 'string' },
            name: { title: 'Name', type: 'string' },
            notes: { title: 'Notes', type: 'string' },
            species: {
                enum: ['cat', 'dog', 'lizard', 'fish'],
                title: 'Species',
                type: 'string',
            },
        },
        required: ['name', 'species'],
        title: 'Pet Record',
        type: 'object',
    },
    schemaId: 'playground-default',
}

const DEFAULT_API_URL =
    (import.meta.env['VITE_API_URL'] as string | undefined) ??
    'http://localhost:3001'

// ─── Styles ───────────────────────────────────────────────────────────────────

const TOOLBAR: React.CSSProperties = {
    alignItems: 'center',
    background: '#f8f8f8',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    flexShrink: 0,
    gap: 8,
    padding: '6px 12px',
}

const COLUMNS: React.CSSProperties = {
    display: 'grid',
    flex: 1,
    gridTemplateColumns: '280px 1fr 280px',
    overflow: 'hidden',
}

const URL_INPUT: React.CSSProperties = {
    border: '1px solid #ccc',
    borderRadius: 4,
    flex: 1,
    fontFamily: 'ui-monospace, "Cascadia Code", Menlo, monospace',
    fontSize: 11,
    padding: '3px 8px',
}

const CONNECT_BTN = (connected: boolean): React.CSSProperties => ({
    background: connected ? '#2d7d2d' : '#0066cc',
    border: 'none',
    borderRadius: 4,
    color: '#fff',
    cursor: 'pointer',
    fontSize: 11,
    padding: '4px 12px',
    whiteSpace: 'nowrap',
})

const TITLE: React.CSSProperties = {
    color: '#333',
    fontSize: 13,
    fontWeight: 700,
    marginRight: 8,
    whiteSpace: 'nowrap',
}

// ─── State-intercepting store wrapper ─────────────────────────────────────────
// Wraps an OperatorStore and intercepts patch appends so we can surface them
// in the StatePanel without touching the OperatorEditor internals.

function createObservableStore(
    inner: OperatorStore,
    onPatch: (patch: AppliedPatch) => void,
    onSave: (data: Record<string, unknown>) => void,
): OperatorStore {
    return {
        ...inner,
        patches: {
            ...inner.patches,
            append: async (patch): Promise<void> => {
                await inner.patches.append(patch)
                onPatch(patch)
            },
        },
        records: {
            ...inner.records,
            save: async (record): Promise<void> => {
                await inner.records.save(record)
                onSave(record.data as Record<string, unknown>)
            },
        },
    }
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App(): ReactElement {
    // Schema state
    const [activeSchema, setActiveSchema] =
        useState<ActiveSchema>(DEFAULT_SCHEMA)
    const [schemaError, setSchemaError] = useState<string | null>(null)
    const [editorKey, setEditorKey] = useState(0)

    // API URL bar
    const [urlInput, setUrlInput] = useState(DEFAULT_API_URL)
    const [activeUrl, setActiveUrl] = useState(DEFAULT_API_URL)
    const [connected, setConnected] = useState(false)

    // State inspector
    const [formData, setFormData] = useState<Record<string, unknown>>({})
    const [patches, setPatches] = useState<Array<AppliedPatch>>([])
    const [proposals, setProposals] = useState<Array<FieldProposal>>([])

    // Stable ref to patch accumulator (survives re-renders without remounting)
    const patchesRef = useRef<Array<AppliedPatch>>([])

    // Schema resolver rebuilds when schema changes
    const schemaResolver = useMemo((): SchemaResolver => {
        return async (schemaId: string) =>
            Promise.resolve({
                jsonSchema: activeSchema.jsonSchema,
                schemaId,
            })
    }, [activeSchema])

    // Store + proposalClient rebuild when URL or schema changes
    const { proposalClient, store } = useMemo(() => {
        patchesRef.current = []
        setPatches([])
        setFormData({})
        setProposals([])

        const inner = createInMemoryStore()
        const observable = createObservableStore(
            inner,
            (patch) => {
                patchesRef.current = [...patchesRef.current, patch]
                setPatches([...patchesRef.current])
            },
            (data) => {
                setFormData(data)
            },
        )

        return {
            proposalClient: createProposalClient({ baseUrl: activeUrl }),
            store: observable,
        }
    }, [activeUrl, activeSchema.schemaId])

    const handleSchemaChange = useCallback(
        (jsonSchema: unknown, schemaId: string) => {
            setActiveSchema({ jsonSchema, schemaId })
            setEditorKey((k) => k + 1)
            setSchemaError(null)
        },
        [],
    )

    const handleConnect = useCallback(() => {
        const trimmed = urlInput.trim().replace(/\/$/, '')
        setActiveUrl(trimmed)
        setConnected(true)
    }, [urlInput])

    return (
        <>
            {/* Toolbar */}
            <div style={TOOLBAR}>
                <span style={TITLE}>⚙ Operator Playground</span>

                <span style={{ color: '#888', flexShrink: 0, fontSize: 11 }}>
                    API URL
                </span>
                <input
                    style={URL_INPUT}
                    type="text"
                    value={urlInput}
                    placeholder="https://your-codespace-3001.app.github.dev"
                    onChange={(e) => {
                        setUrlInput(e.target.value)
                        setConnected(false)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConnect()
                    }}
                />
                <button style={CONNECT_BTN(connected)} onClick={handleConnect}>
                    {connected ? '✓ Connected' : 'Connect'}
                </button>

                {schemaError && (
                    <span
                        style={{
                            color: '#c0392b',
                            flexShrink: 0,
                            fontSize: 11,
                        }}>
                        ⚠ {schemaError}
                    </span>
                )}
            </div>

            {/* Three columns */}
            <div style={COLUMNS}>
                {/* Left — schema input */}
                <SchemaPanel
                    onSchemaChange={handleSchemaChange}
                    onError={setSchemaError}
                />

                {/* Middle — operator editor */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}>
                    <OperatorEditor
                        key={editorKey}
                        schemaId={activeSchema.schemaId}
                        schemaResolver={schemaResolver}
                        store={store}
                        proposalClient={async (req: ProposalRequest) => {
                            const result = await proposalClient(req)
                            setProposals(result)
                            return result
                        }}
                    />
                </div>

                {/* Right — state inspector */}
                <StatePanel
                    formData={formData}
                    patches={patches}
                    proposals={proposals}
                />
            </div>
        </>
    )
}
