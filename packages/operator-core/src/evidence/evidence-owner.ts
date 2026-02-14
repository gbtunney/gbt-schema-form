import type { RecordId } from './ids.js'

/**
 * Discriminated union representing who owns an evidence group.
 * - 'record' kind: attached to a specific record
 * - 'draft' kind: not yet attached (floating evidence)
 */
export type EvidenceOwner = { kind: 'record'; recordId: RecordId } | { kind: 'draft' }
