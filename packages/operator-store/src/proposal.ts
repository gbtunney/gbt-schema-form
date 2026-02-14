import { z } from 'zod'
import { evidenceItemIdSchema } from './ids.js'

/**
 * Zod schema for AI-generated field proposals.
 */

export const fieldProposalSchema = z.object({
    confidence: z.enum(['High', 'Medium', 'Low']),
    evidenceItemId: evidenceItemIdSchema,
    excerpt: z.string().optional(),
    id: z.string(),
    path: z.string(),
    value: z.json(),
})

export type FieldProposal = z.infer<typeof fieldProposalSchema>
