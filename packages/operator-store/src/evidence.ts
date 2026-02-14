import { z } from 'zod'
import { evidenceGroupIdSchema, evidenceItemIdSchema, recordIdSchema } from './ids.js'
import { isoDateTimeStringSchema } from './shared.js'

/**
 * Zod schemas for Evidence domain models.
 * These schemas validate the shape expected by operator-store contracts.
 */

export const evidenceOwnerSchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('record'), recordId: recordIdSchema }),
    z.object({ kind: z.literal('draft') }),
])

export const evidenceGroupSchema = z.object({
    createdAt: isoDateTimeStringSchema,
    id: evidenceGroupIdSchema,
    owner: evidenceOwnerSchema,
    title: z.string(),
    updatedAt: isoDateTimeStringSchema,
})

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

export type EvidenceOwner = z.infer<typeof evidenceOwnerSchema>
export type EvidenceGroup = z.infer<typeof evidenceGroupSchema>
export type EvidenceItem = z.infer<typeof evidenceItemSchema>
