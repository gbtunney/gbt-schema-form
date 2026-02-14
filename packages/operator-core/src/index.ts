/**
 * @operator/core
 *
 * Pure core exports.
 *
 * Constraints:
 * - No classes
 * - No interface
 * - No any (use unknown only at true boundaries)
 * - ESM TypeScript
 * - Local relative imports include ".js"
 */

/** Equality and normalization */
export { isEffectivelySame, jsonEquals } from './compare/equality.js'
export { normalizePointerValue } from './compare/normalize.js'

export type { EvidenceAttachment } from './evidence/evidence-attachment.js'

export type { EvidenceGroup } from './evidence/evidence-group.js'
export type { EvidenceItem } from './evidence/evidence-item.js'
export type { EvidenceOwner } from './evidence/evidence-owner.js'
/** Evidence domain models */
export type { AttachmentId, EvidenceGroupId, EvidenceItemId, RecordId, SchemaId } from './evidence/ids.js'
export * as JsonStringified from './json/json-stringified.js'
/** JSON types */
export type { JsonSchemaType, JsonValue } from './json/json-value.js'
export type { jsonValueSchema } from './json/json-value.js'

/** Patches */
export type { AppliedPatch, PatchSource } from './patch/applied-patch.js'

export { applyAppliedPatch, invertAppliedPatch, makeAppliedPatch } from './patch/applied-patch.js'

export type { JsonPatchOp } from './patch/rfc6902.js'
export { applyRfc6902Patch } from './patch/rfc6902.js'

/** JSON Pointer utilities */
export type { Pointer } from './pointer/pointer.js'
export { getPointer, setPointer } from './pointer/pointer.js'

/** Proposals */
export type { FieldProposal } from './proposal/field-proposal.js'
/** Record snapshot */
export type { RecordSnapshot } from './record/record-snapshot.js'
