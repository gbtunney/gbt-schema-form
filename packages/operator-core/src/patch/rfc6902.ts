import type { Operation } from 'rfc6902'
import { applyPatch } from 'rfc6902'
import type { JsonValue } from '../json/json-value.js'

export type JsonPatchOp = Operation

function cloneJson(value: JsonValue): JsonValue {
    // JSON-safe clone
    return JSON.parse(JSON.stringify(value)) as JsonValue
}

export function applyRfc6902Patch(doc: JsonValue, ops: Array<JsonPatchOp>): JsonValue {
    const cloned = cloneJson(doc)
    const res = applyPatch(cloned as unknown as object, ops)

    // rfc6902 returns { doc, ... }, but typings vary; keep wrapper strict.
    const next = (res as unknown as { doc: unknown }).doc
    return next as JsonValue
}
