import { z } from 'zod'
import { evidenceOwnerSchema } from './evidence-owner.js'
import { evidenceGroupIdSchema } from './ids.js'
import { isoDateTimeStringSchema } from '../shared.js'

/**
 * A collection of related evidence items.
 * Groups can be owned by a record or exist as drafts.
 */
export const evidenceGroupSchema = z.object({
    createdAt: isoDateTimeStringSchema,
    id: evidenceGroupIdSchema,
    owner: evidenceOwnerSchema,
    title: z.string(),
    updatedAt: isoDateTimeStringSchema,
})

export type EvidenceGroup = z.infer<typeof evidenceGroupSchema>
