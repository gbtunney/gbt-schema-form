import { z } from 'zod'
import { recordIdSchema, schemaIdSchema } from './ids.js'
import { isoDateTimeStringSchema } from './shared.js'

/**
 * Zod schema for Record documents.
 * data is JsonValue type from zod.
 */

export const recordDocSchema = z.object({
    createdAt: isoDateTimeStringSchema,
    data: z.json(),
    id: recordIdSchema,
    schemaId: schemaIdSchema,
    updatedAt: isoDateTimeStringSchema,
})

export type RecordDoc = z.infer<typeof recordDocSchema>
