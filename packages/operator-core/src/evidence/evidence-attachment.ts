import { z } from 'zod'
import { attachmentIdSchema, evidenceItemIdSchema } from './ids.js'
import { isoDateTimeStringSchema } from '../shared.js'

/** File attachment linked to an evidence item. Bytes are stored externally; this tracks metadata. */
export const evidenceAttachmentSchema = z.object({
    createdAt: isoDateTimeStringSchema,
    id: attachmentIdSchema,
    itemId: evidenceItemIdSchema,
    mimeType: z.string(),
    url: z.url(),
})

export type EvidenceAttachment = z.infer<typeof evidenceAttachmentSchema>
