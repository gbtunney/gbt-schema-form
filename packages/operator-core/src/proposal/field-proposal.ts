import { z } from 'zod'
import { evidenceItemIdSchema } from '../evidence/ids.js'
import { jsonValueSchema } from '../json/json-value.js'

/**
 * AI-generated proposal for filling a specific field.
 * Derived from an evidence item.
 */
export const fieldProposalSchema = z.object({
    confidence: z.enum(['High', 'Medium', 'Low']),
    evidenceItemId: evidenceItemIdSchema,
    excerpt: z.string().optional(),
    id: z.string(),
    path: z.string(),
    value: jsonValueSchema,
})

export type FieldProposal = z.infer<typeof fieldProposalSchema>
