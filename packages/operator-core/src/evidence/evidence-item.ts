import { z } from 'zod'
import { evidenceGroupIdSchema, evidenceItemIdSchema } from './ids.js'
import { isoDateTimeStringSchema } from '../shared.js'

/**
 * A single piece of evidence within a group.
 * Can contain text, attachments, and generate proposals.
 */
export const evidenceItemSchema = z.object({
    createdAt: isoDateTimeStringSchema,
    groupId: evidenceGroupIdSchema,
    id: evidenceItemIdSchema,
    pinned: z.boolean(),
    selected: z.boolean(),
    text: z.string(),
    title: z.string(),
    updatedAt: isoDateTimeStringSchema,
})

export type EvidenceItem = z.infer<typeof evidenceItemSchema>
