import type { AppliedPatch, EvidenceGroup, EvidenceItem, RecordDoc } from '@operator/core'
import type { OperatorStore } from '@operator/store'

/**
 * In-memory state for the local adapter.
 */
export type InMemoryStoreState = {
    recordsById: Map<string, RecordDoc>
    evidenceGroupsById: Map<string, EvidenceGroup>
    evidenceItemsById: Map<string, EvidenceItem>
    patchesByRecordId: Map<string, Array<AppliedPatch>>
}

function nowIsoString(): string {
    return new Date().toISOString()
}

function generateId(): string {
    return crypto.randomUUID()
}

/**
 * In-memory `OperatorStore` for demos and offline development.
 *
 * Intentional constraints:
 * - JSON-only payloads.
 * - No persistence across reloads.
 * - All operations are synchronous wrapped in Promise.
 */
export function createInMemoryStore(initialState?: Partial<InMemoryStoreState>): OperatorStore {
    const state: InMemoryStoreState = {
        evidenceGroupsById: (initialState?.evidenceGroupsById ?? new Map()) as Map<string, EvidenceGroup>,
        evidenceItemsById: (initialState?.evidenceItemsById ?? new Map()) as Map<string, EvidenceItem>,
        patchesByRecordId: (initialState?.patchesByRecordId ?? new Map()) as Map<string, Array<AppliedPatch>>,
        recordsById: (initialState?.recordsById ?? new Map()) as Map<string, RecordDoc>,
    }

    return {
        evidenceGroups: {
            async create(args): Promise<EvidenceGroup> {
                const now = nowIsoString()
                const group: EvidenceGroup = {
                    createdAt: now,
                    id: generateId(),
                    owner: args.owner,
                    title: args.title,
                    updatedAt: now,
                }
                state.evidenceGroupsById.set(group.id, group)
                return Promise.resolve(group)
            },

            async list(owner): Promise<Array<EvidenceGroup>> {
                const allGroups = Array.from(state.evidenceGroupsById.values())

                if (owner.kind === 'draft') {
                    return Promise.resolve(allGroups.filter((g) => g.owner.kind === 'draft'))
                }

                return Promise.resolve(
                    allGroups.filter((g) => g.owner.kind === 'record' && g.owner.recordId === owner.recordId),
                )
            },
        },

        evidenceItems: {
            async create(args): Promise<EvidenceItem> {
                const now = nowIsoString()
                const item: EvidenceItem = {
                    createdAt: now,
                    groupId: args.groupId,
                    id: generateId(),
                    pinned: false,
                    selected: false,
                    text: args.text,
                    title: args.title,
                    updatedAt: now,
                }
                state.evidenceItemsById.set(item.id, item)
                return Promise.resolve(item)
            },

            async list(groupId): Promise<Array<EvidenceItem>> {
                return Promise.resolve(
                    Array.from(state.evidenceItemsById.values()).filter((item) => item.groupId === groupId),
                )
            },

            async update(args: {
                id: string
                patch: Partial<Omit<EvidenceItem, 'id' | 'groupId' | 'createdAt'>>
            }): Promise<EvidenceItem> {
                const existing = state.evidenceItemsById.get(args.id)
                if (!existing) {
                    return Promise.reject(new Error(`EvidenceItem not found: ${args.id}`))
                }

                const updated: EvidenceItem = {
                    ...existing,
                    ...args.patch,
                    createdAt: existing.createdAt,
                    groupId: existing.groupId,
                    id: existing.id,
                    updatedAt: nowIsoString(),
                }

                state.evidenceItemsById.set(updated.id, updated)
                return Promise.resolve(updated)
            },
        },

        patches: {
            async append(patch): Promise<void> {
                const existing = state.patchesByRecordId.get(patch.recordId) ?? []
                state.patchesByRecordId.set(patch.recordId, [...existing, patch])
                return Promise.resolve()
            },

            async list(recordId): Promise<Array<AppliedPatch>> {
                return Promise.resolve(state.patchesByRecordId.get(recordId) ?? [])
            },
        },

        records: {
            async list(): Promise<Array<RecordDoc>> {
                return Promise.resolve(Array.from(state.recordsById.values()))
            },

            async load(recordId: string): Promise<RecordDoc | null> {
                const record = state.recordsById.get(recordId)
                return Promise.resolve(record ?? null)
            },

            async save(record): Promise<void> {
                const existing = state.recordsById.get(record.id)
                state.recordsById.set(record.id, {
                    ...record,
                    createdAt: existing?.createdAt ?? record.createdAt ?? nowIsoString(),
                    updatedAt: nowIsoString(),
                })
                return Promise.resolve()
            },
        },
    }
}
