/**
 * PatchHistory stories
 *
 * Tests that:
 *
 * 1. Applying a proposal writes a patch to store.patches
 * 2. Patch history is visible (before/after values, source, timestamp)
 * 3. Undo works — invertAppliedPatch() + re-apply rolls the field back
 * 4. Multiple proposals stack correctly (full undo chain)
 *
 * Uses a self-contained PatchHistoryDemo component that renders:
 *
 * - OperatorEditor (left) — apply proposals as normal
 * - PatchLog (right) — live patch history with undo buttons
 *
 * No server needed — mock proposalClient with instant responses.
 */

import { createInMemoryStore } from '@operator/adapter-local'
import {
    type AppliedPatch,
    applyAppliedPatch,
    type FieldProposal,
    invertAppliedPatch,
    type JsonValue,
} from '@operator/core'
import type {
    JsonSchema,
    ProposalClient,
    SchemaResolver,
} from '@operator/store'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { type ReactElement, useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { OperatorEditor } from '../components/OperatorEditor.tsx'

// ─── Schema ───────────────────────────────────────────────────────────────────

const equipmentSchema = z
    .object({
        category: z
            .enum(['Laptop', 'Monitor', 'Server', 'Printer'])
            .optional()
            .meta({ title: 'Category' }),
        manufacturer: z.string().optional().meta({ title: 'Manufacturer' }),
        model: z.string().optional().meta({ title: 'Model' }),
        serialNumber: z.string().optional().meta({ title: 'Serial Number' }),
        status: z
            .enum(['Active', 'In Repair', 'Retired'])
            .optional()
            .meta({ title: 'Status' }),
    })
    .meta({ title: 'Equipment Record' })

const equipmentJsonSchema = z.toJSONSchema(equipmentSchema)

/**
 * ✅ not async — still returns a Promise, but is no longer an "async function" passed to JSX
 */
const schemaResolver: SchemaResolver = (schemaId) =>
    Promise.resolve({ jsonSchema: equipmentJsonSchema as JsonSchema, schemaId })

// ─── Mock proposal client ────────────────────────────────────────────────────
// Returns a fixed set of proposals based on evidence item id.
// Instant — no delay — so you can focus on testing patch behaviour.

const SCENARIOS: Record<string, Array<FieldProposal>> = {
    'item-label': [
        {
            confidence: 'High',
            evidenceItemId: 'item-label',
            excerpt: 'Dell Latitude 7440',
            id: 'p-model',
            path: '/model',
            value: 'Latitude 7440',
        },
        {
            confidence: 'High',
            evidenceItemId: 'item-label',
            excerpt: 'DELL TECHNOLOGIES',
            id: 'p-manufacturer',
            path: '/manufacturer',
            value: 'Dell',
        },
        {
            confidence: 'High',
            evidenceItemId: 'item-label',
            excerpt: 'S/N: DLAT-2025-001',
            id: 'p-serial',
            path: '/serialNumber',
            value: 'DLAT-2025-001',
        },
        {
            confidence: 'High',
            evidenceItemId: 'item-label',
            excerpt: 'Latitude 7440',
            id: 'p-category',
            path: '/category',
            value: 'Laptop',
        },
    ],
    'item-update': [
        {
            confidence: 'High',
            evidenceItemId: 'item-update',
            excerpt: 'sent for repair',
            id: 'p-status',
            path: '/status',
            value: 'In Repair',
        },
        {
            confidence: 'Medium',
            evidenceItemId: 'item-update',
            excerpt: 'replacement unit XPS 15',
            id: 'p-model-update',
            path: '/model',
            value: 'XPS 15',
        },
    ],
}

const mockProposalClient: ProposalClient = ({ evidenceItem }) => {
    return SCENARIOS[evidenceItem.id] ?? []
}

// ─── Seed store ───────────────────────────────────────────────────────────────

function createDemoStore(
    recordId: string,
): ReturnType<typeof createInMemoryStore> {
    const groupId = 'grp-demo'
    return createInMemoryStore({
        evidenceGroupsById: new Map([
            [
                groupId,
                {
                    createdAt: '2025-01-01T00:00:00Z',
                    id: groupId,
                    owner: { kind: 'record', recordId },
                    title: 'Asset Documentation',
                    updatedAt: '2025-01-01T00:00:00Z',
                },
            ],
        ]),
        evidenceItemsById: new Map([
            [
                'item-label',
                {
                    createdAt: '2025-01-01T00:01:00Z',
                    groupId,
                    id: 'item-label',
                    pinned: false,
                    selected: false,
                    text: 'DELL TECHNOLOGIES\nModel: Latitude 7440\nS/N: DLAT-2025-001\nStatus: Active',
                    title: 'Asset label (OCR)',
                    updatedAt: '2025-01-01T00:01:00Z',
                },
            ],
            [
                'item-update',
                {
                    createdAt: '2025-01-02T10:00:00Z',
                    groupId,
                    id: 'item-update',
                    pinned: false,
                    selected: false,
                    text: 'Unit sent for repair 2025-01-02. Replacement unit XPS 15 ordered.',
                    title: 'Repair note',
                    updatedAt: '2025-01-02T10:00:00Z',
                },
            ],
        ]),
        recordsById: new Map([
            [
                recordId,
                {
                    createdAt: '2025-01-01T00:00:00Z',
                    data: {},
                    id: recordId,
                    schemaId: 'equipment.v1',
                    updatedAt: '2025-01-01T00:00:00Z',
                },
            ],
        ]),
    })
}

// ─── PatchLog component ───────────────────────────────────────────────────────

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'string') return `"${value}"`
    return JSON.stringify(value)
}

