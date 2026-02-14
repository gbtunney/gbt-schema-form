import type { RecordId, SchemaId } from '../evidence/ids.js'
import type { JsonValue } from '../json/json-value.js'

/**
 * A snapshot of a record's state at a point in time.
 * Combines schema metadata with the actual JSON document.
 */
export type RecordSnapshot = {
    id: RecordId
    schemaId: SchemaId
    data: JsonValue
    createdAt: string
    updatedAt: string
}
