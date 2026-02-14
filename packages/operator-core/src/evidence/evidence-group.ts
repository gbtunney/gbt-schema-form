import type { EvidenceOwner } from './evidence-owner.js'
import type { EvidenceGroupId } from './ids.js'

/**
 * A collection of related evidence items.
 * Groups can be owned by a record or exist as drafts.
 */
export type EvidenceGroup = {
    id: EvidenceGroupId
    owner: EvidenceOwner
    title: string
    createdAt: string
    updatedAt: string
}
