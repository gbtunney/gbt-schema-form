// In-memory implementation of OperatorStore for demos and offline development.
// This store keeps records in a simple JavaScript Map. Evidence and attachments
// are not implemented here but could be added similarly.

import type { OperatorStore } from '@operator/store'

export function createInMemoryStore(): OperatorStore {
    const records = new Map<string, { data: unknown; schemaId: string }>()
    return {
        async listRecords() {
            return Array.from(records.values()).map((entry) => entry.data)
        },
        async loadRecord(recordId) {
            const entry = records.get(recordId)
            return entry ? entry.data : undefined
        },
        async saveRecord(recordId, data, schemaId) {
            records.set(recordId, { data, schemaId })
        },
    }
}
