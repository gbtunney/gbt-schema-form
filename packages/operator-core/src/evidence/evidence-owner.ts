import { z } from 'zod'
import { recordIdSchema } from './ids.js'

/**
 * Zod schema and type for evidence ownership.
 * Discriminated union representing who owns an evidence group.
 * - 'record' kind: attached to a specific record
 * - 'draft' kind: not yet attached (floating evidence)
 */
export const evidenceOwnerSchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('record'), recordId: recordIdSchema }),
    z.object({ kind: z.literal('draft') }),
])

export type EvidenceOwner = z.infer<typeof evidenceOwnerSchema>