function PatchLog({
    onUndo,
    patches,
}: {
    patches: Array<AppliedPatch>
    onUndo: (patch: AppliedPatch) => void
}): ReactElement {
    return (
        <div className="patch-log">
            <div className="patch-log__header">
                <h3>Patch History</h3>
                <span className="patch-log__count">
                    {patches.length} patches
                </span>
            </div>

            {patches.length === 0 && (
                <div className="patch-log__empty">
                    <p>No patches yet.</p>
                    <p>Select an evidence item, then apply a proposal.</p>
                </div>
            )}

            <div className="patch-log__list">
                {[...patches].reverse().map((patch) => (
                    <div key={patch.id} className="patch-entry">
                        <div className="patch-entry__header">
                            <code className="patch-entry__path">
                                {patch.path}
                            </code>
                            <span
                                className={`patch-entry__source patch-entry__source--${patch.source}`}>
                                {patch.source}
                            </span>
                        </div>

                        <div className="patch-entry__values">
                            <span className="patch-entry__before">
                                {formatValue(patch.beforeJson)}
                            </span>
                            <span className="patch-entry__arrow">→</span>
                            <span className="patch-entry__after">
                                {formatValue(patch.afterJson)}
                            </span>
                        </div>

                        <div className="patch-entry__footer">
                            <span className="patch-entry__time">
                                {new Date(patch.createdAt).toLocaleTimeString()}
                            </span>
                            <button
                                className="patch-entry__undo"
                                onClick={() => {
                                    onUndo(patch)
                                }}
                                type="button">
                                ↩ Undo
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Demo wrapper ─────────────────────────────────────────────────────────────

function PatchHistoryDemo(): ReactElement {
    const RECORD_ID = 'rec-patch-demo'
    const [store] = useState(() => createDemoStore(RECORD_ID))
    const [patches, setPatches] = useState<Array<AppliedPatch>>([])

    // Poll patch history from store so PatchLog stays in sync
    const pollPatches = useCallback(async (): Promise<void> => {
        const loaded = await store.patches.list(RECORD_ID)
        setPatches(loaded)
    }, [store])

    // Poll on an interval — simple way to keep the log live without
    // threading callbacks through OperatorEditor
    useEffect(() => {
        void pollPatches()
        const interval = setInterval(() => {
            void pollPatches()
        }, 500)
        return () => {
            clearInterval(interval)
        }
    }, [pollPatches])

    const handleUndo = useCallback(
        async (patch: AppliedPatch): Promise<void> => {
            // 1. Load current record
            const record = await store.records.load(RECORD_ID)
            if (!record) return

            // 2. Invert the patch and apply it to the record data
            const inverted = invertAppliedPatch(patch)
            const updated = applyAppliedPatch(
                record.data as unknown as JsonValue,
                inverted,
            )

            // 3. Save the updated record
            await store.records.save({
                ...record,
                data: updated as Record<string, unknown>,
                updatedAt: new Date().toISOString(),
            })

            // 4. Append the inverted patch to history so it's traceable
            await store.patches.append(inverted)
            await pollPatches()
        },
        [store, pollPatches],
    )

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <OperatorEditor
                    proposalClient={mockProposalClient}
                    recordId={RECORD_ID}
                    schemaId="equipment.v1"
                    schemaResolver={schemaResolver}
                    store={store}
                />
            </div>
            <div
                style={{
                    borderLeft: '1px solid #dee2e6',
                    overflowY: 'auto',
                    width: '320px',
                }}>
                <PatchLog patches={patches} onUndo={handleUndo} />
            </div>
        </div>
    )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = `
.patch-log {
    display: flex;
    flex-direction: column;
    height: 100%;
    font-family: system-ui, sans-serif;
}
.patch-log__header {
    padding: 16px;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.patch-log__header h3 { margin: 0; font-size: 16px; font-weight: 600; }
.patch-log__count {
    font-size: 11px;
    background: #e9ecef;
    color: #555;
    padding: 2px 8px;
    border-radius: 10px;
}
.patch-log__empty {
    padding: 16px;
    color: #888;
    font-size: 13px;
    line-height: 1.5;
}
.patch-log__empty p { margin: 0 0 4px; }
.patch-log__list {
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow-y: auto;
}
.patch-entry {
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: #fff;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 5px;
}
.patch-entry__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}
.patch-entry__path {
    font-size: 11px;
    font-family: ui-monospace, monospace;
    background: #f3f4f6;
    padding: 1px 5px;
    border-radius: 3px;
    color: #444;
}
.patch-entry__source {
    font-size: 10px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 10px;
    text-transform: uppercase;
}
.patch-entry__source--proposal { background: #dafbe1; color: #1a7f37; }
.patch-entry__source--manual   { background: #fff3cd; color: #856404; }
.patch-entry__source--system   { background: #f0f0f0; color: #555; }
.patch-entry__values {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
}
.patch-entry__before { color: #c0392b; text-decoration: line-through; }
.patch-entry__arrow  { color: #aaa; }
.patch-entry__after  { color: #1a7f37; font-weight: 500; }
.patch-entry__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.patch-entry__time { font-size: 11px; color: #aaa; }
.patch-entry__undo {
    font-size: 11px;
    padding: 2px 8px;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    cursor: pointer;
    color: #555;
}
.patch-entry__undo:hover { background: #e9ecef; }
`

// Inject styles once
if (typeof document !== 'undefined') {
    const existing = document.getElementById('patch-log-styles')
    if (!existing) {
        const tag = document.createElement('style')
        tag.id = 'patch-log-styles'
        tag.textContent = styles
        document.head.appendChild(tag)
    }
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = {
    component: PatchHistoryDemo,
    parameters: { layout: 'fullscreen' },
    title: 'Testing/PatchHistory',
} satisfies Meta<typeof PatchHistoryDemo>

export { meta }
type Story = StoryObj<typeof meta>

/**
 * Apply proposals and watch the patch log update in real time.
 *
 * How to test:
 *
 * 1. Click "Asset label (OCR)" evidence item to generate proposals
 * 2. Apply individual proposals — each one appears in the patch log
 * 3. Click ↩ Undo on any patch — the field rolls back
 * 4. Click "Repair note" to get a second batch of proposals
 * 5. Apply "/model" — it overwrites the previous value, both in history
 */
export const ApplyAndUndo: Story = {}

/**
 * Same store, pre-apply all proposals from "Asset label" automatically so you can test undo from a fully-filled state
 * without clicking Apply.
 */
export const PreApplied: Story = {
    render: () => {
        // Pre-apply all label proposals before render
        const RECORD_ID = 'rec-preapplied'
        const store = createDemoStore(RECORD_ID)

        void (async () => {
            await Promise.all(
                (SCENARIOS['item-label'] ?? []).map(async (proposal) => {
                    const key = proposal.path.replace(/^\//, '')
                    const record = await store.records.load(RECORD_ID)
                    if (!record) return
                    await store.records.save({
                        ...record,
                        data: {
                            ...(record.data as Record<string, unknown>),
                            [key]: proposal.value,
                        },
                        updatedAt: new Date().toISOString(),
                    })
                    await store.patches.append({
                        afterJson: proposal.value,
                        beforeJson: null,
                        createdAt: new Date().toISOString(),
                        evidenceItemId: proposal.evidenceItemId,
                        id: crypto.randomUUID(),
                        path: proposal.path,
                        recordId: RECORD_ID,
                        source: 'proposal',
                    })
                }),
            )
        })()

        return (
            <div style={{ display: 'flex', height: '100vh' }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <OperatorEditor
                        proposalClient={mockProposalClient}
                        recordId={RECORD_ID}
                        schemaId="equipment.v1"
                        schemaResolver={schemaResolver}
                        store={store}
                    />
                </div>
            </div>
        )
    },
}
