import type { Id, IsoDateTimeString, JsonValue, RecordSnapshot } from '@operator/core'
import type { OperatorStore } from '@operator/store'

export type InMemoryStoreState = {
    recordsById: Record<string, RecordSnapshot>
}

function nowIsoString(): IsoDateTimeString {
    return new Date().toISOString()
}

/**
 * In-memory `OperatorStore` for demos and offline development.
 *
 * Intentional constraints:
 * - JSON-only payloads (`JsonValue`).
 * - No persistence across reloads.
 */
export function createInMemoryStore(initialState?: InMemoryStoreState): OperatorStore {
    let state: InMemoryStoreState = initialState ?? { recordsById: {} }

    return {
        async listRecords(args) {
            const all = Object.values(state.recordsById)
            if (args?.schemaId === undefined) return all
            return all.filter((snapshot) => snapshot.schemaId === args.schemaId)
        },
        async loadRecord(recordId) {
            return state.recordsById[recordId]
        },
        async saveRecord(snapshot) {
            state = {
                ...state,
                recordsById: {
                    ...state.recordsById,
                    [snapshot.recordId]: {
                        ...snapshot,
                        updatedAt: snapshot.updatedAt ?? nowIsoString(),
                    },
                },
            }
        },
    }
}

/** Creates a new record snapshot from JSON data. */
export function createRecordSnapshot(args: {
    recordId: Id
    schemaId: Id
    data: JsonValue
    updatedAt?: IsoDateTimeString
}): RecordSnapshot {
    return {
        data: args.data,
        recordId: args.recordId,
        schemaId: args.schemaId,
        updatedAt: args.updatedAt ?? nowIsoString(),
    }
}
