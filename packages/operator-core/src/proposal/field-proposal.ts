import type { EvidenceItemId } from '../evidence/ids.js'
import type { JsonValue } from '../json/json-value.js'

/**
 * AI-generated proposal for filling a specific field.
 * Derived from an evidence item.
 */
export type FieldProposal = {
    id: string
    evidenceItemId: EvidenceItemId
    path: string
    value: JsonValue
    confidence: 'High' | 'Medium' | 'Low'
    excerpt?: string
}
