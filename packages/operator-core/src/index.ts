/**
 * Pure core exports.
 *
 * Constraints:
 *
 * - No classes
 * - No interface
 * - No any (use unknown only at true boundaries)
 * - ESM TypeScript
 * - Local relative imports include ".js"
 *
 * @packageDocumentation
 */

/** Equality and normalization */
export { isEffectivelySame, jsonEquals } from './compare/equality.js'
export { normalizePointerValue } from './compare/normalize.js'

/** Evidence domain models (types + schemas) */
export {
    type EvidenceAttachment,
    evidenceAttachmentSchema,
} from './evidence/evidence-attachment.js'
export {
    type EvidenceGroup,
    evidenceGroupSchema,
} from './evidence/evidence-group.js'
export {
    type EvidenceItem,
    evidenceItemSchema,
} from './evidence/evidence-item.js'
export {
    type EvidenceOwner,
    evidenceOwnerSchema,
} from './evidence/evidence-owner.js'

/** ID types and schemas */
export {
    type AttachmentId,
    attachmentIdSchema,
    type EvidenceGroupId,
    evidenceGroupIdSchema,
    type EvidenceItemId,
    evidenceItemIdSchema,
    type RecordId,
    recordIdSchema,
    type SchemaId,
    schemaIdSchema,
} from './evidence/ids.js'

export * as JsonStringified from './json/json-stringified.js'

/** JSON types and schemas */
export {
    type JsonSchemaType,
    type JsonValue,
    jsonValueSchema,
} from './json/json-value.js'

/** Patches */
export type { AppliedPatch, PatchSource } from './patch/applied-patch.js'

export {
    applyAppliedPatch,
    invertAppliedPatch,
    makeAppliedPatch,
} from './patch/applied-patch.js'

export type { JsonPatchOp } from './patch/rfc6902.js'
export { applyRfc6902Patch } from './patch/rfc6902.js'

/** JSON Pointer utilities */
export type { Pointer } from './pointer/pointer.js'
export { getPointer, setPointer } from './pointer/pointer.js'

/** Proposals (types + schemas) */
export {
    type FieldProposal,
    fieldProposalSchema,
} from './proposal/field-proposal.js'

/** Record snapshot (types + schemas) */
export {
    type RecordDoc,
    recordDocSchema,
    type RecordSnapshot,
    recordSnapshotSchema,
} from './record/record-snapshot.js'

/** Shared schemas */
export { type IsoDateTimeString, isoDateTimeStringSchema } from './shared.js'
