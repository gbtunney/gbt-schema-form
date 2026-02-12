export { isEffectivelySame, jsonEquals } from './compare/equality.js'

export { normalizePointerValue } from './compare/normalize.js'
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
export type { JsonValue } from './json/json-value.js'

export type { AppliedPatch, PatchSource } from './patch/applied-patch.js'
export { applyAppliedPatch, invertAppliedPatch, makeAppliedPatch } from './patch/applied-patch.js'

export type { JsonPatchOp } from './patch/rfc6902.js'
export { applyRfc6902Patch } from './patch/rfc6902.js'

export type { Pointer } from './pointer/pointer.js'
export { getPointer, setPointer } from './pointer/pointer.js'
