import type { AttachmentId, EvidenceItemId } from './ids.js'

/**
 * File attachment linked to an evidence item.
 * Bytes are stored externally; this tracks metadata.
 */
export type EvidenceAttachment = {
    id: AttachmentId
    itemId: EvidenceItemId
    url: string
    mimeType: string
    createdAt: string
}
