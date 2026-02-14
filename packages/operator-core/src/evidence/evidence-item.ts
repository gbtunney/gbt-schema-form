import type { EvidenceGroupId, EvidenceItemId } from './ids.js'

/**
 * A single piece of evidence within a group.
 * Can contain text, attachments, and generate proposals.
 */
export type EvidenceItem = {
    id: EvidenceItemId
    groupId: EvidenceGroupId
    title: string
    text: string
    pinned: boolean
    selected: boolean
    createdAt: string
    updatedAt: string
}
