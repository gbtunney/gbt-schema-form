import { z } from 'zod'
import { recordIdSchema, schemaIdSchema } from '../evidence/ids.js'
import { jsonValueSchema } from '../json/json-value.js'
import { isoDateTimeStringSchema } from '../shared.js'

/**
 * A snapshot of a record's state at a point in time.
 * Combines schema metadata with the actual JSON document.
 */
export const recordSnapshotSchema = z.object({
    createdAt: isoDateTimeStringSchema,
    data: jsonValueSchema,
    id: recordIdSchema,
    schemaId: schemaIdSchema,
    updatedAt: isoDateTimeStringSchema,
})

export type RecordSnapshot = z.infer<typeof recordSnapshotSchema>

/** Alias for compatibility with store nomenclature */
export const recordDocSchema = recordSnapshotSchema
export type RecordDoc = RecordSnapshot
